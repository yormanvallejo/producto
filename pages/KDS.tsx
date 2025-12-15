import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { db } from '../services/db';
import { Order } from '../types';

export const KDS = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real app, this would poll or use websockets.
    // Here we just load recent orders.
    const fetchOrders = async () => {
      const allOrders = await db.getOrders();
      // Simulate "Pending" orders by just taking the last 5
      setOrders(allOrders.slice(-5).reverse()); 
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6 h-full bg-gray-100 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monitor de Cocina (KDS)</h1>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium">
          <span className="text-green-600">{orders.length} Pendientes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order, index) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className={`p-3 text-white flex justify-between items-center ${index === 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}>
               <span className="font-bold">#{order.id.toUpperCase()}</span>
               <div className="flex items-center text-xs bg-white/20 px-2 py-1 rounded">
                 <Clock size={12} className="mr-1" />
                 {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </div>
            </div>
            
            <div className="p-4 flex-1">
               <ul className="space-y-3">
                 {order.items.map((item, idx) => (
                   <li key={idx} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                     <div className="flex items-start">
                       <span className="font-bold text-lg mr-3 w-6">{item.quantity}</span>
                       <div>
                         <span className="text-gray-800 font-medium block">{item.name}</span>
                         {item.notes && <span className="text-xs text-red-500 italic block mt-1">{item.notes}</span>}
                       </div>
                     </div>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button className="w-full bg-gray-200 hover:bg-green-500 hover:text-white text-gray-600 py-3 rounded-lg font-bold transition-all flex items-center justify-center">
                <CheckCircle size={20} className="mr-2" />
                Marcar Listo
              </button>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
             <Clock size={48} className="mb-4" />
             <p className="text-lg">No hay órdenes pendientes</p>
           </div>
        )}
      </div>
    </div>
  );
};