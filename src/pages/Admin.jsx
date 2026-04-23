import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import StatCard from '../components/Admin/StatCard';
import DateFilter from '../components/Admin/DateFilter';
import OrderGroup from '../components/Admin/OrderGroup';
import { listOrders } from '../services/orders';

import {
  LayoutDashboard,
  RefreshCw,
  Clock,
  ChefHat,
  CircleCheck,
  ShoppingCart,
  TrendingUp,
  CheckCheck,
  Loader,
  Package,
} from 'lucide-react';

function isSameDayUTC(dateA, dateB) {
  return (
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate()
  );
}

export default function Admin() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  });
  const [orders, setOrders] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetching, setIsFetching] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const loadOrders = React.useCallback(async () => {
    try {
      setErrorMessage('');
      const data = await listOrders();
      setOrders(data);
    } catch (error) {
      setOrders([]);
      setErrorMessage(error.message || 'Impossible de charger les commandes.');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadOrders();
    }, 0);
    const intervalId = window.setInterval(loadOrders, 10000);
    window.addEventListener('orders-updated', loadOrders);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener('orders-updated', loadOrders);
    };
  }, [loadOrders]);

  const dayOrders = useMemo(() => {
    return orders.filter((order) => {
      const date = new Date(order.created_at);
      return isSameDayUTC(date, selectedDate);
    });
  }, [orders, selectedDate]);

  const sortedDay = useMemo(
    () => [...dayOrders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [dayOrders],
  );

  const attente = sortedDay.filter((order) => order.statut === 'en_attente');
  const preparation = sortedDay.filter((order) => order.statut === 'en_preparation');
  const pretes = sortedDay.filter((order) => order.statut === 'prete');
  const enCours = attente.length + preparation.length;
  const ca = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  const months = [
    'janvier',
    'fevrier',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'aout',
    'septembre',
    'octobre',
    'novembre',
    'decembre',
  ];
  const now = new Date();
  const todayUTC = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  const selUTC = `${selectedDate.getUTCFullYear()}-${selectedDate.getUTCMonth()}-${selectedDate.getUTCDate()}`;
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayUTC = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;
  const dateLabel =
    selUTC === todayUTC
      ? "Aujourd'hui"
      : selUTC === yesterdayUTC
        ? 'Hier'
        : `${selectedDate.getUTCDate()} ${months[selectedDate.getUTCMonth()]} ${selectedDate.getUTCFullYear()}`;

  return (
    <div className="min-h-screen bg-background font-inter">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-inter font-bold text-foreground text-base leading-tight truncate">
                Tableau de bord
              </h1>
              <p className="font-inter text-xs text-muted-foreground capitalize truncate">
                {dateLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {enCours > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1 hidden sm:flex">
                <span className="font-inter text-primary text-xs font-bold">{enCours} en cours</span>
              </div>
            )}
            <Link
              to="/admin/produits"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground font-inter font-semibold text-xs hover:bg-secondary/70 transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Produits</span>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsFetching(true);
                loadOrders();
              }}
              disabled={isFetching}
              className="border-border w-9 h-9"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        <DateFilter selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Commandes du jour"
              value={dayOrders.length}
              icon={ShoppingCart}
              colorClass="bg-primary/10 text-primary"
              delay={0}
            />
            <StatCard
              label="Chiffre d'affaires"
              value={`${ca.toFixed(2)} $`}
              icon={TrendingUp}
              colorClass="bg-green-500/10 text-green-400"
              delay={0.05}
            />
            <StatCard
              label="En cours"
              value={enCours}
              icon={Loader}
              colorClass="bg-blue-500/10 text-blue-400"
              delay={0.1}
            />
            <StatCard
              label="Terminees"
              value={pretes.length}
              icon={CheckCheck}
              colorClass="bg-emerald-500/10 text-emerald-400"
              delay={0.15}
            />
          </div>
        )}

        <div className="border-t border-border pt-2">
          <h2 className="font-inter font-bold text-foreground text-base mb-4">
            Commandes - {dateLabel}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : dayOrders.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-inter text-muted-foreground text-sm">
                {errorMessage || 'Aucune commande ce jour'}
              </p>
            </div>
          ) : (
            <>
              <OrderGroup
                title="En attente"
                orders={attente}
                icon={Clock}
                colorClass="bg-yellow-500/5 border-yellow-500/20 text-yellow-400"
                emptyMsg="Aucune commande en attente"
                onOrdersChange={loadOrders}
              />
              <OrderGroup
                title="En preparation"
                orders={preparation}
                icon={ChefHat}
                colorClass="bg-blue-500/5 border-blue-500/20 text-blue-400"
                emptyMsg="Aucune commande en preparation"
                onOrdersChange={loadOrders}
              />
              <OrderGroup
                title="Pretes"
                orders={pretes}
                icon={CircleCheck}
                colorClass="bg-green-500/5 border-green-500/20 text-green-400"
                emptyMsg="Aucune commande prete"
                onOrdersChange={loadOrders}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
