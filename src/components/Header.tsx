import { Menu, Search, ShoppingBasket, User } from 'lucide-react';
import { FormEvent } from 'react';
import { CategoryKey } from '../types';

interface HeaderProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  onSelectCategory: (cat: CategoryKey) => void;
  selectedCategory: CategoryKey;
  onOpenTrackOrder: () => void;
  onOpenLogin: () => void;
  userName?: string | null;
}

const DESKTOP_NAV_CATS: CategoryKey[] = ['All', 'Camera', 'Gadgets', 'Home Decor', 'Toys'];

export function Header({
  cartCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenMenu,
  onOpenCart,
  onNavigateHome,
  onSelectCategory,
  selectedCategory,
  onOpenTrackOrder,
  onOpenLogin,
  userName,
}: HeaderProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <header className="bg-white border-b border-[#e8e3d6] shadow-[0_3px_14px_rgba(18,19,22,0.05)] md:sticky md:top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              className="w-11 h-11 rounded-[14px] bg-[#f4f1ea] hover:bg-[#eae4d6] text-[#141518] flex items-center justify-center transition-colors lg:hidden shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c98e0b] rounded-xl min-w-0"
            >
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#d49b1a] bg-[#121316] shrink-0 shadow-xs flex items-center justify-center">
                <img
                  src="/assets/aistudio/Screenshot_20261124-231551_28c4b6f8.jpg"
                  alt="Apon jon e-shop logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center scale-[1.08]"
                />
              </span>
              <span className="min-w-0">
                <span className="font-display text-[20px] sm:text-[28px] font-extrabold tracking-[-0.03em] leading-none block whitespace-nowrap">
                  <span className="text-[#b87e06]">Apon jon </span>
                  <span className="text-[#141518]">e-shop</span>
                </span>
                <span className="block text-[8px] sm:text-[9px] tracking-[0.22em] text-neutral-500 font-semibold mt-1 whitespace-nowrap">
                  YOUR TRUST • OUR PROMISE
                </span>
              </span>
            </button>
          </div>

          <nav
            aria-label="Primary categories"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600"
          >
            {DESKTOP_NAV_CATS.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
                    active
                      ? 'border-[#c98e0b] text-[#141518] font-semibold'
                      : 'border-transparent hover:text-[#141518]'
                  }`}
                >
                  {cat === 'All' ? 'All Gadgets' : cat}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onOpenTrackOrder}
              className="whitespace-nowrap shrink-0 py-1.5 border-b-2 border-transparent hover:text-[#141518] transition-colors"
            >
              Track Order
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenLogin}
              className="hidden sm:flex items-center gap-2 h-11 px-3.5 rounded-xl border border-[#e3ddd0] hover:border-[#c98e0b] text-sm font-semibold text-[#141518] transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 text-[#b87e06]" />
              <span>{userName ? userName.split(' ')[0] : 'Log In'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Shopping cart with ${cartCount} items`}
              className="w-12 h-12 rounded-full bg-[#141518] hover:bg-[#24262b] text-white flex items-center justify-center relative transition-colors shrink-0 shadow-sm"
            >
              <ShoppingBasket className="w-5 h-5 text-[#f0be4d]" />
              <span className="font-mono-num absolute -right-1 -top-1 bg-[#e0ab2b] text-[#141518] border-2 border-[#141518] rounded-full text-[11px] font-extrabold w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-3 flex items-center border-2 border-[#1c1d21] rounded-[13px] p-1 bg-white h-12 focus-within:border-[#c98e0b] transition-colors"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="flex-1 min-w-0 px-3 text-[15px] text-[#141518] placeholder:text-neutral-400 outline-none bg-transparent"
          />
          <button
            type="submit"
            aria-label="Submit product search"
            className="w-10 h-9 rounded-[9px] bg-[#141518] hover:bg-[#b87e06] text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
