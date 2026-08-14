export interface CartItem {
  id: string;
  dealId?: number | null;
  productId: number;
  productName: string;
  productSlug: string;
  primaryImageUrl: string;
  network: string;
  contractMonths: number;
  monthlyCost: number;
  upfrontCost: number;
  dataGb: number;
  addedAt: number;
  color?: string;
  storage?: string;
  simType?: string;
}

