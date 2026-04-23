import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, User } from 'lucide-react';
import { motion } from 'framer-motion';

import Header from '../components/Restaurant/Header';
import OrderProgressBar from '../components/Restaurant/OrderProgressBar';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { getProductImageUrl } from '../lib/productImages';
import { getOrderById } from '../services/orders';

export default function OrderTracking() {
  const MotionDiv = motion.div;
  const { id } = useParams();
  const [order, setOrder] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetching, setIsFetching] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const loadOrder = React.useCallback(async () => {
    try {
      setErrorMessage('');
      const currentOrder = await getOrderById(id);
      setOrder(currentOrder);
    } catch (error) {
      setOrder(null);
      setErrorMessage(error.message || 'Impossible de charger cette commande.');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [id]);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadOrder();
    }, 0);
    const intervalId = window.setInterval(loadOrder, 15000);
    window.addEventListener('orders-updated', loadOrder);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener('orders-updated', loadOrder);
    };
  }, [loadOrder]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au menu
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : !order ? (
          <div className="text-center py-20">
            <p className="font-inter text-muted-foreground">
              {errorMessage || 'Commande introuvable'}
            </p>
          </div>
        ) : (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-inter font-bold text-foreground text-2xl">
                  Commande #{order.id.slice(-6).toUpperCase()}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{order.nom_client}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsFetching(true);
                  loadOrder();
                }}
                disabled={isFetching}
                className="border-border"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <OrderProgressBar statut={order.statut} />

              {order.statut !== 'prete' && (
                <div className="flex items-center justify-center gap-2 mt-6 py-3 bg-primary/5 rounded-xl border border-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-inter font-semibold text-primary text-sm">
                    Temps estime : {order.temps_estime || 20} minutes
                  </span>
                </div>
              )}

              {order.statut === 'prete' && (
                <div className="mt-6 py-3 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                  <span className="font-inter font-semibold text-green-400 text-sm">
                    Votre commande est prete !
                  </span>
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-inter font-bold text-foreground text-base mb-4">
                Details de la commande
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImageUrl(item.image_url)}
                        alt={item.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-inter font-medium text-foreground text-sm block truncate">
                        {item.nom}
                      </span>
                      <span className="font-inter text-muted-foreground text-xs">
                        x{item.quantite}
                      </span>
                    </div>
                    <span className="font-inter font-semibold text-foreground text-sm">
                      {(item.prix * item.quantite).toFixed(2)} $
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                <span className="font-inter font-semibold text-muted-foreground">Total</span>
                <span className="font-inter font-black text-primary text-xl">
                  {order.total?.toFixed(2)} $
                </span>
              </div>
            </div>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
