import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  Check,
  MessageCircle,
  Plus,
  Minus,
  Star,
  Sparkles,
} from 'lucide-react';
import { Product, ProductReview } from '../../types';
import { getProductBySlug, getProducts } from '../../services/productService';
import { getProductReviews, addProductReview } from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';
import { ImageGallery } from '../../components/product/ImageGallery';
import { ProductCard } from '../../components/product/ProductCard';
import { formatPrice, calculateDiscountPercentage } from '../../utils/formatters';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const item = await getProductBySlug(slug);
        setProduct(item);

        if (item) {
          const [related, fetchedReviews] = await Promise.all([
            getProducts({
              categorySlug: item.categorySlug,
              activeOnly: true,
              limitCount: 4,
            }),
            getProductReviews(item.id),
          ]);
          setRelatedProducts(related.filter((p) => p.id !== item.id));
          setReviews(fetchedReviews);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewName.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const newRev = await addProductReview({
        productId: product.id,
        productName: product.name,
        authorName: reviewName.trim(),
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [newRev, ...prev]);
      setReviewSuccess(true);
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-charcoal-100 dark:bg-charcoal-800 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-charcoal-100 dark:bg-charcoal-800 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-charcoal-100 dark:bg-charcoal-800 rounded w-1/4 animate-pulse" />
            <div className="h-32 bg-charcoal-100 dark:bg-charcoal-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-charcoal-900 dark:text-white">
          Product Not Found
        </h2>
        <p className="text-sm text-charcoal-500 mt-2">
          The product you are seeking may have been moved or removed from our catalog.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-6 px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const discount = calculateDiscountPercentage(product.regularPrice, product.salePrice);
  const isFavorited = isInWishlist(product.id);
  const unitPrice = product.salePrice ?? product.regularPrice;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const rawNumber = settings.whatsapp || '+92 306 0824762';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const storeTitle = settings.storeName || 'HHD Collections';
    const message = `Hello ${storeTitle}! I want to order:\n\n*Product:* ${product.name}\n*SKU:* ${product.sku}\n*Quantity:* ${quantity}\n*Price:* ${formatPrice(unitPrice * quantity)}\n\nPlease assist with Cash on Delivery dispatch. Thank you!`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-10 sm:space-y-16 pb-20 md:pb-0">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-500 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-500">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link to="/categories" className="hover:text-brand-500">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link to={`/category/${product.categorySlug}`} className="hover:text-brand-500">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-semibold text-charcoal-900 dark:text-white truncate">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Multiple Image Gallery with Zoom */}
        <div className="lg:col-span-6">
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Product Actions & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {product.category}
              </span>
              <span className="text-charcoal-300">•</span>
              <span className="text-xs text-charcoal-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 dark:text-white leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Stock Badge */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center space-x-1.5 text-amber-500">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-charcoal-800 dark:text-charcoal-200">
                  {product.rating?.toFixed(1) || '4.9'}
                </span>
                <span className="text-xs text-charcoal-400">
                  ({product.reviewCount || 24} customer reviews)
                </span>
              </div>

              <div className="text-xs">
                {product.inStock ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-50 dark:bg-charcoal-800/50 border border-charcoal-100 dark:border-charcoal-800 flex items-baseline space-x-4">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
              {formatPrice(unitPrice)}
            </span>
            {product.salePrice && (
              <>
                <span className="text-base sm:text-lg text-charcoal-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                  SAVE {discount}%
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase">
                Quantity:
              </span>
              <div className="flex items-center border border-charcoal-300 dark:border-charcoal-700 rounded-xl overflow-hidden bg-white dark:bg-charcoal-800">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-charcoal-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-luxury ${
                  !product.inStock
                    ? 'bg-charcoal-200 dark:bg-charcoal-800 text-charcoal-400 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="py-3.5 px-6 rounded-xl bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-ivory-100 dark:text-charcoal-900 text-white font-semibold text-sm transition-all shadow-md"
              >
                Buy Now (COD)
              </button>

              {/* Wishlist button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                    : 'border-charcoal-200 dark:border-charcoal-700 text-charcoal-600 dark:text-charcoal-300 hover:text-rose-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
              </button>
            </div>

            {/* WhatsApp Quick Order Button */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Instantly on WhatsApp ({settings.whatsapp || '+92 306 0824762'})</span>
            </button>
          </div>

          {/* Value Props Box */}
          <div className="p-4 rounded-xl bg-charcoal-50/60 dark:bg-charcoal-800/40 border border-charcoal-100 dark:border-charcoal-800 space-y-2.5 text-xs text-charcoal-600 dark:text-charcoal-300">
            <div className="flex items-center space-x-2.5">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Cash on Delivery nationwide (2-4 business days)</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <RotateCcw className="w-4 h-4 text-brand-500" />
              <span>7-Day checking replacement warranty</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>100% Genuine product inspection before packaging</span>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2 flex items-center space-x-3 text-xs text-charcoal-500">
            <span className="flex items-center space-x-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share:</span>
            </span>
            <button
              onClick={handleWhatsAppOrder}
              className="hover:text-emerald-600 transition-colors"
            >
              WhatsApp
            </button>
            <span>•</span>
            <button
              onClick={handleCopyLink}
              className="hover:text-brand-500 transition-colors"
            >
              {copiedLink ? '✓ Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Detailed Specifications */}
      <div className="border-t border-charcoal-200 dark:border-charcoal-800 pt-8 sm:pt-10">
        <div className="flex border-b border-charcoal-200 dark:border-charcoal-800 space-x-3 sm:space-x-8 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex-shrink-0 ${
              activeTab === 'desc'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex-shrink-0 ${
              activeTab === 'specs'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            Specifications & Features
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex-shrink-0 ${
              activeTab === 'shipping'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            Shipping & Return Policy
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex-shrink-0 ${
              activeTab === 'reviews'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white'
            }`}
          >
            Verified Reviews ({reviews.length > 0 ? reviews.length : (product.reviewCount || 0)})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-charcoal-700 dark:text-charcoal-200">
              <p>{product.description}</p>
              {product.features && product.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-charcoal-900 dark:text-white mb-2">Key Highlights:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {product.features.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl">
              {product.specifications ? (
                <table className="w-full text-left text-xs border border-charcoal-200 dark:border-charcoal-800 rounded-xl overflow-hidden">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-charcoal-50 dark:bg-charcoal-800/40' : ''}
                      >
                        <td className="p-3 font-semibold text-charcoal-600 dark:text-charcoal-400 w-1/3 border-b border-charcoal-200 dark:border-charcoal-800">
                          {key}
                        </td>
                        <td className="p-3 text-charcoal-900 dark:text-white border-b border-charcoal-200 dark:border-charcoal-800">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-charcoal-500">Standard specifications apply.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs text-charcoal-600 dark:text-charcoal-300 max-w-2xl">
              <p>
                <strong>Delivery Time:</strong> 2 to 4 business days across major cities in Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and others).
              </p>
              <p>
                <strong>Payment Methods:</strong> Cash on Delivery (COD) is supported nationwide. You inspect the parcel and pay upon receipt. Direct bank transfers or WhatsApp orders are also welcomed.
              </p>
              <p>
                <strong>7-Day Checking Warranty:</strong> In the rare event of damage in transit or functional defect, contact our support team on WhatsApp within 7 days of receiving your order for an immediate hassle-free replacement.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Write Review Form */}
              <div className="p-5 sm:p-6 rounded-2xl bg-charcoal-50 dark:bg-charcoal-800/60 border border-charcoal-200 dark:border-charcoal-800">
                <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white mb-2">
                  Leave a Verified Review
                </h3>
                <p className="text-xs text-charcoal-500 mb-4">
                  Share your experience with this item. Your review is stored securely in our database.
                </p>

                {reviewSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    ✓ Thank you! Your review has been saved to Cloud Firestore.
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ayesha Khan"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 mb-1">
                        Rating (Stars) *
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                        <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                        <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                        <option value={2}>★★☆☆☆ (2 Stars - Below Expectations)</option>
                        <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 mb-1">
                      Your Comments & Experience *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the build quality, packing, and overall satisfaction..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-sm flex items-center space-x-1.5"
                  >
                    <span>{submittingReview ? 'Submitting to Firestore...' : 'Submit Review'}</span>
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">
                  Customer Feedback ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 text-center space-y-1">
                    <p className="text-xs text-charcoal-500">
                      No customer reviews yet. Be the first to review this product!
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-charcoal-900 dark:text-white">
                            {rev.authorName}
                          </span>
                          {rev.verified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                              ✓ Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-charcoal-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-500 text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-current' : 'text-charcoal-300 dark:text-charcoal-700'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-charcoal-200 dark:border-charcoal-800 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">
              Related Collections
            </h2>
            <Link
              to={`/category/${product.categorySlug}`}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View More in {product.category} →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-16 inset-x-0 z-30 md:hidden bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md border-t border-charcoal-200/80 dark:border-charcoal-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-luxury">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Total Price</span>
          <span className="font-bold text-sm text-charcoal-900 dark:text-white truncate">
            {formatPrice(unitPrice * quantity)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            title="Order via WhatsApp"
            aria-label="Order on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-sm ${
              !product.inStock
                ? 'bg-charcoal-200 dark:bg-charcoal-800 text-charcoal-400 cursor-not-allowed'
                : addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
