import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const ADMIN_PASSCODE = (process.env.ADMIN_PASSCODE || '').trim();

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
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      supabaseConfigured: Boolean(SUPABASE_URL),
      serviceRoleConfigured: Boolean(supabaseAdmin),
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

        await supabaseAdmin.from('managed_users').insert({
          id: `usr-${Date.now()}`,
          name: displayName,
          identifier: formattedPhone,
          password_hash: hashPassword(password),
          joined_at: new Date().toISOString(),
          status: 'সক্রিয়',
          source: 'রেজিস্ট্রেশন',
        });
      } catch {
        // Allow graceful fallback if table isn't created yet
      }
    }

    res.json({
      user: {
        name: displayName,
        identifier: formattedPhone,
        provider: 'credentials',
      },
    });
  });

  // Service-role protected sync endpoint for Admin & Storefront mutations
  app.post('/api/admin/sync', async (req, res) => {
    if (!supabaseAdmin) {
      res.json({ synced: false });
      return;
    }

    const { table, action, rows } = req.body as {
      table?: string;
      action?: 'replace_all' | 'upsert' | 'delete';
      rows?: unknown[];
    };

    if (!table || !ALLOWED_SYNC_TABLES.has(table)) {
      res.status(400).json({ error: 'Invalid table name' });
      return;
    }

    const publicWriteTables = new Set([
      'orders',
      'visitors',
      'complaints',
      'managed_users',
      'admin_notifications',
    ]);

    if (!publicWriteTables.has(table)) {
      const authorized = await isAdminAuthorized(req);
      if (!authorized) {
        res.status(401).json({ error: 'Admin authorization failed' });
        return;
      }
    }

    const idColumn = table === 'categories' ? 'name' : 'id';

    try {
      if (action === 'replace_all' && Array.isArray(rows)) {
        const { data: existing } = await supabaseAdmin.from(table).select(idColumn);
        const incomingIds = new Set(
          rows.map((r) => String((r as Record<string, unknown>)[idColumn]))
        );
        const toDelete = (existing || [])
          .map((row) => String((row as Record<string, unknown>)[idColumn]))
          .filter((id) => !incomingIds.has(id));

        if (toDelete.length > 0) {
          await supabaseAdmin.from(table).delete().in(idColumn, toDelete);
        }
        if (rows.length > 0) {
          await supabaseAdmin
            .from(table)
            .upsert(rows as Record<string, unknown>[], { onConflict: idColumn });
        }
        res.json({ synced: true });
        return;
      }

      if (action === 'upsert' && Array.isArray(rows) && rows.length > 0) {
        await supabaseAdmin
          .from(table)
          .upsert(rows as Record<string, unknown>[], { onConflict: idColumn });
        res.json({ synced: true });
        return;
      }

      if (action === 'delete' && Array.isArray(rows) && rows.length > 0) {
        await supabaseAdmin.from(table).delete().in(idColumn, rows.map(String));
        res.json({ synced: true });
        return;
      }

      res.status(400).json({ error: 'Invalid sync payload' });
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

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('admin_notifications').upsert(
          {
            id: notif.id,
            type: notif.type || 'order',
            title: notif.title,
            message: notif.message,
            order_id: notif.orderId || null,
            amount: notif.amount ?? null,
            trx_id: notif.trxId || null,
            created_at: notif.createdAt || new Date().toISOString(),
            is_read: false,
          },
          { onConflict: 'id' }
        );
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
