import { ShieldCheck, X } from 'lucide-react';
import { VerifiedPurchase } from '../types';

interface VerifiedOrderToastProps {
  purchase: VerifiedPurchase | null;
  onDismiss: () => void;
  onSelectProductId: (productId: string) => void;
}

export function VerifiedOrderToast({
  purchase,
  onDismiss,
  onSelectProductId,
}: VerifiedOrderToastProps) {
  if (!purchase) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-3 right-20 sm:left-5 sm:right-auto bottom-[76px] md:bottom-6 z-30 bg-white border border-neutral-200 rounded-2xl p-2.5 sm:p-3 pr-9 shadow-[0_10px_28px_rgba(0,0,0,0.12)] flex items-center gap-3 max-w-[350px]"
    >
      <button
        type="button"
        onClick={() => onSelectProductId(purchase.productId)}
        className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 cursor-pointer"
      >
        <img
          src={purchase.image}
          alt={purchase.productName}
          referrerPolicy="no-referrer"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 bg-neutral-100"
        />
        <div className="min-w-0">
          <div className="text-xs sm:text-[13px] font-bold text-[#141518] truncate">
            {purchase.buyer} এইমাত্র কিনেছেন
          </div>
          <div className="text-[11px] sm:text-xs text-neutral-600 truncate mt-0.5">
            {purchase.productName}
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
            <span>{purchase.timeAgo}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-[#12a800] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              ভেরিফাইড অর্ডার
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="নোটিফিকেশন বন্ধ করুন"
        className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
