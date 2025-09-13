// Mock database for development when Supabase is not configured
import { Category, MenuItem, Order, Table, OrderItem, SalesReport, OrderStatus, PaymentStatus } from '../types';

// Mock data
const mockTables: Table[] = [
  { id: '1', code: 'T01', name: 'Table 1', active: true },
  { id: '2', code: 'T02', name: 'Table 2', active: true },
  { id: '3', code: 'T03', name: 'Table 3', active: true },
  { id: '4', code: 'T04', name: 'Table 4', active: true },
  { id: '5', code: 'T05', name: 'Table 5', active: true },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Appetizers', description: 'Start your meal with our delicious appetizers', sort_order: 1 },
  { id: '2', name: 'Main Course', description: 'Hearty main dishes to satisfy your hunger', sort_order: 2 },
  { id: '3', name: 'Beverages', description: 'Refreshing drinks and traditional beverages', sort_order: 3 },
  { id: '4', name: 'Desserts', description: 'Sweet treats to end your meal perfectly', sort_order: 4 },
];

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    category_id: '1',
    name: 'Spring Rolls',
    description: 'Crispy vegetable spring rolls served with sweet and sour sauce',
    price: 8500,
    in_stock: true,
    image_url: '/images/spring-rolls.jpg'
  },
  {
    id: '2',
    category_id: '1',
    name: 'Chicken Wings',
    description: 'Spicy buffalo chicken wings with ranch dressing',
    price: 12000,
    in_stock: true,
    image_url: '/images/chicken-wings.jpg'
  },
  {
    id: '3',
    category_id: '2',
    name: 'Nasi Goreng',
    description: 'Traditional Indonesian fried rice with chicken and vegetables',
    price: 15000,
    in_stock: true,
    image_url: '/images/nasi-goreng.jpg'
  },
  {
    id: '4',
    category_id: '2',
    name: 'Beef Rendang',
    description: 'Slow-cooked beef in rich coconut curry sauce',
    price: 18500,
    in_stock: true,
    image_url: '/images/beef-rendang.jpg'
  },
  {
    id: '5',
    category_id: '3',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 5000,
    in_stock: true,
    image_url: '/images/orange-juice.jpg'
  },
  {
    id: '6',
    category_id: '4',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with vanilla ice cream',
    price: 8000,
    in_stock: true,
    image_url: '/images/chocolate-cake.jpg'
  },
];

let mockOrders: Order[] = [];
let mockOrderItems: OrderItem[] = [];

