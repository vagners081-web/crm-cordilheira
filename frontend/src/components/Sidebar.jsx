// components/Sidebar.jsx — Sidebar profissional com informações do usuário
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';

const NAV = [
  { id: 'dashboard', icon: '▦',  label: 'Dashboard'  },
  { id: 'clientes',  icon: '⊙',  label: 'Clientes'   },
  { id: 'lances',    icon: '◎',  label: 'Lances'     },
  { id: 'vendas',    icon: '◈',  label: 'Vendas'     },
];

const NAV_ADMIN = [
  { id: 'usuarios', icon: '◉', label: 'Usuários' },
];

export default function Sidebar({ active, onNavigate }) {
  const { user, signOut, isAdmin } = useAuth();
  const ini = initials(user?.nome || 'U');

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-mark">💼</div>
        <div className="brand-text">
          <div className="brand-name">CRM Pro</div>
          <div className="brand-tagline">v2.0 — Profissional</div>
        </div>
      </div>

      {/* Nav principal */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Principal</div>
        <nav className="nav-list">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item${active === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon" style={{ fontSize: 17, fontStyle:'normal' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Nav admin */}
      {isAdmin && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">Administração</div>
          <nav className="nav-list">
            {NAV_ADMIN.map(item => (
              <button
                key={item.id}
                className={`nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon" style={{ fontSize: 17 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <button
              className="nav-item"
              onClick={async () => {
                try {
                  const { downloadBackup } = await import('../services/api');
                  await downloadBackup();
                } catch (e) { alert('Erro no backup: ' + e.message); }
              }}
            >
              <span className="nav-icon" style={{ fontSize: 15 }}>↓</span>
              Backup DB
            </button>
          </nav>
        </div>
      )}

      {/* Perfil + logout */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{ini}</div>
          <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="sname">{user?.nome}</div>
            <div className="semail">{user?.email}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={signOut}
        >
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
