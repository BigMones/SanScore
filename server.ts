import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'sanremo-secret-2026';
const db = new Database('sanremo.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    bio TEXT,
    profile_image TEXT
  );

  CREATE TABLE IF NOT EXISTS compagnie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    code TEXT UNIQUE,
    owner_id INTEGER,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS compagnia_members (
    compagnia_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY(compagnia_id, user_id),
    FOREIGN KEY(compagnia_id) REFERENCES compagnie(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    night_id TEXT,
    artist_name TEXT,
    esibizione REAL,
    outfit REAL,
    testo REAL,
    musica REAL,
    intonazione REAL,
    stile REAL,
    cringe REAL,
    comment TEXT,
    UNIQUE(user_id, night_id, artist_name),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: result.lastInsertRowid, username });
    } catch (err: any) {
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: user.id, username: user.username });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const user = db.prepare('SELECT id, username, bio, profile_image FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  app.post('/api/profile', authenticate, (req: any, res) => {
    const { bio, profile_image } = req.body;
    try {
      db.prepare('UPDATE users SET bio = ?, profile_image = ? WHERE id = ?').run(bio, profile_image, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Ratings Routes
  app.get('/api/ratings', authenticate, (req: any, res) => {
    try {
      const ratings = db.prepare('SELECT * FROM ratings WHERE user_id = ?').all(req.user.id);
      res.json(ratings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch ratings' });
    }
  });

  app.post('/api/ratings', authenticate, (req: any, res) => {
    const { night_id, artist_name, esibizione, outfit, testo, musica, intonazione, stile, cringe, comment } = req.body;
    try {
      db.prepare(`
        INSERT INTO ratings (user_id, night_id, artist_name, esibizione, outfit, testo, musica, intonazione, stile, cringe, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, night_id, artist_name) DO UPDATE SET
          esibizione=excluded.esibizione,
          outfit=excluded.outfit,
          testo=excluded.testo,
          musica=excluded.musica,
          intonazione=excluded.intonazione,
          stile=excluded.stile,
          cringe=excluded.cringe,
          comment=excluded.comment
      `).run(req.user.id, night_id, artist_name, esibizione, outfit, testo, musica, intonazione, stile, cringe, comment);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save rating' });
    }
  });

  // Compagnie Routes
  app.get('/api/compagnie', authenticate, (req: any, res) => {
    try {
      const compagnie = db.prepare(`
        SELECT c.* FROM compagnie c
        JOIN compagnia_members cm ON c.id = cm.compagnia_id
        WHERE cm.user_id = ?
      `).all(req.user.id);
      res.json(compagnie);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch compagnie' });
    }
  });

  app.post('/api/compagnie', authenticate, (req: any, res) => {
    const { name } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const result = db.prepare('INSERT INTO compagnie (name, code, owner_id) VALUES (?, ?, ?)').run(name, code, req.user.id);
      db.prepare('INSERT INTO compagnia_members (compagnia_id, user_id) VALUES (?, ?)').run(result.lastInsertRowid, req.user.id);
      res.json({ id: result.lastInsertRowid, name, code });
    } catch (err) {
      res.status(400).json({ error: 'Compagnia name already exists' });
    }
  });

  app.post('/api/compagnie/join', authenticate, (req: any, res) => {
    const { code } = req.body;
    const compagnia: any = db.prepare('SELECT id FROM compagnie WHERE code = ?').get(code);
    if (!compagnia) return res.status(404).json({ error: 'Compagnia not found' });
    try {
      db.prepare('INSERT INTO compagnia_members (compagnia_id, user_id) VALUES (?, ?)').run(compagnia.id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: 'Already a member' });
    }
  });

  app.get('/api/compagnie/:id/ratings', authenticate, (req: any, res) => {
    try {
      const members = db.prepare(`
        SELECT u.id, u.username FROM users u
        JOIN compagnia_members cm ON u.id = cm.user_id
        WHERE cm.compagnia_id = ?
      `).all(req.params.id);

      const ratings = db.prepare(`
        SELECT r.*, u.username FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN compagnia_members cm ON u.id = cm.user_id
        WHERE cm.compagnia_id = ?
      `).all(req.params.id);

      res.json({ members, ratings });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch compagnia ratings' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
