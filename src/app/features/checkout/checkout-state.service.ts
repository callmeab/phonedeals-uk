import { Injectable, signal } from '@angular/core';
import { Deal } from '../../core/models/deal.model';

export interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  county?: string | null;
  postcode: string;
}

export interface CustomerDetails {
  title?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  mobile: string;
  marketingOptIn: boolean;
}

export interface CheckoutState {
  customer: CustomerDetails | null;
  deliveryAddress: Address | null;
  billingAddress: Address | null;
  sameAsDelivery: boolean;
  selectedDeal: Deal | null;
  termsAccepted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutStateService {
  private _state = signal<CheckoutState>({
    customer: null,
    deliveryAddress: null,
    billingAddress: null,
    sameAsDelivery: true,
    selectedDeal: {
      id: 1,
      product_id: 1,
      network: 'EE',
      contract_months: 24,
      monthly_cost: 29.99,
      upfront_cost: 0,
      data_gb: 9999,
      minutes: 9999,
      texts: 9999,
      deal_highlights: null,
      is_active: true,
      sort_order: 0,
      product_name: 'Apple iPhone 16 Pro Max 256GB'
    },
    termsAccepted: false
  });

  readonly state = this._state.asReadonly();

  setStep1Details(customer: CustomerDetails, delivery: Address, billing: Address | null, sameAsDelivery: boolean) {
    this._state.update(curr => ({
      ...curr,
      customer,
      deliveryAddress: delivery,
      billingAddress: billing,
      sameAsDelivery
    }));
  }

  clearState() {
    this._state.update(curr => ({
      customer: null,
      deliveryAddress: null,
      billingAddress: null,
      sameAsDelivery: true,
      selectedDeal: curr.selectedDeal,
      termsAccepted: false
    }));
  }
}
