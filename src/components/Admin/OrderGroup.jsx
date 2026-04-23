import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import AdminOrderCard from '../Restaurant/AdminOrderCard';

export default function OrderGroup({ title, orders, colorClass, icon, emptyMsg, onOrdersChange }) {
  const Icon = icon;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setCollapsed((current) => !current)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border mb-3 transition-all ${colorClass}`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-inter font-bold text-sm">{title}</span>
          <span className="font-inter font-semibold text-xs opacity-70 ml-1">({orders.length})</span>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="font-inter text-muted-foreground text-sm text-center py-4">{emptyMsg}</p>
          ) : (
            orders.map((order) => (
              <AdminOrderCard key={order.id} order={order} onOrdersChange={onOrdersChange} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
