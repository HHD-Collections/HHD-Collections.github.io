import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Grid,
  List as ListIcon,
  RotateCcw,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ProductCard } from '../../components/product/ProductCard';
import { formatPrice } from '../../utils/formatters';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>(
    'newest'
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ activeOnly: true }),
          getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync category param if changes from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter & Sort calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesTags) {
          return false;
        }
      }
      // Stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }
      // Price range
      const effectivePrice = p.salePrice ?? p.regularPrice;
      if (effectivePrice < priceRange.min || effectivePrice > priceRange.max) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.regularPrice;
      const priceB = b.salePrice ?? b.regularPrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return Number(b.createdAt) - Number(a.createdAt);
    });
  }, [products, selectedCategory, searchQuery, inStockOnly, priceRange, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange({ min: 0, max: 10000 });
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="border-b border-charcoal-200 dark:border-charcoal-800 pb-6 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          All Collections
        </h1>
        <p className="text-sm text-charcoal-500 mt-2">
          Browse our complete catalog of luxury kitchenware, organizers, personal care, and gadgets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-100 dark:border-charcoal-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 dark:text-white flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-brand-500" />
              Filter Products
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
              Category
            </h4>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                }`}
              >
                <span>All Categories</span>
                <span>({products.length})</span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.categorySlug === cat.slug).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-500 text-white font-semibold'
                        : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
            <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
              Max Price: {formatPrice(priceRange.max)}
            </h4>
            <input
              type="range"
              min="500"
              max="10000"
              step="250"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[11px] text-charcoal-400">
              <span>Rs. 500</span>
              <span>Rs. 10,000</span>
            </div>
          </div>

          {/* Stock Availability */}
          <div className="space-y-3 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
            <label className="flex items-center space-x-2.5 text-xs text-charcoal-700 dark:text-charcoal-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 rounded border-charcoal-300"
              />
              <span className="font-medium">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products Main View */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Bar: Search, Mobile Filter Toggle, and Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-charcoal-50 dark:bg-charcoal-900 border border-charcoal-100 dark:border-charcoal-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search within products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-700 dark:text-charcoal-200 flex items-center space-x-1.5"
              >
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <span>Filters</span>
              </button>

              {/* Sort By Select */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-charcoal-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-800 dark:text-charcoal-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              <span className="text-xs text-charcoal-400 font-medium">
                {filteredProducts.length} items
              </span>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-charcoal-100 dark:bg-charcoal-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-100 dark:border-charcoal-800 p-8">
              <h3 className="font-serif text-lg font-bold text-charcoal-800 dark:text-white mb-2">
                No products match your criteria
              </h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-6">
                Try adjusting your filters, clearing your search query, or widening the price range.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-out Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-charcoal-900 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100 dark:border-charcoal-800">
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-white">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                Category
              </h4>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                }`}
              >
                <span>All Categories</span>
                <span>({products.length})</span>
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.categorySlug === c.slug).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === c.slug
                        ? 'bg-brand-500 text-white font-semibold'
                        : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Price Range */}
            <div className="space-y-3 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
              <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                Max Price: {formatPrice(priceRange.max)}
              </h4>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-[11px] text-charcoal-400">
                <span>Rs. 500</span>
                <span>Rs. 10,000</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div className="space-y-3 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
              <label className="flex items-center space-x-2.5 text-xs text-charcoal-700 dark:text-charcoal-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-charcoal-300"
                />
                <span className="font-medium">In Stock Only</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-charcoal-100 dark:border-charcoal-800 flex flex-col gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow-luxury"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-charcoal-300 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-charcoal-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
