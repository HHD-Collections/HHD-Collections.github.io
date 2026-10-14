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
import { useSettings } from '../../context/SettingsContext';
import { INITIAL_CATEGORIES } from '../../data/initialCategories';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();

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
      {settings.announcementActive !== false && (
        <div className="bg-charcoal-900 text-ivory-100 dark:bg-black dark:text-brand-300 text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-brand-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate mx-auto sm:mx-0">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0"></span>
              <span className="font-medium tracking-wide truncate">
                {settings.announcementBarText || 'Free Delivery Across Pakistan on Orders Over Rs. 3,000 | Cash on Delivery Available'}
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
      )}

      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md shadow-luxury border-charcoal-200/50 dark:border-charcoal-800'
            : 'bg-white dark:bg-charcoal-900 border-charcoal-100 dark:border-charcoal-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 rounded-xl text-charcoal-700 dark:text-charcoal-200 hover:text-brand-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <img
                  src="./assets/logo.png"
                  alt="HHD Collections Logo"
                  className="h-9 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-white flex items-center">
                    HHD<span className="text-brand-500 font-light ml-1 sm:ml-1.5">Collections</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-charcoal-500 dark:text-charcoal-400 font-sans -mt-0.5 sm:-mt-1">
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
            <div className="flex items-center space-x-1 sm:space-x-4">
              {/* Desktop Inline Search */}
              <div className="hidden sm:block relative">
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

              {/* Mobile Search Button (Toggles full width search bar) */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="sm:hidden p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist Link (Desktop) */}
              <Link
                to="/wishlist"
                className="hidden sm:flex relative p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
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

        {/* Mobile Full-Width Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="sm:hidden border-t border-charcoal-100 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-900/95 p-3 animate-fade-in shadow-md">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search luxury products, appliances, organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-white border border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 p-1 text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer with Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-charcoal-900 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slide-right">
              <div className="space-y-6">
                {/* Header & Logo */}
                <div className="flex items-center justify-between pb-4 border-b border-charcoal-100 dark:border-charcoal-800">
                  <div className="flex items-center space-x-2">
                    <img
                      src="./assets/logo.png"
                      alt="HHD"
                      className="h-8 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
                      HHD Collections
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal-500 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Nav Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        location.pathname === link.path
                          ? 'bg-brand-500 text-white'
                          : 'text-charcoal-800 dark:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Category List */}
                <div className="space-y-2 pt-2 border-t border-charcoal-100 dark:border-charcoal-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block px-3">
                    Curated Categories
                  </span>
                  <div className="space-y-0.5">
                    {INITIAL_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-charcoal-300 hover:text-brand-500 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800/50"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-charcoal-100 dark:border-charcoal-800 space-y-3">
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center space-x-2"
                >
                  <span>Chat on WhatsApp (+92 300 1234567)</span>
                </a>

                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2 px-3 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:text-brand-500 text-xs font-semibold flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  <span>Admin Portal</span>
                </Link>

                <p className="text-[10px] text-charcoal-400 text-center">
                  Cash on Delivery & Free Delivery Over Rs. 3,000
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
