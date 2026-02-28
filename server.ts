import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString =
  process.env.SSCORE_POSTGRES_URL_NON_POOLING ||
  process.env.SSCORE_POSTGRES_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('Missing database connection string. Set SSCORE_POSTGRES_URL_NON_POOLING in .env');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: 'require',
  // Serverless: una connessione per istanza; locale: pool più grande
  max: process.env.VERCEL ? 1 : 10,
  idle_timeout: process.env.VERCEL ? 20 : undefined,
  connect_timeout: 10,
});

const JWT_SECRET = process.env.JWT_SECRET || 'sanremo-secret-2026';

const generateVerificationCode = () => Math.random().toString().substring(2, 8);

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Minimo 8 caratteri');
  if (!/[A-Z]/.test(password)) errors.push('Almeno una maiuscola');
  if (!/[a-z]/.test(password)) errors.push('Almeno una minuscola');
  if (!/[0-9]/.test(password)) errors.push('Almeno un numero');
  return { valid: errors.length === 0, errors };
};

const sendVerificationEmail = async (email: string, code: string) => {
  // Configurazione email - supporta vari servizi SMTP
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || emailUser || 'noreply@sanscore.com';

  // Se non configurato, log solo
  if (!emailUser || !emailPassword) {
    console.log(`[EMAIL] Verifica per ${email}: ${code}`);
    console.warn('⚠️ EMAIL_USER e EMAIL_PASSWORD non configurati. Controlla .env');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: '🎭 SanScore - Verifica il tuo account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a0a2e 0%, #16213e 100%); padding: 40px; text-align: center; border-radius: 10px;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">San<span style="color: white;">Score</span></h1>
            <p style="color: #9ca3af; margin-top: 5px;">Verifica il tuo account</p>
          </div>

          <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Benvenuto!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Abbiamo ricevuto la tua registrazione su SanScore. Per completare l'iscrizione, 
              inserisci il codice di verifica qui sotto nel form di registrazione:
            </p>

            <div style="background: white; border: 2px solid #fbbf24; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #fbbf24; font-family: monospace;">${code}</span>
            </div>

            <p style="color: #9ca3af; font-size: 13px;">
              Questo codice scade tra 1 ora. Se non hai richiesto questa verifica, ignora questo messaggio.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>© 2026 SanScore - Sanremo Voting System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email inviata a ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Errore nell'invio email a ${email}:`, err);
    return false;
  }
};

const sendPasswordResetEmail = async (email: string, code: string) => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || emailUser || 'noreply@sanscore.com';

  if (!emailUser || !emailPassword) {
    console.log(`[EMAIL] Reset password per ${email}: ${code}`);
    console.warn('⚠️ EMAIL_USER e EMAIL_PASSWORD non configurati');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: { user: emailUser, pass: emailPassword },
    });

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: '🔑 SanScore - Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a0a2e 0%, #16213e 100%); padding: 40px; text-align: center; border-radius: 10px;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">San<span style="color: white;">Score</span></h1>
            <p style="color: #9ca3af; margin-top: 5px;">Reset della password</p>
          </div>
          <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reimposta la tua password</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Abbiamo ricevuto una richiesta di reset della password per il tuo account SanScore.
              Inserisci il codice qui sotto nella pagina di reset:
            </p>
            <div style="background: white; border: 2px solid #fbbf24; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #fbbf24; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">
              Questo codice scade tra 15 minuti. Se non hai richiesto il reset, ignora questo messaggio.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>© 2026 SanScore - Sanremo Voting System</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Email reset inviata a ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Errore nell'invio email reset a ${email}:`, err);
    return false;
  }
};

