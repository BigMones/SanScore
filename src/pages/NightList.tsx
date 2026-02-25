import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Music, ChevronRight } from 'lucide-react';
import { NIGHTS } from '../constants';

export const NightList = () => {
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
