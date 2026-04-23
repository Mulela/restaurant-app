import React, { useState } from 'react';
import { ChefHat, CircleCheck, User, ShoppingBag, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '../ui/button';
import OrderStatusBadge from './OrderStatusBadge';
import { updateOrder } from '../../services/orders';

export default function AdminOrderCard({ order, onOrdersChange }) {
  const MotionDiv = motion.div;
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      await updateOrder(order.id, { statut: newStatus });
      if (typeof onOrdersChange === 'function') {
        onOrdersChange();
      }
      toast.success(`Commande #${order.id.slice(-6).toUpperCase()} mise a jour`);
    } catch (error) {
      toast.error(error.message || 'Impossible de mettre a jour la commande');
    } finally {
      setLoading(false);
    }
  };

  const createdAt = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(order.created_at));

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-inter font-black text-foreground text-base">
              #{order.id.slice(-6).toUpperCase()}
            </span>
            <OrderStatusBadge statut={order.statut} />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-inter flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {order.nom_client}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {createdAt}
            </span>
            <span
              className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs ${
                order.type_service === 'a_emporter'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {order.type_service === 'a_emporter' ? 'A emporter' : 'Sur place'}
            </span>
          </div>
        </div>
        <span className="font-inter font-black text-primary text-xl flex-shrink-0">
          {order.total?.toFixed(2)} $
        </span>
      </div>

      <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
        {order.items?.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-inter">
            <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground flex-1">
              <span className="font-bold text-primary">{item.quantite}x</span> {item.nom}
            </span>
            <span className="text-muted-foreground font-medium">
              {(item.prix * item.quantite).toFixed(2)} $
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {order.statut === 'en_attente' && (
          <Button
            onClick={() => updateStatus('en_preparation')}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-inter font-bold h-11 rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ChefHat className="w-4 h-4 mr-2" />
            )}
            En preparation
          </Button>
        )}
        {order.statut === 'en_preparation' && (
          <Button
            onClick={() => updateStatus('prete')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-inter font-bold h-11 rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CircleCheck className="w-4 h-4 mr-2" />
            )}
            Marquer prete
          </Button>
        )}
        {order.statut === 'prete' && (
          <div className="flex items-center gap-2 text-green-400 font-inter font-semibold text-sm py-2">
            <CircleCheck className="w-4 h-4" />
            Commande terminee
          </div>
        )}
      </div>
    </MotionDiv>
  );
}
