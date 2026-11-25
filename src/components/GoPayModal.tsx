import { Check, CheckCircle2, Copy, Lock, ShieldCheck, Smartphone, X, Zap } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { PaymentMethod } from '../types';

interface GoPayModalProps {
  open: boolean;
  method: 'bkash' | 'nagad';
  amount: number;
  merchantName: string;
  merchantWallet: string;
  defaultPhone?: string;
  onClose: () => void;
  onPaymentVerified: (data: {
    method: PaymentMethod;
    sender: string;
    trxId: string;
  }) => void;
}

export function GoPayModal({
  open,
  method,
  amount,
  merchantName,
  merchantWallet,
  defaultPhone = '',
  onClose,
  onPaymentVerified,
}: GoPayModalProps) {
  const [sender, setSender] = useState(defaultPhone);
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const isBkash = method === 'bkash';
  const brandTitle = isBkash ? 'বিকাশ (bKash)' : 'নগদ (Nagad)';
  const accentBg = isBkash ? 'bg-[#E2136E]' : 'bg-[#F26522]';
  const accentHover = isBkash ? 'hover:bg-[#c80f60]' : 'hover:bg-[#d95314]';
  const accentText = isBkash ? 'text-[#E2136E]' : 'text-[#F26522]';
  const accentSoftBg = isBkash ? 'bg-[#fdf2f8]' : 'bg-[#fff7ed]';
  const accentBorder = isBkash ? 'border-[#fbcfe8]' : 'border-[#fed7aa]';

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(merchantWallet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleVerifySubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanSender = sender.trim().replace(/\s+/g, '');
    const cleanTrx = trxId.trim().toUpperCase();

    if (!/^01[3-9]\d{8}$/.test(cleanSender)) {
      setError(`সঠিক ১১ সংখ্যার ${brandTitle} নম্বর লিখুন (01XXXXXXXXX)।`);
      return;
    }
    if (!/^[A-Z0-9]{6,16}$/.test(cleanTrx)) {
      setError('সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন — কমপক্ষে ৬ অক্ষর/সংখ্যা হতে হবে।');
      return;
    }

    setError('');
    setVerifying(true);
    window.setTimeout(() => {
      setVerifying(false);
      onPaymentVerified({
        method,
        sender: cleanSender,
        trxId: cleanTrx,
      });
    }, 650);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="GoPay পেমেন্ট গেটওয়ে"
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[94dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GoPay Header */}
        <div className={`${accentBg} text-white px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base tracking-wide">GoPay</span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  সিকিউর পেমেন্ট
                </span>
              </div>
              <div className="text-xs text-white/90">
                {merchantName} · {brandTitle}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="পেমেন্ট বাতিল করুন"
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleVerifySubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Amount & Merchant Card */}
          <div className={`rounded-2xl border ${accentBorder} ${accentSoftBg} p-4 text-center`}>
            <div className="text-xs font-semibold text-neutral-600">মোট পরিশোধযোগ্য টাকা</div>
            <div className={`font-mono-num text-3xl font-extrabold mt-0.5 ${accentText}`}>
              ৳{amount.toLocaleString('en-US')}
            </div>

            <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between gap-2 text-left">
              <div>
                <div className="text-[11px] text-neutral-500 font-medium">
                  মার্চেন্ট / পার্সোনাল {brandTitle} নম্বর
                </div>
                <div className="font-mono-num text-base font-extrabold text-[#141518]">
                  {merchantWallet}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyWallet}
                className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-[#141518] flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#12a800]" />
                    <span className="text-[#12a800]">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step-by-step Instructions */}
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 text-xs text-neutral-700 space-y-1.5">
            <div className="font-bold text-[#141518] flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${accentText}`} />
              <span>পেমেন্ট করার নিয়ম:</span>
            </div>
            <p>১. আপনার {brandTitle} অ্যাপ থেকে "Send Money" অপশনে যান।</p>
            <p>
              ২. উপরের <span className="font-mono-num font-bold">{merchantWallet}</span> নম্বরে{' '}
              <span className="font-mono-num font-bold">৳{amount.toLocaleString('en-US')}</span>{' '}
              পাঠান।
            </p>
            <p>৩. পেমেন্ট শেষে প্রাপ্ত TrxID নিচে লিখে ভেরিফাই করুন — সাথে সাথে এডমিন নোটিফিকেশন পাবেন।</p>
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                যে {brandTitle} নম্বর থেকে টাকা পাঠিয়েছেন
              </label>
              <div className="flex items-center border border-neutral-300 rounded-xl px-3 h-11 focus-within:border-[#141518]">
                <Smartphone className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  required
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-sm font-mono-num outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                সঠিক ট্রানজেকশন আইডি (Transaction ID / TrxID)
              </label>
              <div className="flex items-center border border-neutral-300 rounded-xl px-3 h-11 focus-within:border-[#141518]">
                <Lock className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="যেমন: BKA9X72M1P"
                  className="w-full text-sm font-mono-num uppercase outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className={`w-full min-h-[48px] rounded-xl ${accentBg} ${accentHover} disabled:opacity-70 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer`}
          >
            {verifying ? (
              <span>GoPay ট্রানজেকশন যাচাই হচ্ছে...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>পেমেন্ট ভেরিফাই ও অর্ডার নিশ্চিত করুন</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
