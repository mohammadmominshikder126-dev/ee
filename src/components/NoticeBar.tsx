import { X, Zap } from 'lucide-react';

interface NoticeBarProps {
  visible: boolean;
  onDismiss: () => void;
}

const NOTICE_TEXT =
  'আপনার কাঙ্ক্ষিত প্রোডাক্ট খুঁজে না পেলে আমাদের E-shop ফেসবুক পেজে নক করবেন। ওয়েবসাইটে সব প্রোডাক্ট দেখানো নাও হতে পারে। সেরা দামে পছন্দের গ্যাজেট কিনুন';

export function NoticeBar({ visible, onDismiss }: NoticeBarProps) {
  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Special notice"
      className="h-10 bg-[#191919] text-white flex items-center overflow-hidden text-[13px] relative select-none"
    >
      <div className="h-full bg-[#079b00] px-3.5 sm:px-5 flex items-center gap-1.5 font-bold tracking-wide text-xs sm:text-[13px] shrink-0 notice-ribbon-clip z-10">
        <Zap className="w-3.5 h-3.5 fill-white text-white shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">SPECIAL NOTICE</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="sb-ticker-track text-neutral-100 text-xs sm:text-[13px] font-medium">
          <span className="px-6 whitespace-nowrap">{NOTICE_TEXT} •</span>
          <span className="px-6 whitespace-nowrap" aria-hidden="true">
            {NOTICE_TEXT} •
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss special notice"
        className="min-w-[40px] h-10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors shrink-0 z-10 bg-[#191919]"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
