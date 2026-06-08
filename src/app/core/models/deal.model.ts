export interface Deal {
  id: string;
  productId: string;
  provider: 'O2' | 'Vodafone' | 'Three' | 'EE' | string;
  dataAllowanceGB: number | 'Unlimited';
  minutesAllowance: number | 'Unlimited';
  textsAllowance: number | 'Unlimited';
  upfrontCost: number;
  monthlyCost: number;
  contractLengthMonths: number;
  perks?: string[];
  link: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
