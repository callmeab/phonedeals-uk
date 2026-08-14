import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'pdk_cart';
  
  // The items signal holding the cart array
  items = signal<CartItem[]>(this.loadCartFromStorage());

  // Computed summaries
  itemCount = computed(() => this.items().length);
  totalMonthly = computed(() => this.items().reduce((total, item) => total + item.monthlyCost, 0));
  totalUpfront = computed(() => this.items().reduce((total, item) => total + item.upfrontCost, 0));

  constructor() {
    // Optionally we can set an effect to auto-save, or just save on mutation functions
  }

  isInCart(dealId?: number | null, productId?: number, color?: string, storage?: string): boolean {
    if (dealId) {
      return this.items().some(item => item.dealId === dealId);
    }
    if (productId) {
      return this.items().some(item =>
        item.productId === productId &&
        (color ? item.color === color : true) &&
        (storage ? item.storage === storage : true)
      );
    }
    return false;
  }

  addItem(item: CartItem): boolean {
    if (this.isInCart(item.dealId, item.productId, item.color, item.storage)) {
      return false; // Prevent duplicates explicitly
    }
    this.items.update(currentItems => {
      const newItems = [...currentItems, item];
      this.saveCartToStorage(newItems);
      return newItems;
    });
    return true;
  }

  removeItem(id: string): void {
    this.items.update(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id);
      this.saveCartToStorage(newItems);
      return newItems;
    });
  }

  clearCart(): void {
    this.items.set([]);
    this.saveCartToStorage([]);
  }

  private loadCartFromStorage(): CartItem[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Failed to load cart from localStorage', e);
        return [];
      }
    }
    return [];
  }

  private saveCartToStorage(items: CartItem[]): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }
}
