import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, User as UserIcon } from 'lucide-react';
import { updateProfile } from '../api/profile';

interface ProfilePageProps {
  user: any;
  onUpdate: () => void;
}

export const ProfilePage = ({ user, onUpdate }: ProfilePageProps) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage("L'immagine è troppo grande. Massimo 1MB.");
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
    const ok = await updateProfile(bio, profileImage);
    if (ok) {
      setMessage('Profilo aggiornato con successo!');
      onUpdate();
    } else {
      setMessage("Errore durante l'aggiornamento.");
    }
    setSaving(false);
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
              <img
                src={profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-xl group-hover:opacity-75 transition-opacity"
              />
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
              onChange={e => setBio(e.target.value)}
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
