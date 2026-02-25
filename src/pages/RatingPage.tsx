import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ARTISTS, NIGHT_ARTISTS, NIGHTS, Rating } from '../constants';
import { getRatings, saveRating } from '../api/ratings';
import { RatingForm } from '../components/RatingForm';

export const RatingPage = () => {
  const { nightId } = useParams<{ nightId: string }>();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const night = NIGHTS.find(n => n.id === nightId);
  const artists = NIGHT_ARTISTS[nightId!] ?? ARTISTS;

  const loadRatings = async () => {
    const data = await getRatings();
    setRatings(data.filter(r => r.night_id === nightId));
  };

  useEffect(() => {
    loadRatings().finally(() => setLoading(false));
  }, [nightId]);

  const handleSaveRating = async (ratingData: Partial<Rating> & { artist_name?: string }) => {
    const success = await saveRating({
      ...ratingData as any,
      night_id: nightId!,
      artist_name: ratingData.artist_name!,
    });
    if (success) {
      await loadRatings();
      setSelectedArtist(null);
    }
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
        {artists.map((artist, idx) => {
          const rating = ratings.find(r => r.artist_name === artist);
          const total = rating
            ? rating.esibizione + rating.outfit + rating.testo + rating.musica + rating.intonazione + rating.stile - rating.cringe
            : 0;

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
                    <span className="text-2xl font-black text-yellow-400">{total.toFixed(1)}</span>
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
