import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';

function frontendSlugify(text: string): string {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

interface WatchVariant {
  caseColour: string;
  size: string;
  bandMaterial: string;
  connectivity: string;
  condition?: string;
  grade?: string;
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  images: string[];
}

interface RefurbishedDetails {
  availableGrades: string[];
  boxIncluded: boolean;
  accessories: string[];
  notes: string;
}

/** CATEGORY_ID for Smart Watches in the DB */
const WATCHES_CATEGORY_ID = 8;

@Component({
  selector: 'app-admin-product-form-watches',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12 max-w-4xl mx-auto">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <a routerLink="/xk92-admin/products/new" class="hover:text-accent transition-colors">← Change Category</a>
        <span>/</span>
        <span class="font-semibold text-amber-700">Smart Watch</span>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-xl">⌚</span>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isEditMode() ? 'Edit Smart Watch' : 'New Smart Watch' }}</h1>
          </div>
          <p class="text-sm text-gray-500 ml-12">{{ isEditMode() ? 'Update the details for this smart watch.' : 'Add a new smart watch with sizes, bands, and connectivity variants.' }}</p>
        </div>
        <a routerLink="/xk92-admin/products"
           class="text-sm font-medium text-gray-500 hover:text-gray-700 underline focus:outline-none">
          Cancel &amp; Return
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">
        
        @if (isPageLoading()) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center">
            <app-loading-spinner size="lg"></app-loading-spinner>
            <p class="mt-4 text-sm text-gray-500 font-medium">Loading watch details...</p>
          </div>
        } @else {
          <!-- Form sections wrapper -->
          <div class="space-y-8">

        <!-- Basic Info -->
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div class="p-6 space-y-6">

            <!-- Name & Brand -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="watch-name" class="block text-sm font-medium text-gray-700">Product Name <span class="text-red-500">*</span></label>
                <input type="text" id="watch-name" formControlName="name"
                  placeholder="e.g. Apple Watch Series 10"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                  [class.border-red-300]="isFieldInvalid('name')"
                >
                @if (isFieldInvalid('name')) {
                  <p class="mt-1 text-xs text-red-600">Product name is required.</p>
                }
              </div>
              <div>
                <label for="watch-brand" class="block text-sm font-medium text-gray-700">Brand / Model Series</label>
                <select id="watch-brand" formControlName="watch_series"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border bg-white"
                >
                  <option value="">Select series...</option>
                  <option value="Apple Watch Series 10">Apple Watch Series 10</option>
                  <option value="Apple Watch SE (2nd Gen)">Apple Watch SE (2nd Gen)</option>
                  <option value="Apple Watch Ultra 2">Apple Watch Ultra 2</option>
                  <option value="Samsung Galaxy Watch 7">Samsung Galaxy Watch 7</option>
                  <option value="Samsung Galaxy Watch Ultra">Samsung Galaxy Watch Ultra</option>
                  <option value="Samsung Galaxy Watch FE">Samsung Galaxy Watch FE</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <!-- Slug -->
            <div>
              <label for="watch-slug" class="block text-sm font-medium text-gray-700">URL Slug <span class="text-red-500">*</span></label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  site.com/products/
                </span>
                <input type="text" id="watch-slug" formControlName="slug" (input)="onSlugManuallyEdited()"
                  class="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                  [class.border-red-300]="isFieldInvalid('slug')"
                >
              </div>
              @if (isFieldInvalid('slug')) {
                <p class="mt-1 text-xs text-red-600">Valid URL slug required.</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label for="watch-desc" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="watch-desc" formControlName="description" rows="4"
                placeholder="Watch features, health sensors, display, battery life..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border resize-y"
              ></textarea>
            </div>

            <!-- Condition -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Product Condition <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-3 gap-3">
                @for (cond of conditions; track cond.value) {
                  <label
                    class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200"
                    [class.border-accent]="form.get('condition')?.value === cond.value && cond.value === 'new'"
                    [class.bg-blue-50]="form.get('condition')?.value === cond.value && cond.value === 'new'"
                    [class.border-amber-400]="form.get('condition')?.value === cond.value && cond.value === 'refurbished'"
                    [class.bg-amber-50]="form.get('condition')?.value === cond.value && cond.value === 'refurbished'"
                    [class.border-purple-500]="form.get('condition')?.value === cond.value && cond.value === 'both'"
                    [class.bg-purple-50]="form.get('condition')?.value === cond.value && cond.value === 'both'"
                    [class.border-gray-200]="form.get('condition')?.value !== cond.value"
                    [class.bg-white]="form.get('condition')?.value !== cond.value"
                  >
                    <input type="radio" formControlName="condition" [value]="cond.value" class="sr-only">
                    <div class="flex flex-col gap-1">
                      <span class="text-sm font-semibold text-gray-700">{{ cond.label }}</span>
                      <span class="text-xs text-gray-500">{{ cond.desc }}</span>
                    </div>
                  </label>
                }
              </div>
            </div>

            <!-- Refurbished Details -->
            @if (form.get('condition')?.value === 'refurbished' || form.get('condition')?.value === 'both') {
              <div class="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-5 space-y-4" formGroupName="refurbished_details">
                <h4 class="text-sm font-bold text-amber-800">Refurbished Details</h4>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Cosmetic Grades Available</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    @for (grade of refurbGrades; track grade.value) {
                      <button type="button" (click)="toggleGrade(grade.value)"
                        class="rounded-lg border-2 p-3 text-left transition-colors focus:outline-none text-xs"
                        [class.border-amber-400]="availableGrades().includes(grade.value)"
                        [class.bg-white]="availableGrades().includes(grade.value)"
                        [class.border-gray-200]="!availableGrades().includes(grade.value)"
                        [class.bg-gray-50]="!availableGrades().includes(grade.value)"
                      >
                        <span class="font-bold" [style.color]="grade.color">{{ grade.label }}</span>
                        <span class="block text-gray-400 text-[10px] mt-0.5">{{ grade.desc }}</span>
                      </button>
                    }
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Box Included?</label>
                  <div class="flex gap-3">
                    <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 py-2.5 px-3 transition-all"
                      [class.border-green-400]="form.get('refurbished_details.boxIncluded')?.value === true"
                      [class.bg-green-50]="form.get('refurbished_details.boxIncluded')?.value === true"
                      [class.border-gray-200]="form.get('refurbished_details.boxIncluded')?.value !== true"
                      [class.bg-white]="form.get('refurbished_details.boxIncluded')?.value !== true"
                    >
                      <input type="radio" formControlName="boxIncluded" [value]="true" class="sr-only">
                      <span class="text-xs font-semibold"
                        [class.text-green-700]="form.get('refurbished_details.boxIncluded')?.value === true"
                        [class.text-gray-500]="form.get('refurbished_details.boxIncluded')?.value !== true">
                        ✓ Yes, Box Included
                      </span>
                    </label>
                    <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 py-2.5 px-3 transition-all"
                      [class.border-red-300]="form.get('refurbished_details.boxIncluded')?.value === false"
                      [class.bg-red-50]="form.get('refurbished_details.boxIncluded')?.value === false"
                      [class.border-gray-200]="form.get('refurbished_details.boxIncluded')?.value !== false"
                      [class.bg-white]="form.get('refurbished_details.boxIncluded')?.value !== false"
                    >
                      <input type="radio" formControlName="boxIncluded" [value]="false" class="sr-only">
                      <span class="text-xs font-semibold"
                        [class.text-red-500]="form.get('refurbished_details.boxIncluded')?.value === false"
                        [class.text-gray-500]="form.get('refurbished_details.boxIncluded')?.value !== false">
                        ✗ No Box
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
                  <textarea formControlName="notes" rows="2"
                    placeholder="e.g. Band replaced. Screen in perfect condition."
                    class="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm py-2 px-3 border resize-y"
                  ></textarea>
                </div>
              </div>
            }

            <!-- Toggles -->
            <div class="flex flex-col sm:flex-row gap-8 pt-2">
              <div class="flex items-center">
                <input id="watch-is_active" type="checkbox" formControlName="is_active"
                  class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded">
                <label for="watch-is_active" class="ml-2 block text-sm text-gray-900 font-medium">Active (Visible on site)</label>
              </div>
              <div class="flex items-center">
                <input id="watch-is_featured" type="checkbox" formControlName="is_featured"
                  class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded">
                <label for="watch-is_featured" class="ml-2 block text-sm text-gray-900 font-medium">Featured (Pinned to top)</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Sizes, Case Colours, Bands, Connectivity -->
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-900">Step 1 — Sizes, Colours, Bands &amp; Connectivity</h3>
            <p class="text-sm text-gray-500 mt-1">Har combination ke liye variant matrix generate hogi.</p>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Sizes (storage_options field reuse) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Watch Sizes</label>
              <div class="flex flex-wrap gap-2 mb-3">
                @for (size of sizes(); track size) {
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {{ size }}
                    <button type="button" (click)="removeSize(size)"
                      class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-amber-500 hover:bg-amber-200 focus:outline-none">
                      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                }
              </div>
              <input type="text" placeholder="Add size..."
                (keydown)="onSizeInput($event)"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
              >
              <p class="text-xs text-gray-400 mt-1">e.g. 40mm, 41mm, 44mm, 45mm, 49mm</p>
            </div>

            <!-- Case Colours -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Case Colours</label>
              <div class="flex flex-wrap gap-2 mb-3">
                @for (c of caseColours(); track c) {
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {{ c }}
                    <button type="button" (click)="removeCaseColour(c)"
                      class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-amber-500 hover:bg-amber-200 focus:outline-none">
                      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                }
              </div>
              <input type="text" placeholder="Add case colour..."
                (keydown)="onCaseColourInput($event)"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
              >
              <p class="text-xs text-gray-400 mt-1">e.g. Midnight, Starlight, Silver, Natural Titanium</p>
            </div>

            <!-- Band Materials -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Band Material</label>
              <div class="space-y-2">
                @for (band of bandOptions; track band) {
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      [checked]="selectedBands().includes(band)"
                      (change)="toggleBand(band)"
                      class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    >
                    <span class="text-sm text-gray-700">{{ band }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Connectivity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Connectivity</label>
              <div class="space-y-2">
                @for (conn of connectivityOptions; track conn) {
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      [checked]="connectivity().includes(conn)"
                      (change)="toggleConnectivity(conn)"
                      class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    >
                    <span class="text-sm text-gray-700">{{ conn }}</span>
                  </label>
                }
              </div>
            </div>
          </div>

          <!-- Generate Button -->
          @if (sizes().length > 0 && caseColours().length > 0) {
            <div class="px-6 pb-6">
              <button type="button" (click)="generateVariantMatrix()"
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors focus:outline-none">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate Variant Matrix
              </button>
            </div>
          }
        </div>

        <!-- Variant Table -->
        @if (variantMatrix().length > 0) {
          <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Step 2 — Pricing &amp; Stock</h3>
                <p class="text-sm text-gray-500 mt-1">Har variant ke liye price aur stock set karein.</p>
              </div>
              <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {{ variantMatrix().length }} variants
              </span>
            </div>
            <div class="flex flex-col">
              @for (colorGroup of variantsByCaseColour(); track colorGroup.caseColour) {
                <div class="border-b border-gray-100 last:border-b-0">
                  <div class="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        {{ colorGroup.caseColour }}
                      </span>
                      <span class="text-sm text-gray-500">{{ colorGroup.variants.length }} variant{{ colorGroup.variants.length === 1 ? '' : 's' }}</span>
                    </div>
                    <!-- Per-color image upload -->
                    <div class="flex items-center gap-2 flex-wrap min-w-0">
                      @if (colorImages(colorGroup.caseColour).length > 0) {
                        <div class="flex gap-1 items-center flex-wrap min-w-0">
                          <span class="text-xs text-gray-500 mr-1 whitespace-nowrap">{{ colorImages(colorGroup.caseColour).length }} image(s) uploaded</span>
                          @for (img of colorImages(colorGroup.caseColour); track img; let i = $index) {
                            <div class="relative group flex-shrink-0">
                              <img [src]="img" class="h-10 w-10 rounded-md object-cover border border-gray-200 shadow-sm">
                              <button type="button" (click)="removeVariantImage(colorGroup.caseColour, i)"
                                class="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 rounded-full p-0.5 shadow-sm hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100">
                                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          }
                        </div>
                      }
                      <label class="inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1 whitespace-nowrap">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {{ colorImages(colorGroup.caseColour).length > 0 ? 'Add more' : 'Upload images' }}
                        <input type="file" class="sr-only" accept="image/*" multiple (change)="onVariantImageSelected($event, colorGroup.caseColour)">
                      </label>
                    </div>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Band</th>
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectivity</th>
                          @if (form.get('condition')?.value !== 'new') {
                            <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Condition</th>
                          }
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (£)</th>
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sale (£)</th>
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                          <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                          <th class="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-100">
                        @for (variant of colorGroup.variants; track variant) {
                          <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-3 py-2.5 text-gray-700 text-xs font-medium">{{ variant.size }}</td>
                            <td class="px-3 py-2.5 text-gray-500 text-xs">{{ variant.bandMaterial }}</td>
                            <td class="px-3 py-2.5 text-gray-500 text-xs">{{ variant.connectivity }}</td>
                            @if (form.get('condition')?.value !== 'new') {
                              <td class="px-3 py-2.5">
                                <span class="text-xs"
                                  [class.text-blue-700]="variant.condition === 'new'"
                                  [class.text-amber-700]="variant.condition === 'refurbished'">
                                  {{ variant.condition === 'new' ? 'New' : 'Refurb' }}
                                  {{ variant.grade ? ' — ' + variant.grade : '' }}
                                </span>
                              </td>
                            }
                            <td class="px-3 py-2.5">
                              <input type="number" min="0" step="0.01" [value]="variant.price"
                                (change)="updateVariantField(variant, 'price', +$any($event.target).value)"
                                class="w-20 rounded border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-xs py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-3 py-2.5">
                              <input type="number" min="0" step="0.01" [value]="variant.salePrice ?? ''"
                                (change)="onSalePriceChange($event, variant)" placeholder="—"
                                class="w-20 rounded border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-xs py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-3 py-2.5">
                              <input type="number" min="0" step="1" [value]="variant.stock"
                                (change)="updateVariantField(variant, 'stock', +$any($event.target).value)"
                                class="w-16 rounded border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-xs py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-3 py-2.5">
                              <input type="text" [value]="variant.sku ?? ''"
                                (change)="updateVariantField(variant, 'sku', $any($event.target).value || null)"
                                placeholder="—"
                                class="w-24 rounded border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-xs py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-3 py-2.5 text-center">
                              <input type="checkbox" [checked]="variant.isActive"
                                (change)="updateVariantField(variant, 'isActive', $any($event.target).checked)"
                                class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                              >
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Error -->
        @if (submitError()) {
          <div class="rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ submitError() }}</h3>
              </div>
            </div>
          </div>
        }

        <!-- Submit Bar -->
        <div class="pt-5 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" routerLink="/xk92-admin/products/new"
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            ← Back to Categories
          </button>
          <button type="submit" [disabled]="isSubmitting() || isUploadingVariant()"
            class="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              {{ isEditMode() ? 'Update Watch' : 'Save Watch' }}
            }
          </button>
        </div>

          </div>
        }
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductFormWatchesComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    watch_series: [''],
    description: [''],
    condition: ['new'],
    is_featured: [false],
    is_active: [true],
    refurbished_details: this.fb.group({
      boxIncluded: [true],
      notes: [''],
    }),
  });

  sizes = signal<string[]>([]);
  caseColours = signal<string[]>([]);
  selectedBands = signal<string[]>([]);
  connectivity = signal<string[]>([]);
  availableGrades = signal<string[]>([]);
  variantMatrix = signal<WatchVariant[]>([]);
  manualSlug = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  isUploadingVariant = signal(false);
  
  isEditMode = signal(false);
  isPageLoading = signal(false);
  productId = signal<number | null>(null);

  variantsByCaseColour = computed(() => {
    const matrix = this.variantMatrix();
    const colorOrder = this.caseColours();
    const groups: { caseColour: string; variants: WatchVariant[] }[] = [];
    for (const caseColour of colorOrder) {
      const variants = matrix.filter(v => v.caseColour === caseColour);
      if (variants.length > 0) {
        groups.push({ caseColour, variants });
      }
    }
    return groups;
  });

  readonly conditions = [
    { value: 'new', label: 'New', desc: 'Brand new, sealed' },
    { value: 'refurbished', label: 'Refurbished', desc: 'Tested & certified' },
    { value: 'both', label: 'Both', desc: 'New & Refurb available' },
  ];

  readonly bandOptions = [
    'Sport Band',
    'Sport Loop',
    'Milanese Loop',
    'Leather Link',
    'Stainless Steel Link',
    'Rubber Band',
    'Nylon Band',
  ];

  readonly connectivityOptions = ['GPS', 'GPS + Cellular'];

  readonly refurbGrades = [
    { value: 'like_new', label: 'Like New', desc: 'Essentially perfect', color: '#059669' },
    { value: 'excellent', label: 'Excellent', desc: 'Minor wear only', color: '#0284c7' },
    { value: 'good', label: 'Good', desc: 'Visible light marks', color: '#d97706' },
    { value: 'fair', label: 'Fair', desc: 'Noticeable wear', color: '#dc2626' },
  ];

  private submitted = false;

  constructor() {
    this.form.get('name')?.valueChanges.pipe(takeUntilDestroyed()).subscribe(name => {
      if (!this.manualSlug() && name) {
        this.form.patchValue({ slug: frontendSlugify(name) }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number) {
    this.isPageLoading.set(true);
    this.api.get<{ success: boolean; data: Product }>(`/api/admin/products/${id}`).subscribe({
      next: (res) => {
        const product = res.data;
        if (!product) {
          this.toast.error('Product not found.');
          this.router.navigate(['/xk92-admin/products']);
          return;
        }

        let compatList: string[] = [];
        if (product.sim_types) {
          try {
            compatList = JSON.parse(product.sim_types) || [];
          } catch {}
        }
        
        let colorsList: string[] = [];
        if (product.colours) {
          try {
            colorsList = JSON.parse(product.colours) || [];
          } catch {}
        }

        let sizeList: string[] = [];
        if (product.storage_options) {
          try {
            sizeList = JSON.parse(product.storage_options) || [];
          } catch {}
        }
        
        let bandList: string[] = [];
        if (product.variants?.length) {
          // extract unique band materials from variants
          const uniqueBands = new Set<string>();
          product.variants.forEach((v: any) => {
            if (v.bandMaterial) uniqueBands.add(v.bandMaterial);
          });
          bandList = Array.from(uniqueBands);
        }

        let watchSeries = '';
        if (product.variants?.length) {
           watchSeries = (product.variants[0] as any).watch_series || '';
        }

        this.form.patchValue({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          condition: product.condition || 'new',
          is_featured: !!product.is_featured,
          is_active: !!product.is_active,
          watch_series: watchSeries
        });

        if (product.refurbished_details) {
          try {
            const rd = typeof product.refurbished_details === 'string' 
              ? JSON.parse(product.refurbished_details) 
              : product.refurbished_details;
            
            if (rd) {
              this.form.patchValue({
                refurbished_details: {
                  boxIncluded: rd.boxIncluded ?? true,
                  notes: rd.notes || ''
                }
              });
              if (rd.availableGrades) {
                this.availableGrades.set(rd.availableGrades);
              }
            }
          } catch {}
        }

        this.manualSlug.set(true);
        this.caseColours.set(colorsList);
        this.sizes.set(sizeList);
        this.connectivity.set(compatList);
        this.selectedBands.set(bandList);

        // Map existing variants
        if (product.variants && product.variants.length > 0) {
          const matrix: WatchVariant[] = product.variants.map((v: any) => ({
            caseColour: v.caseColour || v.colour,
            size: v.size || v.storage,
            bandMaterial: v.bandMaterial || 'Sport Band',
            connectivity: v.connectivity || 'GPS',
            condition: v.condition || product.condition || 'new',
            grade: v.grade,
            price: v.price,
            salePrice: v.sale_price,
            stock: v.stock,
            sku: v.sku,
            isActive: !!v.is_active,
            images: v.images ? (typeof v.images === 'string' ? JSON.parse(v.images) : v.images) : []
          }));
          this.variantMatrix.set(matrix);
        }

        this.isPageLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load smart watch details.');
        this.router.navigate(['/xk92-admin/products']);
      }
    });
  }

  canDeactivate(): boolean {
    if (this.form.dirty && !this.submitted) {
      return window.confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted));
  }

  onSlugManuallyEdited() { this.manualSlug.set(true); }

  onSizeInput(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value && !this.sizes().includes(value)) {
        this.sizes.update(v => [...v, value]);
        this.form.markAsDirty();
      }
      input.value = '';
    }
  }

  removeSize(val: string) {
    this.sizes.update(v => v.filter(i => i !== val));
    this.variantMatrix.update(m => m.filter(v => v.size !== val));
    this.form.markAsDirty();
  }

  onCaseColourInput(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value && !this.caseColours().includes(value)) {
        this.caseColours.update(v => [...v, value]);
        this.form.markAsDirty();
      }
      input.value = '';
    }
  }

  removeCaseColour(val: string) {
    this.caseColours.update(v => v.filter(i => i !== val));
    this.variantMatrix.update(m => m.filter(v => v.caseColour !== val));
    this.form.markAsDirty();
  }

  toggleBand(val: string) {
    this.selectedBands.update(arr =>
      arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    );
    this.form.markAsDirty();
  }

  toggleConnectivity(val: string) {
    this.connectivity.update(arr =>
      arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    );
    this.form.markAsDirty();
  }

  toggleGrade(value: string) {
    this.availableGrades.update(arr =>
      arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
    );
    this.form.markAsDirty();
  }

  generateVariantMatrix() {
    const caseColours = this.caseColours();
    const sizes = this.sizes();
    const bands = this.selectedBands().length > 0 ? this.selectedBands() : ['Sport Band'];
    const conns = this.connectivity().length > 0 ? this.connectivity() : ['GPS'];
    const condition = this.form.get('condition')?.value || 'new';
    const grades = this.availableGrades();
    const existing = this.variantMatrix();

    const conditionLoop: string[] =
      condition === 'both' ? ['new', 'refurbished'] : [condition];
    const gradesLoop = grades.length > 0 ? grades : [undefined as unknown as string];

    const newMatrix: WatchVariant[] = [];
    for (const caseColour of caseColours) {
      for (const size of sizes) {
        for (const band of bands) {
          for (const conn of conns) {
            for (const cond of conditionLoop) {
              const currentGrades = cond === 'refurbished' ? gradesLoop : [undefined as unknown as string];
              for (const grade of currentGrades) {
                const prev = existing.find(v =>
                  v.caseColour === caseColour && v.size === size &&
                  v.bandMaterial === band && v.connectivity === conn &&
                  v.condition === cond && v.grade === grade
                );
                newMatrix.push({
                  caseColour, size, bandMaterial: band, connectivity: conn,
                  condition: cond as 'new' | 'refurbished',
                  ...(grade ? { grade } : {}),
                  price: prev?.price ?? 0,
                  salePrice: prev?.salePrice ?? null,
                  stock: prev?.stock ?? 0,
                  sku: prev?.sku ?? null,
                  isActive: prev?.isActive ?? true,
                  images: prev?.images ?? [],
                });
              }
            }
          }
        }
      }
    }
    this.variantMatrix.set(newMatrix);
    this.form.markAsDirty();
  }

  updateVariantField(variant: WatchVariant, field: keyof WatchVariant, value: any) {
    this.variantMatrix.update(matrix =>
      matrix.map(v => v === variant ? { ...v, [field]: value } : v)
    );
    this.form.markAsDirty();
  }

  onSalePriceChange(event: Event, variant: WatchVariant) {
    const val = (event.target as HTMLInputElement).value;
    this.updateVariantField(variant, 'salePrice', val ? +val : null);
  }

  colorImages(caseColour: string): string[] {
    const variant = this.variantMatrix().find(v => v.caseColour === caseColour);
    return variant?.images ?? [];
  }

  removeVariantImage(caseColour: string, index: number) {
    this.variantMatrix.update(matrix =>
      matrix.map(v => {
        if (v.caseColour === caseColour) {
          const imgs = [...v.images];
          imgs.splice(index, 1);
          return { ...v, images: imgs };
        }
        return v;
      })
    );
    this.form.markAsDirty();
  }

  onVariantImageSelected(event: Event, caseColour: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    this.isUploadingVariant.set(true);
    void (async () => {
      try {
        const uploadedUrls: string[] = [];
        for (const file of files.slice(0, 6)) {
          const url = await this.uploadSingleFile(file);
          if (url) uploadedUrls.push(url);
        }
        this.variantMatrix.update(matrix =>
          matrix.map(v => {
            if (v.caseColour === caseColour) {
              return { ...v, images: [...v.images, ...uploadedUrls] };
            }
            return v;
          })
        );
        this.form.markAsDirty();
      } catch {
        this.toast.warning('One or more variant images failed to upload.');
      } finally {
        this.isUploadingVariant.set(false);
        input.value = '';
      }
    })();
  }

  private async uploadSingleFile(file: File): Promise<string | null> {
    const contentType = file.type || 'application/octet-stream';
    const presignRes = await firstValueFrom(
      this.api.post<{
        success: boolean;
        data: { uploadUrl: string | null; publicUrl: string; filename: string; useDirectUpload?: boolean; };
      }>('/api/admin/upload-url', {
        filename: file.name,
        contentType: contentType,
        type: 'products'
      })
    );
    if (!presignRes.success) throw new Error('Failed to get presigned URL');
    
    const { uploadUrl, publicUrl, filename, useDirectUpload } = presignRes.data;

    if (useDirectUpload || !uploadUrl) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', filename);
      await firstValueFrom(
        this.api.post<{ success: boolean; data: { publicUrl: string } }>('/api/admin/upload', formData)
      );
    } else {
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType },
      });
      if (!putRes.ok) {
        throw new Error(`R2 PUT failed: ${putRes.status}`);
      }
    }
    return publicUrl;
  }

  onSubmit() {
    this.submitted = true;
    this.submitError.set(null);
    Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());

    if (this.form.invalid) {
      this.submitError.set('Please fill out all required fields correctly.');
      this.submitted = false;
      return;
    }
    if (this.sizes().length === 0 || this.caseColours().length === 0) {
      this.submitError.set('Kam se kam ek size aur ek case colour add karein phir variant matrix generate karein.');
      this.submitted = false;
      return;
    }
    if (this.variantMatrix().length === 0) {
      this.submitError.set('"Generate Variant Matrix" button press karein pehle.');
      this.submitted = false;
      return;
    }

    this.isSubmitting.set(true);

    const condition = this.form.get('condition')?.value || 'new';
    const hasRefurb = condition === 'refurbished' || condition === 'both';
    const rdForm = this.form.get('refurbished_details')?.value as any;

    const refurbDetails: RefurbishedDetails | null = hasRefurb ? {
      availableGrades: this.availableGrades(),
      boxIncluded: rdForm?.boxIncluded ?? true,
      accessories: [],
      notes: rdForm?.notes || '',
    } : null;

    const { refurbished_details: _rd, watch_series: _ws, ...baseForm } = this.form.value as any;

    // Map watch-specific fields to existing product schema:
    // - sizes → storage_options (reused for watch sizes)
    // - connectivity → sim_types (GPS / GPS+Cellular)
    // - caseColours → colours
    // - band/size/connectivity stored inside each variant object
    const payload = {
      ...baseForm,
      category_id: WATCHES_CATEGORY_ID,
      condition,
      refurbished_details: refurbDetails,
      storage_options: this.sizes(),
      colours: this.caseColours(),
      sim_types: this.connectivity(),
      variants: this.variantMatrix(),
    };

    const request = this.isEditMode() 
      ? this.api.put(`/api/admin/products/${this.productId()}`, payload)
      : this.api.post('/api/admin/products', payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode() ? 'Smart Watch updated successfully!' : 'Smart Watch saved successfully!');
        this.router.navigate(['/xk92-admin/products']);
      },
      error: (err: Error) => {
        this.submitError.set(err.message || 'Failed to save smart watch. Please try again.');
        this.isSubmitting.set(false);
        this.submitted = false;
      }
    });
  }
}
