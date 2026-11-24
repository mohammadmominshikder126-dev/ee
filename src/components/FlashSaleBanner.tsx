import { ArrowRight, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FlashSaleBannerProps {
  onViewAll: () => void;
}

const INITIAL_REMAINING_SECONDS = 351 * 86400 + 3 * 3600 + 43 * 60 + 40;

export function FlashSaleBanner({ onViewAll }: FlashSaleBannerProps) {
  const [remaining, setRemaining] = useState(INITIAL_REMAINING_SECONDS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  return (
    <section
      aria-label="ফ্ল্যাশ সেল"
      className="rounded-3xl p-5 sm:p-7 text-white mb-6 shadow-[0_14px_34px_rgba(18,19,22,0.16)] border border-[#c98e0b]/25"
      style={{
        background: 'linear-gradient(115deg, #111216 56%, #4b3407 100%)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#c98e0b]/20 border border-[#e0ab2b]/40 flex items-center justify-center shrink-0">
            <Zap className="w-8 h-8 fill-[#f0be4d] text-[#f0be4d]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide leading-tight text-[#fffdf7]">
              ফ্ল্যাশ সেল
            </h1>
            <p className="text-[#e7dfc9] text-[15px] sm:text-base mt-0.5">
              বিশেষ ছাড় — দ্রুত অর্ডার করুন!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          <div>
            <div className="text-sm font-semibold text-[#e7dfc9] mb-2.5">সময় বাকি</div>
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
