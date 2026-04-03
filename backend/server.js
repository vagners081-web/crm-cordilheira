// server.js — CRM Pro v2 (PRONTO PARA RENDER)
'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const { auth, adminOnly } = require('./middleware/auth');

const app = express();

// 🚨 ESSENCIAL PARA RENDER
const PORT = process.env.PORT || 10000;
const isProd = process.env.NODE_ENV === 'production';

// ─── Segurança ─────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: '*',
  credentials: true,
}));

// ─── Rate Limit ────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
}));

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
}));

// ─── Parsers ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logger ────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ─── Rotas ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🚀 CRM Backend rodando!');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/vendas', require('./routes/vendas'));
app.use('/api/lances', require('./routes/lances'));

// ─── Dashboard ─────────────────────────────────────────
app.get('/api/dashboard', auth, (req, res) => {
  try {
    const totalClientes = db.prepare(`SELECT COUNT(*) t FROM clientes`).get().t;
    const totalVendas = db.prepare(`SELECT COUNT(*) t FROM vendas`).get().t;
    const totalLances = db.prepare(`SELECT COUNT(*) t FROM lances`).get().t;

    res.json({
      totalClientes,
      totalVendas,
      totalLances
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── FRONTEND (se existir build) ───────────────────────
if (isProd) {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');

  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }
}

// ─── ERROS ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

// ─── START (IMPORTANTE PARA RENDER) ────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});