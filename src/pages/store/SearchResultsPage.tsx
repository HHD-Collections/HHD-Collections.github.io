import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { getProducts } from '../../services/productService';
import { ProductCard } from '../../components/product/ProductCard';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      try {
        const results = await getProducts({
          searchQuery: query,
          activeOnly: true,
        });
        setProducts(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
    executeSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 space-y-6 sm:space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Search className="w-4 h-4" />
          <span>Search Results</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
          Results for "{query}"
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Found {products.length} products matching your query
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 sm:h-80 bg-charcoal-100 dark:bg-charcoal-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-charcoal-50 dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto border border-charcoal-200 dark:border-charcoal-800">
          <div className="w-16 h-16 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-400 mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white">
            No matching products found
          </h2>
          <p className="text-xs text-charcoal-500 mt-2 max-w-sm mx-auto">
            Try checking your spelling, using more general keywords, or browsing our curated categories.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Link
              to="/shop"
              className="px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
