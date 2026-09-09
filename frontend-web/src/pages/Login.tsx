import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Headphones, Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(
        err.response?.data?.detail || 'Falha ao autenticar. Verifique seu e-mail e senha.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 border border-indigo-400/20">
            <Headphones className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          DeskMaster
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sistema Integrado de Chamados Multi-Empresas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-800/80">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <span>{loading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contas de Demonstração (Clique para Preencher):</span>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('superadmin@chamados.com', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-amber-300 block">👑 Super Admin Geral</span>
                  <span className="text-slate-500 text-[11px]">superadmin@chamados.com (Acesso Global)</span>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-[11px] font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin.tech@empresa1.com', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-indigo-300 block">🏢 Admin Tech Solutions (Empresa 1)</span>
                  <span className="text-slate-500 text-[11px]">admin.tech@empresa1.com (Cria usuários Empresa 1)</span>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-[11px] font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('mariana.vendas@empresa1.com', 'user123')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-slate-300 block">👤 Usuário Tech Solutions (Empresa 1)</span>
                  <span className="text-slate-500 text-[11px]">mariana.vendas@empresa1.com (Abre chamados)</span>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-[11px] font-mono">user123</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin.acme@empresa2.com', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-semibold text-emerald-300 block">🏢 Admin Acme Logística (Empresa 2)</span>
                  <span className="text-slate-500 text-[11px]">admin.acme@empresa2.com (Isolamento Empresa 2)</span>
                </div>
                <span className="text-slate-500 group-hover:text-indigo-400 text-[11px] font-mono">admin123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
