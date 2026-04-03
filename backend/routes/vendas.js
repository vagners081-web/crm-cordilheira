// routes/vendas.js — CRUD completo de vendas + export Excel
'use strict';

const express = require('express');
const XLSX    = require('xlsx');
const db      = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function userFilter(req, alias = 'v') {
  return req.user.tipo === 'admin' ? '' : `AND ${alias}.usuario_id = ${req.user.id}`;
}

// ─── GET /api/vendas ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const f = userFilter(req);
    const rows = db.prepare(`
      SELECT v.*, c.nome AS cliente_nome, u.nome AS criado_por
      FROM vendas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE 1=1 ${f}
      ORDER BY v.criado_em DESC
    `).all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/vendas/export ───────────────────────────────────────────────────
router.get('/export', (req, res) => {
  try {
    const f = userFilter(req);
    const rows = db.prepare(`
      SELECT
        c.nome            AS "Cliente",
        v.data_venda      AS "Data da Venda",
        v.tipo_produto    AS "Tipo de Produto",
        v.valor_venda     AS "Valor da Venda (R$)",
        v.comissao        AS "Comissão (R$)",
        v.vendedor        AS "Vendedor",
        v.observacoes     AS "Observações",
        v.criado_em       AS "Registrado em"
      FROM vendas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE 1=1 ${f}
      ORDER BY v.criado_em DESC
    `).all();

    // Linha de totais
    const totalVendas   = rows.reduce((s, r) => s + (r['Valor da Venda (R$)'] || 0), 0);
    const totalComissao = rows.reduce((s, r) => s + (r['Comissão (R$)'] || 0), 0);
    rows.push({
      'Cliente': 'TOTAL',
      'Data da Venda': '', 'Tipo de Produto': '', 'Valor da Venda (R$)': totalVendas,
      'Comissão (R$)': totalComissao, 'Vendedor': '', 'Observações': '', 'Registrado em': ''
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch:28},{wch:14},{wch:20},{wch:18},{wch:16},{wch:20},{wch:36},{wch:20}];
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="vendas_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/vendas/:id ──────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const f = userFilter(req);
    const v = db.prepare(`
      SELECT v.*, c.nome AS cliente_nome FROM vendas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE v.id = ? ${f}
    `).get(req.params.id);
    if (!v) return res.status(404).json({ error: 'Venda não encontrada' });
    res.json(v);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── POST /api/vendas ─────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { cliente_id, data_venda, tipo_produto, valor_venda, comissao, vendedor, observacoes } = req.body;
    const r = db.prepare(`
      INSERT INTO vendas (usuario_id, cliente_id, data_venda, tipo_produto, valor_venda, comissao, vendedor, observacoes)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(req.user.id, cliente_id||null, data_venda, tipo_produto, valor_venda||null, comissao||null, vendedor, observacoes);

    const nova = db.prepare(`
      SELECT v.*, c.nome AS cliente_nome FROM vendas v
      LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = ?
    `).get(r.lastInsertRowid);
    res.status(201).json(nova);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PUT /api/vendas/:id ──────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const f = userFilter(req);
    const existe = db.prepare(`SELECT id FROM vendas WHERE id = ? ${f}`).get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Venda não encontrada' });

    const { cliente_id, data_venda, tipo_produto, valor_venda, comissao, vendedor, observacoes } = req.body;
    db.prepare(`
      UPDATE vendas SET
        cliente_id=?,data_venda=?,tipo_produto=?,valor_venda=?,comissao=?,vendedor=?,observacoes=?
      WHERE id=?
    `).run(cliente_id||null, data_venda, tipo_produto, valor_venda||null, comissao||null, vendedor, observacoes, req.params.id);

    const v = db.prepare(`
      SELECT v.*, c.nome AS cliente_nome FROM vendas v
      LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = ?
    `).get(req.params.id);
    res.json(v);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DELETE /api/vendas/:id ───────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const f = userFilter(req);
    const existe = db.prepare(`SELECT id FROM vendas WHERE id = ? ${f}`).get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Venda não encontrada' });
    db.prepare('DELETE FROM vendas WHERE id = ?').run(req.params.id);
    res.json({ message: 'Venda removida' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
