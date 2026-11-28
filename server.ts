import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const ADMIN_PASSCODE = (process.env.ADMIN_PASSCODE || '').trim();
const ENV_META_PIXEL_ID = (process.env.META_PIXEL_ID || '').replace(/\D/g, '').trim();

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

const ALLOWED_SYNC_TABLES = new Set([
  'products',
  'categories',
  'banners',
  'coupons',
  'orders',
  'managed_users',
  'complaints',
  'visitors',
  'store_settings',
  'admin_notifications',
]);

const PUBLIC_UPSERT_TABLES = new Set([
  'orders',
  'visitors',
  'complaints',
  'managed_users',
  'admin_notifications',
]);

type StoreTableName =
  | 'products'
  | 'categories'
  | 'banners'
  | 'coupons'
  | 'orders'
  | 'managed_users'
  | 'complaints'
  | 'visitors'
  | 'store_settings'
  | 'admin_notifications';

type StoreCache = Partial<Record<StoreTableName, Record<string, unknown>[]>>;

let storeCache: StoreCache = {};
const sseClients = new Set<express.Response>();

function ensureDataFileSafe(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return STORE_FILE.startsWith(DATA_DIR + path.sep);
  } catch {
    return false;
  }
}

function loadStoreFromDisk(): StoreCache {
  try {
    if (!ensureDataFileSafe() || !fs.existsSync(STORE_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as StoreCache;
    }
    return {};
  } catch {
    return {};
  }
}

function saveStoreToDisk() {
  try {
    if (!ensureDataFileSafe()) return;
    const tempFile = path.resolve(DATA_DIR, `store.${process.pid}.tmp`);
    if (!tempFile.startsWith(DATA_DIR + path.sep)) return;
    fs.writeFileSync(tempFile, JSON.stringify(storeCache), 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);
  } catch {
    // Ignore disk write failure gracefully
  }
}

function broadcastStoreUpdate(
  table: string,
  rows: Record<string, unknown>[],
  sourceClientId?: string
) {
  const payload = JSON.stringify({
    table,
    action: 'snapshot',
    rows,
    sourceClientId: sourceClientId || '',
    updatedAt: Date.now(),
  });

  const message = `event: store_update\ndata: ${payload}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

function resolveMetaPixelId(): string {
  const mainSettingsRow = storeCache.store_settings?.find((r) => String(r.id) === 'main') as
    | { settings?: { metaPixelId?: string } }
    | undefined;
  const fromSettings = String(mainSettingsRow?.settings?.metaPixelId || '')
    .replace(/\D/g, '')
    .trim();
  const candidate = fromSettings || ENV_META_PIXEL_ID;
  return /^\d{8,22}$/.test(candidate) ? candidate : '';
}

function applyMutationToStoreCache(
  table: StoreTableName,
  action: 'replace_all' | 'upsert' | 'delete',
  rows: unknown[],
  idColumn: string
): Record<string, unknown>[] {
  const current = Array.isArray(storeCache[table]) ? [...(storeCache[table] || [])] : [];

  if (action === 'replace_all') {
    const sanitized = rows
      .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
      .map((r) => ({ ...r }));
    storeCache[table] = sanitized;
    saveStoreToDisk();
    return sanitized;
  }

  if (action === 'upsert') {
    const next = [...current];
    for (const item of rows) {
      if (!item || typeof item !== 'object') continue;
      const record = { ...(item as Record<string, unknown>) };
      const rowId = String(record[idColumn] ?? '');
      if (!rowId) continue;
      const existingIdx = next.findIndex((r) => String(r[idColumn]) === rowId);
      if (existingIdx >= 0) {
        next[existingIdx] = { ...next[existingIdx], ...record };
      } else {
        if (
          table === 'orders' ||
          table === 'admin_notifications' ||
          table === 'complaints' ||
          table === 'visitors' ||
          table === 'managed_users'
        ) {
          next.unshift(record);
        } else {
          next.push(record);
        }
      }
    }
    storeCache[table] = next;
    saveStoreToDisk();
    return next;
  }

  if (action === 'delete') {
    const deleteIds = new Set(rows.map((id) => String(id)));
    const next = current.filter((r) => !deleteIds.has(String(r[idColumn])));
    storeCache[table] = next;
    saveStoreToDisk();
    return next;
  }

  return current;
}

async function hydrateFromSupabaseOnBoot() {
  storeCache = loadStoreFromDisk();
  if (!supabaseAdmin) return;

  try {
    const [prodRes, catRes, banRes, cpnRes, ordRes, usrRes, cmpRes, visRes, setRes, notifRes] =
      await Promise.all([
        supabaseAdmin.from('products').select('*').order('sort_order', { ascending: true }),
        supabaseAdmin.from('categories').select('*').order('sort_order', { ascending: true }),
        supabaseAdmin.from('banners').select('*').order('sort_order', { ascending: true }),
        supabaseAdmin.from('coupons').select('*'),
        supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('managed_users').select('*').order('joined_at', { ascending: false }),
        supabaseAdmin.from('complaints').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('visitors').select('*').order('timestamp', { ascending: false }).limit(200),
        supabaseAdmin.from('store_settings').select('*').eq('id', 'main').maybeSingle(),
        supabaseAdmin
          .from('admin_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

    if (prodRes.data && prodRes.data.length > 0) storeCache.products = prodRes.data;
    if (catRes.data && catRes.data.length > 0) storeCache.categories = catRes.data;
    if (banRes.data && banRes.data.length > 0) storeCache.banners = banRes.data;
    if (cpnRes.data && cpnRes.data.length > 0) storeCache.coupons = cpnRes.data;
    if (ordRes.data) storeCache.orders = ordRes.data;
    if (usrRes.data) storeCache.managed_users = usrRes.data;
    if (cmpRes.data) storeCache.complaints = cmpRes.data;
    if (visRes.data) storeCache.visitors = visRes.data;
    if (setRes.data) storeCache.store_settings = [setRes.data];
    if (notifRes.data) storeCache.admin_notifications = notifRes.data;

    saveStoreToDisk();
  } catch {
    // Keep disk cache if Supabase is unavailable
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

async function isAdminAuthorized(req: express.Request): Promise<boolean> {
  const pinHeader = String(req.headers['x-admin-pin'] || '').trim();
  if (ADMIN_PASSCODE) {
    return pinHeader === ADMIN_PASSCODE;
  }

  const localSettingsRow = storeCache.store_settings?.find((r) => String(r.id) === 'main') as
    | { settings?: { adminPinEnabled?: boolean; adminPin?: string } }
    | undefined;

  if (localSettingsRow?.settings?.adminPinEnabled && localSettingsRow?.settings?.adminPin) {
    return pinHeader === String(localSettingsRow.settings.adminPin);
  }

  if (!supabaseAdmin) return true;
  try {
    const { data } = await supabaseAdmin
      .from('store_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();
    const settings = (data?.settings || {}) as { adminPinEnabled?: boolean; adminPin?: string };
    if (settings.adminPinEnabled && settings.adminPin) {
      return pinHeader === String(settings.adminPin);
    }
    return true;
  } catch {
    return true;
  }
}

async function startServer() {
  await hydrateFromSupabaseOnBoot();

  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      realtimeSse: true,
      supabaseConfigured: Boolean(SUPABASE_URL),
      serviceRoleConfigured: Boolean(supabaseAdmin),
      pixelConfigured: Boolean(resolveMetaPixelId()),
    });
  });

  // Safe runtime Meta Pixel ID configuration (never hardcoded in frontend)
  app.get('/api/pixel-config', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      pixelId: resolveMetaPixelId(),
    });
  });

  // Authoritative Store Snapshot for Storefront & Admin hydration
  app.get('/api/store', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const initialized = Boolean(
      (storeCache.products && storeCache.products.length > 0) ||
        (storeCache.store_settings && storeCache.store_settings.length > 0)
    );
    const sanitizedStore: StoreCache = {
      ...storeCache,
      ...(Array.isArray(storeCache.managed_users)
        ? {
            managed_users: storeCache.managed_users.map((u) => {
              const copy = { ...u };
              delete copy.password_hash;
              return copy;
            }),
          }
        : {}),
    };
    res.json({
      initialized,
      store: sanitizedStore,
      metaPixelId: resolveMetaPixelId(),
    });
  });

  // Real-Time Server-Sent Events (SSE) stream for Admin -> User Panel instant updates
  app.get('/api/store/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, ts: Date.now() })}\n\n`);
    sseClients.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Bangladesh 10-digit mobile + password + confirmPassword login/register
  app.post('/api/auth/login', async (req, res) => {
    const body = req.body as {
      phone10?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
    };

    const digits = String(body.phone10 || '').replace(/\D/g, '');
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (!/^1[3-9]\d{8}$/.test(digits)) {
      res.status(400).json({ error: 'সঠিক ১০ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 17XXXXXXXX)।' });
      return;
    }
    if (password.length < 4) {
      res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ error: 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।' });
      return;
    }

    const formattedPhone = `0${digits}`;
    const displayName = String(body.name || '').trim() || `ক্রেতা (${formattedPhone})`;

    // Check server disk store first if Supabase isn't configured
    const localUser = (storeCache.managed_users || []).find(
      (u) => String(u.identifier) === formattedPhone
    );
    if (localUser && !supabaseAdmin) {
      if (localUser.status === 'ব্লকড') {
        res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে।' });
        return;
      }
      if (
        localUser.password_hash &&
        !verifyPassword(password, String(localUser.password_hash))
      ) {
        res.status(401).json({ error: 'ভুল পাসওয়ার্ড দিয়েছেন। সঠিক পাসওয়ার্ড দিন।' });
        return;
      }
    }

    if (supabaseAdmin) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('managed_users')
          .select('id,name,identifier,password_hash,status')
          .eq('identifier', formattedPhone)
          .maybeSingle();

        if (existing) {
          if (existing.status === 'ব্লকড') {
            res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে।' });
            return;
          }
          if (existing.password_hash && !verifyPassword(password, String(existing.password_hash))) {
            res.status(401).json({ error: 'ভুল পাসওয়ার্ড দিয়েছেন। সঠিক পাসওয়ার্ড দিন।' });
            return;
          }
          if (!existing.password_hash) {
            await supabaseAdmin
              .from('managed_users')
              .update({ password_hash: hashPassword(password) })
              .eq('id', existing.id);
          }
          res.json({
            user: {
              name: existing.name || displayName,
              identifier: formattedPhone,
              provider: 'credentials',
            },
          });
          return;
        }

        const newUserRow = {
          id: `usr-${Date.now()}`,
          name: displayName,
          identifier: formattedPhone,
          password_hash: hashPassword(password),
          joined_at: new Date().toISOString(),
          status: 'সক্রিয়',
          source: 'রেজিস্ট্রেশন',
        };

        await supabaseAdmin.from('managed_users').insert(newUserRow);
        const updatedUsers = applyMutationToStoreCache(
          'managed_users',
          'upsert',
          [
            {
              id: newUserRow.id,
              name: newUserRow.name,
              identifier: newUserRow.identifier,
              joined_at: newUserRow.joined_at,
              status: newUserRow.status,
              source: newUserRow.source,
            },
          ],
          'id'
        );
        broadcastStoreUpdate('managed_users', updatedUsers);
      } catch {
        // Allow graceful fallback if table isn't created yet
      }
    } else if (!localUser) {
      const newUserRecord = {
        id: `usr-${Date.now()}`,
        name: displayName,
        identifier: formattedPhone,
        password_hash: hashPassword(password),
        joined_at: new Date().toISOString(),
        status: 'সক্রিয়',
        source: 'রেজিস্ট্রেশন',
      };
      applyMutationToStoreCache('managed_users', 'upsert', [newUserRecord], 'id');
      const publicUsers = (storeCache.managed_users || []).map((u) => {
        const copy = { ...u };
        delete copy.password_hash;
        return copy;
      });
      broadcastStoreUpdate('managed_users', publicUsers);
    }

    res.json({
      user: {
        name: localUser ? String(localUser.name || displayName) : displayName,
        identifier: formattedPhone,
        provider: 'credentials',
      },
    });
  });

  // Authoritative sync endpoint (Server Store + Supabase + Live SSE Broadcast)
  app.post('/api/admin/sync', async (req, res) => {
    const { table, action, rows, sourceClientId } = req.body as {
      table?: string;
      action?: 'replace_all' | 'upsert' | 'delete';
      rows?: unknown[];
      sourceClientId?: string;
    };

    if (!table || !ALLOWED_SYNC_TABLES.has(table)) {
      res.status(400).json({ error: 'Invalid table name' });
      return;
    }
    if (!action || !['replace_all', 'upsert', 'delete'].includes(action)) {
      res.status(400).json({ error: 'Invalid sync action' });
      return;
    }

    const requiresAdminAuth =
      !PUBLIC_UPSERT_TABLES.has(table) || action !== 'upsert';

    if (requiresAdminAuth) {
      const authorized = await isAdminAuthorized(req);
      if (!authorized) {
        res.status(401).json({ error: 'Admin authorization failed' });
        return;
      }
    }

    const safeRows = Array.isArray(rows) ? rows : [];
    const idColumn = table === 'categories' ? 'name' : 'id';

    // Sanitize store_settings.metaPixelId if updating settings
    if (table === 'store_settings') {
      for (const r of safeRows) {
        if (r && typeof r === 'object') {
          const rec = r as { settings?: Record<string, unknown> };
          if (rec.settings && typeof rec.settings === 'object' && 'metaPixelId' in rec.settings) {
            rec.settings.metaPixelId = String(rec.settings.metaPixelId || '')
              .replace(/\D/g, '')
              .slice(0, 22);
          }
        }
      }
    }

    try {
      // 1. Always persist cleanly on server disk store & broadcast SSE to all clients immediately
      const updatedSnapshot = applyMutationToStoreCache(
        table as StoreTableName,
        action,
        safeRows,
        idColumn
      );

      // Strip sensitive password_hash before broadcasting managed_users over SSE
      const broadcastRows =
        table === 'managed_users'
          ? updatedSnapshot.map((u) => {
              const copy = { ...u };
              delete copy.password_hash;
              return copy;
            })
          : updatedSnapshot;

      broadcastStoreUpdate(table, broadcastRows, sourceClientId);

      // 2. Also persist to Supabase if configured
      if (supabaseAdmin) {
        if (action === 'replace_all') {
          const { data: existing } = await supabaseAdmin.from(table).select(idColumn);
          const incomingIds = new Set(
            safeRows.map((r) => String((r as Record<string, unknown>)[idColumn]))
          );
          const toDelete = (existing || [])
            .map((row) => String((row as Record<string, unknown>)[idColumn]))
            .filter((id) => !incomingIds.has(id));

          if (toDelete.length > 0) {
            await supabaseAdmin.from(table).delete().in(idColumn, toDelete);
          }
          if (safeRows.length > 0) {
            await supabaseAdmin
              .from(table)
              .upsert(safeRows as Record<string, unknown>[], { onConflict: idColumn });
          }
        } else if (action === 'upsert' && safeRows.length > 0) {
          await supabaseAdmin
            .from(table)
            .upsert(safeRows as Record<string, unknown>[], { onConflict: idColumn });
        } else if (action === 'delete' && safeRows.length > 0) {
          await supabaseAdmin.from(table).delete().in(idColumn, safeRows.map(String));
        }
      }

      res.json({ synced: true, realtime: true });
    } catch (err) {
      res.status(500).json({
        synced: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  });

  // Real-time Order + GoPay Mobile Push Notification endpoint
  app.post('/api/notifications/send', async (req, res) => {
    const body = req.body as {
      notification?: {
        id: string;
        type: 'order' | 'gopay' | 'complaint';
        title: string;
        message: string;
        orderId?: string;
        amount?: number;
        trxId?: string;
        createdAt: string;
        read?: boolean;
      };
      mobileNotifyEnabled?: boolean;
      mobileNotifyTopic?: string;
    };

    const notif = body.notification;
    if (!notif || !notif.title || !notif.message) {
      res.status(400).json({ error: 'Notification title and message required' });
      return;
    }

    const rowPayload = {
      id: notif.id,
      type: notif.type || 'order',
      title: notif.title,
      message: notif.message,
      order_id: notif.orderId || null,
      amount: notif.amount ?? null,
      trx_id: notif.trxId || null,
      created_at: notif.createdAt || new Date().toISOString(),
      is_read: false,
    };

    const updatedNotifs = applyMutationToStoreCache(
      'admin_notifications',
      'upsert',
      [rowPayload],
      'id'
    );
    broadcastStoreUpdate('admin_notifications', updatedNotifs);

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('admin_notifications').upsert(rowPayload, { onConflict: 'id' });
      } catch {
        // Ignore if table not yet initialized
      }
    }

    let pushDelivered = false;
    const topic = String(body.mobileNotifyTopic || '').trim();
    if (body.mobileNotifyEnabled !== false && /^[a-zA-Z0-9_-]{3,64}$/.test(topic)) {
      try {
        const pushRes = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
          method: 'POST',
          headers: {
            Title: notif.title.replace(/[^\x20-\x7E]/g, '') || 'Aponjon E-Shop Order Alert',
            Priority: notif.type === 'gopay' ? 'high' : 'default',
            Tags: notif.type === 'gopay' ? 'money_with_wings,bell' : 'shopping_cart,bell',
          },
          body: `${notif.title}\n${notif.message}`,
        });
        pushDelivered = pushRes.ok;
      } catch {
        pushDelivered = false;
      }
    }

    res.json({ ok: true, pushDelivered });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
