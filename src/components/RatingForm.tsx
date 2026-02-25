import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { CATEGORIES, Rating } from '../constants';

interface RatingFormProps {
  artist: string;
  initialRating?: Rating;
  onSave: (data: any) => void;
}

export const RatingForm = ({ initialRating, onSave }: RatingFormProps) => {
  const [values, setValues] = useState({
    esibizione: initialRating?.esibizione ?? 6,
    outfit: initialRating?.outfit ?? 6,
    testo: initialRating?.testo ?? 6,
    musica: initialRating?.musica ?? 6,
    intonazione: initialRating?.intonazione ?? 6,
    stile: initialRating?.stile ?? 6,
    cringe: initialRating?.cringe ?? 0,
    comment: initialRating?.comment ?? '',
  });

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
              onChange={(e) => setValues(prev => ({ ...prev, [cat.id]: parseFloat(e.target.value) }))}
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
