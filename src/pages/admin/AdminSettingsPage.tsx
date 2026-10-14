import React, { useState } from 'react';
import {
  Settings,
  CloudUpload,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Truck,
  Database,
  ExternalLink,
} from 'lucide-react';
import { seedCatalogToFirestore } from '../../services/productService';
import { seedCategoriesToFirestore } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [storeName, setStoreName] = useState('HHD Collections');
  const [whatsapp, setWhatsapp] = useState('+92 300 1234567');
  const [supportEmail, setSupportEmail] = useState('murtuza.tech.savvy@gmail.com');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [deliveryCharge, setDeliveryCharge] = useState(250);
  const [announcement, setAnnouncement] = useState(
    'Free Delivery Across Pakistan on Orders Over Rs. 3,000 | Cash on Delivery Available'
  );

  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSeedCatalog = async () => {
    if (!confirm('This will upload all 14 official products and 4 categories to your Cloud Firestore database. Continue?')) {
      return;
    }
    setSeeding(true);
    setSeedStatus(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        seedCatalogToFirestore(),
        seedCategoriesToFirestore(),
      ]);
      setSeedStatus(`Success! Seeded ${prodRes.count} products and ${catRes.count} categories into Cloud Firestore.`);
    } catch (err: any) {
      alert(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
          Store Settings & Database Tools
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Configure storefront preferences, WhatsApp integration, shipping rates, and database initialization.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      {/* CLOUD FIRESTORE SEEDING TOOL */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-brand-500/30 shadow-luxury space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-500 flex-shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal-900 dark:text-white">
                One-Click Catalog Seeder (Cloud Firestore)
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Instantly populate your Firebase Firestore with all 14 official products and 4 categories.
              </p>
            </div>
          </div>

          <button
            onClick={handleSeedCatalog}
            disabled={seeding}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60 transition-all flex-shrink-0"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{seeding ? 'Seeding Firestore...' : 'Seed Catalog to Firestore'}</span>
          </button>
        </div>

        {seedStatus && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{seedStatus}</span>
          </div>
        )}
      </div>

      {/* GENERAL CONFIGURATION FORM */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            Store Contact & Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Official WhatsApp Number (For customer orders)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SHIPPING RULES */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            Shipping & Checkout Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Standard Shipping Fee (PKR)
              </label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-charcoal-900 hover:bg-black dark:bg-brand-500 text-white font-semibold text-xs shadow-md"
          >
            Save Configuration
          </button>
        </div>
      </form>

      {/* SECURITY OVERVIEW */}
      <div className="p-6 rounded-3xl bg-charcoal-900 text-white border border-charcoal-800 space-y-4">
        <div className="flex items-center space-x-2 text-brand-400">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="font-serif text-base font-bold">Cybersecurity Architecture Summary</h4>
        </div>
        <p className="text-xs text-charcoal-300 leading-relaxed">
          Admin access is guarded by Firebase Authentication with granular Role-Based Access Control (RBAC). Firestore and Storage rules strictly verify authorization tokens before allowing any product updates or image removals.
        </p>
        <div className="text-[11px] text-charcoal-400 space-y-1">
          <p>• Authenticated Admin: <strong>{user?.email || 'Active Super Admin'}</strong></p>
          <p>• Multi-Factor Authentication (MFA) can be enabled directly in the Firebase Console.</p>
        </div>
      </div>
    </div>
  );
};
