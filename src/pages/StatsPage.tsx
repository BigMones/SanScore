import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Trophy, Headphones } from 'lucide-react';
import { ARTISTS, ARTIST_SONGS, CATEGORIES } from '../constants';

const calcTotal = (r: any) =>
  r.esibizione + r.outfit + r.testo + r.musica + r.intonazione + r.stile - r.cringe;

const CATEGORY_LABELS: Record<string, string> = {
  esibizione: 'Migliore Esibizione',
  outfit: 'Miglior Outfit',
  testo: 'Miglior Testo',
  musica: 'Miglior Musica',
  intonazione: 'Più Intonato/a',
  stile: 'Più Stiloso/a',
  cringe: 'Il più Cringe',
};

export const StatsPage = () => {
  const [data, setData] = useState<{ voters: number; ratings: any[]; streamingRatings: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(async r => {
        if (!r.ok) return;
        const d = await r.json();
        if (Array.isArray(d.ratings)) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-yellow-400/10 rounded-2xl">
            <BarChart3 size={28} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Classifica Globale</h1>
            <p className="text-white/60">Ancora nessun voto</p>
          </div>
        </div>
        <div className="text-center py-16 text-white/50">Nessun voto ancora</div>
      </div>
    );
  }

  const { voters, ratings, streamingRatings } = data;

  // Leaderboard globale: media totale per artista (tutti i voti di tutte le serate)
  const artistLeaderboard = ARTISTS
    .map(artist => {
      const rs = ratings.filter(r => r.artist_name === artist);
      if (!rs.length) return null;
      const avg = rs.reduce((s: number, r: any) => s + calcTotal(r), 0) / rs.length;
      return { artist, votes: rs.length, avg };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.avg - a.avg) as { artist: string; votes: number; avg: number }[];

  // Vincitori per categoria (globale, tutte le notti)
  const catWinners = CATEGORIES.map(cat => {
    const avgs = ARTISTS.map(artist => {
      const rs = ratings.filter((r: any) => r.artist_name === artist);
      if (!rs.length) return null;
      const avg = rs.reduce((s: number, r: any) => s + (r[cat.id] ?? 0), 0) / rs.length;
      return { artist, avg };
    }).filter(Boolean) as { artist: string; avg: number }[];
    if (!avgs.length) return null;
    const winner = avgs.reduce((best, a) => a.avg > best.avg ? a : best);
    return { cat, winner };
  }).filter(Boolean) as { cat: typeof CATEGORIES[0]; winner: { artist: string; avg: number } }[];

  // Streaming leaderboard
  const streamingLeaderboard = ARTISTS
    .map(artist => {
      const rs = streamingRatings.filter((r: any) => r.artist_name === artist);
      if (!rs.length) return null;
      const avg = rs.reduce((s: number, r: any) => s + r.score, 0) / rs.length;
      return { artist, votes: rs.length, avg, song: ARTIST_SONGS[artist] ?? '' };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.avg - a.avg) as { artist: string; votes: number; avg: number; song: string }[];

  const medal = (i: number) =>
    i === 0 ? 'bg-yellow-400 text-[#0a0a2e]' : i === 1 ? 'bg-white/20 text-white' : i === 2 ? 'bg-amber-700/50 text-amber-200' : 'bg-white/5 text-white/50';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-yellow-400/10 rounded-2xl">
          <BarChart3 size={28} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Classifica Globale</h1>
          <p className="text-white/60">
            {voters > 0 ? `${voters} utenti hanno votato` : 'Ancora nessun voto'}
          </p>
        </div>
      </div>

      {/* Leaderboard generale */}
      {artistLeaderboard.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            Classifica Artisti
          </h2>
          <div className="bg-[#0a0a2e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {artistLeaderboard.map((a, i) => (
              <motion.div
                key={a.artist}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0 ${i === 0 ? 'bg-yellow-400/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${medal(i)}`}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-white text-sm">{a.artist}</span>
                  <span className="text-white/50 text-xs hidden sm:inline">({a.votes} voti)</span>
                </div>
                <span className={`font-black text-lg ${i === 0 ? 'text-yellow-400' : 'text-white/60'}`}>
                  {a.avg.toFixed(1)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-white/50">Nessun voto ancora</div>
      )}

      {/* Premi per categoria */}
      {catWinners.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            Premi per Categoria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {catWinners.map(({ cat, winner }, i) => {
              const isCringe = cat.id === 'cringe';
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-[#0a0a2e] rounded-2xl p-4 border ${isCringe ? 'border-red-500/20' : 'border-white/10'}`}
                >
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isCringe ? 'text-red-400' : 'text-yellow-400'}`}>
                    {CATEGORY_LABELS[cat.id]}
                  </p>
                  <p className="text-white font-semibold text-sm leading-tight mb-2">{winner.artist}</p>
                  <p className={`text-2xl font-black ${isCringe ? 'text-red-400' : 'text-yellow-400'}`}>
                    {winner.avg.toFixed(1)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Streaming leaderboard */}
      {streamingLeaderboard.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Headphones size={20} className="text-purple-400" />
            Classifica Streaming
          </h2>
          <div className="bg-[#0a0a2e] rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
            {streamingLeaderboard.map((a, i) => (
              <motion.div
                key={a.artist}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0 ${i === 0 ? 'bg-purple-500/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-purple-400 text-white' : i === 1 ? 'bg-white/20 text-white' : i === 2 ? 'bg-purple-900/50 text-purple-300' : 'bg-white/5 text-white/50'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white text-sm">{a.artist}</p>
                    <p className="text-white/50 text-xs">"{a.song}" · {a.votes} voti</p>
                  </div>
                </div>
                <span className={`font-black text-lg ${i === 0 ? 'text-purple-400' : 'text-white/60'}`}>
                  {a.avg.toFixed(1)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
