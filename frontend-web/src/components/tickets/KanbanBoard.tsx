import React from 'react';
import { Ticket, TicketStatus } from '../../types';
import { TicketCard } from './TicketCard';
import { CircleDot, PlayCircle, Clock, CheckCircle, Archive } from 'lucide-react';

interface KanbanBoardProps {
  tickets: Ticket[];
  onSelectTicket: (id: number) => void;
}

interface ColumnConfig {
  status: TicketStatus;
  label: string;
  icon: React.ElementType;
  borderColor: string;
  badgeColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { status: 'OPEN', label: 'Aberto', icon: CircleDot, borderColor: 'border-emerald-500/30', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { status: 'IN_PROGRESS', label: 'Em Andamento', icon: PlayCircle, borderColor: 'border-blue-500/30', badgeColor: 'bg-blue-500/20 text-blue-400' },
  { status: 'PENDING', label: 'Pendente', icon: Clock, borderColor: 'border-amber-500/30', badgeColor: 'bg-amber-500/20 text-amber-400' },
  { status: 'RESOLVED', label: 'Resolvido', icon: CheckCircle, borderColor: 'border-indigo-500/30', badgeColor: 'bg-indigo-500/20 text-indigo-400' },
  { status: 'CLOSED', label: 'Fechado', icon: Archive, borderColor: 'border-slate-600/30', badgeColor: 'bg-slate-700/50 text-slate-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, onSelectTicket }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start min-w-[900px]">
      {COLUMNS.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.status);
        const Icon = col.icon;
        
        return (
          <div 
            key={col.status}
            className="rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col max-h-[calc(100vh-250px)]"
          >
            {/* Column Header */}
            <div className={`p-4 border-b border-slate-800 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">{col.label}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeColor}`}>
                {colTickets.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[150px]">
              {colTickets.length > 0 ? (
                colTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => onSelectTicket(ticket.id)}
                  />
                ))
              ) : (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl text-xs text-slate-600">
                  Nenhum chamado
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
