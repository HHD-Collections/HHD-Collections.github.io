import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Send,
  Heart,
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../data/initialCategories';
import { useSettings } from '../../context/SettingsContext';
import { subscribeNewsletter } from '../../services/inquiryService';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await subscribeNewsletter(newsletterEmail.trim());
      setSubscribed(true);
      setNewsletterEmail('');
    } catch (err) {
      console.warn('Failed to save subscriber to Firestore, local confirmation given:', err);
      setSubscribed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-charcoal-950 text-charcoal-300 border-t border-charcoal-800">
      {/* Trust Badges Banner */}
      <div className="border-b border-charcoal-800/80 bg-charcoal-900/60 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Nationwide Delivery</h4>
                <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">Fast shipping across Pakistan</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Cash on Delivery</h4>
                <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">Pay safely at your doorstep</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Quality Guarantee</h4>
                <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">7-day checking replacement</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">100% Genuine</h4>
                <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">Curated, verified products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="./assets/logo.png"
                alt="HHD Collections"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                HHD<span className="text-brand-400 ml-1">Collections</span>
              </span>
            </Link>
            <p className="text-sm text-charcoal-400 max-w-sm leading-relaxed">
              Curating luxury essentials, smart kitchen innovations, elegant home organizers, and premium personal care devices for modern lifestyles.
            </p>
            <div className="space-y-2 text-sm text-charcoal-300 pt-2">
              <a
                href={`https://wa.me/${(settings.whatsapp || '+92 306 0824762').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-brand-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-400" />
                <span>{settings.whatsapp || '+92 306 0824762'} (WhatsApp available)</span>
              </a>
              <a
                href={`mailto:${settings.email || 'murtuza.tech.savvy@gmail.com'}`}
                className="flex items-center space-x-3 hover:text-brand-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-400" />
                <span>{settings.email || 'murtuza.tech.savvy@gmail.com'}</span>
              </a>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Karachi, Lahore & Nationwide Pakistan</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm">
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-brand-300 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="text-brand-400 font-medium hover:underline">
                  Browse All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-brand-300 transition-colors">
                  About HHD Collections
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-300 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-300 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-brand-300 transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-4">
              Exclusive VIP Perks
            </h3>
            <p className="text-sm text-charcoal-400 mb-4">
              Be the first to receive special deals, secret discounts, and new collection launches.
            </p>
            {subscribed ? (
              <div className="p-3 bg-brand-500/20 border border-brand-500/30 rounded-lg text-brand-300 text-sm">
                Thank you for subscribing to HHD Collections!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg bg-charcoal-900 border border-charcoal-700 text-white placeholder-charcoal-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-2 top-2 p-1 text-brand-400 hover:text-brand-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-charcoal-500 block">
                  We value your privacy. No spam guaranteed.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 mt-8 sm:mt-10 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 pb-16 md:pb-0">
          <p>© 2026 HHD Collections. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-charcoal-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-charcoal-400 transition-colors">
              Terms
            </Link>
            <Link to="/admin" className="hover:text-brand-400 transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
