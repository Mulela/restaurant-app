import { getSupabaseClient } from '../lib/supabase';
import { getProductImageUrl } from '../lib/productImages';
import { toast } from 'sonner';

const PRODUCT_COLUMNS = 'id, nom, prix, categorie, image_url, disponible, created_at';
const PRODUCTS_CACHE_KEY = 'restaurant_products_cache_v1';
const AVAILABLE_PRODUCTS_CACHE_KEY = 'restaurant_available_products_cache_v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readCache(key) {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCache(key, products) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(products));
  } catch {
    // Ignore cache write failures.
  }
}

function clearProductsCache() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PRODUCTS_CACHE_KEY);
  window.localStorage.removeItem(AVAILABLE_PRODUCTS_CACHE_KEY);
}

function normalizeProducts(products) {
  return (products || []).map((product) => ({
    ...product,
    image_url: getProductImageUrl(product.image_url),
  }));
}

function normalizeError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }

  const message = error?.message || fallbackMessage;
  return new Error(message);
}

function dispatchProductsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('products-updated'));
  }
}

function handleSupabaseError(error) {
  console.error(error);
  toast.error('Erreur serveur');
}

export function getCachedProducts() {
  return readCache(PRODUCTS_CACHE_KEY);
}

export function getCachedAvailableProducts() {
  return readCache(AVAILABLE_PRODUCTS_CACHE_KEY);
}

export async function listProducts() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    const products = normalizeProducts(data);
    writeCache(PRODUCTS_CACHE_KEY, products);
    writeCache(
      AVAILABLE_PRODUCTS_CACHE_KEY,
      products.filter((product) => product.disponible === true),
    );

    return products;
  } catch (error) {
    throw normalizeError(error, 'Impossible de charger les produits.');
  }
}

export async function listAvailableProducts() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    const products = normalizeProducts(data);
    writeCache(AVAILABLE_PRODUCTS_CACHE_KEY, products);

    return products;
  } catch (error) {
    throw normalizeError(error, 'Impossible de charger les produits disponibles.');
  }
}

export async function createProduct(product) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select(PRODUCT_COLUMNS)
      .single();

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    clearProductsCache();
    dispatchProductsUpdated();
    return data ? { ...data, image_url: getProductImageUrl(data.image_url) } : data;
  } catch (error) {
    throw normalizeError(error, 'Impossible de creer le produit.');
  }
}

export async function updateProduct(productId, updates) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('products').update(updates).eq('id', productId);

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    clearProductsCache();
    dispatchProductsUpdated();
    return { id: productId, ...updates };
  } catch (error) {
    throw normalizeError(error, 'Impossible de mettre a jour le produit.');
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      handleSupabaseError(error);
      throw error;
    }

    clearProductsCache();
    dispatchProductsUpdated();
  } catch (error) {
    throw normalizeError(error, 'Impossible de supprimer le produit.');
  }
}
