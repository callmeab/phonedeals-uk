export interface Product {
  id: string;
  brand: 'Apple' | 'Samsung';
  model: string;
  slug: string;
  storageOptions: string[];
  colors: string[];
  imageUrl: string;
  description: string;
  features: string[];
  categoryId: string;
  releaseDate?: Date | string;
  createdAt?: string;
  updatedAt?: string;
}
