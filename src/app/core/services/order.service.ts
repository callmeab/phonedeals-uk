import { Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface OrderDetails {
  orderId: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  phone?: string;
  totalUpfront: number;
  totalMonthly: number;
  status: 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled';
  date: string;
  paymentInfo: PaymentInfo;
  items: CartItem[];
  addedCharger?: boolean;
}

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
    // Simulate API call delay
    console.log(`Thank you for your order! It is being processed.`);
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
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Failed to load orders from localStorage', e);
        return [];
      }
    }
    return [];
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
