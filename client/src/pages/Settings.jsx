import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { PageShell } from '@/components/layout';
import { Button, Input, Card } from '@/components/ui';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Settings({ user, onLogout, onUserUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setProfileMsg({ type: 'error', text: 'Nama minimal 2 karakter' });
      return;
    }
    try {
      setProfileLoading(true);
      setProfileMsg(null);
      const updated = await api.updateProfile(name.trim());
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui' });
      if (onUserUpdate) onUserUpdate(updated);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Password lama wajib diisi' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordMsg(null);
      await api.changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <PageShell user={user} onLogout={onLogout} activeView="settings" onNavigate={() => {}} pageTitle="Pengaturan">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Pengaturan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Kelola profil dan keamanan akunmu</p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Profil</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ubah nama tampilanmu</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Nama"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={user?.email || ''}
                disabled
                hint="Email tidak dapat diubah"
              />

              {profileMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${profileMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                  {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {profileMsg.text}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={profileLoading}>
                  Simpan Profil
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Password Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Lock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Keamanan</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ubah password akunmu</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Password Lama"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Masukkan password lama"
              />
              <Input
                label="Password Baru"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                maxLength={128}
                placeholder="Minimal 6 karakter"
              />
              <Input
                label="Konfirmasi Password Baru"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Ulangi password baru"
                error={confirmPassword && newPassword !== confirmPassword ? 'Password tidak cocok' : undefined}
              />

              {passwordMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${passwordMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                  {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={passwordLoading}>
                  Ubah Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
}