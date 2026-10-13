export interface ProductImage {
  id: string;
  url: string;
  path?: string; // Firebase storage path
  altText: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  price?: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  sku: string;
  regularPrice: number;
  salePrice?: number;
  currency: string;
  stock: number;
  inStock: boolean;
  variants?: ProductVariant[];
  tags: string[];
  featured: boolean;
  active: boolean;
  images: ProductImage[];
  primaryImage: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  specifications?: Record<string, string>;
  createdAt: string | number;
  updatedAt: string | number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  parentCategory?: string;
  order: number;
  active: boolean;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariant?: string;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  notes?: string;
}

export type PaymentMethod = 'cod' | 'bank_transfer' | 'whatsapp';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string | number;
  updatedAt: string | number;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: 'super_admin' | 'admin';
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  announcementBarText: string;
  announcementActive: boolean;
  codEnabled: boolean;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
}
