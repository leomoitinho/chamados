import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Building2, 
  Tags, 
  UserCircle, 
  LogOut, 
  ShieldCheck, 
  Headphones,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const { user, logout, isSuperAdmin, isCompanyAdmin, canManageUsers, canManageCompanies } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', name: 'Chamados', icon: Ticket },
    ...(canManageUsers ? [{ id: 'users', name: 'Usuários', icon: Users }] : []),
    ...(canManageCompanies ? [{ id: 'companies', name: 'Empresas', icon: Building2 }] : []),
    ...(isSuperAdmin || isCompanyAdmin ? [{ id: 'categories', name: 'Categorias', icon: Tags }] : []),
    { id: 'profile', name: 'Meu Perfil', icon: UserCircle },
  ];

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
        </span>
      );
    }
    if (isCompanyAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Admin Empresa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/60 text-slate-300">
        Usuário
      </span>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                DeskMaster <span className="text-xs font-normal text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400">Help Desk Multi-Empresas</p>
            </div>
          </div>
        </div>

        {/* User Scoped Company Info */}
        <div className="px-5 py-4 mx-3 my-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ambiente</span>
            {getRoleBadge()}
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {isSuperAdmin ? '🌐 Todas as Empresas (Global)' : (user?.company?.name || 'Minha Empresa')}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{user?.full_name}</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-200" />}
              </button>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
