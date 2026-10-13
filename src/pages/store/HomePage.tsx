import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Flame,
  Award,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ProductCard } from '../../components/product/ProductCard';
import { formatPrice } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allProds, allCats] = await Promise.all([
          getProducts({ activeOnly: true }),
          getCategories(),
        ]);

        setFeaturedProducts(allProds.filter((p) => p.featured).slice(0, 8));
        setNewArrivals(allProds.slice(0, 6));
        setCategories(allCats);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-charcoal-900 via-charcoal-900 to-charcoal-950 text-white py-20 sm:py-28 lg:py-36 border-b border-brand-500/20">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Modern Living & Luxury Essentials</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Curated Luxury for the <span className="text-brand-400 italic">Discerning Home</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-300 max-w-2xl leading-relaxed">
                Discover exceptional kitchen dining solutions, intelligent home organizers, and salon-grade personal care devices. Experience refined elegance with Cash on Delivery across Pakistan.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-luxury hover:shadow-luxury-lg transition-all transform hover:-translate-y-0.5"
                >
                  <span>Explore All Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/categories"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-800 text-charcoal-200 hover:text-white border border-charcoal-700 font-semibold text-sm flex items-center justify-center transition-all"
                >
                  <span>Browse Categories</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-charcoal-800/80 text-left">
                <div>
                  <span className="block text-2xl font-bold text-brand-400 font-serif">100%</span>
                  <span className="text-xs text-charcoal-400">Authentic Quality</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-brand-400 font-serif">COD</span>
                  <span className="text-xs text-charcoal-400">Nationwide Delivery</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-brand-400 font-serif">7 Days</span>
                  <span className="text-xs text-charcoal-400">Checking Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden bg-gradient-to-tr from-brand-500/20 to-transparent p-1 shadow-2xl">
                <div className="relative rounded-3xl overflow-hidden bg-charcoal-800 aspect-[4/5] border border-brand-500/30">
                  <img
                    src="./products/prod-006/image-1.jpeg"
                    alt="Kenwood Kitchen Chopper Luxury Showcase"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './assets/logo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-charcoal-900/90 backdrop-blur-md border border-brand-500/30 text-white">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">
                      Trending Best Seller
                    </span>
                    <h3 className="text-sm font-semibold mt-0.5 line-clamp-1">
                      Kenwood 6-Blade Stainless Chopper
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-white">Rs. 5,200</span>
                      <Link
                        to="/product/kenwood-electric-kitchen-chopper-6-blade-blender-3-speed"
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                      >
                        <span>View Deal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Propositions Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-charcoal-50 dark:bg-charcoal-900/50 border border-charcoal-100 dark:border-charcoal-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">Cash on Delivery</h4>
              <p className="text-xs text-charcoal-500">Pay safely at your door anywhere in Pakistan</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">Checking Warranty</h4>
              <p className="text-xs text-charcoal-500">7-day replacement for complete peace of mind</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">Premium Quality</h4>
              <p className="text-xs text-charcoal-500">Hand-tested products guaranteed as described</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">Fast WhatsApp Care</h4>
              <p className="text-xs text-charcoal-500">Instant dedicated assistance 7 days a week</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
              Curated Departments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              Explore Collections
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal-900 shadow-md hover:shadow-luxury-lg transition-all duration-300"
            >
              <img
                src={cat.coverImage}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = './assets/logo.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block mb-1">
                  Collection
                </span>
                <h3 className="font-serif text-lg font-bold group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-charcoal-300 line-clamp-2 mt-1">
                  {cat.description}
                </p>
                <div className="flex items-center space-x-1 text-xs font-semibold text-brand-400 mt-3">
                  <span>Explore Items</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Top Selections</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              Featured Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>See Everything</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-charcoal-100 dark:bg-charcoal-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Special Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-charcoal-900 text-white p-8 sm:p-12 lg:p-16 border border-brand-500/30 shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-brand-500 text-white text-xs font-bold tracking-wide uppercase inline-block">
              Limited Period Offer
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Upgrade Your Home & Lifestyle With Up To 30% Off
            </h2>
            <p className="text-sm sm:text-base text-charcoal-300 leading-relaxed">
              Order today and enjoy prompt doorstep delivery, cash on delivery, and our 7-day product checking guarantee.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all shadow-luxury"
              >
                Claim Deals Now
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl bg-charcoal-800 text-charcoal-200 hover:text-white font-semibold text-sm border border-charcoal-700 transition-all"
              >
                Inquire on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
              Fresh Inventory
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>Shop New Stock</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {newArrivals.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Customer Reviews / Social Proof */}
      <section className="bg-charcoal-50 dark:bg-charcoal-900/40 py-16 border-y border-charcoal-100 dark:border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
              Customer Satisfaction
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              Loved By Shoppers Across Pakistan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 shadow-sm space-y-3">
              <div className="flex text-amber-500 space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 dark:text-charcoal-200 italic leading-relaxed">
                "Ordered the Kenwood 6-blade chopper and it arrived within 2 days in Lahore. Pure copper motor, exceptional speed, and authentic product. Will definitely order again!"
              </p>
              <div className="pt-2 border-t border-charcoal-100 dark:border-charcoal-700 text-xs">
                <span className="font-bold text-charcoal-900 dark:text-white block">Dr. Bilal M.</span>
                <span className="text-charcoal-400">Lahore, Pakistan</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 shadow-sm space-y-3">
              <div className="flex text-amber-500 space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 dark:text-charcoal-200 italic leading-relaxed">
                "The travel jewelry box is so sleek and premium. The leather quality is top tier. Paid through Cash on Delivery without any hassle."
              </p>
              <div className="pt-2 border-t border-charcoal-100 dark:border-charcoal-700 text-xs">
                <span className="font-bold text-charcoal-900 dark:text-white block">Ayesha K.</span>
                <span className="text-charcoal-400">Karachi, Pakistan</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 shadow-sm space-y-3">
              <div className="flex text-amber-500 space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 dark:text-charcoal-200 italic leading-relaxed">
                "Extremely satisfied with the instant water heater. Heats water in 3 seconds as promised and easy to install. Highly recommend HHD Collections."
              </p>
              <div className="pt-2 border-t border-charcoal-100 dark:border-charcoal-700 text-xs">
                <span className="font-bold text-charcoal-900 dark:text-white block">Usman Tariq</span>
                <span className="text-charcoal-400">Islamabad, Pakistan</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
