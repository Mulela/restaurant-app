import { getSupabaseClient } from '../lib/supabase';
import { toast } from 'sonner';

function normalizeError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }

  const message = error?.message || fallbackMessage;
  return new Error(message);
}

function dispatchOrdersUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('orders-updated'));
  }
}

function handleSupabaseError(error) {
  console.error(error);
  toast.error('Erreur serveur');
}

function buildEstimateMinutes(activeOrdersCount) {
  return Math.max(10, (activeOrdersCount + 1) * 10);
}

function mapItemsByOrderId(items) {
  return (items || []).reduce((accumulator, item) => {
    if (!accumulator[item.order_id]) {
      accumulator[item.order_id] = [];
    }

    accumulator[item.order_id].push(item);
    return accumulator;
  }, {});
}

function hydrateOrder(order, itemsByOrderId) {
  return {
    ...order,
    items: itemsByOrderId[order.id] || [],
  };
}

async function fetchOrderItemsByOrderIds(orderIds) {
  if (!orderIds.length) {
    return {};
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('order_items').select('*').in('order_id', orderIds);

  if (error) {
    handleSupabaseError(error);
    throw error;
  }

  return mapItemsByOrderId(data || []);
}

async function fetchActiveOrdersCount() {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('statut', ['en_attente', 'en_preparation']);

  if (error) {
    handleSupabaseError(error);
    throw error;
  }

  return count || 0;
}

export async function listOrders() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    const orders = data || [];
    const itemsByOrderId = await fetchOrderItemsByOrderIds(orders.map((order) => order.id));

    return orders.map((order) => hydrateOrder(order, itemsByOrderId));
  } catch (error) {
    throw normalizeError(error, 'Impossible de charger les commandes.');
  }
}

export async function getOrderById(orderId) {
  try {
    const supabase = getSupabaseClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      handleSupabaseError(orderError);
      throw orderError;
    }

    if (!order) {
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      handleSupabaseError(itemsError);
      throw itemsError;
    }

    return {
      ...order,
      items: items || [],
    };
  } catch (error) {
    throw normalizeError(error, 'Impossible de charger cette commande.');
  }
}

export async function createOrder(orderInput) {
  let createdOrderId = null;

  try {
    const supabase = getSupabaseClient();
    const activeOrdersCount = await fetchActiveOrdersCount();

    const orderPayload = {
      nom_client: orderInput.nom_client,
      total: orderInput.total,
      statut: 'en_attente',
      type_service: orderInput.type_service,
      temps_estime: orderInput.temps_estime || buildEstimateMinutes(activeOrdersCount),
    };

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      handleSupabaseError(orderError);
      throw orderError;
    }

    createdOrderId = createdOrder.id;

    const orderItemsPayload = (orderInput.items || []).map((item) => ({
      order_id: createdOrder.id,
      product_id: item.produit_id,
      nom: item.nom,
      prix: item.prix,
      quantite: item.quantite,
      image_url: item.image_url || '',
    }));

    if (orderItemsPayload.length > 0) {
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);

      if (itemsError) {
        handleSupabaseError(itemsError);
        throw itemsError;
      }
    }

    dispatchOrdersUpdated();

    return {
      ...createdOrder,
      items: orderItemsPayload,
    };
  } catch (error) {
    if (createdOrderId) {
      const supabase = getSupabaseClient();
      await supabase.from('orders').delete().eq('id', createdOrderId);
    }

    throw normalizeError(error, 'Impossible de creer la commande.');
  }
}

export async function updateOrder(orderId, updates) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    dispatchOrdersUpdated();
    return { id: orderId, ...updates };
  } catch (error) {
    throw normalizeError(error, 'Impossible de mettre a jour la commande.');
  }
}
