import {
  Droplets,
  Facebook,
  FolderOpen,
  Headphones,
  Home,
  Info,
  Lightbulb,
  MessageSquareWarning,
  Shield,
  Truck,
  User,
  X,
} from 'lucide-react';
import { CategoryKey } from '../types';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
  onSelectCategory: (cat: CategoryKey) => void;
  onOpenTrackOrder: () => void;
  onOpenComplaint: () => void;
  onOpenAccount: () => void;
  onOpenAbout: () => void;
  onOpenAdmin?: () => void;
  categories?: string[];
  facebookUrl?: string;
}

const DEFAULT_FACEBOOK_URL =
  'https://www.facebook.com/aponjoneshop?mibextid=wwXIfr&mibextid=wwXIfr';

export function MobileDrawer({
  open,
  onClose,
  onNavigateHome,
  onSelectCategory,
  onOpenTrackOrder,
  onOpenComplaint,
  onOpenAccount,
  onOpenAbout,
  onOpenAdmin,
  categories = ['লাইটিং', 'গ্যাজেট', 'সিরামিক আইটেম'],
  facebookUrl = DEFAULT_FACEBOOK_URL,
}: MobileDrawerProps) {
  if (!open) return null;

  const getCategoryIcon = (cat: string) => {
    if (cat === 'লাইটিং') return Lightbulb;
    if (cat === 'গ্যাজেট') return Headphones;
    if (cat === 'সিরামিক আইটেম') return Droplets;
    return FolderOpen;
  };

  const categoryItems = categories.map((cat) => ({
    label: cat,
    cat,
    icon: getCategoryIcon(cat),
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="মোবাইল মেনু"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex"
      onClick={onClose}
    >
      <aside
        className="w-[min(82%,340px)] bg-white h-full flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#141518] text-white px-6 py-5 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-[#f0be4d]">মেনু</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="মেনু বন্ধ করুন"
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 divide-y divide-neutral-100">
          <button
            type="button"
            onClick={() => {
              onNavigateHome();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
          >
            <Home className="w-5 h-5 text-[#b87e06]" />
            <span>হোম</span>
          </button>

          {categoryItems.map(({ label, cat, icon: Icon }) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(cat);
                onClose();
              }}
              className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
            >
              <Icon className="w-5 h-5 text-[#b87e06]" />
              <span>{label}</span>
            </button>
          ))}

          <a
            href={
              facebookUrl &&
              facebookUrl !== 'https://www.facebook.com/' &&
              facebookUrl !== 'https://www.facebook.com'
                ? facebookUrl
                : DEFAULT_FACEBOOK_URL
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
          >
            <Facebook className="w-5 h-5 text-[#1877f2]" />
            <span>অফিশিয়াল ফেসবুক পেজ</span>
          </a>

          <button
            type="button"
            onClick={() => {
              onOpenTrackOrder();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
          >
            <Truck className="w-5 h-5 text-neutral-500" />
            <span>অর্ডার ট্র্যাক</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenComplaint();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
          >
            <MessageSquareWarning className="w-5 h-5 text-neutral-500" />
            <span>অভিযোগ / সাপোর্ট</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAbout();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
          >
            <Info className="w-5 h-5 text-[#b87e06]" />
            <span>আমাদের সম্পর্কে জানুন</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAccount();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#141518] hover:bg-[#faf8f3] flex items-center gap-3.5"
          >
            <User className="w-5 h-5 text-neutral-500" />
            <span>আমার অ্যাকাউন্ট</span>
          </button>

          {onOpenAdmin && (
            <button
              type="button"
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              className="w-full px-6 py-4 text-left text-[16px] font-semibold text-[#b87e06] hover:bg-[#faf8f3] flex items-center gap-3.5"
            >
              <Shield className="w-5 h-5 text-[#b87e06]" />
              <span>এডমিন প্যানেল</span>
            </button>
          )}
        </nav>
      </aside>
    </div>
  );
}
