import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'sanremo-secret-2026';

// Initialize Database
async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        bio TEXT,
        profile_image TEXT
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS compagnie (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        code TEXT UNIQUE,
        owner_id INTEGER REFERENCES users(id)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS compagnia_members (
        compagnia_id INTEGER REFERENCES compagnie(id),
        user_id INTEGER REFERENCES users(id),
        PRIMARY KEY(compagnia_id, user_id)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
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
        UNIQUE(user_id, night_id, artist_name)
      );
    `;
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

async function startServer() {
  await initDb();
  
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
      const { rows } = await sql`
        INSERT INTO users (username, password) 
        VALUES (${username}, ${hashedPassword}) 
        RETURNING id;
      `;
      const userId = rows[0].id;
      const token = jwt.sign({ id: userId, username }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: userId, username });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const { rows } = await sql`SELECT * FROM users WHERE username = ${username};`;
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: user.id, username: user.username });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, async (req: any, res) => {
    try {
      const { rows } = await sql`SELECT id, username, bio, profile_image FROM users WHERE id = ${req.user.id};`;
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.post('/api/profile', authenticate, async (req: any, res) => {
    const { bio, profile_image } = req.body;
    try {
      await sql`
        UPDATE users 
        SET bio = ${bio}, profile_image = ${profile_image} 
        WHERE id = ${req.user.id};
      `;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Ratings Routes
  app.get('/api/ratings', authenticate, async (req: any, res) => {
    try {
      const { rows } = await sql`SELECT * FROM ratings WHERE user_id = ${req.user.id};`;
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch ratings' });
    }
  });

  app.post('/api/ratings', authenticate, async (req: any, res) => {
    const { night_id, artist_name, esibizione, outfit, testo, musica, intonazione, stile, cringe, comment } = req.body;
    try {
      await sql`
        INSERT INTO ratings (user_id, night_id, artist_name, esibizione, outfit, testo, musica, intonazione, stile, cringe, comment)
        VALUES (${req.user.id}, ${night_id}, ${artist_name}, ${esibizione}, ${outfit}, ${testo}, ${musica}, ${intonazione}, ${stile}, ${cringe}, ${comment})
        ON CONFLICT(user_id, night_id, artist_name) DO UPDATE SET
          esibizione=EXCLUDED.esibizione,
          outfit=EXCLUDED.outfit,
          testo=EXCLUDED.testo,
          musica=EXCLUDED.musica,
          intonazione=EXCLUDED.intonazione,
          stile=EXCLUDED.stile,
          cringe=EXCLUDED.cringe,
          comment=EXCLUDED.comment;
      `;
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save rating' });
    }
  });

  // Compagnie Routes
  app.get('/api/compagnie', authenticate, async (req: any, res) => {
    try {
      const { rows } = await sql`
        SELECT c.* FROM compagnie c
        JOIN compagnia_members cm ON c.id = cm.compagnia_id
        WHERE cm.user_id = ${req.user.id};
      `;
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch compagnie' });
    }
  });

  app.post('/api/compagnie', authenticate, async (req: any, res) => {
    const { name } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const { rows } = await sql`
        INSERT INTO compagnie (name, code, owner_id) 
        VALUES (${name}, ${code}, ${req.user.id}) 
        RETURNING id;
      `;
      const compagniaId = rows[0].id;
      await sql`
        INSERT INTO compagnia_members (compagnia_id, user_id) 
        VALUES (${compagniaId}, ${req.user.id});
      `;
      res.json({ id: compagniaId, name, code });
    } catch (err) {
      res.status(400).json({ error: 'Compagnia name already exists' });
    }
  });

  app.post('/api/compagnie/join', authenticate, async (req: any, res) => {
    const { code } = req.body;
    try {
      const { rows } = await sql`SELECT id FROM compagnie WHERE code = ${code};`;
      const compagnia = rows[0];
      if (!compagnia) return res.status(404).json({ error: 'Compagnia not found' });
      
      await sql`
        INSERT INTO compagnia_members (compagnia_id, user_id) 
        VALUES (${compagnia.id}, ${req.user.id});
      `;
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: 'Already a member' });
    }
  });

  app.get('/api/compagnie/:id/ratings', authenticate, async (req: any, res) => {
    try {
      const { rows: members } = await sql`
        SELECT u.id, u.username FROM users u
        JOIN compagnia_members cm ON u.id = cm.user_id
        WHERE cm.compagnia_id = ${req.params.id};
      `;

      const { rows: ratings } = await sql`
        SELECT r.*, u.username FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN compagnia_members cm ON u.id = cm.user_id
        WHERE cm.compagnia_id = ${req.params.id};
      `;

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
    
    // SPA Fallback for development: serve index.html for any non-API route
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
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
