'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, ChefHat, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (res?.ok) {
      // Session created — navigate to dashboard
      router.replace('/dashboard');
    } else {
      setLoading(false);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Animated background blobs ── */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-[#D4A017]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4A017]/5 blur-[120px] pointer-events-none" />

      {/* ── Decorative grid lines ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#D4A017 1px, transparent 1px), linear-gradient(90deg, #D4A017 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* ── Brand header ── */}
        <div className="text-center mb-8">
          {/* Logo ring */}
          <div className="inline-flex items-center justify-center relative mb-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4A017] to-[#FF6B00] blur-[16px] opacity-40" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A017] to-[#FF6B00] flex items-center justify-center shadow-2xl">
              <ChefHat className="w-10 h-10 text-[#0D0D0D]" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Bayans <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A017] to-[#FF6B00]">Cafe</span>
          </h1>
          <p className="text-[#555] text-sm mt-1 font-medium tracking-wide uppercase">Admin Dashboard</p>

          {/* Verified badge */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
            <span className="text-[#D4A017] text-xs font-semibold">Secure Login</span>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="relative">
          {/* Card glow border */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-[#D4A017]/30 via-[#D4A017]/10 to-transparent pointer-events-none" />

          <div className="relative bg-[#111]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#1E1E1E]">

            <h2 className="text-xl font-bold text-white mb-1">Welcome back 👋</h2>
            <p className="text-[#444] text-sm mb-7">Sign in to manage your restaurant</p>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                <span className="text-lg leading-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[#888] text-xs font-semibold uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-[#444] group-focus-within:text-[#D4A017] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abc@digitalhujra.com"
                    autoComplete="email"
                    required
                    className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl py-3.5 pl-11 pr-4
                               text-white placeholder-[#2A2A2A] text-sm
                               focus:outline-none focus:border-[#D4A017]/60 focus:bg-[#0D0D0D]
                               hover:border-[#2A2A2A] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[#888] text-xs font-semibold uppercase tracking-widest">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[#444] group-focus-within:text-[#D4A017] transition-colors" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl py-3.5 pl-11 pr-12
                               text-white placeholder-[#2A2A2A] text-sm
                               focus:outline-none focus:border-[#D4A017]/60 focus:bg-[#0D0D0D]
                               hover:border-[#2A2A2A] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#444] hover:text-[#D4A017] transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-[#0D0D0D]
                           overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed
                           transition-transform active:scale-[0.98]"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4A017] to-[#FF6B00] transition-opacity" />
                {/* Hover shine */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                    : '🚀 Sign In to Dashboard'
                  }
                </span>
              </button>

            </form>

            {/* Divider hint */}
            <div className="mt-6 pt-5 border-t border-[#1A1A1A] text-center">
              <p className="text-[#333] text-xs">
                Having trouble?{' '}
                <span className="text-[#D4A017]/60 cursor-default">Contact Digital Hujra support</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-2 mt-7">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A017]/30" />
          <p className="text-[#2A2A2A] text-xs font-medium tracking-widest uppercase">
            Powered by Digital Hujra
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A017]/30" />
        </div>

      </div>
    </div>
  );
}
