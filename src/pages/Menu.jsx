import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '../components/Restaurant/Header';
import CategoryNav from '../components/Restaurant/CategoryNav';
import ProductCard from '../components/Restaurant/ProductCard';
import FloatingCartButton from '../components/Restaurant/FloatingCartButton';
import { Skeleton } from '../components/ui/skeleton';
import { getCachedAvailableProducts, listAvailableProducts } from '../services/products';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('plats');
  const [products, setProducts] = useState(() => getCachedAvailableProducts());
  const [isLoading, setIsLoading] = useState(() => getCachedAvailableProducts().length === 0);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = useCallback(async ({ keepVisibleData = false } = {}) => {
    if (!keepVisibleData) {
      setIsLoading(true);
    }

    try {
      setErrorMessage('');
      const data = await listAvailableProducts();
      setProducts(data);
    } catch (error) {
      if (!keepVisibleData) {
        setProducts([]);
      }
      setErrorMessage(error.message || 'Impossible de charger le menu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProducts({ keepVisibleData: getCachedAvailableProducts().length > 0 });
    }, 0);

    window.addEventListener('products-updated', fetchProducts);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('products-updated', fetchProducts);
    };
  }, [fetchProducts]);

  const filtered = useMemo(
    () => products.filter((product) => product.categorie === activeCategory),
    [activeCategory, products],
  );

  return (
    <div className="min-h-screen bg-background font-inter pb-28">
      <Header />
      <CategoryNav active={activeCategory} onSelect={setActiveCategory} />

      <div className="max-w-3xl mx-auto px-4 pt-5 pb-2">
        <div className="relative rounded-2xl overflow-hidden h-40 md:h-52">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
            alt="Restaurant"
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <h2 className="font-inter font-black text-2xl md:text-3xl text-white leading-tight">
              Bienvenue chez
              <br />
              <span className="text-primary">110 Street</span>
            </h2>
            <p className="font-inter text-white/70 text-sm mt-2">
              Saveurs internationales • Kinshasa
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-inter font-bold text-foreground text-lg capitalize">
            {activeCategory}
          </h3>
          <span className="font-inter text-xs text-muted-foreground">
            {filtered.length} articles
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-card rounded-2xl overflow-hidden border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-inter text-muted-foreground text-sm">
              {errorMessage || 'Aucun produit dans cette categorie'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <FloatingCartButton />
    </div>
  );
}
