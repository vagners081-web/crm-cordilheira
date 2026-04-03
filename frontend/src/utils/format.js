// utils/format.js — Utilitários de formatação

export const BRL = (v) => {
  if (v == null || v === '') return '—';
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const fDate = (s) => {
  if (!s) return '—';
  const [y, m, d] = String(s).split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

export const fDateTime = (s) => {
  if (!s) return '—';
  const [dt, tm] = String(s).split(' ');
  return `${fDate(dt)}${tm ? ' ' + tm.slice(0,5) : ''}`;
};

export const maskPhone = (v = '') => {
  const d = v.replace(/\D/g,'').slice(0,11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};

export const parseBRL = (s) => {
  if (!s) return null;
  const n = parseFloat(String(s).replace(/\./g,'').replace(',','.'));
  return isNaN(n) ? null : n;
};

export const blurBRL = (val, setter, field) => {
  const n = parseBRL(val);
  if (n != null && n > 0) setter(f => ({ ...f, [field]: n.toFixed(2).replace('.',',') }));
};

export const initials = (name = '') =>
  name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

export const STATUS_COLORS = {
  ativo:      { bg: 'var(--green-bg)',  text: 'var(--green)' },
  inativo:    { bg: 'var(--red-bg)',    text: 'var(--red)'   },
  ganho:      { bg: 'var(--green-bg)',  text: 'var(--green)' },
  perdido:    { bg: 'var(--red-bg)',    text: 'var(--red)'   },
  aguardando: { bg: 'var(--yellow-bg)', text: 'var(--yellow)'},
};

export const TIPO_LABEL = { consorcio: 'Consórcio', imovel: 'Imóvel' };
export const LANCE_LABEL = { livre: 'Livre', fixo: 'Fixo', embutido: 'Embutido' };
