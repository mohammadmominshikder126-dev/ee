import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#12a800]" />
            <h2 className="font-display text-lg font-bold text-[#171717]">
              Your Cart ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#171717]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#171717]">Your cart is empty</h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                Browse our Flash Sale gadgets and tap the cart icon to add items here.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-6 py-3 rounded-xl bg-[#171717] text-white text-sm font-bold hover:bg-[#12a800] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3.5 p-3 rounded-2xl border border-neutral-100 bg-neutral-50/70"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#171717] truncate">
                      {product.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="text-neutral-400 hover:text-red-600 p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[#12a800] mt-1">
                    ৳{(product.price * quantity).toLocaleString('en-US')}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-mono-num">
                      ৳{product.price.toLocaleString('en-US')} each
                    </span>
                    <div className="flex items-center border border-neutral-200 bg-white rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(product.id, -1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono-num font-bold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(product.id, 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono-num font-bold text-lg text-[#171717]">
                ৳{subtotal.toLocaleString('en-US')}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Delivery: ৳60 inside Dhaka · ৳120 outside Dhaka (Cash on Delivery available)
            </p>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full min-h-[48px] rounded-xl bg-[#12a800] hover:bg-[#0e8f00] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
