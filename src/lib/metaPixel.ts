import { CartItem, OrderRecord, Product } from '../types';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
    __aponjonPixelScriptInjected?: boolean;
  }
}

interface QueuedPixelEvent {
  eventName: string;
  params: Record<string, unknown>;
  eventId: string;
}

const initializedPixelIds = new Set<string>();
const firedPurchaseOrderIds = new Set<string>();
const recentEventTimestamps = new Map<string, number>();
const pendingQueue: QueuedPixelEvent[] = [];

let activePixelId = '';
let trackingEnabled = true;
let lastPageViewKey = '';
let lastPageViewAt = 0;

const PURCHASE_SESSION_KEY = 'aponjon_pixel_purchases_v1';

function loadSessionPurchases() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_SESSION_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw) as unknown;
    if (Array.isArray(ids)) {
      ids.forEach((id) => {
        if (typeof id === 'string' && id) firedPurchaseOrderIds.add(id);
      });
    }
  } catch {
    // Ignore storage issues
  }
}

function saveSessionPurchase(orderId: string) {
  firedPurchaseOrderIds.add(orderId);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      PURCHASE_SESSION_KEY,
      JSON.stringify(Array.from(firedPurchaseOrderIds).slice(-100))
    );
  } catch {
    // Ignore
  }
}

loadSessionPurchases();

export function sanitizeMetaPixelId(raw?: string): string {
  const digits = String(raw || '').replace(/\D/g, '').trim();
  return /^\d{8,22}$/.test(digits) ? digits : '';
}

export function isMetaPixelActive(): boolean {
  return trackingEnabled && Boolean(activePixelId);
}

function ensureFbqBootstrap() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (!window.fbq) {
    const fbqFunc = function (...args: unknown[]) {
      if (fbqFunc.callMethod) {
        fbqFunc.callMethod(...args);
      } else {
        fbqFunc.queue?.push(args);
      }
    } as NonNullable<Window['fbq']>;

    fbqFunc.queue = [];
    fbqFunc.loaded = true;
    fbqFunc.version = '2.0';
    fbqFunc.push = (...args: unknown[]) => fbqFunc(...args);
    window.fbq = fbqFunc;
    if (!window._fbq) window._fbq = fbqFunc;
  }

  if (!window.__aponjonPixelScriptInjected && !document.getElementById('meta-pixel-fbevents')) {
    window.__aponjonPixelScriptInjected = true;
    const script = document.createElement('script');
    script.id = 'meta-pixel-fbevents';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
}

