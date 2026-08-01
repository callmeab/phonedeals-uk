export interface RefurbishedDetails {
  availableGrades?: string[];         // e.g. ['like_new', 'excellent', 'good', 'fair']
  availableBatteryHealths?: string[]; // e.g. ['>90%', '80%-90%', '<80%']
  boxIncluded: boolean;
  accessories: string[];              // e.g. ["Charging Cable", "Adapter"]
  notes?: string;
}

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
  condition?: 'new' | 'refurbished'; // only used when product.condition === 'both'
  grade?: string;                    // Refurbished cosmetic grade (e.g. 'like_new')
  batteryHealth?: string;            // Refurbished battery health range (e.g. '>90%')
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  condition?: 'new' | 'refurbished' | 'both';
  refurbished_details?: string | null; // JSON string of RefurbishedDetails
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
