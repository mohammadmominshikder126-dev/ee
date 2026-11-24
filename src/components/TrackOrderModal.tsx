import { CheckCircle2, PackageSearch, Truck, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { OrderRecord } from '../types';

interface TrackOrderModalProps {
  open: boolean;
  initialOrderId?: string;
  orders: OrderRecord[];
  onClose: () => void;
}

const STEPS: OrderRecord['status'][] = ['Order Placed', 'Confirmed', 'Dispatched', 'Delivered'];

export function TrackOrderModal({
  open,
  initialOrderId,
  orders,
  onClose,
}: TrackOrderModalProps) {
  const [queryId, setQueryId] = useState(initialOrderId || '');
  const [searchedId, setSearchedId] = useState(initialOrderId || '');

  useEffect(() => {
    if (initialOrderId) {
      setQueryId(initialOrderId);
      setSearchedId(initialOrderId);
    }
  }, [initialOrderId]);

  if (!open) return null;

  const matchedOrder = orders.find(
    (o) => o.id.toLowerCase() === searchedId.trim().toLowerCase()
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchedId(queryId.trim());
  };

  const activeStepIdx = matchedOrder ? STEPS.indexOf(matchedOrder.status) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Track order"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#12a800]" />
            <h2 className="font-display text-lg font-bold text-[#171717]">Track Your Order</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order tracker"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#171717]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Enter Order ID (e.g. SB-10420)"
              className="flex-1 h-11 px-3.5 rounded-xl border border-neutral-300 focus:border-[#12a800] outline-none text-sm font-mono-num"
            />
            <button
              type="submit"
              className="px-4 h-11 rounded-xl bg-[#171717] hover:bg-[#12a800] text-white text-sm font-bold transition-colors shrink-0"
            >
              Track
            </button>
          </form>

          {orders.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-neutral-500 mb-2">Recent Orders</div>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 4).map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => {
                      setQueryId(order.id);
                      setSearchedId(order.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 font-mono-num text-xs font-bold text-[#171717]"
                  >
                    #{order.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchedId ? (
            matchedOrder ? (
              <div className="rounded-2xl border border-neutral-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono-num text-sm font-bold text-[#171717]">
                      #{matchedOrder.id}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {matchedOrder.customerName} · {matchedOrder.phone}
                    </div>
                  </div>
                  <span className="font-mono-num text-sm font-bold text-[#12a800]">
                    ৳{matchedOrder.total.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                  {STEPS.map((step, idx) => {
                    const done = idx <= activeStepIdx;
                    return (
                      <div key={step} className="flex items-center gap-3 text-sm">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            done ? 'text-[#12a800]' : 'text-neutral-300'
                          }`}
                        />
                        <span
                          className={
                            done ? 'font-semibold text-[#171717]' : 'text-neutral-400'
                          }
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-5 text-center">
                <PackageSearch className="w-7 h-7 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#171717]">
                  No order found for &ldquo;{searchedId}&rdquo;
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Check your Order ID or place an order to track it here.
                </p>
              </div>
            )
          ) : (
            <p className="text-xs text-neutral-500">
              Enter your Apon jon e-shop Order ID above to check live dispatch status.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
