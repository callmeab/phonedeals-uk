import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8 sm:py-12 min-h-[60vh]">
      <h1 class="text-4xl font-black text-gray-900 mb-8 tracking-tight">Your Cart</h1>

      @if (cart.items().length === 0) {
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p class="text-gray-500 mb-8">Looks like you haven't added any deals to your cart yet.</p>
          <a routerLink="/" class="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Browse Deals
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <!-- LEFT: Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart.items(); track item.id) {
              <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center">
                
                <div class="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl p-2 flex items-center justify-center">
                  @if (item.primaryImageUrl) {
                    <img [src]="item.primaryImageUrl" [alt]="item.productName" class="max-w-full max-h-full object-contain">
                  }
                </div>

                <div class="flex-grow text-center sm:text-left">
                  <h3 class="text-lg font-bold text-gray-900 leading-tight mb-1">{{ item.productName }}</h3>
                  <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    <span class="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">{{ item.network }}</span>
                    <span class="text-sm font-semibold text-gray-500">{{ item.contractMonths }} Month Contract</span>
                    <span class="text-sm font-semibold text-gray-500 border-l border-gray-300 pl-2">{{ item.dataGb === 9999 ? 'Unlimited Data' : item.dataGb + 'GB Data' }}</span>
                  </div>
                </div>

                <div class="flex flex-col items-center sm:items-end w-full sm:w-auto">
                  <div class="text-2xl font-black text-gray-900">&pound;{{ item.monthlyCost.toFixed(2) }}<span class="text-sm font-medium text-gray-500">/mo</span></div>
                  <div class="text-sm text-gray-500 font-medium mb-4">
                    {{ item.upfrontCost === 0 ? 'FREE upfront' : '&pound;' + item.upfrontCost.toFixed(2) + ' upfront' }}
                  </div>
                  <button (click)="cart.removeItem(item.id)" class="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remove
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- RIGHT: Order Summary -->
          <div class="lg:col-span-1 lg:sticky lg:top-8 z-10">
            <div class="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 class="text-xl font-extrabold text-gray-900 mb-6">Cart Summary</h2>

              <div class="space-y-4 pb-6 border-b border-gray-200 mb-6">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 font-medium">Monthly Total</span>
                  <span class="text-lg font-bold text-gray-900">&pound;{{ cart.totalMonthly().toFixed(2) }}<span class="text-sm font-medium text-gray-500">/mo</span></span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-900 font-bold">Total Upfront</span>
                  <span class="text-2xl font-black text-gray-900">
                    {{ cart.totalUpfront() === 0 ? 'FREE' : '&pound;' + cart.totalUpfront().toFixed(2) }}
                  </span>
                </div>
              </div>

              <a routerLink="/checkout" class="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-extrabold text-lg py-4 px-8 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-green-600/30">
                Proceed to Checkout
              </a>
              
              <!-- Trust Badges -->
              <div class="mt-6 flex flex-col gap-3 text-sm font-semibold text-gray-500">
                <div class="flex items-center gap-3"><span class="text-green-600 w-5 text-center">🔒</span> Secure checkout</div>
                <div class="flex items-center gap-3"><span class="text-green-600 w-5 text-center">✓</span> No hidden fees</div>
                <div class="flex items-center gap-3"><span class="text-green-600 w-5 text-center">✓</span> UK-based support for all orders</div>
              </div>
            </div>
          </div>
          
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  public cart = inject(CartService);
}
