  // pages/Clientes.jsx — Gestão completa de clientes
  import { useState, useEffect, useCallback } from 'react';
  import { getClientes, createCliente, updateCliente, deleteCliente, exportClientes } from '../services/api';
  import { BRL, fDate, fDateTime, maskPhone, STATUS_COLORS, TIPO_LABEL, blurBRL } from '../utils/format';
  import { useToast } from '../context/ToastContext';

  // ─── Formulário inicial ───────────────────────────────────────────────────────
  const BLANK = {
    nome:'', data_venda:'', celular:'', nascimento:'', email:'', endereco:'', profissao:'',
    tipo:'consorcio', administradora:'', cota:'', grupo:'',
    valor_credito:'', prazo:'', parcela:'',
    status:'ativo', observacoes:''
  };

  // ─── Modal de cadastro/edição ─────────────────────────────────────────────────
  function ClienteModal({ cliente, onClose, onSaved }) {
    const toast = useToast();
    const [form, setForm] = useState(
      cliente
        ? { ...BLANK, ...cliente,
            valor_credito: cliente.valor_credito ?? '',
            parcela: cliente.parcela ?? '' }
        : { ...BLANK }
    );
    const [saving, setSaving] = useState(false);

    const upd = (k) => (e) => {
      let v = e.target.value;
      if (k === 'celular') v = maskPhone(v);
      setForm(f => ({ ...f, [k]: v }));
    };

    const updNum = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value.replace(/[^\d,]/g,'') }));

    async function submit(e) {
      e.preventDefault();
      if (!form.nome.trim()) { toast('Nome é obrigatório', 'err'); return; }
      setSaving(true);
      try {
        const payload = {
          ...form,
          valor_credito: form.valor_credito ? parseFloat(String(form.valor_credito).replace(',','.')) : null,
          parcela:       form.parcela       ? parseFloat(String(form.parcela).replace(',','.'))       : null,
          prazo:         form.prazo         ? parseInt(form.prazo)                                    : null,
        };
        if (cliente) { await updateCliente(cliente.id, payload); toast('Cliente atualizado!'); }
        else         { await createCliente(payload);             toast('Cliente cadastrado!'); }
        onSaved();
      } catch (err) { toast(err.message, 'err'); }
      finally { setSaving(false); }
    }

    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-head">
            <div className="modal-headline">
              <span>👤</span> {cliente ? 'Editar Cliente' : 'Novo Cliente'}
            </div>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={submit}>
            <div className="modal-body">
              {/* Dados pessoais */}
              <div className="form-section-label">📌 Dados Pessoais</div>
              <div className="form-grid">
                <div className="fg x2">
                  <label>Nome completo *</label>
                  <input value={form.nome} onChange={upd('nome')} placeholder="Nome do cliente" required />
                </div>
                <div className="fg">
                  <label>Data da venda</label>
                  <input type="date" value={form.data_venda} onChange={upd('data_venda')} />
                </div>
                <div className="fg">
                  <label>Celular</label>
                  <input value={form.celular} onChange={upd('celular')} placeholder="(11) 99999-9999" />
                </div>
                <div className="fg">
                  <label>Data de nascimento</label>
                  <input type="date" value={form.nascimento} onChange={upd('nascimento')} />
                </div>
                <div className="fg">
                  <label>E-mail</label>
                  <input type="email" value={form.email} onChange={upd('email')} placeholder="email@exemplo.com" />
                </div>
                <div className="fg x2">
                  <label>Endereço</label>
                  <input value={form.endereco} onChange={upd('endereco')} placeholder="Rua, número, bairro, cidade" />
                </div>
                <div className="fg">
                  <label>Profissão</label>
                  <input value={form.profissao} onChange={upd('profissao')} placeholder="Ex: Médico, Empresário…" />
                </div>
              </div>

              {/* Dados da aquisição */}
              <div className="form-section-label" style={{ marginTop: 18 }}>📋 Dados da Aquisição</div>
              <div className="form-grid">
                <div className="fg">
                  <label>Tipo</label>
                  <select value={form.tipo} onChange={upd('tipo')}>
                    <option value="consorcio">Consórcio</option>
                    <option value="imovel">Imóvel</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Administradora</label>
                  <input value={form.administradora} onChange={upd('administradora')} placeholder="Ex: Porto Seguro" />
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
                  <label>Valor do crédito (R$)</label>
                  <input
                    value={form.valor_credito} inputMode="decimal"
                    onChange={updNum('valor_credito')}
                    onBlur={() => blurBRL(form.valor_credito, setForm, 'valor_credito')}
                    placeholder="0,00"
                  />
                </div>
                <div className="fg">
                  <label>Prazo (meses)</label>
                  <input type="number" min="1" value={form.prazo} onChange={upd('prazo')} placeholder="Ex: 120" />
                </div>
                <div className="fg">
                  <label>Parcela (R$)</label>
                  <input
                    value={form.parcela} inputMode="decimal"
                    onChange={updNum('parcela')}
                    onBlur={() => blurBRL(form.parcela, setForm, 'parcela')}
                    placeholder="0,00"
                  />
                </div>
                <div className="fg">
                  <label>Status</label>
                  <select value={form.status} onChange={upd('status')}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div className="form-section-label" style={{ marginTop: 18 }}>📝 Observações</div>
              <div className="fg">
                <label>Objetivo do cliente / Notas</label>
                <textarea
                  value={form.observacoes} onChange={upd('observacoes')} rows={4}
                  placeholder="Descreva o objetivo, necessidades, perfil do cliente…"
                />
              </div>
            </div>

            <div className="modal-foot">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <><div className="spin" style={{width:14,height:14,borderWidth:2}} /> Salvando…</>
                  : cliente ? '💾 Atualizar' : '✅ Cadastrar'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── Página principal ─────────────────────────────────────────────────────────
  export default function Clientes() {
    const toast = useToast();
    const [list,     setList]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [search,   setSearch]   = useState('');
    const [modal,    setModal]    = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [exporting,setExporting]= useState(false);

    const load = useCallback(async (q = '') => {
      setLoading(true);
      try { setList(await getClientes(q)); }
      catch (err) { toast(err.message, 'err'); }
      finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
      const t = setTimeout(() => load(search), 320);
      return () => clearTimeout(t);
    }, [search, load]);

    async function handleDelete(id) {
      if (!window.confirm('Confirma a exclusão deste cliente?')) return;
      setDeleting(id);
      try { await deleteCliente(id); toast('Cliente removido'); load(search); }
      catch (err) { toast(err.message, 'err'); }
      finally { setDeleting(null); }
    }

    async function handleExport() {
      setExporting(true);
      try { await exportClientes(); toast('Exportação concluída!'); }
      catch (err) { toast(err.message, 'err'); }
      finally { setExporting(false); }
    }

    // Stats rápidas
    const ativos   = list.filter(c => c.status === 'ativo').length;
    const inativos = list.filter(c => c.status === 'inativo').length;
    const totalCredito = list.reduce((s, c) => s + (c.valor_credito || 0), 0);

    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">👥 Clientes</div>
            <div className="page-subtitle">{list.length} cliente(s) encontrado(s)</div>
          </div>
          <div className="page-actions">
            <button className="btn btn-success btn-sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <><div className="spin" style={{width:13,height:13,borderWidth:2}}/> Exportando…</> : '📥 Exportar Excel'}
            </button>
            <button className="btn btn-primary" onClick={() => setModal('new')}>
              ＋ Novo Cliente
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', marginBottom: 20 }}>
          <div className="stat-card" style={{ padding: '14px 18px' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{list.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card" style={{ padding: '14px 18px' }}>
            <div className="stat-value" style={{ fontSize: 22, color: 'var(--green)' }}>{ativos}</div>
            <div className="stat-label">Ativos</div>
          </div>
          <div className="stat-card" style={{ padding: '14px 18px' }}>
            <div className="stat-value" style={{ fontSize: 22, color: 'var(--red)' }}>{inativos}</div>
            <div className="stat-label">Inativos</div>
          </div>
          <div className="stat-card" style={{ padding: '14px 18px' }}>
            <div className="stat-value" style={{ fontSize: 18, color: 'var(--green)' }}>{BRL(totalCredito)}</div>
            <div className="stat-label">Crédito total</div>
          </div>
        </div>

        {/* Busca */}
        <div className="gap-row mb-16">
          <div className="search-wrap" style={{ flex: 1 }}>
            <span className="search-ico">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, celular ou email…"
              style={{ maxWidth: '100%' }}
            />
          </div>
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>✕ Limpar</button>
          )}
        </div>

        {/* Tabela */}
        <div className="card">
          {loading ? (
            <div className="loader"><div className="spin" /> Carregando…</div>
          ) : list.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👤</div>
              <div className="empty-title">Nenhum cliente encontrado</div>
              <div className="empty-sub">Clique em "+ Novo Cliente" para começar</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Celular</th>
                    <th>Tipo</th>
                    <th>Administradora</th>
                    <th>Grupo / Cota</th>
                    <th>Crédito</th>
                    <th>Parcela</th>
                    <th>Status</th>
                    <th>Cadastrado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(c => {
                    const sc = STATUS_COLORS[c.status] || {};
                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="fw-600">{c.nome}</div>
                          {c.email && <div style={{ fontSize: 11, color: 'var(--text-300)' }}>{c.email}</div>}
                        </td>
                        <td className="td-mono td-muted">{c.celular || '—'}</td>
                        <td>{TIPO_LABEL[c.tipo] || c.tipo || '—'}</td>
                        <td className="td-muted">{c.administradora || '—'}</td>
                        <td className="td-mono td-muted">{c.grupo || '—'} / {c.cota || '—'}</td>
                        <td className="text-green font-mono fw-600">{BRL(c.valor_credito)}</td>
                        <td className="td-mono td-muted">{BRL(c.parcela)}</td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.text }}>
                            <span className="badge-dot" />
                            {c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="td-muted">{fDate(c.criado_em?.split(' ')[0])}</td>
                        <td>
                          <div className="td-actions">
                            <button className="btn btn-ghost btn-xs btn-icon" title="Editar" onClick={() => setModal(c)}>✏️</button>
                            <button
                              className="btn btn-danger btn-xs btn-icon" title="Excluir"
                              disabled={deleting === c.id}
                              onClick={() => handleDelete(c.id)}
                            >🗑️</button>
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
          <ClienteModal
            cliente={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); load(search); }}
          />
        )}
      </div>
    );
  }
