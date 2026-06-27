'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, GripVertical, Package } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { adminApi } from '../../lib/api';
import type { Category } from '../../types';

// ── Category Modal ────────────────────────────────────────────────────────────

const ICON_OPTIONS = ['🍔','🍕','🌯','🍟','🥪','🥤','⭐','🍗','🍜','🍛','🥗','🍦','🧁','☕','🧆'];

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName]         = useState(category?.name ?? '');
  const [icon, setIcon]         = useState(category?.icon ?? '🍽️');
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 99);
  const [error, setError]       = useState('');

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      category
        ? adminApi.updateCategory(category.id, { name, icon, sort_order: sortOrder })
        : adminApi.createCategory({ name, icon, sort_order: sortOrder }),
    onSuccess: () => { onSaved(); onClose(); },
    onError: () => setError('Failed to save. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Category name is required.'); return; }
    setError('');
    save();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 mx-4">
        <h2 className="text-xl font-bold text-white font-poppins mb-6">
          {category ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon picker */}
          <div>
            <label className="block text-sm text-text-muted mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`w-10 h-10 rounded-xl text-xl transition-all ${
                    icon === em
                      ? 'bg-primary/30 ring-2 ring-primary scale-110'
                      : 'bg-surface hover:bg-surface/80'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-text-muted text-sm">Or type:</span>
              <input
                className="input w-20 text-center"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-text-muted mb-1">Category Name *</label>
            <input
              className="input w-full"
              placeholder="e.g. Burgers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-sm text-text-muted mb-1">Display Order</label>
            <input
              type="number"
              className="input w-full"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={1}
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex-1 btn-primary">
              {isPending ? 'Saving…' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: adminApi.getProducts,
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleting(null);
    },
  });

  const productCount = (catId: string) =>
    products.filter((p: any) => p.category_id === catId).length;

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setModalOpen(true); };

  const handleSaved = () =>
    queryClient.invalidateQueries({ queryKey: ['categories'] });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white">Categories</h1>
            <p className="text-text-secondary mt-1">
              {categories.length} categories — organise your menu
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="card p-5 group hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  {/* Icon + order */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                    {cat.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(cat.id)}
                      className="p-1.5 hover:bg-error/20 rounded-lg transition-colors text-error"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-text-muted text-sm">
                  <Package className="w-3.5 h-3.5" />
                  <span>{productCount(cat.id)} products</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-text-muted text-xs">
                  <GripVertical className="w-3.5 h-3.5" />
                  Order: {cat.sort_order}
                </div>
              </div>
            ))}

            {/* Add card */}
            <button
              onClick={openAdd}
              className="card p-5 flex flex-col items-center justify-center gap-3 border-dashed border-2 border-border hover:border-primary/40 transition-colors text-text-muted hover:text-primary min-h-[160px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center">
                <Plus className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium">Add Category</span>
            </button>
          </div>
        )}

        {/* Delete confirm */}
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setDeleting(null)} />
            <div className="relative bg-card border border-border rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
              <h3 className="text-white font-bold text-lg mb-2">Delete Category?</h3>
              <p className="text-text-secondary text-sm mb-6">
                This will remove the category. Products in this category will remain but become uncategorised.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => deleteCategory(deleting)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-error text-white font-semibold hover:bg-error/80 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {modalOpen && (
          <CategoryModal
            category={editing}
            onClose={() => setModalOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </main>
    </div>
  );
}
