// server.js — Servidor Express principal — CRM Pro v2
'use strict';

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const fs          = require('fs');
const db          = require('./database');
const { auth, adminOnly } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ─── Segurança ────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: isProd
    ? (process.env.FRONTEND_URL || '*')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
}));

// Rate limiting mais restrito para login
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
}));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logger ───────────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Rotas API ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/vendas',   require('./routes/vendas'));
app.use('/api/lances',   require('./routes/lances'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard', auth, (req, res) => {
  try {
    const isAdmin = req.user.tipo === 'admin';
    const uid     = req.user.id;
    const f       = isAdmin ? '' : `AND usuario_id = ${uid}`;
    const fc      = isAdmin ? '' : `AND c.usuario_id = ${uid}`;

    const totalClientes   = db.prepare(`SELECT COUNT(*) t FROM clientes WHERE 1=1 ${f}`).get().t;
    const clientesAtivos  = db.prepare(`SELECT COUNT(*) t FROM clientes WHERE status='ativo' ${f}`).get().t;
    const totalVendas     = db.prepare(`SELECT COUNT(*) t FROM vendas WHERE 1=1 ${f}`).get().t;
    const totalLances     = db.prepare(`SELECT COUNT(*) t FROM lances WHERE 1=1 ${f}`).get().t;
    const lancesGanhos    = db.prepare(`SELECT COUNT(*) t FROM lances WHERE status='ganho' ${f}`).get().t;
    const valorTotalVendas = db.prepare(`SELECT COALESCE(SUM(valor_venda),0) t FROM vendas WHERE 1=1 ${f}`).get().t;
    const comissaoTotal   = db.prepare(`SELECT COALESCE(SUM(comissao),0) t FROM vendas WHERE 1=1 ${f}`).get().t;

    const ultimosClientes = db.prepare(`
      SELECT c.id, c.nome, c.celular, c.status, c.tipo, c.valor_credito, c.criado_em, u.nome AS criado_por
      FROM clientes c LEFT JOIN usuarios u ON u.id = c.usuario_id
      WHERE 1=1 ${fc} ORDER BY c.criado_em DESC LIMIT 8
    `).all();

    const ultimasVendas = db.prepare(`
      SELECT v.*, c.nome AS cliente_nome
      FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE 1=1 ${f} ORDER BY v.criado_em DESC LIMIT 5
    `).all();

    // Vendas por mês (últimos 6 meses)
    const vendasMes = db.prepare(`
      SELECT strftime('%Y-%m', data_venda) AS mes,
             COUNT(*) AS qtd,
             COALESCE(SUM(valor_venda), 0) AS total
      FROM vendas
      WHERE data_venda >= date('now', '-6 months') ${f}
      GROUP BY mes ORDER BY mes
    `).all();

    res.json({
      totalClientes, clientesAtivos, totalVendas, totalLances,
      lancesGanhos, valorTotalVendas, comissaoTotal,
      ultimosClientes, ultimasVendas, vendasMes,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Backup manual (admin only) ───────────────────────────────────────────────
app.get('/api/backup', auth, adminOnly, (req, res) => {
  try {
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'crm.db');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Arquivo de banco não encontrado' });
    }
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="backup_crm_${date}.db"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(dbPath);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

// ─── Serve frontend em produção ───────────────────────────────────────────────
if (isProd) {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (_req, res) => res.sendFile(path.join(buildPath, 'index.html')));
  }
}

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// ─── Error handler global ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CRM Pro v2 — Backend`);
  console.log(`   Ambiente : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL      : http://localhost:${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}/api/dashboard\n`);
});
