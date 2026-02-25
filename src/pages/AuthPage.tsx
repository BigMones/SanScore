import React,{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { loginUser, registerUser, verifyEmail, resendVerificationCode, forgotPassword, resetPassword } from '../api/auth';

interface AuthPageProps {
  onAuth: (user: any) => void;
}

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Minimo 8 caratteri');
  if (!/[A-Z]/.test(password)) errors.push('Almeno una maiuscola');
  if (!/[a-z]/.test(password)) errors.push('Almeno una minuscola');
  if (!/[0-9]/.test(password)) errors.push('Almeno un numero');
  return { valid: errors.length === 0, errors };
};

export const AuthPage = ({ onAuth }: AuthPageProps) => {
  const navigate = useNavigate();
  const isLogin = window.location.pathname !== '/register';

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Email verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [emailSent, setEmailSent] = useState(true);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<null | 'email' | 'code'>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      onAuth(data);
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // Validazioni
    const { valid, errors } = validatePassword(regPassword);
    if (!valid) {
      setPasswordError(errors[0]);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError('Email non valida');
      return;
    }

    if (!regBirthDate) {
      setError('Data di nascita richiesta');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(regUsername, regPassword, regEmail, regBirthDate);
      setPendingEmail(regEmail);
      setEmailSent(result.emailSent !== false);
      setVerificationStep(true);
    } catch (err: any) {
      setError(err.message || 'Registrazione fallita');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyEmail(pendingEmail, verificationCode);
      onAuth(data);
    } catch (err: any) {
      setError(err.message || 'Verifica fallita');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      await resendVerificationCode(pendingEmail);
      setError('');
      alert('Codice inviato! Controlla la tua email.');
    } catch (err: any) {
      setError(err.message || 'Reinvio fallito');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotStep('code');
    } catch (err: any) {
      setError(err.message || 'Richiesta fallita');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Le password non corrispondono');
      return;
    }
    const { valid, errors } = validatePassword(forgotNewPassword);
    if (!valid) { setError(errors[0]); return; }
    setLoading(true);
    try {
      await resetPassword(forgotEmail, forgotCode, forgotNewPassword);
      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Reset fallito');
    } finally {
      setLoading(false);
    }
  };

  // Email verification form
  if (verificationStep) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#05051a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Logo className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">
              San<span className="text-yellow-400">Score</span>
            </h1>
            <p className="text-white/60 mt-2">Verifica il tuo email</p>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            {!emailSent && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3 mb-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ L'email non è stata inviata. Verifica la configurazione SMTP.
                  <br />
                  Puoi comunque inserire il codice se lo hai a disposizione.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {emailSent 
                  ? <>Abbiamo inviato un codice a <span className="text-yellow-400 font-bold">{pendingEmail}</span></>
                  : <>Inserisci il codice di verifica inviato a <span className="text-yellow-400 font-bold">{pendingEmail}</span></>
                }
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Inserisci il codice (6 cifre)"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
            >
              {loading ? 'Verifica...' : 'Verifica Email'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="w-full text-yellow-400 hover:text-yellow-500 font-medium py-2 transition-colors"
            >
              Invia di nuovo
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Forgot password — step 1: inserimento email
  if (forgotStep === 'email') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#05051a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-block mb-4"><Logo className="w-16 h-16 mx-auto" /></div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">San<span className="text-yellow-400">Score</span></h1>
            <p className="text-white/60 mt-2">Password dimenticata</p>
          </div>
          <form onSubmit={handleForgotRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Inserisci la tua email per ricevere il codice di reset
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="tua@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
            >
              {loading ? 'Invio...' : 'Invia Codice'}
            </button>
          </form>
          <button
            onClick={() => { setForgotStep(null); setError(''); }}
            className="w-full text-white/40 hover:text-white/60 font-medium py-3 mt-2 transition-colors text-sm"
          >
            ← Torna al login
          </button>
        </motion.div>
      </div>
    );
  }

  // Forgot password — step 2: inserimento codice + nuova password
  if (forgotStep === 'code') {
    if (forgotSuccess) {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#05051a]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl text-center"
          >
            <div className="inline-block mb-4"><Logo className="w-16 h-16 mx-auto" /></div>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Password aggiornata!</h2>
            <p className="text-white/60 mb-6">Puoi ora accedere con la nuova password.</p>
            <button
              onClick={() => { setForgotStep(null); setForgotSuccess(false); setForgotEmail(''); setForgotCode(''); setForgotNewPassword(''); setForgotConfirmPassword(''); }}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all"
            >
              Vai al Login
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#05051a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-block mb-4"><Logo className="w-16 h-16 mx-auto" /></div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">San<span className="text-yellow-400">Score</span></h1>
            <p className="text-white/60 mt-2">Reimposta Password</p>
          </div>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Codice inviato a <span className="text-yellow-400 font-bold">{forgotEmail}</span>
              </label>
              <input
                type="text"
                value={forgotCode}
                onChange={(e) => setForgotCode(e.target.value)}
                placeholder="Codice a 6 cifre"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Nuova Password</label>
              <div className="relative">
                <input
                  type={showForgotPassword ? 'text' : 'password'}
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowForgotPassword(!showForgotPassword)} className="absolute right-3 top-3 text-white/40 hover:text-white/60">
                  {showForgotPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {forgotNewPassword && (
                <div className="mt-3 space-y-1 text-xs">
                  <PasswordRequirement met={forgotNewPassword.length >= 8} text="Minimo 8 caratteri" />
                  <PasswordRequirement met={/[A-Z]/.test(forgotNewPassword)} text="Almeno una maiuscola" />
                  <PasswordRequirement met={/[a-z]/.test(forgotNewPassword)} text="Almeno una minuscola" />
                  <PasswordRequirement met={/[0-9]/.test(forgotNewPassword)} text="Almeno un numero" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Conferma Password</label>
              <input
                type={showForgotPassword ? 'text' : 'password'}
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
              {forgotConfirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {forgotNewPassword === forgotConfirmPassword
                    ? <><Check size={14} className="text-green-400" /><span className="text-green-400">Password corrispondenti</span></>
                    : <><X size={14} className="text-red-400" /><span className="text-red-400">Password non corrispondenti</span></>
                  }
                </div>
              )}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
            >
              {loading ? 'Aggiornamento...' : 'Reimposta Password'}
            </button>
          </form>
          <button
            type="button"
            onClick={async () => { await forgotPassword(forgotEmail).catch(() => {}); }}
            disabled={loading}
            className="w-full text-yellow-400 hover:text-yellow-500 font-medium py-2 mt-1 transition-colors text-sm"
          >
            Invia di nuovo il codice
          </button>
          <button
            onClick={() => { setForgotStep(null); setError(''); }}
            className="w-full text-white/40 hover:text-white/60 font-medium py-2 transition-colors text-sm"
          >
            ← Torna al login
          </button>
        </motion.div>
      </div>
    );
  }

  // Login form
  if (isLogin) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#05051a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Logo className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">
              San<span className="text-yellow-400">Score</span>
            </h1>
            <p className="text-white/60 mt-2">Accedi per iniziare a votare</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setForgotStep('email'); setError(''); }}
                className="text-white/40 hover:text-yellow-400 text-sm transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          </form>

          <p className="text-center mt-6 text-white/50">
            Non hai un account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-yellow-400 font-medium hover:underline"
            >
              Registrati
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Register form
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#05051a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Logo className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            San<span className="text-yellow-400">Score</span>
          </h1>
          <p className="text-white/60 mt-2">Crea un nuovo account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Username</label>
            <input
              type="text"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Data di Nascita</label>
            <input
              type="date"
              value={regBirthDate}
              onChange={(e) => setRegBirthDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
            <div className="relative">
              <input
                type={showRegPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  setPasswordError('');
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute right-3 top-3 text-white/40 hover:text-white/60"
              >
                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {regPassword && (
              <div className="mt-3 space-y-1 text-xs">
                <PasswordRequirement
                  met={regPassword.length >= 8}
                  text="Minimo 8 caratteri"
                />
                <PasswordRequirement
                  met={/[A-Z]/.test(regPassword)}
                  text="Almeno una maiuscola"
                />
                <PasswordRequirement
                  met={/[a-z]/.test(regPassword)}
                  text="Almeno una minuscola"
                />
                <PasswordRequirement
                  met={/[0-9]/.test(regPassword)}
                  text="Almeno un numero"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Conferma Password</label>
            <div className="relative">
              <input
                type={showRegConfirmPassword ? 'text' : 'password'}
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                className="absolute right-3 top-3 text-white/40 hover:text-white/60"
              >
                {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {regConfirmPassword && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {regPassword === regConfirmPassword ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    <span className="text-green-400">Password corrispondenti</span>
                  </>
                ) : (
                  <>
                    <X size={14} className="text-red-400" />
                    <span className="text-red-400">Password non corrispondenti</span>
                  </>
                )}
              </div>
            )}
          </div>

          {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
          >
            {loading ? 'Registrazione...' : 'Registrati'}
          </button>
        </form>

        <p className="text-center mt-6 text-white/50">
          Hai già un account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-yellow-400 font-medium hover:underline"
          >
            Accedi
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check size={14} className="text-green-400" />
    ) : (
      <X size={14} className="text-red-400/50" />
    )}
    <span className={met ? 'text-green-400' : 'text-white/40'}>{text}</span>
  </div>
);
