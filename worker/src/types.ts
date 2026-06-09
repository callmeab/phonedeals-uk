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
  primary_image_url: string | null;
  gallery_images: string | null; // JSON text
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
