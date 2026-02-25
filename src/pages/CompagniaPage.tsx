import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ChevronRight } from 'lucide-react';
import { Compagnia } from '../constants';
import { getCompagnie, createCompagnia, joinCompagnia } from '../api/compagnie';

export const CompagniaPage = () => {
  const [compagnie, setCompagnie] = useState<Compagnia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const fetchCompagnie = async () => {
    const data = await getCompagnie();
    setCompagnie(data);
    setLoading(false);
  };

  useEffect(() => { fetchCompagnie(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCompagnia(newName);
      setNewName('');
      setShowCreate(false);
      fetchCompagnie();
    } catch (err: any) {
      setError(err.message || 'Errore nella creazione');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await joinCompagnia(joinCode);
      setJoinCode('');
      setShowJoin(false);
      fetchCompagnie();
    } catch (err: any) {
      setError(err.message || 'Codice non valido o già membro');
    }
  };

  const closeModal = () => {
    setShowCreate(false);
    setShowJoin(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

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

      <AnimatePresence>
        {(showCreate || showJoin) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a2e] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
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
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
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
