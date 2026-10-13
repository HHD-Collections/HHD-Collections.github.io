import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice, calculateDiscountPercentage } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const discount = calculateDiscountPercentage(product.regularPrice, product.salePrice);
  const isFavorited = isInWishlist(product.id);

  // Secondary image for hover effect
  const secondaryImage = product.images && product.images.length > 1
    ? product.images[1].url
    : product.primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative bg-white dark:bg-charcoal-900 rounded-2xl overflow-hidden border border-charcoal-100 dark:border-charcoal-800 transition-all duration-300 hover:shadow-luxury hover:-translate-y-1 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-charcoal-50 dark:bg-charcoal-800/60">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : product.primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = './assets/logo.png';
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discount > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-brand-500 text-white shadow-sm tracking-wide">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-charcoal-900/90 text-brand-300 dark:bg-charcoal-800 backdrop-blur-sm tracking-wider uppercase">
              Featured
            </span>
          )}
          {!product.inStock && (
            <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-red-600 text-white tracking-wider uppercase">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              : 'bg-white/80 dark:bg-charcoal-800/80 text-charcoal-600 dark:text-charcoal-300 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
        </button>

        {/* Quick View / Hover Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Link
            to={`/product/${product.slug}`}
            className="w-full py-2 px-3 rounded-xl bg-white/95 dark:bg-charcoal-800/95 backdrop-blur-md text-charcoal-900 dark:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-charcoal-400 mb-1.5">
            <span className="uppercase tracking-wider font-medium text-[11px] text-brand-600 dark:text-brand-400">
              {product.category}
            </span>
            {product.rating && (
              <div className="flex items-center space-x-1 text-amber-500 font-semibold text-xs">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-charcoal-400 font-normal">({product.reviewCount || 12})</span>
              </div>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="font-serif font-semibold text-sm sm:text-base text-charcoal-900 dark:text-white line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-3 mt-3 border-t border-charcoal-100 dark:border-charcoal-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg text-charcoal-900 dark:text-white">
              {formatPrice(product.salePrice ?? product.regularPrice)}
            </span>
            {product.salePrice && (
              <span className="text-xs text-charcoal-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-all ${
              !product.inStock
                ? 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-400 cursor-not-allowed'
                : addedAnim
                ? 'bg-emerald-600 text-white'
                : 'bg-charcoal-900 hover:bg-black dark:bg-brand-500 dark:hover:bg-brand-600 text-white shadow-sm'
            }`}
            title="Add to cart"
          >
            {addedAnim ? (
              <>
                <Check className="w-4 h-4 text-white animate-scale" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
