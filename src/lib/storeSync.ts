import {
  AdminNotification,
  BannerSlide,
  ComplaintTicket,
  CouponCode,
  ManagedUser,
  OrderRecord,
  Product,
  VisitorEntry,
  WebsiteSettings,
} from '../types';
import {
  DEFAULT_BANNERS,
  DEFAULT_CATEGORIES,
  DEFAULT_COUPONS,
  DEFAULT_PRODUCT_COLOR_IDS,
  DEFAULT_WEBSITE_SETTINGS,
} from '../data/storeDefaults';
import { PRODUCTS } from '../data/products';
import { isSupabaseConfigured, supabase } from './supabase';

// Row mappers between app TypeScript models and Supabase snake_case tables
export function productToRow(p: Product, idx = 0) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    old_price: p.oldPrice,
    discount_label: p.discountLabel,
    is_flash_badge: Boolean(p.isFlashBadge),
    free_delivery: Boolean(p.freeDelivery),
    image: p.image,
    gallery_images: p.galleryImages || [],
    colors: p.colors && p.colors.length > 0 ? p.colors : DEFAULT_PRODUCT_COLOR_IDS,
    sold: Number(p.sold) || 0,
    stock_left: Number(p.left) || 0,
    short_desc: p.shortDesc || '',
    specs: p.specs || [],
    sort_order: idx,
    updated_at: new Date().toISOString(),
  };
}

export function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: String(r.id),
    name: String(r.name || ''),
    category: String(r.category || ''),
    price: Number(r.price) || 0,
    oldPrice: Number(r.old_price) || 0,
    discountLabel: String(r.discount_label || ''),
    isFlashBadge: Boolean(r.is_flash_badge),
    freeDelivery: Boolean(r.free_delivery),
    image: String(r.image || ''),
    galleryImages: Array.isArray(r.gallery_images) ? (r.gallery_images as string[]) : [],
    colors:
      Array.isArray(r.colors) && r.colors.length > 0
        ? (r.colors as string[])
        : DEFAULT_PRODUCT_COLOR_IDS,
    sold: Number(r.sold) || 0,
    left: Number(r.stock_left) || 0,
    shortDesc: String(r.short_desc || ''),
    specs: Array.isArray(r.specs) ? (r.specs as string[]) : [],
  };
}

export function orderToRow(o: OrderRecord) {
  return {
    id: o.id,
    created_at: o.createdAt,
    customer_name: o.customerName,
    phone: o.phone,
    address: o.address,
    zone: o.zone,
    payment_method: o.paymentMethod,
    payment_details: o.paymentDetails || null,
    payment_verified: Boolean(o.paymentVerified),
    items: o.items,
    subtotal: o.subtotal,
    discount: o.discount || 0,
    coupon_code: o.couponCode || null,
    delivery_fee: o.deliveryFee,
    total: o.total,
    status: o.status,
  };
}

export function rowToOrder(r: Record<string, unknown>): OrderRecord {
  return {
    id: String(r.id),
    createdAt: String(r.created_at || new Date().toISOString()),
    customerName: String(r.customer_name || ''),
    phone: String(r.phone || ''),
    address: String(r.address || ''),
    zone: (r.zone === 'outside' ? 'outside' : 'dhaka') as OrderRecord['zone'],
    paymentMethod: String(r.payment_method || 'cod') as OrderRecord['paymentMethod'],
    paymentDetails: r.payment_details ? String(r.payment_details) : undefined,
    paymentVerified: Boolean(r.payment_verified),
    items: Array.isArray(r.items) ? (r.items as OrderRecord['items']) : [],
    subtotal: Number(r.subtotal) || 0,
    discount: Number(r.discount) || 0,
    couponCode: r.coupon_code ? String(r.coupon_code) : undefined,
    deliveryFee: Number(r.delivery_fee) || 0,
    total: Number(r.total) || 0,
    status: (String(r.status || 'অর্ডার গ্রহণ') as OrderRecord['status']),
  };
}

export function bannerToRow(b: BannerSlide, idx = 0) {
  return {
    id: b.id,
    src: b.src,
    alt: b.alt,
    active: b.active,
    sort_order: idx,
    updated_at: new Date().toISOString(),
  };
}

export function rowToBanner(r: Record<string, unknown>): BannerSlide {
  return {
    id: String(r.id),
    src: String(r.src || ''),
    alt: String(r.alt || ''),
    active: r.active !== false,
  };
}