async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT UNIQUE,
        birth_date TEXT,
        email_verified BOOLEAN DEFAULT false,
        bio TEXT,
        profile_image TEXT
      );
    `;
    // Aggiungi colonne ai dati esistenti (se non esistono)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date TEXT;`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;`;
    } catch (e) {
      // Le colonne potrebbero già esistere
    }
    await sql`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        code TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    await sql`
      CREATE TABLE IF NOT EXISTS streaming_ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        artist_name TEXT,
        song_name TEXT,
        score REAL,
        UNIQUE(user_id, artist_name)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        code TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === 'production';

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
  const { username, password, email, birth_date } = req.body;
  
  // Validazione password
  const { valid, errors } = validatePassword(password);
  if (!valid) {
    return res.status(400).json({ error: 'Password non valida', details: errors });
  }
  
  // Validazione email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida' });
  }
  
  // Validazione data di nascita
  if (!birth_date) {
    return res.status(400).json({ error: 'Data di nascita richiesta' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    
    // Crea utente
    const rows = await sql`
      INSERT INTO users (username, password, email, birth_date, email_verified)
      VALUES (${username}, ${hashedPassword}, ${email}, ${birth_date}, false)
      RETURNING id;
    `;
    const userId = rows[0].id;
    
    // Crea codice di verifica
    await sql`
      INSERT INTO email_verifications (email, code, expires_at)
      VALUES (${email}, ${verificationCode}, NOW() + INTERVAL '1 hour')
      ON CONFLICT(email) DO UPDATE SET code=${verificationCode}, expires_at=NOW() + INTERVAL '1 hour';
    `;
    
    // Invia email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    res.json({ 
      id: userId, 
      username, 
      email, 
      message: emailSent 
        ? '✅ Registrazione completata. Controlla il tuo email per il codice di verifica.'
        : '⚠️ Registrazione completata, ma l\'invio email ha avuto problemi. Controlla la configurazione SMTP o richiedi il codice manualmente.',
      emailSent
    });
  } catch (err: any) {
    console.error(err);
    if (err.message.includes('users_username_key')) {
      res.status(400).json({ error: 'Username già utilizzato' });
    } else if (err.message.includes('users_email_key')) {
      res.status(400).json({ error: 'Email già utilizzata' });
    } else {
      res.status(500).json({ error: 'Registrazione fallita' });
    }
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  const { email, code } = req.body;
  try {
    const rows = await sql`
      SELECT * FROM email_verifications 
      WHERE email = ${email} AND code = ${code} AND expires_at > NOW();
    `;
    
    if (!rows.length) {
      return res.status(400).json({ error: 'Codice non valido o scaduto' });
    }
    
    // Aggiorna utente come verificato
    await sql`UPDATE users SET email_verified = true WHERE email = ${email};`;
    
    // Elimina codice
    await sql`DELETE FROM email_verifications WHERE email = ${email};`;
    
    // Login automatico
    const userRows = await sql`SELECT id, username FROM users WHERE email = ${email};`;
    const user = userRows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });

    res.json({ id: user.id, username: user.username, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verifica fallita' });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  const { email } = req.body;
  try {
    const verificationCode = generateVerificationCode();
    await sql`
      INSERT INTO email_verifications (email, code, expires_at)
      VALUES (${email}, ${verificationCode}, NOW() + INTERVAL '1 hour')
      ON CONFLICT(email) DO UPDATE SET code=${verificationCode}, expires_at=NOW() + INTERVAL '1 hour';
    `;
    await sendVerificationEmail(email, verificationCode);
    res.json({ success: true, message: 'Codice inviato' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Invio codice fallito' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const rows = await sql`SELECT * FROM users WHERE username = ${username};`;
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email richiesta' });
  try {
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;
    // Per sicurezza, non rivelare se l'email esiste o meno
    if (!users.length) return res.json({ success: true });

    const code = generateVerificationCode();
    await sql`
      INSERT INTO password_resets (email, code, expires_at)
      VALUES (${email}, ${code}, NOW() + INTERVAL '15 minutes')
      ON CONFLICT(email) DO UPDATE SET code=${code}, expires_at=NOW() + INTERVAL '15 minutes';
    `;
    await sendPasswordResetEmail(email, code);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Dati mancanti' });

  const { valid, errors } = validatePassword(newPassword);
  if (!valid) return res.status(400).json({ error: errors[0] });

  try {
    const rows = await sql`
      SELECT * FROM password_resets
      WHERE email = ${email} AND code = ${code} AND expires_at > NOW();
    `;
    if (!rows.length) return res.status(400).json({ error: 'Codice non valido o scaduto' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password = ${hashed} WHERE email = ${email};`;
    await sql`DELETE FROM password_resets WHERE email = ${email};`;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel reset della password' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, async (req: any, res) => {
  try {
    const rows = await sql`SELECT id, username, email, email_verified, birth_date, bio, profile_image FROM users WHERE id = ${req.user.id};`;
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
    const rows = await sql`SELECT * FROM ratings WHERE user_id = ${req.user.id};`;
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

// Streaming Ratings Routes
app.get('/api/streaming-ratings', authenticate, async (req: any, res) => {
  try {
    const rows = await sql`SELECT * FROM streaming_ratings WHERE user_id = ${req.user.id};`;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch streaming ratings' });
  }
});

app.post('/api/streaming-ratings', authenticate, async (req: any, res) => {
  const { artist_name, song_name, score } = req.body;
  try {
    await sql`
      INSERT INTO streaming_ratings (user_id, artist_name, song_name, score)
      VALUES (${req.user.id}, ${artist_name}, ${song_name}, ${score})
      ON CONFLICT(user_id, artist_name) DO UPDATE SET
        song_name=EXCLUDED.song_name,
        score=EXCLUDED.score;
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save streaming rating' });
  }
});

app.get('/api/compagnie/:id/streaming-ratings', authenticate, async (req: any, res) => {
  try {
    const members = await sql`
      SELECT u.id, u.username FROM users u
      JOIN compagnia_members cm ON u.id = cm.user_id
      WHERE cm.compagnia_id = ${req.params.id};
    `;
    const ratings = await sql`
      SELECT sr.*, u.username FROM streaming_ratings sr
      JOIN users u ON sr.user_id = u.id
      JOIN compagnia_members cm ON u.id = cm.user_id
      WHERE cm.compagnia_id = ${req.params.id};
    `;
    res.json({ members, ratings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compagnia streaming ratings' });
  }
});

// Compagnie Routes
app.get('/api/compagnie', authenticate, async (req: any, res) => {
  try {
    const rows = await sql`
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
    const rows = await sql`
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
    const rows = await sql`SELECT id FROM compagnie WHERE code = ${code};`;
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
    const members = await sql`
      SELECT u.id, u.username FROM users u
      JOIN compagnia_members cm ON u.id = cm.user_id
      WHERE cm.compagnia_id = ${req.params.id};
    `;
    const ratings = await sql`
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

app.get('/api/stats', authenticate, async (_req, res) => {
  try {
    const voterRows = await sql`SELECT COUNT(DISTINCT user_id)::int AS count FROM ratings`;
    const ratings = await sql`
      SELECT r.*, u.username FROM ratings r
      JOIN users u ON r.user_id = u.id
    `;
    const streamingRatings = await sql`
      SELECT sr.*, u.username FROM streaming_ratings sr
      JOIN users u ON sr.user_id = u.id
    `;
    res.json({ voters: voterRows[0].count, ratings, streamingRatings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── Avvio (locale) o export (Vercel) ────────────────────────────────────────

if (process.env.VERCEL) {
  // Su Vercel: init DB al cold start, poi il framework chiama `app` come handler
  await initDb();
} else {
  // In locale: init DB, aggiungi Vite dev server o static, poi ascolta
  await initDb();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
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

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

// Vercel usa questo export come serverless handler
export default app;
