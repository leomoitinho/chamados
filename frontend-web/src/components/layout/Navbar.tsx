import React from 'react';
import { Menu, Plus, Bell, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setIsMobileOpen: (open: boolean) => void;
  onOpenNewTicket: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setIsMobileOpen, 
  onOpenNewTicket 
}) => {
  const { user, isSuperAdmin } = useAuth();

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Visão Geral & Indicadores';
      case 'tickets': return 'Painel de Chamados';
      case 'users': return 'Gestão de Usuários';
      case 'companies': return 'Gestão de Empresas (Multi-Tenant)';
      case 'categories': return 'Categorias & Departamentos';
      case 'profile': return 'Meu Perfil & Preferências';
      default: return 'DeskMaster';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            {isSuperAdmin 
              ? 'Painel Administrativo Master' 
              : `Empresa: ${user?.company?.name || 'Geral'}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Ticket Action */}
        <button
          onClick={onOpenNewTicket}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Chamado</span>
        </button>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
