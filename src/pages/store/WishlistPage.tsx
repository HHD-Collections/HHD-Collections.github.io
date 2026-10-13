import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-white">
          Your Wishlist is Empty
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 max-w-sm mx-auto">
          Save your favorite products to your wishlist so you can revisit them anytime.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 mt-6 px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-all shadow-luxury"
        >
          <span>Explore Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          {wishlist.length} luxury products saved for your consideration
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const unitPrice = product.salePrice ?? product.regularPrice;
          return (
            <div
              key={product.id}
              className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-charcoal-50">
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './assets/logo.png';
                    }}
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-charcoal-900/80 text-rose-500 hover:bg-white"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400">
                    {product.category}
                  </span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="block font-serif text-sm font-semibold text-charcoal-900 dark:text-white line-clamp-2 mt-0.5"
                  >
                    {product.name}
                  </Link>
                  <span className="text-sm font-bold text-charcoal-900 dark:text-white mt-1 block">
                    {formatPrice(unitPrice)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleMoveToCart(product)}
                disabled={!product.inStock}
                className="w-full py-2.5 px-3 rounded-xl bg-charcoal-900 hover:bg-black dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Bag</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
