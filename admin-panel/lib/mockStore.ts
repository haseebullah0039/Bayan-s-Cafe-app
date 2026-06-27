'use client';

import type { Product, Category, Order, OrderItem } from '../types';

// ── Seed Data ─────────────────────────────────────────────────────────────

const SEED_CATEGORIES: Category[] = [
  { id: '1', name: 'Burgers',      icon: '🍔', sort_order: 1 },
  { id: '2', name: 'Pizza',        icon: '🍕', sort_order: 2 },
  { id: '3', name: 'Shawarma',     icon: '🌯', sort_order: 3 },
  { id: '4', name: 'Fries',        icon: '🍟', sort_order: 4 },
  { id: '5', name: 'Sandwiches',   icon: '🥪', sort_order: 5 },
  { id: '6', name: 'Cold Drinks',  icon: '🥤', sort_order: 6 },
  { id: '7', name: 'Special Deals',icon: '⭐', sort_order: 7 },
];

const SEED_PRODUCTS: Product[] = [
  { id: 'b1', category_id: '1', name: 'Classic Beef Burger',   description: 'Juicy 100% beef patty with lettuce, tomato, cheese & special sauce', price: 450,  image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', is_available: true },
  { id: 'b2', category_id: '1', name: 'Double Smash Burger',   description: 'Two crispy smash patties, cheddar, pickles, caramelized onions',           price: 650,  image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80', is_available: true },
  { id: 'b3', category_id: '1', name: 'Zinger Burger',         description: 'Crispy fried chicken fillet, coleslaw, jalapeño mayo',                      price: 420,  image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80', is_available: true },
  { id: 'b4', category_id: '1', name: 'BBQ Bacon Burger',      description: 'Beef patty, smoky BBQ sauce, crispy bacon strips & onion rings',            price: 700,  image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80', is_available: true },
  { id: 'b5', category_id: '1', name: 'Mushroom Swiss Burger',  description: 'Beef patty topped with sautéed mushrooms and Swiss cheese',                price: 550,  image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80', is_available: true },
  { id: 'p1', category_id: '2', name: 'Margherita Pizza',      description: 'Classic tomato base, fresh mozzarella, basil & olive oil — 10"',           price: 750,  image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80', is_available: true },
  { id: 'p2', category_id: '2', name: 'BBQ Chicken Pizza',     description: 'Smoky BBQ sauce, grilled chicken, red onions, bell peppers — 10"',         price: 950,  image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', is_available: true },
  { id: 'p3', category_id: '2', name: 'Pepperoni Pizza',       description: 'Loaded with pepperoni slices on rich tomato sauce & mozzarella — 10"',     price: 1000, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80', is_available: true },
  { id: 'p4', category_id: '2', name: 'Chicken Tikka Pizza',   description: 'Spicy tikka chicken, green chutney base, onions, capsicum — 10"',          price: 980,  image_url: 'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=600&q=80', is_available: true },
  { id: 's1', category_id: '3', name: 'Chicken Shawarma',      description: 'Marinated chicken, garlic sauce, pickles, fries in soft lavash bread',      price: 280,  image_url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600&q=80', is_available: true },
  { id: 's2', category_id: '3', name: 'Beef Shawarma',         description: 'Slow-roasted beef slices, tahini, tomatoes & onions in pita',               price: 320,  image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80', is_available: true },
  { id: 's3', category_id: '3', name: 'Shawarma Platter',      description: 'Chicken & beef mix, garlic dip, hummus, salad & 2 pita breads',             price: 650,  image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', is_available: true },
  { id: 'f1', category_id: '4', name: 'Regular Fries',         description: 'Golden crispy fries lightly salted — classic comfort snack',                price: 150,  image_url: 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?w=600&q=80', is_available: true },
  { id: 'f2', category_id: '4', name: 'Loaded Cheese Fries',   description: 'Crispy fries smothered in melted cheddar cheese sauce',                     price: 250,  image_url: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=600&q=80', is_available: true },
  { id: 'f3', category_id: '4', name: 'Masala Fries',          description: 'Fries tossed in our special desi masala blend & fresh herbs',               price: 200,  image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', is_available: true },
  { id: 'sw1', category_id: '5', name: 'Club Sandwich',        description: 'Triple-decker with chicken, egg, lettuce, tomato & mayo on toast',          price: 380,  image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80', is_available: true },
  { id: 'sw2', category_id: '5', name: 'Grilled Chicken Sandwich', description: 'Grilled chicken breast, avocado, lettuce & honey mustard in ciabatta', price: 420,  image_url: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&q=80', is_available: true },
  { id: 'cd1', category_id: '6', name: 'Pepsi',                description: 'Ice-cold Pepsi Cola — 500ml chilled can',                                   price: 100,  image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80', is_available: true },
  { id: 'cd2', category_id: '6', name: 'Fresh Lemonade',       description: 'Freshly squeezed lemonade with mint, served over crushed ice',              price: 180,  image_url: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=80', is_available: true },
  { id: 'cd3', category_id: '6', name: 'Mango Shake',          description: 'Thick fresh mango blended with cream — chilled & sweet',                    price: 250,  image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80', is_available: true },
  { id: 'sp1', category_id: '7', name: 'Family Deal',          description: '2 Beef Burgers + 1 Large Pizza + 4 Regular Fries + 4 Pepsi',               price: 2499, image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', is_available: true },
  { id: 'sp2', category_id: '7', name: 'Couple Deal',          description: '2 Zinger Burgers + 1 Medium Pizza + 2 Fries + 2 Cold Drinks',              price: 1499, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', is_available: true },
  { id: 'sp3', category_id: '7', name: 'Student Saver',        description: '1 Burger + 1 Regular Fries + 1 Cold Drink — best value!',                  price: 599,  image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80', is_available: true },
];

const now = new Date();
const pad = (n: number) => n.toString().padStart(2, '0');
const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;

const SEED_ORDERS: Order[] = [
  { id: '1', order_number: `BC-${dateStr}-0001`, customer_name: 'Ahmad Raza',    customer_phone: '0301-1234567', order_type: 'dine_in',  table_number: '4',  status: 'placed',    items: [{ id:'1', product_name:'Double Smash Burger', price:650, quantity:2, subtotal:1300 },{ id:'2', product_name:'Regular Fries', price:150, quantity:2, subtotal:300 }], subtotal:1600, total:1600, created_at: new Date(Date.now()-5*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '2', order_number: `BC-${dateStr}-0002`, customer_name: 'Sara Khan',     customer_phone: '0312-9876543', order_type: 'delivery', delivery_address:'Amandara, Batkhela', status:'preparing', items:[{ id:'3', product_name:'BBQ Chicken Pizza', price:950, quantity:1, subtotal:950 },{ id:'4', product_name:'Mango Shake', price:250, quantity:2, subtotal:500 }], subtotal:1450, total:1550, created_at: new Date(Date.now()-18*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '3', order_number: `BC-${dateStr}-0003`, customer_name: 'Bilal Ahmed',   customer_phone: '0345-5551234', order_type: 'dine_in',  table_number: '7',  status: 'ready',     items:[{ id:'5', product_name:'Chicken Shawarma', price:280, quantity:3, subtotal:840 },{ id:'6', product_name:'Pepsi', price:100, quantity:3, subtotal:300 }], subtotal:1140, total:1140, created_at: new Date(Date.now()-35*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '4', order_number: `BC-${dateStr}-0004`, customer_name: 'Nadia Gul',     customer_phone: '0333-7778888', order_type: 'delivery', delivery_address:'Near Gul Rang Hall', status:'on_the_way', items:[{ id:'7', product_name:'Family Deal', price:2499, quantity:1, subtotal:2499 }], subtotal:2499, total:2599, created_at: new Date(Date.now()-52*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '5', order_number: `BC-${dateStr}-0005`, customer_name: 'Usman Tariq',   customer_phone: '0300-1112222', order_type: 'dine_in',  table_number: '2',  status: 'delivered', items:[{ id:'8', product_name:'Classic Beef Burger', price:450, quantity:1, subtotal:450 },{ id:'9', product_name:'Masala Fries', price:200, quantity:1, subtotal:200 },{ id:'10', product_name:'Fresh Lemonade', price:180, quantity:1, subtotal:180 }], subtotal:830, total:830, created_at: new Date(Date.now()-75*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '6', order_number: `BC-${dateStr}-0006`, customer_name: 'Fatima Bibi',   customer_phone: '0311-4445555', order_type: 'delivery', delivery_address:'Batkhela Bazaar',    status:'received',   items:[{ id:'11', product_name:'Couple Deal', price:1499, quantity:1, subtotal:1499 }], subtotal:1499, total:1599, created_at: new Date(Date.now()-120*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '7', order_number: `BC-${dateStr}-0007`, customer_name: 'Hamza Shah',    customer_phone: '0322-6667777', order_type: 'dine_in',  table_number: '1',  status: 'preparing', items:[{ id:'12', product_name:'Zinger Burger', price:420, quantity:2, subtotal:840 },{ id:'13', product_name:'Loaded Cheese Fries', price:250, quantity:1, subtotal:250 }], subtotal:1090, total:1090, created_at: new Date(Date.now()-8*60000).toISOString(), updated_at: new Date().toISOString() },
  { id: '8', order_number: `BC-${dateStr}-0008`, customer_name: 'Zara Malik',    customer_phone: '0344-9990000', order_type: 'dine_in',  table_number: '9',  status: 'placed',    items:[{ id:'14', product_name:'Pepperoni Pizza', price:1000, quantity:1, subtotal:1000 },{ id:'15', product_name:'Pepsi', price:100, quantity:2, subtotal:200 }], subtotal:1200, total:1200, created_at: new Date(Date.now()-2*60000).toISOString(), updated_at: new Date().toISOString() },
];

// ── LocalStorage helpers ───────────────────────────────────────────────────

function load<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Store API ──────────────────────────────────────────────────────────────

export const store = {
  // ── Categories ──────────────────────────────────────────────────────────
  getCategories(): Category[] {
    return load('dh_categories', SEED_CATEGORIES).sort((a, b) => a.sort_order - b.sort_order);
  },
  saveCategory(data: Partial<Category>): Category {
    const cats = this.getCategories();
    const cat: Category = {
      id: data.id ?? uid(),
      name: data.name ?? '',
      icon: data.icon ?? '🍽️',
      sort_order: data.sort_order ?? cats.length + 1,
    };
    const existing = cats.findIndex((c) => c.id === cat.id);
    if (existing >= 0) cats[existing] = cat;
    else cats.push(cat);
    save('dh_categories', cats);
    return cat;
  },
  deleteCategory(id: string) {
    const cats = this.getCategories().filter((c) => c.id !== id);
    save('dh_categories', cats);
  },

  // ── Products ────────────────────────────────────────────────────────────
  getProducts(): Product[] {
    return load('dh_products', SEED_PRODUCTS);
  },
  saveProduct(data: Partial<Product>): Product {
    const products = this.getProducts();
    const prod: Product = {
      id: data.id ?? uid(),
      category_id: data.category_id ?? '',
      name: data.name ?? '',
      description: data.description ?? '',
      price: Number(data.price) || 0,
      image_url: data.image_url ?? '',
      is_available: data.is_available ?? true,
    };
    const idx = products.findIndex((p) => p.id === prod.id);
    if (idx >= 0) products[idx] = prod;
    else products.push(prod);
    save('dh_products', products);
    return prod;
  },
  deleteProduct(id: string) {
    save('dh_products', this.getProducts().filter((p) => p.id !== id));
  },
  toggleProduct(id: string) {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx >= 0) products[idx].is_available = !products[idx].is_available;
    save('dh_products', products);
  },

  // ── Orders ──────────────────────────────────────────────────────────────
  getOrders(): Order[] {
    return load('dh_orders', SEED_ORDERS);
  },
  updateOrderStatus(id: string, status: Order['status']): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx >= 0) {
      orders[idx].status = status;
      orders[idx].updated_at = new Date().toISOString();
    }
    save('dh_orders', orders);
    return orders[idx];
  },

  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboard() {
    const orders = this.getOrders();
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
    return {
      today_orders: todayOrders.length,
      today_revenue: todayOrders.filter((o) => ['delivered','received'].includes(o.status)).reduce((s,o)=>s+o.total,0),
      active_orders: orders.filter((o) => !['delivered','received'].includes(o.status)).length,
      completed_orders: todayOrders.filter((o) => ['delivered','received'].includes(o.status)).length,
      total_products: this.getProducts().length,
      recent_orders: orders.slice(0, 6),
      status_breakdown: {
        placed:    orders.filter(o=>o.status==='placed').length,
        preparing: orders.filter(o=>o.status==='preparing').length,
        ready:     orders.filter(o=>o.status==='ready').length,
        on_the_way:orders.filter(o=>o.status==='on_the_way').length,
        delivered: orders.filter(o=>o.status==='delivered').length,
        received:  orders.filter(o=>o.status==='received').length,
      },
    };
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('dh_settings');
      return raw ? JSON.parse(raw) : {
        name: 'Bayans Cafe',
        tagline: 'Premium Fast Food',
        address: 'Popular Shopping Mall, Amandara, Batkhela',
        phone: '0371-5868088',
        email: 'info@bayanscafe.com',
        delivery_fee: 100,
        min_order: 300,
        is_open: true,
        delivery_enabled: true,
        dine_in_enabled: true,
        open_time: '10:00',
        close_time: '23:00',
        tax_percent: 0,
        currency: 'PKR',
      };
    } catch { return null; }
  },
  saveSettings(data: object) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dh_settings', JSON.stringify(data));
  },

  reset() {
    ['dh_categories','dh_products','dh_orders','dh_settings'].forEach(k => localStorage.removeItem(k));
  },
};
