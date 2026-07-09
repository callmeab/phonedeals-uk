export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  /**
   * Public R2 bucket URL from Cloudflare Dashboard → R2 → bucket → Settings → Public Access.
   * Example: https://pub-xxxxxxxx.r2.dev  OR  https://images.phonedealsuk.co.uk
   * When unset, local dev serves images via GET /api/images/* proxy.
   */
  R2_PUBLIC_URL?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean | number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  storage_options: string | null; // JSON text
  colours: string | null; // JSON text
  variants: string | null; // JSON array of variant configurations
  is_featured: boolean | number;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
  category_name?: string; // Hydrated via JOIN
}

export interface Deal {
  id: number;
  product_id: number;
  network: string;
  contract_months: number;
  monthly_cost: number;
  upfront_cost: number;
  data_gb: number;
  minutes: number;
  texts: number;
  deal_highlights: string | null; // JSON text
  is_active: boolean | number;
  sort_order: number;
  product_name?: string; // Hydrated via JOIN
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  dateOfBirth: string; // ISO date
  title?: string;
  marketingOptIn: number;
}

export interface Order {
  id: number;
  customer_id: number;
  deal_id: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_county?: string;
  billing_postcode?: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_county?: string;
  delivery_postcode: string;
  same_as_delivery: number;
  network_provider: string;
  contract_summary_accepted: number;
  contract_summary_accepted_at?: string;
}
