import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, Trophy, Headphones, Users, Home } from 'lucide-react';
import { ARTISTS, NIGHT_ARTISTS, NIGHTS, CATEGORIES } from '../constants';
import { getCompagniaRatings } from '../api/compagnie';
import { getCompagniaStreamingRatings, StreamingRating } from '../api/streamingRatings';

type DetailPopup = { rating?: any; ratings?: any[]; artist: string };

const CATEGORY_LABELS: Record<string, string> = {
  esibizione: 'Migliore Esibizione',
  outfit: 'Miglior Outfit',
  testo: 'Miglior Testo',
  musica: 'Miglior Musica',
  intonazione: 'Più Intonato/a',
  stile: 'Più Stiloso/a',
  cringe: 'Il più Cringe',
};

const calcTotal = (r: any) =>
  r.esibizione + r.outfit + r.testo + r.musica + r.intonazione + r.stile - r.cringe;

function buildAwards(ratings: any[], artistList: string[]) {
  return CATEGORIES.map(cat => {
    const avgs = artistList
      .map(artist => {
        const rs = ratings.filter(r => r.artist_name === artist);
        if (!rs.length) return null;
        return { artist, avg: rs.reduce((s, r) => s + (r[cat.id] ?? 0), 0) / rs.length };
      })
      .filter(Boolean) as { artist: string; avg: number }[];
    if (!avgs.length) return null;
    const winner = avgs.reduce((best, a) => a.avg > best.avg ? a : best);
    return { cat, winner };
  }).filter(Boolean) as { cat: typeof CATEGORIES[0]; winner: { artist: string; avg: number } }[];
}

const AwardCard = ({ cat, winner, i }: Omit<React.ComponentProps<'div'>, 'children'> & { cat: typeof CATEGORIES[0]; winner: { artist: string; avg: number }; i: number }) => {
  const isCringe = cat.id === 'cringe';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className={`bg-[#0a0a2e] rounded-2xl p-4 border ${isCringe ? 'border-red-500/20 bg-red-950/10' : 'border-white/10'}`}
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
};

