import React, { useState, useEffect } from 'react';
import {
  Settings,
  CloudUpload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
import { useSettings } from '../../context/SettingsContext';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [supportEmail, setSupportEmail] = useState(settings.email);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [deliveryCharge, setDeliveryCharge] = useState(settings.standardShippingFee);
  const [announcement, setAnnouncement] = useState(settings.announcementBarText);

  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Sync state whenever settings finish loading or change remotely
  useEffect(() => {
    if (!settingsLoading) {
      setStoreName(settings.storeName || 'HHD Collections');
      setWhatsapp(settings.whatsapp || '+92 306 0824762');
      setSupportEmail(settings.email || 'murtuza.tech.savvy@gmail.com');
      setFreeShippingThreshold(settings.freeShippingThreshold ?? 3000);
      setDeliveryCharge(settings.standardShippingFee ?? 250);
      setAnnouncement(
        settings.announcementBarText ||
          'Free Delivery Across Pakistan on Orders Over Rs. 3,000 | Cash on Delivery Available'
      );
    }
  }, [settings, settingsLoading]);

  const handleSeedCatalog = async () => {
    if (
      !confirm(
        'This will upload all 14 official products and 4 categories to your Cloud Firestore database. Continue?'
      )
    ) {
      return;
    }
    setSeeding(true);
    setSeedStatus(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        seedCatalogToFirestore(),
        seedCategoriesToFirestore(),
      ]);
      setSeedStatus(
        `Success! Seeded ${prodRes.count} products and ${catRes.count} categories into Cloud Firestore.`
      );
    } catch (err: any) {
      alert(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      setSaveStatus({ type: 'error', message: 'Store Name cannot be empty.' });
      return;
    }

    if (!whatsapp.trim()) {
      setSaveStatus({ type: 'error', message: 'WhatsApp number cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await updateSettings({
        storeName: storeName.trim(),
        whatsapp: whatsapp.trim(),
        phone: whatsapp.trim(),
        email: supportEmail.trim(),
        announcementBarText: announcement.trim(),
        freeShippingThreshold: Number(freeShippingThreshold) || 0,
        standardShippingFee: Number(deliveryCharge) || 0,
      });

      if (res.firestoreSynced) {
        setSaveStatus({
          type: 'success',
          message: 'Store configuration saved successfully and synced with Cloud Firestore!',
        });
      } else {
        setSaveStatus({
          type: 'warning',
          message: res.error
            ? `Store configuration saved locally! Note: Cloud Firestore sync was skipped (${res.error}).`
            : 'Store configuration saved successfully to local storage.',
        });
      }

      // Auto dismiss success toast after 6 seconds
      setTimeout(() => {
        setSaveStatus((curr) => (curr?.type === 'success' ? null : curr));
      }, 6000);
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: `Failed to save configuration: ${err?.message || 'Unexpected error'}`,
      });
    } finally {
      setIsSaving(false);
    }
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

      {saveStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between space-x-3 transition-all ${
            saveStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : saveStatus.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  saveStatus.type === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              />
            )}
            <span className="font-medium">{saveStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveStatus(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
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
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60 transition-all flex-shrink-0 cursor-pointer"
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
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
              Store Contact & Identity
            </h3>
            {settingsLoading && (
              <span className="text-xs text-charcoal-400 flex items-center space-x-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                <span>Syncing settings...</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="HHD Collections"
                required
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="+92 306 0824762"
                required
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="support@hhdcollections.com"
                required
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Free Delivery Across Pakistan on Orders Over Rs. 3,000"
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
                min="0"
                step="50"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-charcoal-400">
                Orders with cart subtotal exceeding this amount receive free standard shipping.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                Standard Shipping Fee (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-charcoal-400">
                Applied to orders below the free delivery threshold.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-charcoal-900 hover:bg-black dark:bg-brand-500 hover:dark:bg-brand-600 text-white font-semibold text-xs shadow-md disabled:opacity-60 flex items-center space-x-2 transition-all cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>{isSaving ? 'Saving Configuration...' : 'Save Configuration'}</span>
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
          Admin access is guarded by Firebase Authentication with granular Role-Based Access Control (RBAC). Firestore and Storage rules strictly verify authorization tokens before allowing any product updates, store configurations, or image removals.
        </p>
        <div className="text-[11px] text-charcoal-400 space-y-1">
          <p>• Authenticated Admin: <strong>{user?.email || 'Active Super Admin'}</strong></p>
          <p>• Multi-Factor Authentication (MFA) can be enabled directly in the Firebase Console.</p>
        </div>
      </div>
    </div>
  );
};
