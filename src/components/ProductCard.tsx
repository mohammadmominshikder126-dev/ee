import { Check, Package, ShoppingBasket, Zap } from 'lucide-react';
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
    <article className="bg-white rounded-[22px] overflow-hidden shadow-[0_4px_18px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col relative">
      <span className="absolute top-3 left-3 z-10 bg-[#171717] text-white rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-sm">
        {product.isFlashBadge && <Zap className="w-3 h-3 fill-white text-white" aria-hidden="true" />}
        <span>{product.discountLabel}</span>
      </span>

      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="w-full aspect-[4/3] bg-[#f7f7f9] overflow-hidden block text-left focus-visible:outline-2 focus-visible:outline-[#12a800]"
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
        <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide mb-1">
          {product.category}
        </div>

        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="text-left focus-visible:outline-2 focus-visible:outline-[#12a800] rounded"
        >
          <h3 className="text-[15px] sm:text-base font-semibold text-[#171717] leading-snug line-clamp-2 min-h-[42px] hover:text-[#12a800] transition-colors">
            {product.name}
          </h3>
        </button>

        <div className="mt-1.5 text-[11px] font-medium text-neutral-500 font-mono-num flex items-center gap-1.5">
          <span className="text-[#12a800] font-semibold">Sold {product.sold}</span>
          <span aria-hidden="true">·</span>
          <span>Left {product.left}</span>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2 font-mono-num">
          <span className="text-[17px] sm:text-lg font-bold text-[#171717]">
            ৳{product.price.toLocaleString('en-US')}
          </span>
          <span className="text-[13px] text-neutral-400 line-through">
            ৳{product.oldPrice.toLocaleString('en-US')}
          </span>
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOrderNow(product)}
            className="flex-1 min-h-[44px] bg-[#171717] hover:bg-[#12a800] text-white rounded-[10px] px-3 py-2.5 text-xs sm:text-[13px] font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
          >
            ORDER NOW
          </button>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`w-11 h-11 rounded-[10px] border-[1.5px] flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              justAdded
                ? 'bg-[#12a800] border-[#12a800] text-white'
                : 'bg-white border-[#171717] text-[#171717] hover:bg-neutral-100'
            }`}
          >
            {justAdded ? <Check className="w-5 h-5" /> : <ShoppingBasket className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
