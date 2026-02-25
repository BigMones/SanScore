import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar = ({ user, onLogout }: NavbarProps) => {
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
