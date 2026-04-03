// pages/Lances.jsx — Gestão de lances em consórcio
import { useState, useEffect, useCallback } from 'react';
import { getLances, createLance, updateLance, deleteLance, exportLances, getClientes } from '../services/api';
import { BRL, fDate, STATUS_COLORS, LANCE_LABEL, blurBRL } from '../utils/format';
import { useToast } from '../context/ToastContext';

const BLANK = { cliente_id:'', grupo:'', cota:'', tipo_lance:'livre', percentual:'', valor_lance:'', data_lance:'', status:'aguardando', observacoes:'' };

function LanceModal({ lance, clientes, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(
    lance ? { ...BLANK, ...lance, valor_lance: lance.valor_lance ?? '', percentual: lance.percentual ?? '' }
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
        valor_lance: form.valor_lance ? parseFloat(String(form.valor_lance).replace(',','.')) : null,
        percentual:  form.percentual  ? parseFloat(String(form.percentual).replace(',','.'))  : null,
        cliente_id:  form.cliente_id  ? parseInt(form.cliente_id) : null,
      };
      if (lance) { await updateLance(lance.id, p); toast('Lance atualizado!'); }
      else       { await createLance(p);           toast('Lance cadastrado!'); }
      onSaved();
    } catch (err) { toast(err.message, 'err'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 660 }}>
        <div className="modal-head">
          <div className="modal-headline"><span>🎯</span> {lance ? 'Editar Lance' : 'Novo Lance'}</div>
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
                <label>Grupo</label>
                <input value={form.grupo} onChange={upd('grupo')} placeholder="Ex: 0042" />
              </div>
              <div className="fg">
                <label>Cota</label>
                <input value={form.cota} onChange={upd('cota')} placeholder="Ex: 00123" />
              </div>
              <div className="fg">
                <label>Tipo de lance</label>
                <select value={form.tipo_lance} onChange={upd('tipo_lance')}>
                  <option value="livre">Livre</option>
                  <option value="fixo">Fixo</option>
                  <option value="embutido">Embutido</option>
                </select>
              </div>
              <div className="fg">
                <label>Percentual (%)</label>
                <input value={form.percentual} inputMode="decimal"
                  onChange={updNum('percentual')}
                  onBlur={() => blurBRL(form.percentual, setForm, 'percentual')}
                  placeholder="Ex: 25,00" />
              </div>
              <div className="fg">
                <label>Valor do lance (R$)</label>
                <input value={form.valor_lance} inputMode="decimal"
                  onChange={updNum('valor_lance')}
                  onBlur={() => blurBRL(form.valor_lance, setForm, 'valor_lance')}
                  placeholder="0,00" />
              </div>
              <div className="fg">
                <label>Data do lance</label>
                <input type="date" value={form.data_lance} onChange={upd('data_lance')} />
              </div>
              <div className="fg">
                <label>Status</label>
                <select value={form.status} onChange={upd('status')}>
                  <option value="aguardando">Aguardando</option>
                  <option value="ganho">Ganho</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>
              <div className="fg full">
                <label>Observações</label>
                <textarea value={form.observacoes} onChange={upd('observacoes')} rows={3} placeholder="Observações do lance…" />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spin" style={{width:14,height:14,borderWidth:2}}/> Salvando…</> : lance ? '💾 Atualizar' : '✅ Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Lances() {
  const toast = useToast();
  const [list,      setList]      = useState([]);
  const [clientes,  setClientes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [exporting, setExporting] = useState(false);
  const [filterStatus, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const [l, c] = await Promise.all([getLances(), getClientes()]); setList(l); setClientes(c); }
    catch (err) { toast(err.message, 'err'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Confirma a exclusão deste lance?')) return;
    setDeleting(id);
    try { await deleteLance(id); toast('Lance removido'); load(); }
    catch (err) { toast(err.message, 'err'); }
    finally { setDeleting(null); }
  }

  async function handleExport() {
    setExporting(true);
    try { await exportLances(); toast('Exportação concluída!'); }
    catch (err) { toast(err.message, 'err'); }
    finally { setExporting(false); }
  }

  const ganhos    = list.filter(l => l.status === 'ganho').length;
  const perdidos  = list.filter(l => l.status === 'perdido').length;
  const aguardando= list.filter(l => l.status === 'aguardando').length;
  const filtered  = filterStatus ? list.filter(l => l.status === filterStatus) : list;

  const STATUS_ICONS = { ganho: '✅', perdido: '❌', aguardando: '⏳' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🎯 Lances</div>
          <div className="page-subtitle">{list.length} lance(s) registrado(s)</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-success btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <><div className="spin" style={{width:13,height:13,borderWidth:2}}/> Exportando…</> : '📥 Exportar Excel'}
          </button>
          <button className="btn btn-primary" onClick={() => setModal('new')}>＋ Novo Lance</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', marginBottom: 20 }}>
        {[
          { k: '',          label: 'Total',      v: list.length, color: 'var(--accent)' },
          { k: 'ganho',     label: 'Ganhos',     v: ganhos,      color: 'var(--green)'  },
          { k: 'aguardando',label: 'Aguardando', v: aguardando,  color: 'var(--yellow)' },
          { k: 'perdido',   label: 'Perdidos',   v: perdidos,    color: 'var(--red)'    },
        ].map(s => (
          <div
            key={s.k}
            className="stat-card"
            style={{ padding: '14px 18px', cursor: 'pointer', outline: filterStatus === s.k ? '2px solid var(--accent)' : 'none' }}
            onClick={() => setFilter(s.k)}
          >
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.v}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loader"><div className="spin" /> Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎯</div>
            <div className="empty-title">Nenhum lance encontrado</div>
            <div className="empty-sub">Clique em "+ Novo Lance" para adicionar</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Grupo / Cota</th>
                  <th>Tipo</th>
                  <th>Percentual</th>
                  <th>Valor do Lance</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const sc = STATUS_COLORS[l.status] || {};
                  return (
                    <tr key={l.id}>
                      <td className="fw-600">{l.cliente_nome || '—'}</td>
                      <td className="td-mono td-muted">{l.grupo || '—'} / {l.cota || '—'}</td>
                      <td>{LANCE_LABEL[l.tipo_lance] || l.tipo_lance || '—'}</td>
                      <td className="td-mono">{l.percentual != null ? `${l.percentual}%` : '—'}</td>
                      <td className="text-accent font-mono fw-600">{BRL(l.valor_lance)}</td>
                      <td className="td-muted">{fDate(l.data_lance)}</td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.text }}>
                          {STATUS_ICONS[l.status]} {l.status === 'ganho' ? 'Ganho' : l.status === 'perdido' ? 'Perdido' : 'Aguardando'}
                        </span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-ghost btn-xs btn-icon" onClick={() => setModal(l)}>✏️</button>
                          <button className="btn btn-danger btn-xs btn-icon" disabled={deleting === l.id} onClick={() => handleDelete(l.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <LanceModal
          lance={modal === 'new' ? null : modal}
          clientes={clientes}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
