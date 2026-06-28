import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { OrderService, OrderDetails } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass],
  template: `
    <div class="space-y-8 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p class="text-sm text-gray-500 mt-1">Welcome back. Here is what's happening with your store today.</p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Total Orders -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Total Orders</p>
            <div class="bg-blue-50 p-2.5 rounded-xl">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-bold text-gray-900">{{ totalOrders() }}</p>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Total Revenue</p>
            <div class="bg-green-50 p-2.5 rounded-xl">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-bold text-gray-900">{{ totalRevenue() | currency:'GBP' }}</p>
        </div>

        <!-- MRR -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Monthly Recurring (MRR)</p>
            <div class="bg-purple-50 p-2.5 rounded-xl">
              <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-bold text-gray-900">{{ mrr() | currency:'GBP' }}<span class="text-sm font-normal text-gray-500">/mo</span></p>
        </div>

        <!-- Pending Orders -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Pending Orders</p>
            <div class="bg-amber-50 p-2.5 rounded-xl">
              <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-bold text-gray-900">{{ pendingOrders() }}</p>
        </div>

      </div>

      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Left Col: Sales Analytics Placeholder -->
        <div class="xl:col-span-2">
          <div class="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 h-full min-h-[400px] flex flex-col">
            <h2 class="text-lg font-bold text-gray-900 tracking-tight">Sales Analytics</h2>
            <div class="mt-6 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 relative overflow-hidden group">
              
              <!-- Fake chart visual -->
              <div class="absolute bottom-0 left-0 w-full h-full flex items-end justify-between px-10 pb-10 opacity-30 pointer-events-none">
                <div class="w-12 bg-indigo-200 rounded-t-md" style="height: 40%;"></div>
                <div class="w-12 bg-indigo-300 rounded-t-md" style="height: 60%;"></div>
                <div class="w-12 bg-indigo-400 rounded-t-md" style="height: 30%;"></div>
                <div class="w-12 bg-indigo-500 rounded-t-md" style="height: 80%;"></div>
                <div class="w-12 bg-indigo-400 rounded-t-md" style="height: 50%;"></div>
                <div class="w-12 bg-indigo-600 rounded-t-md" style="height: 90%;"></div>
                <div class="w-12 bg-indigo-500 rounded-t-md" style="height: 70%;"></div>
              </div>

              <div class="relative z-10 text-center">
                <div class="mx-auto w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-900">Advanced Analytics Coming Soon</h3>
                <p class="mt-1 text-xs text-gray-500 max-w-[200px] mx-auto">We are building an enterprise-grade chart module to visualize your sales data.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Col: Recent Orders -->
        <div class="xl:col-span-1">
          <div class="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 h-full">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-gray-900 tracking-tight">Recent Orders</h2>
              <a routerLink="/admin/orders" class="text-sm font-medium text-accent hover:text-blue-700 transition-colors">View All</a>
            </div>

            <div class="space-y-4">
              @for (order of recentOrders(); track order.orderId) {
                <div class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span class="text-sm font-bold text-gray-600">{{ order.fullName.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{{ order.fullName }}</p>
                      <p class="text-xs text-gray-500">{{ order.orderId }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900">{{ order.totalUpfront | currency:'GBP' }}</p>
                    <p class="text-xs font-medium mt-1">
                      <span [ngClass]="{
                        'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full': order.status === 'Pending',
                        'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full': order.status === 'Dispatched',
                        'text-green-600 bg-green-50 px-2 py-0.5 rounded-full': order.status === 'Completed',
                        'text-red-600 bg-red-50 px-2 py-0.5 rounded-full': order.status === 'Cancelled'
                      }">
                        {{ order.status }}
                      </span>
                    </p>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-8">
                  <p class="text-sm text-gray-500">No recent orders found.</p>
                </div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private orderService = inject(OrderService);

  totalOrders = computed(() => this.orderService.orders().length);
  
  totalRevenue = computed(() => {
    return this.orderService.orders().reduce((sum, order) => sum + (order.totalUpfront || 0), 0);
  });

  mrr = computed(() => {
    return this.orderService.orders().reduce((sum, order) => sum + (order.totalMonthly || 0), 0);
  });

  pendingOrders = computed(() => {
    return this.orderService.orders().filter(o => o.status === 'Pending').length;
  });

  recentOrders = computed(() => {
    return this.orderService.orders().slice(0, 5);
  });

  ngOnInit() {
  }
}
