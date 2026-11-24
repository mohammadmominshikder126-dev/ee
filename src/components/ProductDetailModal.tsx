import { Check, Minus, Package, Plus, ShieldCheck, ShoppingBasket, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOrderNow: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onOrderNow,
}: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500">{product.category}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="বিস্তারিত বন্ধ করুন"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#141518]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#faf8f4] relative">
            <span className="absolute top-3 left-3 bg-[#141518] text-white text-xs font-bold px-3 py-1 rounded-full">
              {product.discountLabel}
            </span>
            {!imgError ? (
              <img
                src={product.image}
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

          <div className="flex flex-col">
            <h2 id="pdp-title" className="font-display text-xl sm:text-2xl font-bold text-[#141518]">
              {product.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-2.5 font-mono-num">
              <span className="text-2xl font-extrabold text-[#b87e06]">
                ৳{product.price.toLocaleString('en-US')}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                ৳{product.oldPrice.toLocaleString('en-US')}
              </span>
            </div>

            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{product.shortDesc}</p>

            <ul className="mt-4 space-y-2 text-xs sm:text-[13px] text-neutral-700">
              {product.specs.map((spec) => (
                <li key={spec} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#b87e06] shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-4 text-xs text-neutral-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#b87e06]" />
                ক্যাশ অন ডেলিভারি
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#b87e06]" />
                স্টকে আছে {product.left} টি
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-neutral-700">পরিমাণ</span>
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="পরিমাণ কমান"
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono-num font-bold text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.left, q + 1))}
                  aria-label="পরিমাণ বাড়ান"
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, qty);
                  onClose();
                }}
                className="min-h-[46px] px-4 rounded-xl border-2 border-[#141518] text-[#141518] hover:bg-neutral-100 font-bold text-sm flex items-center justify-center gap-2 shrink-0"
              >
                <ShoppingBasket className="w-4 h-4" />
                <span>কার্টে রাখুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOrderNow(product, qty);
                  onClose();
                }}
                className="flex-1 min-h-[46px] rounded-xl bg-gradient-to-r from-[#e2ae32] to-[#c98e0b] hover:from-[#ecc04c] hover:to-[#d99b12] text-[#141518] font-extrabold text-sm tracking-wide transition-colors cursor-pointer"
              >
                অর্ডার করুন · ৳{(product.price * qty).toLocaleString('en-US')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