export const CompagniaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ members: any[]; ratings: any[] } | null>(null);
  const [streamingData, setStreamingData] = useState<{ members: any[]; ratings: StreamingRating[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'home' | string>('home');
  const [detailPopup, setDetailPopup] = useState<DetailPopup | null>(null);
  const [mobileMemberIdx, setMobileMemberIdx] = useState(0);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'compact' | 'full'>('compact');

  useEffect(() => {
    Promise.allSettled([
      getCompagniaRatings(id!),
      getCompagniaStreamingRatings(id!),
    ]).then(([liveResult, sResult]) => {
      if (liveResult.status === 'fulfilled' && liveResult.value) setData(liveResult.value);
      if (sResult.status === 'fulfilled' && sResult.value) setStreamingData(sResult.value);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

  const isHome = selectedTab === 'home';
  const filteredRatings = !isHome ? (data?.ratings.filter(r => r.night_id === selectedTab) || []) : [];
  const artists = !isHome ? (NIGHT_ARTISTS[selectedTab] ?? ARTISTS) : [];
  const overallAwards = buildAwards(data?.ratings ?? [], ARTISTS);

  const streamingWinner = (() => {
    const sr = streamingData?.ratings ?? [];
    if (!sr.length) return null;
    const byArtist = ARTISTS.map(artist => {
      const rs = sr.filter(r => r.artist_name === artist);
      if (!rs.length) return null;
      const avg = rs.reduce((s, r) => s + r.score, 0) / rs.length;
      const songNames = [...new Set(rs.map(r => r.song_name))].join(' / ');
      return { artist, avg, songNames };
    }).filter(Boolean) as { artist: string; avg: number; songNames: string }[];
    if (!byArtist.length) return null;
    return byArtist.reduce((best, a) => a.avg > best.avg ? a : best);
  })();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/compagnie')} aria-label="Torna alle compagnie" className="p-2.5 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Classifica Compagnia</h1>
          <p className="text-white/60">Voti di tutti i membri</p>
        </div>
      </div>

      {/* Tab pills: home + serate */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedTab('home')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isHome ? 'bg-yellow-400 text-[#0a0a2e]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          <Home size={14} />
          Home
        </button>
        {NIGHTS.map(n => (
          <button
            key={n.id}
            onClick={() => setSelectedTab(n.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedTab === n.id ? 'bg-yellow-400 text-[#0a0a2e]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {n.name}
          </button>
        ))}
      </div>

      {/* ── HOME TAB ── */}
      {isHome && (
        <div className="space-y-10">

          {/* Card per membro */}
          {data && data.members.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-yellow-400" />
                Voti dei Membri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.members.map((member, idx) => {
                  const memberRatings = data.ratings.filter(r => r.user_id === member.id);

                  const artistTotals = ARTISTS
                    .map(artist => {
                      const rs = memberRatings.filter(r => r.artist_name === artist);
                      if (!rs.length) return null;
                      const avg = rs.reduce((s, r) => s + calcTotal(r), 0) / rs.length;
                      return { artist, avg };
                    })
                    .filter(Boolean)
                    .sort((a: any, b: any) => b.avg - a.avg) as { artist: string; avg: number }[];

                  const overallAvg = artistTotals.length > 0
                    ? artistTotals.reduce((s, a) => s + a.avg, 0) / artistTotals.length
                    : 0;

                  const shown = artistTotals.slice(0, 5);
                  const rest = artistTotals.length - 5;

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-[#0a0a2e] rounded-2xl border border-white/10 p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-yellow-400/10 rounded-xl flex items-center justify-center text-yellow-400 text-sm font-black">
                            {member.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{member.username}</p>
                            <p className="text-white/40 text-xs">
                              {artistTotals.length} artist{artistTotals.length === 1 ? 'a' : 'i'} votati
                            </p>
                          </div>
                        </div>
                        {overallAvg > 0 && (
                          <div className="text-right">
                            <p className="text-yellow-400 font-black text-xl">{overallAvg.toFixed(1)}</p>
                            <p className="text-white/50 text-xs">media</p>
                          </div>
                        )}
                      </div>

                      {shown.length === 0 ? (
                        <p className="text-white/50 text-sm text-center py-4">Nessun voto ancora</p>
                      ) : (
                        <div className="space-y-2">
                          {shown.map((a, i) => (
                            <div key={a.artist} className="flex items-center gap-2">
                              <span className="text-white/40 text-xs font-mono w-4 text-right flex-shrink-0">{i + 1}</span>
                              <span className="text-white/80 text-sm flex-1 truncate">{a.artist}</span>
                              <span className="text-yellow-400 font-bold text-sm tabular-nums flex-shrink-0">{a.avg.toFixed(1)}</span>
                            </div>
                          ))}
                          {rest > 0 && (
                            <p className="text-white/50 text-xs text-center pt-1">... e altri {rest}</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classifica Generale */}
          {data?.ratings && data.ratings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                Classifica Generale
              </h2>
              <p className="text-white/40 text-sm mb-4">Vincitori aggregati di tutte le serate</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {overallAwards.length > 0 ? overallAwards.map(({ cat, winner }, i) => (
                  <AwardCard key={cat.id} cat={cat} winner={winner} i={i} />
                )) : (
                  <div className="col-span-full text-center py-8 text-white/40">
                    Nessun premio disponibile ancora
                  </div>
                )}
                {streamingWinner && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: overallAwards.length * 0.05 }}
                    className="bg-[#0a0a2e] rounded-2xl p-4 border border-purple-500/30 bg-purple-950/10"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Headphones size={12} className="text-purple-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        Migliore Streaming
                      </p>
                    </div>
                    <p className="text-white font-semibold text-sm leading-tight mb-1">{streamingWinner.artist}</p>
                    <p className="text-white/40 text-xs mb-2 truncate">"{streamingWinner.songNames}"</p>
                    <p className="text-2xl font-black text-purple-400">{streamingWinner.avg.toFixed(1)}</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Voti Streaming */}
          {streamingData && streamingData.ratings.length > 0 && (() => {
            const sr = streamingData.ratings;
            const sm = streamingData.members;
            const streamedArtists = ARTISTS.filter(a => sr.some(r => r.artist_name === a));
            if (!streamedArtists.length) return null;
            return (
              <div>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Headphones size={20} className="text-purple-400" />
                  Voti Streaming
                </h2>
                <p className="text-white/40 text-sm mb-4">Versioni registrate su Spotify</p>
                <div className="bg-[#0a0a2e] rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10">Artista</th>
                          {sm.map(m => (
                            <th key={m.id} className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 text-center whitespace-nowrap">
                              {m.username}
                            </th>
                          ))}
                          <th className="p-4 text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 text-center">Media</th>
                        </tr>
                      </thead>
                      <tbody>
                        {streamedArtists.map((artist, idx) => {
                          const artistRatings = sr.filter(r => r.artist_name === artist);
                          const avg = artistRatings.length > 0
                            ? artistRatings.reduce((acc, r) => acc + r.score, 0) / artistRatings.length
                            : 0;
                          return (
                            <tr key={artist} className="hover:bg-white/5 transition-colors border-b border-white/5">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-white/40 text-xs font-mono">{idx + 1}</span>
                                  <span className="font-bold text-white text-sm">{artist}</span>
                                </div>
                              </td>
                              {sm.map(m => {
                                const r = artistRatings.find(ar => ar.user_id === m.id);
                                return (
                                  <td key={m.id} className="p-4 text-center">
                                    {r
                                      ? <span className="text-white font-bold">{r.score.toFixed(1)}</span>
                                      : <span className="text-white/10">-</span>}
                                  </td>
                                );
                              })}
                              <td className="p-4 text-center bg-purple-400/5">
                                {avg > 0
                                  ? <span className="font-black text-lg text-purple-400">{avg.toFixed(1)}</span>
                                  : <span className="font-black text-lg text-white/10">-</span>}
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
          })()}

        </div>
      )}

      {/* ── NIGHT TAB ── */}
      {!isHome && (
        <div className="space-y-10">

          {/* Premi della serata */}
          {filteredRatings.length > 0 && (() => {
            const awards = buildAwards(filteredRatings, artists);
            if (!awards.length) return null;
            return (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-400" />
                  Premi della Serata
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {awards.map(({ cat, winner }, i) => (
                    <AwardCard key={cat.id} cat={cat} winner={winner} i={i} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Griglia voti — mobile */}
          {data?.members && data.members.length > 0 && (
            <div className="md:hidden space-y-3">
              {/* Toggle compatta / completa */}
              <div className="flex items-center justify-end">
                <div className="flex bg-white/5 rounded-full p-1 gap-1">
                  <button
                    onClick={() => setMobileView('compact')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mobileView === 'compact' ? 'bg-yellow-400 text-[#0a0a2e]' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Compatta
                  </button>
                  <button
                    onClick={() => setMobileView('full')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mobileView === 'full' ? 'bg-yellow-400 text-[#0a0a2e]' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Completa
                  </button>
                </div>
              </div>

              {/* Vista compatta: Artista | Membro▾ | Media */}
              {mobileView === 'compact' && (
                <div className="bg-[#0a0a2e] rounded-3xl border border-white/10 shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10">Artista</th>
                        <th className="p-4 border-b border-white/10 text-center relative">
                          <button
                            onClick={() => setMemberMenuOpen(v => !v)}
                            className="flex items-center gap-1 mx-auto text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
                          >
                            <span>{data.members[mobileMemberIdx]?.username}</span>
                            <ChevronDown size={12} className={`transition-transform ${memberMenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {memberMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMemberMenuOpen(false)} />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-[#0e0e38] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[130px] overflow-hidden">
                                {data.members.map((m, i) => (
                                  <button
                                    key={m.id}
                                    onClick={() => { setMobileMemberIdx(i); setMemberMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${i === mobileMemberIdx ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                  >
                                    {m.username}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-yellow-400 border-b border-white/10 text-center">Media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artists.map((artist, idx) => {
                        const artistRatings = filteredRatings.filter(r => r.artist_name === artist);
                        const avg = artistRatings.length > 0
                          ? artistRatings.reduce((acc, r) => acc + calcTotal(r), 0) / artistRatings.length
                          : 0;
                        const selectedMember = data.members[mobileMemberIdx];
                        const r = selectedMember ? artistRatings.find(ar => ar.user_id === selectedMember.id) : null;
                        const total = r ? calcTotal(r) : null;
                        return (
                          <tr key={artist} className="hover:bg-white/5 transition-colors border-b border-white/5">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white/40 text-xs font-mono">{idx + 1}</span>
                                <span className="font-bold text-white text-sm">{artist}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {total !== null ? (
                                <button onClick={() => setDetailPopup({ rating: r, artist })} className="text-white font-bold hover:text-yellow-400 hover:underline underline-offset-2 transition-colors">
                                  {total.toFixed(1)}
                                </button>
                              ) : <span className="text-white/10">-</span>}
                            </td>
                            <td className="p-4 text-center bg-yellow-400/5">
                              {avg > 0 ? (
                                <button onClick={() => setDetailPopup({ ratings: artistRatings, artist })} className="font-black text-lg text-yellow-400 hover:text-yellow-300 hover:underline underline-offset-2 transition-colors">
                                  {avg.toFixed(1)}
                                </button>
                              ) : <span className="font-black text-lg text-white/10">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Vista completa: scroll orizzontale */}
              {mobileView === 'full' && (
                <div className="bg-[#0a0a2e] rounded-3xl border border-white/10 overflow-x-auto shadow-2xl">
                  <table className="text-left border-collapse min-w-max w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 sticky left-0 bg-[#0f0f35]">Artista</th>
                        {data.members.map(m => (
                          <th key={m.id} className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 text-center whitespace-nowrap">
                            {m.username}
                          </th>
                        ))}
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-yellow-400 border-b border-white/10 text-center">Media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artists.map((artist, idx) => {
                        const artistRatings = filteredRatings.filter(r => r.artist_name === artist);
                        const avg = artistRatings.length > 0
                          ? artistRatings.reduce((acc, r) => acc + calcTotal(r), 0) / artistRatings.length
                          : 0;
                        return (
                          <tr key={artist} className="hover:bg-white/5 transition-colors border-b border-white/5">
                            <td className="p-3 sticky left-0 bg-[#0a0a2e]">
                              <div className="flex items-center gap-2">
                                <span className="text-white/40 text-xs font-mono">{idx + 1}</span>
                                <span className="font-bold text-white text-sm whitespace-nowrap">{artist}</span>
                              </div>
                            </td>
                            {data.members.map(m => {
                              const r = artistRatings.find(ar => ar.user_id === m.id);
                              const total = r ? calcTotal(r) : null;
                              return (
                                <td key={m.id} className="p-3 text-center">
                                  {total !== null ? (
                                    <button onClick={() => setDetailPopup({ rating: r, artist })} className="text-white font-bold hover:text-yellow-400 hover:underline underline-offset-2 transition-colors">
                                      {total.toFixed(1)}
                                    </button>
                                  ) : <span className="text-white/10">-</span>}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center bg-yellow-400/5">
                              {avg > 0 ? (
                                <button onClick={() => setDetailPopup({ ratings: artistRatings, artist })} className="font-black text-lg text-yellow-400 hover:text-yellow-300 hover:underline underline-offset-2 transition-colors">
                                  {avg.toFixed(1)}
                                </button>
                              ) : <span className="font-black text-lg text-white/10">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Griglia voti — desktop */}
          {data?.members && data.members.length > 0 && (
            <div className="hidden md:block bg-[#0a0a2e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10">Artista</th>
                      {data.members.map(m => (
                        <th key={m.id} className="p-4 text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 text-center">
                          {m.username}
                        </th>
                      ))}
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-yellow-400 border-b border-white/10 text-center">Media</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artists.map((artist, idx) => {
                      const artistRatings = filteredRatings.filter(r => r.artist_name === artist);
                      const avg = artistRatings.length > 0
                        ? artistRatings.reduce((acc, r) => acc + calcTotal(r), 0) / artistRatings.length
                        : 0;
                      return (
                        <tr key={artist} className="hover:bg-white/5 transition-colors border-b border-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-white/40 text-xs font-mono">{idx + 1}</span>
                              <span className="font-bold text-white">{artist}</span>
                            </div>
                          </td>
                          {data.members.map(m => {
                            const r = artistRatings.find(ar => ar.user_id === m.id);
                            const total = r ? calcTotal(r) : null;
                            return (
                              <td key={m.id} className="p-4 text-center">
                                {total !== null ? (
                                  <button onClick={() => setDetailPopup({ rating: r, artist })} className="text-white font-bold hover:text-yellow-400 hover:underline underline-offset-2 transition-colors">
                                    {total.toFixed(1)}
                                  </button>
                                ) : <span className="text-white/10">-</span>}
                              </td>
                            );
                          })}
                          <td className="p-4 text-center bg-yellow-400/5">
                            {avg > 0 ? (
                              <button onClick={() => setDetailPopup({ ratings: artistRatings, artist })} className="font-black text-lg text-yellow-400 hover:text-yellow-300 hover:underline underline-offset-2 transition-colors">
                                {avg.toFixed(1)}
                              </button>
                            ) : <span className="font-black text-lg text-white/10">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredRatings.length === 0 && (
            <div className="text-center py-16 text-white/50">
              Nessun voto per questa serata
            </div>
          )}

        </div>
      )}

      {/* Rating Detail Popup */}
      <AnimatePresence>
        {detailPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setDetailPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a2e] p-6 rounded-3xl border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-5">
                {detailPopup.ratings ? (
                  <>
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-1 font-mono">
                      media compagnia · {detailPopup.ratings.length} vot{detailPopup.ratings.length === 1 ? 'o' : 'i'}
                    </p>
                    <h2 className="text-xl font-black text-yellow-400">{detailPopup.artist}</h2>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-1 font-mono">voto di</p>
                    <h2 className="text-xl font-black text-yellow-400">{detailPopup.rating!.username}</h2>
                    <p className="text-white/70 font-semibold mt-0.5">{detailPopup.artist}</p>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-5">
                {CATEGORIES.map(cat => {
                  const val: number = detailPopup.ratings
                    ? detailPopup.ratings.reduce((sum, r) => sum + (r[cat.id] ?? 0), 0) / detailPopup.ratings.length
                    : detailPopup.rating![cat.id] ?? 0;
                  const isCringe = cat.id === 'cringe';
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">{cat.name}</span>
                        <span className={`font-bold ${isCringe ? 'text-red-400' : 'text-yellow-400'}`}>
                          {val.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(val / 10) * 100}%` }}
                          transition={{ duration: 0.4, delay: 0.05 }}
                          className={`h-full rounded-full ${isCringe ? 'bg-red-400' : 'bg-yellow-400'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-4">
                <span className="text-white/60 text-sm font-medium">
                  {detailPopup.ratings ? 'Media totale' : 'Totale'}
                </span>
                <span className="text-2xl font-black text-yellow-400">
                  {detailPopup.ratings
                    ? (detailPopup.ratings.reduce((acc, r) => acc + calcTotal(r), 0) / detailPopup.ratings.length).toFixed(1)
                    : calcTotal(detailPopup.rating!).toFixed(1)
                  }
                </span>
              </div>

              {detailPopup.rating?.comment && (
                <div className="bg-white/5 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">note</p>
                  <p className="text-white/80 text-sm leading-relaxed">{detailPopup.rating.comment}</p>
                </div>
              )}

              <button
                onClick={() => setDetailPopup(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
              >
                Chiudi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
