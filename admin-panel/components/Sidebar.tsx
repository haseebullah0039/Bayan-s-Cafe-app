'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Settings,
  LogOut,
  ChefHat,
  Star,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { clsx } from 'clsx';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/orders',     label: 'Orders',      icon: ShoppingBag },
  { href: '/products',   label: 'Products',    icon: Package },
  { href: '/categories', label: 'Categories',  icon: Tag },
  { href: '/reviews',    label: 'Reviews',     icon: Star },
  { href: '/settings',   label: 'Settings',    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Show loading skeleton while session loads
  if (status === 'loading') {
    return (
      <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-surface rounded animate-pulse" />
              <div className="h-2 w-16 bg-surface rounded animate-pulse" />
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-surface animate-pulse" />
          ))}
        </nav>
      </aside>
    );
  }

  // Don't render sidebar content if not authenticated (redirect in progress)
  if (status === 'unauthenticated') return null;

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Bayan's Cafe"
            className="w-12 h-12 rounded-xl object-contain"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = 'none';
              (t.nextElementSibling as HTMLElement).style.display = 'flex';
            }}
          />
          <div className="hidden relative" id="logo-fallback">
            <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-[#FF6B00] rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-[#0D0D0D]" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="font-poppins font-bold text-white text-sm leading-tight">Bayan's Cafe</p>
            <p className="text-text-muted text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Logged-in user */}
        {session?.user && (
          <div className="mt-4 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-text-muted">Signed in as</p>
            <p className="text-sm font-semibold text-primary truncate mt-0.5">
              {session.user.name ?? session.user.email}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-secondary hover:bg-surface hover:text-white'
              )}
            >
              <Icon className={clsx('w-5 h-5', active && 'text-primary')} />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
          <p className="text-text-muted text-xs font-medium">Digital Hujra</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
        </div>
      </div>
    </aside>
  );
}
