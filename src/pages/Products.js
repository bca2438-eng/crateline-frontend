import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, createProduct, deleteProduct, getCategories } from '../services/api';
import { useUser } from '../components/Layout';
import axios from 'axios';

export default function Products() {
  const { isAdmin } = useUser() || { isAdmin: false };
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ name: '', price: '', quantity: '', category_id: '', reorder_level: 5 });
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const LIMIT = 10;

  const fetchProducts = useCallback(async () => {
    try {
      const params = { page: currentPage, limit: LIMIT };
      if (search) params.search = search;
      if (filterLowStock) params.low_stock = true;
      if (filterCategory) params.category_id = parseInt(filterCategory);
      const res = await getProducts(params);
      setProducts(res.data.data);
      setTotalProducts(res.data.total);
      setTotalPages(res.data.pages);
    } catch {
      setError('Failed to load products.');
    }
  }, [currentPage, search, filterLowStock, filterCategory]);

  useEffect(() => {
    fetchCategories();
    if (location.search.includes('lowstock=true')) setFilterLowStock(true);
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const token = localStorage.getItem('token');
        await axios.put(`https://crateline-api-production.up.railway.app/products/${editingProduct.pid}`, {
          name: form.name, price: parseFloat(form.price), quantity: parseInt(form.quantity),
          category_id: parseInt(form.category_id), reorder_level: parseInt(form.reorder_level),
        }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Product updated successfully!');
        setEditingProduct(null);
      } else {
        await createProduct({
          name: form.name, price: parseFloat(form.price), quantity: parseInt(form.quantity),
          category_id: parseInt(form.category_id), reorder_level: parseInt(form.reorder_level),
        });
        setSuccess('Product created successfully!');
      }
      setForm({ name: '', price: '', quantity: '', category_id: '', reorder_level: 5 });
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, price: product.price, quantity: product.quantity,
      category_id: product.category_id, reorder_level: product.reorder_level,
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setForm({ name: '', price: '', quantity: '', category_id: '', reorder_level: 5 });
  };

  const handleDelete = async (pid) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteProduct(pid);
      setSuccess('Product deleted!');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      const allProducts = res.data.data;
      const headers = ['SKU Serial', 'Product Name', 'Unit Price', 'Quantity', 'Reorder Level', 'Category', 'Status'];
      const rows = allProducts.map((p) => {
        const cat = categories.find((c) => c.cid === p.category_id);
        return [
          `CR-${String(p.pid).padStart(5, '0')}`, p.name,
          `$${parseFloat(p.price).toFixed(2)}`, p.quantity, p.reorder_level,
          cat ? cat.name : 'Unknown',
          p.quantity < p.reorder_level ? 'LOW STOCK' : 'IN STOCK',
        ];
      });
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crateline_inventory_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export CSV.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getCategoryName = (cid) => categories.find((c) => c.cid === cid)?.name || '—';
  const totalInventoryValue = products.reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0);

  return (
    <div style={styles.body}>
      {isAdmin && (
        <div style={styles.sidebar}>
          <p style={styles.sidebarTitle}>{editingProduct ? 'EDIT UNIT' : 'UNIT INTAKE'}</p>
          <p style={styles.sidebarSub}>{editingProduct ? `Editing: ${editingProduct.name}` : 'Add new asset to global manifest'}</p>
          <form onSubmit={handleCreate} style={styles.form}>
            <label style={styles.label}>PRODUCT NAME</label>
            <input style={styles.input} placeholder="E.g. Organic Harvest Wheat" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label style={styles.label}>UNIT PRICE</label>
            <input style={styles.input} type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <label style={styles.label}>QUANTITY</label>
            <input style={styles.input} type="number" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <label style={styles.label}>CATEGORY</label>
            <select style={styles.input} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.cid} value={c.cid}>{c.name}</option>)}
            </select>
            <label style={styles.label}>REORDER LEVEL</label>
            <input style={styles.input} type="number" placeholder="5" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <button type="submit" style={styles.button}>{editingProduct ? '✔ UPDATE PRODUCT' : '+ COMMIT TO DATABASE'}</button>
            {editingProduct && <button type="button" style={styles.cancelBtn} onClick={handleCancelEdit}>CANCEL EDIT</button>}
          </form>
        </div>
      )}

      <div style={styles.main}>
        <div style={styles.mainHeader}>
          <div>
            <h2 style={styles.heading}>GLOBAL INVENTORY</h2>
            <p style={styles.subheading}>System Real-Time SKU Verification Active</p>
          </div>
          <input
            style={styles.searchBar}
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {!isAdmin && <div style={styles.viewOnlyBanner}>👁 View Only Mode — Contact an administrator to make changes</div>}

        <div style={styles.filterBar}>
          <select style={styles.categoryFilter} value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.cid} value={c.cid}>{c.name}</option>)}
          </select>
          <button style={filterLowStock ? styles.filterActiveBtn : styles.filterBtn}
            onClick={() => { setFilterLowStock(!filterLowStock); setCurrentPage(1); }}>
            {filterLowStock ? '⚠ LOW STOCK ONLY' : 'ALL PRODUCTS'}
          </button>
          {(filterLowStock || filterCategory || search) && (
            <button style={styles.clearBtn} onClick={() => { setSearch(''); setFilterLowStock(false); setFilterCategory(''); setCurrentPage(1); }}>✕ CLEAR FILTERS</button>
          )}
          <div style={styles.resultCount}>{totalProducts} products — Page {currentPage} of {totalPages}</div>
          <button style={styles.exportBtn} onClick={handleExportCSV}>⬇ EXPORT CSV</button>
          {isAdmin && <button style={styles.categoriesBtn} onClick={() => navigate('/categories')}>CATEGORIES</button>}
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>SKU SERIAL</th>
                <th style={styles.th}>PRODUCT NAME</th>
                <th style={styles.th}>CATEGORY</th>
                <th style={styles.th}>UNIT VALUE</th>
                <th style={styles.th}>STOCK COUNT</th>
                <th style={styles.th}>STATUS</th>
                {isAdmin && <th style={styles.th}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} style={styles.emptyRow}>No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.pid} style={editingProduct?.pid === p.pid ? styles.tableRowEditing : styles.tableRow}>
                    <td style={styles.td}>CR-{String(p.pid).padStart(5, '0')}</td>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}><span style={styles.categoryBadge}>{getCategoryName(p.category_id)}</span></td>
                    <td style={styles.td}>${parseFloat(p.price).toFixed(2)}</td>
                    <td style={styles.td}>{p.quantity}</td>
                    <td style={styles.td}>
                      <span style={p.quantity < p.reorder_level ? styles.badgeLow : styles.badgeIn}>
                        {p.quantity < p.reorder_level ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => handleEdit(p)}>EDIT</button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(p.pid)}>DELETE</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button style={styles.pageBtn} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
            <button style={styles.pageBtn} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} style={page === currentPage ? styles.pageBtnActive : styles.pageBtn} onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}
            <button style={styles.pageBtn} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>›</button>
            <button style={styles.pageBtn} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        )}

        <div style={styles.summaryBar}>
          <div style={styles.summaryCard}><p style={styles.summaryNum}>{totalProducts}</p><p style={styles.summaryLabel}>TOTAL SKU COUNT</p></div>
          <div style={{ ...styles.summaryCard, backgroundColor: '#2c3e50' }}>
            <p style={{ ...styles.summaryNum, color: '#fff' }}>${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p style={{ ...styles.summaryLabel, color: 'rgba(255,255,255,0.7)' }}>PAGE VALUE</p>
          </div>
          <div style={styles.summaryCard}>
            <p style={{ ...styles.summaryNum, color: '#c0392b' }}>{products.filter((p) => p.quantity < p.reorder_level).length}</p>
            <p style={styles.summaryLabel}>CRITICAL ALERTS</p>
          </div>
          <div style={{ ...styles.summaryCard, backgroundColor: '#c0392b' }}>
            <p style={{ ...styles.summaryNum, color: '#fff' }}>99.2%</p>
            <p style={{ ...styles.summaryLabel, color: 'rgba(255,255,255,0.7)' }}>FULFILMENT RATE</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '260px', backgroundColor: '#fff', height: '100%', padding: '24px 16px', borderRight: '1px solid #e0e0e0', flexShrink: 0, overflowY: 'auto' },
  sidebarTitle: { fontSize: '13px', fontWeight: '800', marginBottom: '4px', color: '#2c3e50' },
  sidebarSub: { fontSize: '11px', color: '#95a5a6', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '10px', fontWeight: '700', color: '#7f8c8d', letterSpacing: '1px' },
  input: { padding: '9px 12px', border: '1px solid #e0e0e0', fontSize: '13px', backgroundColor: '#f4f6f8', borderRadius: '8px', outline: 'none' },
  error: { color: '#c0392b', fontSize: '11px' },
  success: { color: '#27ae60', fontSize: '11px' },
  button: { backgroundColor: '#c0392b', color: '#fff', padding: '10px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '8px', borderRadius: '8px' },
  cancelBtn: { backgroundColor: '#95a5a6', color: '#fff', padding: '10px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '4px', borderRadius: '8px' },
  main: { flex: 1, padding: '28px', overflowY: 'auto' },
  mainHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  heading: { fontSize: '28px', fontWeight: '900', margin: 0, color: '#2c3e50' },
  subheading: { fontSize: '12px', color: '#95a5a6', margin: '4px 0 0 0' },
  searchBar: { padding: '9px 14px', border: '1px solid #e0e0e0', fontSize: '13px', backgroundColor: '#fff', borderRadius: '8px', outline: 'none', width: '220px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  viewOnlyBanner: { backgroundColor: '#fff9e6', border: '1px solid #f0d080', color: '#8a6d00', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' },
  filterBar: { display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' },
  categoryFilter: { padding: '8px 12px', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '13px', borderRadius: '8px', outline: 'none', color: '#2c3e50', cursor: 'pointer' },
  filterActiveBtn: { padding: '8px 16px', border: '1px solid #c0392b', backgroundColor: '#fdf0f0', fontSize: '12px', cursor: 'pointer', color: '#c0392b', fontWeight: '700', borderRadius: '8px' },
  filterBtn: { padding: '8px 16px', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', color: '#2c3e50', fontWeight: '600' },
  clearBtn: { padding: '8px 16px', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', color: '#7f8c8d', fontWeight: '600' },
  resultCount: { fontSize: '12px', color: '#95a5a6', marginLeft: '4px', flex: 1 },
  exportBtn: { padding: '8px 16px', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', color: '#2c3e50', fontWeight: '600' },
  categoriesBtn: { padding: '8px 16px', backgroundColor: '#c0392b', color: '#fff', border: 'none', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', fontWeight: '600' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1px', fontWeight: '700' },
  tableRow: { borderBottom: '1px solid #f4f6f8' },
  tableRowEditing: { borderBottom: '1px solid #f4f6f8', backgroundColor: '#fef9e7' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#2c3e50' },
  emptyRow: { padding: '40px', textAlign: 'center', color: '#95a5a6', fontSize: '13px' },
  categoryBadge: { backgroundColor: '#f4f6f8', color: '#7f8c8d', padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '20px' },
  badgeIn: { backgroundColor: '#eafaf1', color: '#27ae60', padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '20px' },
  badgeLow: { backgroundColor: '#fdf0f0', color: '#c0392b', padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '20px' },
  editBtn: { backgroundColor: '#2c3e50', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', marginRight: '6px', borderRadius: '6px', fontWeight: '600' },
  deleteBtn: { backgroundColor: 'transparent', border: '1px solid #e0e0e0', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', color: '#c0392b', borderRadius: '6px', fontWeight: '600' },
  pagination: { display: 'flex', gap: '6px', marginBottom: '16px', alignItems: 'center' },
  pageBtn: { padding: '6px 12px', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer', borderRadius: '6px', color: '#2c3e50' },
  pageBtnActive: { padding: '6px 12px', border: '1px solid #c0392b', backgroundColor: '#c0392b', fontSize: '13px', cursor: 'pointer', borderRadius: '6px', color: '#fff', fontWeight: '700' },
  summaryBar: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  summaryCard: { flex: 1, backgroundColor: '#fff', padding: '16px 20px', minWidth: '120px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  summaryNum: { fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0', color: '#2c3e50' },
  summaryLabel: { fontSize: '10px', color: '#95a5a6', margin: 0, letterSpacing: '1px' },
};
