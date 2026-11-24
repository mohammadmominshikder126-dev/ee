import {
  Camera,
  Headphones,
  Home,
  Lamp,
  MessageSquareWarning,
  Truck,
  User,
  Watch,
  Gamepad2,
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
}

export function MobileDrawer({
  open,
  onClose,
  onNavigateHome,
  onSelectCategory,
  onOpenTrackOrder,
  onOpenComplaint,
  onOpenAccount,
}: MobileDrawerProps) {
  if (!open) return null;

  const categoryItems: { label: string; cat: CategoryKey; icon: typeof Camera }[] = [
    { label: 'Camera', cat: 'Camera', icon: Camera },
    { label: 'Gadgets', cat: 'Gadgets', icon: Headphones },
    { label: 'Home Decor', cat: 'Home Decor', icon: Lamp },
    { label: 'Accessories', cat: 'Accessories', icon: Watch },
    { label: 'Toys', cat: 'Toys', icon: Gamepad2 },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex"
      onClick={onClose}
    >
      <aside
        className="w-[min(82%,340px)] bg-white h-full flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#171717] text-white px-6 py-5 flex items-center justify-between">
          <span className="font-display text-xl font-bold">Mobile Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mobile menu"
            className="w-10 h-10 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white flex items-center justify-center"
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
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-3.5"
          >
            <Home className="w-5 h-5 text-[#b87e06]" />
            <span>Home</span>
          </button>

          {categoryItems.map(({ label, cat, icon: Icon }) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(cat);
                onClose();
              }}
              className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-3.5"
            >
              <Icon className="w-5 h-5 text-neutral-500" />
              <span>{label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              onOpenTrackOrder();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-3.5"
          >
            <Truck className="w-5 h-5 text-neutral-500" />
            <span>Track Order</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenComplaint();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-3.5"
          >
            <MessageSquareWarning className="w-5 h-5 text-neutral-500" />
            <span>Complaint</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAccount();
              onClose();
            }}
            className="w-full px-6 py-4 text-left text-[16px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-3.5"
          >
            <User className="w-5 h-5 text-neutral-500" />
            <span>My Account</span>
          </button>
        </nav>
      </aside>
    </div>
  );
}