export function couponToRow(c: CouponCode) {
  return {
    id: c.id,
    code: c.code,
    discount_type: c.discountType,
    value: c.value,
    min_order: c.minOrder,
    active: c.active,
    updated_at: new Date().toISOString(),
  };
}

export function rowToCoupon(r: Record<string, unknown>): CouponCode {
  return {
    id: String(r.id),
    code: String(r.code || ''),
    discountType: r.discount_type === 'flat' ? 'flat' : 'percent',
    value: Number(r.value) || 0,
    minOrder: Number(r.min_order) || 0,
    active: r.active !== false,
  };
}

export function userToRow(u: ManagedUser) {
  return {
    id: u.id,
    name: u.name,
    identifier: u.identifier,
    address: u.address || null,
    joined_at: u.joinedAt,
    status: u.status,
    source: u.source,
  };
}

export function rowToUser(r: Record<string, unknown>): ManagedUser {
  return {
    id: String(r.id),
    name: String(r.name || ''),
    identifier: String(r.identifier || ''),
    address: r.address ? String(r.address) : undefined,
    joinedAt: String(r.joined_at || new Date().toISOString()),
    status: r.status === 'ব্লকড' ? 'ব্লকড' : 'সক্রিয়',
    source: (String(r.source || 'রেজিস্ট্রেশন') as ManagedUser['source']),
  };
}

export function complaintToRow(c: ComplaintTicket) {
  return {
    id: c.id,
    order_ref: c.orderRef || null,
    phone: c.phone,
    message: c.message,
    created_at: c.createdAt,
    status: c.status,
  };
}

export function rowToComplaint(r: Record<string, unknown>): ComplaintTicket {
  return {
    id: String(r.id),
    orderRef: r.order_ref ? String(r.order_ref) : undefined,
    phone: String(r.phone || ''),
    message: String(r.message || ''),
    createdAt: String(r.created_at || new Date().toISOString()),
    status: r.status === 'সমাধান হয়েছে' ? 'সমাধান হয়েছে' : 'নতুন',
  };
}

export function visitorToRow(v: VisitorEntry) {
  return {
    id: v.id,
    timestamp: v.timestamp,
    date_key: v.dateKey,
    device: v.device,
    page: v.page,
    referrer: v.referrer,
  };
}

export function rowToVisitor(r: Record<string, unknown>): VisitorEntry {
  return {
    id: String(r.id),
    timestamp: String(r.timestamp || new Date().toISOString()),
    dateKey: String(r.date_key || ''),
    device: r.device === 'ডেস্কটপ' ? 'ডেস্কটপ' : 'মোবাইল',
    page: String(r.page || 'হোম স্টোর'),
    referrer: String(r.referrer || 'সরাসরি ভিজিট'),
  };
}

export function notificationToRow(n: AdminNotification) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    order_id: n.orderId || null,
    amount: n.amount ?? null,
    trx_id: n.trxId || null,
    created_at: n.createdAt,
    is_read: n.read,
  };
}

export function rowToNotification(r: Record<string, unknown>): AdminNotification {
  return {
    id: String(r.id),
    type: (r.type === 'gopay' || r.type === 'complaint' ? r.type : 'order'),
    title: String(r.title || ''),
    message: String(r.message || ''),
    orderId: r.order_id ? String(r.order_id) : undefined,
    amount: r.amount != null ? Number(r.amount) : undefined,
    trxId: r.trx_id ? String(r.trx_id) : undefined,
    createdAt: String(r.created_at || new Date().toISOString()),
    read: Boolean(r.is_read),
  };
}

async function tryApiSync(
  table: string,
  action: 'replace_all' | 'upsert' | 'delete',
  rows: unknown,
  adminPin?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminPin ? { 'x-admin-pin': adminPin } : {}),
      },
      body: JSON.stringify({ table, action, rows }),
    });
    if (res.ok) {
      const data = (await res.json()) as { synced?: boolean };
      return Boolean(data.synced);
    }
  } catch {
    // Running statically (e.g., Workers.dev without Node backend) -> fallback to Supabase client
  }
  return false;
}

