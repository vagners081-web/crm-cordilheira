// services/api.js — Camada de comunicação com o backend + JWT

// 🔥 URL FIXA DO BACKEND (Render)
const BASE = 'https://crm-cordilheira-1.onrender.com';

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

  const contentType = res.headers.get('content-type') || '';

  // Download de arquivos
  if (
    contentType.includes('application/vnd') ||
    contentType.includes('application/octet-stream')
  ) {
    if (!res.ok) throw new Error('Falha no download');
    return res.blob();
  }

  const data = await res.json().catch(() => ({
    error: 'Resposta inválida do servidor',
  }));

  if (!res.ok) {
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
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// 🔥 IMPORTANTE: seu backend usa /login (não /auth/login)
export const login = (body) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

// MOCK para não quebrar frontend
export const getMe = async () => ({
  nome: 'Administrador',
  email: 'admin@admin.com',
});

export const alterarSenha = async () => ({
  sucesso: true,
});

// ─── Usuários (placeholder пока backend não tem) ──────────────────────────────
export const getUsuarios = async () => [];
export const createUsuario = async () => ({ sucesso: true });
export const updateUsuario = async () => ({ sucesso: true });
export const deleteUsuario = async () => ({ sucesso: true });

// ─── Dashboard (mock temporário) ──────────────────────────────────────────────
export const getDashboard = async () => ({
  totalClientes: 0,
  totalVendas: 0,
  totalLances: 0,
});

// ─── Clientes (mock пока backend não implementado) ────────────────────────────
export const getClientes = async () => [];
export const createCliente = async () => ({ sucesso: true });
export const updateCliente = async () => ({ sucesso: true });
export const deleteCliente = async () => ({ sucesso: true });

// ─── Vendas (mock) ────────────────────────────────────────────────────────────
export const getVendas = async () => [];
export const createVenda = async () => ({ sucesso: true });
export const updateVenda = async () => ({ sucesso: true });
export const deleteVenda = async () => ({ sucesso: true });

// ─── Lances (mock) ────────────────────────────────────────────────────────────
export const getLances = async () => [];
export const createLance = async () => ({ sucesso: true });
export const updateLance = async () => ({ sucesso: true });
export const deleteLance = async () => ({ sucesso: true });

// ─── Backup (mock) ────────────────────────────────────────────────────────────
export const downloadBackup = async () => {
  alert('Backup ainda não implementado no backend');
};