export type CategoryKey = 'সব' | 'লাইটিং' | 'গ্যাজেট' | 'সিরাম আইটেম';

export type NavTab = 'home' | 'shop' | 'cart' | 'login';

export interface Product {
  id: string;
  name: string;
  category: Exclude<CategoryKey, 'সব'>;
  price: number;
  oldPrice: number;
  discountLabel: string;
  isFlashBadge?: boolean;
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
