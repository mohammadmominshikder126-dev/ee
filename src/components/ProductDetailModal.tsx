import {
  Check,
  Clock,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBasket,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PRODUCT_COLOR_OPTIONS } from '../data/storeDefaults';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  dhakaDeliveryFee?: number;
  outsideDeliveryFee?: number;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string) => void;
  onOrderNow: (product: Product, quantity: number, color?: string) => void;
}

export function ProductDetailModal({
  product,
  dhakaDeliveryFee = 60,
  outsideDeliveryFee = 120,
  onClose,
  onAddToCart,
  onOrderNow,
}: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('White');

  const availableColors =
    product?.colors && product.colors.length > 0
      ? PRODUCT_COLOR_OPTIONS.filter((c) => product.colors?.includes(c.id))
      : PRODUCT_COLOR_OPTIONS;

  const colorList = availableColors.length > 0 ? availableColors : PRODUCT_COLOR_OPTIONS;

  const gallery = product
    ? Array.from(new Set([product.image, ...(product.galleryImages || []).filter(Boolean)]))
    : [];

  useEffect(() => {
    if (product) {
      setQty(1);
      setImgError(false);
      setActiveImage(product.image);
      const firstColor =
        product.colors && product.colors.length > 0 ? product.colors[0] : 'White';
      setSelectedColor(firstColor);
    }
  }, [product]);

  if (!product) return null;

  const savedAmount = Math.max(0, product.oldPrice - product.price);
  const savedPct =
    product.oldPrice > product.price
      ? Math.round((savedAmount / product.oldPrice) * 100)
      : 0;
  const displayImage = activeImage || product.image;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[94dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#141518] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="font-display text-sm font-bold text-[#141518] truncate px-2">
            পণ্যের অর্ডার ও বিস্তারিত
          </span>
          <span className="w-9" aria-hidden="true" />
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Thumbnail Gallery Strip (matching screenshot top bar) */}
          {gallery.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => {
                const isSelected = displayImage === imgUrl;
                return (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(imgUrl);
                      setImgError(false);
                    }}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-[#faf8f4] ${
                      isSelected
                        ? 'border-[#16a34a] shadow-xs'
                        : 'border-neutral-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} ছবি ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Product Image */}
          <div className="aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#faf8f4] relative border border-neutral-100">
            <span className="absolute top-3 left-3 bg-[#141518] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
              {product.discountLabel}
            </span>
            {!imgError ? (
              <img
                src={displayImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <Package className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Category Pill (Soft green matching screenshot) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f7ec] text-[#15803d] text-xs font-bold">
              {product.category}
            </span>
            {product.freeDelivery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#12a800] text-white text-xs font-bold">
                <Truck className="w-3.5 h-3.5" />
                ফ্রি হোম ডেলিভারি
              </span>
            )}
          </div>

          {/* Product Title */}
          <h2
            id="pdp-title"
            className="font-display text-xl sm:text-2xl font-extrabold text-[#141518] leading-snug"
          >
            {product.name}
          </h2>

          {/* Main Bordered Order Box (matching screenshot layout) */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-4 shadow-2xs">
            {/* Price + Save Badge + Green Stock & Sold */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2 font-mono-num">
                <span className="text-2xl font-extrabold text-[#141518]">
                  ৳{product.price.toLocaleString('en-US')}
                </span>
                {product.oldPrice > product.price && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳{product.oldPrice.toLocaleString('en-US')}
                  </span>
                )}
                {savedAmount > 0 && (
                  <span className="bg-[#fef2f2] text-[#dc2626] text-xs font-bold px-2.5 py-1 rounded-full">
                    সেভ ৳{savedAmount.toLocaleString('en-US')} ({savedPct}%)
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-[#15803d] font-mono-num flex flex-col items-end">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>স্টকে আছে: {product.left} পিস</span>
                </span>
                <span className="text-[11px] text-[#16a34a]">
                  ✓ {product.sold} জন কিনেছে
                </span>
              </div>
            </div>

            {/* Color Selection (White, Navy Blue, and all options) */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#141518]">কালার নির্বাচন করুন:</span>
                <span className="font-bold text-[#15803d]">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colorList.map((col) => {
                  const active = selectedColor === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColor(col.id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? 'border-[#16a34a] bg-[#ecfdf3] text-[#15803d] ring-1 ring-[#16a34a]'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper + Heart Button */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white h-10">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="পরিমাণ কমান"
                  className="w-10 h-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono-num font-bold text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(Math.max(1, product.left), q + 1))}
                  aria-label="পরিমাণ বাড়ান"
                  className="w-10 h-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFavorited((prev) => !prev)}
                aria-label="পছন্দ তালিকা"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  favorited
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Side-by-side Add to Cart + Green Buy Now */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, qty, selectedColor);
                  onClose();
                }}
                className="min-h-[46px] px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-[#141518] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBasket className="w-4 h-4" />
                <span>কার্টে যোগ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOrderNow(product, qty, selectedColor);
                  onClose();
                }}
                className="min-h-[46px] px-3 rounded-xl bg-[#0f9d58] hover:bg-[#0c8549] text-white font-extrabold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>এখনই অর্ডার করুন</span>
              </button>
            </div>

            {/* Soft Green Delivery Time Banner inside card */}
            <div className="rounded-xl bg-[#ecfdf3] border border-[#bbf7d0] px-3.5 py-2.5 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-[#141518]">ডেলিভারি সময়: ৩–৫ দিন</div>
                <div className="text-[#15803d] text-[11px] font-medium">
                  ঢাকার ভেতরে ১–৩ দিনের মধ্যে দ্রুত ডেলিভারি
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Guarantee Rows */}
          <div className="space-y-2.5 px-1 text-xs text-neutral-700">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#15803d] shrink-0" />
              {product.freeDelivery ? (
                <span className="font-bold text-[#12a800]">
                  ফ্রি হোম ডেলিভারি (সারা বাংলাদেশ ৳০ ডেলিভারি চার্জ)
                </span>
              ) : (
                <span>
                  ঢাকার ভেতরে ৳{dhakaDeliveryFee}, ঢাকার বাইরে ৳{outsideDeliveryFee}।
                </span>
              )}
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
              <span>
                পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন — ক্যাশ অন ডেলিভারি অথবা বিকাশ / নগদ (GoPay) পেমেন্ট সুবিধা।
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
              <span>ডেলিভারির পর কোনো সমস্যা থাকলে সহজেই এক্সচেঞ্জ বা রিটার্ন করতে পারবেন।</span>
            </div>
          </div>

          {/* Description Section */}
          <div className="pt-3 border-t border-neutral-100 space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#141518]">বিবরণ</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{product.shortDesc}</p>
            {product.specs.length > 0 && (
              <ul className="space-y-1.5 text-xs sm:text-[13px] text-neutral-700 pt-1">
                {product.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
