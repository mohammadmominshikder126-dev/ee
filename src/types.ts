export type CategoryKey =
  | 'All'
  | 'Toys'
  | 'Gadgets'
  | 'Home Decor'
  | 'Camera'
  | 'Accessories';

export type NavTab = 'home' | 'shop' | 'cart' | 'login';

export interface Product {
  id: string;
  name: string;
  category: Exclude<CategoryKey, 'All'>;
  price: number;
  oldPrice: number;
  discountLabel: string;
  isFlashBadge?: boolean;
  image: string;
  sold: number;
  left: number;
  shortDesc: string;
  specs: string[];
  badgeNote?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  zone: 'dhaka' | 'outside';
  paymentMethod: PaymentMethod;
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
  status: 'Order Placed' | 'Confirmed' | 'Dispatched' | 'Delivered';
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
  productSubtitle?: string;
  timeAgo: string;
  image: string;
}
