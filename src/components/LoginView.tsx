import { Eye, EyeOff, Lock, LogOut, Package, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CustomerUser, OrderRecord } from '../types';

interface LoginViewProps {
  user: CustomerUser | null;
  orders: OrderRecord[];
  onLogin: (user: CustomerUser) => void;
  onLogout: () => void;
  onTrackOrder: (orderId: string) => void;
  onBackToShop: () => void;
}

export function LoginView({
  user,
  orders,
  onLogin,
  onLogout,
  onTrackOrder,
  onBackToShop,
}: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setStatusMessage('দয়া করে আপনার মোবাইল নম্বর/ইমেইল ও পাসওয়ার্ড লিখুন।');
      return;
    }
    if (isRegister && !name.trim()) {
      setStatusMessage('অ্যাকাউন্ট খুলতে আপনার পুরো নাম লিখুন।');
      return;
    }
    setStatusMessage('');
    onLogin({
      name: isRegister ? name.trim() : identifier.trim().split('@')[0] || 'আপনজন ই-শপ ক্রেতা',
      identifier: identifier.trim(),
      provider: 'credentials',
    });
  };

  if (user) {
    return (
      <section className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_18px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#c98e0b]/15 text-[#b87e06] flex items-center justify-center font-display font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#141518]">{user.name}</h2>
              <p className="text-xs text-neutral-500">{user.identifier}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-bold text-[#141518] mb-3">
            আপনার সাম্প্রতিক অর্ডারসমূহ ({orders.length})
          </h3>
          {orders.length === 0 ? (
            <div className="rounded-2xl bg-neutral-50 border border-neutral-200/70 p-5 text-center">
              <Package className="w-7 h-7 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-600">এখনও কোনো অর্ডার করা হয়নি।</p>
              <button
                type="button"
                onClick={onBackToShop}
                className="mt-3 px-5 py-2.5 rounded-xl bg-[#141518] text-white text-xs font-bold hover:bg-[#b87e06] transition-colors"
              >
                ফ্ল্যাশ সেল দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onTrackOrder(order.id)}
                  className="w-full text-left p-3.5 rounded-2xl border border-neutral-200 hover:border-[#c98e0b] transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-mono-num text-sm font-bold text-[#141518]">
                      অর্ডার #{order.id}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {order.items.length} টি পণ্য · {order.status}
                    </div>
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[#b87e06]">
                    ৳{order.total.toLocaleString('en-US')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[460px] mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold text-[#141518]">
          {isRegister ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}
        </h2>
        <p className="text-sm text-neutral-500 mt-1.5">
          {isRegister
            ? 'অর্ডার ট্র্যাক ও দ্রুত চেকআউটের জন্য রেজিস্টার করুন'
            : 'আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন'}
        </p>
      </div>

      {statusMessage && (
        <div className="mb-4 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-sm font-semibold text-[#141518] mb-1.5">পূর্ণ নাম</label>
            <div className="flex items-center border border-neutral-300 rounded-xl px-3.5 h-12 focus-within:border-[#c98e0b]">
              <User className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পুরো নাম"
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-[#141518] mb-1.5">
            মোবাইল নম্বর বা ইমেইল
          </label>
          <div className="flex items-center border border-neutral-300 rounded-xl px-3.5 h-12 focus-within:border-[#c98e0b]">
            <User className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="01XXXXXXXXX অথবা email@example.com"
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#141518] mb-1.5">পাসওয়ার্ড</label>
          <div className="flex items-center border border-neutral-300 rounded-xl px-3.5 h-12 focus-within:border-[#c98e0b]">
            <Lock className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড দিন"
              className="w-full text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              className="text-neutral-400 hover:text-neutral-700 p-1.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#141518] rounded"
            />
            <span>মনে রাখুন</span>
          </label>
          <button
            type="button"
            onClick={() =>
              setStatusMessage(
                'পাসওয়ার্ড রিসেট করতে আপনার নিবন্ধিত 01XXXXXXXXX নম্বর দিন অথবা আমাদের অফিশিয়াল ফেসবুক পেজে মেসেজ করুন।'
              )
            }
            className="text-neutral-700 hover:text-[#b87e06] font-medium"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] rounded-xl bg-[#141518] hover:bg-[#b87e06] text-white font-bold text-sm transition-colors cursor-pointer"
        >
          {isRegister ? 'রেজিস্টার করুন' : 'লগইন করুন'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-neutral-400">
        <div className="flex-1 h-px bg-neutral-200" />
        <span>অথবা</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            onLogin({
              name: 'গুগল ক্রেতা',
              identifier: 'google.account@aponjon-eshop.com',
              provider: 'google',
            })
          }
          className="min-h-[44px] px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-sm font-medium text-[#141518] flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <span className="font-bold text-[#ea4335]">G</span>
          <span>গুগল দিয়ে লগইন</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onLogin({
              name: 'ফেসবুক ক্রেতা',
              identifier: 'fb.customer@aponjon-eshop.com',
              provider: 'facebook',
            })
          }
          className="min-h-[44px] px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-sm font-medium text-[#141518] flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <span className="font-bold text-[#1877f2]">f</span>
          <span>ফেসবুক দিয়ে লগইন</span>
        </button>
      </div>

      <p className="text-center text-sm text-neutral-600 mt-6">
        {isRegister ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : 'অ্যাকাউন্ট নেই?'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister((prev) => !prev);
            setStatusMessage('');
          }}
          className="font-bold text-[#141518] hover:text-[#b87e06]"
        >
          {isRegister ? 'লগইন করুন' : 'রেজিস্টার করুন'}
        </button>
      </p>
    </section>
  );
}
