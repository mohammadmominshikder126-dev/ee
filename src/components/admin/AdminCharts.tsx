import { useState } from 'react';
import { toBengaliDigits } from '../../data/storeDefaults';

export function MiniSparkline({
  color,
  points,
}: {
  color: string;
  points: number[];
}) {
  const width = 96;
  const height = 34;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((val, idx) => {
    const x = (idx / Math.max(1, points.length - 1)) * width;
    const y = height - 4 - ((val - min) / span) * (height - 8);
    return { x, y };
  });

  const linePath = coords
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-8 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface SalesPoint {
  label: string;
  amount: number;
}

export function SalesAreaChart({ data }: { data: SalesPoint[] }) {
  const [activeIdx, setActiveIdx] = useState<number>(Math.max(0, data.length - 2));

  const width = 560;
  const height = 210;
  const padLeft = 42;
  const padRight = 18;
  const padTop = 26;
  const padBottom = 32;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = Math.max(...data.map((d) => d.amount), 1000);
  const yCeiling = Math.ceil(maxVal / 1000) * 1000;

  const coords = data.map((d, idx) => {
    const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
    const y = padTop + plotH - (d.amount / yCeiling) * plotH;
    return { ...d, x, y };
  });

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = ((p0.x + p1.x) / 2).toFixed(1);
      d += ` C ${cx} ${p0.y.toFixed(1)}, ${cx} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const smoothLine = buildSmoothPath(coords);
  const areaPath =
    coords.length > 0
      ? `${smoothLine} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(
          1
        )} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const highlighted = coords[Math.min(activeIdx, coords.length - 1)];

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="salesGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4b400" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f4b400" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => {
          const y = padTop + plotH - t * plotH;
          const val = Math.round((yCeiling * t) / 1000);
          return (
            <g key={t}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-neutral-400 text-[11px] font-mono-num"
              >
                {val}k
              </text>
            </g>
          );
        })}

        {areaPath && <path d={areaPath} fill="url(#salesGoldGrad)" />}
        {smoothLine && (
          <path
            d={smoothLine}
            fill="none"
            stroke="#f4b400"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {highlighted && (
          <line
            x1={highlighted.x}
            y1={padTop}
            x2={highlighted.x}
            y2={padTop + plotH}
            stroke="#111827"
            strokeDasharray="3 3"
            strokeOpacity="0.25"
          />
        )}

        {coords.map((pt, idx) => {
          const isActive = idx === Math.min(activeIdx, coords.length - 1);
          return (
            <g
              key={pt.label}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => setActiveIdx(idx)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 6.5 : 4.5}
                fill={isActive ? '#141518' : '#f4b400'}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-neutral-500 text-[10px] font-medium"
              >
                {pt.label}
              </text>
            </g>
          );
        })}

        {highlighted && (
          <g
            transform={`translate(${Math.min(
              Math.max(highlighted.x - 48, padLeft),
              width - padRight - 96
            )}, ${Math.max(highlighted.y - 38, 2)})`}
          >
            <rect width="96" height="28" rx="8" fill="#141518" />
            <text
              x="48"
              y="18"
              textAnchor="middle"
              className="fill-white text-[11px] font-bold font-mono-num"
            >
              ৳{highlighted.amount.toLocaleString('en-US')}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function OrderStatusDonut({
  completed,
  processing,
  pending,
  total,
}: {
  completed: number;
  processing: number;
  pending: number;
  total: number;
}) {
  const safeTotal = Math.max(1, completed + processing + pending);
  const completedPct = Math.round((completed / safeTotal) * 100);
  const processingPct = Math.round((processing / safeTotal) * 100);
  const pendingPct = Math.max(0, 100 - completedPct - processingPct);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const seg1 = (completedPct / 100) * circumference;
  const seg2 = (processingPct / 100) * circumference;
  const seg3 = (pendingPct / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-5">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="22"
          />
          {seg1 > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#12a854"
              strokeWidth="22"
              strokeDasharray={`${seg1} ${circumference}`}
              strokeDashoffset={0}
            />
          )}
          {seg2 > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="22"
              strokeDasharray={`${seg2} ${circumference}`}
              strokeDashoffset={-seg1}
            />
          )}
          {seg3 > 0 && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="22"
              strokeDasharray={`${seg3} ${circumference}`}
              strokeDashoffset={-(seg1 + seg2)}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono-num text-xl font-extrabold text-[#141518] leading-none">
            {toBengaliDigits(total)}
          </span>
          <span className="text-[11px] font-medium text-neutral-500 mt-1">মোট অর্ডার</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-neutral-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12a854]" />
            <span>সম্পন্ন</span>
          </div>
          <span className="font-mono-num font-bold text-[#141518]">
            {toBengaliDigits(completedPct)}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-neutral-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span>প্রসেসিং</span>
          </div>
          <span className="font-mono-num font-bold text-[#141518]">
            {toBengaliDigits(processingPct)}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-neutral-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
            <span>পেন্ডিং</span>
          </div>
          <span className="font-mono-num font-bold text-[#141518]">
            {toBengaliDigits(pendingPct)}%
          </span>
        </div>
      </div>
    </div>
  );
}
