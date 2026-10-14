import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Cloud,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isFirebaseConfigured } from '../../services/firebase';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protected route check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-50 dark:bg-charcoal-950">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders & Enquiries', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-charcoal-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white dark:bg-charcoal-900 border-b border-charcoal-200 dark:border-charcoal-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
            HHD <span className="text-brand-500">Admin</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-charcoal-600 dark:text-charcoal-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/"
            target="_blank"
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold"
          >
            Storefront ↗
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal-900 text-charcoal-200 flex flex-col justify-between border-r border-charcoal-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-charcoal-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="./assets/logo.png"
                alt="HHD"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="font-serif font-bold text-lg text-white block">
                  HHD Collections
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-400 font-medium">
                  Administrator Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-charcoal-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Mode info */}
        <div className="p-4 border-t border-charcoal-800 space-y-4">
          {/* Status Indicator */}
          <div className="px-3 py-2 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-400">Database Engine:</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <Cloud className="w-3 h-3" />
                <span>Cloud Firestore</span>
              </span>
            </div>
            <div className="text-[10px] text-charcoal-400">
              Project: <span className="text-brand-300">hhd-collections</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                SA
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-white block truncate">
                  {user?.email || 'Super Administrator'}
                </span>
                <span className="text-[10px] text-brand-400">Full Access</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-400 hover:bg-charcoal-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white dark:bg-charcoal-900 border-b border-charcoal-200 dark:border-charcoal-800">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <span className="text-sm font-bold text-charcoal-900 dark:text-white">
              HHD Collections Administration Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
              title="Toggle dark/light theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/"
              target="_blank"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-charcoal-200 hover:bg-charcoal-200 flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
