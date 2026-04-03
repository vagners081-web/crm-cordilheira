// services/api.js — Camada de comunicação com o backend + JWT
const BASE = process.env.REACT_APP_API_URL || 'https://crm-cordilheira-1.onrender.com/api';

// ─── Helpers internos ─────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('crm_token');
}

async function request(path, opts = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  // Download de arquivo (Excel / backup)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/vnd') || contentType.includes('application/octet-stream')) {
    if (!res.ok) throw new Error('Falha no download');
    return res.blob();
  }

  const data = await res.json().catch(() => ({ error: 'Resposta inválida do servidor' }));
  if (!res.ok) {
    // Token expirado → força logout
    if (res.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/';
    }
    throw new Error(data.error || 'Erro na requisição');
  }
  return data;
}

// ─── Download helper ──────────────────────────────────────────────────────────
export async function downloadExport(path, filename) {
  const blob = await request(path);
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login        = (body) => request('/auth/login',  { method: 'POST', body: JSON.stringify(body) });
export const getMe        = ()     => request('/auth/me');
export const alterarSenha = (body) => request('/auth/senha',  { method: 'PUT',  body: JSON.stringify(body) });

// ─── Usuários (admin) ─────────────────────────────────────────────────────────
export const getUsuarios    = ()         => request('/auth/usuarios');
export const createUsuario  = (body)     => request('/auth/usuarios',     { method: 'POST',   body: JSON.stringify(body) });
export const updateUsuario  = (id, body) => request(`/auth/usuarios/${id}`, { method: 'PUT',  body: JSON.stringify(body) });
export const deleteUsuario  = (id)       => request(`/auth/usuarios/${id}`, { method: 'DELETE' });

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = () => request('/dashboard');

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const getClientes   = (q = '') => request(`/clientes${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const createCliente = (body)   => request('/clientes',       { method: 'POST',   body: JSON.stringify(body) });
export const updateCliente = (id, b)  => request(`/clientes/${id}`, { method: 'PUT',    body: JSON.stringify(b) });
export const deleteCliente = (id)     => request(`/clientes/${id}`, { method: 'DELETE' });
export const exportClientes = () => downloadExport('/clientes/export',
  `clientes_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.xlsx`);

// ─── Vendas ───────────────────────────────────────────────────────────────────
export const getVendas   = ()         => request('/vendas');
export const createVenda = (body)     => request('/vendas',         { method: 'POST',   body: JSON.stringify(body) });
export const updateVenda = (id, body) => request(`/vendas/${id}`,   { method: 'PUT',    body: JSON.stringify(body) });
export const deleteVenda = (id)       => request(`/vendas/${id}`,   { method: 'DELETE' });
export const exportVendas = () => downloadExport('/vendas/export',
  `vendas_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.xlsx`);

// ─── Lances ───────────────────────────────────────────────────────────────────
export const getLances   = ()         => request('/lances');
export const createLance = (body)     => request('/lances',         { method: 'POST',   body: JSON.stringify(body) });
export const updateLance = (id, body) => request(`/lances/${id}`,   { method: 'PUT',    body: JSON.stringify(body) });
export const deleteLance = (id)       => request(`/lances/${id}`,   { method: 'DELETE' });
export const exportLances = () => downloadExport('/lances/export',
  `lances_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.xlsx`);

// ─── Backup ───────────────────────────────────────────────────────────────────
export const downloadBackup = () => downloadExport('/backup',
  `backup_crm_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.db`);
