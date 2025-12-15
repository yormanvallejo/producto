import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, Edit2, TrendingUp } from 'lucide-react';
import { Product, Category } from '../types';
import { db } from '../services/db';

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setProducts(await db.getProducts());
    setCategories(await db.getCategories());
  };

  const handleSave = async () => {
    if (!currentProduct.name || !currentProduct.price) return;
    
    await db.saveProduct({
      id: currentProduct.id || '',
      name: currentProduct.name,
      category: currentProduct.category || 'General',
      price: Number(currentProduct.price),
      cost: Number(currentProduct.cost || 0),
      stock: Number(currentProduct.stock || 0),
      unit: currentProduct.unit || 'unidad',
      sku: currentProduct.sku || `SKU-${Math.floor(Math.random()*1000)}`,
      image: 'https://picsum.photos/200/200'
    });
    
    await loadData();
    setIsEditing(false);
    setCurrentProduct({});
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-500">Control de stock, costos y precios.</p>
        </div>
        <button 
          onClick={() => { setCurrentProduct({}); setIsEditing(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <Search className="text-gray-400 mr-2" size={20} />
          <input 
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Buscar por nombre, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium text-right">Costo</th>
                <th className="p-4 font-medium text-right">Precio</th>
                <th className="p-4 font-medium text-right">Margen</th>
                <th className="p-4 font-medium text-center">Stock</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => {
                const margin = product.price - product.cost;
                const marginPercent = product.price > 0 ? (margin / product.price) * 100 : 0;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400">{product.sku}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.category}</td>
                    <td className="p-4 text-right text-sm text-gray-600">${product.cost.toFixed(2)}</td>
                    <td className="p-4 text-right text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="p-4 text-right text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${marginPercent > 30 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {marginPercent.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                        {product.stock} {product.unit}
                        {product.stock < 10 && <AlertCircle size={12} className="ml-1" />}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => { setCurrentProduct(product); setIsEditing(true); }}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
             <h2 className="text-xl font-bold mb-4">{currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input className="w-full border p-2 rounded" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select 
                    className="w-full border p-2 rounded" 
                    value={currentProduct.category || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input className="w-full border p-2 rounded" value={currentProduct.sku || ''} onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo ($)</label>
                  <input type="number" className="w-full border p-2 rounded" value={currentProduct.cost || ''} onChange={e => setCurrentProduct({...currentProduct, cost: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input type="number" className="w-full border p-2 rounded" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                  <input type="number" className="w-full border p-2 rounded" value={currentProduct.stock || ''} onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select className="w-full border p-2 rounded" value={currentProduct.unit || 'unidad'} onChange={e => setCurrentProduct({...currentProduct, unit: e.target.value})}>
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kg</option>
                    <option value="litro">Litro</option>
                    <option value="porcion">Porción</option>
                  </select>
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