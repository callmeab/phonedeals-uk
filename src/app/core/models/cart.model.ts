export interface CartItem {
  id: string; // unique identifier
  dealId: number;
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
}
