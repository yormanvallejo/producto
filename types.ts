export enum PaymentMethod {
  CASH = 'Efectivo',
  CARD = 'Tarjeta',
  TRANSFER = 'Transferencia',
  CREDIT = 'Fiado'
}

export enum Role {
  ADMIN = 'Administrador',
  WAITER = 'Mesero',
  COOK = 'Cocinero',
  CASHIER = 'Cajero'
}

export enum ProductType {
  FINAL_PRODUCT = 'Producto Final', // Se vende (Hamburguesa)
  INGREDIENT = 'Insumo' // Materia prima (Carne, Pan)
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // Cantidad a descontar del insumo
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Precio de venta (0 si es insumo interno)
  cost: number; // Costo unitario
  stock: number;
  unit: string; // e.g., 'unidad', 'kg', 'litro'
  image?: string;
  sku: string;
  type: ProductType;
  recipe?: RecipeItem[]; // Si es producto final, qué insumos gasta
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  date: string; // ISO string
  total: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  status: 'completed' | 'pending' | 'cancelled';
  clientId?: string;
  table?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  visits: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string; // What they supply
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  phone: string;
  email: string;
  active: boolean;
  salary?: number;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  total: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  total: number;
  items: PurchaseItem[];
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  referenceId?: string; // Links to Order ID if income
}

export interface CashRegister {
  isOpen: boolean;
  openedAt: string | null;
  initialAmount: number;
  currentAmount: number; // Cash only
  expectedAmount: number; // Calculated from sales
}