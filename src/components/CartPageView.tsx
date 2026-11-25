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
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { CartItem, CartProfile } from '../types';

interface CartPageViewProps {
  items: CartItem[];
  profile: CartProfile | null;
  onSaveProfile: (profile: CartProfile) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartPageView({
  items,
  profile,
  onSaveProfile,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
}: CartPageViewProps) {
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

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!name.trim()) {
      setFormError('দয়া করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setFormError('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)।');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setFormError('দয়া করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
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
    <section className="max-w-3xl mx-auto space-y-5">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ebe6da] shadow-[0_4px_18px_rgba(18,19,22,0.05)]">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ebe6da]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#b87e06]" />
            <h2 className="font-display text-xl font-bold text-[#141518]">
              আপনার কার্ট ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={onContinueShopping}
            className="text-xs sm:text-sm font-semibold text-[#b87e06] hover:underline"
          >
            আরও পণ্য দেখুন
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-[#e6dfc9] bg-[#faf8f2] p-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  profile && !editingProfile ? 'text-[#12a800]' : 'text-[#b87e06]'
                }`}
              />
              <h3 className="font-display text-sm font-bold text-[#141518]">
                কার্ট রেজিস্ট্রেশন ও সেটআপ ফর্ম
              </h3>
            </div>
            {profile && !editingProfile && (
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="text-xs font-semibold text-[#b87e06] hover:underline"
              >
                পরিবর্তন করুন
              </button>
            )}
          </div>

          {profile && !editingProfile ? (
            <div className="text-xs sm:text-sm text-neutral-700 space-y-1">
              <div className="font-semibold text-[#141518]">{profile.name}</div>
              <div className="font-mono-num text-neutral-600">{profile.phone}</div>
              <div className="text-neutral-600">{profile.address}</div>
              <div className="pt-1 text-xs font-semibold text-[#12a800]">
                কার্ট সেটআপ সম্পন্ন হয়েছে — এখন সহজেই চেকআউট করতে পারবেন
              </div>
            </div>
          ) : (
            <form onSubmit={handleSetupSubmit} className="space-y-2.5">
              {formError && (
                <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center border border-[#dfd8c5] bg-white rounded-xl px-3 h-11 focus-within:border-[#c98e0b]">
                  <User className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পুরো নাম"
                    className="w-full text-sm outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center border border-[#dfd8c5] bg-white rounded-xl px-3 h-11 focus-within:border-[#c98e0b]">
                  <Phone className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
                    className="w-full text-sm outline-none bg-transparent font-mono-num"
                  />
                </div>
              </div>

              <div className="flex items-start border border-[#dfd8c5] bg-white rounded-xl px-3 py-2.5 focus-within:border-[#c98e0b]">
                <MapPin className="w-4 h-4 text-neutral-400 mr-2 mt-0.5 shrink-0" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ডেলিভারি ঠিকানা (বাসা, রোড, এলাকা, জেলা)"
                  className="w-full text-sm outline-none bg-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#141518] hover:bg-[#b87e06] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                সেভ ও কার্ট সেটআপ করুন
              </button>
            </form>
          )}
        </div>

        <div className="mt-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f4f1ea] flex items-center justify-center mb-3 text-[#b87e06]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-display text-base font-bold text-[#141518]">আপনার কার্ট খালি</h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xs">
                ডান-বাম স্লাইড করে পণ্য দেখুন এবং কার্ট আইকনে চাপ দিয়ে এখানে যোগ করুন।
              </p>
              <button
                type="button"
                onClick={onContinueShopping}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#141518] text-white text-xs sm:text-sm font-bold hover:bg-[#b87e06] transition-colors"
              >
                পণ্য দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ product, quantity, selectedColor }) => (
                <div
                  key={`${product.id}-${selectedColor || 'default'}`}
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
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[#141518] truncate">
                          {product.name}
                        </h4>
                        {selectedColor && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[#15803d]">
                            কালার: {selectedColor}
                          </span>
                        )}
                      </div>
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

              <div className="pt-4 border-t border-[#e8e3d6] space-y-3">
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <span>সর্বমোট (সাবটোটাল)</span>
                  <span className="font-mono-num font-bold text-lg text-[#141518]">
                    ৳{subtotal.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  ডেলিভারি চার্জ: ঢাকার ভেতরে ৳৬০ · ঢাকার বাইরে ৳১২০ (ক্যাশ অন ডেলিভারি / বিকাশ / নগদ / রকেট / কার্ড)
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
