import React from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, CircleDot, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case 'OPEN':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Aberto</span>;
    case 'IN_PROGRESS':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">Em Andamento</span>;
    case 'PENDING':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Pendente</span>;
    case 'RESOLVED':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">Resolvido</span>;
    case 'CLOSED':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/30">Fechado</span>;
  }
};

export const getPriorityBadge = (priority: TicketPriority) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          <AlertCircle className="w-3 h-3" /> Urgente
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
          Alta
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Média
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          Baixa
        </span>
      );
  }
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const { isSuperAdmin } = useAuth();

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between"
    >
      <div>
        {/* Header: Code, Status & Priority */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              {ticket.code}
            </span>
            {getPriorityBadge(ticket.priority)}
          </div>
          {getStatusBadge(ticket.status)}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-base line-clamp-2 mb-2">
          {ticket.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
        {/* Category & Company (if Super Admin) */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          {ticket.category && (
            <span 
              className="px-2 py-0.5 rounded-md font-medium text-white/90"
              style={{ backgroundColor: `${ticket.category.color}25`, border: `1px solid ${ticket.category.color}50`, color: ticket.category.color }}
            >
              {ticket.category.name}
            </span>
          )}
          {isSuperAdmin && ticket.company && (
            <span className="flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
              <Building2 className="w-3 h-3 text-slate-500" />
              {ticket.company.name}
            </span>
          )}
        </div>

        {/* Creator / Assignee & Time */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{ticket.creator?.full_name || 'Usuário'}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1 text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              {ticket.comments_count || 0}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Clock className="w-3 h-3" />
              {formatDate(ticket.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
