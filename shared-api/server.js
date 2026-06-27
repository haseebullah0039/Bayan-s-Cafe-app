const express = require('express');
const cors    = require('cors');
const path    = require('path');
const crypto  = require('crypto');
const Database = require('better-sqlite3');

const app  = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ── SQLite Database ───────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'bayans-cafe.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    phone         TEXT DEFAULT '',
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt          TEXT NOT NULL,
    token         TEXT,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               TEXT PRIMARY KEY,
    order_number     TEXT UNIQUE NOT NULL,
    customer_name    TEXT NOT NULL,
    customer_phone   TEXT DEFAULT '',
    order_type       TEXT DEFAULT 'dine_in',
    table_number     TEXT,
    delivery_address TEXT,
    payment_method   TEXT DEFAULT 'cash',
    status           TEXT DEFAULT 'placed',
    items            TEXT DEFAULT '[]',
    subtotal         REAL DEFAULT 0,
    total            REAL DEFAULT 0,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id            TEXT PRIMARY KEY,
    order_number  TEXT DEFAULT '',
    customer_name TEXT NOT NULL,
    rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment       TEXT DEFAULT '',
    created_at    TEXT NOT NULL
  );
`);

// ── Migrate: add columns that didn't exist in the original schema ─────────────
try { db.exec('ALTER TABLE users ADD COLUMN google_id TEXT'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN photo_url TEXT'); } catch {}

// ── Auth Helpers ──────────────────────────────────────────────────────────────
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
}

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

function safeUser(u) {
  return { id: u.id, name: u.name, phone: u.phone, email: u.email, created_at: u.created_at };
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.slice(7);
  const user  = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
  if (!user) return res.status(401).json({ message: 'Invalid or expired token' });
  req.user = user;
  next();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let counter = (() => {
  const row = db.prepare("SELECT COUNT(*) as n FROM orders").get();
  return (row.n || 0) + 1;
})();

function orderNumber() {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dt  = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  return `BC-${dt}-${String(counter++).padStart(4, '0')}`;
}

function parseOrder(row) {
  if (!row) return null;
  return { ...row, items: JSON.parse(row.items || '[]') };
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.json({ status: 'ok', app: 'Bayans Cafe API', port: PORT, db: 'SQLite' }));

// ── Auth ──────────────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing)
    return res.status(409).json({ message: 'An account with this email already exists' });

  const salt  = crypto.randomBytes(16).toString('hex');
  const token = newToken();
  const user  = {
    id:            Date.now().toString(),
    name:          name.trim(),
    phone:         (phone || '').trim(),
    email:         email.toLowerCase().trim(),
    password_hash: hashPassword(password, salt),
    salt,
    token,
    created_at:    new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO users (id, name, phone, email, password_hash, salt, token, created_at)
    VALUES (@id, @name, @phone, @email, @password_hash, @salt, @token, @created_at)
  `).run(user);

  console.log(`👤 New user: ${user.name} <${user.email}>`);
  res.status(201).json({ data: { token, user: safeUser(user) } });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const hash = hashPassword(password, user.salt);
  if (hash !== user.password_hash)
    return res.status(401).json({ message: 'Invalid email or password' });

  const token = newToken();
  db.prepare('UPDATE users SET token = ? WHERE id = ?').run(token, user.id);

  console.log(`🔐 Login: ${user.name} <${user.email}>`);
  res.json({ data: { token, user: safeUser({ ...user, token }) } });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ data: safeUser(req.user) });
});

