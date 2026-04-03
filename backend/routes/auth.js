// routes/auth.js — Autenticação: login, registro, perfil
'use strict';

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, tipo: user.tipo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = db.prepare(
    'SELECT * FROM usuarios WHERE email = ? AND ativo = 1'
  ).get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }

  // Atualiza último login
  db.prepare("UPDATE usuarios SET ultimo_login = datetime('now','localtime') WHERE id = ?")
    .run(user.id);

  const token = signToken(user);
  const { senha_hash, ...userSafe } = user;

  res.json({ token, user: userSafe });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', auth, (req, res) => {
  const user = db.prepare(
    'SELECT id, nome, email, tipo, ativo, criado_em, ultimo_login FROM usuarios WHERE id = ?'
  ).get(req.user.id);
  res.json(user);
});

// ─── PUT /api/auth/senha ──────────────────────────────────────────────────────
router.put('/senha', auth, (req, res) => {
  const { senha_atual, nova_senha } = req.body;
  if (!senha_atual || !nova_senha) {
    return res.status(400).json({ error: 'Informe a senha atual e a nova senha' });
  }
  if (nova_senha.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
  }

  const user = db.prepare('SELECT senha_hash FROM usuarios WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(senha_atual, user.senha_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  const hash = bcrypt.hashSync(nova_senha, 12);
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Senha alterada com sucesso' });
});

// ─── GET /api/auth/usuarios (admin only) ──────────────────────────────────────
router.get('/usuarios', auth, adminOnly, (req, res) => {
  const usuarios = db.prepare(
    'SELECT id, nome, email, tipo, ativo, criado_em, ultimo_login FROM usuarios ORDER BY criado_em DESC'
  ).all();
  res.json(usuarios);
});

// ─── POST /api/auth/usuarios (admin cria usuário) ─────────────────────────────
router.post('/usuarios', auth, adminOnly, (req, res) => {
  const { nome, email, senha, tipo = 'usuario' } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  }
  if (!['admin', 'usuario'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido (admin ou usuario)' });
  }

  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email.toLowerCase());
  if (existe) return res.status(409).json({ error: 'Email já cadastrado' });

  const hash = bcrypt.hashSync(senha, 12);
  const result = db.prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)'
  ).run(nome, email.toLowerCase(), hash, tipo);

  const novo = db.prepare(
    'SELECT id, nome, email, tipo, ativo, criado_em FROM usuarios WHERE id = ?'
  ).get(result.lastInsertRowid);
  res.status(201).json(novo);
});

// ─── PUT /api/auth/usuarios/:id (admin edita usuário) ────────────────────────
router.put('/usuarios/:id', auth, adminOnly, (req, res) => {
  const { nome, email, tipo, ativo, senha } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const updates = [];
  const params  = [];

  if (nome)  { updates.push('nome = ?');  params.push(nome); }
  if (email) { updates.push('email = ?'); params.push(email.toLowerCase()); }
  if (tipo && ['admin','usuario'].includes(tipo)) { updates.push('tipo = ?'); params.push(tipo); }
  if (typeof ativo !== 'undefined') { updates.push('ativo = ?'); params.push(ativo ? 1 : 0); }
  if (senha && senha.length >= 6) {
    updates.push('senha_hash = ?');
    params.push(bcrypt.hashSync(senha, 12));
  }

  if (!updates.length) return res.status(400).json({ error: 'Nada para atualizar' });
  params.push(req.params.id);

  db.prepare(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const atualizado = db.prepare(
    'SELECT id, nome, email, tipo, ativo, criado_em FROM usuarios WHERE id = ?'
  ).get(req.params.id);
  res.json(atualizado);
});

// ─── DELETE /api/auth/usuarios/:id (admin remove usuário) ────────────────────
router.delete('/usuarios/:id', auth, adminOnly, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
  }
  const user = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  res.json({ message: 'Usuário removido' });
});

module.exports = router;
