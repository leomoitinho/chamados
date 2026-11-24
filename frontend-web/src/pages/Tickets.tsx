import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, Category, Company } from '../types';
import { ticketService, categoryService, companyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TicketCard, getStatusBadge, getPriorityBadge } from '../components/tickets/TicketCard';
import { KanbanBoard } from '../components/tickets/KanbanBoard';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Building2, 
  User, 
  MessageSquare, 
  Clock, 
  RotateCcw
} from 'lucide-react';

interface TicketsProps {
  onSelectTicket: (id: number) => void;
  onOpenNewTicket: () => void;
  initialStatus?: string;
  initialPriority?: string;
  initialCompany?: string;
  initialMyTickets?: boolean;
}

export const Tickets: React.FC<TicketsProps> = ({ 
  onSelectTicket, 
  onOpenNewTicket,
  initialStatus,
  initialPriority,
  initialCompany,
  initialMyTickets,
}) => {
  const { user, isSuperAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || '');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany || '');
  const [onlyMyTickets, setOnlyMyTickets] = useState(!!initialMyTickets);

  useEffect(() => {
    if (initialStatus !== undefined) setSelectedStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (initialPriority !== undefined) setSelectedPriority(initialPriority);
  }, [initialPriority]);

  useEffect(() => {
    if (initialCompany !== undefined) setSelectedCompany(initialCompany);
  }, [initialCompany]);

  useEffect(() => {
    if (initialMyTickets !== undefined) setOnlyMyTickets(initialMyTickets);
  }, [initialMyTickets]);

  useEffect(() => {
    loadAuxData();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [selectedStatus, selectedPriority, selectedCategory, selectedCompany, onlyMyTickets]);

  const loadAuxData = async () => {
    try {
      const cats = await categoryService.list();
      setCategories(cats);

      if (isSuperAdmin) {
        const comps = await companyService.list();
        setCompanies(comps);
      }
    } catch (e) {
      console.error('Erro ao carregar dados auxiliares:', e);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;
      if (selectedCategory) params.category_id = Number(selectedCategory);
      if (selectedCompany && isSuperAdmin) params.company_id = Number(selectedCompany);
      if (onlyMyTickets) params.my_tickets = true;
      if (searchTerm) params.search = searchTerm;

      const data = await ticketService.list(params);
      setTickets(data);
    } catch (e) {
      console.error('Erro ao listar chamados:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedCategory('');
    setSelectedCompany('');
    setOnlyMyTickets(false);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Action Controls */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, título ou descrição..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          {/* View Toggle & New Ticket Button */}
          <div className="flex items-center gap-3">
            <div className="p-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>

            <button
              onClick={onOpenNewTicket}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Chamado</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800/80 text-xs">
          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:border-indigo-500"
          >
            <option value="">Todos os Status</option>
            <option value="OPEN">Aberto</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="PENDING">Pendente</option>
            <option value="RESOLVED">Resolvido</option>
            <option value="CLOSED">Fechado</option>
          </select>

          {/* Prioridade */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:border-indigo-500"
          >
            <option value="">Todas as Prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>

          {/* Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:border-indigo-500"
          >
            <option value="">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Empresa (Se Super Admin) */}
          {isSuperAdmin && (
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 focus:border-indigo-500"
            >
              <option value="">🏢 Todas as Empresas</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
          )}

          {/* Meus Chamados Toggle */}
          <button
            type="button"
            onClick={() => setOnlyMyTickets(!onlyMyTickets)}
            className={`px-2.5 py-1.5 rounded-lg font-medium border text-center transition-colors ${
              onlyMyTickets 
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {onlyMyTickets ? '✓ Apenas Meus' : 'Apenas Meus'}
          </button>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          Carregando chamados...
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <p className="text-slate-400 text-sm">Nenhum chamado corresponde aos filtros selecionados.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tickets={tickets}
          onSelectTicket={onSelectTicket}
        />
      ) : (
        /* Table List View */
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Título</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Prioridade</th>
                {isSuperAdmin && <th className="py-3 px-4 font-semibold">Empresa</th>}
                <th className="py-3 px-4 font-semibold">Solicitante</th>
                <th className="py-3 px-4 font-semibold">Responsável</th>
                <th className="py-3 px-4 font-semibold text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tickets.map((t) => (
                <tr 
                  key={t.id} 
                  onClick={() => onSelectTicket(t.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                    {t.code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                    {t.title}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getPriorityBadge(t.priority)}
                  </td>
                  {isSuperAdmin && (
                    <td className="py-3.5 px-4 text-slate-300">
                      {t.company?.name || 'N/A'}
                    </td>
                  )}
                  <td className="py-3.5 px-4 text-slate-300">
                    {t.creator?.full_name || 'Desconhecido'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {t.assigned_to?.full_name || <span className="italic text-slate-600">Não atribuído</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-right font-mono">
                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
