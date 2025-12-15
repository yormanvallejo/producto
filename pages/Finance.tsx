import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Transaction, CashRegister } from '../types';
import { db } from '../services/db';

export const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [register, setRegister] = useState<CashRegister | null>(null);
  const [cashCount, setCashCount] = useState<string>('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setTransactions((await db.getTransactions()).reverse()); 
    setRegister(await db.getCashRegister());
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  const handleToggleRegister = async () => {
    if (!register?.isOpen) {
       // Opening
       const amount = prompt("Monto inicial en caja:", "0");
       if (amount !== null) {
         await db.toggleRegister(Number(amount));
         refreshData();
       }
    } else {
       // Closing (Arqueo)
       if (!cashCount) return alert("Debes ingresar el conteo de efectivo.");
       await db.toggleRegister(0); // Close it
       // Logic to compare expected vs actual would happen here normally or display a report
       alert(`Caja Cerrada. \nEsperado: $${register.expectedAmount} \nContado: $${cashCount} \nDiferencia: $${Number(cashCount) - register.expectedAmount}`);
       refreshData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Finanzas y Caja</h1>

      {/* Cash Register Control */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center">
            {register?.isOpen ? <Unlock className="text-green-500 mr-2" /> : <Lock className="text-red-500 mr-2" />}
            Estado de Caja: {register?.isOpen ? 'ABIERTA' : 'CERRADA'}
          </h2>
          <button 
            onClick={handleToggleRegister}
            className={`px-4 py-2 rounded-lg font-bold text-white ${register?.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {register?.isOpen ? 'Realizar Cierre (Arqueo)' : 'Abrir Caja'}
          </button>
        </div>

        {register?.isOpen && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Saldo Inicial</p>
                <p className="text-2xl font-bold text-gray-800">${register.initialAmount.toFixed(2)}</p>
             </div>
             <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Ventas (Efectivo)</p>
                <p className="text-2xl font-bold text-blue-800">
                  ${(register.expectedAmount - register.initialAmount).toFixed(2)}
                </p>
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm text-gray-500 block mb-1">Arqueo (Conteo Físico)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                  <input 
                    type="number" 
                    className="w-full border rounded-r-md p-1 outline-none" 
                    placeholder="0.00"
                    value={cashCount}
                    onChange={(e) => setCashCount(e.target.value)}
                  />
                </div>
                {cashCount && (
                  <div className={`text-xs mt-2 font-bold ${Number(cashCount) - register.expectedAmount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    Diferencia: ${(Number(cashCount) - register.expectedAmount).toFixed(2)}
                  </div>
                )}
             </div>
           </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Gastos Operativos</p>
              <p className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
            </div>
             <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Balance Neto</p>
              <p className="text-2xl font-bold text-blue-600">${(totalIncome - totalExpense).toFixed(2)}</p>
            </div>
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-700">Movimientos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                  <td className="p-4 font-medium text-gray-900">{tx.description}</td>
                  <td className="p-4 text-gray-500">{tx.category}</td>
                  <td className={`p-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">No hay transacciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};