import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { Category, Company, TicketPriority } from '../../types';
import { ticketService, categoryService, companyService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onTicketCreated 
}) => {
  const { user, isSuperAdmin, isCompanyAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [companyId, setCompanyId] = useState<number | undefined>(user?.company_id || undefined);
  const [assignedToId, setAssignedToId] = useState<number | undefined>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (isSuperAdmin || isCompanyAdmin)) {
      loadTechnicians(isSuperAdmin ? companyId : user?.company_id || undefined);
    }
  }, [isOpen, companyId]);

  const loadTechnicians = async (targetCompanyId?: number) => {
    try {
      const usersList = await userService.list(targetCompanyId, true);
      setTechnicians(usersList);
    } catch (e) {
      console.error('Erro ao carregar técnicos:', e);
    }
  };

  const loadInitialData = async () => {
    try {
      const cats = await categoryService.list();
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }

      if (isSuperAdmin) {
        const comps = await companyService.list();
        setCompanies(comps);
        if (comps.length > 0 && !companyId) {
          setCompanyId(comps[0].id);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar categorias/empresas:', e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha o título e a descrição do chamado.');
      return;
    }

    if (isSuperAdmin && !companyId) {
      setError('Super Administrador deve selecionar a empresa do chamado.');
      return;
    }

    try {
      setSubmitting(true);
      await ticketService.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: categoryId,
        company_id: isSuperAdmin ? companyId : undefined,
        assigned_to_id: (isSuperAdmin || isCompanyAdmin) ? assignedToId : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssignedToId(undefined);
      onTicketCreated();
      onClose();
    } catch (err: any) {
      console.error('Erro ao criar chamado:', err);
      setError(err.response?.data?.detail || 'Ocorreu um erro ao abrir o chamado.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Abrir Novo Chamado</h3>
              <p className="text-xs text-slate-400">Preencha as informações para registrar uma nova solicitação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Empresa (Super Admin Only) */}
          {isSuperAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Empresa do Chamado *
              </label>
              <select
                value={companyId || ''}
                onChange={(e) => setCompanyId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.cnpj || 'Sem CNPJ'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título do Chamado *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lentidão no acesso ao sistema / Impressora não responde"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria / Departamento
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nível de Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Baixa (Dúvidas rotineiras)</option>
                <option value="MEDIUM">Média (Impacto individual com contorno)</option>
                <option value="HIGH">Alta (Dificulta operação de setor)</option>
                <option value="URGENT">Urgente (Paralisação total do serviço)</option>
              </select>
            </div>
          </div>

          {/* Técnico Responsável (Para Super Admin ou Admin de Empresa) */}
          {(isSuperAdmin || isCompanyAdmin) && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Atribuir Técnico Responsável (Opcional)
              </label>
              <select
                value={assignedToId || ''}
                onChange={(e) => setAssignedToId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Não atribuído no momento</option>
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
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrição Detalhada do Problema *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o ocorrido, mensagens de erro e passos para reproduzir..."
              rows={5}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              required
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Abrindo chamado...' : 'Criar Chamado'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
