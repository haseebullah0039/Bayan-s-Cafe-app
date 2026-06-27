'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle2,
  Package, AlertCircle, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import { OrdersTable } from '../../components/orders/OrdersTable';
import { Sidebar } from '../../components/Sidebar';
import { clsx } from 'clsx';
import type { Order } from '../../types';

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, colorClass, sub, trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  sub?: string;
  trend?: string;
}) {
  return (
    <div className="card p-6 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-muted text-xs uppercase tracking-widest font-semibold">{title}</p>
          <p className="text-3xl font-bold font-poppins text-white mt-2 mb-1">{value}</p>
          {sub && <p className="text-text-muted text-xs">{sub}</p>}
        </div>
        <div className={clsx('p-3 rounded-2xl', colorClass)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 text-success text-xs font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5" />
          {trend}
        </div>
      )}
    </div>
  );
}

// ── Mini Status Bar ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  placed:    'bg-yellow-500',
  preparing: 'bg-orange-500',
  ready:     'bg-green-500',
  on_the_way:'bg-blue-500',
  delivered: 'bg-purple-500',
  received:  'bg-emerald-500',
};

const STATUS_LABELS: Record<string, string> = {
  placed: 'Placed', preparing: 'Preparing', ready: 'Ready',
  on_the_way: 'On the Way', delivered: 'Delivered', received: 'Received',
};

function StatusBreakdown({ breakdown }: { breakdown: Record<string, number> }) {
  const total = Object.values(breakdown).reduce((s, n) => s + n, 0) || 1;
  return (
    <div className="card p-6">
      <h3 className="font-bold text-white font-poppins mb-4">Order Status Breakdown</h3>
      <div className="flex rounded-full overflow-hidden h-3 mb-4 gap-0.5">
        {Object.entries(breakdown).map(([k, v]) =>
          v > 0 ? (
            <div
              key={k}
              className={clsx('h-full transition-all', STATUS_COLORS[k])}
              style={{ width: `${(v / total) * 100}%` }}
              title={`${STATUS_LABELS[k]}: ${v}`}
            />
          ) : null
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(breakdown).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <div className={clsx('w-2.5 h-2.5 rounded-full', STATUS_COLORS[k])} />
            <span className="text-text-muted text-xs">{STATUS_LABELS[k]}</span>
            <span className="ml-auto text-white text-xs font-bold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent Orders Quick View ──────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  placed:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ready:     'bg-green-500/20 text-green-400 border-green-500/30',
  on_the_way:'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  received:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const NEXT_STATUS: Record<string, string> = {
  placed: 'preparing', preparing: 'ready', ready: 'on_the_way',
  on_the_way: 'delivered', delivered: 'received',
};

const NEXT_LABEL: Record<string, string> = {
  placed: 'Prepare', preparing: 'Ready', ready: 'Deliver',
  on_the_way: 'Delivered', delivered: 'Received',
};

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30_000,
  });

  const { data: activeOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'all', ''],
    queryFn: () => adminApi.getOrders({ status: 'all' }),
    refetchInterval: 15_000,
    select: (orders: Order[]) => orders.filter((o) => !['delivered', 'received'].includes(o.status)),
  });

  const { mutate: advance, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white">Dashboard</h1>
            <p className="text-text-secondary mt-1">
              Welcome back — here's what's happening today
            </p>
          </div>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              queryClient.invalidateQueries({ queryKey: ['orders'] });
            }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Today's Orders"
            value={statsLoading ? '—' : stats?.today_orders ?? 0}
            icon={ShoppingBag}
            colorClass="bg-primary/20"
            sub="Total orders placed today"
            trend="+12% vs yesterday"
          />
          <StatCard
            title="Revenue Today"
            value={statsLoading ? '—' : `PKR ${(stats?.today_revenue ?? 0).toLocaleString()}`}
            icon={TrendingUp}
            colorClass="bg-success/20"
            sub="Delivered orders only"
            trend="+8% vs yesterday"
          />
          <StatCard
            title="Active Orders"
            value={statsLoading ? '—' : stats?.active_orders ?? 0}
            icon={Clock}
            colorClass="bg-warning/20"
            sub="Needs your attention"
          />
          <StatCard
            title="Completed Today"
            value={statsLoading ? '—' : stats?.completed_orders ?? 0}
            icon={CheckCircle2}
            colorClass="bg-success/20"
            sub="Delivered & received"
          />
        </div>

        {/* Status breakdown + quick stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-2">
            {stats?.status_breakdown && (
              <StatusBreakdown breakdown={stats.status_breakdown} />
            )}
          </div>
          <div className="card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-white font-poppins">Quick Stats</h3>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-text-muted text-xs">Total Products</p>
                <p className="text-white font-bold">{stats?.total_products ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-text-muted text-xs">Pending Actions</p>
                <p className="text-white font-bold">
                  {activeOrders.filter((o) => ['placed'].includes(o.status)).length} orders waiting
                </p>
              </div>
            </div>
            <div className="mt-auto pt-2 border-t border-border">
              <p className="text-text-muted text-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Auto-refreshes every 15s
              </p>
            </div>
          </div>
        </div>

        {/* Active orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold font-poppins text-white">Active Orders</h2>
              <p className="text-text-muted text-sm mt-0.5">Orders that need action</p>
            </div>
            <span className="badge bg-primary/20 text-primary border-primary/30">
              {activeOrders.length} active
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-semibold text-white">All caught up!</p>
              <p className="text-sm mt-1">No active orders right now</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-left text-xs uppercase tracking-wide">
                    <th className="pb-3 px-2 font-semibold">Order #</th>
                    <th className="pb-3 px-2 font-semibold">Customer</th>
                    <th className="pb-3 px-2 font-semibold">Type</th>
                    <th className="pb-3 px-2 font-semibold">Items</th>
                    <th className="pb-3 px-2 font-semibold">Total</th>
                    <th className="pb-3 px-2 font-semibold">Time</th>
                    <th className="pb-3 px-2 font-semibold">Status</th>
                    <th className="pb-3 px-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/40 hover:bg-surface/50 transition-colors"
                    >
                      <td className="py-3 px-2 font-mono font-bold text-primary text-xs">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-white">{order.customer_name}</p>
                        <p className="text-text-muted text-xs">{order.customer_phone}</p>
                      </td>
                      <td className="py-3 px-2 text-text-secondary text-xs">
                        {order.order_type === 'dine_in'
                          ? `🍽️ T-${order.table_number}`
                          : '🛵 Delivery'}
                      </td>
                      <td className="py-3 px-2 text-text-secondary">{order.items?.length ?? 0}</td>
                      <td className="py-3 px-2 font-bold text-primary text-sm">
                        PKR {order.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs">
                        {timeAgo(order.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={clsx('badge border text-xs', STATUS_BADGE[order.status])}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {NEXT_STATUS[order.status] && (
                          <button
                            disabled={isPending}
                            onClick={() => advance({ id: order.id, status: NEXT_STATUS[order.status] })}
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
    </div>
  );
}
