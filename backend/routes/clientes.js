// routes/clientes.js — CRUD completo de clientes + export Excel
'use strict';

const express = require('express');
const XLSX    = require('xlsx');
const db      = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth); // todas as rotas exigem autenticação

// ─── Helper: filtro por usuário ───────────────────────────────────────────────
// Admin vê tudo; usuário comum vê só os seus
function userFilter(req) {
  return req.user.tipo === 'admin' ? '' : 'AND c.usuario_id = ' + req.user.id;
}

// ─── GET /api/clientes ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { q } = req.query;
    const filter = userFilter(req);
    let sql = `
      SELECT c.*, u.nome AS criado_por
      FROM clientes c
      LEFT JOIN usuarios u ON u.id = c.usuario_id
      WHERE 1=1 ${filter}
    `;
    const params = [];
    if (q) {
      sql += ' AND (c.nome LIKE ? OR c.celular LIKE ? OR c.email LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY c.criado_em DESC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/clientes/export ─────────────────────────────────────────────────
router.get('/export', (req, res) => {
  try {
    const filter = userFilter(req);
    const rows = db.prepare(`
      SELECT
        c.nome        AS "Nome",
        c.celular     AS "Celular",
        c.email       AS "Email",
        c.profissao   AS "Profissão",
        CASE c.tipo WHEN 'consorcio' THEN 'Consórcio' ELSE 'Imóvel' END AS "Tipo",
        c.administradora AS "Administradora",
        c.grupo       AS "Grupo",
        c.cota        AS "Cota",
        c.valor_credito AS "Valor do Crédito (R$)",
        c.prazo       AS "Prazo (meses)",
        c.parcela     AS "Parcela (R$)",
        CASE c.status WHEN 'ativo' THEN 'Ativo' ELSE 'Inativo' END AS "Status",
        c.observacoes AS "Observações",
        c.data_venda  AS "Data da Venda",
        c.criado_em   AS "Cadastrado em"
      FROM clientes c
      WHERE 1=1 ${filter}
      ORDER BY c.criado_em DESC
    `).all();

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Largura das colunas
    ws['!cols'] = [
      {wch:30},{wch:18},{wch:28},{wch:18},{wch:12},{wch:20},
      {wch:10},{wch:10},{wch:18},{wch:14},{wch:14},{wch:10},{wch:40},{wch:14},{wch:20}
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="clientes_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/clientes/:id ────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const filter = userFilter(req);
    const c = db.prepare(`SELECT * FROM clientes WHERE id = ? ${filter.replace('AND c.', 'AND ')}`).get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── POST /api/clientes ───────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const {
      nome, data_venda, celular, nascimento, email, endereco, profissao,
      tipo, administradora, cota, grupo, valor_credito, prazo, parcela,
      status, observacoes
    } = req.body;
    if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' });

    const r = db.prepare(`
      INSERT INTO clientes
        (usuario_id, nome, data_venda, celular, nascimento, email, endereco, profissao,
         tipo, administradora, cota, grupo, valor_credito, prazo, parcela, status, observacoes)
      VALUES
        (@uid,@nome,@data_venda,@celular,@nascimento,@email,@endereco,@profissao,
         @tipo,@administradora,@cota,@grupo,@valor_credito,@prazo,@parcela,@status,@observacoes)
    `).run({
      uid: req.user.id, nome, data_venda, celular, nascimento, email, endereco, profissao,
      tipo, administradora, cota, grupo,
      valor_credito: valor_credito || null, prazo: prazo || null, parcela: parcela || null,
      status: status || 'ativo', observacoes
    });

    res.status(201).json(db.prepare('SELECT * FROM clientes WHERE id = ?').get(r.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PUT /api/clientes/:id ────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const filter = userFilter(req);
    const existe = db.prepare(`SELECT id FROM clientes WHERE id = ? ${filter.replace('AND c.','AND ')}`).get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Cliente não encontrado' });

    const {
      nome, data_venda, celular, nascimento, email, endereco, profissao,
      tipo, administradora, cota, grupo, valor_credito, prazo, parcela, status, observacoes
    } = req.body;

    db.prepare(`
      UPDATE clientes SET
        nome=@nome, data_venda=@data_venda, celular=@celular, nascimento=@nascimento,
        email=@email, endereco=@endereco, profissao=@profissao, tipo=@tipo,
        administradora=@administradora, cota=@cota, grupo=@grupo,
        valor_credito=@valor_credito, prazo=@prazo, parcela=@parcela,
        status=@status, observacoes=@observacoes
      WHERE id=@id
    `).run({
      id: req.params.id, nome, data_venda, celular, nascimento, email, endereco, profissao,
      tipo, administradora, cota, grupo,
      valor_credito: valor_credito||null, prazo: prazo||null, parcela: parcela||null,
      status: status||'ativo', observacoes
    });

    res.json(db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DELETE /api/clientes/:id ─────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const filter = userFilter(req);
    const existe = db.prepare(`SELECT id FROM clientes WHERE id = ? ${filter.replace('AND c.','AND ')}`).get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Cliente não encontrado' });
    db.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Cliente removido' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