// POST /api/auth/google  — called after client-side Google OAuth
app.post('/api/auth/google', (req, res) => {
  const { google_id, name, email, photo_url } = req.body;
  if (!google_id || !email)
    return res.status(400).json({ message: 'google_id and email are required' });

  const emailLower = email.toLowerCase().trim();

  // Try to find by google_id first, then by email (link existing account)
  let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(google_id)
           || db.prepare('SELECT * FROM users WHERE email = ?').get(emailLower);

  const token = newToken();

  if (user) {
    // Link google_id if not already set + refresh token
    db.prepare('UPDATE users SET token = ?, google_id = ?, photo_url = ? WHERE id = ?')
      .run(token, google_id, photo_url || user.photo_url || '', user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  } else {
    // Create brand-new Google user (no password needed)
    const salt = crypto.randomBytes(16).toString('hex');
    user = {
      id:            Date.now().toString(),
      name:          (name || 'Google User').trim(),
      phone:         '',
      email:         emailLower,
      password_hash: '',           // no password for Google users
      salt,
      google_id,
      photo_url:     photo_url || '',
      token,
      created_at:    new Date().toISOString(),
    };
    db.prepare(`
      INSERT INTO users (id, name, phone, email, password_hash, salt, google_id, photo_url, token, created_at)
      VALUES (@id, @name, @phone, @email, @password_hash, @salt, @google_id, @photo_url, @token, @created_at)
    `).run(user);
    console.log(`👤 New Google user: ${user.name} <${user.email}>`);
  }

  console.log(`🔐 Google login: ${user.name} <${user.email}>`);
  res.json({ data: { token, user: safeUser(user) } });
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  let sql  = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (req.query.status && req.query.status !== 'all') {
    sql += ' AND status = ?'; params.push(req.query.status);
  }
  if (req.query.search) {
    const q = `%${req.query.search}%`;
    sql += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    params.push(q, q, q);
  }

  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({ data: rows.map(parseOrder) });
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const body = req.body;
  const now  = new Date().toISOString();

  const items = (body.items || []).map((it, idx) => ({
    id:           String(idx),
    product_name: it.product_name || it.name || 'Item',
    price:        Number(it.price)    || 0,
    quantity:     Number(it.quantity) || 1,
    subtotal:     (Number(it.price) || 0) * (Number(it.quantity) || 1),
  }));

  const order = {
    id:               Date.now().toString(),
    order_number:     orderNumber(),
    customer_name:    body.customer_name  || body.name  || 'Guest',
    customer_phone:   body.customer_phone || body.phone || '',
    order_type:       body.order_type     || 'dine_in',
    table_number:     body.table_number   || null,
    delivery_address: body.delivery_address || null,
    payment_method:   body.payment_method || 'cash',
    status:           'placed',
    items:            JSON.stringify(items),
    subtotal:         Number(body.subtotal) || 0,
    total:            Number(body.total)    || 0,
    created_at:       now,
    updated_at:       now,
  };

  db.prepare(`
    INSERT INTO orders (id, order_number, customer_name, customer_phone, order_type,
      table_number, delivery_address, payment_method, status, items, subtotal, total, created_at, updated_at)
    VALUES (@id, @order_number, @customer_name, @customer_phone, @order_type,
      @table_number, @delivery_address, @payment_method, @status, @items, @subtotal, @total, @created_at, @updated_at)
  `).run(order);

  console.log(`\n📦 New Order: ${order.order_number} — ${order.customer_name} — PKR ${order.total}`);
  res.status(201).json({ data: parseOrder(order) });
});

// GET /api/orders/track/:orderNumber
app.get('/api/orders/track/:orderNumber', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(req.params.orderNumber);
  if (!row) return res.status(404).json({ message: 'Order not found' });
  res.json({ data: parseOrder(row) });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?')
                .get(req.params.id, req.params.id);
  if (!row) return res.status(404).json({ message: 'Order not found' });
  res.json({ data: parseOrder(row) });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req, res) => {
  const now = new Date().toISOString();
  const result = db.prepare(
    'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?'
  ).run(req.body.status, now, req.params.id);

  if (result.changes === 0) return res.status(404).json({ message: 'Order not found' });
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  console.log(`✏️  Status: ${row.order_number} → ${row.status}`);
  res.json({ data: parseOrder(row) });
});

// GET /api/dashboard
app.get('/api/dashboard', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const done  = ['delivered', 'received'];

  const todayOrders = db.prepare("SELECT * FROM orders WHERE created_at LIKE ?").all(`${today}%`);
  const allOrders   = db.prepare("SELECT * FROM orders").all();

  const todayRevenue   = todayOrders.filter(o => done.includes(o.status)).reduce((s, o) => s + o.total, 0);
  const activeOrders   = allOrders.filter(o => !done.includes(o.status));
  const completedToday = todayOrders.filter(o => done.includes(o.status));
  const recent         = allOrders.sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);

  const countByStatus = (s) => allOrders.filter(o => o.status === s).length;

  res.json({
    data: {
      today_orders:     todayOrders.length,
      today_revenue:    Math.round(todayRevenue),
      active_orders:    activeOrders.length,
      completed_orders: completedToday.length,
      total_products:   23,
      recent_orders:    recent.map(parseOrder),
      status_breakdown: {
        placed:     countByStatus('placed'),
        preparing:  countByStatus('preparing'),
        ready:      countByStatus('ready'),
        on_the_way: countByStatus('on_the_way'),
        delivered:  countByStatus('delivered'),
        received:   countByStatus('received'),
      },
    }
  });
});

// ── Reviews ───────────────────────────────────────────────────────────────────

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { order_number, customer_name, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be 1-5' });

  const review = {
    id:            Date.now().toString(),
    order_number:  order_number  || '',
    customer_name: customer_name || 'Anonymous',
    rating:        Number(rating),
    comment:       (comment || '').trim(),
    created_at:    new Date().toISOString(),
  };

  db.prepare(
    'INSERT INTO reviews (id, order_number, customer_name, rating, comment, created_at) VALUES (@id, @order_number, @customer_name, @rating, @comment, @created_at)'
  ).run(review);

  console.log(`⭐ Review: ${review.customer_name} — ${review.rating}/5 — "${review.comment.slice(0, 40)}"`);
  res.status(201).json({ data: review });
});

// GET /api/reviews
app.get('/api/reviews', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json({ data: rows });
});

// GET /api/reviews/stats
app.get('/api/reviews/stats', (req, res) => {
  const rows    = db.prepare('SELECT rating FROM reviews').all();
  const total   = rows.length;
  const average = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rows.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });
  res.json({ data: { total, average: Math.round(average * 10) / 10, breakdown } });
});

// DELETE /api/reset
app.delete('/api/reset', (req, res) => {
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM reviews').run();
  counter = 1;
  res.json({ message: 'Database cleared' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Bayans Cafe API  →  http://localhost:${PORT}`);
  console.log('   Database: bayans-cafe.db (SQLite — data persists across restarts)\n');
});
