import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Star, Users, User as UserIcon, Headphones } from 'lucide-react';
import { getCurrentUser, logoutUser } from './api/auth';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { NightList } from './pages/NightList';
import { RatingPage } from './pages/RatingPage';
import { CompagniaPage } from './pages/CompagniaPage';
import { CompagniaDetail } from './pages/CompagniaDetail';
import { StreamingPage } from './pages/StreamingPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    getCurrentUser()
      .then(data => setUser(data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUser, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05051a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400" />
      </div>
    );
  }

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
                <Route path="/streaming" element={<StreamingPage />} />
                <Route path="/compagnie" element={<CompagniaPage />} />
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
            <Link to="/streaming" className="flex flex-col items-center gap-1 text-white/60 hover:text-yellow-400 transition-colors">
              <Headphones size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Streaming</span>
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
