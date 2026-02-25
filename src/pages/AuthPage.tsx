import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { loginUser, registerUser } from '../api/auth';

interface AuthPageProps {
  onAuth: (user: any) => void;
}

export const AuthPage = ({ onAuth }: AuthPageProps) => {
  const navigate = useNavigate();
  const isLogin = window.location.pathname !== '/register';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = isLogin
        ? await loginUser(username, password)
        : await registerUser(username, password);
      onAuth(data);
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'autenticazione');
    }
  };

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
          <h1 className="text-4xl font-black text-white tracking-tighter italic">San<span className="text-yellow-400">Score</span></h1>
          <p className="text-white/60 mt-2">Accedi per iniziare a votare</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
          >
            {isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <p className="text-center mt-6 text-white/50">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}{' '}
          <button
            onClick={() => navigate(isLogin ? '/register' : '/login')}
            className="text-yellow-400 font-medium hover:underline"
          >
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
