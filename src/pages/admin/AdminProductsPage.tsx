import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Product, Category } from '../../types';
import {
  getProducts,
  deleteProduct,
  deleteProducts,
  duplicateProduct,
  updateProduct,
} from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { formatPrice } from '../../utils/formatters';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { active: !product.active });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      setFeedbackMsg(`Updated status for "${product.name}"`);
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (e) {
      alert('Failed to update active state');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { featured: !product.featured });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      setFeedbackMsg(`Updated featured state for "${product.name}"`);
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (e) {
      alert('Failed to update featured state');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await duplicateProduct(id);
      setProducts((prev) => [dup, ...prev]);
      setFeedbackMsg(`Duplicated "${dup.name}"`);
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (e) {
      alert('Failed to duplicate product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setDeleteConfirmId(null);
      setFeedbackMsg('Product removed successfully');
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (e) {
      alert('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      await deleteProducts(selectedIds);
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setFeedbackMsg(`Successfully removed ${selectedIds.length} products`);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (e) {
      alert('Failed to remove selected products');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
    if (selectedStatus === 'active' && !p.active) return false;
    if (selectedStatus === 'inactive' && p.active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const productToDelete = products.find((p) => p.id === deleteConfirmId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
            Product Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage your inventory, prices, images, stock, and visibility
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-charcoal-900 dark:bg-charcoal-800 text-white border border-charcoal-700 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? 'product' : 'products'} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-charcoal-300 hover:text-white underline cursor-pointer ml-1"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-xl border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 text-xs font-semibold cursor-pointer"
            >
              {allFilteredSelected ? 'Deselect All' : `Select All (${filteredProducts.length})`}
            </button>
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title, SKU, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-800 dark:text-charcoal-200"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-800 dark:text-charcoal-200"
          >
            <option value="all">All Visibility</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <span className="text-xs font-semibold text-charcoal-400">
            {filteredProducts.length} Products
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-400">
            No products match your filters.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-charcoal-50 dark:bg-charcoal-800/60 border-b border-charcoal-200 dark:border-charcoal-800 text-charcoal-400">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all products"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-charcoal-300 dark:border-charcoal-700 text-brand-500 focus:ring-brand-500 cursor-pointer accent-brand-500"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold">Image & Product</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Price (PKR)</th>
                    <th className="py-3 px-4 font-semibold">Stock</th>
                    <th className="py-3 px-4 font-semibold text-center">Featured</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-charcoal-50/50 dark:hover:bg-charcoal-800/40 transition-colors ${
                        selectedIds.includes(product.id) ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelectOne(product.id)}
                          className="w-4 h-4 rounded border-charcoal-300 dark:border-charcoal-700 text-brand-500 focus:ring-brand-500 cursor-pointer accent-brand-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.primaryImage}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-charcoal-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = './assets/logo.png';
                            }}
                          />
                          <div className="max-w-xs sm:max-w-sm">
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="font-bold text-charcoal-900 dark:text-white hover:text-brand-500 block truncate"
                            >
                              {product.name}
                            </Link>
                            <span className="text-[10px] text-charcoal-400 font-mono">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-charcoal-600 dark:text-charcoal-300">
                        {product.category}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-charcoal-900 dark:text-white">
                          {formatPrice(product.salePrice ?? product.regularPrice)}
                        </div>
                        {product.salePrice && (
                          <div className="text-[10px] text-charcoal-400 line-through">
                            {formatPrice(product.regularPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.stock > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            product.featured
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-charcoal-300 hover:text-amber-400'
                          }`}
                          title={product.featured ? 'Featured on homepage' : 'Not featured'}
                        >
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            product.active
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-charcoal-200 dark:bg-charcoal-800 text-charcoal-500'
                          }`}
                        >
                          {product.active ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-brand-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                            title="View on storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(product.id)}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                            title="Duplicate product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-brand-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                            title="Delete product"
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

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-3.5 space-y-2.5 transition-colors ${
                    selectedIds.includes(product.id) ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        aria-label={`Select ${product.name}`}
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelectOne(product.id)}
                        className="w-4 h-4 rounded border-charcoal-300 dark:border-charcoal-700 text-brand-500 focus:ring-brand-500 cursor-pointer accent-brand-500"
                      />
                    </div>
                    <img
                      src={product.primaryImage}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-charcoal-100 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = './assets/logo.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="font-bold text-xs text-charcoal-900 dark:text-white hover:text-brand-500 block truncate"
                      >
                        {product.name}
                      </Link>
                      <span className="text-[10px] text-charcoal-400 font-mono block">
                        SKU: {product.sku} • {product.category}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-bold text-xs text-charcoal-900 dark:text-white">
                          {formatPrice(product.salePrice ?? product.regularPrice)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            product.stock > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Toggles */}
                  <div className="flex items-center justify-between pt-2 border-t border-charcoal-100 dark:border-charcoal-800/60 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          product.active
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-charcoal-200 dark:bg-charcoal-800 text-charcoal-500'
                        }`}
                      >
                        {product.active ? 'Published' : 'Draft'}
                      </button>

                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-1 rounded-lg ${
                          product.featured ? 'text-amber-500' : 'text-charcoal-300'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Link
                        to={`/product/${product.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-brand-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(product.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-brand-500"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
              Delete Product?
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{productToDelete?.name || 'this product'}"</strong>? This will remove it from the catalog and database. This action cannot be undone.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-charcoal-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
              Delete {selectedIds.length} Products?
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Are you sure you want to permanently delete these <strong>{selectedIds.length} selected products</strong>? They will be removed from the store inventory and catalog. This action cannot be undone.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-charcoal-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isDeletingBulk ? 'Deleting...' : `Yes, Delete (${selectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
