import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Heart, Truck, Sparkles, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 space-y-10 sm:space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The HHD Story</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-5xl font-bold text-charcoal-900 dark:text-white leading-tight">
          Elevating Everyday Living Across Pakistan
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
          At HHD Collections, we believe luxury is not just an aesthetic—it is a standard of convenience, durable craftsmanship, and functional beauty in your home.
        </p>
      </div>

      {/* Brand Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-3 sm:space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900 dark:text-white">
            Curated Excellence
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
            Every product in our catalog—from stainless steel food choppers to delicate travel cases—undergoes rigorous quality verification before it enters our inventory.
          </p>
        </div>

        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-3 sm:space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900 dark:text-white">
            Uncompromising Trust
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
            We operate with complete transparency. Cash on Delivery across all provinces in Pakistan combined with our 7-day checking guarantee ensures you shop risk-free.
          </p>
        </div>

        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-3 sm:space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900 dark:text-white">
            Rapid Dispatch
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
            Partnered with leading national logistics couriers to ensure swift, damage-free delivery right to your doorstep within 2 to 4 business days.
          </p>
        </div>
      </div>

      {/* Story Banner */}
      <div className="p-6 sm:p-14 rounded-2xl sm:rounded-3xl bg-charcoal-900 text-white border border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-2 sm:space-y-3 max-w-xl text-center md:text-left">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-400">
            Our Mission
          </span>
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-white">
            Make Modern, Refined Living Accessible to Everyone
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
            Join thousands of happy customers who trust HHD Collections for their homes, kitchens, and personal style.
          </p>
        </div>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all flex-shrink-0"
        >
          <span>Shop the Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
