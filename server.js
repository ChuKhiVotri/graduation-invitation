const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_DIR = process.env.DB_DIR || path.join(__dirname, 'database');
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'rsvp.sqlite');
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    guest_slug TEXT,
    invite_name TEXT,
    page_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  db.run('CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC)');
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(__dirname));

function normalizeText(value, maxLength = 255) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

app.post('/api/rsvp', (req, res) => {
  const name = normalizeText(req.body?.name, 80);
  const guestSlug = normalizeText(req.body?.guestSlug, 80);
  const inviteName = normalizeText(req.body?.inviteName, 80);
  const pageUrl = normalizeText(req.body?.pageUrl, 600);

  if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên.' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';

  db.run(
    `INSERT INTO rsvps (name, guest_slug, invite_name, page_url, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, guestSlug, inviteName, pageUrl, ip, ua],
    function onInsert(error) {
      if (error) return res.status(500).json({ error: 'Không thể lưu xác nhận.' });
      res.status(201).json({ ok: true, id: this.lastID });
    }
  );
});

function requireDashboardPassword(req, res, next) {
  const password = req.headers['x-dashboard-password'];
  if (password !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu dashboard.' });
  }
  next();
}

app.get('/api/rsvps', requireDashboardPassword, (req, res) => {
  db.all(
    `SELECT id, name, guest_slug, invite_name, page_url, ip_address, user_agent, created_at
     FROM rsvps
     ORDER BY datetime(created_at) DESC`,
    [],
    (error, rows) => {
      if (error) return res.status(500).json({ error: 'Không thể đọc database.' });
      res.json({ total: rows.length, rows });
    }
  );
});

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Graduation invitation is running at http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`SQLite database: ${DB_PATH}`);
});
