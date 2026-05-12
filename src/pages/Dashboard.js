import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getProducts, getCategories } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {
        setError('Session expired.');
        localStorage.removeItem('token');
        navigate('/');
      });
getProducts().then((res) => setProducts(res.data.data)).catch(() => {});    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, [navigate]);

  const lowStockProducts = products.filter((p) => p.quantity < p.reorder_level);
  const maxQuantity = Math.max(...products.map((p) => p.quantity), 1);
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.main}>
      <div style={styles.mainHeader}>
        <div>
          <h2 style={styles.heading}>OPERATIONAL</h2>
          <h2 style={styles.headingRed}>OVERVIEW</h2>
        </div>
        <div style={styles.searchArea}>
          <input
            style={styles.searchInput}
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSearch(e.target.value.length > 0); }}
          />
          {showSearch && filteredProducts.length > 0 && (
            <div style={styles.searchDropdown}>
              {filteredProducts.slice(0, 6).map((p) => (
                <div key={p.pid} style={styles.searchItem}
                  onClick={() => { navigate('/products'); setSearch(''); setShowSearch(false); }}>
                  <div style={styles.searchItemLeft}>
                    <span style={styles.searchSku}>CR-{String(p.pid).padStart(5, '0')}</span>
                    <span style={styles.searchName}>{p.name}</span>
                  </div>
                  <span style={p.quantity < p.reorder_level ? styles.searchBadgeLow : styles.searchBadgeIn}>
                    {p.quantity < p.reorder_level ? 'LOW' : 'OK'}
                  </span>
                </div>
              ))}
              {filteredProducts.length > 6 && (
                <div style={styles.searchMore} onClick={() => navigate('/products')}>
                  +{filteredProducts.length - 6} more → View all
                </div>
              )}
            </div>
          )}
          {showSearch && filteredProducts.length === 0 && (
            <div style={styles.searchDropdown}>
              <div style={styles.searchEmpty}>No products found</div>
            </div>
          )}
        </div>
      </div>

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      {data && (
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>TOTAL RECORDS</p>
            <h1 style={styles.cardNumber}>{data.total_products.toLocaleString()}</h1>
            <p style={styles.cardSub}>ACTIVE PRODUCTS IN SYSTEM</p>
          </div>
          <div style={{ ...styles.card, backgroundColor: '#c0392b' }}>
            <p style={styles.cardLabelWhite}>LOW STOCK ALERTS</p>
            <h1 style={styles.cardNumberWhite}>{data.low_stock_alerts}</h1>
            <p style={styles.cardLinkWhite} onClick={() => navigate('/products?lowstock=true')}>REVIEW CRITICAL ITEMS →</p>
          </div>
          <div style={{ ...styles.card, backgroundColor: '#2c3e50' }}>
            <p style={styles.cardLabelWhite}>TOTAL STOCK VALUE</p>
            <h1 style={styles.cardNumberWhite}>${data.total_stock_value.toLocaleString()}</h1>
            <p style={styles.cardLabelWhite}>+2.4% VS PREVIOUS</p>
          </div>
          <div style={{ ...styles.card, backgroundColor: '#ecf0f1' }}>
            <p style={styles.cardLabel}>CATEGORIES</p>
            <h1 style={styles.cardNumber}>{categories.length}</h1>
            <p style={{ ...styles.cardSub, cursor: 'pointer' }} onClick={() => navigate('/categories')}>VIEW ALL →</p>
          </div>
        </div>
      )}

      <div style={styles.middleSection}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>STOCK LEVELS</h3>
            <span style={styles.chartSub}>REAL-TIME INVENTORY</span>
          </div>
          {products.length === 0 ? <p style={styles.emptyChart}>No products to display</p> : (
            <div style={styles.chartArea}>
              {products.map((p) => (
                <div key={p.pid} style={styles.barGroup}>
                  <div style={styles.barLabel}>{p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name}</div>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${(p.quantity / maxQuantity) * 100}%`, backgroundColor: p.quantity < p.reorder_level ? '#c0392b' : '#2c3e50' }} />
                  </div>
                  <div style={styles.barValue}>{p.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.alertCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>⚠ CRITICAL ALERTS</h3>
            <span style={styles.chartSub}>{lowStockProducts.length} ITEMS</span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div style={styles.allGood}>
              <p style={styles.allGoodIcon}>✓</p>
              <p style={styles.allGoodText}>ALL STOCK LEVELS NOMINAL</p>
            </div>
          ) : (
            lowStockProducts.map((p) => (
              <div key={p.pid} style={styles.alertRow}>
                <div>
                  <p style={styles.alertName}>{p.name.toUpperCase()}</p>
                  <p style={styles.alertSub}>CR-{String(p.pid).padStart(5, '0')}</p>
                </div>
                <div style={styles.alertRight}>
                  <div style={styles.alertBadge}>
                    <span style={styles.alertQty}>{p.quantity}</span>
                    <span style={styles.alertLevel}>/ {p.reorder_level}</span>
                  </div>
                  <button style={styles.restockBtn} onClick={() => navigate(`/activity?pid=${p.pid}`)}>RESTOCK</button>
                </div>
              </div>
            ))
          )}
          <button style={styles.viewAllBtn} onClick={() => navigate('/products?lowstock=true')}>VIEW ALL CRITICAL ITEMS →</button>
        </div>
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.categoryCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>CATEGORY BREAKDOWN</h3>
            <span style={styles.chartSub}>{categories.length} NODES</span>
          </div>
          {categories.length === 0 ? <p style={styles.emptyChart}>No categories yet</p> : (
            categories.map((cat, index) => {
              const count = products.filter((p) => p.category_id === cat.cid).length;
              const icons = ['🥦', '🧴', '🥩', '🥛', '🍞', '🧹', '❄️', '📦'];
              return (
                <div key={cat.cid} style={styles.categoryRow}>
                  <span style={styles.categoryIcon}>{icons[index % icons.length]}</span>
                  <span style={styles.categoryName}>{cat.name.toUpperCase()}</span>
                  <span style={styles.categoryCount}>{count} items</span>
                </div>
              );
            })
          )}
        </div>

        <div style={styles.quickCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>QUICK ACTIONS</h3>
            <span style={styles.chartSub}>SHORTCUTS</span>
          </div>
          <button style={styles.quickBtn} onClick={() => navigate('/products')}>＋ ADD NEW PRODUCT</button>
          <button style={styles.quickBtn} onClick={() => navigate('/categories')}>＋ ADD NEW CATEGORY</button>
          <button style={styles.quickBtn} onClick={() => navigate('/activity')}>↑ STOCK IN / OUT</button>
          <button style={{ ...styles.quickBtn, backgroundColor: '#c0392b', color: '#fff' }} onClick={() => navigate('/products?lowstock=true')}>⚠ VIEW LOW STOCK</button>
        </div>

        <div style={styles.systemCard}>
          <div style={styles.chartHeader}>
            <h3 style={{ ...styles.chartTitle, color: '#ecf0f1' }}>SYSTEM INFO</h3>
            <span style={{ ...styles.chartSub, color: '#2ecc71' }}>● ONLINE</span>
          </div>
          {[['TERMINAL', 'NODE_CRATE_08'], ['VERSION', 'V4.2'], ['STATUS', 'OPTIMAL'], ['TIMESTAMP', new Date().toLocaleTimeString()], ['FULFILMENT', '99.2%']].map(([label, value]) => (
            <div key={label} style={styles.infoRow}>
              <span style={styles.infoLabel}>{label}</span>
              <span style={{ ...styles.infoValue, color: label === 'STATUS' ? '#2ecc71' : '#ecf0f1' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  main: { padding: '28px', overflowY: 'auto', flex: 1 },
  mainHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  heading: { fontSize: '32px', fontWeight: '900', margin: 0, color: '#2c3e50' },
  headingRed: { fontSize: '32px', fontWeight: '900', color: '#c0392b', margin: 0 },
  searchArea: { position: 'relative', width: '280px' },
  searchInput: { width: '100%', padding: '10px 16px', border: '1px solid #e0e0e0', fontSize: '13px', backgroundColor: '#fff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  searchDropdown: { position: 'absolute', top: '44px', left: 0, right: 0, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' },
  searchItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f4f6f8' },
  searchItemLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  searchSku: { fontSize: '10px', color: '#95a5a6', fontWeight: '600' },
  searchName: { fontSize: '13px', color: '#2c3e50', fontWeight: '600' },
  searchBadgeIn: { backgroundColor: '#eafaf1', color: '#27ae60', padding: '2px 8px', fontSize: '10px', fontWeight: '700', borderRadius: '20px' },
  searchBadgeLow: { backgroundColor: '#fdf0f0', color: '#c0392b', padding: '2px 8px', fontSize: '10px', fontWeight: '700', borderRadius: '20px' },
  searchMore: { padding: '10px 16px', fontSize: '12px', color: '#c0392b', cursor: 'pointer', fontWeight: '600', textAlign: 'center' },
  searchEmpty: { padding: '16px', fontSize: '13px', color: '#95a5a6', textAlign: 'center' },
  cards: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', minWidth: '150px', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px' },
  cardLabel: { fontSize: '10px', color: '#95a5a6', marginBottom: '8px', letterSpacing: '1px' },
  cardNumber: { fontSize: '34px', fontWeight: '900', margin: '0 0 8px 0', color: '#2c3e50' },
  cardSub: { fontSize: '11px', color: '#95a5a6' },
  cardLabelWhite: { fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginBottom: '8px', letterSpacing: '1px' },
  cardNumberWhite: { fontSize: '34px', fontWeight: '900', margin: '0 0 8px 0', color: '#fff' },
  cardLinkWhite: { fontSize: '11px', color: 'rgba(255,255,255,0.85)', cursor: 'pointer' },
  middleSection: { display: 'flex', gap: '16px', marginBottom: '16px' },
  chartCard: { flex: 2, backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px' },
  alertCard: { flex: 1, backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  chartTitle: { fontSize: '13px', fontWeight: '800', margin: 0, color: '#2c3e50', letterSpacing: '0.5px' },
  chartSub: { fontSize: '10px', color: '#95a5a6' },
  emptyChart: { color: '#95a5a6', fontSize: '12px', textAlign: 'center', padding: '20px' },
  chartArea: { display: 'flex', flexDirection: 'column', gap: '14px' },
  barGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  barLabel: { fontSize: '11px', color: '#7f8c8d', width: '90px', flexShrink: 0 },
  barTrack: { flex: 1, backgroundColor: '#f0f0f0', height: '10px', borderRadius: '5px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '5px', transition: 'width 0.4s ease' },
  barValue: { fontSize: '11px', fontWeight: '700', width: '40px', textAlign: 'right', color: '#2c3e50' },
  allGood: { textAlign: 'center', padding: '30px 0' },
  allGoodIcon: { fontSize: '32px', color: '#27ae60', margin: 0 },
  allGoodText: { fontSize: '11px', color: '#27ae60', fontWeight: '700' },
  alertRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  alertName: { fontSize: '12px', fontWeight: '700', margin: 0, color: '#2c3e50' },
  alertSub: { fontSize: '10px', color: '#95a5a6', margin: 0 },
  alertRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  alertBadge: { textAlign: 'right' },
  alertQty: { fontSize: '18px', fontWeight: '900', color: '#c0392b' },
  alertLevel: { fontSize: '11px', color: '#95a5a6' },
  restockBtn: { backgroundColor: '#c0392b', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' },
  viewAllBtn: { backgroundColor: 'transparent', border: '1px solid #c0392b', color: '#c0392b', padding: '8px 12px', fontSize: '11px', cursor: 'pointer', width: '100%', marginTop: '12px', fontWeight: '700', borderRadius: '6px' },
  bottomSection: { display: 'flex', gap: '16px' },
  categoryCard: { flex: 1, backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px' },
  categoryRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f4f6f8' },
  categoryIcon: { fontSize: '20px' },
  categoryName: { flex: 1, fontSize: '12px', fontWeight: '700', color: '#2c3e50' },
  categoryCount: { fontSize: '11px', color: '#95a5a6' },
  quickCard: { flex: 1, backgroundColor: '#fff', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' },
  quickBtn: { backgroundColor: '#f4f6f8', border: 'none', padding: '12px 16px', fontSize: '12px', cursor: 'pointer', fontWeight: '700', textAlign: 'left', borderRadius: '8px', color: '#2c3e50' },
  systemCard: { flex: 1, backgroundColor: '#2c3e50', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '10px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #34495e' },
  infoLabel: { fontSize: '10px', color: '#95a5a6', letterSpacing: '1px' },
  infoValue: { fontSize: '11px', fontWeight: '700' },
};