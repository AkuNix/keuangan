import React, { useState } from 'react';
import { api } from '../api';
import { ArrowRight, BadgeCheck, BarChart3, BookOpen, ShieldCheck } from 'lucide-react';

const C = {
  canvas: '#f8fafc',
  surface: '#ffffff',
  panel: '#0f172a',
  panelSoft: '#111827',
  border: '#e2e8f0',
  borderSoft: '#f1f5f9',
  text: '#0f172a',
  muted: '#64748b',
  subtle: '#94a3b8',
  brand: '#4f46e5',
  brandSoft: '#eef2ff',
  income: '#059669',
  incomeBg: '#ecfdf5',
  expense: '#e11d48',
  expenseBg: '#fff1f2',
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
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-8rem', left: '-6rem', width: 320, height: 320, borderRadius: '50%', background: 'rgba(79,70,229,0.10)', filter: 'blur(64px)' }} />
        <div style={{ position: 'absolute', bottom: '-7rem', right: '-5rem', width: 360, height: 360, borderRadius: '50%', background: 'rgba(16,185,129,0.10)', filter: 'blur(72px)' }} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1180,
        margin: '0 auto',
        minHeight: '100vh',
        padding: '16px',
      }}>
        <div className="login-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          minHeight: 'calc(100vh - 32px)',
        }}>
          <section className="login-hero" style={{
            background: C.panel,
            color: '#fff',
            borderRadius: 20,
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
          }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: 40, right: 36, width: 180, height: 180, borderRadius: '50%', background: 'rgba(79,70,229,0.24)', filter: 'blur(12px)' }} />
              <div style={{ position: 'absolute', bottom: 28, left: -18, width: 220, height: 220, borderRadius: '50%', background: 'rgba(16,185,129,0.16)', filter: 'blur(20px)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <BookOpen size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>KeuanganKu</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.64)' }}>Personal finance, done cleanly.</div>
                </div>
              </div>

              <div style={{ maxWidth: 540, minWidth: 0 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  fontSize: 12, color: 'rgba(255,255,255,0.86)', marginBottom: 18,
                }}>
                  <BadgeCheck size={14} />
                  Ledger, charts, and login in one place
                </div>
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                  lineHeight: 1,
                  margin: 0,
                  letterSpacing: '-0.04em',
                  fontWeight: 800,
                  overflow: 'hidden',
                }}>
                  Track money like a product, not a spreadsheet.
                </h1>
                <p style={{
                  marginTop: 20,
                  maxWidth: 480,
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.72)',
                }}>
                  Catat pemasukan, pengeluaran, dan tren cash flow dengan tampilan yang tenang, jelas, dan siap dipakai setiap hari.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginTop: 28 }}>
              {[
                { label: 'Privacy', value: 'JWT login', icon: ShieldCheck },
                { label: 'Insights', value: 'Charts', icon: BarChart3 },
                { label: 'Database', value: 'PostgreSQL', icon: BadgeCheck },
              ].map((item) => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: 14,
                  minWidth: 0,
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                    <item.icon size={12} />
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="login-panel" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <div className="login-card" style={{
              width: '100%',
              borderRadius: 20,
              background: C.surface,
              border: `1px solid ${C.borderSoft}`,
              padding: 28,
              minWidth: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: C.text }}>
                    {isRegister ? 'Buat akun' : 'Masuk'}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                    {isRegister ? 'Mulai mencatat transaksi dalam hitungan detik.' : 'Lanjutkan ke dashboard Anda.'}
                  </div>
                </div>
                <div style={{
                  width: 46, height: 46, borderRadius: 16,
                  display: 'grid', placeItems: 'center',
                  background: C.brandSoft, color: C.brand,
                  border: '1px solid rgba(79,70,229,0.14)',
                }}>
                  <ShieldCheck size={19} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 16, background: '#f8fafc', border: `1px solid ${C.border}`, marginBottom: 18 }}>
                <button type="button" onClick={() => { setIsRegister(false); setError(''); }} style={{
                  flex: 1, border: 'none', borderRadius: 12, padding: '10px 12px',
                  background: !isRegister ? C.surface : 'transparent',
                  color: !isRegister ? C.text : C.muted,
                  fontWeight: 700, cursor: 'pointer',
                  boxShadow: !isRegister ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
                }}>Masuk</button>
                <button type="button" onClick={() => { setIsRegister(true); setError(''); }} style={{
                  flex: 1, border: 'none', borderRadius: 12, padding: '10px 12px',
                  background: isRegister ? C.surface : 'transparent',
                  color: isRegister ? C.text : C.muted,
                  fontWeight: 700, cursor: 'pointer',
                  boxShadow: isRegister ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
                }}>Daftar</button>
              </div>

              {error && (
                <div style={{
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 16,
                  background: C.expenseBg,
                  border: '1px solid rgba(225,29,72,0.15)',
                  color: C.expense,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                {isRegister && (
                  <LoginField label="Nama lengkap">
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={fieldStyle}
                    />
                  </LoginField>
                )}

                <LoginField label="Alamat email">
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={fieldStyle}
                  />
                </LoginField>

                <LoginField label="Kata sandi">
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={fieldStyle}
                  />
                </LoginField>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 6,
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 16,
                    border: 'none',
                    background: loading ? '#818cf8' : C.brand,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 14px 30px rgba(79,70,229,0.22)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
                  }}
                >
                  {loading ? 'Memproses…' : isRegister ? 'Buat akun' : 'Masuk ke dashboard'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, color: C.subtle, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.income }} />
                Data tersimpan di Neon PostgreSQL.
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
  padding: '12px 14px',
  background: '#fff',
  border: '1px solid #dbe3f0',
  borderRadius: 14,
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function LoginField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.01em', color: '#475569', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
