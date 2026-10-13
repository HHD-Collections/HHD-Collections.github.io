import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="border-b border-charcoal-200 dark:border-charcoal-800 pb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legal & Trust</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-charcoal-500 mt-2">
          Effective Date: October 2026 | HHD Collections
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            1. Information We Collect
          </h2>
          <p>
            When you place an order or contact HHD Collections, we collect customer information necessary to fulfill your shipment, including your full name, delivery address, phone number, email address, and order specifics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            2. How We Use Your Data
          </h2>
          <p>
            Your information is strictly used for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Processing and dispatching your Cash on Delivery orders.</li>
            <li>Providing tracking notifications via SMS, WhatsApp, or email.</li>
            <li>Responding to customer service inquiries and replacement requests.</li>
            <li>Preventing fraudulent orders and securing our marketplace.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            3. Data Sharing & Third Parties
          </h2>
          <p>
            We never sell, rent, or trade your personal information. We only share customer shipping details with licensed delivery courier partners (such as TCS, Leopard, Trax, PostEx) strictly for logistics fulfillment purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            4. Security Standards
          </h2>
          <p>
            All data exchanges across our website are secured via industry standard SSL/TLS encryption. Cloud data is protected by Firebase enterprise-grade security rules and strict authentication controls.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            5. Contact Information
          </h2>
          <p>
            For any inquiries regarding your privacy or to request data removal, please contact our Data Officer at <strong>murtuza.tech.savvy@gmail.com</strong> or via WhatsApp at <strong>+92 300 1234567</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
