import {
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  CloudUpload,
  Crown,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FolderPlus,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquareWarning,
  Package,
  PieChart,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { compressImageFile, toBengaliDigits } from '../../data/storeDefaults';
import {
  BannerSlide,
  ComplaintTicket,
  CouponCode,
  ManagedUser,
  OrderRecord,
  PaymentMethod,
  Product,
  VisitorEntry,
  WebsiteSettings,
} from '../../types';
import { MiniSparkline, OrderStatusDonut, SalesAreaChart, SalesPoint } from './AdminCharts';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'categories'
  | 'coupons'
  | 'users'
  | 'settings'
  | 'banners'
  | 'visitors'
  | 'security';

interface AdminPanelProps {
  products: Product[];
  onSaveProducts: (next: Product[]) => void;
  categories: string[];
  onSaveCategories: (next: string[]) => void;
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  coupons: CouponCode[];
  onSaveCoupons: (next: CouponCode[]) => void;
  users: ManagedUser[];
  onSaveUsers: (next: ManagedUser[]) => void;
  banners: BannerSlide[];
  onSaveBanners: (next: BannerSlide[]) => void;
  settings: WebsiteSettings;
  onSaveSettings: (next: WebsiteSettings) => void;
  onResetSettings: () => void;
  visitors: VisitorEntry[];
  onClearVisitors: () => void;
  complaints: ComplaintTicket[];
  onToggleComplaintStatus: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonText: string) => boolean;
  onExitAdmin: () => void;
}

const ORDER_STATUSES: OrderRecord['status'][] = [
  'অর্ডার গ্রহণ',
  'নিশ্চিত হয়েছে',
  'পাঠানো হয়েছে',
  'ডেলিভারি সম্পন্ন',
];

function getStatusPillClass(status: OrderRecord['status']) {
  switch (status) {
    case 'ডেলিভারি সম্পন্ন':
      return 'bg-[#dcfce7] text-[#15803d]';
    case 'পাঠানো হয়েছে':
    case 'নিশ্চিত হয়েছে':
      return 'bg-[#fef3c7] text-[#b45309]';
    default:
      return 'bg-[#dbeafe] text-[#1d4ed8]';
  }
}

function getStatusShortLabel(status: OrderRecord['status']) {
  switch (status) {
    case 'ডেলিভারি সম্পন্ন':
      return 'সম্পন্ন';
    case 'পাঠানো হয়েছে':
    case 'নিশ্চিত হয়েছে':
      return 'প্রসেসিং';
    default:
      return 'পেন্ডিং';
  }
}

