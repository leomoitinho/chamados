import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Tags, Plus, Trash2, Edit, X, AlertCircle } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { isSuperAdmin, isCompanyAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const PRESET_COLORS = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', 
    '#F59E0B', '#10B981', '#06B6D4', '#64748B'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.list();
      setCategories(data);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      if (editingCategory) {
        await categoryService.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color
        });
      } else {
        await categoryService.create({
          name: name.trim(),
          description: description.trim() || undefined,
          color
        });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Excluir a categoria "${cat.name}"?`)) return;
    try {
      await categoryService.delete(cat.id);
      loadCategories();
    } catch (e) {
      console.error('Erro ao excluir categoria:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Categorias de Atendimento</h3>
          <p className="text-xs text-slate-400">Classifique as áreas de chamados (TI, Sistemas, Manutenção, etc.)</p>
        </div>

        {(isSuperAdmin || isCompanyAdmin) && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          Carregando categorias...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  />
                  {(isSuperAdmin || isCompanyAdmin) && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-white text-base mb-1">{cat.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{cat.description || 'Sem descrição'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Nova Categoria</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 pt-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Suporte de Redes"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da finalidade desta categoria..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-2">Cor do Badge</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
