import React, { useState, useEffect } from 'react';
import { DashboardMetrics, Ticket } from '../types';
import { dashboardService, ticketService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TicketCard } from '../components/tickets/TicketCard';
import { 
  Ticket as TicketIcon, 
  CircleDot, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Users, 
  TrendingUp,
  ArrowRight,
  Flame,
  BellRing,
  ExternalLink
} from 'lucide-react';

interface DashboardProps {
  onSelectTicket: (id: number) => void;
  onNavigateToTickets: (filters?: { status?: string; priority?: string; company?: string; my_tickets?: boolean }) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTicket, onNavigateToTickets }) => {
  const { user, isSuperAdmin } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [m, t] = await Promise.all([
        dashboardService.getMetrics(),
        ticketService.list({ limit: 6 })
      ]);
      setMetrics(m);
      setRecentTickets(t);
    } catch (e) {
      console.error('Erro ao carregar dados do dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banners de Atenção Imediata (Chamados Atribuídos & SLA Estourando) */}
      {((metrics?.assigned_to_me_count || 0) > 0 || (metrics?.overdue_sla_count || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card: Meus Chamados Pendentes */}
          {(metrics?.assigned_to_me_count || 0) > 0 && (
            <div 
              onClick={() => onNavigateToTickets({ my_tickets: true })}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer shadow-lg shadow-indigo-950/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/30 group-hover:scale-105 transition-transform">
                  <BellRing className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Você tem {metrics?.assigned_to_me_count} chamado(s) atribuído(s)
                  </h4>
                  <p className="text-xs text-slate-300">
                    Aguardando seu atendimento técnico ou resposta
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 pl-2">
                <span>Ver Meus</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          )}

          {/* Card: Alerta de SLA Estourado / Atrasado */}
          {(metrics?.overdue_sla_count || 0) > 0 && (
            <div 
              onClick={() => onNavigateToTickets({ priority: 'URGENT' })}
              className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/40 hover:border-rose-400 cursor-pointer shadow-lg shadow-rose-950/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30 group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-200 flex items-center gap-2">
                    ⚠️ Atenção: {metrics?.overdue_sla_count} chamado(s) com SLA Estourado!
                  </h4>
                  <p className="text-xs text-rose-300/80">
                    Tempo limite de atendimento extrapolado. Requer ação imediata.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-400 group-hover:text-rose-300 flex items-center gap-1 pl-2">
                <span>Priorizar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          )}

        </div>
      )}

      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            {isSuperAdmin ? 'Painel de Controle Central' : `Empresa: ${user?.company?.name || 'Geral'}`}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Olá, {user?.full_name}! 👋
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {isSuperAdmin 
              ? 'Você possui visão global de todas as empresas integradas, controle de chamados, técnicos e SLAs de atendimento.' 
              : 'Acompanhe o andamento dos chamados e interações técnicas da sua organização em tempo real.'}
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid - Clicáveis */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div 
          onClick={() => onNavigateToTickets()}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
          title="Clique para ver todos os chamados"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-wider transition-colors">Total</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{metrics?.total_tickets || 0}</span>
          <span className="text-[11px] text-slate-500 group-hover:text-slate-400 mt-1 flex items-center justify-between">
            <span>Todos registrados</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>

        {/* Abertos */}
        <div 
          onClick={() => onNavigateToTickets({ status: 'OPEN' })}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
          title="Clique para filtrar chamados Abertos"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Abertos</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CircleDot className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{metrics?.open_tickets || 0}</span>
          <span className="text-[11px] text-slate-500 group-hover:text-emerald-300 mt-1 flex items-center justify-between">
            <span>Aguardando atendimento</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>

        {/* Em Andamento */}
        <div 
          onClick={() => onNavigateToTickets({ status: 'IN_PROGRESS' })}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-blue-950/20 border border-slate-800 hover:border-blue-500/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
          title="Clique para filtrar chamados Em Andamento"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Em Andamento</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-400">{metrics?.in_progress_tickets || 0}</span>
          <span className="text-[11px] text-slate-500 group-hover:text-blue-300 mt-1 flex items-center justify-between">
            <span>Com técnico atribuído</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>

        {/* Pendentes */}
        <div 
          onClick={() => onNavigateToTickets({ status: 'PENDING' })}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-amber-950/20 border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
          title="Clique para filtrar chamados Pendentes"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pendentes</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">{metrics?.pending_tickets || 0}</span>
          <span className="text-[11px] text-slate-500 group-hover:text-amber-300 mt-1 flex items-center justify-between">
            <span>Aguardando resposta</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>

        {/* Resolvidos */}
        <div 
          onClick={() => onNavigateToTickets({ status: 'RESOLVED' })}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-indigo-950/20 border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
          title="Clique para filtrar chamados Resolvidos"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Resolvidos</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400">{metrics?.resolved_tickets || 0}</span>
          <span className="text-[11px] text-slate-500 group-hover:text-indigo-300 mt-1 flex items-center justify-between">
            <span>Solucionados</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>

        {/* Urgentes */}
        <div 
          onClick={() => onNavigateToTickets({ priority: 'URGENT' })}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/50 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
          title="Clique para filtrar chamados Críticos/Urgentes"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Urgentes</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-400">{metrics?.urgent_tickets || 0}</span>
          <span className="text-[11px] text-slate-500 group-hover:text-rose-300 mt-1 flex items-center justify-between">
            <span>Críticos com prioridade</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </div>

      {/* Super Admin Special Section: Companies Breakdown */}
      {isSuperAdmin && metrics?.companies_summary && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Status por Empresa (Multi-Tenant)</h3>
                <p className="text-xs text-slate-400">Clique em qualquer empresa para ver e gerenciar seus chamados</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {metrics.total_companies} Empresas Ativas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4 font-semibold">Empresa</th>
                  <th className="py-3 px-4 font-semibold">Total de Chamados</th>
                  <th className="py-3 px-4 font-semibold">Em Aberto / Andamento</th>
                  <th className="py-3 px-4 font-semibold">Resolvidos</th>
                  <th className="py-3 px-4 font-semibold text-right">Taxa de Resolução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.companies_summary.map((c) => {
                  const rate = c.total_tickets > 0 ? Math.round((c.resolved_tickets / c.total_tickets) * 100) : 0;
                  return (
                    <tr 
                      key={c.company_id} 
                      onClick={() => onNavigateToTickets({ company: String(c.company_id) })}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      title={`Ver chamados da empresa ${c.company_name}`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2 group-hover:text-indigo-300">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        {c.company_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{c.total_tickets}</td>
                      <td className="py-3.5 px-4 text-amber-400 font-mono font-semibold">{c.open_tickets}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-mono font-semibold">{c.resolved_tickets}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all" 
                              style={{ width: `${rate}%` }} 
                            />
                          </div>
                          <span className="font-mono text-slate-300">{rate}%</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors ml-1" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Tickets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Chamados Recentes</h3>
            <p className="text-xs text-slate-400">Últimas solicitações registradas no sistema</p>
          </div>
          <button
            onClick={() => onNavigateToTickets()}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Ver todos os chamados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onSelectTicket(ticket.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 text-slate-500 text-sm">
            Nenhum chamado encontrado. Clique em "Novo Chamado" para começar.
          </div>
        )}
      </div>
    </div>
  );
};
