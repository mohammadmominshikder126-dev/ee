import { ArrowRight, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TouchEvent, useEffect, useRef, useState } from 'react';
import { BannerSlide } from '../types';

interface FlashSaleBannerProps {
  onViewAll: () => void;
  banners?: BannerSlide[];
  title?: string;
  subtitle?: string;
}

const INITIAL_REMAINING_SECONDS = 351 * 86400 + 3 * 3600 + 43 * 60 + 40;

const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'default-1',
    src: '/assets/aistudio/IMG-20261125-WA0009_0d76ea15.jpg',
    alt: 'আপনজন E-Shop — ইউনিক গ্যাজেট, লাইটিং ও সিরামিক আইটেম ব্যানার ১',
    active: true,
  },
  {
    id: 'default-2',
    src: '/assets/aistudio/IMG-20261125-WA0008_da046969.jpg',
    alt: 'আপনজন E-Shop — স্মার্ট গ্যাজেট ও প্রিমিয়াম কালেকশন ব্যানার ২',
    active: true,
  },
];

export function FlashSaleBanner({
  onViewAll,
  banners,
  title = 'ফ্ল্যাশ সেল',
  subtitle = 'বিশেষ ছাড় — দ্রুত অর্ডার করুন!',
}: FlashSaleBannerProps) {
  const activeSlides = (banners && banners.length > 0 ? banners : DEFAULT_BANNERS).filter(
    (b) => b.active
  );
  const slides = activeSlides.length > 0 ? activeSlides : DEFAULT_BANNERS;

  const [remaining, setRemaining] = useState(INITIAL_REMAINING_SECONDS);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const slideTimer = window.setInterval(() => {
      setDirection(1);
      setBannerIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(slideTimer);
  }, [slides.length]);

  const goToBanner = (nextIdx: number, dir: 1 | -1) => {
    setDirection(dir);
    setBannerIndex((nextIdx + slides.length) % slides.length);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || e.changedTouches.length !== 1) {
      touchStartX.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) {
      goToBanner(dx < 0 ? bannerIndex + 1 : bannerIndex - 1, dx < 0 ? 1 : -1);
    }
  };

  const days = Math.floor(remaining / 86400);
  const hours = String(Math.floor((remaining % 86400) / 3600)).padStart(2, '0');
  const mins = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  const timeUnits = [
    { value: String(days), label: 'দিন' },
    { value: hours, label: 'ঘণ্টা' },
    { value: mins, label: 'মিনিট' },
    { value: secs, label: 'সেকেন্ড' },
  ];

  const safeIdx = bannerIndex % slides.length;
  const currentBanner = slides[safeIdx];

  return (
    <section
      aria-label="ফ্ল্যাশ সেল"
      className="rounded-3xl overflow-hidden text-white mb-6 shadow-[0_14px_34px_rgba(18,19,22,0.16)] border border-[#c98e0b]/30"
      style={{
        background: 'linear-gradient(115deg, #111216 56%, #4b3407 100%)',
      }}
    >
      <div
        data-no-swipe="true"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-[#111216] border-b border-[#c98e0b]/25 select-none"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.button
            key={currentBanner.id || currentBanner.src}
            type="button"
            custom={direction}
            onClick={onViewAll}
            initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="block w-full text-left cursor-pointer"
            aria-label="সব পণ্য দেখতে ক্লিক করুন"
          >
            <img
              src={currentBanner.src}
              alt={currentBanner.alt}
              referrerPolicy="no-referrer"
              className="w-full h-auto block object-cover"
            />
          </motion.button>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToBanner(safeIdx - 1, -1);
              }}
              aria-label="পূর্ববর্তী ছবি"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-[#f0be4d] border border-[#f0be4d]/30 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToBanner(safeIdx + 1, 1);
              }}
              aria-label="পরবর্তী ছবি"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-[#f0be4d] border border-[#f0be4d]/30 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/45 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {slides.map((item, idx) => (
                <button
                  key={item.id || item.src}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToBanner(idx, idx > safeIdx ? 1 : -1);
                  }}
                  aria-label={`ব্যানার ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safeIdx ? 'w-5 bg-[#e0ab2b]' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#c98e0b]/20 border border-[#e0ab2b]/40 flex items-center justify-center shrink-0">
            <Zap className="w-7 h-7 fill-[#f0be4d] text-[#f0be4d]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide leading-tight text-[#fffdf7]">
              {title}
            </h1>
            <p className="text-[#e7dfc9] text-sm sm:text-base mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          <div>
            <div className="text-sm font-semibold text-[#e7dfc9] mb-2">সময় বাকি</div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              {timeUnits.map((unit, idx) => (
                <div key={unit.label} className="flex items-center gap-1.5 sm:gap-2">
                  <div className="bg-[#fffdf8] text-[#141518] rounded-[13px] min-w-[60px] sm:min-w-[66px] px-2 py-2 text-center shadow-sm">
                    <span className="font-mono-num block text-xl sm:text-[22px] font-bold leading-none">
                      {unit.value}
                    </span>
                    <small className="block text-[11px] text-neutral-500 mt-1 font-medium">
                      {unit.label}
                    </small>
                  </div>
                  {idx < timeUnits.length - 1 && (
                    <span className="text-xl font-bold text-[#e0ab2b] select-none" aria-hidden="true">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="w-full sm:w-auto lg:min-w-[180px] rounded-[13px] bg-gradient-to-r from-[#ebc04e] to-[#c98e0b] hover:from-[#f4cc62] hover:to-[#d99b12] active:scale-[0.99] text-[#121316] font-extrabold text-[17px] px-6 py-4 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-md"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
