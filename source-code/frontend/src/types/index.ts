// ==================== PRODUCT TYPES ====================
export type ProductStatus = "AVAILABLE" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  unit: string;
  imageUrl: string | null;
  status: ProductStatus;
  lowStockThreshold: number;
  stockUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category?: Category;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

// ==================== CATEGORY TYPES ====================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  products?: Product[];
}

// ==================== STOCK TYPES ====================
export type StockChangeType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockLog {
  id: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  type: StockChangeType;
  reference: string | null;
  note: string | null;
  createdAt: Date;
  productId: string;
  product?: Product;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== FILTER TYPES ====================
export interface ProductFilters {
  categoryId?: string;
  search?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";
}

// ==================== STOCK SSE TYPES ====================
export interface StockUpdateEvent {
  productId: string;
  stock: number;
  status: ProductStatus;
  stockUpdatedAt: string;
}

// ==================== ADMIN TYPES ====================
export interface AdminDashboardStats {
  totalProducts: number;
  lowStockProducts: number;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}
