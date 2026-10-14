import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { createInquiry } from '../../services/inquiryService';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim() || 'General Inquiry',
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      console.error('Failed to submit inquiry:', err);
      setErrorMsg(err.message || 'Failed to send message. Please try WhatsApp or email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const rawNumber = settings.whatsapp || '+92 306 0824762';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const storeTitle = settings.storeName || 'HHD Collections';
    const text = encodeURIComponent(`Hello ${storeTitle}! I have a question about my order.`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 space-y-8 sm:space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          We are here to help
        </span>
        <h1 className="font-serif text-2xl sm:text-5xl font-bold text-charcoal-900 dark:text-white">
          Contact Customer Care
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500">
          Have an inquiry about an order, tracking, or bulk purchase? Reach out via WhatsApp or submit a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900 dark:text-white">
              Get in Touch
            </h3>

            <div className="space-y-4 text-xs text-charcoal-600 dark:text-charcoal-300">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-charcoal-900 dark:text-white">
                    Phone & WhatsApp
                  </strong>
                  <span>{settings.whatsapp || '+92 306 0824762'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-charcoal-900 dark:text-white">
                    Email Support
                  </strong>
                  <span className="break-all">{settings.email || 'murtuza.tech.savvy@gmail.com'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-charcoal-900 dark:text-white">
                    Working Hours
                  </strong>
                  <span>Monday - Saturday: 9:00 AM - 9:00 PM PKT</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-charcoal-900 dark:text-white">
                    Fulfillment Centers
                  </strong>
                  <span>Karachi, Lahore & Islamabad, Pakistan</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleWhatsAppDirect}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp Directly</span>
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">
                  Message Received!
                </h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                  Thank you for contacting HHD Collections. Our support representative will reply within a few hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-full bg-brand-500 text-white text-xs font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white mb-2">
                  Send Us a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Murtuza Ali"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0300 1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Order Inquiry / Product Question"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How may we assist you today?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-luxury"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
