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
    { value: String(days), label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: mins, label: 'Min' },
    { value: secs, label: 'Sec' },
  ];

  return (
    <section
      aria-label="Flash Sale"
      className="rounded-3xl p-5 sm:p-7 text-white mb-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
      style={{
        background: 'linear-gradient(115deg, #070707 58%, #024910 100%)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] flex items-center justify-center shrink-0">
            <Zap className="w-8 h-8 fill-white text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide leading-tight">
              FLASH SALE
            </h1>
            <p className="text-neutral-200 text-[15px] sm:text-base mt-0.5">
              Flash OFF — Shop fast!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          <div>
            <div className="text-sm font-semibold text-neutral-200 mb-2.5">Ends in</div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              {timeUnits.map((unit, idx) => (
                <div key={unit.label} className="flex items-center gap-1.5 sm:gap-2">
                  <div className="bg-white text-[#111] rounded-[13px] min-w-[60px] sm:min-w-[66px] px-2 py-2 text-center shadow-sm">
                    <span className="font-mono-num block text-xl sm:text-[22px] font-bold leading-none">
                      {unit.value}
                    </span>
                    <small className="block text-[11px] text-neutral-500 mt-1 font-medium">
                      {unit.label}
                    </small>
                  </div>
                  {idx < timeUnits.length - 1 && (
                    <span className="text-xl font-bold text-neutral-300 select-none" aria-hidden="true">
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
            className="w-full sm:w-auto lg:min-w-[180px] rounded-[13px] bg-[#12a800] hover:bg-[#109400] active:scale-[0.99] text-white font-bold text-[17px] px-6 py-4 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