// Mock database functions
export const mockDatabase = {
  // Tables
  getTables: async () => {
    return { data: mockTables, error: null };
  },

  // Categories
  getCategories: async () => {
    return { data: mockCategories, error: null };
  },

  // Menu Items
  getMenuItems: async (filters?: { category_id?: string; in_stock?: boolean }) => {
    let items = mockMenuItems;
    
    if (filters?.category_id) {
      items = items.filter(item => item.category_id === filters.category_id);
    }
    
    if (filters?.in_stock !== undefined) {
      items = items.filter(item => item.in_stock === filters.in_stock);
    }

    // Add category info
    const itemsWithCategory = items.map(item => ({
      ...item,
      category: mockCategories.find(cat => cat.id === item.category_id)
    }));
    
    return { data: itemsWithCategory, error: null };
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>) => {
    const itemIndex = mockMenuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return { data: null, error: { message: 'Item not found' } };
    }

    mockMenuItems[itemIndex] = { ...mockMenuItems[itemIndex], ...updates };
    const updatedItem = {
      ...mockMenuItems[itemIndex],
      category: mockCategories.find(cat => cat.id === mockMenuItems[itemIndex].category_id)
    };
    
    return { data: updatedItem, error: null };
  },

  // Orders
  createOrder: async (orderData: any) => {
    const orderId = (mockOrders.length + 1).toString();
    const orderCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newOrder: Order = {
      id: orderId,
      code: orderCode,
      table_id: orderData.table_id || '1',
      status: OrderStatus.PENDING,
      total: orderData.total,
      payment_status: PaymentStatus.PENDING,
      customer_notes: orderData.customer_notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      table: mockTables.find(t => t.id === orderData.table_id)
    };

    mockOrders.push(newOrder);

    // Add order items
    if (orderData.items) {
      orderData.items.forEach((item: any, index: number) => {
        const orderItem: OrderItem = {
          id: `${orderId}-${index}`,
          order_id: orderId,
          item_id: item.item.id,
          quantity: item.quantity,
          price: item.item.price,
          notes: item.notes,
          item: item.item
        };
        mockOrderItems.push(orderItem);
      });
    }

    // Add order items to the response
    const orderWithItems = {
      ...newOrder,
      order_items: mockOrderItems.filter(item => item.order_id === orderId)
    };
    
    return { data: orderWithItems, error: null };
  },

  getOrders: async (filters?: { status?: string; payment_status?: string }) => {
    let orders = mockOrders;
    
    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    if (filters?.payment_status) {
      orders = orders.filter(order => order.payment_status === filters.payment_status);
    }

    // Add order items and table info
    const ordersWithDetails = orders.map(order => ({
      ...order,
      order_items: mockOrderItems.filter(item => item.order_id === order.id),
      table: mockTables.find(t => t.id === order.table_id)
    }));
    
    return { data: ordersWithDetails, error: null };
  },

  getOrderByCode: async (code: string) => {
    const order = mockOrders.find(o => o.code === code);
    if (!order) {
      return { data: null, error: { message: 'Order not found', code: 'PGRST116' } };
    }

    const orderWithDetails = {
      ...order,
      order_items: mockOrderItems.filter(item => item.order_id === order.id),
      table: mockTables.find(t => t.id === order.table_id)
    };
    
    return { data: orderWithDetails, error: null };
  },

  updateOrder: async (code: string, updates: any) => {
    const orderIndex = mockOrders.findIndex(o => o.code === code);
    if (orderIndex === -1) {
      return { data: null, error: { message: 'Order not found' } };
    }

    mockOrders[orderIndex] = { 
      ...mockOrders[orderIndex], 
      ...updates,
      updated_at: new Date().toISOString()
    };

    const updatedOrder = {
      ...mockOrders[orderIndex],
      order_items: mockOrderItems.filter(item => item.order_id === mockOrders[orderIndex].id),
      table: mockTables.find(t => t.id === mockOrders[orderIndex].table_id)
    };
    
    return { data: updatedOrder, error: null };
  },

  // Admin
  loginAdmin: async (username: string, password: string) => {
    // Mock admin user (admin/admin123)
    if (username === 'admin' && password === 'admin123') {
      return {
        data: {
          id: '1',
          username: 'admin',
          role: 'admin',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      };
    }
    
    return { data: null, error: { message: 'Invalid credentials' } };
  },

  getSalesReport: async (): Promise<{ data: SalesReport | null; error: any }> => {
    const paidOrders = mockOrders.filter(order => order.payment_status === 'paid');
    
    const totalOrders = paidOrders.length;
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    
    const ordersByStatus = paidOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Mock popular items
    const popularItems = mockMenuItems.slice(0, 5).map((item, index) => ({
      item,
      quantity_sold: Math.floor(Math.random() * 50) + 10,
      revenue: (Math.floor(Math.random() * 50) + 10) * item.price
    }));

    // Mock daily sales for last 7 days
    const dailySales = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        orders: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 500000) + 100000
      };
    }).reverse();

    const salesReport: SalesReport = {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      orders_by_status: ordersByStatus,
      popular_items: popularItems,
      daily_sales: dailySales
    };

    return { data: salesReport, error: null };
  }
};

// Helper function to get table by code
export const getTableByCode = (code: string) => {
  return mockTables.find(table => table.code === code);
};