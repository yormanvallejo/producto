import React, { useState, useEffect } from 'react';
import { Users, Truck, Briefcase, Phone, Mail, Award, User } from 'lucide-react';
import { Client, Supplier } from '../types';
import { db } from '../services/db';

export const Relationships = () => {
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'SUPPLIERS' | 'EMPLOYEES'>('CLIENTS');
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setClients(await db.getClients());
    setSuppliers(await db.getSuppliers());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Relaciones</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('CLIENTS')}
          className={`pb-3 px-2 flex items-center font-medium transition-colors ${activeTab === 'CLIENTS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={18} className="mr-2" />
          Clientes (CRM)
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`pb-3 px-2 flex items-center font-medium transition-colors ${activeTab === 'SUPPLIERS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Truck size={18} className="mr-2" />
          Proveedores (SRM)
        </button>
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`pb-3 px-2 flex items-center font-medium transition-colors ${activeTab === 'EMPLOYEES' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Briefcase size={18} className="mr-2" />
          Empleados (HR)
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {activeTab === 'CLIENTS' && clients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {client.name.charAt(0)}
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                 <Award size={12} className="mr-1" />
                 {client.visits > 3 ? 'VIP' : 'Nuevo'}
              </span>
            </div>
            <h3 className="font-bold text-gray-900">{client.name}</h3>
            <div className="space-y-2 mt-4 text-sm text-gray-600">
               <div className="flex items-center"><Phone size={14} className="mr-2"/> {client.phone}</div>
               <div className="flex items-center"><Mail size={14} className="mr-2"/> {client.email}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
               <span className="text-gray-500">Total gastado:</span>
               <span className="font-bold text-gray-900">${client.totalSpent.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {activeTab === 'SUPPLIERS' && suppliers.map(supplier => (
           <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-3">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{supplier.name}</h3>
                  <p className="text-xs text-gray-500">{supplier.category}</p>
                </div>
             </div>
             <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
               <div className="flex items-center"><User size={14} className="mr-2 text-gray-400"/> {supplier.contact}</div>
               <div className="flex items-center"><Mail size={14} className="mr-2 text-gray-400"/> {supplier.email}</div>
            </div>
             <button className="w-full mt-4 border border-blue-600 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50">
               Ver Historial de Compras
             </button>
           </div>
        ))}

        {activeTab === 'EMPLOYEES' && (
           <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
             <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
             <h3 className="mt-2 text-sm font-medium text-gray-900">Módulo de RRHH</h3>
             <p className="mt-1 text-sm text-gray-500">Gestiona roles, permisos y rendimiento del personal.</p>
             <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
               Agregar Empleado
             </button>
           </div>
        )}
      </div>
    </div>
  );
};