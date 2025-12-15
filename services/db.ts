import { Product, Order, Client, Supplier, Employee, Transaction, CashRegister, PaymentMethod, Category, Purchase, Role, ProductType } from '../types';

class DatabaseService {
  // CONFIGURA AQUI TU URL LOCAL (Si usas XAMPP suele ser localhost/tu-carpeta)
  private apiBase = 'http://localhost/treinta-pos/api/api.php?path=';
  
  // Helper para hacer peticiones
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    try {
      const separator = path.includes('?') ? '&' : '';
      const response = await fetch(`${this.apiBase}${path}`, options);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error API:", error);
      // Retornar array vacío o null para evitar romper la UI si falla el backend
      return [] as any; 
    }
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('categories');
  }
  
  async saveCategory(category: Category): Promise<void> {
    await this.request('categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request(`categories&id=${id}`, { method: 'DELETE' });
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('products');
  }

  async saveProduct(product: Product): Promise<void> {
    await this.request('products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
  }

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('orders');
  }

  async createOrder(items: Product[], paymentMethod: PaymentMethod, total: number, clientId?: string): Promise<Order> {
     const res = await this.request<{success: boolean, orderId: string}>('orders', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ items, paymentMethod, total, clientId })
     });
     
     // Retornar objeto optimista para la UI
     return {
       id: res.orderId,
       date: new Date().toISOString(),
       items: items as any,
       total,
       paymentMethod,
       status: 'completed',
       clientId
     };
  }

  // --- Purchases ---
  async getPurchases(): Promise<Purchase[]> {
    return this.request<Purchase[]>('purchases');
  }

  async createPurchase(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
     const res = await this.request<{success: boolean, purchaseId: string}>('purchases', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(purchase)
     });
     return { ...purchase, id: res.purchaseId };
  }

  // --- Relaciones ---
  async getClients(): Promise<Client[]> {
    return this.request<Client[]>('clients');
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.request<Supplier[]>('suppliers');
  }

  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('employees');
  }

  async saveEmployee(employee: Employee): Promise<void> {
     await this.request('employees', {
       method: 'POST',
       body: JSON.stringify(employee),
       headers: {'Content-Type': 'application/json'}
     });
  }

   async deleteEmployee(id: string): Promise<void> {
    await this.request(`employees&id=${id}`, { method: 'DELETE' });
  }

  // --- Finance ---
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('transactions');
  }

  async getCashRegister(): Promise<CashRegister | null> {
    return this.request<CashRegister | null>('cash-register');
  }

  async toggleRegister(amount: number): Promise<CashRegister> {
     const current = await this.getCashRegister();
     const isOpen = !current?.isOpen;
     
     await this.request('cash-register-toggle', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ amount, isOpen })
     });
     
     const updated = await this.getCashRegister();
     if (!updated) throw new Error("Error al actualizar caja");
     return updated;
  }
}

export const db = new DatabaseService();
