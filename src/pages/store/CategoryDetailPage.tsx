import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Category, Product } from '../../types';
import { getCategoryBySlug } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { ProductCard } from '../../components/product/ProductCard';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    async function loadCategoryData() {
      if (!slug) return;
      setLoading(true);
      try {
        const [cat, prods] = await Promise.all([
          getCategoryBySlug(slug),
          getProducts({ categorySlug: slug, activeOnly: true }),
        ]);
        setCategory(cat);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load category details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.salePrice ?? a.regularPrice;
    const priceB = b.salePrice ?? b.regularPrice;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return Number(b.createdAt) - Number(a.createdAt);
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-64 bg-charcoal-100 dark:bg-charcoal-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-charcoal-900 dark:text-white">
          Category Not Found
        </h2>
        <p className="text-sm text-charcoal-500 mt-2">
          The category you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center space-x-2 mt-6 px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-500 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-500">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link to="/categories" className="hover:text-brand-500">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-semibold text-charcoal-900 dark:text-white truncate">
          {category.name}
        </span>
      </nav>

      {/* Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-charcoal-900 text-white p-5 sm:p-12 border border-brand-500/20 shadow-xl">
        <img
          src={category.coverImage}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          onError={(e) => {
            (e.target as HTMLImageElement).src = './assets/logo.png';
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] sm:text-xs font-bold text-brand-400 uppercase tracking-widest block mb-1 sm:mb-2">
            Collection Showcase
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-base text-charcoal-300 mt-2 sm:mt-3 leading-relaxed">
            {category.description}
          </p>
          <div className="mt-3 sm:mt-4 text-xs font-medium text-brand-300">
            {products.length} Products in this department
          </div>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <span className="text-xs font-medium text-charcoal-500">
          Showing all {products.length} items
        </span>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-charcoal-400 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-800 dark:text-charcoal-200 text-xs font-medium focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-charcoal-50 dark:bg-charcoal-900 rounded-2xl">
          <p className="text-sm text-charcoal-500">
            No active products found in this category right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