export function AdminPanel({
  products,
  onSaveProducts,
  categories,
  onSaveCategories,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  coupons,
  onSaveCoupons,
  users,
  onSaveUsers,
  banners,
  onSaveBanners,
  settings,
  onSaveSettings,
  onResetSettings,
  visitors,
  onClearVisitors,
  complaints,
  onToggleComplaintStatus,
  onExportBackup,
  onImportBackup,
  onExitAdmin,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [salesRange, setSalesRange] = useState<'month' | 'week' | 'today'>('month');
  const [toastMsg, setToastMsg] = useState('');

  // Product form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pCat, setPCat] = useState(categories[0] || 'গ্যাজেট');
  const [pPrice, setPPrice] = useState('');
  const [pOldPrice, setPOldPrice] = useState('');
  const [pDiscount, setPDiscount] = useState('');
  const [pImage, setPImage] = useState('');
  const [pLeft, setPLeft] = useState('50');
  const [pFlash, setPFlash] = useState(true);
  const [pFreeDelivery, setPFreeDelivery] = useState(false);
  const [pDesc, setPDesc] = useState('');
  const [pSpecs, setPSpecs] = useState('');

  // Order filter state
  const [orderFilter, setOrderFilter] = useState<string>('সব');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [renamingCat, setRenamingCat] = useState<{ old: string; next: string } | null>(null);

  // Coupon state
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percent' | 'flat'>('percent');
  const [cVal, setCVal] = useState('');
  const [cMin, setCMin] = useState('500');

  // Banner state
  const [bSrc, setBSrc] = useState('');
  const [bAlt, setBAlt] = useState('');

  // User add state
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');

  // Settings local draft
  const [draftSettings, setDraftSettings] = useState<WebsiteSettings>(settings);

  // Security PIN unlock state
  const [pinVerified, setPinVerified] = useState(!settings.adminPinEnabled);
  const [pinAttempt, setPinAttempt] = useState('');
  const [pinError, setPinError] = useState('');
  const [newPin, setNewPin] = useState(settings.adminPin);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2800);
  };

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayVisitorsCount = useMemo(
    () => visitors.filter((v) => v.dateKey === todayKey).length,
    [visitors, todayKey]
  );

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const orderStatusCounts = useMemo(() => {
    let completed = 0;
    let processing = 0;
    let pending = 0;
    orders.forEach((o) => {
      if (o.status === 'ডেলিভারি সম্পন্ন') completed += 1;
      else if (o.status === 'নিশ্চিত হয়েছে' || o.status === 'পাঠানো হয়েছে') processing += 1;
      else pending += 1;
    });
    return { completed, processing, pending };
  }, [orders]);

  const salesChartData: SalesPoint[] = useMemo(() => {
    if (salesRange === 'today') {
      return [
        { label: 'সকাল', amount: Math.max(850, Math.round(totalRevenue * 0.15)) },
        { label: 'দুপুর', amount: Math.max(1650, Math.round(totalRevenue * 0.25)) },
        { label: 'বিকাল', amount: Math.max(2400, Math.round(totalRevenue * 0.35)) },
        { label: 'সন্ধ্যা', amount: Math.max(3100, Math.round(totalRevenue * 0.45)) },
        { label: 'রাত', amount: Math.max(2800, totalRevenue || 2800) },
      ];
    }
    if (salesRange === 'week') {
      return [
        { label: 'শনি', amount: 1800 },
        { label: 'রবি', amount: 2450 },
        { label: 'সোম', amount: 2100 },
        { label: 'মঙ্গল', amount: 3200 },
        { label: 'বুধ', amount: 2890 },
        { label: 'বৃহঃ', amount: 3850 },
        { label: 'আজ', amount: Math.max(3400, totalRevenue) },
      ];
    }
    return [
      { label: '১ দিন', amount: 950 },
      { label: '৫ দিন', amount: 1620 },
      { label: '১০ দিন', amount: 2150 },
      { label: '১৫ দিন', amount: 2050 },
      { label: '২০ দিন', amount: 2950 },
      { label: '২৫ দিন', amount: 2420 },
      { label: 'আজ', amount: Math.max(3350, totalRevenue) },
    ];
  }, [salesRange, totalRevenue]);

  const formattedBanglaDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return todayKey;
    }
  }, [todayKey]);

  const unreadAlertsCount =
    orders.filter((o) => o.status === 'অর্ডার গ্রহণ').length +
    complaints.filter((c) => c.status === 'নতুন').length;

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'প্রোডাক্ট আপলোড', icon: CloudUpload },
    { id: 'orders', label: 'অর্ডার ম্যানেজমেন্ট', icon: ShoppingCart },
    { id: 'categories', label: 'ক্যাটাগরি ম্যানেজ', icon: FolderPlus },
    { id: 'coupons', label: 'কুপন কোড', icon: Tag },
    { id: 'users', label: 'ইউজার ম্যানেজ', icon: Users },
    { id: 'settings', label: 'সাইট সেটিংস', icon: Settings },
    { id: 'banners', label: 'ব্যানার ম্যানেজ', icon: ImageIcon },
    { id: 'visitors', label: 'ভিজিটর রিপোর্ট', icon: BarChart3 },
    { id: 'security', label: 'নিরাপত্তা সেটিংস', icon: Shield },
  ];

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    setter: (dataUrl: string) => void,
    maxWidth = 1000
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, maxWidth, 0.82);
      setter(compressed);
      showToast('ছবি সফলভাবে আপলোড হয়েছে।');
    } catch {
      showToast('ছবি প্রসেস করতে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।');
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setPName('');
    setPCat(categories[0] || 'গ্যাজেট');
    setPPrice('');
    setPOldPrice('');
    setPDiscount('');
    setPImage('');
    setPLeft('50');
    setPFlash(true);
    setPFreeDelivery(false);
    setPDesc('');
    setPSpecs('');
  };

  const handleProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = Number(pPrice);
    const oldNum = Number(pOldPrice) || priceNum;
    if (!pName.trim() || !priceNum || priceNum <= 0) {
      showToast('দয়া করে পণ্যের নাম এবং সঠিক মূল্য লিখুন।');
      return;
    }
    const pct =
      oldNum > priceNum ? Math.round(((oldNum - priceNum) / oldNum) * 100) : 0;
    const autoDiscount =
      pDiscount.trim() || (pct > 0 ? `${toBengaliDigits(pct)}% ছাড়` : 'নতুন কালেকশন');
    const specsArr = pSpecs
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newProd: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: pName.trim(),
      category: pCat || categories[0] || 'গ্যাজেট',
      price: priceNum,
      oldPrice: oldNum,
      discountLabel: autoDiscount,
      isFlashBadge: pFlash,
      freeDelivery: pFreeDelivery,
      image: pImage.trim() || '/src/assets/images/product_galaxy_projector_1795539283222.jpg',
      sold: editingProductId
        ? products.find((p) => p.id === editingProductId)?.sold ?? 0
        : 0,
      left: Math.max(0, Number(pLeft) || 20),
      shortDesc: pDesc.trim() || 'প্রিমিয়াম কোয়ালিটি আমদানিকৃত পণ্য।',
      specs:
        specsArr.length > 0
          ? specsArr
          : ['সরাসরি আমদানিকৃত ১০০% ফ্রেশ প্রোডাক্ট', 'ক্যাশ অন ডেলিভারি সুবিধা'],
    };

    if (editingProductId) {
      onSaveProducts(products.map((p) => (p.id === editingProductId ? newProd : p)));
      showToast('প্রোডাক্ট আপডেট করা হয়েছে!');
    } else {
      onSaveProducts([newProd, ...products]);
      showToast('নতুন প্রোডাক্ট সফলভাবে আপলোড হয়েছে!');
    }
    resetProductForm();
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPName(prod.name);
    setPCat(prod.category);
    setPPrice(String(prod.price));
    setPOldPrice(String(prod.oldPrice));
    setPDiscount(prod.discountLabel);
    setPImage(prod.image);
    setPLeft(String(prod.left));
    setPFlash(Boolean(prod.isFlashBadge));
    setPFreeDelivery(Boolean(prod.freeDelivery));
    setPDesc(prod.shortDesc);
    setPSpecs(prod.specs.join('\n'));
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean || categories.includes(clean)) {
      showToast('নতুন এবং ইউনিক ক্যাটাগরির নাম লিখুন।');
      return;
    }
    onSaveCategories([...categories, clean]);
    setNewCatName('');
    showToast(`"${clean}" ক্যাটাগরি যোগ করা হয়েছে।`);
  };

  const handleRenameCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!renamingCat) return;
    const cleanNext = renamingCat.next.trim();
    if (!cleanNext) return;
    onSaveCategories(categories.map((c) => (c === renamingCat.old ? cleanNext : c)));
    onSaveProducts(
      products.map((p) =>
        p.category === renamingCat.old ? { ...p, category: cleanNext } : p
      )
    );
    setRenamingCat(null);
    showToast('ক্যাটাগরির নাম পরিবর্তন করা হয়েছে।');
  };

  const handleAddCoupon = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = cCode.trim().toUpperCase();
    const val = Number(cVal);
    if (!cleanCode || !val || val <= 0) {
      showToast('কুপন কোড এবং ডিসকাউন্টের পরিমাণ দিন।');
      return;
    }
    const next: CouponCode = {
      id: `cpn-${Date.now()}`,
      code: cleanCode,
      discountType: cType,
      value: val,
      minOrder: Math.max(0, Number(cMin) || 0),
      active: true,
    };
    onSaveCoupons([next, ...coupons]);
    setCCode('');
    setCVal('');
    showToast(`কুপন "${cleanCode}" তৈরি হয়েছে!`);
  };

  const handleAddBanner = (e: FormEvent) => {
    e.preventDefault();
    if (!bSrc.trim()) {
      showToast('ব্যানার ছবি আপলোড করুন অথবা ইমেজ লিংক দিন।');
      return;
    }
    const next: BannerSlide = {
      id: `banner-${Date.now()}`,
      src: bSrc.trim(),
      alt: bAlt.trim() || 'আপনজন ই-শপ প্রমোশনাল ব্যানার',
      active: true,
    };
    onSaveBanners([next, ...banners]);
    setBSrc('');
    setBAlt('');
    showToast('নতুন ব্যানার যুক্ত হয়েছে!');
  };

  const moveBanner = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= banners.length) return;
    const copy = [...banners];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    onSaveBanners(copy);
  };

  const handleAddManualUser = (e: FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uPhone.trim()) return;
    const next: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: uName.trim(),
      identifier: uPhone.trim(),
      joinedAt: new Date().toISOString(),
      status: 'সক্রিয়',
      source: 'এডমিন',
    };
    onSaveUsers([next, ...users]);
    setUName('');
    setUPhone('');
    showToast('নতুন ব্যবহারকারী যোগ করা হয়েছে।');
  };

  const handleSaveSettingsSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings(draftSettings);
    showToast('ওয়েবসাইট সেটিংস সফলভাবে সেভ হয়েছে!');
  };

  const handleSaveSecurity = (e: FormEvent) => {
    e.preventDefault();
    if (draftSettings.adminPinEnabled && newPin.trim().length < 4) {
      showToast('নিরাপত্তার জন্য কমপক্ষে ৪ সংখ্যার পিন দিন।');
      return;
    }
    const updated: WebsiteSettings = {
      ...settings,
      adminPinEnabled: draftSettings.adminPinEnabled,
      adminPin: newPin.trim() || settings.adminPin,
    };
    setDraftSettings(updated);
    onSaveSettings(updated);
    showToast('নিরাপত্তা সেটিংস আপডেট হয়েছে!');
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportBackup(String(reader.result || ''));
      showToast(ok ? 'ব্যাকআপ রিস্টোর সফল হয়েছে!' : 'সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।');
    };
    reader.readAsText(file);
  };

  // Filtered lists respecting globalSearch
  const q = globalSearch.trim().toLowerCase();
  const visibleProducts = products.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  const visibleOrders = orders.filter((o) => {
    const matchStatus = orderFilter === 'সব' || o.status === orderFilter;
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  const visibleUsers = users.filter(
    (u) => !q || u.name.toLowerCase().includes(q) || u.identifier.toLowerCase().includes(q)
  );

  if (!pinVerified) {
    return (
      <div className="min-h-dvh bg-[#0c0d10] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#14161b] border border-[#f4c41c]/35 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col items-center text-center">
            <span className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#f4c41c] mb-3">
              <img
                src={settings.logoUrl}
                alt="এডমিন লোগো"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-[1.08]"
              />
            </span>
            <h1 className="font-display text-xl font-bold text-[#f4c41c]">
              {settings.brandPrimary} {settings.brandSecondary} Admin
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              এডমিন প্যানেলে প্রবেশ করতে নিরাপত্তা পিন দিন
            </p>
          </div>

          {pinError && (
            <div className="text-xs text-red-300 bg-red-950/60 border border-red-500/40 rounded-xl px-3 py-2 text-center">
              {pinError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pinAttempt.trim() === settings.adminPin) {
                setPinVerified(true);
                setPinError('');
              } else {
                setPinError('ভুল পিন! সঠিক পিন দিয়ে আবার চেষ্টা করুন।');
              }
            }}
            className="space-y-3"
          >
            <div className="flex items-center border border-white/15 bg-[#0c0d10] rounded-xl px-3.5 h-12 focus-within:border-[#f4c41c]">
              <Lock className="w-4 h-4 text-[#f4c41c] mr-2.5" />
              <input
                type="password"
                inputMode="numeric"
                value={pinAttempt}
                onChange={(e) => setPinAttempt(e.target.value)}
                placeholder="পিন লিখুন"
                className="w-full bg-transparent text-white text-sm outline-none font-mono-num"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-[#f4c41c] hover:bg-[#ffd542] text-[#111317] font-extrabold text-sm cursor-pointer"
            >
              প্রবেশ করুন
            </button>
          </form>

          <button
            type="button"
            onClick={onExitAdmin}
            className="w-full text-xs text-neutral-400 hover:text-white py-2"
          >
            ← স্টোরে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0c0d10] text-white flex flex-col lg:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Dark Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-dvh w-[256px] shrink-0 bg-[#111317] border-r border-white/10 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#f4c41c] shrink-0 bg-[#141518]">
                <img
                  src={settings.logoUrl}
                  alt="এডমিন লোগো"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-[1.08]"
                />
              </span>
              <div className="min-w-0">
                <div className="font-display text-lg font-extrabold leading-tight truncate">
                  <span className="text-[#f4c41c]">{settings.brandPrimary} </span>
                  <span className="text-white">{settings.brandSecondary}</span>
                </div>
                <div className="text-[11px] text-neutral-400">Admin Panel</div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="সাইডবার বন্ধ করুন"
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'settings') setDraftSettings(settings);
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#f4c41c] text-[#111317] shadow-sm'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#111317]' : 'text-neutral-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold text-neutral-300 hover:bg-red-500/15 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>লগআউট (স্টোর দেখুন)</span>
            </button>
          </nav>
        </div>

        <div className="p-4 pt-2">
          <div className="rounded-2xl border border-[#f4c41c]/55 bg-[#171a21] p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f4c41c]/15 text-[#f4c41c] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#f4c41c] truncate">
                {settings.brandPrimary} {settings.brandSecondary}
              </div>
              <div className="text-[11px] text-neutral-300 truncate">Admin Control Panel</div>
              <div className="text-[10px] text-neutral-400 font-mono-num">v1.0.0</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#111317]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="মেনু খুলুন"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center lg:hidden shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 bg-[#1a1d24] border border-white/10 rounded-full px-3.5 h-10 flex-1 min-w-0 focus-within:border-[#f4c41c]">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="যেকোনো কিছু খুঁজুন..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-neutral-400 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onExitAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#f4c41c] hover:text-[#111317] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>সাইট দেখুন</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="নোটিফিকেশন"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center relative cursor-pointer"
              >
                <Bell className="w-5 h-5 text-neutral-200" />
                {unreadAlertsCount > 0 && (
                  <span className="font-mono-num absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-[#141518] rounded-2xl shadow-2xl border border-neutral-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="text-xs font-bold">নোটিফিকেশন ({unreadAlertsCount})</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 text-xs mt-1">
                    {orders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          setActiveTab('orders');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left py-2 hover:bg-neutral-50 rounded px-1"
                      >
                        <div className="font-bold">নতুন অর্ডার #{o.id}</div>
                        <div className="text-neutral-500">
                          {o.customerName} · ৳{o.total.toLocaleString('en-US')}
                        </div>
                      </button>
                    ))}
                    {complaints.slice(0, 2).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveTab('users');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left py-2 hover:bg-neutral-50 rounded px-1"
                      >
                        <div className="font-bold text-amber-700">অভিযোগ #{c.id}</div>
                        <div className="text-neutral-500 truncate">{c.message}</div>
                      </button>
                    ))}
                    {orders.length === 0 && complaints.length === 0 && (
                      <div className="py-4 text-center text-neutral-500">
                        এখনও কোনো নতুন নোটিফিকেশন নেই
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-1">
              <span className="w-9 h-9 rounded-full overflow-hidden border border-[#f4c41c] bg-[#1a1d24] flex items-center justify-center shrink-0">
                <img
                  src={settings.logoUrl}
                  alt="Admin"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-[1.08]"
                />
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-neutral-200">Admin</span>
            </div>
          </div>
        </header>

        {/* Live Toast inside Admin */}
        {toastMsg && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#f4c41c] text-[#111317] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 max-w-[1400px] w-full mx-auto">
          {/* Top Heading Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#f4c41c] text-[#111317] flex items-center justify-center shrink-0 shadow-sm">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  {navItems.find((n) => n.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-neutral-400">
                  Welcome back, Admin! আপনার স্টোর এখান থেকে A-to-Z কাস্টমাইজ করুন।
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 self-start sm:self-auto">
              <Calendar className="w-4 h-4 text-[#f4c41c]" />
              <span>আজ: {formattedBanglaDate}</span>
            </div>
          </div>

          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* 4 KPI White Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white text-[#141518] rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-500">মোট অর্ডার</div>
                      <div className="font-mono-num text-2xl font-extrabold text-[#141518]">
                        {toBengaliDigits(orders.length)}
                      </div>
                      <div className="text-[11px] font-semibold text-[#16a34a] mt-0.5">
                        ↑ লাইভ আপডেট
                      </div>
                    </div>
                  </div>
                  <MiniSparkline color="#f59e0b" points={[4, 7, 6, 10, 9, 14]} />
                </div>

                <div className="bg-white text-[#141518] rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#dbeafe] text-[#2563eb] flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-500">মোট ব্যবহারকারী</div>
                      <div className="font-mono-num text-2xl font-extrabold text-[#141518]">
                        {toBengaliDigits(users.length)}
                      </div>
                      <div className="text-[11px] font-semibold text-[#16a34a] mt-0.5">
                        ↑ সক্রিয় ক্রেতা
                      </div>
                    </div>
                  </div>
                  <MiniSparkline color="#3b82f6" points={[3, 5, 6, 8, 11, 13]} />
                </div>

                <div className="bg-white text-[#141518] rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0 font-display font-extrabold text-xl">
                      ৳
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-500">মোট বিক্রয়</div>
                      <div className="font-mono-num text-xl sm:text-2xl font-extrabold text-[#141518] truncate">
                        ৳{toBengaliDigits(totalRevenue.toLocaleString('en-US'))}
                      </div>
                      <div className="text-[11px] font-semibold text-[#16a34a] mt-0.5">
                        ↑ মোট আয়
                      </div>
                    </div>
                  </div>
                  <MiniSparkline color="#16a34a" points={[5, 8, 7, 11, 13, 18]} />
                </div>

                <div className="bg-white text-[#141518] rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-500">আজকের ভিজিটর</div>
                      <div className="font-mono-num text-2xl font-extrabold text-[#141518]">
                        {toBengaliDigits(todayVisitorsCount)}
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-500 mt-0.5">
                        মোট ভিজিট: {toBengaliDigits(visitors.length)}
                      </div>
                    </div>
                  </div>
                  <MiniSparkline color="#8b5cf6" points={[2, 4, 7, 5, 9, 12]} />
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 bg-white text-[#141518] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-base sm:text-lg font-bold">বিক্রয় পরিসংখ্যান</h2>
                    </div>

                    <select
                      value={salesRange}
                      onChange={(e) => setSalesRange(e.target.value as 'month' | 'week' | 'today')}
                      aria-label="সময়সীমা"
                      className="text-xs font-semibold border border-neutral-200 rounded-xl px-3 py-1.5 bg-neutral-50 outline-none"
                    >
                      <option value="month">এই মাস</option>
                      <option value="week">গত ৭ দিন</option>
                      <option value="today">আজ</option>
                    </select>
                  </div>

                  <SalesAreaChart data={salesChartData} />
                </div>

                <div className="lg:col-span-4 bg-white text-[#141518] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold">অর্ডার স্ট্যাটাস</h2>
                  </div>

                  <OrderStatusDonut
                    completed={orderStatusCounts.completed}
                    processing={orderStatusCounts.processing}
                    pending={orderStatusCounts.pending}
                    total={orders.length}
                  />
                </div>
              </div>

              {/* Recent Orders & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 bg-white text-[#141518] rounded-2xl p-5 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-base sm:text-lg font-bold">সাম্প্রতিক অর্ডার</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#b87e06] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>সব দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-10 text-center text-sm text-neutral-500">
                      এখনও কোনো অর্ডার আসেনি। স্টোর থেকে অর্ডার করলে এখানে লাইভ দেখা যাবে।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-neutral-200 text-neutral-500 text-xs">
                            <th className="py-2.5 pr-3">#</th>
                            <th className="py-2.5 px-3">গ্রাহক</th>
                            <th className="py-2.5 px-3">পণ্য</th>
                            <th className="py-2.5 px-3">পরিমাণ</th>
                            <th className="py-2.5 px-3">মোট</th>
                            <th className="py-2.5 pl-3 text-right">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {orders.slice(0, 5).map((order) => {
                            const qty = order.items.reduce((s, i) => s + i.quantity, 0);
                            return (
                              <tr
                                key={order.id}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActiveTab('orders');
                                }}
                                className="hover:bg-neutral-50 cursor-pointer"
                              >
                                <td className="py-3 pr-3 font-mono-num font-bold text-[#141518]">
                                  #{order.id}
                                </td>
                                <td className="py-3 px-3 font-medium">{order.customerName}</td>
                                <td className="py-3 px-3 text-neutral-600 max-w-[160px] truncate">
                                  {order.items[0]?.name}
                                  {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                                </td>
                                <td className="py-3 px-3 font-mono-num">{qty}</td>
                                <td className="py-3 px-3 font-mono-num font-bold">
                                  ৳{order.total.toLocaleString('en-US')}
                                </td>
                                <td className="py-3 pl-3 text-right">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusPillClass(
                                      order.status
                                    )}`}
                                  >
                                    {getStatusShortLabel(order.status)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 bg-white text-[#141518] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold">দ্রুত অ্যাকশন</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="p-4 rounded-2xl border border-neutral-200 hover:border-[#f4c41c] hover:bg-[#fffdf5] flex flex-col items-center text-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <CloudUpload className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold">নতুন প্রোডাক্ট আপলোড</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('coupons')}
                      className="p-4 rounded-2xl border border-neutral-200 hover:border-[#f4c41c] hover:bg-[#fffdf5] flex flex-col items-center text-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <Tag className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold">কুপন কোড তৈরি</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDraftSettings(settings);
                        setActiveTab('settings');
                      }}
                      className="p-4 rounded-2xl border border-neutral-200 hover:border-[#f4c41c] hover:bg-[#fffdf5] flex flex-col items-center text-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <Settings className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold">সাইট সেটিংস</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('visitors')}
                      className="p-4 rounded-2xl border border-neutral-200 hover:border-[#f4c41c] hover:bg-[#fffdf5] flex flex-col items-center text-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold">ভিজিটর রিপোর্ট</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCT UPLOAD & MANAGE */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <form
                onSubmit={handleProductSubmit}
                className="lg:col-span-5 bg-white text-[#141518] rounded-2xl p-5 space-y-3.5 h-fit"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h2 className="font-display text-lg font-bold">
                    {editingProductId ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট আপলোড'}
                  </h2>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-xs font-semibold text-neutral-500 hover:text-red-600"
                    >
                      বাতিল করুন
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">পণ্যের নাম *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="যেমন: অ্যাস্ট্রোনট গ্যালাক্সি ল্যাম্প"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-[#c98e0b]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">ক্যাটাগরি</label>
                    <select
                      value={pCat}
                      onChange={(e) => setPCat(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm outline-none bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">স্টক পরিমাণ</label>
                    <input
                      type="number"
                      min={0}
                      value={pLeft}
                      onChange={(e) => setPLeft(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold mb-1">বিক্রয় মূল্য (৳)*</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="1250"
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">আগের মূল্য (৳)</label>
                    <input
                      type="number"
                      min={0}
                      value={pOldPrice}
                      onChange={(e) => setPOldPrice(e.target.value)}
                      placeholder="1650"
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">ছাড় লেবেল</label>
                    <input
                      type="text"
                      value={pDiscount}
                      onChange={(e) => setPDiscount(e.target.value)}
                      placeholder="অটো হিসাব"
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">পণ্যের ছবি (ফাইল আপলোড বা লিংক)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={pImage}
                      onChange={(e) => setPImage(e.target.value)}
                      placeholder="/assets/... বা ইমেজ URL"
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-300 text-xs outline-none"
                    />
                    <label className="h-10 px-3 rounded-xl bg-[#141518] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setPImage, 800)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {pImage && (
                    <img
                      src={pImage}
                      alt="প্রিভিউ"
                      className="mt-2 h-24 w-24 object-cover rounded-xl border border-neutral-200"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="পণ্যের আকর্ষণীয় বিবরণ লিখুন..."
                    className="w-full p-3 rounded-xl border border-neutral-300 text-sm outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">স্পেসিফিকেশন (প্রতি লাইনে একটি)</label>
                  <textarea
                    rows={2}
                    value={pSpecs}
                    onChange={(e) => setPSpecs(e.target.value)}
                    placeholder={'যেমন:\nপ্রিমিয়াম মেটাল বডি\n৬ মাসের ওয়ারেন্টি'}
                    className="w-full p-3 rounded-xl border border-neutral-300 text-xs outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pFlash}
                      onChange={(e) => setPFlash(e.target.checked)}
                      className="w-4 h-4 accent-[#c98e0b]"
                    />
                    <span>ফ্ল্যাশ সেল ব্যাজ (⚡) দেখান</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#15803d] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pFreeDelivery}
                      onChange={(e) => setPFreeDelivery(e.target.checked)}
                      className="w-4 h-4 accent-[#15803d]"
                    />
                    <span>ফ্রি হোম ডেলিভারি চালু করুন (শুধু এই প্রোডাক্টে দেখাবে)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-[#f4c41c] hover:bg-[#e5b510] text-[#111317] font-extrabold text-sm cursor-pointer"
                >
                  {editingProductId ? 'পরিবর্তন সেভ করুন' : '+ প্রোডাক্ট আপলোড করুন'}
                </button>
              </form>

              <div className="lg:col-span-7 bg-white text-[#141518] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-lg font-bold">
                  সকল প্রোডাক্ট ({toBengaliDigits(visibleProducts.length)})
                </h2>

                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                  {visibleProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-200 hover:border-[#c98e0b]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-neutral-100"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">{prod.name}</div>
                          <div className="text-xs text-neutral-500">
                            {prod.category} · স্টক: {toBengaliDigits(prod.left)}
                            {prod.freeDelivery ? ' · ফ্রি হোম ডেলিভারি' : ''}
                          </div>
                          <div className="font-mono-num text-xs font-bold text-[#b87e06] mt-0.5">
                            ৳{prod.price.toLocaleString('en-US')}{' '}
                            <span className="line-through text-neutral-400 font-normal">
                              ৳{prod.oldPrice.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = !prod.freeDelivery;
                            onSaveProducts(
                              products.map((p) =>
                                p.id === prod.id ? { ...p, freeDelivery: nextVal } : p
                              )
                            );
                            showToast(
                              nextVal
                                ? `"${prod.name}"-এ ফ্রি হোম ডেলিভারি চালু হয়েছে।`
                                : `"${prod.name}"-এর ফ্রি হোম ডেলিভারি বন্ধ করা হয়েছে।`
                            );
                          }}
                          title="ফ্রি হোম ডেলিভারি চালু/বন্ধ করুন"
                          className={`px-2.5 h-9 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                            prod.freeDelivery
                              ? 'bg-[#12a800] text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {prod.freeDelivery ? 'ফ্রি ডেলিভারি ✓' : 'ফ্রি ডেলিভারি'}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditProduct(prod)}
                          aria-label="এডিট"
                          className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-[#fef3c7] text-[#141518] flex items-center justify-center cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSaveProducts(products.filter((p) => p.id !== prod.id));
                            showToast('প্রোডাক্ট ডিলিট করা হয়েছে।');
                          }}
                          aria-label="ডিলিট"
                          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white text-[#141518] rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold">
                  অর্ডার ম্যানেজমেন্ট ({toBengaliDigits(visibleOrders.length)})
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {['সব', ...ORDER_STATUSES].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        orderFilter === st
                          ? 'bg-[#141518] text-[#f4c41c]'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {visibleOrders.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-2xl border transition-colors ${
                        selectedOrder?.id === order.id
                          ? 'border-[#c98e0b] bg-[#fffdf5]'
                          : 'border-neutral-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num font-extrabold text-sm">#{order.id}</span>
                            <span className="text-xs text-neutral-500">
                              {new Date(order.createdAt).toLocaleString('bn-BD')}
                            </span>
                          </div>
                          <div className="text-sm font-bold mt-0.5">
                            {order.customerName} ·{' '}
                            <span className="font-mono-num text-neutral-600">{order.phone}</span>
                          </div>
                          <div className="text-xs text-neutral-600 mt-0.5">{order.address}</div>
                          <div className="text-xs text-neutral-500 mt-1">
                            পেমেন্ট: <strong>{order.paymentMethod.toUpperCase()}</strong>
                            {order.paymentDetails ? ` (${order.paymentDetails})` : ''} · ডেলিভারি:{' '}
                            {order.zone === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}
                            {order.couponCode ? ` · কুপন: ${order.couponCode}` : ''}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className="font-mono-num font-extrabold text-base text-[#b87e06] mr-2">
                            ৳{order.total.toLocaleString('en-US')}
                          </span>

                          <select
                            value={order.status}
                            onChange={(e) => {
                              onUpdateOrderStatus(
                                order.id,
                                e.target.value as OrderRecord['status']
                              );
                              showToast(`অর্ডার #${order.id} স্ট্যাটাস আপডেট হয়েছে।`);
                            }}
                            className="h-9 px-2.5 rounded-xl border border-neutral-300 text-xs font-bold bg-white outline-none"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              onDeleteOrder(order.id);
                              showToast('অর্ডার মুছে ফেলা হয়েছে।');
                            }}
                            aria-label="অর্ডার মুছুন"
                            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap gap-2 text-xs">
                        {order.items.map((it) => (
                          <span
                            key={it.productId}
                            className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-medium"
                          >
                            {it.name} × {it.quantity} (৳{it.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <form
                onSubmit={handleAddCategory}
                className="lg:col-span-5 bg-white text-[#141518] rounded-2xl p-5 space-y-3 h-fit"
              >
                <h2 className="font-display text-lg font-bold">নতুন ক্যাটাগরি যোগ করুন</h2>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="যেমন: গিফট বক্স, হোম ডেকোর"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-[#c98e0b]"
                />
                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-[#f4c41c] hover:bg-[#e5b510] text-[#111317] font-extrabold text-sm cursor-pointer"
                >
                  + ক্যাটাগরি যোগ করুন
                </button>
              </form>

              <div className="lg:col-span-7 bg-white text-[#141518] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-lg font-bold">
                  বর্তমান ক্যাটাগরিসমূহ ({toBengaliDigits(categories.length)})
                </h2>
                <div className="space-y-2.5">
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    return (
                      <div
                        key={cat}
                        className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3"
                      >
                        {renamingCat?.old === cat ? (
                          <form onSubmit={handleRenameCategory} className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={renamingCat.next}
                              onChange={(e) =>
                                setRenamingCat({ ...renamingCat, next: e.target.value })
                              }
                              className="flex-1 h-9 px-3 rounded-lg border border-neutral-300 text-sm"
                            />
                            <button
                              type="submit"
                              className="px-3 h-9 rounded-lg bg-[#141518] text-white text-xs font-bold"
                            >
                              সেভ
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingCat(null)}
                              className="px-2.5 h-9 rounded-lg bg-neutral-100 text-xs font-semibold"
                            >
                              বাতিল
                            </button>
                          </form>
                        ) : (
                          <>
                            <div>
                              <div className="text-sm font-bold">{cat}</div>
                              <div className="text-xs text-neutral-500">
                                মোট {toBengaliDigits(count)} টি পণ্য
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setRenamingCat({ old: cat, next: cat })}
                                className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-[#fef3c7] flex items-center justify-center cursor-pointer"
                                aria-label="নাম পরিবর্তন"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {categories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSaveCategories(categories.filter((c) => c !== cat));
                                    showToast(`"${cat}" মুছে ফেলা হয়েছে।`);
                                  }}
                                  className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                                  aria-label="মুছুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. COUPON CODES */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <form
                onSubmit={handleAddCoupon}
                className="lg:col-span-5 bg-white text-[#141518] rounded-2xl p-5 space-y-3.5 h-fit"
              >
                <h2 className="font-display text-lg font-bold">নতুন কুপন কোড তৈরি</h2>

                <div>
                  <label className="block text-xs font-bold mb-1">কুপন কোড *</label>
                  <input
                    type="text"
                    required
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    placeholder="যেমন: EID20"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num uppercase outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">ডিসকাউন্ট ধরন</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as 'percent' | 'flat')}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm bg-white outline-none"
                    >
                      <option value="percent">শতাংশ (%)</option>
                      <option value="flat">নির্দিষ্ট টাকা (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">পরিমাণ *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={cVal}
                      onChange={(e) => setCVal(e.target.value)}
                      placeholder={cType === 'percent' ? '15' : '200'}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">সর্বনিম্ন অর্ডার (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={cMin}
                    onChange={(e) => setCMin(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-[#f4c41c] hover:bg-[#e5b510] text-[#111317] font-extrabold text-sm cursor-pointer"
                >
                  + কুপন তৈরি করুন
                </button>
              </form>

              <div className="lg:col-span-7 bg-white text-[#141518] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-lg font-bold">
                  সকল কুপন কোড ({toBengaliDigits(coupons.length)})
                </h2>
                <div className="space-y-2.5">
                  {coupons.map((cpn) => (
                    <div
                      key={cpn.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-mono-num font-extrabold text-sm text-[#141518]">
                          {cpn.code}
                        </div>
                        <div className="text-xs text-neutral-600 mt-0.5">
                          ছাড়:{' '}
                          {cpn.discountType === 'percent'
                            ? `${toBengaliDigits(cpn.value)}%`
                            : `৳${toBengaliDigits(cpn.value)}`}{' '}
                          · সর্বনিম্ন অর্ডার ৳{toBengaliDigits(cpn.minOrder)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSaveCoupons(
                              coupons.map((c) =>
                                c.id === cpn.id ? { ...c, active: !c.active } : c
                              )
                            );
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                            cpn.active
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {cpn.active ? 'চালু' : 'বন্ধ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSaveCoupons(coupons.filter((c) => c.id !== cpn.id));
                            showToast('কুপন মুছে ফেলা হয়েছে।');
                          }}
                          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                          aria-label="কুপন ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. USER MANAGEMENT & COMPLAINTS */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 bg-white text-[#141518] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold">
                    ব্যবহারকারী তালিকা ({toBengaliDigits(visibleUsers.length)})
                  </h2>
                </div>

                <form onSubmit={handleAddManualUser} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={uName}
                    onChange={(e) => setUName(e.target.value)}
                    placeholder="ক্রেতার নাম"
                    className="h-10 px-3 rounded-xl border border-neutral-300 text-xs sm:text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    placeholder="মোবাইল / ইমেইল"
                    className="h-10 px-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-mono-num outline-none"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#141518] hover:bg-[#b87e06] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ইউজার যোগ</span>
                  </button>
                </form>

                {visibleUsers.length === 0 ? (
                  <div className="py-8 text-center text-sm text-neutral-500">
                    এখনও কোনো ব্যবহারকারী পাওয়া যায়নি। ক্রেতা অর্ডার বা লগইন করলে তালিকা স্বয়ংক্রিয়ভাবে আপডেট হবে।
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
                    {visibleUsers.map((usr) => (
                      <div
                        key={usr.id}
                        className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">{usr.name}</div>
                          <div className="font-mono-num text-xs text-neutral-600">
                            {usr.identifier} · {usr.source}
                          </div>
                          {usr.address && (
                            <div className="text-xs text-neutral-500 truncate">{usr.address}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onSaveUsers(
                                users.map((u) =>
                                  u.id === usr.id
                                    ? {
                                        ...u,
                                        status: u.status === 'সক্রিয়' ? 'ব্লকড' : 'সক্রিয়',
                                      }
                                    : u
                                )
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                              usr.status === 'সক্রিয়'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {usr.status}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSaveUsers(users.filter((u) => u.id !== usr.id));
                              showToast('ব্যবহারকারী মুছে ফেলা হয়েছে।');
                            }}
                            className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
                            aria-label="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white text-[#141518] rounded-2xl p-5 space-y-3 h-fit">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-[#b87e06]" />
                  <h2 className="font-display text-lg font-bold">
                    অভিযোগ ও সাপোর্ট ({toBengaliDigits(complaints.length)})
                  </h2>
                </div>
                {complaints.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">
                    কোনো কাস্টমার অভিযোগ পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
                    {complaints.map((cmp) => (
                      <div key={cmp.id} className="p-3 rounded-2xl border border-neutral-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-num text-xs font-bold">
                            #{cmp.id} · {cmp.phone}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleComplaintStatus(cmp.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                              cmp.status === 'সমাধান হয়েছে'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-[#fef3c7] text-[#b45309]'
                            }`}
                          >
                            {cmp.status}
                          </button>
                        </div>
                        <p className="text-xs text-neutral-700">{cmp.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. WEBSITE SETTINGS (A to Z) */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSaveSettingsSubmit}
              className="bg-white text-[#141518] rounded-2xl p-5 sm:p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold">ওয়েবসাইট সেটিংস (A to Z কাস্টমাইজ)</h2>
                  <p className="text-xs text-neutral-500">
                    এখান থেকে স্টোরের নাম, লোগো, নোটিশ, ডেলিভারি চার্জ, পেমেন্ট, হোয়াটসঅ্যাপ ও আমাদের সম্পর্কে সব পরিবর্তন করুন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onResetSettings();
                    showToast('ডিফল্ট সেটিংস রিস্টোর করা হয়েছে।');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট রিসেট</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">ব্র্যান্ড নাম (প্রথম অংশ)</label>
                  <input
                    type="text"
                    value={draftSettings.brandPrimary}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, brandPrimary: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ব্র্যান্ড নাম (দ্বিতীয় অংশ)</label>
                  <input
                    type="text"
                    value={draftSettings.brandSecondary}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, brandSecondary: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={draftSettings.tagline}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, tagline: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">লোগো (আপলোড বা URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={draftSettings.logoUrl}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, logoUrl: e.target.value })
                      }
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-300 text-xs"
                    />
                    <label className="h-10 px-3 rounded-xl bg-[#141518] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            (url) => setDraftSettings({ ...draftSettings, logoUrl: url }),
                            400
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    হোয়াটসঅ্যাপ নম্বর (880 সহ)
                  </label>
                  <input
                    type="text"
                    value={draftSettings.whatsappNumber}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, whatsappNumber: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">অফিশিয়াল ফেসবুক পেজ লিংক</label>
                  <input
                    type="url"
                    value={draftSettings.facebookUrl}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, facebookUrl: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ঢাকার ভেতরে ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    value={draftSettings.dhakaDeliveryFee}
                    onChange={(e) =>
                      setDraftSettings({
                        ...draftSettings,
                        dhakaDeliveryFee: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    value={draftSettings.outsideDeliveryFee}
                    onChange={(e) =>
                      setDraftSettings({
                        ...draftSettings,
                        outsideDeliveryFee: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm font-mono-num"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">সক্রিয় পেমেন্ট মাধ্যমসমূহ</span>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftSettings.liveToastEnabled}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          liveToastEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#c98e0b]"
                    />
                    <span>লাইভ পারচেজ নোটিফিকেশন চালু ({draftSettings.liveToastIntervalSec} সেকেন্ড পরপর)</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['cod', 'ক্যাশ অন ডেলিভারি'],
                      ['bkash', 'বিকাশ'],
                      ['nagad', 'নগদ'],
                      ['rocket', 'রকেট'],
                      ['card', 'কার্ড'],
                    ] as [PaymentMethod, string][]
                  ).map(([key, label]) => {
                    const enabled = draftSettings.enabledPayments[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setDraftSettings({
                            ...draftSettings,
                            enabledPayments: {
                              ...draftSettings.enabledPayments,
                              [key]: !enabled,
                            },
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          enabled
                            ? 'bg-[#141518] text-[#f4c41c] border-[#141518]'
                            : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                        }`}
                      >
                        {label}: {enabled ? 'চালু' : 'বন্ধ'}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1">বিকাশ মার্চেন্ট/পার্সোনাল নম্বর</label>
                    <input
                      type="text"
                      value={draftSettings.merchantWallets.bkash}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          merchantWallets: {
                            ...draftSettings.merchantWallets,
                            bkash: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-neutral-300 text-xs font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1">নগদ নম্বর</label>
                    <input
                      type="text"
                      value={draftSettings.merchantWallets.nagad}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          merchantWallets: {
                            ...draftSettings.merchantWallets,
                            nagad: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-neutral-300 text-xs font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1">রকেট নম্বর</label>
                    <input
                      type="text"
                      value={draftSettings.merchantWallets.rocket}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          merchantWallets: {
                            ...draftSettings.merchantWallets,
                            rocket: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-neutral-300 text-xs font-mono-num"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold">টপ নোটিশ বার লেখা</label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftSettings.noticeEnabled}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, noticeEnabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#c98e0b]"
                    />
                    <span>নোটিশ বার দেখান</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={draftSettings.noticeText}
                  onChange={(e) =>
                    setDraftSettings({ ...draftSettings, noticeText: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs sm:text-sm"
                />

                <div>
                  <label className="block text-xs font-bold mb-1">
                    আমাদের সম্পর্কে জানুন (প্যারা ১)
                  </label>
                  <textarea
                    rows={3}
                    value={draftSettings.aboutBodyOne}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, aboutBodyOne: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-neutral-300 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    আমাদের সম্পর্কে জানুন (প্যারা ২)
                  </label>
                  <textarea
                    rows={2}
                    value={draftSettings.aboutBodyTwo}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, aboutBodyTwo: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-neutral-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 min-h-[46px] rounded-xl bg-[#f4c41c] hover:bg-[#e5b510] text-[#111317] font-extrabold text-sm cursor-pointer"
              >
                সব সেটিংস সেভ করুন
              </button>
            </form>
          )}

          {/* 8. BANNER MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 space-y-4">
                <form
                  onSubmit={handleAddBanner}
                  className="bg-white text-[#141518] rounded-2xl p-5 space-y-3"
                >
                  <h2 className="font-display text-lg font-bold">নতুন ব্যানার যোগ করুন</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bSrc}
                      onChange={(e) => setBSrc(e.target.value)}
                      placeholder="ব্যানার ইমেজ URL বা আপলোড করুন"
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-300 text-xs outline-none"
                    />
                    <label className="h-10 px-3 rounded-xl bg-[#141518] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setBSrc, 1280)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={bAlt}
                    onChange={(e) => setBAlt(e.target.value)}
                    placeholder="ব্যানারের বিবরণ (Alt Text)"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm outline-none"
                  />
                  {bSrc && (
                    <img
                      src={bSrc}
                      alt="প্রিভিউ"
                      className="w-full rounded-xl border border-neutral-200 max-h-36 object-cover"
                    />
                  )}
                  <button
                    type="submit"
                    className="w-full min-h-[44px] rounded-xl bg-[#f4c41c] hover:bg-[#e5b510] text-[#111317] font-extrabold text-sm cursor-pointer"
                  >
                    + ব্যানার যুক্ত করুন
                  </button>
                </form>

                <div className="bg-white text-[#141518] rounded-2xl p-5 space-y-3">
                  <h3 className="font-display text-base font-bold">ফ্ল্যাশ সেল টেক্সট কাস্টমাইজ</h3>
                  <input
                    type="text"
                    value={settings.flashSaleTitle}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, flashSaleTitle: e.target.value })
                    }
                    placeholder="ফ্ল্যাশ সেল"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm"
                  />
                  <input
                    type="text"
                    value={settings.flashSaleSubtitle}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, flashSaleSubtitle: e.target.value })
                    }
                    placeholder="বিশেষ ছাড় — দ্রুত অর্ডার করুন!"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 bg-white text-[#141518] rounded-2xl p-5 space-y-3">
                <h2 className="font-display text-lg font-bold">
                  হোম পেজ ব্যানার ({toBengaliDigits(banners.length)})
                </h2>
                <div className="space-y-3">
                  {banners.map((bn, idx) => (
                    <div
                      key={bn.id}
                      className="p-3 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <img
                        src={bn.src}
                        alt={bn.alt}
                        referrerPolicy="no-referrer"
                        className="w-full sm:w-40 h-20 rounded-xl object-cover shrink-0 bg-neutral-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{bn.alt}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          ক্রম: #{toBengaliDigits(idx + 1)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveBanner(idx, -1)}
                          disabled={idx === 0}
                          className="w-8 h-8 rounded-lg bg-neutral-100 disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          title="উপরে নিন"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onSaveBanners(
                              banners.map((b) =>
                                b.id === bn.id ? { ...b, active: !b.active } : b
                              )
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            bn.active
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {bn.active ? 'সক্রিয়' : 'লুকানো'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSaveBanners(banners.filter((b) => b.id !== bn.id));
                            showToast('ব্যানার মুছে ফেলা হয়েছে।');
                          }}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. VISITOR REPORT */}
          {activeTab === 'visitors' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white text-[#141518] rounded-2xl p-5">
                  <div className="text-xs text-neutral-500 font-medium">আজকের মোট ভিজিটর</div>
                  <div className="font-mono-num text-3xl font-extrabold mt-1">
                    {toBengaliDigits(todayVisitorsCount)}
                  </div>
                </div>
                <div className="bg-white text-[#141518] rounded-2xl p-5">
                  <div className="text-xs text-neutral-500 font-medium">সর্বমোট ভিজিট সংখ্যা</div>
                  <div className="font-mono-num text-3xl font-extrabold mt-1">
                    {toBengaliDigits(visitors.length)}
                  </div>
                </div>
                <div className="bg-white text-[#141518] rounded-2xl p-5">
                  <div className="text-xs text-neutral-500 font-medium">মোবাইল বনাম ডেস্কটপ</div>
                  <div className="font-mono-num text-lg font-extrabold mt-2">
                    মোবাইল: {toBengaliDigits(visitors.filter((v) => v.device === 'মোবাইল').length)} ·
                    ডেস্কটপ: {toBengaliDigits(visitors.filter((v) => v.device === 'ডেস্কটপ').length)}
                  </div>
                </div>
              </div>

              <div className="bg-white text-[#141518] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold">ভিজিটর লগ (সর্বশেষ ভিজিটসমূহ)</h2>
                  <button
                    type="button"
                    onClick={() => {
                      onClearVisitors();
                      showToast('ভিজিটর লগ রিসেট করা হয়েছে।');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold cursor-pointer"
                  >
                    লগ রিসেট করুন
                  </button>
                </div>

                {visitors.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-8 text-center">
                    এখনও কোনো ভিজিট রেকর্ড হয়নি।
                  </p>
                ) : (
                  <div className="overflow-x-auto max-h-[420px]">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500">
                          <th className="py-2 pr-3">সময়</th>
                          <th className="py-2 px-3">ডিভাইস</th>
                          <th className="py-2 px-3">পেইজ</th>
                          <th className="py-2 pl-3">উৎস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {visitors.slice(0, 40).map((vis) => (
                          <tr key={vis.id}>
                            <td className="py-2.5 pr-3 font-mono-num text-xs">
                              {new Date(vis.timestamp).toLocaleString('bn-BD')}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">{vis.device}</td>
                            <td className="py-2.5 px-3">{vis.page}</td>
                            <td className="py-2.5 pl-3 text-neutral-500">{vis.referrer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 10. SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <form
                onSubmit={handleSaveSecurity}
                className="bg-white text-[#141518] rounded-2xl p-5 space-y-4"
              >
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#b87e06]" />
                  <span>এডমিন পিন নিরাপত্তা</span>
                </h2>

                <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftSettings.adminPinEnabled}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, adminPinEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#c98e0b]"
                  />
                  <span>এডমিন প্যানেলে প্রবেশে পিন লক চালু রাখুন</span>
                </label>

                <div>
                  <label className="block text-xs font-bold mb-1">এডমিন পিন (কমপক্ষে ৪ সংখ্যা)</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="****"
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 text-sm font-mono-num"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 min-h-[44px] rounded-xl bg-[#f4c41c] hover:bg-[#e5b510] text-[#111317] font-extrabold text-sm cursor-pointer"
                >
                  নিরাপত্তা সেভ করুন
                </button>
              </form>

              <div className="bg-white text-[#141518] rounded-2xl p-5 space-y-4">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#b87e06]" />
                  <span>ডাটা ব্যাকআপ ও রিস্টোর</span>
                </h2>
                <p className="text-xs text-neutral-600">
                  আপনার সব পণ্য, ক্যাটাগরি, অর্ডার, কুপন, ব্যানার ও সাইট সেটিংস JSON ফাইলে সংরক্ষণ বা পুনরুদ্ধার করুন।
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="px-4 min-h-[42px] rounded-xl bg-[#141518] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#f4c41c]" />
                    <span>ব্যাকআপ ডাউনলোড</span>
                  </button>

                  <label className="px-4 min-h-[42px] rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#b87e06]" />
                    <span>ব্যাকআপ রিস্টোর করুন</span>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-white/10 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <div>
            © ২০২৬ {settings.brandPrimary} {settings.brandSecondary} | সকল অধিকার সংরক্ষিত
          </div>
          <div>
            {settings.brandPrimary} Admin Control Panel
          </div>
        </footer>
      </div>
    </div>
  );
}
