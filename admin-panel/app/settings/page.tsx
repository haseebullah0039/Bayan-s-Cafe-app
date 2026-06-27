'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Store, Phone, Mail, MapPin, Clock, Truck, DollarSign,
  Save, RotateCcw, CheckCircle2, AlertCircle, Users, Database,
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { adminApi } from '../../lib/api';
import type { RestaurantSettings } from '../../types';

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-white font-poppins">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-text-muted font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-text-secondary text-sm group-hover:text-white transition-colors">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-surface border border-border'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [saved, setSaved]     = useState(false);
  const [form, setForm]       = useState<RestaurantSettings | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: adminApi.getSettings,
  });

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: RestaurantSettings) => adminApi.saveSettings(data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = <K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) save(form);
  };

  const handleReset = () => {
    if (confirm('Reset to default demo settings?')) {
      localStorage.removeItem('dh_settings');
      window.location.reload();
    }
  };

  if (isLoading || !form) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white">Settings</h1>
            <p className="text-text-secondary mt-1">Configure your restaurant preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            )}
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

          {/* Restaurant Info */}
          <Section title="Restaurant Information" icon={Store}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Restaurant Name">
                <input
                  className="input w-full"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </Field>
              <Field label="Tagline">
                <input
                  className="input w-full"
                  value={form.tagline}
                  onChange={(e) => set('tagline', e.target.value)}
                />
              </Field>
              <Field label="Phone Number">
                <div className="flex">
                  <span className="flex items-center px-3 bg-surface border border-border rounded-l-xl text-text-muted text-sm">
                    🇵🇰 +92
                  </span>
                  <input
                    className="input rounded-l-none flex-1"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  className="input w-full"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field label="Address">
                <input
                  className="input w-full"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <select
                  className="input w-full"
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                >
                  <option value="PKR">PKR — Pakistani Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Operating Hours */}
          <Section title="Operating Hours" icon={Clock}>
            <div className="space-y-4">
              <Toggle
                checked={form.is_open}
                onChange={(v) => set('is_open', v)}
                label="Restaurant is currently open"
              />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Field label="Opening Time">
                  <input
                    type="time"
                    className="input w-full"
                    value={form.open_time}
                    onChange={(e) => set('open_time', e.target.value)}
                  />
                </Field>
                <Field label="Closing Time">
                  <input
                    type="time"
                    className="input w-full"
                    value={form.close_time}
                    onChange={(e) => set('close_time', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* Order Types */}
          <Section title="Order Types" icon={Users}>
            <div className="space-y-4">
              <Toggle
                checked={form.dine_in_enabled}
                onChange={(v) => set('dine_in_enabled', v)}
                label="Accept Dine-In orders"
              />
              <Toggle
                checked={form.delivery_enabled}
                onChange={(v) => set('delivery_enabled', v)}
                label="Accept Delivery orders"
              />
            </div>
          </Section>

          {/* Delivery Settings */}
          <Section title="Delivery Settings" icon={Truck}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Delivery Fee (PKR)">
                <input
                  type="number"
                  className="input w-full"
                  value={form.delivery_fee}
                  onChange={(e) => set('delivery_fee', Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Minimum Order Amount (PKR)">
                <input
                  type="number"
                  className="input w-full"
                  value={form.min_order}
                  onChange={(e) => set('min_order', Number(e.target.value))}
                  min={0}
                />
              </Field>
              <Field label="Tax / Service Charge (%)">
                <input
                  type="number"
                  className="input w-full"
                  value={form.tax_percent}
                  onChange={(e) => set('tax_percent', Number(e.target.value))}
                  min={0}
                  max={100}
                  step={0.5}
                />
              </Field>
            </div>
          </Section>

          {/* Demo Data */}
          <Section title="Demo Data" icon={Database}>
            <div className="flex items-start gap-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-warning font-semibold text-sm">Demo Mode Active</p>
                <p className="text-text-secondary text-sm mt-1">
                  All data is stored in your browser's localStorage. No backend API is connected.
                  Resetting will restore the original sample data.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset ALL demo data? This cannot be undone.')) {
                      adminApi.resetData();
                      window.location.reload();
                    }
                  }}
                  className="mt-3 text-sm px-4 py-2 rounded-lg bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-colors font-semibold"
                >
                  Reset All Demo Data
                </button>
              </div>
            </div>
          </Section>

          {/* Save */}
          <div className="flex justify-end pb-8">
            <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2 px-8">
              <Save className="w-4 h-4" />
              {isPending ? 'Saving…' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
