import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, LayoutGrid, X, ShoppingCart } from 'lucide-react';
import { Product, CartItem, PaymentMethod, Client } from '../types';
import { db } from '../services/db';

export const POS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    // Load data from "DB"
    const loadData = async () => {
      setProducts(await db.getProducts());
      setClients(await db.getClients());
    };
    loadData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Todas', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (method: PaymentMethod) => {
    if (cart.length === 0) return;
    
    await db.createOrder(cart, method, cartTotal, selectedClient || undefined);
    
    // Reset state
    setCart([]);
    setSelectedClient('');
    setShowCheckout(false);
    
    // Refresh stock in UI
    setProducts(await db.getProducts()); 
    alert('Venta realizada con éxito');
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        {/* Header / Filter */}
        <div className="p-4 bg-white border-b border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos (nombre o SKU)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-24 h-24 mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">{product.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{product.stock} {product.unit} disponibles</p>
                <p className="text-blue-600 font-bold mt-2">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart (Mobile Drawer or Static Side) */}
      <div className={`w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-[40vh] md:h-full shadow-xl md:shadow-none z-30 ${showCheckout ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg text-gray-800 flex items-center">
            <LayoutGrid className="mr-2" size={20} />
            Orden Actual
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} items
          </span>
        </div>

        {/* Client Selector */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center text-gray-500 text-sm">
             <User size={16} className="mr-2" />
             <select 
              className="w-full bg-transparent outline-none py-2"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
             >
               <option value="">Cliente Ocasional</option>
               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="text-gray-300" size={32} />
              </div>
              <p>El carrito está vacío</p>
              <p className="text-sm mt-2">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                  <div className="text-blue-600 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-medium w-4 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500">Impuestos (0%)</span>
              <span className="font-bold text-gray-900">$0.00</span>
           </div>
           <div className="flex justify-between items-center mb-6 text-xl">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
           </div>

           <button 
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             Cobrar
           </button>
        </div>
      </div>

      {/* Checkout Modal Overlay */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Método de Pago</h3>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-500 mb-2">Total a pagar</p>
              <p className="text-center text-4xl font-bold text-blue-600 mb-8">${cartTotal.toFixed(2)}</p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleCheckout(PaymentMethod.CASH)}
                  className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <Banknote className="text-green-600 mb-2" size={32} />
                  <span className="font-bold text-green-700">Efectivo</span>
                </button>
                <button 
                   onClick={() => handleCheckout(PaymentMethod.CARD)}
                   className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <CreditCard className="text-blue-600 mb-2" size={32} />
                  <span className="font-bold text-blue-700">Tarjeta</span>
                </button>
                 <button 
                   onClick={() => handleCheckout(PaymentMethod.TRANSFER)}
                   className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <CreditCard className="text-purple-600 mb-2" size={32} />
                  <span className="font-bold text-purple-700">Transferencia</span>
                </button>
                 <button 
                   onClick={() => handleCheckout(PaymentMethod.CREDIT)}
                   className="flex flex-col items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <User className="text-orange-600 mb-2" size={32} />
                  <span className="font-bold text-orange-700">Crédito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};