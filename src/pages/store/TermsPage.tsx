import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="border-b border-charcoal-200 dark:border-charcoal-800 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs text-charcoal-500 mt-2">
          Last Updated: October 2026 | HHD Collections
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            1. Ordering & Acceptance
          </h2>
          <p>
            By placing an order on HHD Collections, you agree to receive the ordered merchandise at the indicated delivery address and pay the specified amount in Pakistani Rupees (PKR) upon delivery, unless pre-paid via bank transfer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            2. Cash on Delivery (COD) Policy
          </h2>
          <p>
            Our riders and courier representatives are instructed to collect full cash payment upon parcel handover. Customers are advised to keep the exact payable amount ready to ensure timely delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            3. 7-Day Checking Warranty & Return Policy
          </h2>
          <p>
            We offer a comprehensive 7-day checking replacement warranty. If a product arrives damaged in transit or defective, please contact our support team on WhatsApp within 7 days of delivery with an unboxing video or photos. We will arrange a replacement parcel without additional shipping fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white">
            4. Pricing & Availability
          </h2>
          <p>
            All prices are stated in PKR. In the unlikely event of an erroneous pricing or unexpected stock depletion, HHD Collections reserves the right to notify the customer and cancel or adjust the order before dispatch.
          </p>
        </section>
      </div>
    </div>
  );
};
