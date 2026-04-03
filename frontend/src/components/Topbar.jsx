// components/Topbar.jsx — Barra superior com info do usuário e ações
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { alterarSenha } from '../services/api';
import { initials } from '../utils/format';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  clientes:  'Clientes',
  lances:    'Lances',
  vendas:    'Vendas',
  usuarios:  'Usuários',
};

function SenhaModal({ onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ senha_atual: '', nova_senha: '', confirma: '' });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (form.nova_senha !== form.confirma) { toast('As senhas não coincidem', 'err'); return; }
    if (form.nova_senha.length < 6)        { toast('Nova senha deve ter ao menos 6 caracteres', 'err'); return; }
    setSaving(true);
    try {
      await alterarSenha({ senha_atual: form.senha_atual, nova_senha: form.nova_senha });
      toast('Senha alterada com sucesso!');
      onClose();
    } catch (err) { toast(err.message, 'err'); }
    finally { setSaving(false); }
  }

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div className="modal-headline">🔐 Alterar Senha</div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="gap-col">
              <div className="fg">
                <label>Senha atual</label>
                <input type="password" value={form.senha_atual} onChange={upd('senha_atual')} placeholder="Senha atual" required />
              </div>
              <div className="fg">
                <label>Nova senha</label>
                <input type="password" value={form.nova_senha} onChange={upd('nova_senha')} placeholder="Mínimo 6 caracteres" required />
              </div>
              <div className="fg">
                <label>Confirmar nova senha</label>
                <input type="password" value={form.confirma} onChange={upd('confirma')} placeholder="Repita a nova senha" required />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spin" style={{width:14,height:14,borderWidth:2}}/> Salvando…</> : '🔐 Alterar senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Topbar({ page }) {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const ini = initials(user?.nome || '?');

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span style={{ color: 'var(--text-400)', fontSize: 13 }}>CRM Pro</span>
          <span style={{ color: 'var(--text-400)' }}>/</span>
          <span className="topbar-title">{PAGE_TITLES[page] || page}</span>
        </div>

        <div className="topbar-right">
          {/* User pill com dropdown */}
          <div style={{ position: 'relative' }}>
            <div className="user-pill" onClick={() => setShowMenu(m => !m)}>
              <div className="user-avatar">{ini}</div>
              <span className="user-pill-name">{user?.nome}</span>
              <span className="user-pill-badge">{user?.tipo}</span>
              <span style={{ fontSize: 10, color: 'var(--text-300)', marginLeft: 2 }}>▾</span>
            </div>

            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowMenu(false)} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
                  borderRadius: 'var(--r-md)', minWidth: 180, zIndex: 50,
                  boxShadow: 'var(--shadow-md)',
                  animation: 'toastIn .15s ease',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-100)' }}>{user?.nome}</div>
                    <div style={{ color: 'var(--text-300)', fontSize: 11 }}>{user?.email}</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, border: 'none', padding: '10px 14px' }}
                    onClick={() => { setShowMenu(false); setShowSenha(true); }}
                  >
                    🔐 Alterar senha
                  </button>
                  <div style={{ borderTop: '1px solid var(--border)' }} />
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, border: 'none', padding: '10px 14px', color: 'var(--red)' }}
                    onClick={() => { setShowMenu(false); signOut(); }}
                  >
                    → Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {showSenha && <SenhaModal onClose={() => setShowSenha(false)} />}
    </>
  );
}
