import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { Button, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { BookOpen, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isRegister
        ? await api.register(name, email, password)
        : await api.login(email, password);
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="bg-slate-900 rounded-2xl p-6 mb-6 text-white overflow-hidden"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                <BookOpen size={24} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">KeuanganKu</h1>
                <p className="text-xs text-slate-400">Kelola keuangan dengan mudah</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl text-xs font-mono font-semibold">
              <span className="text-slate-400">{formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Aman', desc: 'JWT Auth', icon: ShieldCheck },
              { label: 'Jelas', desc: 'Grafik Real-time', icon: BarChart3 },
              { label: 'Cepat', desc: 'Sync Otomatis', icon: BookOpen },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-0"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <item.icon size={20} className="text-indigo-400 mb-2" />
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isRegister ? 'Buat akun baru' : 'Selamat datang kembali'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isRegister ? 'Mulai catat keuangan dalam hitungan detik.' : 'Masuk untuk melanjutkan ke dashboard.'}
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 bg-slate-900 text-white shadow-sm"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              Daftar
            </button>
          </div>

          {error && (
            <motion.div
              className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-start gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Nama"
                name="name"
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Kata sandi"
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
            />

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {isRegister ? 'Buat akun' : 'Masuk'}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
          </form>

          <motion.p
            className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Data tersimpan aman di server dengan enkripsi
          </motion.p>
        </motion.div>
      </motion.div>
    </main>
  );
}