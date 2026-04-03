// routes/lances.js — CRUD completo de lances + export Excel
'use strict';

const express = require('express');
const XLSX    = require('xlsx');
const db      = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function userFilter(req, alias = 'l') {
  return req.user.tipo === 'admin' ? '' : `AND ${alias}.usuario_id = ${req.user.id}`;
}

// ─── GET /api/lances ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const f = userFilter(req);
    const rows = db.prepare(`
      SELECT l.*, c.nome AS cliente_nome, u.nome AS criado_por
      FROM lances l
      LEFT JOIN clientes c ON c.id = l.cliente_id
      LEFT JOIN usuarios u ON u.id = l.usuario_id
      WHERE 1=1 ${f}
      ORDER BY l.criado_em DESC
    `).all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/lances/export ───────────────────────────────────────────────────
router.get('/export', (req, res) => {
  try {
    const f = userFilter(req);
    const rows = db.prepare(`
      SELECT
        c.nome        AS "Cliente",
        l.grupo       AS "Grupo",
        l.cota        AS "Cota",
        CASE l.tipo_lance
          WHEN 'livre'    THEN 'Livre'
          WHEN 'fixo'     THEN 'Fixo'
          WHEN 'embutido' THEN 'Embutido'
          ELSE l.tipo_lance END AS "Tipo de Lance",
        l.percentual  AS "Percentual (%)",
        l.valor_lance AS "Valor do Lance (R$)",
        l.data_lance  AS "Data do Lance",
        CASE l.status
          WHEN 'ganho'     THEN 'Ganho'
          WHEN 'perdido'   THEN 'Perdido'
          WHEN 'aguardando' THEN 'Aguardando'
          ELSE l.status END AS "Status",
        l.observacoes AS "Observações",
        l.criado_em   AS "Registrado em"
      FROM lances l
      LEFT JOIN clientes c ON c.id = l.cliente_id
      WHERE 1=1 ${f}
      ORDER BY l.criado_em DESC
    `).all();

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch:28},{wch:10},{wch:10},{wch:14},{wch:14},{wch:18},{wch:14},{wch:12},{wch:40},{wch:20}];
    XLSX.utils.book_append_sheet(wb, ws, 'Lances');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="lances_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/lances/:id ──────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const f = userFilter(req);
    const l = db.prepare(`
      SELECT l.*, c.nome AS cliente_nome FROM lances l
      LEFT JOIN clientes c ON c.id = l.cliente_id
      WHERE l.id = ? ${f}
    `).get(req.params.id);
    if (!l) return res.status(404).json({ error: 'Lance não encontrado' });
    res.json(l);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── POST /api/lances ─────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { cliente_id, grupo, cota, tipo_lance, percentual, valor_lance, data_lance, status, observacoes } = req.body;
    const r = db.prepare(`
      INSERT INTO lances (usuario_id,cliente_id,grupo,cota,tipo_lance,percentual,valor_lance,data_lance,status,observacoes)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(
      req.user.id, cliente_id||null, grupo, cota, tipo_lance,
      percentual||null, valor_lance||null, data_lance,
      status||'aguardando', observacoes
    );
    const novo = db.prepare(`
      SELECT l.*, c.nome AS cliente_nome FROM lances l
      LEFT JOIN clientes c ON c.id = l.cliente_id WHERE l.id = ?
    `).get(r.lastInsertRowid);
    res.status(201).json(novo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PUT /api/lances/:id ──────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const f = userFilter(req);
    const existe = db.prepare(`SELECT id FROM lances WHERE id = ? ${f}`).get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Lance não encontrado' });

    const { cliente_id, grupo, cota, tipo_lance, percentual, valor_lance, data_lance, status, observacoes } = req.body;
    db.prepare(`
      UPDATE lances SET
        cliente_id=?,grupo=?,cota=?,tipo_lance=?,percentual=?,
        valor_lance=?,data_lance=?,status=?,observacoes=?
      WHERE id=?
    `).run(cliente_id||null, grupo, cota, tipo_lance, percentual||null, valor_lance||null, data_lance, status||'aguardando', observacoes, req.params.id);

    const l = db.prepare(`
      SELECT l.*, c.nome AS cliente_nome FROM lances l
      LEFT JOIN clientes c ON c.id = l.cliente_id WHERE l.id = ?
    `).get(req.params.id);
    res.json(l);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DELETE /api/lances/:id ───────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const f = userFilter(req);
    const existe = db.prepare(`SELECT id FROM lances WHERE id = ? ${f}`).get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Lance não encontrado' });
    db.prepare('DELETE FROM lances WHERE id = ?').run(req.params.id);
    res.json({ message: 'Lance removido' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
