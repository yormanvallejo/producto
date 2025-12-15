import { Product, Order, Client, Supplier, Employee, Transaction, CashRegister, PaymentMethod, Category, Purchase } from '../types';

// --- Local Storage Implementation (Fallback) ---
// Keeps the app running in the browser preview without a backend
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Platos Fuertes', description: 'Platos principales' },
  { id: '2', name: 'Entradas', description: 'Aperitivos y entradas' },
  { id: '3', name: 'Bebidas', description: 'Bebidas frías y calientes' },
  { id: '4', name: 'Postres', description: 'Dulces y pasteles' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Hamburguesa Clásica', category: 'Platos Fuertes', price: 12.50, cost: 6.00, stock: 50, unit: 'unidad', sku: 'HAM-001', image: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Papas Fritas', category: 'Entradas', price: 4.50, cost: 1.50, stock: 100, unit: 'porcion', sku: 'PAP-001', image: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'Coca Cola', category: 'Bebidas', price: 2.00, cost: 1.00, stock: 200, unit: 'botella', sku: 'BEB-001', image: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Café Americano', category: 'Bebidas', price: 3.00, cost: 0.50, stock: 500, unit: 'taza', sku: 'CAF-001', image: 'https://picsum.photos/200/200?random=4' },
  { id: '5', name: 'Pizza Margarita', category: 'Platos Fuertes', price: 15.00, cost: 5.00, stock: 30, unit: 'unidad', sku: 'PIZ-001', image: 'https://picsum.photos/200/200?random=5' },
];

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Juan Pérez', phone: '555-0101', email: 'juan@example.com', totalSpent: 150.00, visits: 5 },
  { id: '2', name: 'Maria Lopez', phone: '555-0202', email: 'maria@example.com', totalSpent: 45.00, visits: 2 },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Distribuidora Alimentos SA', contact: 'Carlos Ruiz', email: 'ventas@distri.com', category: 'Insumos Generales' },
  { id: '2', name: 'Bebidas del Norte', contact: 'Ana Polo', email: 'ana@bebidas.com', category: 'Bebidas' },
];

class LocalStorageDB {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  init() {
    if (!localStorage.getItem('products')) this.set('products', INITIAL_PRODUCTS);
    if (!localStorage.getItem('clients')) this.set('clients', INITIAL_CLIENTS);
    if (!localStorage.getItem('suppliers')) this.set('suppliers', INITIAL_SUPPLIERS);
    if (!localStorage.getItem('orders')) this.set('orders', []);
    if (!localStorage.getItem('transactions')) this.set('transactions', []);
    if (!localStorage.getItem('categories')) this.set('categories', INITIAL_CATEGORIES);
    if (!localStorage.getItem('purchases')) this.set('purchases', []);
    if (!localStorage.getItem('cashRegister')) {
      const initialRegister: CashRegister = { isOpen: true, openedAt: new Date().toISOString(), initialAmount: 100, currentAmount: 100, expectedAmount: 100 };
      localStorage.setItem('cashRegister', JSON.stringify(initialRegister));
    }
  }

  getCategories(): Category[] { return this.get<Category>('categories'); }
  saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) categories[index] = category;
    else categories.push({ ...category, id: Math.random().toString(36).substr(2, 9) });
    this.set('categories', categories);
  }
  deleteCategory(id: string): void {
    this.set('categories', this.getCategories().filter(c => c.id !== id));
  }
  getProducts(): Product[] { return this.get<Product>('products'); }
  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push({ ...product, id: Math.random().toString(36).substr(2, 9) });
    this.set('products', products);
  }
  getPurchases(): Purchase[] { return this.get<Purchase>('purchases'); }
  createPurchase(purchase: Omit<Purchase, 'id'>): Purchase {
    const newPurchase: Purchase = { ...purchase, id: Math.random().toString(36).substr(2, 9) };
    const purchases = this.getPurchases();
    purchases.push(newPurchase);
    this.set('purchases', purchases);
    
    const products = this.getProducts();
    purchase.items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.productId);
      if (prodIndex >= 0) {
        products[prodIndex].stock += item.quantity;
        products[prodIndex].cost = item.cost;
      }
    });
    this.set('products', products);
    
    this.addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      date: purchase.date,
      type: 'EXPENSE',
      category: 'Compra de Inventario',
      amount: purchase.total,
      description: `Compra a ${purchase.supplierName}`,
      referenceId: newPurchase.id
    });
    return newPurchase;
  }
  getOrders(): Order[] { return this.get<Order>('orders'); }
  createOrder(items: Product[], paymentMethod: PaymentMethod, total: number, clientId?: string): Order {
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      items: items.map(i => ({...i, quantity: (i as any).quantity || 1})),
      total,
      paymentMethod,
      status: 'completed',
      clientId
    };
    const orders = this.get<Order>('orders');
    orders.push(order);
    this.set('orders', orders);

    const products = this.getProducts();
    items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.id);
      if (prodIndex >= 0) {
        const qty = (item as any).quantity || 1;
        products[prodIndex].stock -= qty;
      }
    });
    this.set('products', products);

    if (clientId) {
      const clients = this.get<Client>('clients');
      const clientIndex = clients.findIndex(c => c.id === clientId);
      if (clientIndex >= 0) {
        clients[clientIndex].totalSpent += total;
        clients[clientIndex].visits += 1;
        this.set('clients', clients);
      }
    }
    this.addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      type: 'INCOME',
      category: 'Venta',
      amount: total,
      description: `Venta #${order.id}`,
      referenceId: order.id
    });
    if (paymentMethod === PaymentMethod.CASH) {
      const register = this.getCashRegister();
      if (register) {
        register.currentAmount += total;
        register.expectedAmount += total;
        localStorage.setItem('cashRegister', JSON.stringify(register));
      }
    }
    return order;
  }
  getClients(): Client[] { return this.get<Client>('clients'); }
  getSuppliers(): Supplier[] { return this.get<Supplier>('suppliers'); }
  getTransactions(): Transaction[] { return this.get<Transaction>('transactions'); }
  addTransaction(tx: Transaction): void {
    const txs = this.getTransactions();
    txs.push(tx);
    this.set('transactions', txs);
  }
  getCashRegister(): CashRegister | null {
    const data = localStorage.getItem('cashRegister');
    return data ? JSON.parse(data) : null;
  }
  toggleRegister(amount: number): CashRegister {
    let register = this.getCashRegister();
    if (!register || !register.isOpen) {
      register = { isOpen: true, openedAt: new Date().toISOString(), initialAmount: amount, currentAmount: amount, expectedAmount: amount };
    } else {
      register.isOpen = false;
    }
    localStorage.setItem('cashRegister', JSON.stringify(register));
    return register;
  }
}

