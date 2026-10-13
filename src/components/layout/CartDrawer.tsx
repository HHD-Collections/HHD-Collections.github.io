import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

const FREE_SHIPPING_THRESHOLD = 3000;

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-charcoal-900 shadow-2xl flex flex-col border-l border-charcoal-200 dark:border-charcoal-800 animate-slide-up">
          {/* Header */}
          <div className="p-5 border-b border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-serif font-bold text-charcoal-900 dark:text-white">
                Your Shopping Bag
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                {totalItems} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-brand-50/50 dark:bg-charcoal-800/40 px-5 py-3 border-b border-brand-100/50 dark:border-charcoal-800">
            <div className="flex items-center space-x-2 text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              <Truck className="w-4 h-4 text-brand-500" />
              {freeShippingRemaining > 0 ? (
                <span>
                  Add <strong className="text-brand-600 dark:text-brand-400">{formatPrice(freeShippingRemaining)}</strong> more for FREE nationwide delivery!
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  🎉 Congratulations! You have unlocked FREE Delivery!
                </span>
              )}
            </div>
            <div className="w-full bg-charcoal-200 dark:bg-charcoal-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-charcoal-800 dark:text-charcoal-200">
                  Your cart is empty
                </h3>
                <p className="text-xs text-charcoal-500 max-w-xs mt-1 mb-6">
                  Explore our luxury collection of kitchenware, organizers, and beauty devices.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedVariant || 'default'}`}
                    className="flex space-x-3.5 p-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-800/50 border border-charcoal-100 dark:border-charcoal-800"
                  >
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-18 h-18 w-20 h-20 rounded-lg object-cover bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = './assets/logo.png';
                      }}
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-charcoal-900 dark:text-white line-clamp-2 leading-snug">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                            {formatPrice(itemPrice)}
                          </span>
                          {item.product.salePrice && (
                            <span className="text-[10px] text-charcoal-400 line-through">
                              {formatPrice(item.product.regularPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-charcoal-200 dark:border-charcoal-700 rounded-lg overflow-hidden bg-white dark:bg-charcoal-800">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-charcoal-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-charcoal-100 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-600 dark:text-charcoal-400">Subtotal</span>
                <span className="text-base font-bold text-charcoal-900 dark:text-white font-serif">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Delivery and taxes calculated at checkout. Cash on Delivery supported nationwide.
              </p>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 rounded-xl bg-charcoal-900 hover:bg-black dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-luxury hover:shadow-luxury-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
