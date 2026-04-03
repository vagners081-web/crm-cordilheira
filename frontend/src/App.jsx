// App.jsx — Roteamento principal com guarda de autenticação
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar   from './components/Sidebar';
import Topbar    from './components/Topbar';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes  from './pages/Clientes';
import Vendas    from './pages/Vendas';
import Lances    from './pages/Lances';
import Usuarios  from './pages/Usuarios';

const PAGES = { dashboard: Dashboard, clientes: Clientes, vendas: Vendas, lances: Lances, usuarios: Usuarios };

function AppShell() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState('dashboard');

  const navigate = (p) => {
    if (p === 'usuarios' && !isAdmin) return;
    setPage(p);
  };

  const Page = PAGES[page] || Dashboard;

  return (
    <div className="app-root">
      <Sidebar active={page} onNavigate={navigate} />
      <div className="main-area">
        <Topbar page={page} />
        <div className="page-wrapper">
          <Page />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-root)' }}>
        <div className="loader">
          <div className="spin" />
          <span>Carregando…</span>
        </div>
      </div>
    );
  }

  return user ? <AppShell /> : <Login />;
}
