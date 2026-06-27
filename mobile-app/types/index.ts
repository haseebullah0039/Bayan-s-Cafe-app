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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderType = 'dine_in' | 'delivery';

export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'received';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  table_number?: string;
  delivery_address?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  orderType: OrderType;
  tableNumber: string;
  deliveryAddress: string;
}
