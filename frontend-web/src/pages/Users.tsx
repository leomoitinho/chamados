import React, { useState, useEffect } from 'react';
import { User, UserRole, Company } from '../types';
import { userService, companyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  Trash2, 
  Edit, 
  X, 
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const { user: loggedInUser, isSuperAdmin, isCompanyAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('COMPANY_USER');
  const [companyId, setCompanyId] = useState<number | undefined>(loggedInUser?.company_id || undefined);
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCompanyFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const compFilter = selectedCompanyFilter ? Number(selectedCompanyFilter) : undefined;
      const [uList, cList] = await Promise.all([
        userService.list(compFilter),
        isSuperAdmin ? companyService.list() : Promise.resolve([])
      ]);
      setUsers(uList);
      setCompanies(cList);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('COMPANY_USER');
    setCompanyId(loggedInUser?.company_id || (companies[0]?.id));
    setDepartment('');
    setPhone('');
    setIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFullName(u.full_name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setCompanyId(u.company_id || undefined);
    setDepartment(u.department || '');
    setPhone(u.phone || '');
    setIsActive(u.is_active);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!fullName.trim() || !email.trim()) {
      setModalError('Nome e E-mail são obrigatórios.');
      return;
    }

    if (!editingUser && !password.trim()) {
      setModalError('Senha é obrigatória para criação de novos usuários.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        // Update
        const payload: any = {
          full_name: fullName.trim(),
          email: email.trim(),
          role,
          department: department.trim(),
          phone: phone.trim(),
          is_active: isActive
        };
        if (password.trim()) payload.password = password.trim();
        if (isSuperAdmin) payload.company_id = companyId;

        await userService.update(editingUser.id, payload);
      } else {
        // Create
        await userService.create({
          full_name: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          company_id: isSuperAdmin ? companyId : loggedInUser?.company_id,
          department: department.trim(),
          phone: phone.trim(),
          is_active: isActive
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setModalError(err.response?.data?.detail || 'Erro ao processar requisição.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${u.full_name}"?`)) return;
    try {
      await userService.delete(u.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir usuário.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.department && u.department.toLowerCase().includes(term))
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
            placeholder="Buscar por nome, e-mail ou setor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 focus:border-indigo-500"
            >
              <option value="">🏢 Todas as Empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          Carregando usuários...
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4 font-semibold">Nome Completo</th>
                <th className="py-3 px-4 font-semibold">E-mail</th>
                <th className="py-3 px-4 font-semibold">Papel (Role)</th>
                {isSuperAdmin && <th className="py-3 px-4 font-semibold">Empresa</th>}
                <th className="py-3 px-4 font-semibold">Departamento</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {u.full_name.charAt(0)}
                    </div>
                    <span>{u.full_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.role === 'SUPER_ADMIN' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Super Admin
                      </span>
                    )}
                    {u.role === 'COMPANY_ADMIN' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        Admin Empresa
                      </span>
                    )}
                    {u.role === 'COMPANY_USER' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        Usuário Comum
                      </span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td className="py-3.5 px-4 text-slate-300">
                      {u.company?.name || <span className="text-amber-400 italic">Global (Sem empresa)</span>}
                    </td>
                  )}
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.department || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.id !== loggedInUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Senha {editingUser ? '(deixe em branco para não alterar)' : '*'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Papel / Nível de Acesso</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="COMPANY_USER">Usuário Comum</option>
                    <option value="COMPANY_ADMIN">Admin da Empresa</option>
                    {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin Geral</option>}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Empresa</label>
                    <select
                      value={companyId || ''}
                      onChange={(e) => setCompanyId(Number(e.target.value) || undefined)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Nenhuma (Global / Master)</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Departamento / Setor</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ex: TI, Vendas, RH"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Telefone / Ramal</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
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
                  <span>Usuário Ativo (Pode fazer login no sistema)</span>
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
                  {submitting ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
