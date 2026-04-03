// pages/Usuarios.jsx — Gestão de usuários (somente admin)
import { useState, useEffect, useCallback } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import { fDateTime, initials } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const BLANK = { nome: '', email: '', senha: '', tipo: 'usuario', ativo: true };

function UsuarioModal({ usuario, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(
    usuario
      ? { nome: usuario.nome, email: usuario.email, senha: '', tipo: usuario.tipo, ativo: !!usuario.ativo }
      : { ...BLANK }
  );
  const [saving, setSaving] = useState(false);

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const updBool = k => e => setForm(f => ({ ...f, [k]: e.target.value === 'true' }));

  async function submit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) {
      toast('Nome e email são obrigatórios', 'err'); return;
    }
    if (!usuario && form.senha.length < 6) {
      toast('Senha deve ter ao menos 6 caracteres', 'err'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.senha) delete payload.senha; // não enviar senha vazia na edição
      if (usuario) { await updateUsuario(usuario.id, payload); toast('Usuário atualizado!'); }
      else         { await createUsuario(payload);             toast('Usuário criado!'); }
      onSaved();
    } catch (err) { toast(err.message, 'err'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <div className="modal-headline"><span>◉</span> {usuario ? 'Editar Usuário' : 'Novo Usuário'}</div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="fg x2">
                <label>Nome completo *</label>
                <input value={form.nome} onChange={upd('nome')} placeholder="Nome do usuário" required />
              </div>
              <div className="fg x2">
                <label>E-mail *</label>
                <input type="email" value={form.email} onChange={upd('email')} placeholder="email@empresa.com" required />
              </div>
              <div className="fg x2">
                <label>{usuario ? 'Nova senha (deixe em branco para não alterar)' : 'Senha *'}</label>
                <input type="password" value={form.senha} onChange={upd('senha')}
                  placeholder={usuario ? '••••••' : 'Mínimo 6 caracteres'}
                  minLength={usuario ? 0 : 6} />
              </div>
              <div className="fg">
                <label>Tipo de acesso</label>
                <select value={form.tipo} onChange={upd('tipo')}>
                  <option value="usuario">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="fg">
                <label>Status</label>
                <select value={String(form.ativo)} onChange={updBool('ativo')}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            {form.tipo === 'admin' && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--yellow-bg)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(245,166,35,.2)', fontSize: 12.5, color: 'var(--yellow)' }}>
                ⚠️ Administradores têm acesso total ao sistema, incluindo dados de todos os usuários.
              </div>
            )}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spin" style={{width:14,height:14,borderWidth:2}}/> Salvando…</> : usuario ? '💾 Atualizar' : '✅ Criar usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Usuarios() {
  const toast   = useToast();
  const { user: me } = useAuth();
  const [list,     setList]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [modal,    setModal]   = useState(null);
  const [deleting, setDeleting]= useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getUsuarios()); }
    catch (err) { toast(err.message, 'err'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (id === me?.id) { toast('Você não pode excluir sua própria conta', 'warn'); return; }
    if (!window.confirm('Confirma a exclusão deste usuário?')) return;
    setDeleting(id);
    try { await deleteUsuario(id); toast('Usuário removido'); load(); }
    catch (err) { toast(err.message, 'err'); }
    finally { setDeleting(null); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">◉ Usuários</div>
          <div className="page-subtitle">{list.length} usuário(s) no sistema</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>＋ Novo Usuário</button>
      </div>

      {/* Aviso */}
      <div style={{ padding: '12px 16px', background: 'var(--accent-pale)', border: '1px solid rgba(59,126,255,.2)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text-200)', marginBottom: 20 }}>
        💡 <strong>Regras de acesso:</strong> Usuários comuns veem apenas seus próprios dados. Administradores têm visibilidade total.
      </div>

      <div className="card">
        {loading ? (
          <div className="loader"><div className="spin" /> Carregando…</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👤</div>
            <div className="empty-title">Nenhum usuário</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Último login</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map(u => (
                  <tr key={u.id} style={u.id === me?.id ? { background: 'var(--accent-pale)' } : {}}>
                    <td>
                      <div className="gap-row">
                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                          {initials(u.nome)}
                        </div>
                        <div>
                          <div className="fw-600">{u.nome}</div>
                          {u.id === me?.id && <div style={{ fontSize: 10, color: 'var(--accent)' }}>você</div>}
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">{u.email}</td>
                    <td>
                      <span className={`badge user-type-badge ${u.tipo}`}>
                        {u.tipo === 'admin' ? '⭐ Admin' : '👤 Usuário'}
                      </span>
                    </td>
                    <td>
                      {u.ativo
                        ? <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><span className="badge-dot" /> Ativo</span>
                        : <span className="badge" style={{ background: 'var(--red-bg)',   color: 'var(--red)'   }}><span className="badge-dot" /> Inativo</span>
                      }
                    </td>
                    <td className="td-muted">{fDateTime(u.ultimo_login) || 'Nunca'}</td>
                    <td className="td-muted">{fDateTime(u.criado_em)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs btn-icon" onClick={() => setModal(u)}>✏️</button>
                        <button
                          className="btn btn-danger btn-xs btn-icon"
                          disabled={deleting === u.id || u.id === me?.id}
                          title={u.id === me?.id ? 'Não é possível excluir sua conta' : 'Excluir'}
                          onClick={() => handleDelete(u.id)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <UsuarioModal
          usuario={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
