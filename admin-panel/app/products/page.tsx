'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import { adminApi } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { ProductModal } from '../../components/products/ProductModal';
import { clsx } from 'clsx';
import type { Product } from '../../types';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [view, setView]         = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: adminApi.getProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getCategories,
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const { mutate: toggleProduct } = useMutation({
    mutationFn: adminApi.toggleProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const filtered = products.filter((p: Product) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'all' || p.category_id === catFilter;
    return matchSearch && matchCat;
  });

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const categoryName = (id: string) =>
    categories.find((c: any) => c.id === id)?.name ?? 'Uncategorised';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white">Products</h1>
            <p className="text-text-secondary mt-1">{filtered.length} of {products.length} items</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-10 w-full"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <select
            className="input min-w-[160px]"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={clsx('p-2.5 transition-colors', view === 'grid' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={clsx('p-2.5 transition-colors', view === 'list' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-muted">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No products found</p>
          </div>
        ) : view === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product: Product) => (
              <div key={product.id} className="card overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="relative h-48">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-5xl">
                      🍽️
                    </div>
                  )}
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="badge bg-error/20 text-error border border-error/30">
                        Unavailable
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-primary/60 transition-colors"
                      title={product.is_available ? 'Mark unavailable' : 'Mark available'}
                    >
                      {product.is_available
                        ? <ToggleRight className="w-4 h-4 text-success" />
                        : <ToggleLeft className="w-4 h-4 text-error" />}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{product.name}</h3>
                      <p className="text-text-muted text-xs mt-0.5">{categoryName(product.category_id)}</p>
                    </div>
                    <span className="text-primary font-bold whitespace-nowrap">
                      PKR {product.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-2 line-clamp-2">{product.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/10 text-primary transition-colors text-xs font-semibold"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => confirm('Delete this product?') && deleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border hover:border-error/40 hover:bg-error/10 text-error transition-colors text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List View ── */
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product: Product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/40 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface flex items-center justify-center text-xl">🍽️</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-text-muted text-xs line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {categoryName(product.category_id)}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      PKR {product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleProduct(product.id)}
                        className={clsx(
                          'badge border text-xs cursor-pointer',
                          product.is_available
                            ? 'bg-success/20 text-success border-success/30'
                            : 'bg-error/20 text-error border-error/30'
                        )}
                      >
                        {product.is_available ? '● Available' : '○ Unavailable'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirm('Delete this product?') && deleteProduct(product.id)}
                          className="p-1.5 hover:bg-error/20 rounded-lg transition-colors text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <ProductModal
            product={editing}
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              setModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['products'] });
            }}
          />
        )}
      </main>
    </div>
  );
}
