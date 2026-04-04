const BASE = 'https://crm-cordilheira-1.onrender.com';

// ─── AUTH ─────────────────────────────
export const login = async (body) => {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Login inválido');

  return res.json();
};

export const getMe = async () => ({
  id: 1,
  nome: 'Administrador',
  email: 'admin@admin.com',
  role: 'admin'
});

export const alterarSenha = async () => ({ sucesso: true });

// ─── USUÁRIOS ─────────────────────────
export const getUsuarios = async () => {
  const res = await fetch(`${BASE}/usuarios`);
  return res.json();
};

export const createUsuario = async (body) => {
  const res = await fetch(`${BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const updateUsuario = async () => ({});
export const deleteUsuario = async () => ({});

// ─── DASHBOARD ────────────────────────
export const getDashboard = async () => ({
  total: 0,
  ativos: 0,
  inativos: 0,
  credito: 0
});

// ─── CLIENTES ─────────────────────────
export const getClientes = async () => {
  const res = await fetch(`${BASE}/clientes`);
  return res.json();
};

export const createCliente = async (body) => {
  const res = await fetch(`${BASE}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const updateCliente = async () => ({});
export const deleteCliente = async () => ({});
export const exportClientes = async () => ({});

// ─── VENDAS ───────────────────────────
export const getVendas = async () => [];
export const createVenda = async () => ({});
export const updateVenda = async () => ({});
export const deleteVenda = async () => ({});
export const exportVendas = async () => ({});

// ─── LANCES ───────────────────────────
export const getLances = async () => [];
export const createLance = async () => ({});
export const updateLance = async () => ({});
export const deleteLance = async () => ({});
export const exportLances = async () => ({});

// ─── BACKUP ───────────────────────────
export const downloadBackup = async () => ({});