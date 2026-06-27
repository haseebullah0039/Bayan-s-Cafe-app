'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, ChevronDown, X,
  Phone, MapPin, Clock, ShoppingBag,
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { adminApi } from '../../lib/api';
import { clsx } from 'clsx';
import type { Order, OrderStatus } from '../../types';

// ── Constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES: { key: string; label: string; icon: string; color: string }[] = [
  { key: 'all',       label: 'All Orders', icon: '📋', color: '' },
  { key: 'placed',    label: 'Placed',     icon: '📩', color: 'text-yellow-400' },
  { key: 'preparing', label: 'Preparing',  icon: '👨‍🍳', color: 'text-orange-400' },
  { key: 'ready',     label: 'Ready',      icon: '✅', color: 'text-green-400' },
  { key: 'on_the_way',label: 'On the Way', icon: '🛵', color: 'text-blue-400' },
  { key: 'delivered', label: 'Delivered',  icon: '📦', color: 'text-purple-400' },
  { key: 'received',  label: 'Received',   icon: '🎉', color: 'text-emerald-400' },
];

const STATUS_BADGE: Record<string, string> = {
  placed:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ready:     'bg-green-500/20 text-green-400 border-green-500/30',
  on_the_way:'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  received:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const NEXT_STATUS: Record<string, OrderStatus> = {
  placed:    'preparing',
  preparing: 'ready',
  ready:     'on_the_way',
  on_the_way:'delivered',
  delivered: 'received',
};

const NEXT_LABEL: Record<string, string> = {
  placed:    'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Out for Delivery',
  on_the_way:'Mark Delivered',
  delivered: 'Mark Received',
};

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago`;
}

// ── Order Detail Panel ────────────────────────────────────────────────────────

function OrderDetail({ order, onClose, onAdvance }: {
  order: Order;
  onClose: () => void;
  onAdvance: (id: string, status: OrderStatus) => void;
}) {
  const next = NEXT_STATUS[order.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-card border-l border-border overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-bold text-white text-lg font-poppins">{order.order_number}</h2>
            <p className="text-text-muted text-sm mt-0.5">{timeAgo(order.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Status badge */}
        <div className="px-6 py-4 border-b border-border">
          <span className={clsx('badge border text-sm px-3 py-1', STATUS_BADGE[order.status])}>
            {ALL_STATUSES.find(s => s.key === order.status)?.icon} {' '}
            {order.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>

        {/* Customer info */}
        <div className="p-6 border-b border-border space-y-3">
          <h3 className="text-text-muted text-xs uppercase tracking-widest font-semibold">Customer</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              {order.customer_name[0]}
            </div>
            <div>
              <p className="font-semibold text-white">{order.customer_name}</p>
              <p className="text-text-muted text-sm flex items-center gap-1">
                <Phone className="w-3 h-3" /> {order.customer_phone}
              </p>
            </div>
          </div>
          {order.order_type === 'delivery' && order.delivery_address && (
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{order.delivery_address}</span>
            </div>
          )}
          {order.order_type === 'dine_in' && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>Dine In — Table {order.table_number}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="p-6 border-b border-border">
          <h3 className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-sm font-bold text-primary">
                    {item.quantity}×
                  </span>
                  <span className="text-white text-sm">{item.product_name}</span>
                </div>
                <span className="text-primary font-semibold text-sm">
                  PKR {item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span>PKR {order.subtotal.toLocaleString()}</span>
            </div>
            {order.total !== order.subtotal && (
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Delivery fee</span>
                <span>PKR {(order.total - order.subtotal).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white">
              <span>Total</span>
              <span className="text-primary">PKR {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action */}
        {next && (
          <div className="p-6 mt-auto">
            <button
              onClick={() => onAdvance(order.id, next)}
              className="btn-primary w-full text-center"
            >
              {NEXT_LABEL[order.status]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', tab, search],
    queryFn: () => adminApi.getOrders({ status: tab, search }),
    refetchInterval: 15_000,
  });

  const { mutate: advance, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (selected?.id === (updated as Order).id) setSelected(updated as Order);
    },
  });

  const handleAdvance = (id: string, status: OrderStatus) => advance({ id, status });

  // Tab counts
  const allOrders: Order[] = queryClient.getQueryData(['orders', 'all', '']) ?? [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-white">Orders</h1>
              <p className="text-text-secondary mt-1">Manage and track all customer orders</p>
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Live — refreshes every 15s
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-10 w-full"
              placeholder="Search order #, name, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-8 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all',
                tab === s.key
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'text-text-muted border-border hover:border-text-muted'
              )}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 p-8 pt-4 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-text-muted">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted">
              <p className="text-5xl mb-4">📭</p>
              <p className="font-semibold">No orders found</p>
              <p className="text-sm mt-1">
                {tab !== 'all' ? `No ${tab.replace('_',' ')} orders` : 'No orders match your search'}
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-left text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelected(order)}
                      className="border-b border-border/40 hover:bg-surface/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4 font-mono font-bold text-primary text-xs">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{order.customer_name}</p>
                        <p className="text-text-muted text-xs">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-4 text-text-secondary text-xs">
                        {order.order_type === 'dine_in'
                          ? `🍽️ Table ${order.table_number}`
                          : '🛵 Delivery'}
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {order.items?.length ?? 0}
                      </td>
                      <td className="px-4 py-4 font-bold text-primary">
                        PKR {order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-text-muted text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(order.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={clsx('badge border text-xs', STATUS_BADGE[order.status])}>
                          {ALL_STATUSES.find(s => s.key === order.status)?.icon}{' '}
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {NEXT_STATUS[order.status] && (
                          <button
                            disabled={isPending}
                            onClick={() => handleAdvance(order.id, NEXT_STATUS[order.status])}
                            className="text-xs btn-primary py-1.5 px-3 whitespace-nowrap"
                          >
                            {NEXT_LABEL[order.status]}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
        />
      )}
    </div>
  );
}
