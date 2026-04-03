// pages/Dashboard.jsx — Dashboard profissional com métricas e gráfico de barras
import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { BRL, fDate, fDateTime, initials, STATUS_COLORS, TIPO_LABEL } from '../utils/format';

function StatCard({ icon, label, value, sub, color = 'accent', trend }) {
  const colors = {
    accent: { ico: 'var(--accent-pale)', txt: 'var(--accent)' },
    green:  { ico: 'var(--green-bg)',    txt: 'var(--green)'  },
    yellow: { ico: 'var(--yellow-bg)',   txt: 'var(--yellow)' },
    purple: { ico: 'var(--purple-bg)',   txt: 'var(--purple)' },
    red:    { ico: 'var(--red-bg)',      txt: 'var(--red)'    },
  };
  const c = colors[color] || colors.accent;
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon-wrap" style={{ background: c.ico }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        {trend != null && (
          <span className="stat-trend" style={{ background: c.ico, color: c.txt }}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="empty" style={{ padding: '24px 0' }}>
      <div className="empty-icon" style={{ fontSize: 24 }}>📊</div>
      <div className="empty-sub">Nenhuma venda nos últimos 6 meses</div>
    </div>;
  }
  const max = Math.max(...data.map(d => d.total), 1);
  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return (
    <div style={{ paddingTop: 8 }}>
      {data.map((d, i) => {
        const [y, m] = d.mes.split('-');
        const label = `${monthNames[parseInt(m) - 1]}/${y?.slice(2)}`;
        const pct = (d.total / max) * 100;
        return (
          <div key={i} className="chart-bar-row">
            <div className="chart-bar-label">{label}</div>
            <div className="chart-bar-track">
              <div className="chart-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="chart-bar-value">{BRL(d.total)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spin" /> Carregando dashboard…</div>;

  if (error) return (
    <div className="empty">
      <div className="empty-icon">⚠️</div>
      <div className="empty-title">Erro ao conectar</div>
      <div className="empty-sub">{error}</div>
      <div className="empty-sub" style={{ marginTop: 8 }}>Verifique se o backend está rodando em localhost:3001</div>
    </div>
  );

  const d = data || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats principais */}
      <div className="stats-row">
        <StatCard icon="👥" label="Clientes" value={d.totalClientes ?? 0}
          sub={`${d.clientesAtivos ?? 0} ativos`} color="accent" />
        <StatCard icon="💰" label="Total em Vendas" value={BRL(d.valorTotalVendas)}
          sub={`${d.totalVendas ?? 0} vendas`} color="green" />
        <StatCard icon="🏆" label="Comissão Total" value={BRL(d.comissaoTotal)}
          sub="Acumulado" color="yellow" />
        <StatCard icon="🎯" label="Lances" value={d.totalLances ?? 0}
          sub={`${d.lancesGanhos ?? 0} ganhos`} color="purple" />
      </div>

      {/* Grid: gráfico + últimas vendas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Gráfico de vendas */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📈 Vendas por mês</div>
            <span style={{ fontSize: 11, color: 'var(--text-300)' }}>Últimos 6 meses</span>
          </div>
          <div className="card-body">
            <BarChart data={d.vendasMes} />
          </div>
        </div>

        {/* Últimas vendas */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">💳 Últimas vendas</div>
          </div>
          {(!d.ultimasVendas?.length) ? (
            <div className="empty" style={{ padding: '32px 0' }}>
              <div className="empty-icon" style={{ fontSize: 24 }}>💰</div>
              <div className="empty-sub">Nenhuma venda registrada</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {d.ultimasVendas.map(v => (
                    <tr key={v.id}>
                      <td className="fw-600">{v.cliente_nome || '—'}</td>
                      <td className="text-green font-mono">{BRL(v.valor_venda)}</td>
                      <td className="td-muted">{fDate(v.data_venda)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Últimos clientes */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 Últimos clientes</div>
          <span style={{ fontSize: 12, color: 'var(--text-300)' }}>{d.ultimosClientes?.length ?? 0} registros</span>
        </div>
        {(!d.ultimosClientes?.length) ? (
          <div className="empty" style={{ padding: '32px 0' }}>
            <div className="empty-icon" style={{ fontSize: 24 }}>👤</div>
            <div className="empty-sub">Nenhum cliente cadastrado</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Celular</th>
                  <th>Tipo</th>
                  <th>Crédito</th>
                  <th>Status</th>
                  <th>Cadastrado em</th>
                </tr>
              </thead>
              <tbody>
                {d.ultimosClientes.map(c => {
                  const sc = STATUS_COLORS[c.status] || {};
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="gap-row">
                          <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                            {initials(c.nome)}
                          </div>
                          <span className="fw-600">{c.nome}</span>
                        </div>
                      </td>
                      <td className="td-mono td-muted">{c.celular || '—'}</td>
                      <td>{TIPO_LABEL[c.tipo] || c.tipo || '—'}</td>
                      <td className="text-green font-mono">{BRL(c.valor_credito)}</td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.text }}>
                          <span className="badge-dot" />
                          {c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="td-muted">{fDateTime(c.criado_em)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
