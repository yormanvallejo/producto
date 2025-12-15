import React, { useState, useEffect } from 'react';
import { Users, Truck, Briefcase, Phone, Mail, Award, User, Plus, Edit2, Trash2 } from 'lucide-react';
import { Client, Supplier, Employee, Role } from '../types';
import { db } from '../services/db';

export const Relationships = () => {
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'SUPPLIERS' | 'EMPLOYEES'>('CLIENTS');
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setClients(await db.getClients());
    setSuppliers(await db.getSuppliers());
    setEmployees(await db.getEmployees());
  };

  const handleSaveEmployee = async () => {
    if (!currentEmployee.name || !currentEmployee.role) return;
    await db.saveEmployee({
      id: currentEmployee.id || '',
      name: currentEmployee.name,
      role: currentEmployee.role,
      phone: currentEmployee.phone || '',
      email: currentEmployee.email || '',
      active: true,
      salary: Number(currentEmployee.salary || 0)
    });
    setIsEmpModalOpen(false);
    setCurrentEmployee({});
    loadData();
  };

  const handleDeleteEmployee = async (id: string) => {
    if(confirm("¿Eliminar empleado?")) {
      await db.deleteEmployee(id);
      loadData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Relaciones</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CLIENTS')}
          className={`pb-3 px-2 flex items-center font-medium transition-colors whitespace-nowrap ${activeTab === 'CLIENTS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={18} className="mr-2" />
          Clientes (CRM)
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`pb-3 px-2 flex items-center font-medium transition-colors whitespace-nowrap ${activeTab === 'SUPPLIERS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Truck size={18} className="mr-2" />
          Proveedores (SRM)
        </button>
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`pb-3 px-2 flex items-center font-medium transition-colors whitespace-nowrap ${activeTab === 'EMPLOYEES' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
          <>
            <button 
              onClick={() => { setCurrentEmployee({}); setIsEmpModalOpen(true); }}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-all min-h-[200px]"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium">Nuevo Empleado</span>
            </button>
            {employees.map(emp => (
               <div key={emp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                     {emp.name.charAt(0)}
                   </div>
                   <div className="flex space-x-2">
                      <button onClick={() => { setCurrentEmployee(emp); setIsEmpModalOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                   </div>
                 </div>
                 <h3 className="font-bold text-gray-900">{emp.name}</h3>
                 <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded border border-green-200">{emp.role}</span>
                 
                 <div className="space-y-2 mt-4 text-sm text-gray-600">
                    <div className="flex items-center"><Phone size={14} className="mr-2"/> {emp.phone}</div>
                    <div className="flex items-center"><Mail size={14} className="mr-2"/> {emp.email}</div>
                 </div>
               </div>
            ))}
          </>
        )}
      </div>

      {/* Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">{currentEmployee.id ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <div className="space-y-3">
                 <div>
                   <label className="text-sm font-medium">Nombre Completo</label>
                   <input className="w-full border rounded p-2" value={currentEmployee.name || ''} onChange={e => setCurrentEmployee({...currentEmployee, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Rol</label>
                   <select className="w-full border rounded p-2" value={currentEmployee.role || Role.WAITER} onChange={e => setCurrentEmployee({...currentEmployee, role: e.target.value as Role})}>
                     {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-sm font-medium">Teléfono</label>
                   <input className="w-full border rounded p-2" value={currentEmployee.phone || ''} onChange={e => setCurrentEmployee({...currentEmployee, phone: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Correo</label>
                   <input className="w-full border rounded p-2" value={currentEmployee.email || ''} onChange={e => setCurrentEmployee({...currentEmployee, email: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Salario Base ($)</label>
                   <input type="number" className="w-full border rounded p-2" value={currentEmployee.salary || ''} onChange={e => setCurrentEmployee({...currentEmployee, salary: Number(e.target.value)})} />
                 </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsEmpModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleSaveEmployee} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};