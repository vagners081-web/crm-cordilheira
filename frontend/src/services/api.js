const BASE = 'https://crm-cordilheira-1.onrender.com';

export const login = async (body) => {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  localStorage.setItem('crm_token', data.token);
  localStorage.setItem('crm_user', JSON.stringify(data.user));

  return data;
};
export const alterarSenha = async (body) => {
  const res = await fetch(`${BASE}/alterar-senha`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.json();
};