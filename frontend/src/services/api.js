const BASE = 'https://crm-cordilheira-1.onrender.com';

// ─── REQUEST BASE ─────────────────────────
async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Erro no servidor');
  }

  return data;
}

// ─── AUTH ─────────────────────────
export const login = (body) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify(body)
  });

export const getMe = () =>
  request('/me');

export const alterarSenha = (body) =>
  request('/senha', {
    method: 'PUT',
    body: JSON.stringify(body)
  });

// ─── USUÁRIOS ─────────────────────────
export const getUsuarios = () =>
  request('/usuarios');

export const createUsuario = (body) =>
  request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(body)
  });

export const updateUsuario = (id, body) =>
  request(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });

export const deleteUsuario = (id) =>
  request(`/usuarios/${id}`, {
    method: 'DELETE'
  });

// ─── CLIENTES ─────────────────────────
export const getClientes = () =>
  request('/clientes');

export const createCliente = (body) =>
  request('/clientes', {
    method: 'POST',
    body: JSON.stringify(body)
  });

export const updateCliente = (id, body) =>
  request(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });

export const deleteCliente = (id) =>
  request(`/clientes/${id}`, {
    method: 'DELETE'
  });