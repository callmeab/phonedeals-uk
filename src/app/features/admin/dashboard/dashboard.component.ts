import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface RecentProduct {
  id: number;
  name: string;
  is_active: boolean | number;
  created_at: string;
  category_name?: string;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalDeals: number;
  activeDeals: number;
  iPhoneProducts: number;
  samsungProducts: number;
  recentProducts: RecentProduct[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header & CTAs -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p class="text-sm text-gray-500 mt-1">High-level metrics and recent activity across your platform.</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/xk92-admin/deals/new" class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
            + Add New Deal
          </a>
          <a routerLink="/xk92-admin/products/new" class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
            + Add New Product
          </a>
        </div>
      </div>

      <!-- State Handling -->
      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <app-loading-spinner size="lg"></app-loading-spinner>
          <p class="mt-4 text-sm text-gray-500 font-medium">Loading dashboard statistics...</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm mt-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
              <div class="mt-2 text-sm text-red-700">
                <button (click)="loadStats()" class="font-medium underline hover:text-red-600 outline-none focus:ring-2 focus:ring-red-500 rounded px-1">Try again</button>
              </div>
            </div>
          </div>
        </div>
      } @else if (stats()) {
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6">
          
          <!-- Card 1 -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p class="text-sm font-medium text-gray-500 truncate">Total Products</p>
              <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats()?.totalProducts }}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg">
              <svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p class="text-sm font-medium text-gray-500 truncate">Active Deals</p>
              <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats()?.activeDeals }}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <svg class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p class="text-sm font-medium text-gray-500 truncate">iPhone Devices</p>
              <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats()?.iPhoneProducts }}</p>
            </div>
            <div class="bg-gray-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <!-- Generic Apple/Phone representation -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p class="text-sm font-medium text-gray-500 truncate">Samsung Devices</p>
              <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats()?.samsungProducts }}</p>
            </div>
            <div class="bg-gray-100 p-3 rounded-lg">
              <!-- S initial icon representation -->
              <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

        </div>

        <!-- Recent Products Table -->
        <div class="mt-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Recently Added Products</h2>
          <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (product of stats()?.recentProducts; track product.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">{{ product.category_name || 'Uncategorized' }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        >
                          {{ product.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ product.created_at | date:'mediumDate' }}
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="px-6 py-8 text-center text-gray-500 text-sm">
                        No products found. Start by adding a new product.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard-stats').subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load dashboard statistics.');
        this.isLoading.set(false);
      }
    });
  }
}
