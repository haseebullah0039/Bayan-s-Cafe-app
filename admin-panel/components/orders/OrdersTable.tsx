'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { clsx } from 'clsx';
import type { Order } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  placed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  on_the_way: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  received: 'bg-green-600/20 text-green-500 border-green-600/30',
};

const STATUS_ICONS: Record<string, string> = {
  placed: '📋', preparing: '👨‍🍳', ready: '✅',
  on_the_way: '🛵', delivered: '📦', received: '🎉',
};

const NEXT_STATUS: Record<string, string> = {
  placed: 'preparing',
  preparing: 'ready',
  ready: 'on_the_way',
  on_the_way: 'delivered',
  delivered: 'received',
};

interface Props {
  orders: Order[];
}

export function OrdersTable({ orders }: Props) {
  const queryClient = useQueryClient();

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (!orders.length) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-4xl mb-3">📭</p>
        <p>No orders yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-muted text-left">
            <th className="pb-3 font-medium">Order #</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Items</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
              <td className="py-4 font-mono font-semibold text-primary">{order.order_number}</td>
              <td className="py-4">
                <p className="font-medium text-white">{order.customer_name}</p>
                <p className="text-text-muted text-xs">{order.customer_phone}</p>
              </td>
              <td className="py-4">
                <span className="text-xs">
                  {order.order_type === 'dine_in'
                    ? `🍽️ Table ${order.table_number}`
                    : `🛵 Delivery`}
                </span>
              </td>
              <td className="py-4 text-text-secondary">{order.items?.length ?? 0} items</td>
              <td className="py-4 font-semibold text-primary">
                Rs. {order.total?.toLocaleString()}
              </td>
              <td className="py-4">
                <span
                  className={clsx(
                    'badge border',
                    STATUS_STYLES[order.status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  )}
                >
                  {STATUS_ICONS[order.status]} {order.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-4">
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => updateStatus({ id: order.id, status: NEXT_STATUS[order.status] })}
                    className="text-xs btn-primary py-1.5 px-3"
                  >
                    → {NEXT_STATUS[order.status].replace('_', ' ')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
