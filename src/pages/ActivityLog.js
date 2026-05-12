import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, getStockLogs, updateStock } from '../services/api';

export default function ActivityLog() {
  const [products, setProducts] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedPid, setSelectedPid] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('IN');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  useEffect(() => {
    getProducts()
  .then((res) => {
    setProducts(res.data.data);
        const params = new URLSearchParams(location.search);
        const pid = params.get('pid');
        if (pid) setSelectedPid(parseInt(pid));
      })
      .catch(() => setError('Failed to load products.'));
  }, [location]);

  useEffect(() => {
    if (selectedPid) {
      getStockLogs(selectedPid)
        .then((res) => { setAllLogs(res.data); setLogs(res.data); })
        .catch(() => { setAllLogs([]); setLogs([]); });
    }
  }, [selectedPid]);

  useEffect(() => {
    if (search.trim() === '') {
      setLogs(allLogs);
    } else {
      setLogs(allLogs.filter((log) => {
        const product = products.find((p) => p.pid === log.pid);
        const productName = product?.name?.toLowerCase() || '';
        return productName.includes(search.toLowerCase()) || log.type.toLowerCase().includes(search.toLowerCase());
      }));
    }
  }, [search, allLogs, products]);

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPid || !amount) {
      setError('Please select a product and enter an amount.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await updateStock(selectedPid, parseInt(amount), type);
      setSuccess(`Stock ${type} of ${amount} units recorded!`);
      setAmount('');
      const res = await getStockLogs(selectedPid);
      setAllLogs(res.data);
      setLogs(res.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update stock.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) { setError('No transactions to export.'); setTimeout(() => setError(''), 3000); return; }
    const headers = ['TXN ID', 'Product SKU', 'Product Name', 'Type', 'Quantity', 'Timestamp'];
    const rows = logs.map((log) => {
      const product = products.find((p) => p.pid === log.pid);
      return [`TXN-${String(log.log_id).padStart(3, '0')}-${String(log.pid).padStart(2, '0')}`, `CR-${String(log.pid).padStart(5, '0')}`, product?.name || 'Unknown', log.type, log.change_amount, new Date(log.created_at).toLocaleString()];
    });
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crateline_activity_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.body}>
      <div style={styles.sidebar}>
        <p style={styles.sidebarTitle}>SEARCH LOGS</p>
        <input style={styles.input} placeholder="Search by name or type..." value={search} onChange={(e) => setSearch(e.target.value)} />

        <p style={styles.sidebarTitle}>SELECT PRODUCT</p>
        <select style={styles.select} value={selectedPid} onChange={(e) => setSelectedPid(e.target.value)}>
          <option value="">-- Select product --</option>
          {products.map((p) => (
            <option key={p.pid} value={p.pid}>CR-{String(p.pid).padStart(5, '0')} {p.name}</option>
          ))}
        </select>

        <p style={styles.sidebarTitle}>TRANSACTION TYPE</p>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}><input type="radio" name="type" value="IN" checked={type === 'IN'} onChange={() => setType('IN')} /><span style={styles.radioText}>Inbound (Stock In)</span></label>
          <label style={styles.radioLabel}><input type="radio" name="type" value="OUT" checked={type === 'OUT'} onChange={() => setType('OUT')} /><span style={styles.radioText}>Outbound (Stock Out)</span></label>
        </div>

        <p style={styles.sidebarTitle}>AMOUNT</p>
        <input style={styles.input} type="number" placeholder="Enter amount..." value={amount} onChange={(e) => setAmount(e.target.value)} />

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button style={styles.applyBtn} onClick={handleStockUpdate}>APPLY TRANSACTION</button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.heading}>ACTIVITY LOG</h2>
        <p style={styles.subheading}>System Status: Nominal // Version 4.2</p>

        <div style={styles.tableActions}>
          <button style={styles.exportBtn} onClick={handleExportCSV}>⬇ EXPORT CSV</button>
          {logs.length > 0 && <span style={styles.logCount}>{logs.length} transaction{logs.length !== 1 ? 's' : ''}</span>}
        </div>

        <div style={styles.tableWrapper}>
          <div style={styles.tableHeader}>
            <span style={styles.th}>STATUS</span>
            <span style={styles.th}>TIMESTAMP / TXN ID</span>
            <span style={styles.th}>PRODUCT</span>
            <span style={styles.th}>QUANTITY</span>
            <span style={styles.th}>TYPE</span>
          </div>
          {logs.length === 0 ? (
            <div style={styles.emptyState}>{selectedPid ? 'No transactions found.' : 'Select a product to view its activity log.'}</div>
          ) : (
            logs.map((log) => (
              <div key={log.log_id} style={styles.logRow}>
                <span><span style={log.type === 'IN' ? styles.dotGreen : styles.dotRed}>●</span></span>
                <span style={styles.td}>
                  <div style={styles.tdMain}>{new Date(log.created_at).toLocaleTimeString()}</div>
                  <div style={styles.tdSub}>TXN-{String(log.log_id).padStart(3, '0')}-{String(log.pid).padStart(2, '0')}</div>
                </span>
                <span style={styles.td}>
                  <div style={styles.tdMain}>CR-{String(log.pid).padStart(5, '0')}</div>
                  <div style={styles.tdSub}>{products.find((p) => p.pid === log.pid)?.name || 'Unknown'}</div>
                </span>
                <span style={{ ...styles.td, color: log.type === 'IN' ? '#27ae60' : '#c0392b', fontWeight: '800', fontSize: '18px' }}>
                  {log.type === 'IN' ? '+' : '-'}{log.change_amount}
                  <div style={styles.tdSub}>units</div>
                </span>
                <span style={styles.td}>
                  <span style={log.type === 'IN' ? styles.badgeIn : styles.badgeOut}>{log.type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '260px', backgroundColor: '#fff', height: '100%', borderRight: '1px solid #e0e0e0', flexShrink: 0, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  sidebarTitle: { fontSize: '10px', fontWeight: '700', color: '#95a5a6', letterSpacing: '1.5px', margin: '10px 0 4px 0' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', fontSize: '13px', backgroundColor: '#f4f6f8', boxSizing: 'border-box', borderRadius: '8px', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', fontSize: '13px', backgroundColor: '#f4f6f8', borderRadius: '8px', outline: 'none' },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  radioText: { fontSize: '13px', color: '#2c3e50' },
  applyBtn: { backgroundColor: '#2c3e50', color: '#fff', padding: '11px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '8px', borderRadius: '8px', width: '100%' },
  error: { color: '#c0392b', fontSize: '11px' },
  success: { color: '#27ae60', fontSize: '11px' },
  main: { flex: 1, padding: '28px', overflowY: 'auto' },
  heading: { fontSize: '32px', fontWeight: '900', margin: 0, color: '#2c3e50' },
  subheading: { fontSize: '12px', color: '#95a5a6', marginBottom: '20px' },
  tableActions: { display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' },
  exportBtn: { padding: '8px 16px', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', color: '#2c3e50', fontWeight: '600' },
  logCount: { fontSize: '12px', color: '#95a5a6', marginLeft: '8px' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px 120px', backgroundColor: '#2c3e50', color: '#fff', padding: '12px 20px', fontSize: '11px', letterSpacing: '1px', gap: '10px' },
  th: { fontWeight: '700' },
  logRow: { display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px 120px', padding: '14px 20px', borderBottom: '1px solid #f4f6f8', alignItems: 'center', gap: '10px', backgroundColor: '#fff' },
  td: { fontSize: '13px', color: '#2c3e50' },
  tdMain: { fontWeight: '600', fontSize: '13px' },
  tdSub: { fontSize: '10px', color: '#95a5a6', marginTop: '2px', fontWeight: '400' },
  dotGreen: { color: '#27ae60', fontSize: '18px' },
  dotRed: { color: '#c0392b', fontSize: '18px' },
  badgeIn: { backgroundColor: '#eafaf1', color: '#27ae60', padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '20px' },
  badgeOut: { backgroundColor: '#fdf0f0', color: '#c0392b', padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '20px' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#95a5a6', fontSize: '13px' },
};