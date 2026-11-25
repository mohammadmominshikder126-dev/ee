import { Check, Package, ShoppingBasket, Truck, Zap } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOrderNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductCard({
  product,
  onOrderNow,
  onAddToCart,
  onSelectProduct,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <article className="bg-white rounded-[22px] overflow-hidden border border-[#ebe6da] shadow-[0_4px_18px_rgba(18,19,22,0.05)] hover:shadow-[0_10px_28px_rgba(18,19,22,0.09)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col relative">
      <span className="absolute top-3 left-3 z-10 bg-[#141518] text-white rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-sm border border-[#c98e0b]/40">
        {product.isFlashBadge && (
          <Zap className="w-3 h-3 fill-[#f0be4d] text-[#f0be4d]" aria-hidden="true" />
        )}
        <span>{product.discountLabel}</span>
      </span>

      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="w-full aspect-[4/3] bg-[#faf8f4] overflow-hidden block text-left focus-visible:outline-2 focus-visible:outline-[#c98e0b]"
      >
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-500 p-4 text-center">
            <Package className="w-8 h-8 mb-2 text-neutral-400" />
            <span className="text-xs font-medium">{product.name}</span>
          </div>
        )}
      </button>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <div className="text-[11px] font-medium text-neutral-500 mb-1">{product.category}</div>

        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="text-left focus-visible:outline-2 focus-visible:outline-[#c98e0b] rounded"
        >
          <h3 className="text-[15px] sm:text-base font-semibold text-[#141518] leading-snug line-clamp-2 min-h-[42px] hover:text-[#b87e06] transition-colors">
            {product.name}
          </h3>
        </button>

        <div className="mt-1.5 text-[11px] font-medium text-neutral-500 font-mono-num flex items-center gap-1.5">
          <span className="text-[#b87e06] font-semibold">বিক্রি {product.sold}</span>
          <span aria-hidden="true">·</span>
          <span>বাকি {product.left}</span>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2 font-mono-num">
          <span className="text-[17px] sm:text-lg font-bold text-[#141518]">
            ৳{product.price.toLocaleString('en-US')}
          </span>
          <span className="text-[13px] text-neutral-400 line-through">
            ৳{product.oldPrice.toLocaleString('en-US')}
          </span>
        </div>

        {product.freeDelivery && (
          <div className="mt-2 inline-flex items-center gap-1.5 self-start bg-[#12a800] text-white rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs">
            <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>ফ্রি হোম ডেলিভারি</span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOrderNow(product)}
            className="flex-1 min-h-[44px] bg-[#141518] hover:bg-[#b87e06] text-white rounded-[10px] px-3 py-2.5 text-xs sm:text-[13px] font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
          >
            অর্ডার করুন
          </button>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`${product.name} কার্টে যোগ করুন`}
            className={`w-11 h-11 rounded-[10px] border-[1.5px] flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              justAdded
                ? 'bg-[#c98e0b] border-[#c98e0b] text-white'
                : 'bg-white border-[#141518] text-[#141518] hover:bg-[#faf6eb]'
            }`}
          >
            {justAdded ? <Check className="w-5 h-5" /> : <ShoppingBasket className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