function createEventId(prefix: string, seed?: string): string {
  const cleanSeed = (seed || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  if (cleanSeed) return `${prefix}_${cleanSeed}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isDuplicateWithinWindow(dedupeKey: string, windowMs: number): boolean {
  const now = Date.now();
  const prev = recentEventTimestamps.get(dedupeKey);
  if (prev && now - prev < windowMs) {
    return true;
  }
  recentEventTimestamps.set(dedupeKey, now);
  if (recentEventTimestamps.size > 120) {
    for (const [k, ts] of recentEventTimestamps.entries()) {
      if (now - ts > 60000) recentEventTimestamps.delete(k);
    }
  }
  return false;
}

function dispatchPixelEvent(
  eventName: string,
  params: Record<string, unknown>,
  eventId: string
) {
  if (typeof window === 'undefined' || !trackingEnabled) return;

  if (!activePixelId) {
    if (pendingQueue.length < 25) {
      pendingQueue.push({ eventName, params, eventId });
    }
    return;
  }

  ensureFbqBootstrap();
  window.fbq?.('track', eventName, params, { eventID: eventId });
}

export function configureMetaPixel(pixelIdInput?: string, enabled = true) {
  trackingEnabled = enabled;
  const cleanId = sanitizeMetaPixelId(pixelIdInput);

  if (!enabled || !cleanId) {
    activePixelId = '';
    return;
  }

  activePixelId = cleanId;
  ensureFbqBootstrap();

  if (!initializedPixelIds.has(cleanId)) {
    initializedPixelIds.add(cleanId);
    window.fbq?.('init', cleanId);
  }

  while (pendingQueue.length > 0) {
    const next = pendingQueue.shift();
    if (next) {
      window.fbq?.('track', next.eventName, next.params, { eventID: next.eventId });
    }
  }
}

export function trackPixelPageView(routeKey: string) {
  if (!trackingEnabled) return;
  const normalized = routeKey || '/';
  const now = Date.now();
  if (normalized === lastPageViewKey && now - lastPageViewAt < 1200) {
    return;
  }
  lastPageViewKey = normalized;
  lastPageViewAt = now;

  dispatchPixelEvent(
    'PageView',
    { page_path: normalized },
    createEventId('pv', `${normalized}_${Math.floor(now / 1200)}`)
  );
}

export function trackPixelViewContent(product: Product) {
  if (!trackingEnabled || !product?.id) return;
  if (isDuplicateWithinWindow(`vc:${product.id}`, 1500)) return;

  dispatchPixelEvent(
    'ViewContent',
    {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      content_type: 'product',
      value: Number(product.price) || 0,
      currency: 'BDT',
    },
    createEventId('vc', `${product.id}_${Date.now()}`)
  );
}

export function trackPixelAddToCart(
  product: Product,
  quantity = 1,
  selectedColor?: string
) {
  if (!trackingEnabled || !product?.id) return;
  const safeQty = Math.max(1, Number(quantity) || 1);
  const colorKey = selectedColor || 'default';
  if (isDuplicateWithinWindow(`atc:${product.id}:${safeQty}:${colorKey}`, 600)) return;

  dispatchPixelEvent(
    'AddToCart',
    {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      content_type: 'product',
      contents: [
        {
          id: product.id,
          quantity: safeQty,
          item_price: Number(product.price) || 0,
        },
      ],
      value: (Number(product.price) || 0) * safeQty,
      currency: 'BDT',
    },
    createEventId('atc', `${product.id}_${Date.now()}`)
  );
}

export function trackPixelInitiateCheckout(items: CartItem[], totalAmount?: number) {
  if (!trackingEnabled || !items || items.length === 0) return;
  const signature = items
    .map((i) => `${i.product.id}x${i.quantity}`)
    .sort()
    .join(',');
  if (isDuplicateWithinWindow(`ic:${signature}`, 1200)) return;

  const computedSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
    0
  );
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);

  dispatchPixelEvent(
    'InitiateCheckout',
    {
      content_ids: items.map((i) => i.product.id),
      content_type: 'product',
      contents: items.map((i) => ({
        id: i.product.id,
        quantity: i.quantity,
        item_price: Number(i.product.price) || 0,
      })),
      num_items: numItems,
      value: Number(totalAmount ?? computedSubtotal) || 0,
      currency: 'BDT',
    },
    createEventId('ic', `${Date.now()}`)
  );
}

export function trackPixelPurchase(order: OrderRecord) {
  if (!trackingEnabled || !order?.id) return;
  if (firedPurchaseOrderIds.has(order.id)) return;
  saveSessionPurchase(order.id);

  const numItems = order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  dispatchPixelEvent(
    'Purchase',
    {
      value: Number(order.total) || 0,
      currency: 'BDT',
      content_ids: order.items.map((i) => i.productId),
      content_type: 'product',
      contents: order.items.map((i) => ({
        id: i.productId,
        quantity: Number(i.quantity) || 1,
        item_price: Number(i.price) || 0,
      })),
      num_items: numItems,
      order_id: order.id,
    },
    createEventId('purchase', order.id)
  );
}

export function trackPixelLead(leadSource: string, metadata?: Record<string, unknown>) {
  if (!trackingEnabled) return;
  const key = `lead:${leadSource}:${String(metadata?.identifier || '')}`;
  if (isDuplicateWithinWindow(key, 2000)) return;

  dispatchPixelEvent(
    'Lead',
    {
      content_name: leadSource,
      currency: 'BDT',
      value: 0,
      ...(metadata || {}),
    },
    createEventId('lead', `${leadSource}_${Date.now()}`)
  );
}
