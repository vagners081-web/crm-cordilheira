// pages/Login.jsx — Tela de autenticação
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { login } from '../services/api';

export default function Login() {
  const { signIn }  = useAuth();
  const toast       = useToast();
  const [form, set] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.senha) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email: form.email.trim(), senha: form.senha });
      signIn(data.token, data.user);
      toast(`Bem-vindo, ${data.user.nome}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg" />
      <div className="login-grid-pattern" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">💼</div>
          <div className="login-logo-text">
            <div className="lt">CRM Pro</div>
            <div className="ls">Consórcios & Imóveis</div>
          </div>
        </div>

        <div className="login-title">Acesse sua conta</div>
        <div className="login-sub">Digite suas credenciais para continuar</div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="login-label">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => set(f => ({ ...f, email: e.target.value }))}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="login-label">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={e => set(f => ({ ...f, senha: e.target.value }))}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, justifyContent: 'center' }}>
            {loading
              ? <><div className="spin" style={{ width: 15, height: 15, borderWidth: 2 }} /> Entrando…</>
              : '→ Entrar no sistema'
            }
          </button>
        </form>

        <div className="login-footer">
          Problemas de acesso? Contate o administrador.
        </div>
      </div>
    </div>
  );
}
