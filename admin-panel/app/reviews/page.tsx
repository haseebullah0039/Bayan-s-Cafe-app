'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { adminApi } from '../../lib/api';
import { clsx } from 'clsx';
import type { Review, ReviewStats } from '../../types';

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={clsx('w-4 h-4', i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-border')}
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-muted w-4 text-right">{stars}</span>
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-text-muted w-8 text-right">{count}</span>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

export default function ReviewsPage() {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: adminApi.getReviews,
    refetchInterval: 30_000,
  });

  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['review-stats'],
    queryFn: adminApi.getReviewStats,
    refetchInterval: 30_000,
  });

  const avg    = stats?.average ?? 0;
  const total  = stats?.total   ?? 0;
  const bdown  = stats?.breakdown ?? {};

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-white">Reviews</h1>
              <p className="text-text-secondary mt-1">Customer feedback and ratings</p>
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Live — refreshes every 30s
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Average rating */}
            <div className="card p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest font-semibold">Avg Rating</p>
                <p className="text-4xl font-bold text-white mt-1">{avg > 0 ? avg.toFixed(1) : '—'}</p>
                {avg > 0 && <StarRow rating={Math.round(avg)} />}
              </div>
            </div>

            {/* Total reviews */}
            <div className="card p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest font-semibold">Total Reviews</p>
                <p className="text-4xl font-bold text-white mt-1">{total}</p>
                <p className="text-text-muted text-xs mt-1">from customers</p>
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="card p-6">
              <p className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-4">
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />Breakdown
              </p>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((s) => (
                  <RatingBar key={s} stars={s} count={bdown[s] ?? 0} total={total} />
                ))}
              </div>
            </div>
          </div>

          {/* Review cards */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-text-muted">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted">
              <p className="text-5xl mb-4">⭐</p>
              <p className="font-semibold">No reviews yet</p>
              <p className="text-sm mt-1">Reviews from the mobile app will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="card p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                        {r.customer_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{r.customer_name}</p>
                        {r.order_number && (
                          <p className="text-text-muted text-xs font-mono">{r.order_number}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-text-muted text-xs">{timeAgo(r.created_at)}</span>
                  </div>

                  <StarRow rating={r.rating} />

                  {r.comment ? (
                    <p className="text-text-secondary text-sm leading-relaxed">"{r.comment}"</p>
                  ) : (
                    <p className="text-text-muted text-xs italic">No comment</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
