import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getMe } from '../services/api';

export const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { label: 'Inventory', path: '/dashboard' },
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'Activity', path: '/activity' },
  ];

  const sidebarItems = [
    { label: '⊞ OVERVIEW', path: '/dashboard' },
    { label: '☰ INVENTORY', path: '/products' },
    { label: '↺ MANIFESTS', path: '/activity' },
    { label: '⊡ CATEGORIES', path: '/categories' },
  ];

  const time = new Date().toLocaleTimeString();
  const isAdmin = user?.role === 'admin';

  return (
    <UserContext.Provider value={{ user, isAdmin }}>
      <div style={styles.container}>
        <div style={styles.navbar}>
          <h1 style={styles.logo}>CRATELINE</h1>
          <div style={styles.navCenter}>
            {navItems.map((item) => (
              <span
                key={item.path}
                style={location.pathname === item.path ? styles.navActive : styles.navLink}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div style={styles.navRight}>
            <span style={styles.systemStatus}>● OPTIMAL V4.2</span>
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.sidebar}>
            <div style={styles.sidebarTop}>
              <div style={styles.userCard}>
                <div style={styles.userAvatar}>
                  {user ? user.email.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p style={styles.userName}>{user?.email || 'Loading...'}</p>
                  <p style={styles.userRole}>{isAdmin ? '👑 Administrator' : '👤 Staff User'}</p>
                </div>
              </div>

              {isAdmin && <div style={styles.adminBadge}>✓ Admin Access</div>}

              <div style={styles.divider} />

              <p style={styles.sidebarLabel}>NAVIGATION</p>
              {sidebarItems.map((item) => (
                <div
                  key={item.path}
                  style={location.pathname === item.path ? styles.sidebarItemActive : styles.sidebarItem}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </div>
              ))}

              <div style={styles.divider} />

              <p style={styles.sidebarLabel}>SYSTEM</p>
              <div style={styles.statCard}>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>STATUS</span>
                  <span style={styles.statValueGreen}>● ONLINE</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>VERSION</span>
                  <span style={styles.statValue}>V4.2</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>TIME</span>
                  <span style={styles.statValue}>{time}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>ROLE</span>
                  <span style={{ ...styles.statValue, color: isAdmin ? '#c0392b' : '#27ae60' }}>
                    {user?.role?.toUpperCase() || '...'}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.sidebarBottom}>
              <button style={styles.logoutBtn} onClick={handleLogout}>⎋ LOGOUT</button>
            </div>
          </div>

          <div style={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

const styles = {
  container: { fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f4f6f8', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  navbar: { backgroundColor: '#fff', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', height: '56px', flexShrink: 0, boxSizing: 'border-box', zIndex: 100 },
  logo: { color: '#c0392b', fontSize: '20px', fontWeight: '900', margin: 0, letterSpacing: '1px', width: '180px' },
  navCenter: { display: 'flex', gap: '28px', alignItems: 'center' },
  navActive: { fontWeight: '700', borderBottom: '2px solid #c0392b', paddingBottom: '4px', cursor: 'pointer', color: '#2c3e50', fontSize: '14px' },
  navLink: { color: '#7f8c8d', cursor: 'pointer', fontSize: '14px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px', width: '180px', justifyContent: 'flex-end' },
  systemStatus: { fontSize: '11px', color: '#c0392b', fontWeight: '600' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '280px', backgroundColor: '#fff', height: '100%', borderRight: '1px solid #e0e0e0', flexShrink: 0, display: 'flex', flexDirection: 'column' },
  sidebarTop: { flex: 1, overflowY: 'auto', padding: '20px 0' },
  userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 12px 20px' },
  userAvatar: { width: '40px', height: '40px', backgroundColor: '#c0392b', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', flexShrink: 0 },
  userName: { fontSize: '12px', fontWeight: '700', color: '#2c3e50', margin: 0 },
  userRole: { fontSize: '11px', color: '#95a5a6', margin: 0 },
  adminBadge: { margin: '0 20px 8px 20px', backgroundColor: '#fdf0f0', color: '#c0392b', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: '1px solid #f5c6c6' },
  divider: { borderTop: '1px solid #e0e0e0', margin: '12px 0' },
  sidebarLabel: { fontSize: '10px', color: '#95a5a6', padding: '0 20px', marginBottom: '8px', letterSpacing: '1.5px', fontWeight: '700' },
  sidebarItemActive: { backgroundColor: '#c0392b', color: '#fff', padding: '12px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', borderRadius: '0 8px 8px 0', marginRight: '12px', marginBottom: '4px' },
  sidebarItem: { padding: '12px 20px', fontSize: '13px', color: '#555', cursor: 'pointer', borderRadius: '0 8px 8px 0', marginRight: '12px', marginBottom: '4px' },
  statCard: { margin: '0 12px', backgroundColor: '#f4f6f8', borderRadius: '10px', padding: '12px' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e0e0e0' },
  statLabel: { fontSize: '10px', color: '#95a5a6', letterSpacing: '1px' },
  statValue: { fontSize: '11px', fontWeight: '700', color: '#2c3e50' },
  statValueGreen: { fontSize: '11px', fontWeight: '700', color: '#27ae60' },
  sidebarBottom: { padding: '16px', borderTop: '1px solid #e0e0e0', flexShrink: 0 },
  logoutBtn: { width: '100%', backgroundColor: '#f4f6f8', color: '#c0392b', border: '1px solid #e0e0e0', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', borderRadius: '8px', textAlign: 'left' },
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
};