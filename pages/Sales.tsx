import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, FileText } from 'lucide-react';
import { Order, Client, Product, CartItem, PaymentMethod } from '../types';
import { db } from '../services/db';

export const Sales = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  
  // Item entry
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setOrders((await db.getOrders()).reverse());
    setClients(await db.getClients());
    setProducts(await db.getProducts());
  };

  const addItem = () => {
    if (!selectedProduct || qty <= 0) return;
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;

    // Check if exists
    const existingIdx = items.findIndex(i => i.id === prod.id);
    if (existingIdx >= 0) {
      const newItems = [...items];
      newItems[existingIdx].quantity += Number(qty);
      setItems(newItems);
    } else {
      setItems([...items, { ...prod, quantity: Number(qty) }]);
    }
    
    setQty(1);
    setSelectedProduct('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (items.length === 0) return;
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    await db.createOrder(items, paymentMethod, total, selectedClient || undefined);

    await loadData(); // Reload orders and stock
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedClient('');
    setItems([]);
    setQty(1);
    setSelectedProduct('');
    setPaymentMethod(PaymentMethod.CASH);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500">Historial de ventas y registro de nuevas órdenes.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nueva Venta
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
             <tr>
               <th className="p-4">ID</th>
               <th className="p-4">Fecha</th>
               <th className="p-4">Cliente</th>
               <th className="p-4">Método</th>
               <th className="p-4 text-right">Total</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
             {orders.map(o => {
               const clientName = clients.find(c => c.id === o.clientId)?.name || 'Cliente Ocasional';
               return (
                 <tr key={o.id} className="hover:bg-gray-50">
                   <td className="p-4 font-mono text-gray-500">#{o.id}</td>
                   <td className="p-4 text-gray-500">{new Date(o.date).toLocaleDateString()} {new Date(o.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                   <td className="p-4 font-medium text-gray-900">{clientName}</td>
                   <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{o.paymentMethod}</span></td>
                   <td className="p-4 text-right font-bold text-green-600">${o.total.toFixed(2)}</td>
                 </tr>
               );
             })}
             {orders.length === 0 && (
               <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay ventas registradas.</td></tr>
             )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center"><FileText className="mr-2"/> Registrar Venta</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                  >
                    <option value="">Cliente Ocasional</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
               <h3 className="text-sm font-bold text-gray-700 mb-2">Agregar Productos</h3>
               <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-8">
                    <label className="text-xs text-gray-500">Producto</label>
                    <select className="w-full border p-2 rounded text-sm" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                       <option value="">Seleccionar...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                     <label className="text-xs text-gray-500">Cant.</label>
                     <input type="number" className="w-full border p-2 rounded text-sm" value={qty} onChange={e => setQty(Number(e.target.value))} />
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
                     <th className="p-2 text-right">Precio</th>
                     <th className="p-2 text-right">Total</th>
                     <th className="p-2"></th>
                   </tr>
                 </thead>
                 <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                        <td className="p-2 text-right font-medium">${(item.quantity * item.price).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => removeItem(idx)} className="text-red-500"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
               <div className="text-right mt-4 text-xl font-bold text-gray-900">
                  Total: ${items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}
               </div>
            </div>

            <div className="flex justify-end space-x-3">
               <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
               <button 
                onClick={handleSave} 
                disabled={items.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
               >
                 Registrar Venta
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};