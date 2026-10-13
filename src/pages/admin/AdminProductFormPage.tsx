import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  UploadCloud,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductImage, Category } from '../../types';
import { getProductById, createProduct, updateProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { uploadProductImage, deleteStorageImage, validateImageFile } from '../../services/storageService';
import { generateSlug } from '../../utils/formatters';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Product slug is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  categorySlug: z.string().min(1, 'Category slug is required'),
  regularPrice: z.number().min(1, 'Regular price must be greater than 0'),
  salePrice: z.number().optional(),
  stock: z.number().min(0, 'Stock cannot be negative'),
  inStock: z.boolean(),
  featured: z.boolean(),
  active: z.boolean(),
  shortDescription: z.string().min(5, 'Short description is required'),
  description: z.string().min(10, 'Full description is required'),
  tags: z.string(), // comma separated
});

type ProductFormData = z.infer<typeof productSchema>;

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditing);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      inStock: true,
      active: true,
      featured: false,
      stock: 25,
      regularPrice: 2500,
    },
  });

  const watchName = watch('name');
  const watchCategory = watch('category');

  // Load categories and initial product if editing
  useEffect(() => {
    async function init() {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEditing && id) {
          const existing = await getProductById(id);
          if (existing) {
            setValue('name', existing.name);
            setValue('slug', existing.slug);
            setValue('sku', existing.sku);
            setValue('category', existing.category);
            setValue('categorySlug', existing.categorySlug);
            setValue('regularPrice', existing.regularPrice);
            setValue('salePrice', existing.salePrice);
            setValue('stock', existing.stock);
            setValue('inStock', existing.inStock);
            setValue('featured', existing.featured);
            setValue('active', existing.active);
            setValue('shortDescription', existing.shortDescription);
            setValue('description', existing.description);
            setValue('tags', existing.tags.join(', '));
            setImages(existing.images || []);
          }
        } else if (cats.length > 0) {
          // Set default category for new product
          setValue('category', cats[0].name);
          setValue('categorySlug', cats[0].slug);
        }
      } catch (err) {
        console.error('Failed to load initial form data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, [id, isEditing, setValue]);

  // Auto-generate slug when title changes (if new product)
  useEffect(() => {
    if (!isEditing && watchName) {
      setValue('slug', generateSlug(watchName));
    }
  }, [watchName, isEditing, setValue]);

  // Sync categorySlug when category changes
  useEffect(() => {
    const matched = categories.find((c) => c.name === watchCategory);
    if (matched) {
      setValue('categorySlug', matched.slug);
    }
  }, [watchCategory, categories, setValue]);

  // --- MULTIPLE IMAGES MANAGEMENT ---

  // Handle files selected from input or dropped
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const categorySlug = watch('categorySlug') || 'general';
    const targetProductId = id || `temp-${Date.now()}`;

    const newImagesList = [...images];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file format');
        continue;
      }

      try {
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));

        // Upload to Firebase Storage
        const uploadResult = await uploadProductImage(
          file,
          categorySlug,
          targetProductId,
          (prog) => setUploadProgress(prog)
        );

        const isFirstImage = newImagesList.length === 0;
        const newImgObj: ProductImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: uploadResult.url,
          path: uploadResult.path,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: isFirstImage,
          order: newImagesList.length + 1,
        };

        newImagesList.push(newImgObj);
      } catch (err: any) {
        console.error('Image upload failed:', err);
        setUploadError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setImages(newImagesList);
    setUploadProgress(null);
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    // reassign order numbers
    setImages(next.map((img, i) => ({ ...img, order: i + 1 })));
  };

  const handleRemoveImage = async (index: number) => {
    const toRemove = images[index];
    if (toRemove.path) {
      deleteStorageImage(toRemove.path);
    }

    const next = images.filter((_, idx) => idx !== index);
    // If we removed the primary image, mark first remaining as primary
    if (toRemove.isPrimary && next.length > 0) {
      next[0].isPrimary = true;
    }
    setImages(next.map((img, i) => ({ ...img, order: i + 1 })));
  };

  const handleAltTextChange = (index: number, text: string) => {
    setImages((prev) =>
      prev.map((img, idx) => (idx === index ? { ...img, altText: text } : img))
    );
  };

  // --- FORM SUBMIT ---
  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      setUploadError('Please upload at least one product image.');
      return;
    }

    setIsSaving(true);
    setUploadError(null);

    const primaryImg = images.find((i) => i.isPrimary) || images[0];
    const tagArray = data.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        category: data.category,
        categorySlug: data.categorySlug,
        regularPrice: data.regularPrice,
        salePrice: data.salePrice || undefined,
        stock: data.stock,
        inStock: data.inStock,
        featured: data.featured,
        active: data.active,
        shortDescription: data.shortDescription,
        description: data.description,
        tags: tagArray,
        images,
        primaryImage: primaryImg.url,
        currency: 'PKR',
      };

      if (isEditing && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      navigate('/admin/products');
    } catch (err: any) {
      console.error('Save error:', err);
      setUploadError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return <div className="p-12 text-center text-xs text-charcoal-400">Loading product editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-300 hover:text-brand-500 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <span className="text-xs text-charcoal-400 font-mono">
          {isEditing ? `Product ID: ${id}` : 'Drafting New Product'}
        </span>
      </div>

      <div className="border-b border-charcoal-200 dark:border-charcoal-800 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Configure product details, upload multiple gallery images, and set inventory rules.
        </p>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* SECTION 1: CRITICAL MULTIPLE IMAGES MANAGER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-charcoal-100 dark:border-charcoal-800 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-brand-500" />
                Product Image Gallery (Multiple Images)
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Upload multiple images. Select the primary hero image and reorder thumbnails.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500">
              {images.length} Images
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesSelected(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-charcoal-300 dark:border-charcoal-700 hover:border-brand-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-charcoal-50/50 dark:bg-charcoal-800/30"
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-charcoal-900 dark:text-white block">
              Click to select or drag & drop multiple images
            </span>
            <span className="text-xs text-charcoal-400 mt-1 block">
              Supports JPEG, PNG, WebP (up to 10MB each). Auto-compressed before upload.
            </span>

            {uploadProgress !== null && (
              <div className="mt-4 max-w-xs mx-auto space-y-1">
                <div className="flex justify-between text-[11px] text-charcoal-400">
                  <span>Uploading to Firebase Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-charcoal-200 dark:bg-charcoal-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Grid with Reorder, Primary Selector, and Alt Text */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Uploaded Gallery Images (Drag or use arrows to reorder)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all p-2 bg-charcoal-50 dark:bg-charcoal-800 ${
                      img.isPrimary
                        ? 'border-brand-500 ring-2 ring-brand-500/30'
                        : 'border-charcoal-200 dark:border-charcoal-700'
                    }`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden relative bg-white">
                      <img
                        src={img.url}
                        alt={img.altText}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Badge */}
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Main Image</span>
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image Controls below preview */}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          disabled={img.isPrimary}
                          className={`text-[11px] font-semibold ${
                            img.isPrimary
                              ? 'text-brand-500 cursor-default'
                              : 'text-charcoal-600 dark:text-charcoal-300 hover:text-brand-500'
                          }`}
                        >
                          {img.isPrimary ? '★ Primary' : 'Make Primary'}
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'left')}
                            disabled={idx === 0}
                            className="p-1 rounded text-charcoal-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] text-charcoal-400 font-mono">#{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'right')}
                            disabled={idx === images.length - 1}
                            className="p-1 rounded text-charcoal-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                            title="Move right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Image Alt text"
                        value={img.altText}
                        onChange={(e) => handleAltTextChange(idx, e.target.value)}
                        className="w-full px-2 py-1 text-[11px] rounded-lg bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-800 dark:text-charcoal-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: BASIC PRODUCT INFORMATION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Product Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Kenwood Electric Kitchen Chopper"
                {...register('name')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                URL Slug *
              </label>
              <input
                type="text"
                placeholder="kenwood-electric-kitchen-chopper"
                {...register('slug')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs font-mono text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.slug && <p className="text-[11px] text-rose-500">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                SKU (Stock Keeping Unit) *
              </label>
              <input
                type="text"
                placeholder="HHD-KD-006"
                {...register('sku')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs font-mono text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.sku && <p className="text-[11px] text-rose-500">{errors.sku.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="chopper, blender, stainless steel, kitchen"
                {...register('tags')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Short Description (Shown on cards & quick summary) *
              </label>
              <input
                type="text"
                placeholder="Brief one-sentence highlight of the product"
                {...register('shortDescription')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
              {errors.shortDescription && (
                <p className="text-[11px] text-rose-500">{errors.shortDescription.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Full Description & Specs *
              </label>
              <textarea
                rows={5}
                placeholder="Detailed description, dimensions, instructions, and features"
                {...register('description')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: PRICING & INVENTORY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            Pricing & Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Regular Price (PKR) *
              </label>
              <input
                type="number"
                {...register('regularPrice', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white font-bold"
              />
              {errors.regularPrice && (
                <p className="text-[11px] text-rose-500">{errors.regularPrice.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Sale Price (PKR, Optional)
              </label>
              <input
                type="number"
                {...register('salePrice', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Inventory Stock Count *
              </label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
              {errors.stock && (
                <p className="text-[11px] text-rose-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Visibility and Featured Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
            <label className="flex items-center space-x-3 p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/40 cursor-pointer">
              <input
                type="checkbox"
                {...register('active')}
                className="w-4 h-4 text-brand-500 rounded border-charcoal-300"
              />
              <span className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
                Active & Published
              </span>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/40 cursor-pointer">
              <input
                type="checkbox"
                {...register('featured')}
                className="w-4 h-4 text-brand-500 rounded border-charcoal-300"
              />
              <span className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
                Featured on Homepage
              </span>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/40 cursor-pointer">
              <input
                type="checkbox"
                {...register('inStock')}
                className="w-4 h-4 text-brand-500 rounded border-charcoal-300"
              />
              <span className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
                Mark In Stock
              </span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl border border-charcoal-300 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-luxury disabled:opacity-70 transition-all flex items-center space-x-2"
          >
            {isSaving ? (
              <span>Saving Product...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
