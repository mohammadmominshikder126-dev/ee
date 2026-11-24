import { CheckCircle2, MapPin, Phone, ShieldCheck, Truck, User, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CartItem, OrderRecord, PaymentMethod } from '../types';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onOrderCreated: (order: OrderRecord, clearedFromCart: boolean) => void;
  isDirectOrder: boolean;
  onTrackOrder: (orderId: string) => void;
}

export function CheckoutModal({
  open,
  items,
  onClose,
  onOrderCreated,
  isDirectOrder,
  onTrackOrder,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = zone === 'dhaka' ? 60 : 120;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(trimmedPhone.replace(/\s+/g, ''))) {
      setError('Please enter a valid 11-digit Bangladesh mobile number (01XXXXXXXXX).');
      return;
    }
    if (!address.trim() || address.trim().length < 6) {
      setError('Please enter your complete delivery address.');
      return;
    }

    setError('');
    const orderId = `SB-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      phone: trimmedPhone,
      address: address.trim(),
      zone,
      paymentMethod,
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      subtotal,
      deliveryFee,
      total,
      status: 'Order Placed',
    };

    setConfirmedOrder(newOrder);
    onOrderCreated(newOrder, !isDirectOrder);
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    setError('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={handleResetAndClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#171717]">
            {confirmedOrder ? 'Order Confirmed' : 'Quick Order Checkout'}
          </h2>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Close checkout"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#171717]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="p-6 overflow-y-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#12a800]/10 text-[#12a800] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-[#171717]">
                Thank you, {confirmedOrder.customerName}!
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Order <span className="font-mono-num font-bold text-[#171717]">#{confirmedOrder.id}</span>{' '}
                is confirmed and being prepared for dispatch.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment</span>
                <span className="font-semibold uppercase">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Zone</span>
                <span className="font-semibold">
                  {confirmedOrder.zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="font-semibold text-[#171717]">Total Payable</span>
                <span className="font-mono-num font-bold text-base text-[#12a800]">
                  ৳{confirmedOrder.total.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const id = confirmedOrder.id;
                  handleResetAndClose();
                  onTrackOrder(id);
                }}
                className="flex-1 min-h-[46px] rounded-xl bg-[#171717] text-white font-bold text-sm hover:bg-[#12a800] transition-colors"
              >
                Track Order #{confirmedOrder.id}
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 min-h-[46px] rounded-xl border border-neutral-200 font-semibold text-sm text-[#171717] hover:bg-neutral-50"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#171717] font-medium truncate pr-2">
                    {product.name} × {quantity}
                  </span>
                  <span className="font-mono-num font-semibold shrink-0">
                    ৳{(product.price * quantity).toLocaleString('en-US')}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                <span>Delivery charge</span>
                <span className="font-mono-num font-semibold">৳{deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-[#171717]">
                <span>Total</span>
                <span className="font-mono-num text-base text-[#12a800]">
                  ৳{total.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {error && (
              <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="flex items-center border border-neutral-300 rounded-xl px-3 h-11 focus-within:border-[#12a800]">
                  <User className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center border border-neutral-300 rounded-xl px-3 h-11 focus-within:border-[#12a800]">
                  <Phone className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-sm outline-none bg-transparent font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Delivery Address
                </label>
                <div className="flex items-start border border-neutral-300 rounded-xl px-3 py-2.5 focus-within:border-[#12a800]">
                  <MapPin className="w-4 h-4 text-neutral-400 mr-2.5 mt-0.5 shrink-0" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area, District"
                    className="w-full text-sm outline-none bg-transparent resize-none"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Delivery Area
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setZone('dhaka')}
                    className={`min-h-[42px] rounded-xl border text-xs font-semibold px-3 flex items-center justify-center gap-1.5 transition-colors ${
                      zone === 'dhaka'
                        ? 'border-[#12a800] bg-[#12a800]/10 text-[#12a800]'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Inside Dhaka (৳60)
                  </button>
                  <button
                    type="button"
                    onClick={() => setZone('outside')}
                    className={`min-h-[42px] rounded-xl border text-xs font-semibold px-3 flex items-center justify-center gap-1.5 transition-colors ${
                      zone === 'outside'
                        ? 'border-[#12a800] bg-[#12a800]/10 text-[#12a800]'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Outside Dhaka (৳120)
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Payment Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'cod', label: 'Cash on Delivery' },
                      { id: 'bkash', label: 'bKash' },
                      { id: 'nagad', label: 'Nagad' },
                    ] as const
                  ).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`min-h-[42px] rounded-xl border text-xs font-semibold px-2 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-[#171717] bg-[#171717] text-white'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-[#12a800] hover:bg-[#0e8f00] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm Order · ৳{total.toLocaleString('en-US')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
