import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category, Product } from '../../types';
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts({ activeOnly: true }),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Departments</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 dark:text-white">
          Our Curated Categories
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 dark:text-charcoal-400 mt-2 sm:mt-3 leading-relaxed">
          From chef-inspired dining tools to space-saving organization and salon styling essentials, browse by department.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        {categories.map((category) => {
          const itemCount = products.filter((p) => p.categorySlug === category.slug).length;
          return (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-charcoal-900 shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
            >
              <img
                src={category.coverImage}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-75 group-hover:opacity-85"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = './assets/logo.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 sm:inset-x-8 sm:bottom-8 text-white">
                <span className="text-[10px] sm:text-xs font-bold text-brand-400 tracking-wider uppercase">
                  {itemCount} Curated Products
                </span>
                <h2 className="font-serif text-xl sm:text-3xl font-bold mt-1 group-hover:text-brand-300 transition-colors">
                  {category.name}
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-300 mt-1.5 sm:mt-2 max-w-md line-clamp-2">
                  {category.description}
                </p>
                <div className="mt-3 sm:mt-4 inline-flex items-center space-x-2 text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
