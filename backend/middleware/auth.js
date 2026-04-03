// middleware/auth.js — Verificação de JWT em todas as rotas protegidas
'use strict';

const jwt = require('jsonwebtoken');
const db  = require('../database');

/**
 * Middleware: verifica token JWT no header Authorization.
 * Injeta req.user = { id, nome, email, tipo } para uso nas rotas.
 */
function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Valida se o usuário ainda existe e está ativo
    const user = db.prepare(
      'SELECT id, nome, email, tipo, ativo FROM usuarios WHERE id = ?'
    ).get(payload.id);

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Sessão inválida ou usuário inativo' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware: verifica se o usuário logado é admin.
 * Deve ser usado APÓS o middleware auth().
 */
function adminOnly(req, res, next) {
  if (req.user?.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

module.exports = { auth, adminOnly };
