import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.logoArea}>
          <h1 style={styles.logo}>CRATELINE</h1>
          <p style={styles.version}>— SYSTEM ACCESS V4.2 —</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <h2 style={styles.formTitle}>Sign In</h2>
          <p style={styles.formSub}>Enter your credentials to access the system</p>

          <label style={styles.label}>PERSONNEL EMAIL</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@crateline.os"
            required
          />

          <label style={styles.label}>SECURITY KEY</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            SIGN IN TO CRATELINE →
          </button>

          <div style={styles.links}>
            <span style={styles.link}>Forgot credentials?</span>
            <span style={styles.link}>Request access</span>
          </div>
        </form>

        <div style={styles.statusBar}>
          <div style={styles.statusRow}>
            <span style={styles.statusDot}>●</span>
            <span style={styles.statusText}>Encrypted Connection: AES-256</span>
          </div>
          <div style={styles.statusRow}>
            <span style={styles.statusDot}>●</span>
            <span style={styles.statusText}>Industrial Standard: All activities logged</span>
          </div>
          <div style={styles.statusRow}>
            <span style={{ ...styles.statusDot, color: '#27ae60' }}>●</span>
            <span style={styles.statusText}>System Ready</span>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.rightContent}>
          <h2 style={styles.rightTitle}>Inventory Management System</h2>
          <p style={styles.rightSub}>Precision control of your warehouse operations</p>
          <div style={styles.featureList}>
            {['Real-time stock monitoring', 'Low stock alerts', 'Transaction history', 'Category management', 'Dashboard analytics'].map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureCheck}>✓</span>
                <span style={styles.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <span>System Status</span>
        <span>Legal</span>
        <span>Privacy Policy</span>
        <span>Direct Support</span>
        <span>© 2024 CRATELINE</span>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f4f6f8', position: 'relative' },
  left: { flex: 1, backgroundColor: '#fff', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '520px', boxShadow: '2px 0 16px rgba(0,0,0,0.06)' },
  logoArea: { marginBottom: '32px' },
  logo: { color: '#c0392b', fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '2px' },
  version: { color: '#95a5a6', fontSize: '11px', letterSpacing: '2px', margin: '4px 0 0 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formTitle: { fontSize: '24px', fontWeight: '800', color: '#2c3e50', margin: '0 0 4px 0' },
  formSub: { fontSize: '13px', color: '#95a5a6', margin: '0 0 16px 0' },
  label: { fontSize: '11px', fontWeight: '700', color: '#7f8c8d', letterSpacing: '1px' },
  input: { padding: '12px 16px', border: '1px solid #e0e0e0', backgroundColor: '#f4f6f8', fontSize: '14px', outline: 'none', borderRadius: '8px', color: '#2c3e50' },
  error: { color: '#c0392b', fontSize: '12px', backgroundColor: '#fdf0f0', padding: '8px 12px', borderRadius: '6px' },
  button: { backgroundColor: '#c0392b', color: '#fff', padding: '14px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', letterSpacing: '1px', marginTop: '8px', borderRadius: '8px' },
  links: { display: 'flex', justifyContent: 'space-between', marginTop: '4px' },
  link: { fontSize: '12px', color: '#95a5a6', cursor: 'pointer' },
  statusBar: { marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusDot: { fontSize: '10px', color: '#c0392b' },
  statusText: { fontSize: '11px', color: '#95a5a6' },
  right: { flex: 1, backgroundColor: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' },
  rightContent: { maxWidth: '360px' },
  rightTitle: { fontSize: '28px', fontWeight: '900', color: '#fff', margin: '0 0 12px 0' },
  rightSub: { fontSize: '14px', color: '#95a5a6', margin: '0 0 32px 0' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureCheck: { color: '#27ae60', fontSize: '16px', fontWeight: '900' },
  featureText: { color: '#bdc3c7', fontSize: '14px' },
  footer: { position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#2c3e50', color: '#7f8c8d', display: 'flex', justifyContent: 'space-around', padding: '12px', fontSize: '11px' },
};