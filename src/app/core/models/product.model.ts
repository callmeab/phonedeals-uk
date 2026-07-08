export interface ProductVariant {
  color: string;
  storage: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  sku?: string | null;
  isActive?: boolean;
  images: string[];
  simType?: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  storage_options: string | null; // JSON
  colours: string | null; // JSON
  sim_types?: string | null; // JSON
  variants: string | null; // JSON string of ProductVariant[]
  is_featured: boolean | number;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
  category_name?: string; 
}
