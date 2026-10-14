import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createOrder, buildWhatsAppOrderUrl } from '../../services/orderService';
import { formatPrice } from '../../utils/formatters';
import { Order, PaymentMethod } from '../../types';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^[0-9+ -]+$/, 'Phone number contains invalid characters'),
  address: z.string().min(5, 'Please provide your full street address and house/flat number'),
  city: z.string().min(2, 'Please specify your delivery city'),
  province: z.string().min(2, 'Please select your province'),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'whatsapp']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const FREE_SHIPPING_THRESHOLD = 3000;
const STANDARD_SHIPPING_FEE = 250;

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      province: 'Punjab',
      paymentMethod: 'cod',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.salePrice ?? item.product.regularPrice,
        quantity: item.quantity,
        image: item.product.primaryImage,
        selectedVariant: item.selectedVariant,
      }));

      const newOrder = await createOrder({
        customer: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          notes: data.notes,
        },
        items: orderItems,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        paymentMethod: data.paymentMethod as PaymentMethod,
      });

      setCompletedOrder(newOrder);
      clearCart();
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('There was an issue processing your order enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is completed, show Order Confirmation screen
  if (completedOrder) {
    const whatsAppUrl = buildWhatsAppOrderUrl(completedOrder);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-luxury space-y-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-scale">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
              Your order reference number is{' '}
              <strong className="text-charcoal-900 dark:text-white font-mono text-base">
                {completedOrder.orderNumber}
              </strong>
              . Our dispatch team will call or WhatsApp you shortly to verify delivery.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="p-6 rounded-2xl bg-charcoal-50 dark:bg-charcoal-800/60 border border-charcoal-100 dark:border-charcoal-800 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-charcoal-200 dark:border-charcoal-700 text-xs">
              <span className="text-charcoal-500">Recipient:</span>
              <span className="font-bold text-charcoal-900 dark:text-white">
                {completedOrder.customer.fullName} ({completedOrder.customer.phone})
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-charcoal-200 dark:border-charcoal-700 text-xs">
              <span className="text-charcoal-500">Delivery Address:</span>
              <span className="font-medium text-charcoal-900 dark:text-white text-right max-w-xs">
                {completedOrder.customer.address}, {completedOrder.customer.city},{' '}
                {completedOrder.customer.province}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-charcoal-200 dark:border-charcoal-700 text-xs">
              <span className="text-charcoal-500">Payment Option:</span>
              <span className="font-bold text-charcoal-900 dark:text-white uppercase">
                {completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : completedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Total Payable:</span>
              <span className="font-serif text-lg text-brand-600 dark:text-brand-400">
                {formatPrice(completedOrder.total)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp Now</span>
            </a>

            <button
              onClick={() => window.print()}
              className="py-3.5 px-6 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-charcoal-200 font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-charcoal-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <Link
              to="/shop"
              className="py-3.5 px-6 rounded-xl bg-charcoal-900 text-white dark:bg-brand-500 font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-black transition-colors"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-charcoal-500 mt-2">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-6 px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 space-y-6 sm:space-y-10">
      <div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Complete your delivery details for Cash on Delivery across Pakistan.
        </p>
      </div>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-charcoal-800 dark:text-charcoal-200"
        >
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-brand-500" />
            <span>{mobileSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileSummaryOpen ? 'rotate-180' : ''}`} />
          </div>
          <span className="font-bold text-sm text-brand-600 dark:text-brand-400 font-serif">
            {formatPrice(total)}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div className="pt-4 mt-3 border-t border-charcoal-100 dark:border-charcoal-800 space-y-3 animate-fade-in">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-charcoal-50"
                  />
                  <div className="max-w-[170px]">
                    <span className="font-semibold block truncate text-charcoal-900 dark:text-white">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-charcoal-400">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-charcoal-900 dark:text-white">
                  {formatPrice((item.product.salePrice ?? item.product.regularPrice) * item.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-charcoal-100 dark:border-charcoal-800 text-xs space-y-1">
              <div className="flex justify-between text-charcoal-500">
                <span>Shipping:</span>
                <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Form: Delivery Information */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-4 sm:space-y-6">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900 dark:text-white flex items-center">
              <Truck className="w-5 h-5 mr-2 text-brand-500" />
              1. Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Murtuza Ali"
                  {...register('fullName')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Full Street Address & House / Flat # *
                </label>
                <textarea
                  rows={2}
                  placeholder="House #, Street #, Sector/Area, Landmark"
                  {...register('address')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-500">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karachi, Lahore, Islamabad"
                  {...register('city')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {errors.city && (
                  <p className="text-[11px] text-rose-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Province *
                </label>
                <select
                  {...register('province')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival, leave with security"
                  {...register('notes')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-brand-500" />
              2. Payment Method
            </h3>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                  selectedPaymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-charcoal-200 dark:border-charcoal-800'
                }`}
              >
                <input
                  type="radio"
                  value="cod"
                  {...register('paymentMethod')}
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="font-bold text-xs sm:text-sm text-charcoal-900 dark:text-white block">
                    Cash on Delivery (COD) — Recommended
                  </span>
                  <span className="text-xs text-charcoal-500 leading-relaxed block mt-0.5">
                    Pay the courier safely in cash upon receiving your parcel at your doorstep.
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                  selectedPaymentMethod === 'whatsapp'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-charcoal-200 dark:border-charcoal-800'
                }`}
              >
                <input
                  type="radio"
                  value="whatsapp"
                  {...register('paymentMethod')}
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="font-bold text-xs sm:text-sm text-charcoal-900 dark:text-white block">
                    WhatsApp Direct Order / Enquiry
                  </span>
                  <span className="text-xs text-charcoal-500 leading-relaxed block mt-0.5">
                    Connect directly with our support team on WhatsApp to confirm order details and delivery slots.
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                  selectedPaymentMethod === 'bank_transfer'
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                    : 'border-charcoal-200 dark:border-charcoal-800'
                }`}
              >
                <input
                  type="radio"
                  value="bank_transfer"
                  {...register('paymentMethod')}
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="font-bold text-xs sm:text-sm text-charcoal-900 dark:text-white block">
                    Direct Bank Transfer / EasyPaisa / JazzCash
                  </span>
                  <span className="text-xs text-charcoal-500 leading-relaxed block mt-0.5">
                    Transfer directly to our corporate bank account. Details provided upon placement.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-luxury space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white">
              Order Review
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => {
                const itemPrice = item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between text-xs py-2 border-b border-charcoal-100 dark:border-charcoal-800 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-charcoal-50 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './assets/logo.png';
                        }}
                      />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-charcoal-900 dark:text-white line-clamp-1">
                          {item.product.name}
                        </span>
                        <span className="text-charcoal-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-charcoal-900 dark:text-white">
                      {formatPrice(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Financial summary */}
            <div className="space-y-2.5 text-xs border-t border-charcoal-100 dark:border-charcoal-800 pt-4">
              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-400">
                <span>Subtotal</span>
                <span className="font-bold text-charcoal-900 dark:text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-400">
                <span>Nationwide Shipping</span>
                <span className="font-bold text-charcoal-900 dark:text-white">
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm pt-2 border-t border-charcoal-100 dark:border-charcoal-800">
                <span className="font-bold text-charcoal-900 dark:text-white">Total Amount</span>
                <span className="font-serif text-xl font-bold text-brand-600 dark:text-brand-400">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-luxury hover:shadow-luxury-lg disabled:opacity-70"
            >
              {isSubmitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <span>Place Order (Cash on Delivery)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/40 text-[11px] text-charcoal-500 text-center space-y-1">
              <p>🔒 256-Bit SSL Encrypted Order Processing</p>
              <p>7-Day checking warranty included on all orders</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
