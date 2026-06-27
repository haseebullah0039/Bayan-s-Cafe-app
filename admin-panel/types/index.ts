export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'received';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: 'dine_in' | 'delivery';
  table_number?: string;
  delivery_address?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
  delivery_enabled: boolean;
  dine_in_enabled: boolean;
  open_time: string;
  close_time: string;
  tax_percent: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  active_orders: number;
  completed_orders: number;
}

export interface Review {
  id: string;
  order_number: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewStats {
  total: number;
  average: number;
  breakdown: Record<number, number>;
}
