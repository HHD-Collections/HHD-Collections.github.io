import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
} from 'lucide-react';
import { Category, Product } from '../../types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { uploadCategoryCover } from '../../services/storageService';
import { generateSlug } from '../../utils/formatters';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [order, setOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('./products/prod-001/image-1.jpeg');
    setOrder(categories.length + 1);
    setActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setCoverImage(cat.coverImage);
    setOrder(cat.order);
    setActive(cat.active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(generateSlug(val));
    }
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const res = await uploadCategoryCover(file, slug || 'general');
      setCoverImage(res.url);
    } catch (err: any) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name,
          slug,
          description,
          coverImage,
          order,
          active,
        });
        setSuccessMsg(`Updated category "${name}"`);
      } else {
        await createCategory({
          name,
          slug: slug || generateSlug(name),
          description,
          coverImage: coverImage || './products/prod-001/image-1.jpeg',
          order,
          active,
        });
        setSuccessMsg(`Created category "${name}"`);
      }

      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (cat: Category) => {
    const assignedProducts = products.filter((p) => p.categorySlug === cat.slug);
    if (assignedProducts.length > 0) {
      alert(
        `Cannot delete "${cat.name}" because ${assignedProducts.length} product(s) are assigned to it. Please reassign or delete the products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      await deleteCategory(cat.id);
      loadData();
      setSuccessMsg(`Deleted category "${cat.name}"`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
            Category Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Organize catalog departments, cover banners, and display ordering
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Categories Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categorySlug === cat.slug).length;

          return (
            <div
              key={cat.id}
              className="p-4 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-charcoal-100">
                  <img
                    src={cat.coverImage}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './assets/logo.png';
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                    Order: {cat.order}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-charcoal-200 text-charcoal-600'
                      }`}
                    >
                      {cat.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <span className="text-[11px] text-charcoal-400 font-mono block mt-0.5">
                    /{cat.slug}
                  </span>
                  <p className="text-xs text-charcoal-500 line-clamp-2 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between text-xs">
                <span className="text-brand-600 dark:text-brand-400 font-bold">
                  {productCount} Products
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-charcoal-600 hover:text-brand-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-charcoal-600 hover:text-rose-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100 dark:border-charcoal-800">
              <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-charcoal-400 hover:text-charcoal-700" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kitchen & Dining"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs font-mono text-charcoal-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of products in this category"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Cover Image URL or Upload
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="./products/prod-001/image-1.jpeg"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white"
                  />
                  <label className="px-3 py-2 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-xs font-semibold cursor-pointer hover:bg-charcoal-200 flex items-center space-x-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                  <span>Show Category in Public Storefront</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-charcoal-300 dark:border-charcoal-700 text-charcoal-700 dark:text-charcoal-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
