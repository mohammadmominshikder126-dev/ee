import { ChevronLeft, ChevronRight, Home, ShoppingBag, Store, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CartPageView } from './components/CartPageView';
import { CheckoutModal } from './components/CheckoutModal';
import { ComplaintModal } from './components/ComplaintModal';
import { FlashSaleBanner } from './components/FlashSaleBanner';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { MobileDrawer } from './components/MobileDrawer';
import { NoticeBar } from './components/NoticeBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SupportChatWidget } from './components/SupportChatWidget';
import { TrackOrderModal } from './components/TrackOrderModal';
import { VerifiedOrderToast } from './components/VerifiedOrderToast';
import { CATEGORIES, PRODUCTS, VERIFIED_PURCHASES } from './data/products';
import {
  CartItem,
  CartProfile,
  CategoryKey,
  CustomerUser,
  NavTab,
  OrderRecord,
  Product,
} from './types';

const STORAGE_CART_KEY = 'aponjon_cart_v1';
const STORAGE_ORDERS_KEY = 'aponjon_orders_v1';
const STORAGE_USER_KEY = 'aponjon_user_v1';
const STORAGE_CART_PROFILE_KEY = 'aponjon_cart_profile_v1';

const PAGE_ORDER: NavTab[] = ['home', 'shop', 'cart', 'login'];
const PAGE_LABELS: Record<NavTab, string> = {
  home: 'Home',
  shop: 'Shop',
  cart: 'Cart',
  login: 'Login',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_CART_KEY, []));
  const [cartProfile, setCartProfile] = useState<CartProfile | null>(() =>
    readStorage(STORAGE_CART_PROFILE_KEY, null)
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() => readStorage(STORAGE_ORDERS_KEY, []));
  const [user, setUser] = useState<CustomerUser | null>(() => readStorage(STORAGE_USER_KEY, null));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackInitialId, setTrackInitialId] = useState<string | undefined>(undefined);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [checkoutDirect, setCheckoutDirect] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [toastDismissed, setToastDismissed] = useState(false);
  const [toastIndex, setToastIndex] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number; skip: boolean } | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (cartProfile) {
        window.localStorage.setItem(STORAGE_CART_PROFILE_KEY, JSON.stringify(cartProfile));
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [cartProfile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [user]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setToastIndex((idx) => (idx + 1) % VERIFIED_PURCHASES.length);
      setToastDismissed(false);
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.shortDesc.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const navigateToTab = (target: NavTab) => {
    if (target === activeTab) return;
    const currentIdx = PAGE_ORDER.indexOf(activeTab);
    const nextIdx = PAGE_ORDER.indexOf(target);
    setSlideDirection(nextIdx > currentIdx ? 1 : -1);
    setActiveTab(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const slideRelative = (step: -1 | 1) => {
    const currentIdx = PAGE_ORDER.indexOf(activeTab);
    const nextIdx = (currentIdx + step + PAGE_ORDER.length) % PAGE_ORDER.length;
    setSlideDirection(step);
    setActiveTab(PAGE_ORDER[nextIdx]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement | null;
    const skip = Boolean(target?.closest('[data-no-swipe="true"]'));
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      skip,
    };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (!touchStartRef.current || touchStartRef.current.skip || e.changedTouches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.35) {
      if (dx < 0) {
        slideRelative(1);
      } else {
        slideRelative(-1);
      }
    }
  };

  const handleSelectCategory = (cat: CategoryKey) => {
    setSelectedCategory(cat);
    navigateToTab('shop');
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderNow = (product: Product, quantity = 1) => {
    setCheckoutItems([{ product, quantity }]);
    setCheckoutDirect(true);
    setCheckoutOpen(true);
  };

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutItems(cart);
    setCheckoutDirect(false);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleOrderCreated = (order: OrderRecord, clearedFromCart: boolean) => {
    setOrders((prev) => [order, ...prev]);
    if (clearedFromCart) {
      setCart([]);
    }
  };

  const handleOpenTrackOrder = (orderId?: string) => {
    setTrackInitialId(orderId);
    setTrackOpen(true);
  };

  const currentToast =
    !toastDismissed && activeTab !== 'login' ? VERIFIED_PURCHASES[toastIndex] : null;

  const renderProductGrid = () => (
    <section id="products" aria-label="Product catalog">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div
          data-no-swipe="true"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#141518] text-[#f0be4d] border border-[#141518]'
                    : 'bg-white text-neutral-600 hover:text-[#141518] border border-[#e6e0d2]'
                }`}
              >
                {cat === 'All' ? 'All Products' : cat}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-medium text-neutral-500 font-mono-num shrink-0">
          Showing {filteredProducts.length} gadget
          {filteredProducts.length === 1 ? '' : 's'}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
          <h2 className="font-display text-lg font-bold text-[#141518]">
            No matching products found
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Try clearing your search filter or browsing another gadget category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#b87e06] text-white text-sm font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOrderNow={(p) => handleOrderNow(p, 1)}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onSelectProduct={(p) => setDetailProduct(p)}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-dvh flex flex-col bg-[#f6f5f1] text-[#141518] pb-24 md:pb-12">
      <NoticeBar visible={noticeVisible} onDismiss={() => setNoticeVisible(false)} />

      <Header
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (activeTab === 'login' || activeTab === 'cart') {
            navigateToTab('shop');
          }
        }}
        onSearchSubmit={() => navigateToTab('shop')}
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenCart={() => navigateToTab('cart')}
        onNavigateHome={() => {
          setSelectedCategory('All');
          navigateToTab('home');
        }}
        onSelectCategory={handleSelectCategory}
        selectedCategory={selectedCategory}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenLogin={() => navigateToTab('login')}
        userName={user?.name}
      />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-3">
        <div className="bg-white border border-[#e6e0d2] rounded-2xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-2xs">
          <button
            type="button"
            onClick={() => slideRelative(-1)}
            aria-label="Slide left to previous page"
            className="w-9 h-9 rounded-xl bg-[#f6f5f1] hover:bg-[#eae4d6] text-[#141518] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto" data-no-swipe="true">
            {PAGE_ORDER.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => navigateToTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#141518] text-[#f0be4d]'
                      : 'text-neutral-600 hover:text-[#141518] hover:bg-[#f6f5f1]'
                  }`}
                >
                  {tab === 'cart' && cartCount > 0
                    ? `Cart (${cartCount})`
                    : tab === 'login' && user
                      ? 'Account'
                      : PAGE_LABELS[tab]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => slideRelative(1)}
            aria-label="Slide right to next page"
            className="w-9 h-9 rounded-xl bg-[#f6f5f1] hover:bg-[#eae4d6] text-[#141518] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 overflow-x-hidden"
      >
        <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
          <motion.div
            key={activeTab}
            custom={slideDirection}
            initial={{ opacity: 0, x: slideDirection > 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -48 : 48 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <>
                <FlashSaleBanner onViewAll={() => navigateToTab('shop')} />
                {renderProductGrid()}
              </>
            )}

            {activeTab === 'shop' && renderProductGrid()}

            {activeTab === 'cart' && (
              <CartPageView
                items={cart}
                profile={cartProfile}
                onSaveProfile={(prof) => setCartProfile(prof)}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCartCheckout}
                onContinueShopping={() => navigateToTab('shop')}
              />
            )}

            {activeTab === 'login' && (
              <div className="py-2 sm:py-4">
                <LoginView
                  user={user}
                  orders={orders}
                  onLogin={(loggedInUser) => setUser(loggedInUser)}
                  onLogout={() => setUser(null)}
                  onTrackOrder={(orderId) => handleOpenTrackOrder(orderId)}
                  onBackToShop={() => navigateToTab('home')}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-10 pb-4 text-center">
        <div className="inline-flex items-center justify-center bg-[#141518] text-[#f0be4d] rounded-full px-8 py-2.5 text-sm font-bold tracking-wide shadow-sm">
          Apon jon e-shop
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500">
          <button
            type="button"
            onClick={() => handleOpenTrackOrder()}
            className="hover:text-[#141518]"
          >
            Track Order
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setComplaintOpen(true)}
            className="hover:text-[#141518]"
          >
            Complaint Desk
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => navigateToTab('login')}
            className="hover:text-[#141518]"
          >
            Customer Account
          </button>
        </div>
      </footer>

      <VerifiedOrderToast
        purchase={currentToast}
        onDismiss={() => setToastDismissed(true)}
        onSelectProductId={(productId) => {
          const found = PRODUCTS.find((p) => p.id === productId);
          if (found) setDetailProduct(found);
        }}
      />

      <SupportChatWidget />

      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#e6e0d2] shadow-[0_-4px_18px_rgba(0,0,0,0.06)] grid grid-cols-4 items-center z-40"
      >
        <button
          type="button"
          onClick={() => navigateToTab('home')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            activeTab === 'home' ? 'text-[#141518] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-[#141518]' : ''}`} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTab('shop')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            activeTab === 'shop' ? 'text-[#141518] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Shop</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTab('cart')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] relative ${
            activeTab === 'cart' ? 'text-[#141518] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="font-mono-num absolute -top-1.5 -right-2 bg-[#c98e0b] text-[#141518] text-[9px] font-extrabold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTab('login')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            activeTab === 'login' ? 'text-[#141518] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{user ? 'Account' : 'Login'}</span>
        </button>
      </nav>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigateHome={() => {
          setSelectedCategory('All');
          navigateToTab('home');
        }}
        onSelectCategory={handleSelectCategory}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenComplaint={() => setComplaintOpen(true)}
        onOpenAccount={() => navigateToTab('login')}
      />

      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onOrderNow={handleOrderNow}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        profile={cartProfile}
        onSaveProfile={(prof) => setCartProfile(prof)}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCartCheckout}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
        cartProfile={cartProfile}
        onClose={() => setCheckoutOpen(false)}
        onOrderCreated={handleOrderCreated}
        isDirectOrder={checkoutDirect}
        onTrackOrder={(orderId) => handleOpenTrackOrder(orderId)}
      />

      <TrackOrderModal
        open={trackOpen}
        initialOrderId={trackInitialId}
        orders={orders}
        onClose={() => setTrackOpen(false)}
      />

      <ComplaintModal open={complaintOpen} onClose={() => setComplaintOpen(false)} />
    </div>
  );
}
