import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  CartItem,
  CartProfile,
  CouponCode,
  OrderRecord,
  PaymentMethod,
  WebsiteSettings,
} from '../types';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  cartProfile?: CartProfile | null;
  onClose: () => void;
  onOrderCreated: (order: OrderRecord, clearedFromCart: boolean) => void;
  isDirectOrder: boolean;
  onTrackOrder: (orderId: string) => void;
  settings?: WebsiteSettings;
  coupons?: CouponCode[];
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'cod', label: 'ক্যাশ অন ডেলিভারি' },
  { id: 'bkash', label: 'বিকাশ' },
  { id: 'nagad', label: 'নগদ' },
  { id: 'rocket', label: 'রকেট' },
  { id: 'card', label: 'কার্ড' },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  card: 'ডেবিট / ক্রেডিট কার্ড',
};

export function CheckoutModal({
  open,
  items,
  cartProfile,
  onClose,
  onOrderCreated,
  isDirectOrder,
  onTrackOrder,
  settings,
  coupons = [],
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState(cartProfile?.name || '');
  const [phone, setPhone] = useState(cartProfile?.phone || '');
  const [address, setAddress] = useState(cartProfile?.address || '');
  const [zone, setZone] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [walletSender, setWalletSender] = useState('');
  const [walletTrxId, setWalletTrxId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponFeedback, setCouponFeedback] = useState('');
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const availablePayments = PAYMENT_OPTIONS.filter(
    (opt) => !settings?.enabledPayments || settings.enabledPayments[opt.id] !== false
  );

  useEffect(() => {
    if (cartProfile) {
      setCustomerName((prev) => prev || cartProfile.name);
      setPhone((prev) => prev || cartProfile.phone);
      setAddress((prev) => prev || cartProfile.address);
    }
  }, [cartProfile, open]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const dhakaFee = settings?.dhakaDeliveryFee ?? 60;
  const outsideFee = settings?.outsideDeliveryFee ?? 120;
  const deliveryFee = zone === 'dhaka' ? dhakaFee : outsideFee;

  let discount = 0;
  if (appliedCoupon && appliedCoupon.active && subtotal >= appliedCoupon.minOrder) {
    discount =
      appliedCoupon.discountType === 'percent'
        ? Math.round((subtotal * appliedCoupon.value) / 100)
        : Math.min(subtotal, appliedCoupon.value);
  }

  const total = Math.max(0, subtotal - discount + deliveryFee);

  const isMobileWallet =
    paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket';

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon(null);
      setCouponFeedback('');
      return;
    }
    const found = coupons.find((c) => c.code.toUpperCase() === code && c.active);
    if (!found) {
      setAppliedCoupon(null);
      setCouponFeedback('সঠিক বা সক্রিয় কুপন কোড নয়।');
      return;
    }
    if (subtotal < found.minOrder) {
      setAppliedCoupon(null);
      setCouponFeedback(`এই কুপনের জন্য ন্যূনতম ৳${found.minOrder} অর্ডার প্রয়োজন।`);
      return;
    }
    setAppliedCoupon(found);
    setCouponFeedback(`কুপন "${found.code}" সফলভাবে প্রযোজ্য হয়েছে!`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!customerName.trim()) {
      setError('দয়া করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(trimmedPhone.replace(/\s+/g, ''))) {
      setError('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)।');
      return;
    }
    if (!address.trim() || address.trim().length < 6) {
      setError('দয়া করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    let paymentDetails: string | undefined;

    if (isMobileWallet) {
      const cleanSender = walletSender.trim().replace(/\s+/g, '');
      if (!/^01[3-9]\d{8}$/.test(cleanSender)) {
        setError(`আপনার ${PAYMENT_LABELS[paymentMethod]} নম্বর দিন (01XXXXXXXXX)।`);
        return;
      }
      if (walletTrxId.trim().length < 4) {
        setError(`আপনার ${PAYMENT_LABELS[paymentMethod]} ট্রানজেকশন আইডি (TrxID) দিন।`);
        return;
      }
      paymentDetails = `${cleanSender} · TrxID: ${walletTrxId.trim().toUpperCase()}`;
    } else if (paymentMethod === 'card') {
      const digitsOnly = cardNumber.replace(/\D/g, '');
      if (digitsOnly.length < 12) {
        setError('দয়া করে সঠিক কার্ড নম্বর লিখুন।');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        setError('মেয়াদ MM/YY ফরম্যাটে লিখুন।');
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvc.trim())) {
        setError('সঠিক ৩ বা ৪ সংখ্যার CVC দিন।');
        return;
      }
      paymentDetails = `কার্ড শেষ ৪ সংখ্যা •••• ${digitsOnly.slice(-4)}`;
    }

    setError('');
    const orderId = `AJ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      phone: trimmedPhone,
      address: address.trim(),
      zone,
      paymentMethod,
      paymentDetails,
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      subtotal,
      discount: discount > 0 ? discount : undefined,
      couponCode: discount > 0 ? appliedCoupon?.code : undefined,
      deliveryFee,
      total,
      status: 'অর্ডার গ্রহণ',
    };

    setConfirmedOrder(newOrder);
    onOrderCreated(newOrder, !isDirectOrder);
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    setError('');
    setCouponFeedback('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="চেকআউট"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={handleResetAndClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#141518]">
            {confirmedOrder ? 'অর্ডার নিশ্চিত হয়েছে' : 'দ্রুত অর্ডার চেকআউট'}
          </h2>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="চেকআউট বন্ধ করুন"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#141518]"
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
              <h3 className="font-display text-xl font-bold text-[#141518]">
                ধন্যবাদ, {confirmedOrder.customerName}!
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                আপনার অর্ডার{' '}
                <span className="font-mono-num font-bold text-[#141518]">
                  #{confirmedOrder.id}
                </span>{' '}
                সফলভাবে গৃহীত হয়েছে এবং ডেলিভারির জন্য প্রস্তুত হচ্ছে।
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left text-sm space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500">ঠিকানা</span>
                <span className="font-medium text-right truncate max-w-[220px]">
                  {confirmedOrder.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">পেমেন্ট মাধ্যম</span>
                <span className="font-semibold">{PAYMENT_LABELS[confirmedOrder.paymentMethod]}</span>
              </div>
              {confirmedOrder.paymentDetails && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">রেফারেন্স</span>
                  <span className="font-mono-num text-xs font-semibold text-[#141518]">
                    {confirmedOrder.paymentDetails}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">ডেলিভারি এলাকা</span>
                <span className="font-semibold">
                  {confirmedOrder.zone === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="font-semibold text-[#141518]">মোট পরিশোধযোগ্য</span>
                <span className="font-mono-num font-bold text-base text-[#b87e06]">
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
                className="flex-1 min-h-[46px] rounded-xl bg-[#141518] text-white font-bold text-sm hover:bg-[#b87e06] transition-colors"
              >
                অর্ডার ট্র্যাক #{confirmedOrder.id}
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 min-h-[46px] rounded-xl border border-neutral-200 font-semibold text-sm text-[#141518] hover:bg-neutral-50"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#141518] font-medium truncate pr-2">
                    {product.name} × {quantity}
                  </span>
                  <span className="font-mono-num font-semibold shrink-0">
                    ৳{(product.price * quantity).toLocaleString('en-US')}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-mono-num font-semibold">৳{deliveryFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-xs text-[#12a800] font-semibold">
                  <span>কুপন ছাড় ({appliedCoupon?.code})</span>
                  <span className="font-mono-num">-৳{discount.toLocaleString('en-US')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold text-[#141518]">
                <span>সর্বমোট</span>
                <span className="font-mono-num text-base text-[#b87e06]">
                  ৳{total.toLocaleString('en-US')}
                </span>
              </div>

              {coupons.some((c) => c.active) && (
                <div className="pt-2 border-t border-neutral-200/70">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-white border border-neutral-300 rounded-xl px-2.5 h-9">
                      <Tag className="w-3.5 h-3.5 text-neutral-400 mr-1.5 shrink-0" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="কুপন কোড থাকলে লিখুন"
                        className="w-full text-xs font-mono-num uppercase outline-none bg-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 h-9 rounded-xl bg-[#141518] hover:bg-[#b87e06] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      প্রয়োগ
                    </button>
                  </div>
                  {couponFeedback && (
                    <div
                      className={`text-[11px] font-medium mt-1 ${
                        appliedCoupon ? 'text-[#12a800]' : 'text-red-600'
                      }`}
                    >
                      {couponFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  পূর্ণ নাম
                </label>
                <div className="flex items-center border border-neutral-300 rounded-xl px-3 h-11 focus-within:border-[#c98e0b]">
                  <User className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  মোবাইল নম্বর
                </label>
                <div className="flex items-center border border-neutral-300 rounded-xl px-3 h-11 focus-within:border-[#c98e0b]">
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
                  সম্পূর্ণ ডেলিভারি ঠিকানা
                </label>
                <div className="flex items-start border border-neutral-300 rounded-xl px-3 py-2.5 focus-within:border-[#c98e0b]">
                  <MapPin className="w-4 h-4 text-neutral-400 mr-2.5 mt-0.5 shrink-0" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাসা, রোড, এলাকা, জেলা"
                    className="w-full text-sm outline-none bg-transparent resize-none"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  ডেলিভারি এলাকা
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setZone('dhaka')}
                    className={`min-h-[42px] rounded-xl border text-xs font-semibold px-3 flex items-center justify-center gap-1.5 transition-colors ${
                      zone === 'dhaka'
                        ? 'border-[#c98e0b] bg-[#c98e0b]/10 text-[#b87e06]'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    ঢাকার ভেতরে (৳{dhakaFee})
                  </button>
                  <button
                    type="button"
                    onClick={() => setZone('outside')}
                    className={`min-h-[42px] rounded-xl border text-xs font-semibold px-3 flex items-center justify-center gap-1.5 transition-colors ${
                      zone === 'outside'
                        ? 'border-[#c98e0b] bg-[#c98e0b]/10 text-[#b87e06]'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    ঢাকার বাইরে (৳{outsideFee})
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  পেমেন্ট মাধ্যম নির্বাচন করুন
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availablePayments.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setError('');
                      }}
                      className={`min-h-[42px] rounded-xl border text-xs font-semibold px-2.5 flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-[#141518] bg-[#141518] text-white'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {method.id === 'card' && <CreditCard className="w-3.5 h-3.5 shrink-0" />}
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isMobileWallet && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#141518]">
                    <Smartphone className="w-4 h-4 text-[#b87e06]" />
                    <span>
                      {PAYMENT_LABELS[paymentMethod]}{' '}
                      {settings?.merchantWallets?.[
                        paymentMethod as 'bkash' | 'nagad' | 'rocket'
                      ]
                        ? `(${settings.merchantWallets[paymentMethod as 'bkash' | 'nagad' | 'rocket']}) `
                        : ''}
                      নম্বরে ৳{total.toLocaleString('en-US')} পাঠিয়ে তথ্য দিন:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="tel"
                      value={walletSender}
                      onChange={(e) => setWalletSender(e.target.value)}
                      placeholder="প্রেরকের নম্বর (01XXXXXXXXX)"
                      className="h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm font-mono-num outline-none focus:border-[#c98e0b]"
                    />
                    <input
                      type="text"
                      value={walletTrxId}
                      onChange={(e) => setWalletTrxId(e.target.value)}
                      placeholder="ট্রানজেকশন আইডি (TrxID)"
                      className="h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm font-mono-num uppercase outline-none focus:border-[#c98e0b]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#141518]">
                    <CreditCard className="w-4 h-4 text-[#b87e06]" />
                    <span>ডেবিট / ক্রেডিট কার্ড (ভিসা, মাস্টারকার্ড, নেক্সাসপে)</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="কার্ড নম্বর (যেমন: 4242 •••• •••• 4242)"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm font-mono-num outline-none focus:border-[#c98e0b]"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm font-mono-num outline-none focus:border-[#c98e0b]"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm font-mono-num outline-none focus:border-[#c98e0b]"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-[#e2ae32] to-[#c98e0b] hover:from-[#ecc04c] hover:to-[#d99b12] text-[#141518] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>অর্ডার নিশ্চিত করুন · ৳{total.toLocaleString('en-US')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
