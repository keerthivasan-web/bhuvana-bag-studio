export type ProductCategory = 'elephant-bags' | 'korean-pouches' | 'totes' | 'slings' | 'moon-bags';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryTag: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  microBadge?: string;
  image: string;
  secondImage?: string;
  description: string;
  details: string[];
  availability?: boolean;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface LookbookPairing {
  id: string;
  title: string;
  tagline: string;
  totalPrice: number;
  image: string;
  label: string;
  items: string[];
}
