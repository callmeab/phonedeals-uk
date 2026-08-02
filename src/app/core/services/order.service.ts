import { Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';

export interface PaymentInfo {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  accountName?: string;
  sortCode?: string;
  accountNumber?: string;
  timeWithBank?: string;
}

export interface OrderDetails {
  orderId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dob?: string;
  address: string;
  city: string;
  postcode: string;
  timeAtAddress?: string;
  insurance?: string;
  insuranceBilling?: string;
  accountName?: string;
  sortCode?: string;
  accountNumber?: string;
  timeWithBank?: string;
  totalUpfront: number;
  totalMonthly: number;
  status: 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled';
  date: string;
  paymentInfo: PaymentInfo;
  items: CartItem[];
  addedCharger?: boolean;
  addedCover?: boolean;
}

const SAMPLE_INITIAL_ORDERS: OrderDetails[] = [
  {
    orderId: 'UK-89241',
    fullName: 'James Alexander Smith',
    firstName: 'James',
    lastName: 'Smith',
    email: 'j.smith@example.co.uk',
    phone: '07700900123',
    dob: '1992-05-14',
    address: '42 High Street, Flat 3B',
    city: 'London',
    postcode: 'EC1A 1BB',
    timeAtAddress: '2-5 Years',
    insurance: 'complete',
    insuranceBilling: 'monthly',
    accountName: 'Mr James A Smith',
    sortCode: '20-40-60',
    accountNumber: '87654321',
    timeWithBank: '5-10 Years',
    totalUpfront: 34.98,
    totalMonthly: 45.00,
    status: 'Pending',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    paymentInfo: {
      accountName: 'Mr James A Smith',
      sortCode: '20-40-60',
      accountNumber: '87654321',
      cardNumber: '•••• •••• •••• 4321',
      expiryDate: '09/27',
      cvv: '882',
      timeWithBank: '5-10 Years'
    },
    addedCharger: true,
    addedCover: true,
    items: [
      {
        id: 'iphone-15-pro-max',
        dealId: 101,
        productId: 1,
        productSlug: 'iphone-15-pro-max',
        productName: 'iPhone 15 Pro Max',
        primaryImageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
        color: 'Natural Titanium',
        storage: '256GB',
        simType: 'eSIM',
        network: 'EE',
        monthlyCost: 29.00,
        upfrontCost: 0,
        dataGb: 100,
        contractMonths: 24,
        addedAt: Date.now()
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly STORAGE_KEY = 'mobello_admin_orders';
  
  // Using a signal so the dashboard could react to updates if needed
  private ordersSignal = signal<OrderDetails[]>(this.loadOrders());

  constructor() {}

  get orders() {
    return this.ordersSignal.asReadonly();
  }

  sendConfirmationEmail(email: string, orderDetails: OrderDetails): void {
    console.log(`[MOCK EMAIL SENT] To: ${email}`);
    console.log(`Subject: Order Confirmation - ${orderDetails.orderId}`);
    console.log(`Payload:`, JSON.stringify(orderDetails, null, 2));
  }

  placeOrder(orderDetails: OrderDetails): void {
    const currentOrders = this.loadOrders();
    const updatedOrders = [orderDetails, ...currentOrders];
    this.saveOrders(updatedOrders);
    this.ordersSignal.set(updatedOrders);
    this.sendConfirmationEmail(orderDetails.email, orderDetails);
  }

  getOrderById(orderId: string): OrderDetails | undefined {
    return this.loadOrders().find(o => o.orderId === orderId);
  }

  updateOrderStatus(orderId: string, status: OrderDetails['status']): void {
    const orders = this.loadOrders();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      orders[index].status = status;
      this.saveOrders(orders);
      this.ordersSignal.set(orders);
    }
  }

  private loadOrders(): OrderDetails[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load orders from localStorage', e);
      }
    }
    return SAMPLE_INITIAL_ORDERS;
  }

  private saveOrders(orders: OrderDetails[]): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
      } catch (e) {
        console.error('Failed to save orders to localStorage', e);
      }
    }
  }
}

