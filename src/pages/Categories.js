import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import { useUser } from '../components/Layout';

export default function Categories() {
  const { isAdmin } = useUser() || { isAdmin: false };
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch { setError('Failed to load categories.'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategory({ name });
      setName('');
      setSuccess('Category created!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create category.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (cid) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteCategory(cid);
      setSuccess('Category deleted!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const icons = ['🥦', '🧴', '🥩', '🥛', '🍞', '🧹', '❄️', '📦'];

  return (
    <div style={styles.body}>
      {isAdmin && (
        <div style={styles.sidebar}>
          <p style={styles.formTitle}>ADD CATEGORY</p>
          <form onSubmit={handleCreate}>
            <input style={styles.input} placeholder="Category name..." value={name} onChange={(e) => setName(e.target.value)} required />
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <input type="submit" value="+ REGISTER NODE" style={styles.button} />
          </form>
          <div style={styles.divider} />
          <p style={styles.formTitle}>QUICK LINKS</p>
          <div style={styles.quickLink} onClick={() => navigate('/products')}>☰ View All Products</div>
          <div style={styles.quickLink} onClick={() => navigate('/activity')}>↺ Activity Log</div>
          <div style={styles.quickLink} onClick={() => navigate('/dashboard')}>⊞ Dashboard</div>
        </div>
      )}

      <div style={styles.main}>
        <h2 style={styles.heading}>INVENTORY</h2>
        <h2 style={styles.headingRed}>NODES</h2>
        <p style={styles.subheading}>Precision control of warehouse subdivisions</p>

        {!isAdmin && <div style={styles.viewOnlyBanner}>👁 View Only Mode — Contact an administrator to make changes</div>}

        <div style={styles.grid}>
          {categories.map((cat, index) => (
            <div key={cat.cid} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</span>
                <span style={styles.cardBadge}>GENERAL</span>
              </div>
              <div style={styles.cardIcon}>{icons[index % icons.length]}</div>
              <h3 style={styles.cardTitle}>{cat.name.toUpperCase()}</h3>
              <p style={styles.cardSub}>— units</p>
              {isAdmin && (
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => navigate('/products')}>EDIT NODE</button>
                  <button style={styles.deleteCardBtn} onClick={() => handleDelete(cat.cid)}>🗑</button>
                </div>
              )}
            </div>
          ))}
          {isAdmin && (
            <div style={styles.addCard}>
              <div style={styles.addIcon}>+</div>
              <p style={styles.addText}>Register New Category</p>
              <p style={styles.addSubText}>Expand infrastructure</p>
            </div>
          )}
        </div>

        <div style={styles.networkCard}>
          <p style={styles.networkLabel}>NETWORK LOAD</p>
          <h2 style={styles.networkValue}>98.2%</h2>
          <p style={styles.networkSub}>Scanning nodes active</p>
          <p style={styles.networkAlert}>Data Integrity ✓ Optimal</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '260px', backgroundColor: '#fff', height: '100%', borderRight: '1px solid #e0e0e0', flexShrink: 0, overflowY: 'auto', padding: '24px 16px' },
  formTitle: { fontSize: '10px', color: '#95a5a6', marginBottom: '10px', letterSpacing: '1.5px', fontWeight: '700' },
  input: { padding: '9px 12px', border: '1px solid #e0e0e0', fontSize: '13px', backgroundColor: '#f4f6f8', width: '100%', boxSizing: 'border-box', marginBottom: '10px', display: 'block', borderRadius: '8px', outline: 'none' },
  error: { color: '#c0392b', fontSize: '11px', margin: '4px 0' },
  success: { color: '#27ae60', fontSize: '11px', margin: '4px 0' },
  button: { backgroundColor: '#c0392b', color: '#fff', padding: '10px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', width: '100%', display: 'block', textAlign: 'center', borderRadius: '8px' },
  divider: { borderTop: '1px solid #e0e0e0', margin: '20px 0' },
  quickLink: { padding: '10px 12px', fontSize: '13px', color: '#555', cursor: 'pointer', borderRadius: '8px', marginBottom: '4px', backgroundColor: '#f4f6f8' },
  main: { flex: 1, padding: '28px', overflowY: 'auto', position: 'relative' },
  heading: { fontSize: '32px', fontWeight: '900', margin: 0, color: '#2c3e50' },
  headingRed: { fontSize: '32px', fontWeight: '900', color: '#c0392b', margin: '0 0 8px 0' },
  subheading: { fontSize: '12px', color: '#95a5a6', marginBottom: '24px' },
  viewOnlyBanner: { backgroundColor: '#fff9e6', border: '1px solid #f0d080', color: '#8a6d00', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '12px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardNumber: { fontSize: '22px', fontWeight: '900', color: '#c0392b' },
  cardBadge: { fontSize: '9px', backgroundColor: '#f4f6f8', padding: '3px 8px', color: '#95a5a6', borderRadius: '20px', fontWeight: '700' },
  cardIcon: { fontSize: '28px', marginBottom: '8px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#2c3e50' },
  cardSub: { fontSize: '11px', color: '#95a5a6', marginBottom: '14px' },
  cardActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  editBtn: { backgroundColor: '#2c3e50', color: '#fff', padding: '6px 12px', border: 'none', fontSize: '11px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' },
  deleteCardBtn: { backgroundColor: 'transparent', border: '1px solid #e0e0e0', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderRadius: '6px' },
  addCard: { backgroundColor: '#f4f6f8', padding: '20px', border: '2px dashed #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', cursor: 'pointer', borderRadius: '12px' },
  addIcon: { fontSize: '32px', color: '#bdc3c7', marginBottom: '8px' },
  addText: { fontSize: '12px', fontWeight: '700', color: '#95a5a6', textAlign: 'center' },
  addSubText: { fontSize: '10px', color: '#bdc3c7', textAlign: 'center' },
  networkCard: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#2c3e50', color: '#fff', padding: '20px', minWidth: '160px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' },
  networkLabel: { fontSize: '10px', color: '#95a5a6', marginBottom: '4px', letterSpacing: '1px' },
  networkValue: { fontSize: '28px', fontWeight: '900', color: '#c0392b', margin: '0 0 6px 0' },
  networkSub: { fontSize: '10px', color: '#95a5a6' },
  networkAlert: { fontSize: '10px', color: '#2ecc71', marginTop: '4px', fontWeight: '700' },
};