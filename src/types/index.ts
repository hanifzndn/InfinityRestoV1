// Core Types for InfinityResto Restaurant System

export interface Table {
  id: string;
  code: string;
  name: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url?: string;
  price: number;
  in_stock: boolean;
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  code: string;
  table_id: string;
  table?: Table;
  status: OrderStatus;
  total: number;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  customer_notes?: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  item?: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export interface KdsEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  MAKING = 'making',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  DEBIT = 'debit',
  QRIS = 'qris'
}

export enum AdminRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface OrderFormData {
  table_code: string;
  items: CartItem[];
  customer_notes?: string;
}

export interface PaymentFormData {
  order_code: string;
  payment_method: PaymentMethod;
  amount_paid: number;
}

export interface LoginFormData {
  username: string;
  password: string;
}

// Dashboard/Analytics Types
export interface SalesReport {
  total_orders: number;
  total_revenue: number;
  orders_by_status: Record<OrderStatus, number>;
  popular_items: Array<{
    item: MenuItem;
    quantity_sold: number;
    revenue: number;
  }>;
  daily_sales: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

// Component Props Types
export interface MenuProps {
  categories: Category[];
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void;
}

export interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onCheckout: () => void;
}

export interface OrderTrackingProps {
  orderCode: string;
  status: OrderStatus;
  estimatedTime?: number;
}

// Utility Types
export type CreateOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type UpdateOrder = Partial<Pick<Order, 'status' | 'payment_status' | 'payment_method'>>;
export type CreateMenuItem = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMenuItem = Partial<Pick<MenuItem, 'name' | 'description' | 'price' | 'in_stock' | 'image_url'>>;

// Filter Types
export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  table_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface MenuFilters {
  category_id?: string;
  in_stock?: boolean;
  search?: string;
}