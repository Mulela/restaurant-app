import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { getCart, updateQuantity, clearCart, setLastOrderId } from '../lib/cartStore';
import { createOrder } from '../services/orders';
import Header from '../components/Restaurant/Header';
import CartItem from '../components/Restaurant/CartItem';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function Panier() {
  const MotionDiv = motion.div;
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart());
  const [nomClient, setNomClient] = useState('');
  const [typeService, setTypeService] = useState('sur_place');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setCart(getCart());
    window.addEventListener('cart-updated', handleUpdate);
    return () => window.removeEventListener('cart-updated', handleUpdate);
  }, []);

  const handleUpdateQuantity = (produitId, qty) => {
    updateQuantity(produitId, qty);
    setCart(getCart());
  };

  const total = cart.reduce((sum, item) => sum + item.prix * item.quantite, 0);

  const handleOrder = async () => {
    if (!nomClient.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }

    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setLoading(true);

    try {
      const order = await createOrder({
        nom_client: nomClient.trim(),
        total,
        statut: 'en_attente',
        type_service: typeService,
        items: cart.map((item) => ({
          produit_id: item.produit_id,
          nom: item.nom,
          prix: item.prix,
          quantite: item.quantite,
          image_url: item.image_url,
        })),
      });

      setLastOrderId(order.id);
      clearCart();
      toast.success('Commande envoyee !');
      navigate(`/commande/${order.id}`);
    } catch (error) {
      toast.error(error.message || 'Impossible d envoyer la commande');
    } finally {
      setLoading(false);
    }
  };

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

        <h2 className="font-inter font-bold text-foreground text-2xl mb-6">Votre panier</h2>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-inter text-muted-foreground">Votre panier est vide</p>
            <Link
              to="/"
              className="inline-block mt-4 text-primary font-inter font-semibold text-sm hover:underline"
            >
              Parcourir le menu
            </Link>
          </div>
        ) : (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {cart.map((item) => (
              <CartItem key={item.produit_id} item={item} onUpdateQuantity={handleUpdateQuantity} />
            ))}

            <div className="bg-card rounded-2xl border border-border p-5 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-inter text-muted-foreground text-sm">Total</span>
                <span className="font-inter font-black text-foreground text-2xl">
                  {total.toFixed(2)} $
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-2 block">
                    Type de service *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTypeService('sur_place')}
                      className={`py-3 rounded-xl font-inter font-semibold text-sm transition-all border-2 ${
                        typeService === 'sur_place'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      Sur place
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeService('a_emporter')}
                      className={`py-3 rounded-xl font-inter font-semibold text-sm transition-all border-2 ${
                        typeService === 'a_emporter'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      A emporter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-1.5 block">
                    Votre nom *
                  </label>
                  <Input
                    placeholder="Entrez votre nom"
                    value={nomClient}
                    onChange={(event) => setNomClient(event.target.value)}
                    className="bg-secondary border-border font-inter"
                  />
                </div>

                <Button
                  onClick={handleOrder}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-inter font-bold text-base py-6 rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {loading ? 'Envoi en cours...' : 'Commander'}
                </Button>
              </div>
            </div>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
