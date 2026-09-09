import React, { useState, useEffect } from 'react';
import { Company } from '../types';
import { companyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X, 
  AlertCircle,
  Users,
  Ticket
} from 'lucide-react';

export const CompaniesManagement: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.list();
      setCompanies(data);
    } catch (e) {
      console.error('Erro ao carregar empresas:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setName('');
    setCnpj('');
    setEmail('');
    setPhone('');
    setIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Company) => {
    setEditingCompany(c);
    setName(c.name);
    setCnpj(c.cnpj || '');
    setEmail(c.email || '');
    setPhone(c.phone || '');
    setIsActive(c.is_active);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!name.trim()) {
      setModalError('Razão Social / Nome da empresa é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCompany) {
        await companyService.update(editingCompany.id, {
          name: name.trim(),
          cnpj: cnpj.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          is_active: isActive
        });
      } else {
        await companyService.create({
          name: name.trim(),
          cnpj: cnpj.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          is_active: isActive
        });
      }

      setIsModalOpen(false);
      loadCompanies();
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err);
      setModalError(err.response?.data?.detail || 'Erro ao processar requisição.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (c: Company) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${c.name}" e todos os seus chamados e usuários associados?`)) return;
    try {
      await companyService.delete(c.id);
      loadCompanies();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir empresa.');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center text-slate-400">
        Acesso restrito ao Super Administrador Geral.
      </div>
    );
  }

  const filteredCompanies = companies.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.cnpj && c.cnpj.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razão social, CNPJ ou e-mail..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Empresa</span>
        </button>
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          Carregando empresas...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((c) => (
            <div 
              key={c.id} 
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {c.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <XCircle className="w-3 h-3" /> Inativa
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-white text-base mb-1">{c.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{c.cnpj || 'CNPJ não informado'}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  {c.email && <p className="truncate">📧 {c.email}</p>}
                  {c.phone && <p>📞 {c.phone}</p>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {c.users_count || 0} usuários
                  </span>
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    {c.tickets_count || 0} chamados
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingCompany ? 'Editar Empresa' : 'Cadastrar Empresa'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 pt-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Razão Social / Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Minha Empresa S.A."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Empresa Ativa (Usuários vinculados conseguem acessar)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {submitting ? 'Salvando...' : 'Salvar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
