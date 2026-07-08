import { Component, ChangeDetectionStrategy, inject, signal, effect, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';
import { getPrimaryProductImage } from '../../../core/utils/image-url';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p class="text-sm text-gray-500 mt-1">Manage your phone devices and their details.</p>
        </div>
        <div>
          <a routerLink="/xk92-admin/products/new" class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input 
            [formControl]="searchControl"
            type="text" 
            placeholder="Search products..." 
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
          >
        </div>

        <!-- Category Filter -->
        <div class="flex bg-gray-100 p-1 rounded-lg">
          @for (cat of ['All', 'iPhone', 'Samsung']; track cat) {
            <button 
              (click)="setCategory(cat)"
              [class]="filters().category === cat ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Status Filter -->
        <div class="flex bg-gray-100 p-1 rounded-lg">
          @for (status of ['All', 'Active', 'Inactive']; track status) {
            <button 
              (click)="setStatus(status)"
              [class]="filters().status === status ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
            >
              {{ status }}
            </button>
          }
        </div>
      </div>

      <!-- Content Area -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm mt-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
              <button (click)="loadProducts()" class="mt-2 text-sm text-red-700 underline font-medium outline-none rounded focus:ring-2 focus:ring-red-500">Retry</button>
            </div>
          </div>
        </div>
      } @else if (products().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-16 mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new product or adjusting filters.</p>
          <div class="mt-6">
            <a routerLink="/xk92-admin/products/new" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add your first product
            </a>
          </div>
        </div>
      } @else {
        <!-- Desktop Table -->
        <div class="hidden sm:block mt-6 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage Options</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (product of products(); track product.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        @if (getPrimaryImage(product)) {
                          <img class="h-10 w-10 rounded-full object-cover border border-gray-200" [src]="getPrimaryImage(product)" alt="">
                        } @else {
                          <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        }
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ product.category_name || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatStorage(product.storage_options) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ product.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-3 text-gray-400">
                      <!-- Edit -->
                      <a [routerLink]="['/xk92-admin/products', product.id, 'edit']" class="hover:text-accent transition-colors" title="Edit">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                      <!-- Toggle Status -->
                      <button (click)="toggleStatus(product)" class="hover:text-gray-900 transition-colors" [title]="product.is_active ? 'Deactivate' : 'Activate'">
                        @if (product.is_active) {
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        } @else {
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        }
                      </button>
                      <!-- Delete -->
                      <button (click)="openDeleteModal(product)" class="hover:text-red-500 transition-colors" title="Delete">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile List -->
        <div class="sm:hidden mt-6 space-y-4">
          @for (product of products(); track product.id) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <div class="flex items-center space-x-4">
                @if (getPrimaryImage(product)) {
                  <img class="h-12 w-12 rounded-full object-cover border border-gray-200" [src]="getPrimaryImage(product)" alt="">
                } @else {
                  <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                }
                <div>
                  <h4 class="text-sm font-bold text-gray-900">{{ product.name }}</h4>
                  <p class="text-xs text-gray-500">{{ product.category_name || '-' }}</p>
                  <span 
                    class="mt-1 px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full"
                    [ngClass]="product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ product.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col space-y-2">
                <a [routerLink]="['/xk92-admin/products', product.id, 'edit']" class="p-2 text-gray-400 hover:text-accent bg-gray-50 rounded-md">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </a>
                <button (click)="openDeleteModal(product)" class="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-md" title="Delete">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 px-1">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ products().length > 0 ? 1 : 0 }}</span> to <span class="font-medium">{{ products().length }}</span> of <span class="font-medium">{{ totalCount() }}</span> products
            </p>
          </div>
          <div class="flex space-x-2">
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      }

      <!-- Delete Modal Overlay -->
      @if (productToDelete()) {
        <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            
            <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" (click)="closeDeleteModal()"></div>

            <!-- Modal Panel -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Delete Product</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete <strong>{{ productToDelete()?.name }}</strong>? This action cannot be undone and will also delete all associated deals.
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  (click)="confirmDelete()"
                  [disabled]="isDeleting()"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {{ isDeleting() ? 'Deleting...' : 'Delete' }}
                </button>
                <button 
                  type="button" 
                  (click)="closeDeleteModal()"
                  [disabled]="isDeleting()"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  filters = signal<{ search: string, category: string, status: string }>({
    search: '',
    category: 'All',
    status: 'All'
  });
  
  totalCount = signal(0);
  
  productToDelete = signal<Product | null>(null);
  isDeleting = signal(false);

  searchControl = new FormControl('');
  
  getPrimaryImage = getPrimaryProductImage;

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe(val => {
        this.filters.update(f => ({ ...f, search: val || '' }));
      });

    // Re-fetch automatically when filters signal changes
    effect(() => {
      const currentFilters = this.filters();
      this.loadProducts(currentFilters);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {}

  setCategory(category: string) {
    this.filters.update(f => ({ ...f, category }));
  }

  setStatus(status: string) {
    this.filters.update(f => ({ ...f, status }));
  }

  loadProducts(f = this.filters()) {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, string> = {};
    if (f.search) params['search'] = f.search;
    if (f.status !== 'All') params['is_active'] = f.status === 'Active' ? '1' : '0';
    
    // In a fully integrated app, these IDs would map dynamically from a Categories lookup signal
    if (f.category === 'iPhone') params['category_id'] = '1'; 
    if (f.category === 'Samsung') params['category_id'] = '2';

    this.api.get<ApiResponse<Product[]>>('/api/admin/products', params).subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.totalCount.set(res.data?.length || 0);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  formatStorage(storageJson: string | null): string {
    if (!storageJson) return '-';
    try {
      const parsed = JSON.parse(storageJson);
      if (Array.isArray(parsed)) return parsed.join(', ');
      return storageJson;
    } catch {
      return storageJson;
    }
  }

  toggleStatus(product: Product) {
    const newStatus = product.is_active ? 0 : 1;
    this.api.put<ApiResponse<Product>>(`/api/admin/products/${product.id}`, { is_active: newStatus })
      .subscribe({
        next: () => {
          this.loadProducts(); 
        },
        error: () => {
          this.toast.error('Failed to update product status. Please try again.');
        }
      });
  }

  openDeleteModal(product: Product) {
    this.productToDelete.set(product);
  }

  closeDeleteModal() {
    if (this.isDeleting()) return;
    this.productToDelete.set(null);
  }

  confirmDelete() {
    const product = this.productToDelete();
    if (!product) return;

    this.isDeleting.set(true);
    this.api.delete(`/api/admin/products/${product.id}`).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: () => {
        this.isDeleting.set(false);
        this.toast.error('Failed to delete product. Please try again.');
      }
    });
  }
}
