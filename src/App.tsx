/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Users, 
  Star, 
  LogOut, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  MessageSquare,
  Menu,
  X,
  User as UserIcon,
  Camera
} from 'lucide-react';
import { ARTISTS, NIGHTS, CATEGORIES, Rating, Compagnia } from './constants';

// --- Components ---

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>
    <path d="M20 80 L50 20 L80 80" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="45" r="12" fill="url(#logo-grad)" />
    <path d="M35 65 H65" stroke="#0a0a2e" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Navbar = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0a0a2e] text-white sticky top-0 z-50 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="w-10 h-10" />
            <span className="font-bold text-2xl tracking-tighter italic">San<span className="text-yellow-400">Score</span></span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-yellow-400 transition-colors">Pagelle</Link>
              <Link to="/compagnie" className="hover:text-yellow-400 transition-colors">Compagnie</Link>
              <Link to="/profile" className="hover:text-yellow-400 transition-colors">Profilo</Link>
              <div className="flex items-center space-x-4 border-l border-white/20 pl-8">
                <div className="flex items-center gap-2">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                  ) : (
                    <UserIcon size={14} className="text-white/50" />
                  )}
                  <span className="text-sm opacity-70">{user.username}</span>
                </div>
                <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0d0d3d] border-t border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-medium border-b border-white/5">Pagelle</Link>
              <Link to="/compagnie" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-medium border-b border-white/5">Compagnie</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-medium border-b border-white/5">Profilo</Link>
              <div className="pt-4 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  {user?.profile_image && <img src={user.profile_image} className="w-6 h-6 rounded-full object-cover" />}
                  <span className="text-sm opacity-70">Ciao, {user?.username}</span>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 text-red-400">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AuthPage = ({ onAuth }: { onAuth: (user: any) => void }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isLogin = location !== '/register';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const toggleAuth = () => {
    navigate(isLogin ? '/register' : '/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) onAuth(data);
        else setError(data.error || 'Errore durante l\'autenticazione');
      } else {
        if (res.ok) onAuth({ username }); // Fallback if OK but no JSON
        else setError('Errore del server');
      }
    } catch (err) {
      setError('Errore di connessione');
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
          <button onClick={toggleAuth} className="text-yellow-400 font-medium hover:underline">
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const NightList = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Le Serate</h1>
        <p className="text-white/60">Seleziona una serata per dare i tuoi voti</p>
      </div>

      <div className="grid gap-4">
        {NIGHTS.map((night, idx) => (
          <motion.div
            key={night.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={`/night/${night.id}`}
              className="group flex items-center justify-between bg-[#0a0a2e] p-6 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-all shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-[#0a0a2e] transition-colors">
                  <Music size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{night.name}</h3>
                  <p className="text-sm text-white/50">Sanremo 2026</p>
                </div>
              </div>
              <ChevronRight className="text-white/30 group-hover:text-yellow-400 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RatingPage = () => {
  const { nightId } = useParams();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  
  const night = NIGHTS.find(n => n.id === nightId);

  useEffect(() => {
    fetch('/api/ratings')
      .then(res => {
        if (!res.ok) return [];
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        }
        return [];
      })
      .then(data => {
        if (Array.isArray(data)) {
          setRatings(data.filter((r: any) => r.night_id === nightId));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nightId]);

  const handleSaveRating = async (ratingData: Partial<Rating>) => {
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ratingData, night_id: nightId })
      });
      if (res.ok) {
        const ratingsRes = await fetch('/api/ratings');
        if (ratingsRes.ok) {
          const contentType = ratingsRes.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const updatedRatings = await ratingsRes.json();
            setRatings(updatedRatings.filter((r: any) => r.night_id === nightId));
          }
        }
        setSelectedArtist(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{night?.name}</h1>
          <p className="text-white/60">Tutte le pagelle</p>
        </div>
      </div>

      <div className="grid gap-3">
        {ARTISTS.map((artist, idx) => {
          const rating = ratings.find(r => r.artist_name === artist);
          const total = rating ? (rating.esibizione + rating.outfit + rating.testo + rating.musica + rating.intonazione + rating.stile - rating.cringe) : 0;
          
          return (
            <motion.div
              key={artist}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-[#0a0a2e] rounded-2xl border transition-all ${selectedArtist === artist ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-white/10'}`}
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedArtist(selectedArtist === artist ? null : artist)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${rating ? 'bg-yellow-400 text-[#0a0a2e]' : 'bg-white/5 text-white/30'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{artist}</h3>
                    {rating && <p className="text-xs text-yellow-400/70">Votato</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {rating && (
                    <div className="text-right">
                      <span className="text-2xl font-black text-yellow-400">{total.toFixed(1)}</span>
                    </div>
                  )}
                  <ChevronRight className={`text-white/20 transition-transform ${selectedArtist === artist ? 'rotate-90' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {selectedArtist === artist && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <RatingForm 
                      artist={artist} 
                      initialRating={rating} 
                      onSave={(data) => handleSaveRating({ ...data, artist_name: artist })} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const RatingForm = ({ artist, initialRating, onSave }: { artist: string, initialRating?: Rating, onSave: (data: any) => void }) => {
  const [values, setValues] = useState({
    esibizione: initialRating?.esibizione || 6,
    outfit: initialRating?.outfit || 6,
    testo: initialRating?.testo || 6,
    musica: initialRating?.musica || 6,
    intonazione: initialRating?.intonazione || 6,
    stile: initialRating?.stile || 6,
    cringe: initialRating?.cringe || 0,
    comment: initialRating?.comment || ''
  });

  const handleChange = (cat: string, val: number) => {
    setValues(prev => ({ ...prev, [cat]: val }));
  };

  return (
    <div className="p-6 space-y-6 bg-white/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70 font-medium">{cat.name}</span>
              <span className={`font-bold ${cat.id === 'cringe' ? 'text-red-400' : 'text-yellow-400'}`}>
                {values[cat.id as keyof typeof values]}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={values[cat.id as keyof typeof values]}
              onChange={(e) => handleChange(cat.id, parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70 font-medium flex items-center gap-2">
          <MessageSquare size={14} /> Commento
        </label>
        <textarea
          value={values.comment}
          onChange={(e) => setValues(prev => ({ ...prev, comment: e.target.value }))}
          placeholder="Cosa ne pensi di questa esibizione?"
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 min-h-[80px]"
        />
      </div>

      <button
        onClick={() => onSave(values)}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#0a0a2e] font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-400/10"
      >
        Salva Pagella
      </button>
    </div>
  );
};

const CompagniePage = () => {
  const [compagnie, setCompagnie] = useState<Compagnia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const fetchCompagnie = () => {
    fetch('/api/compagnie')
      .then(res => {
        if (!res.ok) return [];
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        }
        return [];
      })
      .then(data => {
        setCompagnie(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(fetchCompagnie, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/compagnie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      setNewName('');
      setShowCreate(false);
      fetchCompagnie();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/compagnie/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: joinCode })
    });
    if (res.ok) {
      setJoinCode('');
      setShowJoin(false);
      fetchCompagnie();
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Compagnie</h1>
          <p className="text-white/60">Condividi i voti con i tuoi amici</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowJoin(true)}
            className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 transition-all"
          >
            Unisciti
          </button>
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-[#0a0a2e] p-3 rounded-xl font-bold transition-all"
          >
            Crea
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {compagnie.map((c, idx) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={`/compagnia/${c.id}`}
              className="flex items-center justify-between bg-[#0a0a2e] p-6 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-all shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center text-yellow-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{c.name}</h3>
                  <p className="text-sm text-white/50 font-mono">CODICE: {c.code}</p>
                </div>
              </div>
              <ChevronRight className="text-white/30" />
            </Link>
          </motion.div>
        ))}

        {compagnie.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Non sei ancora in nessuna compagnia</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showCreate || showJoin) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {showCreate ? 'Crea Compagnia' : 'Unisciti a una Compagnia'}
              </h2>
              <form onSubmit={showCreate ? handleCreate : handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    {showCreate ? 'Nome della Compagnia' : 'Codice Invito'}
                  </label>
                  <input
                    type="text"
                    value={showCreate ? newName : joinCode}
                    onChange={(e) => showCreate ? setNewName(e.target.value) : setJoinCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder={showCreate ? 'Es: Gli Amici del Festival' : 'Es: AB12CD'}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setShowJoin(false); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-[#0a0a2e] font-bold py-3 rounded-xl transition-all"
                  >
                    {showCreate ? 'Crea' : 'Unisciti'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompagniaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<{ members: any[], ratings: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNight, setSelectedNight] = useState(NIGHTS[0].id);

  useEffect(() => {
    fetch(`/api/compagnie/${id}/ratings`)
      .then(res => {
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        }
        return null;
      })
      .then(d => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div></div>;

  const filteredRatings = data?.ratings.filter(r => r.night_id === selectedNight) || [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/compagnie')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Classifica Compagnia</h1>
            <p className="text-white/60">Voti di tutti i membri</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {NIGHTS.map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedNight(n.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedNight === n.id ? 'bg-yellow-400 text-[#0a0a2e]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0a2e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10">Artista</th>
                {data?.members.map(m => (
                  <th key={m.id} className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 text-center">
                    {m.username}
                  </th>
                ))}
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-yellow-400 border-b border-white/10 text-center">Media</th>
              </tr>
            </thead>
            <tbody>
              {ARTISTS.map((artist, idx) => {
                const artistRatings = filteredRatings.filter(r => r.artist_name === artist);
                const avg = artistRatings.length > 0 
                  ? artistRatings.reduce((acc, r) => acc + (r.esibizione + r.outfit + r.testo + r.musica + r.intonazione + r.stile - r.cringe), 0) / artistRatings.length
                  : 0;

                return (
                  <tr key={artist} className="hover:bg-white/5 transition-colors border-b border-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-white/20 text-xs font-mono">{idx + 1}</span>
                        <span className="font-bold text-white">{artist}</span>
                      </div>
                    </td>
                    {data?.members.map(m => {
                      const r = artistRatings.find(ar => ar.user_id === m.id);
                      const total = r ? (r.esibizione + r.outfit + r.testo + r.musica + r.intonazione + r.stile - r.cringe) : null;
                      return (
                        <td key={m.id} className="p-4 text-center">
                          {total !== null ? (
                            <span className="text-white font-bold">{total.toFixed(1)}</span>
                          ) : (
                            <span className="text-white/10">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center bg-yellow-400/5">
                      <span className={`font-black text-lg ${avg > 0 ? 'text-yellow-400' : 'text-white/10'}`}>
                        {avg > 0 ? avg.toFixed(1) : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ user, onUpdate }: { user: any, onUpdate: () => void }) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage in DB
        setMessage('L\'immagine è troppo grande. Massimo 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, profile_image: profileImage })
      });
      if (res.ok) {
        setMessage('Profilo aggiornato con successo!');
        onUpdate();
      } else {
        setMessage('Errore durante l\'aggiornamento.');
      }
    } catch (err) {
      setMessage('Errore di connessione.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="relative inline-block group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-xl group-hover:opacity-75 transition-opacity" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border-4 border-white/10 group-hover:bg-white/10 transition-colors">
                <UserIcon size={48} className="text-white/20" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-yellow-400 p-2 rounded-full text-[#0a0a2e] shadow-lg z-20">
              <Camera size={20} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded text-white">Cambia</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">{user?.username}</h1>
          <p className="text-white/50">Gestisci il tuo profilo SanScore</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Raccontaci qualcosa di te..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all min-h-[120px]"
            />
          </div>

          {message && (
            <p className={`text-center text-sm ${message.includes('successo') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-[#0a0a2e] font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-400/20"
          >
            {saving ? 'Salvataggio...' : 'Salva Profilo'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(fetchUser, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-[#05051a] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div></div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#05051a] text-white font-sans selection:bg-yellow-400 selection:text-[#0a0a2e]">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className="pb-20">
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<AuthPage onAuth={setUser} />} />
                <Route path="/register" element={<AuthPage onAuth={setUser} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<NightList />} />
                <Route path="/night/:nightId" element={<RatingPage />} />
                <Route path="/compagnie" element={<CompagniePage />} />
                <Route path="/compagnia/:id" element={<CompagniaDetail />} />
                <Route path="/profile" element={<ProfilePage user={user} onUpdate={fetchUser} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </main>

        {/* Mobile Bottom Nav */}
        {user && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a2e]/90 backdrop-blur-md border-t border-white/10 px-6 py-3 flex justify-around items-center z-50">
            <Link to="/" className="flex flex-col items-center gap-1 text-white/60 hover:text-yellow-400 transition-colors">
              <Star size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Voti</span>
            </Link>
            <Link to="/compagnie" className="flex flex-col items-center gap-1 text-white/60 hover:text-yellow-400 transition-colors">
              <Users size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Social</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-white/60 hover:text-yellow-400 transition-colors">
              <UserIcon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Profilo</span>
            </Link>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}