export async function syncTableReplaceAll(
  table: string,
  rows: Record<string, unknown>[],
  idColumn = 'id',
  adminPin?: string
) {
  const viaServer = await tryApiSync(table, 'replace_all', rows, adminPin);
  if (viaServer || !supabase) return;

  try {
    const { data: existing } = await supabase.from(table).select(idColumn);
    const incomingIds = new Set(rows.map((r) => String(r[idColumn])));
    const toDelete = (existing || [])
      .map((row) => String((row as unknown as Record<string, unknown>)[idColumn]))
      .filter((id) => !incomingIds.has(id));

    if (toDelete.length > 0) {
      await supabase.from(table).delete().in(idColumn, toDelete);
    }
    if (rows.length > 0) {
      await supabase.from(table).upsert(rows, { onConflict: idColumn });
    }
  } catch {
    // Ignore sync errors gracefully so UI stays responsive
  }
}

export async function syncSingleUpsert(
  table: string,
  row: Record<string, unknown>,
  idColumn = 'id',
  adminPin?: string
) {
  const viaServer = await tryApiSync(table, 'upsert', [row], adminPin);
  if (viaServer || !supabase) return;

  try {
    await supabase.from(table).upsert(row, { onConflict: idColumn });
  } catch {
    // Ignore
  }
}

export async function syncSingleDelete(
  table: string,
  id: string,
  idColumn = 'id',
  adminPin?: string
) {
  const viaServer = await tryApiSync(table, 'delete', [id], adminPin);
  if (viaServer || !supabase) return;

  try {
    await supabase.from(table).delete().eq(idColumn, id);
  } catch {
    // Ignore
  }
}

export async function syncWebsiteSettings(settings: WebsiteSettings, adminPin?: string) {
  await syncSingleUpsert(
    'store_settings',
    {
      id: 'main',
      settings,
      updated_at: new Date().toISOString(),
    },
    'id',
    adminPin
  );
}

export async function dispatchOrderAndMobileNotification(params: {
  notification: AdminNotification;
  mobileNotifyEnabled?: boolean;
  mobileNotifyTopic?: string;
}) {
  const { notification, mobileNotifyEnabled, mobileNotifyTopic } = params;

  // 1. Save to Supabase admin_notifications so Admin Panel receives Realtime alert immediately
  await syncSingleUpsert('admin_notifications', notificationToRow(notification), 'id');

  // 2. Try server route first (which handles ntfy + service role cleanly)
  let serverSent = false;
  try {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification,
        mobileNotifyEnabled,
        mobileNotifyTopic,
      }),
    });
    if (res.ok) serverSent = true;
  } catch {
    // Static deploy fallback
  }

  // 3. Static deployment fallback (Cloudflare Workers): push directly to ntfy.sh if topic configured
  if (!serverSent && mobileNotifyEnabled && mobileNotifyTopic) {
    const cleanTopic = mobileNotifyTopic.trim();
    if (/^[a-zA-Z0-9_-]{3,64}$/.test(cleanTopic)) {
      try {
        await fetch(`https://ntfy.sh/${encodeURIComponent(cleanTopic)}`, {
          method: 'POST',
          headers: {
            Title: notification.title.replace(/[^\x20-\x7E]/g, '') || 'Aponjon E-Shop Alert',
            Priority: notification.type === 'gopay' ? 'high' : 'default',
            Tags: notification.type === 'gopay' ? 'money_with_wings,bell' : 'shopping_cart,bell',
          },
          body: `${notification.title}\n${notification.message}`,
        });
      } catch {
        // Ignore network/CORS failures silently
      }
    }
  }
}

export interface InitialSupabaseSnapshot {
  products?: Product[];
  categories?: string[];
  banners?: BannerSlide[];
  coupons?: CouponCode[];
  orders?: OrderRecord[];
  users?: ManagedUser[];
  complaints?: ComplaintTicket[];
  visitors?: VisitorEntry[];
  settings?: WebsiteSettings;
  notifications?: AdminNotification[];
}

