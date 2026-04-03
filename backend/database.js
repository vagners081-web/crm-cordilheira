// database.js — Configuração SQLite com todas as tabelas do sistema
'use strict';

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'crm.db');
const db = new Database(DB_PATH);

// Performance e integridade
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// ─── Schema completo ──────────────────────────────────────────────────────────
db.exec(`
  /* ── Usuários ── */
  CREATE TABLE IF NOT EXISTS usuarios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    senha_hash  TEXT    NOT NULL,
    tipo        TEXT    NOT NULL DEFAULT 'usuario',  -- 'admin' | 'usuario'
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT    DEFAULT (datetime('now','localtime')),
    ultimo_login TEXT
  );

  /* ── Clientes ── */
  CREATE TABLE IF NOT EXISTS clientes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nome           TEXT    NOT NULL,
    data_venda     TEXT,
    celular        TEXT,
    nascimento     TEXT,
    email          TEXT,
    endereco       TEXT,
    profissao      TEXT,
    tipo           TEXT,
    administradora TEXT,
    cota           TEXT,
    grupo          TEXT,
    valor_credito  REAL,
    prazo          INTEGER,
    parcela        REAL,
    status         TEXT    DEFAULT 'ativo',
    observacoes    TEXT,
    criado_em      TEXT    DEFAULT (datetime('now','localtime'))
  );

  /* ── Vendas ── */
  CREATE TABLE IF NOT EXISTS vendas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    cliente_id    INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    data_venda    TEXT,
    tipo_produto  TEXT,
    valor_venda   REAL,
    comissao      REAL,
    vendedor      TEXT,
    observacoes   TEXT,
    criado_em     TEXT    DEFAULT (datetime('now','localtime'))
  );

  /* ── Lances ── */
  CREATE TABLE IF NOT EXISTS lances (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    cliente_id    INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    grupo         TEXT,
    cota          TEXT,
    tipo_lance    TEXT,
    percentual    REAL,
    valor_lance   REAL,
    data_lance    TEXT,
    status        TEXT    DEFAULT 'aguardando',
    observacoes   TEXT,
    criado_em     TEXT    DEFAULT (datetime('now','localtime'))
  );
`);

// ─── Seed: admin padrão ───────────────────────────────────────────────────────
(function seedAdmin() {
  const email = process.env.ADMIN_EMAIL    || 'admin@crmpro.com';
  const nome  = process.env.ADMIN_NAME     || 'Administrador';
  const senha = process.env.ADMIN_PASSWORD || 'Admin@2024';

  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (!existe) {
    const hash = bcrypt.hashSync(senha, 12);
    db.prepare(`
      INSERT INTO usuarios (nome, email, senha_hash, tipo)
      VALUES (?, ?, ?, 'admin')
    `).run(nome, email, hash);
    console.log(`\n✅ Admin criado: ${email} / ${senha}\n   ⚠️  Troque a senha após o primeiro login!\n`);
  }
})();

console.log(`✅ Banco de dados: ${DB_PATH}`);
module.exports = db;
