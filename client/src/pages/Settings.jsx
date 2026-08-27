import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { Button, Input } from '@/components/ui';
import { Lock, CheckCircle, AlertCircle, Shield, Info } from 'lucide-react';

export default function Settings({ user, onLogout, onNavigate }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const passwordStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Lemah', 'Sedang', 'Kuat'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keamanan dan informasi akun</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Shield size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">Ubah Password</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Perbarui password akunmu</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <Input
                label="Password Lama"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Masukkan password lama"
              />
              <div>
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
                {newPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${passwordStrength <= 1 ? 'text-rose-500' : passwordStrength === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>
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
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm ${passwordMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}
                >
                  {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {passwordMsg.text}
                </motion.div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" loading={passwordLoading}>
                  Ubah Password
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Info size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">Tentang Aplikasi</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Informasi KeuanganKu</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-sm text-slate-500 dark:text-slate-400">Nama Aplikasi</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">KeuanganKu</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-sm text-slate-500 dark:text-slate-400">Versi</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Tersedia</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Dark Mode</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}