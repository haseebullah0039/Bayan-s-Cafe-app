'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { Product } from '../../types';

interface Props {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductModal({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    is_available: product?.is_available ?? true,
    image_url: product?.image_url ?? '',
  });
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getCategories,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      isEdit
        ? adminApi.updateProduct(product!.id, { ...form, price: Number(form.price) })
        : adminApi.createProduct({ ...form, price: Number(form.price) }),
    onSuccess: onSaved,
  });

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadImage(accepted[0]);
      setForm((f) => ({ ...f, image_url: url }));
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  });

  const update = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold font-poppins">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="hover:text-white text-text-muted transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            ) : form.image_url ? (
              <img src={form.image_url} alt="preview" className="w-32 h-32 object-cover rounded-xl mx-auto" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">Drop image here or click to upload</p>
              </>
            )}
          </div>
          {/* Direct image URL input */}
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block font-medium">
              Or paste image URL
            </label>
            <input
              className="input"
              placeholder="https://images.unsplash.com/…"
              value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)}
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block font-medium">Product Name *</label>
            <input
              className="input"
              placeholder="e.g. Classic Burger"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block font-medium">Description</label>
            <textarea
              className="input resize-none h-20"
              placeholder="Describe the product..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block font-medium">Price (PKR) *</label>
              <input
                className="input"
                type="number"
                placeholder="350"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block font-medium">Category *</label>
              <select
                className="input"
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
              >
                <option value="">Select...</option>
                {categories.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => update('is_available', e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-sm text-text-secondary font-medium">Available in menu</span>
          </label>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button
            onClick={() => save()}
            disabled={isPending || !form.name || !form.price}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
