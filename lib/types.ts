export type Product = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  stock: number;
  category?: string | null;
  image?: string | null;
};

export type Paginated<T> = {
  items: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  address?: string | null;
};

export type OrderItem = {
  productId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | string;

export type Order = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress?: string | null;
  createdAt?: string | null;
  items: OrderItem[];
};

export type CartLine = {
  productId: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

/** Estado que devuelven las Server Actions a los formularios (useActionState). */
export type ActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  orderId?: number;
};
