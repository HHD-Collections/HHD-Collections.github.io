import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_KEY = 'hhd_orders_cache';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read orders cache', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Could not save orders cache', e);
  }
}

export function generateOrderNumber(): string {
  const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
  return `HHD-${randomStr}`;
}

/**
 * Build WhatsApp order enquiry URL with structured message
 */
export function buildWhatsAppOrderUrl(order: Order, whatsappNumber: string = '+923001234567'): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const itemsText = order.items
    .map((i) => `• ${i.quantity}x ${i.productName} (Rs. ${i.price.toLocaleString()})`)
    .join('\n');

  const message = `*NEW ORDER - HHD COLLECTIONS* 🛍️\n\n` +
    `*Order Ref:* ${order.orderNumber}\n` +
    `*Customer:* ${order.customer.fullName}\n` +
    `*Phone:* ${order.customer.phone}\n` +
    `*Delivery City:* ${order.customer.city}\n` +
    `*Address:* ${order.customer.address}\n\n` +
    `*Items:*\n${itemsText}\n\n` +
    `*Subtotal:* Rs. ${order.subtotal.toLocaleString()}\n` +
    `*Delivery Fee:* Rs. ${order.shippingFee.toLocaleString()}\n` +
    `*Total Payable:* Rs. ${order.total.toLocaleString()}\n` +
    `*Payment Method:* ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod.toUpperCase()}\n\n` +
    `Please confirm my order dispatch. Thank you!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export async function createOrder(
  data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Order> {
  const newId = `ord-${Date.now()}`;
  const now = Date.now();
  const orderNumber = generateOrderNumber();

  const newOrder: Order = {
    ...data,
    id: newId,
    orderNumber,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, newId);
      await setDoc(docRef, newOrder);
    } catch (e) {
      console.warn('Failed to save order to Firestore, saved locally:', e);
    }
  }

  const existing = getLocalOrders();
  saveLocalOrders([newOrder, ...existing]);

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  let orders: Order[] = [];

  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, ORDERS_COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        orders = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Order[];
      }
    } catch (e) {
      console.warn('Firestore orders fetch failed, reading local orders:', e);
    }
  }

  if (orders.length === 0) {
    orders = getLocalOrders();
  }

  return orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, ORDERS_COLLECTION, id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }
    } catch (e) {
      console.warn('Error fetching order from Firestore:', e);
    }
  }

  const local = getLocalOrders();
  return local.find((o) => o.id === id || o.orderNumber === id) || null;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const now = Date.now();
  const existing = await getOrderById(id);
  if (!existing) throw new Error(`Order ${id} not found`);

  const updated: Order = { ...existing, status, updatedAt: now };

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, id), { status, updatedAt: now });
    } catch (e) {
      console.warn('Failed to update order status in Firestore:', e);
    }
  }

  const local = getLocalOrders();
  saveLocalOrders(local.map((o) => (o.id === id ? updated : o)));
  return updated;
}
