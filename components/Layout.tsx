import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Users, Package, DollarSign, Settings, Tags } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/sales', label: 'Ventas', icon: <DollarSign size={20} /> },
    { path: '/purchases', label: 'Compras', icon: <ShoppingBag size={20} /> },
    { path: '/categories', label: 'Categorías', icon: <Tags size={20} /> },
    { path: '/inventory', label: 'Inventario', icon: <Package size={20} /> },
    { path: '/relationships', label: 'Relaciones', icon: <Users size={20} /> },
    { path: '/finance', label: 'Finanzas', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex transition-all duration-300">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-0 lg:mr-3">
              T
            </div>
            <span className="font-bold text-xl hidden lg:block text-blue-900">TreintaPOS</span>
          </div>

          <nav className="mt-6 px-2 lg:px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-2 lg:px-4 py-3 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {item.icon}
                  </span>
                  <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center justify-center lg:justify-start w-full px-2 lg:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings size={20} />
            <span className="ml-3 hidden lg:block">Configuración</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-3 pb-safe">
         {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 relative">
        <header className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-40">
           <span className="font-bold text-lg text-blue-900">TreintaPOS</span>
           <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </header>
        {children}
      </main>
    </div>
  );
};