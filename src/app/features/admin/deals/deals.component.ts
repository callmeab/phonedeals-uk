import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, FormArray } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Deal, NETWORKS, NETWORK_COLOURS } from '../../../core/models/deal.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-deals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-16">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Deals</h1>
          <p class="text-sm text-gray-500 mt-1">Manage network deals for each product.</p>
        </div>
        @if (selectedProduct()) {
          <button
            (click)="openDrawer(null)"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Deal
          </button>
        }
      </div>

      <!-- Product Selector -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
        <div class="relative max-w-lg">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products by name..."
            [value]="productSearch()"
            (input)="onProductSearch($event)"
            (focus)="showDropdown.set(true)"
            (blur)="onSearchBlur()"
            class="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          >

          <!-- Product Dropdown -->
          @if (showDropdown() && filteredProducts().length > 0) {
            <div class="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
              @for (product of filteredProducts(); track product.id) {
                <button
                  type="button"
                  (mousedown)="selectProduct(product)"
                  class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  [class.bg-blue-50]="selectedProduct()?.id === product.id"
                >
                  <span class="text-sm font-medium text-gray-900">{{ product.name }}</span>
                  <span class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full"
                    [ngClass]="product.category_name === 'Apple iPhone' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ product.category_name || 'Unknown' }}
                  </span>
                </button>
              }
            </div>
          }
          @if (showDropdown() && productSearch().length > 0 && filteredProducts().length === 0 && !isLoadingProducts()) {
            <div class="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 text-sm text-gray-500">
              No products found for "{{ productSearch() }}"
            </div>
          }
        </div>

        <!-- Selected product chip -->
        @if (selectedProduct()) {
          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
            <svg class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span class="text-sm font-semibold text-accent">{{ selectedProduct()!.name }}</span>
            <button (click)="clearProduct()" class="text-accent/60 hover:text-accent ml-1 focus:outline-none">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }
      </div>

      <!-- Deals Content Area -->
      @if (!selectedProduct()) {
        <!-- No product selected -->
        <div class="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
          <svg class="h-14 w-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          <h3 class="mt-4 text-base font-semibold text-gray-500">Select a product above to manage its deals</h3>
          <p class="mt-1 text-sm text-gray-400">Search for a phone model to view and add network deals.</p>
        </div>

      } @else if (isLoadingDeals()) {
        <div class="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>

      } @else if (deals().length === 0) {
        <!-- Product selected, no deals -->
        <div class="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
          <svg class="h-14 w-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
          </svg>
          <h3 class="mt-4 text-base font-semibold text-gray-500">No deals yet for {{ selectedProduct()!.name }}</h3>
          <p class="mt-1 text-sm text-gray-400">Add the first deal to get it live on the storefront.</p>
          <button (click)="openDrawer(null)" class="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors shadow-sm">
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add First Deal
          </button>
        </div>

      } @else {
        <!-- Deals Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          @for (deal of deals(); track deal.id) {
            <div
              class="bg-white rounded-xl border shadow-sm flex flex-col transition-shadow hover:shadow-md"
              [class.opacity-60]="!deal.is_active"
              [class.border-gray-200]="deal.is_active"
              [class.border-dashed]="!deal.is_active"
            >
              <!-- Card Header: Network + Status -->
              <div class="flex items-center justify-between px-5 pt-5 pb-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"
                    [ngClass]="getNetworkClasses(deal.network)"
                  >
                    {{ deal.network }}
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                    {{ deal.contract_months }} months
                  </span>
                </div>
                <!-- Active toggle -->
                <button
                  (click)="toggleDealStatus(deal)"
                  class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                  [class.bg-accent]="deal.is_active"
                  [class.bg-gray-200]="!deal.is_active"
                  [title]="deal.is_active ? 'Deactivate' : 'Activate'"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    [class.translate-x-4]="deal.is_active"
                    [class.translate-x-0]="!deal.is_active"
                  ></span>
                </button>
              </div>

              <!-- Pricing -->
              <div class="px-5 py-2">
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold text-gray-900">£{{ deal.monthly_cost.toFixed(2) }}</span>
                  <span class="text-sm text-gray-500 font-medium">/mo</span>
                </div>
                @if (deal.upfront_cost > 0) {
                  <p class="text-sm text-gray-500 mt-0.5">+ £{{ deal.upfront_cost.toFixed(2) }} upfront</p>
                } @else {
                  <p class="text-xs text-green-600 font-medium mt-0.5">No upfront cost</p>
                }
              </div>

              <!-- Data + Allowances -->
              <div class="px-5 pb-3">
                <div class="flex flex-wrap gap-2 mt-2">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    {{ deal.data_gb === 9999 ? 'Unlimited data' : deal.data_gb + 'GB data' }}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {{ deal.minutes === 9999 ? 'Unlimited mins' : deal.minutes + ' mins' }}
                  </span>
                </div>
              </div>

              <!-- Deal Highlights -->
              @if (parseHighlights(deal.deal_highlights).length > 0) {
                <div class="px-5 pb-4">
                  <ul class="space-y-1">
                    @for (h of parseHighlights(deal.deal_highlights); track h) {
                      <li class="flex items-start gap-2 text-xs text-gray-600">
                        <svg class="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ h }}
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Card Footer: Actions -->
              <div class="mt-auto px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
                <button (click)="openDrawer(deal)" class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  Edit
                </button>
                <button (click)="openDeleteConfirm(deal)" class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- =========================
           SLIDE-IN DRAWER OVERLAY
           ========================= -->
      @if (drawerOpen()) {
        <!-- Backdrop -->
        <div
          class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          (click)="closeDrawer()"
        ></div>

        <!-- Drawer Panel -->
        <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white shadow-2xl transform transition-transform duration-300"
             [class.translate-x-0]="drawerOpen()"
        >
          <!-- Drawer Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h2 class="text-lg font-bold text-gray-900">
              {{ editingDeal() ? 'Edit Deal' : 'Add New Deal' }}
            </h2>
            <button (click)="closeDrawer()" class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-1">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Drawer Form Body -->
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <form [formGroup]="dealForm" (ngSubmit)="onSaveDeal()" class="space-y-5">

              <!-- Network -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Network <span class="text-red-500">*</span></label>
                <select formControlName="network" class="block w-full rounded-md border-gray-300 border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-white"
                  [class.border-red-400]="isDrawerFieldInvalid('network')"
                >
                  <option value="" disabled>Select network...</option>
                  @for (net of networks; track net) {
                    <option [value]="net">{{ net }}</option>
                  }
                </select>
                @if (isDrawerFieldInvalid('network')) {
                  <p class="mt-1 text-xs text-red-600">Network is required.</p>
                }
              </div>

              <!-- Contract Length -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Contract Length <span class="text-red-500">*</span></label>
                <div class="flex gap-2">
                  @for (months of [12, 24, 36]; track months) {
                    <button
                      type="button"
                      (click)="dealForm.get('contract_months')?.setValue(months)"
                      class="flex-1 py-2 rounded-md border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                      [class.bg-accent]="dealForm.get('contract_months')?.value === months"
                      [class.text-white]="dealForm.get('contract_months')?.value === months"
                      [class.border-accent]="dealForm.get('contract_months')?.value === months"
                      [class.border-gray-300]="dealForm.get('contract_months')?.value !== months"
                      [class.text-gray-600]="dealForm.get('contract_months')?.value !== months"
                    >
                      {{ months }} mo
                    </button>
                  }
                </div>
              </div>

              <!-- Monthly + Upfront Cost -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Cost <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm pointer-events-none">£</span>
                    <input type="number" step="0.01" min="0.01" formControlName="monthly_cost" placeholder="0.00"
                      class="block w-full pl-7 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      [class.border-red-400]="isDrawerFieldInvalid('monthly_cost')"
                      [class.border-gray-300]="!isDrawerFieldInvalid('monthly_cost')"
                    >
                  </div>
                  @if (isDrawerFieldInvalid('monthly_cost')) {
                    <p class="mt-1 text-xs text-red-600">Required, must be > 0.</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Upfront Cost</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm pointer-events-none">£</span>
                    <input type="number" step="0.01" min="0" formControlName="upfront_cost" placeholder="0.00"
                      class="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    >
                  </div>
                </div>
              </div>

              <!-- Data Allowance -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data Allowance <span class="text-red-500">*</span></label>
                <div class="flex items-center gap-3">
                  <div class="relative flex-1">
                    <input type="number" min="1" formControlName="data_gb" placeholder="e.g. 100"
                      class="block w-full pr-10 py-2 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      [class.border-red-400]="isDrawerFieldInvalid('data_gb')"
                      [class.border-gray-300]="!isDrawerFieldInvalid('data_gb')"
                      [disabled]="unlimitedData()"
                    >
                    <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs pointer-events-none">GB</span>
                  </div>
                  <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" [checked]="unlimitedData()" (change)="toggleUnlimited('data', $event)"
                      class="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent">
                    <span class="text-sm text-gray-600">Unlimited</span>
                  </label>
                </div>
                @if (isDrawerFieldInvalid('data_gb')) {
                  <p class="mt-1 text-xs text-red-600">Data allowance is required.</p>
                }
              </div>

              <!-- Minutes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                <div class="flex items-center gap-3">
                  <div class="relative flex-1">
                    <input type="number" min="1" formControlName="minutes" placeholder="e.g. 500"
                      class="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      [disabled]="unlimitedMinutes()"
                    >
                  </div>
                  <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" [checked]="unlimitedMinutes()" (change)="toggleUnlimited('minutes', $event)"
                      class="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent">
                    <span class="text-sm text-gray-600">Unlimited</span>
                  </label>
                </div>
              </div>

              <!-- Deal Highlights -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">Deal Highlights</label>
                  @if (highlights.length < 4) {
                    <button type="button" (click)="addHighlight()" class="text-xs text-accent font-medium hover:text-blue-700 focus:outline-none">
                      + Add highlight
                    </button>
                  }
                </div>
                <div formArrayName="deal_highlights" class="space-y-2">
                  @for (ctrl of highlights.controls; track $index; let i = $index) {
                    <div class="flex gap-2">
                      <input type="text" [formControlName]="i" placeholder="e.g. 5G Ready, Free Disney+"
                        class="flex-1 block py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      >
                      <button type="button" (click)="removeHighlight(i)" class="text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" min="0" formControlName="sort_order" placeholder="0"
                  class="block w-24 py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                >
                <p class="mt-1 text-xs text-gray-400">Lower number = higher position. Leave at 0 for default.</p>
              </div>

              <!-- Status -->
              <div class="flex items-center justify-between py-3 border-t border-gray-100">
                <label class="text-sm font-medium text-gray-700">Active (visible on site)</label>
                <button
                  type="button"
                  (click)="dealForm.get('is_active')?.setValue(!dealForm.get('is_active')?.value)"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  [class.bg-accent]="dealForm.get('is_active')?.value"
                  [class.bg-gray-200]="!dealForm.get('is_active')?.value"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    [class.translate-x-5]="dealForm.get('is_active')?.value"
                    [class.translate-x-0]="!dealForm.get('is_active')?.value"
                  ></span>
                </button>
              </div>

              <!-- Drawer-level error -->
              @if (drawerError()) {
                <div class="rounded-md bg-red-50 p-3 border border-red-200">
                  <p class="text-sm text-red-700">{{ drawerError() }}</p>
                </div>
              }

            </form>
          </div>

          <!-- Drawer Footer -->
          <div class="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button type="button" (click)="closeDrawer()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent transition-colors">
              Cancel
            </button>
            <button type="button" (click)="onSaveDeal()" [disabled]="isSaving()"
              class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              @if (isSaving()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              } @else {
                {{ editingDeal() ? 'Update Deal' : 'Save Deal' }}
              }
            </button>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (dealToDelete()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-gray-900/60" (click)="dealToDelete.set(null)"></div>
          <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 z-10">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Delete Deal?</h3>
                <p class="mt-1 text-sm text-gray-500">This will permanently remove the <strong>{{ dealToDelete()!.network }}</strong> {{ dealToDelete()!.contract_months }}-month deal. This cannot be undone.</p>
              </div>
            </div>
            <div class="mt-5 flex justify-end gap-3">
              <button (click)="dealToDelete.set(null)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent">
                Cancel
              </button>
              <button (click)="confirmDelete()" [disabled]="isDeleting()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
                {{ isDeleting() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDealsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(NonNullableFormBuilder);

  // --- Data signals ---
  allProducts = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  deals = signal<Deal[]>([]);

  // --- UI state ---
  isLoadingProducts = signal(false);
  isLoadingDeals = signal(false);
  productSearch = signal('');
  showDropdown = signal(false);
  drawerOpen = signal(false);
  editingDeal = signal<Deal | null>(null);
  isSaving = signal(false);
  drawerError = signal<string | null>(null);
  dealToDelete = signal<Deal | null>(null);
  isDeleting = signal(false);
  unlimitedData = signal(false);
  unlimitedMinutes = signal(false);

  readonly networks = NETWORKS;

  filteredProducts = computed(() => {
    const q = this.productSearch().toLowerCase().trim();
    if (!q) return this.allProducts();
    return this.allProducts().filter(p => p.name.toLowerCase().includes(q));
  });

  dealForm = this.fb.group({
    network: ['', Validators.required],
    contract_months: [24, Validators.required],
    monthly_cost: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    upfront_cost: [0],
    data_gb: [null as unknown as number, Validators.required],
    minutes: [9999],
    texts: [9999],
    deal_highlights: this.fb.array([] as string[]),
    is_active: [true],
    sort_order: [0]
  });

  get highlights(): FormArray {
    return this.dealForm.get('deal_highlights') as FormArray;
  }

  private drawerSubmitted = false;

  constructor() {}

  ngOnInit() {
    this.loadAllProducts();

    // Auto-select from URL query param
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params.get('product_id');
      if (id) {
        // Wait for products to load, then select
        const trySelect = () => {
          const found = this.allProducts().find(p => p.id === +id);
          if (found) {
            this.selectProduct(found);
          }
        };
        if (this.allProducts().length > 0) {
          trySelect();
        } else {
          // Retry after products load
          const interval = setInterval(() => {
            if (this.allProducts().length > 0) {
              trySelect();
              clearInterval(interval);
            }
          }, 100);
        }
      }
    });
  }

  loadAllProducts() {
    this.isLoadingProducts.set(true);
    this.api.get<{ success: boolean; data: Product[] }>('/api/admin/products').subscribe({
      next: res => {
        this.allProducts.set(res.data || []);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false)
    });
  }

  onProductSearch(event: Event) {
    this.productSearch.set((event.target as HTMLInputElement).value);
    this.showDropdown.set(true);
  }

  onSearchBlur() {
    // Delay to allow mousedown on dropdown to fire first
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.productSearch.set(product.name);
    this.showDropdown.set(false);
    this.loadDeals(product.id);

    // Sync URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { product_id: product.id },
      queryParamsHandling: 'merge'
    });
  }

  clearProduct() {
    this.selectedProduct.set(null);
    this.productSearch.set('');
    this.deals.set([]);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  loadDeals(productId: number) {
    this.isLoadingDeals.set(true);
    this.api.get<{ success: boolean; data: Deal[] }>('/api/admin/deals', { product_id: String(productId) }).subscribe({
      next: res => {
        this.deals.set(res.data || []);
        this.isLoadingDeals.set(false);
      },
      error: () => this.isLoadingDeals.set(false)
    });
  }

  getNetworkClasses(network: string): string {
    const colours = NETWORK_COLOURS[network];
    if (!colours) return 'bg-gray-100 text-gray-700';
    return `${colours.bg} ${colours.text}`;
  }

  parseHighlights(json: string | null): string[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  toggleDealStatus(deal: Deal) {
    const newStatus = deal.is_active ? 0 : 1;
    this.api.put<{ success: boolean }>(`/api/admin/deals/${deal.id}`, { is_active: newStatus }).subscribe({
      next: () => {
        this.deals.update(list => list.map(d => d.id === deal.id ? { ...d, is_active: newStatus } : d));
      }
    });
  }

  openDeleteConfirm(deal: Deal) {
    this.dealToDelete.set(deal);
  }

  confirmDelete() {
    const deal = this.dealToDelete();
    if (!deal) return;
    this.isDeleting.set(true);
    this.api.delete(`/api/admin/deals/${deal.id}`).subscribe({
      next: () => {
        this.deals.update(list => list.filter(d => d.id !== deal.id));
        this.isDeleting.set(false);
        this.dealToDelete.set(null);
      },
      error: () => this.isDeleting.set(false)
    });
  }

  // --- Drawer ---
  openDrawer(deal: Deal | null) {
    this.editingDeal.set(deal);
    this.drawerError.set(null);
    this.drawerSubmitted = false;

    // Reset highlights array
    while (this.highlights.length) this.highlights.removeAt(0);

    if (deal) {
      // Edit mode: populate form
      const hl = this.parseHighlights(deal.deal_highlights);
      hl.forEach(h => this.highlights.push(this.fb.control(h)));

      this.unlimitedData.set(deal.data_gb === 9999);
      this.unlimitedMinutes.set(deal.minutes === 9999);

      this.dealForm.patchValue({
        network: deal.network,
        contract_months: deal.contract_months,
        monthly_cost: deal.monthly_cost,
        upfront_cost: deal.upfront_cost,
        data_gb: deal.data_gb === 9999 ? (null as unknown as number) : deal.data_gb,
        minutes: deal.minutes === 9999 ? 9999 : deal.minutes,
        texts: deal.texts,
        is_active: !!deal.is_active,
        sort_order: deal.sort_order
      });
    } else {
      // Create mode: reset to defaults
      this.unlimitedData.set(false);
      this.unlimitedMinutes.set(true);
      this.dealForm.reset({
        network: '',
        contract_months: 24,
        monthly_cost: null as unknown as number,
        upfront_cost: 0,
        data_gb: null as unknown as number,
        minutes: 9999,
        texts: 9999,
        is_active: true,
        sort_order: 0
      });
    }

    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
    this.editingDeal.set(null);
  }

  toggleUnlimited(field: 'data' | 'minutes', event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (field === 'data') {
      this.unlimitedData.set(checked);
      if (checked) this.dealForm.get('data_gb')?.setValue(9999);
      else this.dealForm.get('data_gb')?.setValue(null as unknown as number);
    } else {
      this.unlimitedMinutes.set(checked);
      if (checked) this.dealForm.get('minutes')?.setValue(9999);
    }
  }

  addHighlight() {
    if (this.highlights.length < 4) {
      this.highlights.push(this.fb.control(''));
    }
  }

  removeHighlight(index: number) {
    this.highlights.removeAt(index);
  }

  isDrawerFieldInvalid(field: string): boolean {
    const c = this.dealForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched || this.drawerSubmitted));
  }

  onSaveDeal() {
    this.drawerSubmitted = true;
    this.drawerError.set(null);

    Object.values(this.dealForm.controls).forEach(c => c.markAsTouched());
    if (this.dealForm.invalid) {
      this.drawerError.set('Please fix the errors above before saving.');
      return;
    }

    const product = this.selectedProduct();
    if (!product) return;

    this.isSaving.set(true);

    const raw = this.dealForm.getRawValue();
    const payload = {
      product_id: product.id,
      network: raw.network,
      contract_months: raw.contract_months,
      monthly_cost: raw.monthly_cost,
      upfront_cost: raw.upfront_cost ?? 0,
      data_gb: this.unlimitedData() ? 9999 : raw.data_gb,
      minutes: this.unlimitedMinutes() ? 9999 : raw.minutes,
      texts: raw.texts ?? 9999,
      deal_highlights: raw.deal_highlights.filter((h: string) => h.trim().length > 0),
      is_active: raw.is_active,
      sort_order: raw.sort_order ?? 0
    };

    const editing = this.editingDeal();
    const req = editing
      ? this.api.put<{ success: boolean; data: Deal }>(`/api/admin/deals/${editing.id}`, payload)
      : this.api.post<{ success: boolean; data: Deal }>('/api/admin/deals', payload);

    req.subscribe({
      next: res => {
        if (editing) {
          this.deals.update(list => list.map(d => d.id === editing.id ? res.data : d));
        } else {
          this.deals.update(list => [...list, res.data]);
        }
        this.isSaving.set(false);
        this.closeDrawer();
      },
      error: (err: Error) => {
        this.drawerError.set(err.message || 'Failed to save deal. Please try again.');
        this.isSaving.set(false);
      }
    });
  }
}
