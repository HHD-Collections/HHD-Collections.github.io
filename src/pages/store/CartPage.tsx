import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { settings } = useSettings();

  const freeShippingThreshold = settings.freeShippingThreshold ?? 3000;
  const standardShippingFee = settings.standardShippingFee ?? 250;

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'HHDVIP' || code === 'WELCOME10') {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid coupon code. Try "HHDVIP" for 10% off.');
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-400 mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-white">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 max-w-sm mx-auto">
          Explore our range of premium products and add your favorites to get started.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 mt-6 px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-all shadow-luxury"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 space-y-6 sm:space-y-10">
      <div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          Shopping Cart
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Review your items and proceed to secure checkout with Cash on Delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-xl bg-charcoal-50 dark:bg-charcoal-900 border border-charcoal-100 dark:border-charcoal-800 hidden sm:grid grid-cols-12 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            <span className="col-span-6">Product</span>
            <span className="col-span-2 text-center">Price</span>
            <span className="col-span-2 text-center">Quantity</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {cart.map((item) => {
              const unitPrice = item.product.salePrice ?? item.product.regularPrice;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.selectedVariant || 'default'}`}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm"
                >
                  {/* Mobile App Layout (sm:hidden) */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-charcoal-50 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './assets/logo.png';
                        }}
                      />
                      <div className="flex-1 min-w-0 pr-1">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="text-xs font-semibold text-charcoal-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-[10px] text-charcoal-400 block mt-0.5">
                          {item.product.category}
                        </span>
                        <div className="text-xs font-serif font-bold text-charcoal-900 dark:text-white mt-1">
                          {formatPrice(unitPrice)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-charcoal-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-charcoal-100 dark:border-charcoal-800/80">
                      <div className="flex items-center border border-charcoal-300 dark:border-charcoal-700 rounded-lg overflow-hidden bg-charcoal-50 dark:bg-charcoal-800">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-charcoal-200 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-charcoal-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-charcoal-200 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-charcoal-400 uppercase tracking-wider block">Subtotal</span>
                        <span className="font-serif font-bold text-sm text-charcoal-900 dark:text-white">
                          {formatPrice(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Grid Layout (hidden sm:grid) */}
                  <div className="hidden sm:grid sm:grid-cols-12 items-center gap-4">
                    {/* Product Info */}
                    <div className="sm:col-span-6 flex items-center space-x-4 w-full">
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-xl object-cover bg-charcoal-50 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './assets/logo.png';
                        }}
                      />
                      <div className="space-y-1">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="text-sm font-semibold text-charcoal-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-[11px] text-charcoal-400 block">
                          Category: {item.product.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center space-x-1 pt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-2 text-center text-sm font-semibold text-charcoal-800 dark:text-charcoal-200">
                      <span>{formatPrice(unitPrice)}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="sm:col-span-2 flex justify-center">
                      <div className="flex items-center border border-charcoal-300 dark:border-charcoal-700 rounded-lg overflow-hidden bg-white dark:bg-charcoal-800">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-charcoal-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="sm:col-span-2 text-right font-serif font-bold text-base text-charcoal-900 dark:text-white">
                      <span>{formatPrice(itemTotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={clearCart}
              className="text-xs text-charcoal-500 hover:text-rose-500 transition-colors"
            >
              Clear Shopping Cart
            </button>
            <Link
              to="/shop"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-luxury space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white">
              Order Summary
            </h3>

            {/* Free shipping banner */}
            <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-900/40 text-xs text-charcoal-700 dark:text-charcoal-300 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  You qualify for Free Shipping!
                </span>
              ) : (
                <span>
                  Add {formatPrice(freeShippingThreshold - subtotal)} more to qualify for Free Delivery.
                </span>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-3 text-sm border-b border-charcoal-100 dark:border-charcoal-800 pb-4">
              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-400">
                <span>Subtotal</span>
                <span className="font-medium text-charcoal-900 dark:text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {promoApplied && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-400">
                <span>Estimated Shipping</span>
                <span className="font-medium text-charcoal-900 dark:text-white">
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline text-lg font-bold">
              <span className="text-charcoal-900 dark:text-white">Total</span>
              <span className="font-serif text-2xl text-charcoal-900 dark:text-white">
                {formatPrice(grandTotal)}
              </span>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Discount code (try HHDVIP)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-charcoal-900 text-white dark:bg-brand-500 text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[11px] text-rose-500">{promoError}</p>}
              {promoApplied && (
                <p className="text-[11px] text-emerald-600">✓ 10% VIP Discount Applied!</p>
              )}
            </form>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-luxury hover:shadow-luxury-lg"
            >
              <span>Proceed to Checkout (COD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-charcoal-400 text-center space-y-1">
              <p>Cash on Delivery available nationwide.</p>
              <p>Order safely with 7-Day inspection assurance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
