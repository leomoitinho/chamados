import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, User as UserType } from '../../types';
import { ticketService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadge, getPriorityBadge } from './TicketCard';
import { 
  X, 
  Send, 
  User, 
  Building2, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Trash2, 
  ShieldAlert,
  Calendar
} from 'lucide-react';

interface TicketDetailModalProps {
  ticketId: number | null;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ 
  ticketId, 
  onClose, 
  onTicketUpdated 
}) => {
  const { user, isSuperAdmin, isCompanyAdmin } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [technicians, setTechnicians] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<TicketStatus | null>(null);

  const fetchDetails = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const data = await ticketService.getById(ticketId);
      setTicket(data);
      
      // Load users for assignee selection if admin
      // include_super_admins=true para SuperAdmins aparecerem como opção de técnico
      if (isSuperAdmin || isCompanyAdmin) {
        const usersList = await userService.list(data.company_id, true);
        setTechnicians(usersList);
      }
    } catch (e) {
      console.error('Erro ao carregar detalhes do chamado:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [ticketId]);

  if (!ticketId) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !ticket) return;

    try {
      setSubmittingComment(true);
      await ticketService.addComment(ticket.id, commentText, isInternal);
      setCommentText('');
      setIsInternal(false);
      await fetchDetails();
      onTicketUpdated();
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!ticket || !targetStatus) return;
    try {
      await ticketService.updateStatus(ticket.id, targetStatus, statusComment);
      setShowStatusModal(false);
      setStatusComment('');
      setTargetStatus(null);
      await fetchDetails();
      onTicketUpdated();
    } catch (e) {
      console.error('Erro ao alterar status:', e);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    if (!ticket) return;
    try {
      const assignedId = userId ? parseInt(userId) : undefined;
      await ticketService.update(ticket.id, { assigned_to_id: assignedId });
      await fetchDetails();
      onTicketUpdated();
    } catch (e) {
      console.error('Erro ao atribuir técnico:', e);
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!ticket) return;
    try {
      await ticketService.update(ticket.id, { priority });
      await fetchDetails();
      onTicketUpdated();
    } catch (e) {
      console.error('Erro ao mudar prioridade:', e);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket || !window.confirm('Tem certeza que deseja excluir permanentemente este chamado?')) return;
    try {
      await ticketService.delete(ticket.id);
      onTicketUpdated();
      onClose();
    } catch (e) {
      console.error('Erro ao excluir chamado:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800/80">
              {ticket?.code || 'TKT-0000'}
            </span>
            {ticket && getStatusBadge(ticket.status)}
            {ticket && getPriorityBadge(ticket.priority)}
          </div>

          <div className="flex items-center gap-2">
            {(isSuperAdmin || isCompanyAdmin) && (
              <button
                onClick={handleDeleteTicket}
                title="Excluir Chamado"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
            Carregando detalhes do chamado...
          </div>
        ) : ticket ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
            
            {/* Left 2 Cols: Title, Description, Timeline & Message Input */}
            <div className="lg:col-span-2 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-3">{ticket.title}</h2>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>

              {/* Status Actions Bar */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Alterar Status:</span>
                {(['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setTargetStatus(st);
                      setShowStatusModal(true);
                    }}
                    disabled={ticket.status === st}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      ticket.status === st
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {st === 'OPEN' && 'Aberto'}
                    {st === 'IN_PROGRESS' && 'Em Andamento'}
                    {st === 'PENDING' && 'Pendente'}
                    {st === 'RESOLVED' && 'Resolvido'}
                    {st === 'CLOSED' && 'Fechado'}
                  </button>
                ))}
              </div>

              {/* Timeline Messages */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Histórico & Respostas ({ticket.comments?.length || 0})
                </h3>

                <div className="space-y-3">
                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((comment) => (
                      <div 
                        key={comment.id}
                        className={`p-4 rounded-xl border transition-all ${
                          comment.is_internal 
                            ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">
                              {comment.user?.full_name || 'Sistema'}
                            </span>
                            {comment.user?.role === 'SUPER_ADMIN' && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">Super Admin</span>
                            )}
                            {comment.is_internal && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">NOTA INTERNA</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(comment.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhum comentário registrado até o momento.</p>
                  )}
                </div>
              </div>

              {/* Post Comment Input */}
              <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-800">
                <div className="flex flex-col gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escreva uma resposta ou atualização sobre o chamado..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-between">
                    {(isSuperAdmin || isCompanyAdmin) ? (
                      <label className="flex items-center gap-2 text-xs text-amber-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        Nota interna (visível apenas para admins/técnicos)
                      </label>
                    ) : <div />}

                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingComment ? 'Enviando...' : 'Enviar Resposta'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Col: Metadata & Configurations */}
            <div className="p-6 bg-slate-950/40 space-y-5 overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informações do Chamado</h4>
                
                <div className="space-y-3.5 text-xs">
                  {/* Empresa */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Empresa</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      {ticket.company?.name || 'N/A'}
                    </span>
                  </div>

                  {/* Solicitante */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Solicitante</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      {ticket.creator?.full_name || 'Desconhecido'}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{ticket.creator?.email}</span>
                  </div>

                  {/* Responsável Técnico */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Técnico Responsável</span>
                    {(isSuperAdmin || isCompanyAdmin) ? (
                      <select
                        value={ticket.assigned_to_id || ''}
                        onChange={(e) => handleAssigneeChange(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-indigo-500"
                      >
                        <option value="">Não Atribuído</option>
                        {/* SuperAdmins primeiro, separados visualmente */}
                        {technicians.filter(t => t.role === 'SUPER_ADMIN').length > 0 && (
                          <optgroup label="⭐ Super Administradores (Global)">
                            {technicians
                              .filter(t => t.role === 'SUPER_ADMIN')
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  ⭐ {t.full_name}
                                </option>
                              ))}
                          </optgroup>
                        )}
                        {/* Técnicos da empresa */}
                        {technicians.filter(t => t.role !== 'SUPER_ADMIN').length > 0 && (
                          <optgroup label="👤 Técnicos da Empresa">
                            {technicians
                              .filter(t => t.role !== 'SUPER_ADMIN')
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.full_name} ({t.department || t.role})
                                </option>
                              ))}
                          </optgroup>
                        )}
                      </select>
                    ) : (
                      <span className="font-medium text-slate-300">
                        {ticket.assigned_to?.full_name || 'Não atribuído'}
                      </span>
                    )}
                  </div>

                  {/* Prioridade */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Prioridade</span>
                    {(isSuperAdmin || isCompanyAdmin) ? (
                      <select
                        value={ticket.priority}
                        onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-indigo-500"
                      >
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM">Média</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                      </select>
                    ) : (
                      getPriorityBadge(ticket.priority)
                    )}
                  </div>

                  {/* Datas */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Criado em:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(ticket.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {ticket.resolved_at && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Resolvido em:</span>
                        <span className="font-mono">
                          {new Date(ticket.resolved_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Chamado não encontrado.</div>
        )}

        {/* Modal de Observação na Troca de Status */}
        {showStatusModal && targetStatus && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold text-white mb-2">Confirmar Mudança de Status</h3>
              <p className="text-xs text-slate-400 mb-4">
                Deseja alterar o status para <strong>{targetStatus}</strong>? Você pode incluir uma observação que será gravada na timeline.
              </p>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Motivo ou observação da mudança (opcional)..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Confirmar Alteração
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
