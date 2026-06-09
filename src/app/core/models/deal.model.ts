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
  deal_highlights: string | null; // JSON string: string[]
  is_active: boolean | number;
  sort_order: number;
  product_name?: string;
}

export type DealFormData = Omit<Deal, 'id' | 'product_name'>;

export const NETWORKS = ['EE', 'O2', 'Vodafone', 'Three', 'Sky Mobile', 'iD Mobile', 'BT Mobile'] as const;
export type Network = typeof NETWORKS[number];

export const NETWORK_COLOURS: Record<string, { bg: string; text: string }> = {
  'EE':         { bg: 'bg-yellow-100',  text: 'text-yellow-800' },
  'O2':         { bg: 'bg-blue-100',    text: 'text-blue-800'   },
  'Vodafone':   { bg: 'bg-red-100',     text: 'text-red-800'    },
  'Three':      { bg: 'bg-orange-100',  text: 'text-orange-800' },
  'Sky Mobile': { bg: 'bg-teal-100',    text: 'text-teal-800'   },
  'iD Mobile':  { bg: 'bg-purple-100',  text: 'text-purple-800' },
  'BT Mobile':  { bg: 'bg-indigo-100',  text: 'text-indigo-800' },
};
