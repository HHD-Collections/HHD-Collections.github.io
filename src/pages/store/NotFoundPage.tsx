import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center space-y-6">
      <div className="space-y-2">
        <span className="font-serif text-8xl sm:text-9xl font-bold text-brand-500/20 select-none block">
          404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white -mt-10">
          Page Not Found
        </h1>
        <p className="text-sm text-charcoal-500 max-w-md mx-auto">
          The luxury collection or page you were trying to visit does not exist or may have been relocated.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-charcoal-900 hover:bg-black dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>

        <Link
          to="/shop"
          className="px-6 py-3 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-charcoal-200 font-semibold text-xs flex items-center space-x-2 hover:bg-charcoal-200 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Browse All Products</span>
        </Link>
      </div>
    </div>
  );
};
