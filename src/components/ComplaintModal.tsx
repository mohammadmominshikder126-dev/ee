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
      aria-label="Submit a complaint"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-[#12a800]" />
            <h2 className="font-display text-lg font-bold text-[#171717]">
              Complaint &amp; Support
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close complaint form"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {ticketId ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#12a800] mx-auto" />
            <h3 className="font-display text-lg font-bold text-[#171717]">
              Report Received ({ticketId})
            </h3>
            <p className="text-sm text-neutral-600">
              Our Apon jon e-shop care team will call you on <span className="font-mono-num">{phone}</span>{' '}
              within 2 business hours.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full min-h-[44px] rounded-xl bg-[#171717] text-white font-bold text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Order ID (optional)
              </label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="SB-XXXXX"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 focus:border-[#12a800] outline-none text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 focus:border-[#12a800] outline-none text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Issue Details
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your product or delivery concern..."
                className="w-full p-3.5 rounded-xl border border-neutral-300 focus:border-[#12a800] outline-none text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-[#171717] hover:bg-[#12a800] text-white font-bold text-sm transition-colors"
            >
              Submit Complaint
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
