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
        
        <!-- Left Col: Sales Analytics -->
        <div class="xl:col-span-2 space-y-6">
          
          <!-- Revenue Chart -->
          <div class="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 h-full min-h-[350px] flex flex-col">
            <div class="flex items-center justify-between mb-8">
               <h2 class="text-lg font-bold text-gray-900 tracking-tight">Revenue (Last 7 Days)</h2>
               <span class="text-sm font-medium text-gray-500">Upfront Sales</span>
            </div>
            
            <div class="flex-1 flex items-end justify-between gap-2 sm:gap-4 h-full relative">
              <!-- Y-axis guide lines -->
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                 <div class="border-b border-gray-100 w-full h-full flex items-start"><span class="text-[10px] text-gray-400 -mt-2 bg-white pr-2 hidden sm:block">Max</span></div>
                 <div class="border-b border-gray-100 w-full h-full"></div>
                 <div class="border-b border-gray-100 w-full h-full"></div>
                 <div class="border-b border-gray-100 w-full h-full flex items-end"><span class="text-[10px] text-gray-400 mb-[-10px] bg-white pr-2 hidden sm:block">0</span></div>
              </div>
              
              @for (day of revenueData(); track day.label) {
                <div class="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                  <!-- tooltip -->
                  <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    {{ day.value | currency:'GBP' }}
                    <div class="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                  </div>
                  <!-- bar -->
                  <div 
                    class="w-full max-w-[48px] bg-indigo-500 rounded-t-md transition-all duration-700 ease-out group-hover:bg-indigo-600 relative" 
                    [style.height.%]="day.percentage === 0 ? 1 : day.percentage"
                  >
                     <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                  </div>
                  <span class="text-xs sm:text-sm font-medium text-gray-500 mt-3">{{ day.label }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Order Status Distribution -->
          <div class="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
             <h2 class="text-lg font-bold text-gray-900 tracking-tight mb-6">Orders Overview</h2>
             
             <div class="space-y-4">
                @for (status of statusDistribution(); track status.label) {
                   <div>
                     <div class="flex justify-between items-center mb-1">
                       <span class="text-sm font-medium text-gray-700">{{ status.label }}</span>
                       <span class="text-sm font-bold {{ status.text }}">{{ status.count }}</span>
                     </div>
                     <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                       <div class="{{ status.color }} h-2 rounded-full transition-all duration-1000 ease-out" [style.width.%]="status.percent"></div>
                     </div>
                   </div>
                }
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

  revenueData = computed(() => {
    const orders = this.orderService.orders();
    const result: { date: Date; label: string; value: number; percentage: number }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Create an array of the last 7 dates
    for(let i=6; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push({
        date: d,
        label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        value: 0,
        percentage: 0
      });
    }

    // Populate data
    orders.forEach(o => {
      const orderDate = new Date(o.date);
      orderDate.setHours(0,0,0,0);
      
      const targetDay = result.find(r => r.date.getTime() === orderDate.getTime());
      if(targetDay) {
         targetDay.value += (o.totalUpfront || 0);
      }
    });

    // Calculate percentages for chart heights
    const maxVal = Math.max(...result.map(r => r.value));
    return result.map(r => ({
      ...r,
      percentage: maxVal === 0 ? 0 : (r.value / maxVal) * 100
    }));
  });

  statusDistribution = computed(() => {
    const orders = this.orderService.orders();
    const total = orders.length || 1; // avoid divide by zero
    
    const counts = {
      Completed: 0,
      Pending: 0,
      Dispatched: 0,
      Cancelled: 0
    };
    
    orders.forEach(o => {
      if(o.status === 'Completed' || o.status === 'Pending' || o.status === 'Dispatched' || o.status === 'Cancelled') {
         counts[o.status]++;
      }
    });

    return [
      { label: 'Completed', count: counts.Completed, color: 'bg-green-500', text: 'text-green-600', percent: (counts.Completed / total) * 100 },
      { label: 'Pending', count: counts.Pending, color: 'bg-amber-500', text: 'text-amber-600', percent: (counts.Pending / total) * 100 },
      { label: 'Dispatched', count: counts.Dispatched, color: 'bg-blue-500', text: 'text-blue-600', percent: (counts.Dispatched / total) * 100 },
      { label: 'Cancelled', count: counts.Cancelled, color: 'bg-red-500', text: 'text-red-600', percent: (counts.Cancelled / total) * 100 }
    ];
  });

  ngOnInit() {
  }
}
