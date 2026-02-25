import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Headphones, Music } from 'lucide-react';
import { ARTISTS, ARTIST_SONGS } from '../constants';
import { getStreamingRatings, saveStreamingRating, StreamingRating } from '../api/streamingRatings';

export const StreamingPage = () => {
  const [ratings, setRatings] = useState<StreamingRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(6);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const data = await getStreamingRatings();
    setRatings(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openArtist = (artist: string) => {
    if (selected === artist) {
      setSelected(null);
      return;
    }
    const existing = ratings.find(r => r.artist_name === artist);
    setScore(existing?.score ?? 6);
    setSelected(artist);
  };

  const handleSave = async (artist: string) => {
    const songName = ARTIST_SONGS[artist];
    if (!songName) return;
    setSaving(true);
    setError(null);
    try {
      const ok = await saveStreamingRating(artist, songName, score);
      if (ok) {
        await load();
        setSelected(null);
      } else {
        setError('Errore durante il salvataggio. Riprova.');
      }
    } catch (err) {
      setError('Errore durante il salvataggio. Verifica la connessione.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  const rated = ratings.length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-2 bg-yellow-400/10 rounded-2xl">
          <Headphones size={28} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Voti Streaming</h1>
          <p className="text-white/60">
            Valuta le canzoni su Spotify · {rated}/{ARTISTS.length} votati
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div
          animate={{ width: `${(rated / ARTISTS.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>

      <div className="grid gap-3">
        {ARTISTS.map((artist, idx) => {
          const existing = ratings.find(r => r.artist_name === artist);
          const isOpen = selected === artist;
          const song = ARTIST_SONGS[artist];

          return (
            <motion.div
              key={artist}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`bg-[#0a0a2e] rounded-2xl border transition-all ${isOpen ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-white/10'}`}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => openArtist(artist)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${existing ? 'bg-yellow-400 text-[#0a0a2e]' : 'bg-white/5 text-white/30'}`}>
                    {existing ? <Music size={18} /> : idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{artist}</h3>
                    <p className="text-xs text-white/40 mt-0.5">"{song}"</p>
                    {existing && (
                      <p className="text-xs text-yellow-400 font-bold mt-0.5">{existing.score.toFixed(1)} / 10</p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`text-white/20 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-5 space-y-4 bg-white/5">
                      <div className="bg-white/5 rounded-xl px-4 py-3">
                        <p className="text-xs uppercase tracking-widest text-white/30 mb-1 font-mono">canzone</p>
                        <p className="text-white font-semibold">"{song}"</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/70 font-medium">Voto Streaming</span>
                          <span className="font-bold text-yellow-400 text-lg">{score.toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={score}
                          onChange={e => setScore(parseFloat(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                        />
                        <div className="flex justify-between text-xs text-white/20 mt-1">
                          <span>0</span>
                          <span>10</span>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-3">
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                      )}
                      <button
                        onClick={() => handleSave(artist)}
                        disabled={saving}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-[#0a0a2e] font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-400/10"
                      >
                        {saving ? 'Salvataggio...' : 'Salva'}
                      </button>
                    </div>
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
