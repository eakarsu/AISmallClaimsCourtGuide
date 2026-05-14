import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const styles = {
  nav: { background: '#1a365d', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  brand: { fontWeight: 700, fontSize: 18, color: 'white', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: 20, alignItems: 'center' },
  navLink: { color: '#a0aec0', textDecoration: 'none', fontSize: 14 },
  btn: { background: '#e53e3e', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brand}>⚖️ AI Small Claims Guide</Link>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>My Cases</Link>
          <Link to="/cases/new" style={styles.navLink}>New Case</Link>
          <span style={{ color: '#a0aec0', fontSize: 13 }}>{user.name}</span>
          <button onClick={logout} style={styles.btn}>Logout</button>
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
}
