import { BannerSlide, CouponCode, WebsiteSettings } from '../types';

export const DEFAULT_CATEGORIES: string[] = ['লাইটিং', 'গ্যাজেট', 'সিরামিক আইটেম'];

export const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'banner-1',
    src: '/assets/aistudio/IMG-20261125-WA0009_0d76ea15.jpg',
    alt: 'আপনজন E-Shop — ইউনিক গ্যাজেট, লাইটিং ও সিরামিক আইটেম ব্যানার ১',
    active: true,
  },
  {
    id: 'banner-2',
    src: '/assets/aistudio/IMG-20261125-WA0008_da046969.jpg',
    alt: 'আপনজন E-Shop — স্মার্ট গ্যাজেট ও প্রিমিয়াম কালেকশন ব্যানার ২',
    active: true,
  },
];

export const DEFAULT_COUPONS: CouponCode[] = [
  {
    id: 'cpn-1',
    code: 'APONJON10',
    discountType: 'percent',
    value: 10,
    minOrder: 1000,
    active: true,
  },
  {
    id: 'cpn-2',
    code: 'WELCOME100',
    discountType: 'flat',
    value: 100,
    minOrder: 1500,
    active: true,
  },
];

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  brandPrimary: 'আপনজন',
  brandSecondary: 'ই-শপ',
  tagline: 'আপনার বিশ্বাস • আমাদের অঙ্গীকার',
  logoUrl: '/assets/aistudio/Screenshot_20261124-231551_28c4b6f8.jpg',
  noticeText:
    'আপনার কাঙ্ক্ষিত প্রোডাক্ট খুঁজে না পেলে আমাদের আপনজন ই-শপ ফেসবুক পেজে নক করবেন। ওয়েবসাইটে সব প্রোডাক্ট দেখানো নাও হতে পারে। সেরা দামে পছন্দের পণ্য কিনুন',
  noticeEnabled: true,
  whatsappNumber: '8801619502669',
  whatsappMessage:
    'আসসালামু আলাইকুম আপনজন ই-শপ! আমি একটি প্রোডাক্ট সম্পর্কে জানতে / অর্ডার করতে চাই।',
  facebookUrl: 'https://www.facebook.com/',
  dhakaDeliveryFee: 60,
  outsideDeliveryFee: 120,
  flashSaleEnabled: true,
  flashSaleTitle: 'ফ্ল্যাশ সেল',
  flashSaleSubtitle: 'বিশেষ ছাড় — দ্রুত অর্ডার করুন!',
  liveToastEnabled: true,
  liveToastIntervalSec: 15,
  enabledPayments: {
    cod: true,
    bkash: true,
    nagad: true,
    rocket: true,
    card: true,
  },
  merchantWallets: {
    bkash: '01619502669',
    nagad: '01619502669',
    rocket: '01619502669',
  },
  aboutSubTagline: 'Your Trust • Our Promiss',
  aboutBodyOne:
    '🇨🇳 আমরা সরাসরি চীন থেকে বিভিন্ন ধরনের ইউনিক পণ্য, স্মার্ট গ্যাজেট, হোম ডেকোর ও আকর্ষণীয় গিফট আইটেম আমদানি করি। আমাদের লক্ষ্য হলো গ্রাহকদের কাছে প্রিমিয়াম কোয়ালিটির পণ্য সাশ্রয়ী ও যুক্তিসংগত মূল্যে পৌঁছে দেওয়া।',
  aboutBodyTwo:
    'অসংখ্য সন্তুষ্ট কাস্টমারের ভালোবাসা, বিশ্বাস ও ইতিবাচক রিভিউ নিয়ে এগিয়ে চলছে আমাদের পথচলা। প্রতিটি গ্রাহকের সন্তুষ্টি ও আস্থা অর্জন করাই আমাদের প্রধান অঙ্গীকার।',
  aboutHelpline: '01619502669',
  adminPinEnabled: false,
  adminPin: '1234',
};

export function toBengaliDigits(value: number | string): string {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/\d/g, (d) => digits[Number(d)] ?? d);
}

export function compressImageFile(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
