import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  ShoppingBag,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  CloudUpload,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Activity,
  Database,
  Users,
} from 'lucide-react';
import { Product, Category, Order, ContactInquiry, ActivityLog } from '../../types';
import { getProducts, seedCatalogToFirestore } from '../../services/productService';
import { getCategories, seedCategoriesToFirestore } from '../../services/categoryService';
import { getOrders } from '../../services/orderService';
import { getInquiries, getNewsletterSubscribers } from '../../services/inquiryService';
import { getActivityLogs } from '../../services/activityLogService';
import { DEFAULT_STORE_SETTINGS, saveStoreSettings } from '../../services/settingsService';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AdminOverviewPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prods, cats, ords, inqs, subs, logs] = await Promise.all([
          getProducts(),
          getCategories(),
          getOrders(),
          getInquiries(),
          getNewsletterSubscribers(),
          getActivityLogs(8),
        ]);
        setProducts(prods);
        setCategories(cats);
        setOrders(ords);
        setInquiries(inqs);
        setSubscriberCount(subs.length);
        setActivityLogs(logs);
      } catch (e) {
        console.error('Error fetching admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const outOfStockProducts = products.filter((p) => p.stock <= 0 || !p.inStock);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 20);
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const unreadInquiries = inquiries.filter((i) => i.status === 'unread').length;

  const handleSeedDatabase = async () => {
    if (
      !confirm(
        'This will synchronize all 14 initial products, 4 categories, and store settings into your Cloud Firestore database. Proceed?'
      )
    ) {
      return;
    }
    setSeeding(true);
    setSeedSuccess(null);
    try {
      await Promise.all([
        seedCatalogToFirestore(),
        seedCategoriesToFirestore(),
        saveStoreSettings(DEFAULT_STORE_SETTINGS),
      ]);
      setSeedSuccess('Successfully synchronized all catalog data & settings to Cloud Firestore!');
      const [prods, cats, logs] = await Promise.all([
        getProducts(),
        getCategories(),
        getActivityLogs(8),
      ]);
      setProducts(prods);
      setCategories(cats);
      setActivityLogs(logs);
    } catch (err: any) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time catalog metrics and store operations summary
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-brand-300 text-xs font-semibold flex items-center justify-center space-x-2 border border-brand-500/30 transition-all shadow-sm"
            title="Synchronize all products, categories, and settings to Cloud Firestore"
          >
            <CloudUpload className="w-4 h-4 text-brand-400" />
            <span>{seeding ? 'Syncing to Firestore...' : 'Sync All to Firestore'}</span>
          </button>

          <Link
            to="/admin/products/new"
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Firestore Live Connection Status Banner */}
      <div className="flex flex-wrap items-center justify-between p-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold">Cloud Firestore Live</span>
          <span className="text-charcoal-400 dark:text-charcoal-500 hidden md:inline">
            • Project: hhd-collections
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-charcoal-600 dark:text-charcoal-300">
          <span>
            <strong>{totalProducts}</strong> Products
          </span>
          <span>
            <strong>{totalCategories}</strong> Categories
          </span>
          <span>
            <strong>{totalOrders}</strong> Orders
          </span>
          <span>
            <strong>{inquiries.length}</strong> Inquiries
          </span>
          <span>
            <strong>{subscriberCount}</strong> VIP Subscribers
          </span>
        </div>
      </div>

      {seedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-charcoal-500">Total Products</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900 dark:text-white block">
            {totalProducts}
          </span>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium">
            {activeProducts} Active in store
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-charcoal-500">Categories</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900 dark:text-white block">
            {totalCategories}
          </span>
          <span className="text-[10px] sm:text-[11px] text-charcoal-400">Departments</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-charcoal-500">Orders</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900 dark:text-white block">
            {totalOrders}
          </span>
          <span className="text-[10px] sm:text-[11px] text-charcoal-400">Customer orders</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-charcoal-500">Inquiries</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900 dark:text-white block">
            {inquiries.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {unreadInquiries} unread messages
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-charcoal-500">Out of Stock</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900 dark:text-white block">
            {outOfStockProducts.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-rose-500 font-medium">
            {lowStockProducts.length} low in stock
          </span>
        </div>
      </div>

      {/* Tables Section: Recent Products & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal-900 dark:text-white">
              Recently Added Products
            </h3>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View All →
            </Link>
          </div>

          {/* Mobile Card View for Recent Products (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {products.slice(0, 5).map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/60 border border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={prod.primaryImage}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover bg-charcoal-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './assets/logo.png';
                    }}
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-charcoal-900 dark:text-white truncate block">
                      {prod.name}
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-serif font-bold text-charcoal-800 dark:text-charcoal-200">
                        {formatPrice(prod.salePrice ?? prod.regularPrice)}
                      </span>
                      <span className="text-[10px] text-charcoal-400">
                        • {prod.category}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/admin/products/edit/${prod.id}`}
                  className="px-2.5 py-1 rounded-lg bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-800 dark:text-charcoal-200 text-xs font-semibold hover:bg-brand-500 hover:text-white transition-colors flex-shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-100 dark:border-charcoal-800 text-charcoal-400">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800/60">
                {products.slice(0, 6).map((prod) => (
                  <tr key={prod.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-800/40">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.primaryImage}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-charcoal-100 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = './assets/logo.png';
                          }}
                        />
                        <div className="max-w-xs">
                          <span className="font-semibold text-charcoal-900 dark:text-white truncate block">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-charcoal-400 font-mono">
                            {prod.sku}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-charcoal-600 dark:text-charcoal-300">
                      {prod.category}
                    </td>
                    <td className="py-3 font-semibold text-charcoal-900 dark:text-white">
                      {formatPrice(prod.salePrice ?? prod.regularPrice)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.stock > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {prod.stock} in stock
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/products/edit/${prod.id}`}
                        className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watch */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
            Inventory Alerts
          </h3>
          <p className="text-xs text-charcoal-500">
            Products requiring attention or replenishment soon.
          </p>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-600">All products have healthy stock levels.</p>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/60 border border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-[180px]">
                    <span className="font-semibold text-charcoal-900 dark:text-white block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-charcoal-400">{p.sku}</span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {p.stock} units
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cloud Firestore Live Activity Stream */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-brand-500" />
            <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
              Cloud Firestore Activity Stream
            </h3>
          </div>
          <span className="text-xs text-charcoal-400 font-mono">
            Direct from collection 'activityLogs'
          </span>
        </div>

        {activityLogs.length === 0 ? (
          <p className="text-xs text-charcoal-400 py-4 text-center">
            No activity logged yet. Store events (product changes, orders, inquiries) are synced to Cloud Firestore in real time.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/50 border border-charcoal-100 dark:border-charcoal-800 text-xs flex items-start space-x-3"
              >
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500 flex-shrink-0 mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-charcoal-900 dark:text-white truncate">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-charcoal-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 line-clamp-1">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

