import React, { useState } from 'react';
import { api } from '../api';
import { ArrowRight, ShieldCheck, BarChart3, BookOpen } from 'lucide-react';

const C = {
  canvas: '#f5f3ef',
  surface: '#ffffff',
  ink: '#1a1a1a',
  ink2: '#555555',
  ink3: '#888888',
  border: '#e5e5e5',
  borderSoft: '#f0efec',
  accent: '#4338ca',
  accentSoft: '#eef2ff',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  red: '#dc2626',
  redSoft: '#fef2f2',
};

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
    <main className="login-shell" style={{
      minHeight: '100vh',
      background: C.canvas,
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="login-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          width: '100%',
          alignItems: 'center',
        }}>

          {/* Left: Brand panel */}
          <section className="login-hero" style={{
            background: C.ink,
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 440,
            overflow: 'hidden',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                  <BookOpen size={16} color="#fff" />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700 }}>KeuanganKu</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: '-0.03em',
                fontWeight: 800,
                maxWidth: 400,
              }}>
                Catat keuangan<br />tanpa ribet.
              </h1>
              <p style={{
                marginTop: 16,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                maxWidth: 340,
              }}>
                Pemasukan, pengeluaran, dan tren cash flow dalam satu tempat. Tanpa spreadsheet, tanpa ribet.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Aman', desc: 'JWT auth', icon: ShieldCheck },
                { label: 'Jelas', desc: 'Grafik', icon: BarChart3 },
                { label: 'Cepat', desc: 'Real-time', icon: BookOpen },
              ].map((item) => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                  minWidth: 0,
                }}>
                  <item.icon size={14} color="rgba(255,255,255,0.4)" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Right: Form */}
          <section className="login-panel" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <div className="login-card" style={{
              width: '100%',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 'var(--radius-lg)',
              padding: 28,
              minWidth: 0,
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: 0 }}>
                  {isRegister ? 'Buat akun' : 'Masuk'}
                </h2>
                <p style={{ marginTop: 4, fontSize: 13, color: C.ink3, margin: '4px 0 0' }}>
                  {isRegister ? 'Mulai catat dalam hitungan detik.' : 'Lanjutkan ke dashboard.'}
                </p>
              </div>

              {/* Tab toggle */}
              <div style={{ display: 'flex', gap: 4, padding: 3, background: C.surfaceDim, borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
                <button type="button" onClick={() => { setIsRegister(false); setError(''); }} style={{
                  flex: 1, border: 'none', borderRadius: 6, padding: '8px 12px',
                  background: !isRegister ? C.surface : 'transparent',
                  color: !isRegister ? C.ink : C.ink3,
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
                }}>Masuk</button>
                <button type="button" onClick={() => { setIsRegister(true); setError(''); }} style={{
                  flex: 1, border: 'none', borderRadius: 6, padding: '8px 12px',
                  background: isRegister ? C.surface : 'transparent',
                  color: isRegister ? C.ink : C.ink3,
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
                }}>Daftar</button>
              </div>

              {error && (
                <div style={{
                  marginBottom: 14, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: C.redSoft, border: '1px solid #fecaca',
                  color: C.red, fontSize: 12, lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Nama</label>
                    <input type="text" required placeholder="Nama Anda" value={name} onChange={e => setName(e.target.value)} style={fieldStyle} />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Email</label>
                  <input type="email" required placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Kata sandi</label>
                  <input type="password" required placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle} />
                </div>

                <button type="submit" disabled={loading} style={{
                  marginTop: 4, width: '100%', padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)', border: 'none',
                  background: loading ? C.ink3 : C.accent,
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background 0.12s',
                }}>
                  {loading ? 'Masuk...' : isRegister ? 'Buat akun' : 'Masuk'}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: C.ink3, fontSize: 11 }}>
                <div style={{ width: 6, height: 6, borderRadius: 99, background: C.green }} />
                Data tersimpan aman di server.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const fieldStyle = {
  width: '100%',
  padding: '9px 12px',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: C.ink,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.12s',
};
