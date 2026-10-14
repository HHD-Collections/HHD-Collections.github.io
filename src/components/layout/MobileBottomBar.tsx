import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Layers, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileBottomBar: React.FC = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems } = useWishlist();

  // If on admin routes, do not display storefront mobile bottom bar
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      name: 'Shop',
      path: '/shop',
      icon: Compass,
      isActive: location.pathname === '/shop',
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: Layers,
      isActive: location.pathname.startsWith('/categor'),
    },
    {
      name: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
      badge: totalWishlistItems,
      isActive: location.pathname === '/wishlist',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-lg border-t border-charcoal-200/80 dark:border-charcoal-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-colors duration-200"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-full py-1 text-center transition-all ${
                item.isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                  : 'text-charcoal-500 dark:text-charcoal-400 hover:text-brand-500'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-medium">
                {item.name}
              </span>
              {item.isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-500 dark:bg-brand-400" />
              )}
            </Link>
          );
        })}

        {/* Cart Drawer Trigger Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center w-14 h-full py-1 text-charcoal-500 dark:text-charcoal-400 hover:text-brand-500 active:scale-95 transition-all"
          aria-label="Open Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-charcoal-900 dark:bg-brand-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-medium">
            Bag
          </span>
        </button>
      </div>
    </nav>
  );
};
