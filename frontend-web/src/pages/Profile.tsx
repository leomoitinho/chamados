import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Lock, Building2, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, refreshUser, isSuperAdmin, isCompanyAdmin } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      await authService.updateMe(payload);
      await refreshUser();
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.response?.data?.detail || 'Erro ao salvar alterações do perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                <Shield className="w-3 h-3" />
                {user?.role === 'SUPER_ADMIN' ? 'Super Administrador Geral' : user?.role === 'COMPANY_ADMIN' ? 'Admin da Empresa' : 'Usuário Comum'}
              </span>
              {user?.company && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {user.company.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-6 space-y-5 text-xs">
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Perfil atualizado com sucesso!</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Nome Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">E-mail (Não editável)</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Departamento / Setor</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex: Comercial, TI, Operações"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              Alterar Senha de Acesso
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para manter a atual"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando alterações...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
