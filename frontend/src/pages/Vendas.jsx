// pages/Vendas.jsx — Gestão de vendas
import { useState, useEffect, useCallback } from 'react';
import { getVendas, createVenda, updateVenda, deleteVenda, exportVendas, getClientes } from '../services/api';
import { BRL, fDate, blurBRL } from '../utils/format';
import { useToast } from '../context/ToastContext';

const BLANK = { cliente_id:'', data_venda:'', tipo_produto:'', valor_venda:'', comissao:'', vendedor:'', observacoes:'' };

function VendaModal({ venda, clientes, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(
    venda ? { ...BLANK, ...venda, valor_venda: venda.valor_venda ?? '', comissao: venda.comissao ?? '' }
          : { ...BLANK }
  );
  const [saving, setSaving] = useState(false);

  const upd    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const updNum = k => e => setForm(f => ({ ...f, [k]: e.target.value.replace(/[^\d,]/g,'') }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const p = {
        ...form,
        valor_venda: form.valor_venda ? parseFloat(String(form.valor_venda).replace(',','.')) : null,
        comissao:    form.comissao    ? parseFloat(String(form.comissao).replace(',','.'))    : null,
        cliente_id:  form.cliente_id  ? parseInt(form.cliente_id) : null,
      };
      if (venda) { await updateVenda(venda.id, p); toast('Venda atualizada!'); }
      else       { await createVenda(p);           toast('Venda cadastrada!'); }
      onSaved();
    } catch (err) { toast(err.message, 'err'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-head">
          <div className="modal-headline"><span>💰</span> {venda ? 'Editar Venda' : 'Nova Venda'}</div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="fg x2">
                <label>Cliente</label>
                <select value={form.cliente_id} onChange={upd('cliente_id')}>
                  <option value="">— Selecione um cliente —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Data da venda</label>
                <input type="date" value={form.data_venda} onChange={upd('data_venda')} />
              </div>
              <div className="fg">
                <label>Tipo de produto</label>
                <input value={form.tipo_produto} onChange={upd('tipo_produto')} placeholder="Ex: Consórcio Auto" />
              </div>
              <div className="fg">
                <label>Valor da venda (R$)</label>
                <input value={form.valor_venda} inputMode="decimal"
                  onChange={updNum('valor_venda')}
                  onBlur={() => blurBRL(form.valor_venda, setForm, 'valor_venda')}
                  placeholder="0,00" />
              </div>
              <div className="fg">
                <label>Comissão (R$)</label>
                <input value={form.comissao} inputMode="decimal"
                  onChange={updNum('comissao')}
                  onBlur={() => blurBRL(form.comissao, setForm, 'comissao')}
                  placeholder="0,00" />
              </div>
              <div className="fg">
                <label>Vendedor</label>
                <input value={form.vendedor} onChange={upd('vendedor')} placeholder="Nome do vendedor" />
              </div>
              <div className="fg full">
                <label>Observações</label>
                <textarea value={form.observacoes} onChange={upd('observacoes')} rows={3} placeholder="Observações da venda…" />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spin" style={{width:14,height:14,borderWidth:2}}/> Salvando…</> : venda ? '💾 Atualizar' : '✅ Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Vendas() {
  const toast = useToast();
  const [list,      setList]      = useState([]);
  const [clientes,  setClientes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const [v, c] = await Promise.all([getVendas(), getClientes()]); setList(v); setClientes(c); }
    catch (err) { toast(err.message, 'err'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Confirma a exclusão desta venda?')) return;
    setDeleting(id);
    try { await deleteVenda(id); toast('Venda removida'); load(); }
    catch (err) { toast(err.message, 'err'); }
    finally { setDeleting(null); }
  }

  async function handleExport() {
    setExporting(true);
    try { await exportVendas(); toast('Exportação concluída!'); }
    catch (err) { toast(err.message, 'err'); }
    finally { setExporting(false); }
  }

  const totalVendas   = list.reduce((s, v) => s + (v.valor_venda || 0), 0);
  const totalComissao = list.reduce((s, v) => s + (v.comissao || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">💰 Vendas</div>
          <div className="page-subtitle">{list.length} venda(s) registrada(s)</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-success btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <><div className="spin" style={{width:13,height:13,borderWidth:2}}/> Exportando…</> : '📥 Exportar Excel'}
          </button>
          <button className="btn btn-primary" onClick={() => setModal('new')}>＋ Nova Venda</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', marginBottom: 20 }}>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-value" style={{ fontSize: 22 }}>{list.length}</div>
          <div className="stat-label">Total de vendas</div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-value" style={{ fontSize: 18, color: 'var(--green)' }}>{BRL(totalVendas)}</div>
          <div className="stat-label">Valor total</div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-value" style={{ fontSize: 18, color: 'var(--yellow)' }}>{BRL(totalComissao)}</div>
          <div className="stat-label">Comissão total</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loader"><div className="spin" /> Carregando…</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <div className="empty-title">Nenhuma venda registrada</div>
            <div className="empty-sub">Clique em "+ Nova Venda" para adicionar</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Comissão</th>
                  <th>Vendedor</th>
                  <th>Registrado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map(v => (
                  <tr key={v.id}>
                    <td className="fw-600">{v.cliente_nome || '—'}</td>
                    <td className="td-muted">{fDate(v.data_venda)}</td>
                    <td>{v.tipo_produto || '—'}</td>
                    <td className="text-green font-mono fw-600">{BRL(v.valor_venda)}</td>
                    <td className="text-accent font-mono">{BRL(v.comissao)}</td>
                    <td>{v.vendedor || '—'}</td>
                    <td className="td-muted">{fDate(v.criado_em?.split(' ')[0])}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs btn-icon" onClick={() => setModal(v)}>✏️</button>
                        <button className="btn btn-danger btn-xs btn-icon" disabled={deleting === v.id} onClick={() => handleDelete(v.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-md)', background: 'var(--bg-deep)' }}>
                  <td colSpan={3} className="fw-600" style={{ padding: '12px 18px', color: 'var(--text-200)' }}>TOTAIS</td>
                  <td className="text-green font-mono fw-600" style={{ padding: '12px 18px' }}>{BRL(totalVendas)}</td>
                  <td className="text-accent font-mono" style={{ padding: '12px 18px' }}>{BRL(totalComissao)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <VendaModal
          venda={modal === 'new' ? null : modal}
          clientes={clientes}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
