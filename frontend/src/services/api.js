const BASE = 'https://crm-cordilheira-1.onrender.com';

// ─── TOKEN ─────────────────────────
function getToken() {
  return localStorage.getItem('crm_token');
}

// ─── REQUEST PADRÃO ───────────────
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Servidor não respondeu corretamente');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Erro no servidor');
  }

  return data;
}

// ─── LOGIN (AJUSTADO) ─────────────
export const login = async (body) => {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // SALVA TOKEN E USUÁRIO
  localStorage.setItem('crm_token', data.token);
  localStorage.setItem('crm_user', JSON.stringify(data.user));

  return data;
};

// ─── USUÁRIOS ─────────────────────
export const getUsuarios = () => request('/usuarios');

export const createUsuario = (body) =>
  request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(body),
  });

// ─── CLIENTES ─────────────────────
export const getClientes = () => request('/clientes');

export const createCliente = (body) =>
  request('/clientes', {
    method: 'POST',
    body: JSON.stringify(body),
  });