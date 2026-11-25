export type CategoryKey = string;

export type NavTab = 'home' | 'shop' | 'cart' | 'login';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  discountLabel: string;
  isFlashBadge?: boolean;
  freeDelivery?: boolean;
  image: string;
  sold: number;
  left: number;
  shortDesc: string;
  specs: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartProfile {
  name: string;
  phone: string;
  address: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  zone: 'dhaka' | 'outside';
  paymentMethod: PaymentMethod;
  paymentDetails?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  status: 'অর্ডার গ্রহণ' | 'নিশ্চিত হয়েছে' | 'পাঠানো হয়েছে' | 'ডেলিভারি সম্পন্ন';
}

export interface CustomerUser {
  name: string;
  identifier: string;
  provider: 'credentials' | 'google' | 'facebook';
}

export interface VerifiedPurchase {
  id: string;
  buyer: string;
  productId: string;
  productName: string;
  timeAgo: string;
  image: string;
}

export interface BannerSlide {
  id: string;
  src: string;
  alt: string;
  active: boolean;
}

export interface CouponCode {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrder: number;
  active: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  identifier: string;
  address?: string;
  joinedAt: string;
  status: 'সক্রিয়' | 'ব্লকড';
  source: 'রেজিস্ট্রেশন' | 'অর্ডার' | 'কার্ট' | 'এডমিন';
}

export interface ComplaintTicket {
  id: string;
  orderRef?: string;
  phone: string;
  message: string;
  createdAt: string;
  status: 'নতুন' | 'সমাধান হয়েছে';
}

export interface VisitorEntry {
  id: string;
  timestamp: string;
  dateKey: string;
  device: 'মোবাইল' | 'ডেস্কটপ';
  page: string;
  referrer: string;
}

export interface WebsiteSettings {
  brandPrimary: string;
  brandSecondary: string;
  tagline: string;
  logoUrl: string;
  noticeText: string;
  noticeEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  facebookUrl: string;
  dhakaDeliveryFee: number;
  outsideDeliveryFee: number;
  flashSaleEnabled: boolean;
  flashSaleTitle: string;
  flashSaleSubtitle: string;
  liveToastEnabled: boolean;
  liveToastIntervalSec: number;
  enabledPayments: Record<PaymentMethod, boolean>;
  merchantWallets: {
    bkash: string;
    nagad: string;
    rocket: string;
  };
  aboutSubTagline: string;
  aboutBodyOne: string;
  aboutBodyTwo: string;
  aboutHelpline: string;
  adminPinEnabled: boolean;
  adminPin: string;
}
