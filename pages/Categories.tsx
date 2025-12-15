import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { Category } from '../types';
import { db } from '../services/db';

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getCategories();
    setCategories(data);
  };

  const handleSave = async () => {
    if (!currentCategory.name) return;
    
    await db.saveCategory({
      id: currentCategory.id || '',
      name: currentCategory.name,
      description: currentCategory.description || ''
    });
    
    await loadData();
    setIsEditing(false);
    setCurrentCategory({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      await db.deleteCategory(id);
      await loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500">Organiza tus productos en categorías.</p>
        </div>
        <button 
          onClick={() => { setCurrentCategory({}); setIsEditing(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Descripción</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                      <Tag size={16} />
                    </div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{category.description}</td>
                  <td className="p-4 text-center flex justify-center space-x-2">
                    <button 
                      onClick={() => { setCurrentCategory(category); setIsEditing(true); }}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <h2 className="text-xl font-bold mb-4">{currentCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input 
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCategory.name || ''} 
                    onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})} 
                    placeholder="Ej. Bebidas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea 
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentCategory.description || ''} 
                    onChange={e => setCurrentCategory({...currentCategory, description: e.target.value})}
                    placeholder="Descripción opcional"
                  />
                </div>
             </div>
             <div className="mt-6 flex justify-end space-x-3">
               <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
               <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};