export async function fetchInitialSupabaseStore(): Promise<InitialSupabaseSnapshot | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [
      prodRes,
      catRes,
      banRes,
      cpnRes,
      ordRes,
      usrRes,
      cmpRes,
      visRes,
      setRes,
      notifRes,
    ] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('banners').select('*').order('sort_order', { ascending: true }),
      supabase.from('coupons').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('managed_users').select('*').order('joined_at', { ascending: false }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('visitors').select('*').order('timestamp', { ascending: false }).limit(200),
      supabase.from('store_settings').select('*').eq('id', 'main').maybeSingle(),
      supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const snapshot: InitialSupabaseSnapshot = {};

    if (prodRes.data && prodRes.data.length > 0) {
      snapshot.products = prodRes.data.map((r) => rowToProduct(r as Record<string, unknown>));
    } else if (!prodRes.error) {
      // Seed defaults once if Supabase table is empty
      await syncTableReplaceAll(
        'products',
        PRODUCTS.map((p, idx) => productToRow(p, idx))
      );
    }

    if (catRes.data && catRes.data.length > 0) {
      snapshot.categories = catRes.data.map((r) => String((r as Record<string, unknown>).name));
    } else if (!catRes.error) {
      await syncTableReplaceAll(
        'categories',
        DEFAULT_CATEGORIES.map((name, idx) => ({ name, sort_order: idx })),
        'name'
      );
    }

    if (banRes.data && banRes.data.length > 0) {
      snapshot.banners = banRes.data.map((r) => rowToBanner(r as Record<string, unknown>));
    } else if (!banRes.error) {
      await syncTableReplaceAll(
        'banners',
        DEFAULT_BANNERS.map((b, idx) => bannerToRow(b, idx))
      );
    }

    if (cpnRes.data && cpnRes.data.length > 0) {
      snapshot.coupons = cpnRes.data.map((r) => rowToCoupon(r as Record<string, unknown>));
    } else if (!cpnRes.error) {
      await syncTableReplaceAll(
        'coupons',
        DEFAULT_COUPONS.map((c) => couponToRow(c))
      );
    }

    if (ordRes.data) {
      snapshot.orders = ordRes.data.map((r) => rowToOrder(r as Record<string, unknown>));
    }
    if (usrRes.data) {
      snapshot.users = usrRes.data.map((r) => rowToUser(r as Record<string, unknown>));
    }
    if (cmpRes.data) {
      snapshot.complaints = cmpRes.data.map((r) => rowToComplaint(r as Record<string, unknown>));
    }
    if (visRes.data) {
      snapshot.visitors = visRes.data.map((r) => rowToVisitor(r as Record<string, unknown>));
    }
    if (setRes.data && (setRes.data as Record<string, unknown>).settings) {
      snapshot.settings = {
        ...DEFAULT_WEBSITE_SETTINGS,
        ...((setRes.data as Record<string, unknown>).settings as Partial<WebsiteSettings>),
      };
    } else if (!setRes.error) {
      await syncWebsiteSettings(DEFAULT_WEBSITE_SETTINGS);
    }
    if (notifRes.data) {
      snapshot.notifications = notifRes.data.map((r) =>
        rowToNotification(r as Record<string, unknown>)
      );
    }

    return snapshot;
  } catch {
    return null;
  }
}

export interface RealtimeCallbacks {
  onProductsChange: () => void;
  onCategoriesChange: () => void;
  onBannersChange: () => void;
  onCouponsChange: () => void;
  onOrdersChange: () => void;
  onUsersChange: () => void;
  onComplaintsChange: () => void;
  onSettingsChange: (settings: WebsiteSettings) => void;
  onNewNotification: (notif: AdminNotification) => void;
  onStatusChange?: (connected: boolean) => void;
}

export function subscribeRealtimeStore(callbacks: RealtimeCallbacks): () => void {
  if (!isSupabaseConfigured || !supabase) {
    callbacks.onStatusChange?.(false);
    return () => {};
  }

  const channel = supabase
    .channel('aponjon-realtime-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      callbacks.onProductsChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
      callbacks.onCategoriesChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
      callbacks.onBannersChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => {
      callbacks.onCouponsChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      callbacks.onOrdersChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'managed_users' }, () => {
      callbacks.onUsersChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
      callbacks.onComplaintsChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
      const rec = payload.new as Record<string, unknown> | undefined;
      if (rec?.settings) {
        callbacks.onSettingsChange({
          ...DEFAULT_WEBSITE_SETTINGS,
          ...(rec.settings as Partial<WebsiteSettings>),
        });
      }
    })
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
      (payload) => {
        if (payload.new) {
          callbacks.onNewNotification(rowToNotification(payload.new as Record<string, unknown>));
        }
      }
    )
    .subscribe((status) => {
      callbacks.onStatusChange?.(status === 'SUBSCRIBED');
    });

  return () => {
    supabase?.removeChannel(channel);
  };
}
