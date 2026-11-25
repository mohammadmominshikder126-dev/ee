import { Eye, EyeOff, Lock, LogOut, Package, Smartphone, User } from 'lucide-react';
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
  const [name, setName] = useState('');
  const [phone10, setPhone10] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handlePhoneChange = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('880') && digits.length > 10) {
      digits = digits.slice(3);
    }
    if (digits.startsWith('0') && digits.length > 1) {
      digits = digits.slice(1);
    }
    setPhone10(digits.slice(0, 10));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = phone10.replace(/\D/g, '');
    if (!/^1[3-9]\d{8}$/.test(digits)) {
      setStatusMessage('আপনার সঠিক ১০ সংখ্যার বাংলাদেশি মোবাইল নম্বরটি দিন (যেমন: 17XXXXXXXX)।');
      return;
    }
    if (password.length < 4) {
      setStatusMessage('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।');
      return;
    }

    setStatusMessage('');
    setSubmitting(true);
    const formattedPhone = `0${digits}`;
    const displayName = name.trim() || `ক্রেতা (${formattedPhone})`;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone10: digits,
          password,
          confirmPassword,
          name: name.trim(),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { user?: CustomerUser };
        if (data.user) {
          onLogin(data.user);
          setSubmitting(false);
          return;
        }
      } else if (res.status !== 404 && res.status !== 405) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        if (errData.error) {
          setStatusMessage(errData.error);
          setSubmitting(false);
          return;
        }
      }
    } catch {
      // Static hosting fallback (Cloudflare Workers)
    }

    setSubmitting(false);
    onLogin({
      name: displayName,
      identifier: formattedPhone,
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
              <p className="text-xs text-neutral-500 font-mono-num">{user.identifier}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
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
                className="mt-3 px-5 py-2.5 rounded-xl bg-[#141518] text-white text-xs font-bold hover:bg-[#b87e06] transition-colors cursor-pointer"
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
                  className="w-full text-left p-3.5 rounded-2xl border border-neutral-200 hover:border-[#c98e0b] transition-colors flex items-center justify-between gap-3 cursor-pointer"
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
        <div className="w-12 h-12 rounded-2xl bg-[#141518] text-[#f0be4d] mx-auto mb-3 flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#141518]">মোবাইল নম্বর দিয়ে লগইন</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          শুধু বাংলাদেশি ১০ সংখ্যার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
        </p>
      </div>

      {statusMessage && (
        <div className="mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            আপনার নাম (ঐচ্ছিক)
          </label>
          <div className="flex items-center border border-neutral-300 rounded-xl px-3.5 h-11 focus-within:border-[#c98e0b]">
            <User className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#15803d] mb-1">
            আপনার ১০ সংখ্যার মোবাইল নম্বরটি দিন
          </label>
          <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden h-12 focus-within:border-[#c98e0b]">
            <span className="h-full px-3 bg-neutral-100 border-r border-neutral-200 text-xs font-bold text-[#141518] flex items-center gap-1 shrink-0 font-mono-num">
              <span>🇧🇩</span>
              <span>+880</span>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={phone10}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="1XXXXXXXXX"
              className="w-full px-3 text-sm font-mono-num font-semibold outline-none bg-transparent tracking-wider"
            />
            <span className="pr-3 text-[11px] font-mono-num font-bold text-neutral-400 shrink-0">
              {phone10.length}/10
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#141518] mb-1.5">পাসওয়ার্ড</label>
          <div className="flex items-center border border-neutral-300 rounded-xl px-3.5 h-12 focus-within:border-[#c98e0b]">
            <Lock className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড দিন"
              className="w-full text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#141518] mb-1.5">
            কনফার্ম পাসওয়ার্ড
          </label>
          <div className="flex items-center border border-neutral-300 rounded-xl px-3.5 h-12 focus-within:border-[#c98e0b]">
            <Lock className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="পুনরায় পাসওয়ার্ড লিখুন"
              className="w-full text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] rounded-xl bg-[#141518] hover:bg-[#b87e06] disabled:opacity-70 text-white font-bold text-sm transition-colors cursor-pointer"
        >
          {submitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
        </button>
      </form>
    </section>
  );
}
