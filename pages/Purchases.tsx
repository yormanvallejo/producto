import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Purchase, Supplier, Product, PurchaseItem } from '../types';
import { db } from '../services/db';

export const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  // Item entry
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setPurchases((await db.getPurchases()).reverse());
    setSuppliers(await db.getSuppliers());
    setProducts(await db.getProducts());
  };

  const addItem = () => {
    if (!selectedProduct || qty <= 0 || cost <= 0) return;
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;

    setItems([...items, {
      productId: prod.id,
      productName: prod.name,
      quantity: Number(qty),
      cost: Number(cost),
      total: Number(qty) * Number(cost)
    }]);
    
    // Reset entry fields
    setQty(1);
    setCost(0);
    setSelectedProduct('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedSupplier || items.length === 0) return;
    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier) return;

    const total = items.reduce((acc, item) => acc + item.total, 0);

    await db.createPurchase({
      date: new Date().toISOString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: items,
      total: total,
    });

    await loadData();
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSupplier('');
    setItems([]);
    setQty(1);
    setCost(0);
    setSelectedProduct('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
          <p className="text-gray-500">Registra entradas de inventario y gastos.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nueva Compra
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
             <tr>
               <th className="p-4">Fecha</th>
               <th className="p-4">Proveedor</th>
               <th className="p-4 text-center">Items</th>
               <th className="p-4 text-right">Total</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
             {purchases.map(p => (
               <tr key={p.id} className="hover:bg-gray-50">
                 <td className="p-4 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                 <td className="p-4 font-medium text-gray-900">{p.supplierName}</td>
                 <td className="p-4 text-center">{p.items.length}</td>
                 <td className="p-4 text-right font-bold text-red-600">${p.total.toFixed(2)}</td>
               </tr>
             ))}
             {purchases.length === 0 && (
               <tr><td colSpan={4} className="p-8 text-center text-gray-400">No hay compras registradas.</td></tr>
             )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center"><ShoppingBag className="mr-2"/> Nueva Compra</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select 
                className="w-full border p-2 rounded"
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
              >
                <option value="">Seleccionar Proveedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
               <h3 className="text-sm font-bold text-gray-700 mb-2">Agregar Productos</h3>
               <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="text-xs text-gray-500">Producto</label>
                    <select className="w-full border p-2 rounded text-sm" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                       <option value="">Seleccionar...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                     <label className="text-xs text-gray-500">Cant.</label>
                     <input type="number" className="w-full border p-2 rounded text-sm" value={qty} onChange={e => setQty(Number(e.target.value))} />
                  </div>
                  <div className="col-span-3">
                     <label className="text-xs text-gray-500">Costo Unit.</label>
                     <input type="number" className="w-full border p-2 rounded text-sm" value={cost} onChange={e => setCost(Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                     <button onClick={addItem} className="w-full bg-blue-600 text-white p-2 rounded text-sm font-bold">Agregar</button>
                  </div>
               </div>
            </div>

            <div className="mb-6">
               <table className="w-full text-sm">
                 <thead className="bg-gray-100 text-gray-500">
                   <tr>
                     <th className="p-2 text-left">Producto</th>
                     <th className="p-2 text-right">Cant.</th>
                     <th className="p-2 text-right">Costo</th>
                     <th className="p-2 text-right">Total</th>
                     <th className="p-2"></th>
                   </tr>
                 </thead>
                 <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">${item.cost.toFixed(2)}</td>
                        <td className="p-2 text-right font-medium">${item.total.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => removeItem(idx)} className="text-red-500"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
               <div className="text-right mt-4 text-xl font-bold text-gray-900">
                  Total: ${items.reduce((acc, i) => acc + i.total, 0).toFixed(2)}
               </div>
            </div>

            <div className="flex justify-end space-x-3">
               <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
               <button 
                onClick={handleSave} 
                disabled={!selectedSupplier || items.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
               >
                 Guardar Compra
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};