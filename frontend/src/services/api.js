// services/api.js — versão 100% compatível com seu backend atual

const BASE = 'https://crm-cordilheira-1.onrender.com';

// ─── LOGIN REAL ─────────────────────────────────────────────
export const login = async (body) => {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Login inválido');

  return res.json();
};

// ─── USUÁRIO LOGADO (MOCK) ─────────────────────────────────
export const getMe = async () => ({
  nome: 'Administrador',
  email: 'admin@admin.com',
});

// ─── DASHBOARD (MOCK) ─────────────────────────────────────
export const getDashboard = async () => ({
  totalClientes: 0,
  totalVendas: 0,
  totalLances: 0,
});

// ─── CLIENTES (MOCK) ──────────────────────────────────────
export const getClientes = async () => [];
export const createCliente = async () => ({ sucesso: true });
export const updateCliente = async () => ({ sucesso: true });
export const deleteCliente = async () => ({ sucesso: true });

// ─── VENDAS (MOCK) ────────────────────────────────────────
export const getVendas = async () => [];
export const createVenda = async () => ({ sucesso: true });
export const updateVenda = async () => ({ sucesso: true });
export const deleteVenda = async () => ({ sucesso: true });

// ─── LANCES (MOCK) ────────────────────────────────────────
export const getLances = async () => [];
export const createLance = async () => ({ sucesso: true });
export const updateLance = async () => ({ sucesso: true });
export const deleteLance = async () => ({ sucesso: true });

// ─── USUÁRIOS (AINDA NÃO EXISTE NO BACKEND) ───────────────
export const getUsuarios = async () => [];
export const createUsuario = async () => ({ sucesso: true });
export const updateUsuario = async () => ({ sucesso: true });
export const deleteUsuario = async () => ({ sucesso: true });