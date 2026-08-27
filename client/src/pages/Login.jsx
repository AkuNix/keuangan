import React, { useState } from 'react';
import { api } from '../api';
import { BookOpen } from 'lucide-react';

const C = {
  paper:     '#F7F5F0',
  paperDark: '#EDEADE',
  rule:      '#DDD9CF',
  ink:       '#1A1A2E',
  inkMid:    '#4A4A6A',
  inkFaint:  '#9898B8',
  green:     '#00875A',
  greenMid:  '#00663F',
  red:       '#C0392B',
};

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

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
      setError(err.message || 'Gagal. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.paperDark,
      display: 'flex',
      fontFamily: 'var(--font-sans)',
      /* Ruled paper texture */
      backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 39px, ${C.rule} 39px, ${C.rule} 40px)`,
    }}>
      {/* Left brand column */}
      <div style={{
        width: 340, flexShrink: 0,
        background: C.ink,
        display: 'flex', flexDirection: 'column',
        padding: '48px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative ruled lines in ink color */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 39px, ${C.paperDark} 39px, ${C.paperDark} 40px)`,
        }} />

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
            <BookOpen size={20} color={C.inkFaint} strokeWidth={1.5} />
            <span style={{ fontWeight: 700, fontSize: 15, color: C.paper, letterSpacing: '-0.02em' }}>KeuanganKu</span>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: C.paper, lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.03em' }}>
              Buku kas pribadi<br />yang rapi dan jelas.
            </p>
            <p style={{ fontSize: 13, color: C.inkFaint, lineHeight: 1.7, maxWidth: 220 }}>
              Catat setiap rupiah yang masuk dan keluar. Lihat ke mana uang Anda pergi.
            </p>
          </div>

          {/* Bottom feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Pencatatan pemasukan & pengeluaran', 'Grafik arus kas bulanan', 'Alokasi per kategori'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.inkFaint }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form column */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 6, letterSpacing: '-0.02em' }}>
            {isRegister ? 'Buat akun baru' : 'Masuk ke akun Anda'}
          </p>
          <p style={{ fontSize: 12, color: C.inkFaint, marginBottom: 32 }}>
            {isRegister ? 'Isi data di bawah untuk mulai mencatat.' : 'Selamat datang kembali.'}
          </p>

          {error && (
            <div style={{
              marginBottom: 20, padding: '10px 14px',
              background: '#FCECEA', border: `1px solid #F5B7B1`,
              borderRadius: 6, fontSize: 12, color: C.red, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isRegister && (
              <LoginField label="Nama Lengkap">
                <input type="text" required placeholder="Nama Anda" value={name}
                  onChange={e => setName(e.target.value)} style={fieldStyle} />
              </LoginField>
            )}
            <LoginField label="Alamat Email">
              <input type="email" required placeholder="nama@email.com" value={email}
                onChange={e => setEmail(e.target.value)} style={fieldStyle} />
            </LoginField>
            <LoginField label="Kata Sandi">
              <input type="password" required placeholder="Minimal 6 karakter" value={password}
                onChange={e => setPassword(e.target.value)} style={fieldStyle} />
            </LoginField>

            <button type="submit" disabled={loading} style={{
              marginTop: 8, padding: '12px 0',
              background: loading ? C.inkMid : C.ink, color: C.paper,
              border: 'none', borderRadius: 7,
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em', transition: 'background 0.15s',
            }}>
              {loading ? 'Memproses…' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: C.inkFaint, textAlign: 'center' }}>
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{
              background: 'none', border: 'none', padding: 0,
              color: C.ink, fontWeight: 700, fontSize: 12,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              textDecoration: 'underline',
            }}>
              {isRegister ? 'Masuk di sini' : 'Daftar gratis'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: '100%', padding: '10px 12px',
  background: '#fff', border: `1px solid #DDD9CF`,
  borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 13, color: '#1A1A2E',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function LoginField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9898B8', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
