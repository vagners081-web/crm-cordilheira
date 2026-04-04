const BASE = 'https://crm-cordilheira-1.onrender.com';

// LOGIN
export const login = async (body) => {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Login inválido');

  return res.json();
};

// USUÁRIOS
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

// CLIENTES
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