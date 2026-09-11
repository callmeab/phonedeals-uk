export interface PreorderProduct {
  id: number;
  model: 'iPhone 18 Pro' | 'iPhone 18 Pro Max';
  display_size: string;
  storage: '256GB' | '512GB' | '1TB' | '2TB';
  color: 'Black' | 'Silver' | 'Glacier' | 'Burgundy';
  price_gbp: number;
  deposit_amount: number;
  stock_status: string;
  release_date: string;
  image_path: string;
}

export interface PreorderColor {
  name: 'Black' | 'Silver' | 'Glacier' | 'Burgundy';
  hex: string;
  label: string;
}

export interface PreorderApiResponse {
  success: boolean;
  data: {
    series: string;
    chip: string;
    preorderDate: string;
    releaseDate: string;
    depositAmountGbp: number;
    depositPolicy: string;
    models: {
      name: 'iPhone 18 Pro' | 'iPhone 18 Pro Max';
      display: string;
      startingPrice: number;
    }[];
    colors: PreorderColor[];
    storages: ('256GB' | '512GB' | '1TB' | '2TB')[];
    variants: PreorderProduct[];
  };
}

export interface PreorderReservationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  model: string;
  storage: string;
  color: string;
  purchaseType: 'outright' | 'contract';
  network?: string;
  marketingOptIn?: boolean;
}

export interface PreorderReservationResult {
  id: string;
  reservationRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  model: string;
  storage: string;
  color: string;
  purchaseType: 'outright' | 'contract';
  network: string;
  priceGbp: number;
  depositAmount: number;
  imagePath: string;
  releaseDate: string;
}
