import { Home, ShoppingBag, Store, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
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
import { CartItem, CategoryKey, CustomerUser, NavTab, OrderRecord, Product } from './types';

const STORAGE_CART_KEY = 'sobujbari_cart_v1';
const STORAGE_ORDERS_KEY = 'sobujbari_orders_v1';
const STORAGE_USER_KEY = 'sobujbari_user_v1';

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_CART_KEY, []));
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

  const productsSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

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

  const scrollToProducts = () => {
    setActiveTab('shop');
    window.requestAnimationFrame(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleSelectCategory = (cat: CategoryKey) => {
    setSelectedCategory(cat);
    setActiveTab('shop');
    window.requestAnimationFrame(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
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

  return (
    <div className="min-h-dvh flex flex-col bg-[#f4f4f7] text-[#171717] pb-24 md:pb-12">
      <NoticeBar visible={noticeVisible} onDismiss={() => setNoticeVisible(false)} />

      <Header
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (activeTab === 'login') setActiveTab('home');
        }}
        onSearchSubmit={scrollToProducts}
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onNavigateHome={() => {
          setActiveTab('home');
          setSelectedCategory('All');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
        selectedCategory={selectedCategory}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenLogin={() => setActiveTab('login')}
        userName={user?.name}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {activeTab === 'login' ? (
          <div className="py-2 sm:py-6">
            <LoginView
              user={user}
              orders={orders}
              onLogin={(loggedInUser) => setUser(loggedInUser)}
              onLogout={() => setUser(null)}
              onTrackOrder={(orderId) => handleOpenTrackOrder(orderId)}
              onBackToShop={() => setActiveTab('home')}
            />
          </div>
        ) : (
          <>
            <FlashSaleBanner onViewAll={scrollToProducts} />

            <section ref={productsSectionRef} id="products" aria-label="Product catalog">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#171717] text-white'
                            : 'bg-white text-neutral-600 hover:text-[#171717] border border-neutral-200/80'
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
                  <h2 className="font-display text-lg font-bold text-[#171717]">
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
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#12a800] text-white text-sm font-bold"
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
          </>
        )}
      </main>

      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-10 pb-4 text-center">
        <div className="inline-flex items-center justify-center bg-neutral-400/80 text-white rounded-full px-8 py-2.5 text-sm font-bold tracking-wide">
          E-shop
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500">
          <button
            type="button"
            onClick={() => handleOpenTrackOrder()}
            className="hover:text-[#171717]"
          >
            Track Order
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setComplaintOpen(true)}
            className="hover:text-[#171717]"
          >
            Complaint Desk
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="hover:text-[#171717]"
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
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-4px_18px_rgba(0,0,0,0.06)] grid grid-cols-4 items-center z-40"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            activeTab === 'home' ? 'text-[#171717] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-[#171717]' : ''}`} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={scrollToProducts}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            activeTab === 'shop' ? 'text-[#171717] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Shop</span>
        </button>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] relative ${
            cartOpen ? 'text-[#171717] font-bold' : 'text-neutral-500 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="font-mono-num absolute -top-1.5 -right-2 bg-[#12a800] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            activeTab === 'login' ? 'text-[#171717] font-bold' : 'text-neutral-500 font-medium'
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
          setActiveTab('home');
          setSelectedCategory('All');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenComplaint={() => setComplaintOpen(true)}
        onOpenAccount={() => setActiveTab('login')}
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
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCartCheckout}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
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
