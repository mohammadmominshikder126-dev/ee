import { CheckCircle2, MessageSquareWarning, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ComplaintModalProps {
  open: boolean;
  onClose: () => void;
}

export function ComplaintModal({ open, onClose }: ComplaintModalProps) {
  const [orderRef, setOrderRef] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) return;
    setTicketId(`CMP-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleClose = () => {
    setTicketId(null);
    setOrderRef('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="অভিযোগ ও সাপোর্ট"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-[#b87e06]" />
            <h2 className="font-display text-lg font-bold text-[#141518]">
              অভিযোগ ও সাপোর্ট কেন্দ্র
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="অভিযোগ ফর্ম বন্ধ করুন"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {ticketId ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#12a800] mx-auto" />
            <h3 className="font-display text-lg font-bold text-[#141518]">
              অভিযোগ গৃহীত হয়েছে ({ticketId})
            </h3>
            <p className="text-sm text-neutral-600">
              আমাদের আপনজন ই-শপ টিম ২ কর্মঘণ্টার মধ্যে{' '}
              <span className="font-mono-num">{phone}</span> নম্বরে যোগাযোগ করবে।
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full min-h-[44px] rounded-xl bg-[#141518] text-white font-bold text-sm"
            >
              বন্ধ করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                অর্ডার আইডি (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="AJ-XXXXX"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 focus:border-[#c98e0b] outline-none text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 focus:border-[#c98e0b] outline-none text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                বিস্তারিত লিখুন
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="পণ্য বা ডেলিভারি সংক্রান্ত আপনার মতামত বা সমস্যা লিখুন..."
                className="w-full p-3.5 rounded-xl border border-neutral-300 focus:border-[#c98e0b] outline-none text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-[#141518] hover:bg-[#b87e06] text-white font-bold text-sm transition-colors"
            >
              জমা দিন
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
