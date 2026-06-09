export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  storage_options: string | null; // JSON
  colours: string | null; // JSON
  primary_image_url: string | null;
  gallery_images: string | null; // JSON
  is_featured: boolean | number;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
  category_name?: string; 
}
