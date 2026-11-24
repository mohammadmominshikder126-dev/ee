import { CheckCircle2, Globe2, Info, PackageCheck, ShieldCheck, Truck, X } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface AboutCompanyModalProps {
  open: boolean;
  onClose: () => void;
  settings?: WebsiteSettings;
}

export function AboutCompanyModal({ open, onClose, settings }: AboutCompanyModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="আমাদের সম্পর্কে জানুন"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#ebe6da] bg-[#141518] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-[#f0be4d]" />
            <h2 className="font-display text-lg font-bold text-[#fffdf7]">আমাদের সম্পর্কে জানুন</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#faf8f2] border border-[#e6dfc9]">
            <span className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d49b1a] bg-[#121316] shrink-0 shadow-sm flex items-center justify-center">
              <img
                src={settings?.logoUrl || '/assets/aistudio/Screenshot_20261124-231551_28c4b6f8.jpg'}
                alt="আপনজন ই-শপ লোগো"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center scale-[1.08]"
              />
            </span>
            <div>
              <h3 className="font-display text-xl font-extrabold text-[#141518]">
                <span className="text-[#b87e06]">{settings?.brandPrimary || 'আপনজন'} </span>
                {settings?.brandSecondary || 'ই-শপ'}
              </h3>
              <p className="text-xs font-semibold text-neutral-600 mt-0.5">
                {settings?.aboutSubTagline || 'Your Trust • Our Promiss'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                সরাসরি আমদানিকৃত লাইটিং, গ্যাজেট ও সিরামিক আইটেম
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-neutral-700 leading-relaxed bg-[#faf8f2] border border-[#e6dfc9] rounded-2xl p-4">
            <p>
              {settings?.aboutBodyOne ||
                '🇨🇳 আমরা সরাসরি চীন থেকে বিভিন্ন ধরনের ইউনিক পণ্য, স্মার্ট গ্যাজেট, হোম ডেকোর ও আকর্ষণীয় গিফট আইটেম আমদানি করি। আমাদের লক্ষ্য হলো গ্রাহকদের কাছে প্রিমিয়াম কোয়ালিটির পণ্য সাশ্রয়ী ও যুক্তিসংগত মূল্যে পৌঁছে দেওয়া।'}
            </p>
            <p>
              {settings?.aboutBodyTwo ||
                'অসংখ্য সন্তুষ্ট কাস্টমারের ভালোবাসা, বিশ্বাস ও ইতিবাচক রিভিউ নিয়ে এগিয়ে চলছে আমাদের পথচলা। প্রতিটি গ্রাহকের সন্তুষ্টি ও আস্থা অর্জন করাই আমাদের প্রধান অঙ্গীকার।'}
            </p>
            <div className="pt-2 border-t border-[#e6dfc9]">
              <p className="font-display font-extrabold text-[#141518] text-base">
                {settings?.brandPrimary || 'আপনজন'} E-Shop
              </p>
              <p className="text-xs font-bold text-[#b87e06] mt-0.5">
                {settings?.aboutSubTagline || 'Your Trust • Our Promiss'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-[#ebe6da] bg-[#faf9f6] flex items-start gap-3">
              <Globe2 className="w-5 h-5 text-[#b87e06] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#141518]">দেশের বাইরে থেকে সরাসরি অর্ডার</div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  চায়নাসহ আন্তর্জাতিক নির্ভরযোগ্য সাপ্লায়ারদের কাছ থেকে সরাসরি পণ্য আনা হয়।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#ebe6da] bg-[#faf9f6] flex items-start gap-3">
              <PackageCheck className="w-5 h-5 text-[#b87e06] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#141518]">একদম ফ্রেশ কন্ডিশন</div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  প্রতিটি প্রোডাক্ট ইনট্যাক্ট বক্স ও একদম ফ্রেশ কন্ডিশনে ডেলিভারি করা হয়।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#ebe6da] bg-[#faf9f6] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#b87e06] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#141518]">১০০% কোয়ালিটি নিশ্চয়তা</div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  প্যাকেট করার আগে প্রতিটি পণ্যের মান ও কার্যকারিতা যাচাই করা হয়।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#ebe6da] bg-[#faf9f6] flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#b87e06] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#141518]">সারা দেশে দ্রুত ডেলিভারি</div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট ও কার্ড পেমেন্টের সহজ সুবিধা।
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e6dfc9] bg-[#faf8f2] p-4 space-y-2 text-xs text-neutral-700">
            <div className="flex items-center gap-2 font-bold text-[#141518]">
              <CheckCircle2 className="w-4 h-4 text-[#12a800]" />
              <span>
                হেল্পলাইন ও হোয়াটসঅ্যাপ:{' '}
                <span className="font-mono-num">{settings?.aboutHelpline || '01619502669'}</span>
              </span>
            </div>
            <p className="text-neutral-600">
              যেকোনো পণ্যের বিস্তারিত জানতে বা প্রি-অর্ডার করতে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-[#e2ae32] to-[#c98e0b] hover:from-[#ecc04c] hover:to-[#d99b12] text-[#141518] font-extrabold text-sm transition-colors cursor-pointer"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
}