// --- Async Database Service (MySQL + Fallback) ---

class DatabaseService {
  private localDb = new LocalStorageDB();
  private apiBase = 'http://localhost:3000/api';
  private useApi = true; // Set to true to try backend, false to force local

  constructor() {
    this.localDb.init();
  }

  // Helper to fetch or fallback with timeout
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.useApi) throw new Error("API disabled");
    
    // Create a timeout to avoid hanging if the backend is down
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000); // 1 second timeout for responsiveness

    try {
      const res = await fetch(`${this.apiBase}${endpoint}`, { 
        ...options, 
        signal: controller.signal 
      });
      clearTimeout(id);
      
      if (!res.ok) throw new Error("API Error");
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      // console.warn(`API unavailable (${endpoint}). Using local storage.`);
      throw e; 
    }
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    try { return await this.request<Category[]>('/categories'); } 
    catch { return this.localDb.getCategories(); }
  }
  
  async saveCategory(category: Category): Promise<void> {
    try {
      await this.request('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
    } catch { this.localDb.saveCategory(category); }
  }

  async deleteCategory(id: string): Promise<void> {
    try { await this.request(`/categories/${id}`, { method: 'DELETE' }); }
    catch { this.localDb.deleteCategory(id); }
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    try { return await this.request<Product[]>('/products'); }
    catch { return this.localDb.getProducts(); }
  }

  async saveProduct(product: Product): Promise<void> {
    try {
      await this.request('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch { this.localDb.saveProduct(product); }
  }

  // --- Orders / Sales ---
  async getOrders(): Promise<Order[]> {
    try { return await this.request<Order[]>('/orders'); }
    catch { return this.localDb.getOrders(); }
  }

  async createOrder(items: Product[], paymentMethod: PaymentMethod, total: number, clientId?: string): Promise<Order> {
    try {
       const res = await this.request<{success: boolean, orderId: string}>('/orders', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ items, paymentMethod, total, clientId })
       });
       // Return a mock order object with the new ID for frontend update
       return {
         id: res.orderId,
         date: new Date().toISOString(),
         items: items.map(i => ({...i, quantity: (i as any).quantity})),
         total,
         paymentMethod,
         status: 'completed',
         clientId
       };
    } catch {
       return this.localDb.createOrder(items, paymentMethod, total, clientId);
    }
  }

  // --- Purchases ---
  async getPurchases(): Promise<Purchase[]> {
    try { return await this.request<Purchase[]>('/purchases'); }
    catch { return this.localDb.getPurchases(); }
  }

  async createPurchase(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
    try {
       const res = await this.request<{success: boolean, purchaseId: string}>('/purchases', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(purchase)
       });
       return { ...purchase, id: res.purchaseId };
    } catch {
       return this.localDb.createPurchase(purchase);
    }
  }

  // --- Clients & Suppliers ---
  async getClients(): Promise<Client[]> {
    try { return await this.request<Client[]>('/clients'); }
    catch { return this.localDb.getClients(); }
  }

  async getSuppliers(): Promise<Supplier[]> {
    try { return await this.request<Supplier[]>('/suppliers'); }
    catch { return this.localDb.getSuppliers(); }
  }

  // --- Finance ---
  async getTransactions(): Promise<Transaction[]> {
    try { return await this.request<Transaction[]>('/transactions'); }
    catch { return this.localDb.getTransactions(); }
  }

  async getCashRegister(): Promise<CashRegister | null> {
    try { return await this.request<CashRegister | null>('/cash-register'); }
    catch { return this.localDb.getCashRegister(); }
  }

  async toggleRegister(amount: number): Promise<CashRegister> {
     try {
       const current = await this.getCashRegister();
       const isOpen = !current?.isOpen;
       await this.request('/cash-register/toggle', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ amount, isOpen })
       });
       // Re-fetch to be sure
       const updated = await this.getCashRegister();
       if (!updated) throw new Error("Failed to fetch updated register");
       return updated;
     } catch {
       return this.localDb.toggleRegister(amount);
     }
  }
}

export const db = new DatabaseService();