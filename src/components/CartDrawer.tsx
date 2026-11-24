import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { CartItem, CartProfile } from '../types';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  profile: CartProfile | null;
  onSaveProfile: (profile: CartProfile) => void;
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  profile,
  onSaveProfile,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [editingProfile, setEditingProfile] = useState(!profile);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setAddress(profile.address);
    }
  }, [profile]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!name.trim()) {
      setFormError('দয়া করে আপনার নাম লিখুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setFormError('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)।');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setFormError('দয়া করে আপনার ডেলিভারি ঠিকানা লিখুন।');
      return;
    }
    setFormError('');
    onSaveProfile({
      name: name.trim(),
      phone: cleanPhone,
      address: address.trim(),
    });
    setEditingProfile(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="শপিং কার্ট"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#ebe6da] flex items-center justify-between bg-[#faf8f3]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#b87e06]" />
            <h2 className="font-display text-lg font-bold text-[#141518]">
              আপনার কার্ট ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="কার্ট বন্ধ করুন"
            className="w-10 h-10 rounded-xl bg-white border border-[#e6e0d2] hover:bg-neutral-100 flex items-center justify-center text-[#141518]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-2xl border border-[#e6dfc9] bg-[#faf8f2] p-4">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    profile && !editingProfile ? 'text-[#12a800]' : 'text-[#b87e06]'
                  }`}
                />
                <h3 className="font-display text-sm font-bold text-[#141518]">
                  কার্ট রেজিস্ট্রেশন ও সেটআপ
                </h3>
              </div>
              {profile && !editingProfile && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="text-xs font-semibold text-[#b87e06] hover:underline"
                >
                  পরিবর্তন
                </button>
              )}
            </div>

            {profile && !editingProfile ? (
              <div className="text-xs text-neutral-700 space-y-1">
                <div className="font-semibold text-[#141518]">{profile.name}</div>
                <div className="font-mono-num text-neutral-600">{profile.phone}</div>
                <div className="text-neutral-600">{profile.address}</div>
                <div className="pt-1 text-[11px] font-semibold text-[#12a800]">
                  কার্ট সেটআপ সম্পন্ন হয়েছে
                </div>
              </div>
            ) : (
              <form onSubmit={handleSetupSubmit} className="space-y-2.5">
                {formError && (
                  <div className="text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                    {formError}
                  </div>
                )}

                <div className="flex items-center border border-[#dfd8c5] bg-white rounded-xl px-3 h-10 focus-within:border-[#c98e0b]">
                  <User className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পুরো নাম"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center border border-[#dfd8c5] bg-white rounded-xl px-3 h-10 focus-within:border-[#c98e0b]">
                  <Phone className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent font-mono-num"
                  />
                </div>

                <div className="flex items-start border border-[#dfd8c5] bg-white rounded-xl px-3 py-2 focus-within:border-[#c98e0b]">
                  <MapPin className="w-4 h-4 text-neutral-400 mr-2 mt-0.5 shrink-0" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ডেলিভারি ঠিকানা (বাসা, রোড, এলাকা)"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[40px] rounded-xl bg-[#141518] hover:bg-[#b87e06] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  সেভ ও কার্ট সেটআপ করুন
                </button>
              </form>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f4f1ea] flex items-center justify-center mb-3 text-[#b87e06]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-display text-base font-bold text-[#141518]">আপনার কার্ট খালি</h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xs">
                ফ্ল্যাশ সেল থেকে পছন্দের পণ্য বেছে নিন এবং কার্ট আইকনে ট্যাপ করে যোগ করুন।
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#141518] text-white text-xs sm:text-sm font-bold hover:bg-[#b87e06] transition-colors"
              >
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-[#ebe6da] bg-[#faf9f6]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#141518] truncate">
                        {product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        aria-label={`${product.name} সরিয়ে ফেলুন`}
                        className="text-neutral-400 hover:text-red-600 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-mono-num text-sm font-bold text-[#b87e06] mt-1">
                      ৳{(product.price * quantity).toLocaleString('en-US')}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs text-neutral-500 font-mono-num">
                        প্রতি পিস ৳{product.price.toLocaleString('en-US')}
                      </span>
                      <div className="flex items-center border border-[#dfd8c5] bg-white rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, -1)}
                          aria-label="পরিমাণ কমান"
                          className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono-num font-bold">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, 1)}
                          aria-label="পরিমাণ বাড়ান"
                          className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-[#e8e3d6] bg-white space-y-3">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>সাবটোটাল</span>
              <span className="font-mono-num font-bold text-lg text-[#141518]">
                ৳{subtotal.toLocaleString('en-US')}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              ডেলিভারি: ঢাকার ভেতরে ৳৬০ · ঢাকার বাইরে ৳১২০ (ক্যাশ অন ডেলিভারি / বিকাশ / নগদ / রকেট / কার্ড)
            </p>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-[#e2ae32] to-[#c98e0b] hover:from-[#ecc04c] hover:to-[#d99b12] text-[#141518] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>চেকআউট করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
