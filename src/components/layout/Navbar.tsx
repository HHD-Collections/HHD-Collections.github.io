import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { INITIAL_CATEGORIES } from '../../data/initialCategories';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsCategoriesDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Categories', path: '/categories', hasDropdown: true },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-charcoal-900 text-ivory-100 dark:bg-black dark:text-brand-300 text-xs py-2 px-4 border-b border-brand-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <span className="font-medium tracking-wide">
              Free Delivery Across Pakistan on Orders Over Rs. 3,000 | Cash on Delivery Available
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-xs text-charcoal-300">
            <Link to="/contact" className="hover:text-brand-400 transition-colors">
              Help & Support
            </Link>
            <Link to="/admin" className="hover:text-brand-400 flex items-center space-x-1 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md shadow-luxury border-charcoal-200/50 dark:border-charcoal-800'
            : 'bg-white dark:bg-charcoal-900 border-charcoal-100 dark:border-charcoal-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-charcoal-700 dark:text-charcoal-200 hover:text-brand-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <img
                  src="./assets/logo.png"
                  alt="HHD Collections Logo"
                  className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to text if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight text-charcoal-900 dark:text-white flex items-center">
                    HHD<span className="text-brand-500 font-light ml-1.5">Collections</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-500 dark:text-charcoal-400 font-sans -mt-1">
                    Luxury Essentials
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                      onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                    >
                      <button
                        className={`flex items-center space-x-1 text-sm font-medium transition-colors py-2 ${
                          location.pathname.startsWith('/categor')
                            ? 'text-brand-600 dark:text-brand-400 font-semibold'
                            : 'text-charcoal-700 dark:text-charcoal-200 hover:text-brand-500'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className="w-4 h-4 text-charcoal-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {isCategoriesDropdownOpen && (
                        <div className="absolute top-full left-0 w-64 bg-white dark:bg-charcoal-800 rounded-xl shadow-luxury-lg border border-charcoal-100 dark:border-charcoal-700 py-3 animate-fade-in z-50">
                          <div className="px-4 py-2 border-b border-charcoal-100 dark:border-charcoal-700">
                            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              Curated Collections
                            </span>
                          </div>
                          {INITIAL_CATEGORIES.map((cat) => (
                            <Link
                              key={cat.id}
                              to={`/category/${cat.slug}`}
                              className="flex items-center px-4 py-2.5 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-brand-50 dark:hover:bg-charcoal-700/60 hover:text-brand-600 transition-colors"
                            >
                              <span>{cat.name}</span>
                            </Link>
                          ))}
                          <div className="pt-2 mt-1 border-t border-charcoal-100 dark:border-charcoal-700 px-4">
                            <Link
                              to="/categories"
                              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              View All Categories →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-colors py-2 ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400 font-semibold'
                        : 'text-charcoal-700 dark:text-charcoal-200 hover:text-brand-500'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search Toggle */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search luxury products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-48 sm:w-64 pl-9 pr-8 py-1.5 text-sm rounded-full bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-white border border-brand-500/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                    <Search className="w-4 h-4 text-charcoal-400 absolute left-3" />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-2.5 p-1 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors group"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-charcoal-900 dark:bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-charcoal-100 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-white border border-charcoal-200 dark:border-charcoal-700 focus:outline-none"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            </form>

            <div className="space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-800 dark:text-charcoal-200 hover:bg-brand-50 dark:hover:bg-charcoal-800"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-800 dark:text-charcoal-200 hover:bg-brand-50 dark:hover:bg-charcoal-800"
              >
                Shop All Products
              </Link>
              <div className="pl-3 py-1 space-y-1 border-l-2 border-brand-500/40 my-1">
                <span className="text-xs uppercase font-semibold text-charcoal-400 tracking-wider">
                  Categories
                </span>
                {INITIAL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="block py-1.5 text-sm text-charcoal-600 dark:text-charcoal-300 hover:text-brand-500"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-800 dark:text-charcoal-200 hover:bg-brand-50 dark:hover:bg-charcoal-800"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-800 dark:text-charcoal-200 hover:bg-brand-50 dark:hover:bg-charcoal-800"
              >
                Contact & Support
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-charcoal-800"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
