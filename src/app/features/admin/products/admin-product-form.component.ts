import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';
import { ProductVariant, RefurbishedDetails } from '../../../core/models/product.model';

function frontendSlugify(text: string): string {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12 max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isEditMode() ? 'Edit Product' : 'Create New Product' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEditMode() ? 'Update the details for this device.' : 'Add a new phone to your catalog.' }}</p>
        </div>
        <a routerLink="/xk92-admin/products" class="text-sm font-medium text-gray-500 hover:text-gray-700 underline focus:outline-none">
          Cancel &amp; Return
        </a>
      </div>

      <!-- Main Form Loading Overlay -->
      @if (isPageLoading()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center">
          <app-loading-spinner size="lg"></app-loading-spinner>
          <p class="mt-4 text-sm text-gray-500 font-medium">Loading product details...</p>
        </div>
      } @else {

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <!-- Basic Info Section -->
          <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div class="p-6 space-y-6">
              
              <!-- Name & Category Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Product Name <span class="text-red-500">*</span></label>
                  <input type="text" id="name" formControlName="name" placeholder="e.g. iPhone 15 Pro Max" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                    [class.border-red-300]="isFieldInvalid('name')"
                  >
                  @if (isFieldInvalid('name')) {
                    <p class="mt-1 text-xs text-red-600">Product name is required.</p>
                  }
                </div>

                <div>
                  <label for="category_id" class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
                  <select id="category_id" formControlName="category_id" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border bg-white"
                    [class.border-red-300]="isFieldInvalid('category_id')"
                  >
                    <option [ngValue]="null" disabled>Select a brand...</option>
                    <option [ngValue]="1">Apple iPhone</option>
                    <option [ngValue]="2">Samsung Galaxy</option>
                  </select>
                  @if (isFieldInvalid('category_id')) {
                    <p class="mt-1 text-xs text-red-600">Category is required.</p>
                  }
                </div>
              </div>

              <!-- Slug Row -->
              <div>
                <label for="slug" class="block text-sm font-medium text-gray-700">URL Slug <span class="text-red-500">*</span></label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    mobello.uk/products/
                  </span>
                  <input type="text" id="slug" formControlName="slug" (input)="onSlugManuallyEdited()"
                    class="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                    [class.border-red-300]="isFieldInvalid('slug')"
                  >
                </div>
                @if (isFieldInvalid('slug')) {
                  <p class="mt-1 text-xs text-red-600">Valid URL slug is required (lowercase, numbers, hyphens).</p>
                }
              </div>

              <!-- Description Row -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" formControlName="description" rows="5" placeholder="Marketing copy and technical highlights..."
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border resize-y h-[150px]"
                ></textarea>
              </div>

              <!-- Condition Row -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Product Condition <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-3 gap-3">

                  <!-- New -->
                  <label
                    class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1"
                    [class.border-accent]="form.get('condition')?.value === 'new'"
                    [class.bg-blue-50]="form.get('condition')?.value === 'new'"
                    [class.border-gray-200]="form.get('condition')?.value !== 'new'"
                    [class.bg-white]="form.get('condition')?.value !== 'new'"
                  >
                    <input type="radio" formControlName="condition" name="condition" [value]="'new'" class="sr-only">
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <span class="flex h-8 w-8 items-center justify-center rounded-full"
                          [class.bg-accent]="form.get('condition')?.value === 'new'"
                          [class.bg-gray-100]="form.get('condition')?.value !== 'new'"
                        >
                          <svg class="h-4 w-4" [class.text-white]="form.get('condition')?.value === 'new'" [class.text-gray-400]="form.get('condition')?.value !== 'new'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" />
                          </svg>
                        </span>
                        <span class="text-sm font-semibold" [class.text-accent]="form.get('condition')?.value === 'new'" [class.text-gray-700]="form.get('condition')?.value !== 'new'">New</span>
                      </div>
                      <p class="text-xs text-gray-500 leading-tight">Brand new, sealed in box</p>
                    </div>
                    @if (form.get('condition')?.value === 'new') {
                      <span class="absolute top-2 right-2">
                        <svg class="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    }
                  </label>

                  <!-- Refurbished -->
                  <label
                    class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-400 focus-within:ring-offset-1"
                    [class.border-amber-400]="form.get('condition')?.value === 'refurbished'"
                    [class.bg-amber-50]="form.get('condition')?.value === 'refurbished'"
                    [class.border-gray-200]="form.get('condition')?.value !== 'refurbished'"
                    [class.bg-white]="form.get('condition')?.value !== 'refurbished'"
                  >
                    <input type="radio" formControlName="condition" name="condition" [value]="'refurbished'" class="sr-only">
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <span class="flex h-8 w-8 items-center justify-center rounded-full"
                          [class.bg-amber-400]="form.get('condition')?.value === 'refurbished'"
                          [class.bg-gray-100]="form.get('condition')?.value !== 'refurbished'"
                        >
                          <svg class="h-4 w-4" [class.text-white]="form.get('condition')?.value === 'refurbished'" [class.text-gray-400]="form.get('condition')?.value !== 'refurbished'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </span>
                        <span class="text-sm font-semibold" [class.text-amber-600]="form.get('condition')?.value === 'refurbished'" [class.text-gray-700]="form.get('condition')?.value !== 'refurbished'">Refurbished</span>
                      </div>
                      <p class="text-xs text-gray-500 leading-tight">Tested &amp; certified pre-owned</p>
                    </div>
                    @if (form.get('condition')?.value === 'refurbished') {
                      <span class="absolute top-2 right-2">
                        <svg class="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    }
                  </label>

                  <!-- Both New & Refurbished -->
                  <label
                    class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-1"
                    [class.border-purple-500]="form.get('condition')?.value === 'both'"
                    [class.bg-purple-50]="form.get('condition')?.value === 'both'"
                    [class.border-gray-200]="form.get('condition')?.value !== 'both'"
                    [class.bg-white]="form.get('condition')?.value !== 'both'"
                  >
                    <input type="radio" formControlName="condition" name="condition" [value]="'both'" class="sr-only">
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <span class="flex h-8 w-8 items-center justify-center rounded-full"
                          [class.bg-purple-500]="form.get('condition')?.value === 'both'"
                          [class.bg-gray-100]="form.get('condition')?.value !== 'both'"
                        >
                          <svg class="h-4 w-4" [class.text-white]="form.get('condition')?.value === 'both'" [class.text-gray-400]="form.get('condition')?.value !== 'both'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </span>
                        <span class="text-sm font-semibold" [class.text-purple-600]="form.get('condition')?.value === 'both'" [class.text-gray-700]="form.get('condition')?.value !== 'both'">Both</span>
                      </div>
                      <p class="text-xs text-gray-500 leading-tight">New &amp; Refurbished available</p>
                    </div>
                    @if (form.get('condition')?.value === 'both') {
                      <span class="absolute top-2 right-2">
                        <svg class="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    }
                  </label>

                </div>
              </div>

              <!-- ===== REFURBISHED DETAILS SECTION ===== -->
              @if (form.get('condition')?.value === 'refurbished' || form.get('condition')?.value === 'both') {
                <div class="mt-2 rounded-xl border-2 border-amber-200 bg-amber-50/60 p-5 space-y-5" formGroupName="refurbished_details">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <h4 class="text-sm font-bold text-amber-800">Refurbished Product Details</h4>
                    <span class="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Displayed on product page</span>
                  </div>

                  <!-- Available Grades -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Available Cosmetic Grades <span class="text-gray-400 font-normal text-xs ml-1">(Select all that apply)</span></label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      @for (grade of refurbGrades; track grade.value) {
                        <button type="button"
                          (click)="toggleGrade(grade.value)"
                          class="relative flex flex-col text-left rounded-lg border-2 p-3 transition-all duration-150 focus:outline-none"
                          [class.border-amber-400]="availableGrades().includes(grade.value)"
                          [class.bg-white]="availableGrades().includes(grade.value)"
                          [class.border-gray-200]="!availableGrades().includes(grade.value)"
                          [class.bg-gray-50]="!availableGrades().includes(grade.value)"
                        >
                          <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold" [style.color]="grade.color">{{ grade.label }}</span>
                            <span class="text-[10px] text-gray-400 leading-tight">{{ grade.desc }}</span>
                          </div>
                          @if (availableGrades().includes(grade.value)) {
                            <span class="absolute top-1.5 right-1.5">
                              <svg class="h-3 w-3 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                            </span>
                          }
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Battery Health + Box Included row -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <!-- Available Battery Health -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Available Battery Health
                        <span class="text-xs font-normal text-gray-400 ml-1">(Select all that apply)</span>
                      </label>
                      <div class="flex flex-wrap gap-2">
                        @for (opt of batteryOptions; track opt.value) {
                          <button type="button"
                            (click)="toggleBatteryHealth(opt.value)"
                            class="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border-2 transition-colors focus:outline-none"
                            [class.border-amber-400]="availableBatteryHealths().includes(opt.value)"
                            [class.bg-amber-50]="availableBatteryHealths().includes(opt.value)"
                            [class.text-amber-800]="availableBatteryHealths().includes(opt.value)"
                            [class.border-gray-200]="!availableBatteryHealths().includes(opt.value)"
                            [class.bg-gray-50]="!availableBatteryHealths().includes(opt.value)"
                            [class.text-gray-600]="!availableBatteryHealths().includes(opt.value)"
                          >
                            {{ opt.label }}
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Box Included -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Box Included?</label>
                      <div class="flex gap-3 mt-1">
                        <label
                          class="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 py-2.5 px-3 transition-all duration-150"
                          [class.border-green-400]="refurbDetailsGroup.get('boxIncluded')?.value === true"
                          [class.bg-green-50]="refurbDetailsGroup.get('boxIncluded')?.value === true"
                          [class.border-gray-200]="refurbDetailsGroup.get('boxIncluded')?.value !== true"
                          [class.bg-white]="refurbDetailsGroup.get('boxIncluded')?.value !== true"
                        >
                          <input type="radio" formControlName="boxIncluded" [value]="true" class="sr-only">
                          <svg class="h-4 w-4" [class.text-green-600]="refurbDetailsGroup.get('boxIncluded')?.value === true" [class.text-gray-400]="refurbDetailsGroup.get('boxIncluded')?.value !== true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span class="text-xs font-semibold" [class.text-green-700]="refurbDetailsGroup.get('boxIncluded')?.value === true" [class.text-gray-500]="refurbDetailsGroup.get('boxIncluded')?.value !== true">Yes, Box Included</span>
                        </label>
                        <label
                          class="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 py-2.5 px-3 transition-all duration-150"
                          [class.border-red-300]="refurbDetailsGroup.get('boxIncluded')?.value === false"
                          [class.bg-red-50]="refurbDetailsGroup.get('boxIncluded')?.value === false"
                          [class.border-gray-200]="refurbDetailsGroup.get('boxIncluded')?.value !== false"
                          [class.bg-white]="refurbDetailsGroup.get('boxIncluded')?.value !== false"
                        >
                          <input type="radio" formControlName="boxIncluded" [value]="false" class="sr-only">
                          <svg class="h-4 w-4" [class.text-red-400]="refurbDetailsGroup.get('boxIncluded')?.value === false" [class.text-gray-400]="refurbDetailsGroup.get('boxIncluded')?.value !== false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span class="text-xs font-semibold" [class.text-red-500]="refurbDetailsGroup.get('boxIncluded')?.value === false" [class.text-gray-500]="refurbDetailsGroup.get('boxIncluded')?.value !== false">No Box</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Accessories -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Accessories Included</label>
                    <p class="text-xs text-gray-500 mb-2">Press Enter or comma to add (e.g., Charging Cable, Adapter, EarPods).</p>
                    <div class="flex flex-wrap gap-2 mb-2">
                      @for (acc of refurbAccessories(); track acc) {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          {{ acc }}
                          <button type="button" (click)="removeAccessory(acc)" class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-amber-500 hover:bg-amber-200 hover:text-amber-700 focus:outline-none">
                            <span class="sr-only">Remove</span>
                            <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                      }
                    </div>
                    <input type="text" id="accessoriesInput" placeholder="Add accessory..."
                      (keydown)="onAccessoryInput($event)"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                    >
                    <p class="text-xs text-gray-400 mt-1">Common: Charging Cable, USB-C Adapter, EarPods, Case</p>
                  </div>

                  <!-- Notes -->
                  <div>
                    <label for="refurbNotes" class="block text-sm font-semibold text-gray-700 mb-1">Additional Notes <span class="text-xs font-normal text-gray-400">(Optional)</span></label>
                    <textarea id="refurbNotes" formControlName="notes" rows="3"
                      placeholder="e.g. Minor scuff on back panel. Screen in perfect condition. Fully tested by our engineers."
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border resize-y"
                    ></textarea>
                  </div>
                </div>
              }

              <!-- Toggles Row -->
              <div class="flex flex-col sm:flex-row gap-8 pt-2">
                <div class="flex items-center">
                  <input id="is_active" type="checkbox" formControlName="is_active" class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded">
                  <label for="is_active" class="ml-2 block text-sm text-gray-900 font-medium">
                    Active (Visible on site)
                  </label>
                </div>
                <div class="flex items-center">
                  <input id="is_featured" type="checkbox" formControlName="is_featured" class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded">
                  <label for="is_featured" class="ml-2 block text-sm text-gray-900 font-medium">
                    Featured (Pinned to top)
                  </label>
                </div>
              </div>

            </div>
          </div>

          <!-- ===== STEP 1: Colors & Storage ===== -->
          <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">Step 1 — Colours &amp; Storage Options</h3>
              <p class="text-sm text-gray-500 mt-1">Define all available colours and storage sizes. The variant matrix will be auto-generated below.</p>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Storage Options -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Storage Options</label>
                <p class="text-xs text-gray-500 mb-3">Press Enter or comma to add (e.g., 128GB).</p>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  @for (opt of storageOptions(); track opt) {
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {{ opt }}
                      <button type="button" (click)="removeChip('storage', opt)" class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white">
                        <span class="sr-only">Remove option</span>
                        <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  }
                </div>
                
                <input type="text" placeholder="Add storage..." 
                  (keydown)="onChipInput($event, 'storage')"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                >
              </div>

              <!-- Colours -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Available Colours</label>
                <p class="text-xs text-gray-500 mb-3">Press Enter or comma to add (e.g., Midnight).</p>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  @for (col of colours(); track col) {
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {{ col }}
                      <button type="button" (click)="removeChip('colour', col)" class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:bg-purple-500 focus:text-white">
                        <span class="sr-only">Remove colour</span>
                        <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  }
                </div>
                
                <input type="text" placeholder="Add colour..." 
                  (keydown)="onChipInput($event, 'colour')"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                >
              </div>

              <!-- SIM Types -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SIM Types (Optional)</label>
                <p class="text-xs text-gray-500 mb-3">Press Enter or comma to add (e.g., Physical SIM, eSIM).</p>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  @for (sim of simTypes(); track sim) {
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {{ sim }}
                      <button type="button" (click)="removeChip('simType', sim)" class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white">
                        <span class="sr-only">Remove option</span>
                        <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  }
                </div>
                
                <input type="text" placeholder="Add SIM type..." 
                  (keydown)="onChipInput($event, 'simType')"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                >
              </div>

            </div>
            
            <!-- Generate Button -->
            @if (colours().length > 0 && storageOptions().length > 0) {
              <div class="px-6 pb-6">
                <button type="button" (click)="generateVariantMatrix()" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Generate Matrix
                  @if (form.get('condition')?.value === 'new') {
                    ({{ colours().length }} × {{ storageOptions().length }} × {{ Math.max(1, simTypes().length) }} = {{ colours().length * storageOptions().length * Math.max(1, simTypes().length) }} variants)
                  } @else if (form.get('condition')?.value === 'refurbished') {
                    ({{ colours().length }} × {{ storageOptions().length }} × {{ Math.max(1, simTypes().length) }} × {{ Math.max(1, availableGrades().length) }} × {{ Math.max(1, availableBatteryHealths().length) }})
                  } @else {
                    (New + Refurbished Combinations)
                  }
                </button>
                <p class="text-xs text-gray-400 mt-1">Existing variant data will be preserved when regenerating.</p>
              </div>
            }
          </div>

          <!-- ===== STEP 2: Variant Matrix ===== -->
          @if (variantMatrix().length > 0) {
            <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
              <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Step 2 — Variant Pricing Matrix</h3>
                    <p class="text-sm text-gray-500 mt-1">Set price, stock, and SKU for each Colour × Storage combination.</p>
                  </div>
                  @if (isUploadingVariant()) {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-800" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  }
                </div>

                <!-- Bulk Update Toolbar -->
                <div class="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-3 shadow-sm">
                  <span class="text-sm font-semibold text-gray-700 whitespace-nowrap">Bulk Update:</span>
                  
                  <select [value]="bulkTargetField()" (change)="bulkTargetField.set($any($event.target).value)" class="text-sm border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent py-1.5 pl-3 pr-8">
                    <option value="price">Price</option>
                    <option value="salePrice">Sale Price</option>
                    <option value="stock">Stock</option>
                  </select>

                  <span class="text-sm text-gray-500">to</span>

                  <input type="number" [value]="bulkTargetValue() ?? ''" (input)="bulkTargetValue.set($any($event.target).value ? +$any($event.target).value : null)" placeholder="Amount" class="w-24 text-sm border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent py-1.5 px-3">

                  <span class="text-sm text-gray-500">for</span>

                  <select [value]="bulkTargetFilter()" (change)="bulkTargetFilter.set($any($event.target).value)" class="text-sm border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent py-1.5 pl-3 pr-8">
                    <option value="all">All Variants</option>
                    <option value="new">New Condition Only</option>
                    <option value="refurbished">Refurbished Only</option>
                    <optgroup label="By Grade">
                      @for (grade of availableGrades(); track grade) {
                        <option [value]="'grade:' + grade">Grade: {{ grade === 'like_new' ? 'Like New' : grade === 'excellent' ? 'Excellent' : grade === 'good' ? 'Good' : 'Fair' }}</option>
                      }
                    </optgroup>
                    <optgroup label="By Storage">
                      @for (sto of storageOptions(); track sto) {
                        <option [value]="'storage:' + sto">Storage: {{ sto }}</option>
                      }
                    </optgroup>
                  </select>

                  <button type="button" (click)="applyBulkUpdate()" class="ml-auto bg-gray-800 text-white text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800">
                    Apply to Matching
                  </button>
                </div>
              </div>

              <!-- Group variants by color -->
              @for (colorGroup of variantsByColor(); track colorGroup.color) {
                <div class="border-b border-gray-100 last:border-b-0">
                  <!-- Color header row -->
                  <div class="px-6 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        {{ colorGroup.color }}
                      </span>
                      <span class="text-sm text-gray-500">{{ colorGroup.variants.length }} variant{{ colorGroup.variants.length === 1 ? '' : 's' }}</span>
                    </div>
                    <!-- Per-color image upload -->
                    <div class="flex items-center gap-2 flex-wrap min-w-0">
                      @if (colorImages(colorGroup.color).length > 0) {
                        <div class="flex gap-1 items-center flex-wrap min-w-0">
                          <span class="text-xs text-gray-500 mr-1 whitespace-nowrap">{{ colorImages(colorGroup.color).length }} image(s) uploaded</span>
                          @for (img of colorImages(colorGroup.color); track img; let i = $index) {
                            <div class="relative group flex-shrink-0">
                              <img [src]="img" class="h-10 w-10 rounded-md object-cover border border-gray-200 shadow-sm">
                              <button type="button" (click)="removeVariantImage(colorGroup.color, i)"
                                class="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 rounded-full p-0.5 shadow-sm hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100">
                                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          }
                        </div>
                      }
                      <label class="inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1 whitespace-nowrap">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {{ colorImages(colorGroup.color).length > 0 ? 'Add more' : 'Upload images' }}
                        <input type="file" class="sr-only" accept="image/*" multiple (change)="onVariantImageSelected($event, colorGroup.color)">
                      </label>
                    </div>
                  </div>

                  <!-- Storage variants table -->
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="bg-gray-50 border-b border-gray-100">
                          <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Storage</th>
                          <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">SIM Type</th>
                          @if (form.get('condition')?.value === 'both' || form.get('condition')?.value === 'refurbished') {
                            @if (form.get('condition')?.value === 'both') {
                              <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Condition</th>
                            }
                            <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Grade</th>
                            <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Battery</th>
                          }
                          <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Price (£)</th>
                          <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Sale Price (£)</th>
                          <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Stock</th>
                          <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                          <th class="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Active</th>
                          <th class="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16" title="Quick Actions">Quick</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-50">
                        @for (variant of colorGroup.variants; track variant) {
                          <tr class="hover:bg-gray-50/50 transition-colors" 
                            [class.opacity-50]="!(variant.isActive ?? true)"
                            [class.bg-amber-50]="variant.condition === 'refurbished'"
                            [class.bg-blue-50]="variant.condition === 'new'"
                          >
                            <td class="px-4 py-3">
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">{{ variant.storage }}</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-700">
                              @if (variant.simType) {
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{{ variant.simType }}</span>
                              } @else {
                                <span class="text-gray-400 text-xs">N/A</span>
                              }
                            </td>
                            @if (form.get('condition')?.value === 'both' || form.get('condition')?.value === 'refurbished') {
                              @if (form.get('condition')?.value === 'both') {
                                <td class="px-4 py-3">
                                  @if (variant.condition === 'new') {
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" /></svg>
                                      New
                                    </span>
                                  } @else {
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      Refurb
                                    </span>
                                  }
                                </td>
                              }
                              
                              <td class="px-4 py-3 text-sm text-gray-700">
                                @if (variant.grade) {
                                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border"
                                    [class.bg-emerald-50]="variant.grade === 'like_new'" [class.text-emerald-700]="variant.grade === 'like_new'" [class.border-emerald-200]="variant.grade === 'like_new'"
                                    [class.bg-sky-50]="variant.grade === 'excellent'" [class.text-sky-700]="variant.grade === 'excellent'" [class.border-sky-200]="variant.grade === 'excellent'"
                                    [class.bg-amber-50]="variant.grade === 'good'" [class.text-amber-700]="variant.grade === 'good'" [class.border-amber-200]="variant.grade === 'good'"
                                    [class.bg-red-50]="variant.grade === 'fair'" [class.text-red-700]="variant.grade === 'fair'" [class.border-red-200]="variant.grade === 'fair'"
                                  >
                                    {{ variant.grade === 'like_new' ? 'Like New' : variant.grade === 'excellent' ? 'Excellent' : variant.grade === 'good' ? 'Good' : 'Fair' }}
                                  </span>
                                } @else {
                                  <span class="text-gray-400 text-xs">N/A</span>
                                }
                              </td>
                              <td class="px-4 py-3 text-sm text-gray-700">
                                @if (variant.batteryHealth) {
                                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{{ variant.batteryHealth }}</span>
                                } @else {
                                  <span class="text-gray-400 text-xs">N/A</span>
                                }
                              </td>
                            }
                            <td class="px-4 py-3">
                              <input type="number" placeholder="0.00" min="0" step="0.01"
                                [value]="variant.price || ''"
                                (change)="updateVariantField(variant, 'price', +$any($event.target).value)"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-sm py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-4 py-3">
                              <input type="number" placeholder="Optional" min="0" step="0.01"
                                [value]="variant.salePrice ?? ''"
                                (change)="onSalePriceChange($event, variant)"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-sm py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-4 py-3">
                              <input type="number" placeholder="0" min="0" step="1"
                                [value]="variant.stock || 0"
                                (change)="updateVariantField(variant, 'stock', +$any($event.target).value)"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-sm py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-4 py-3">
                              <input type="text" placeholder="e.g. IPH15-BLK-128"
                                [value]="variant.sku ?? ''"
                                (change)="updateVariantField(variant, 'sku', $any($event.target).value || null)"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-sm py-1.5 px-2 border"
                              >
                            </td>
                            <td class="px-4 py-3 text-center">
                              <input type="checkbox" 
                                [checked]="variant.isActive ?? true"
                                (change)="updateVariantField(variant, 'isActive', $any($event.target).checked)"
                                class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                              >
                            </td>
                            <td class="px-4 py-3 text-center">
                              <button type="button" (click)="copyVariantToOtherColors(variant)" title="Copy price & stock to all other colours for this exact spec" class="text-gray-400 hover:text-accent transition-colors focus:outline-none bg-gray-50 hover:bg-blue-50 p-1.5 rounded-md border border-gray-200">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          }


          <!-- Error Banner -->
          @if (submitError()) {
            <div class="rounded-md bg-red-50 p-4 border border-red-200 shadow-sm">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">{{ submitError() }}</h3>
                </div>
              </div>
            </div>
          }

          <!-- Submit Bar -->
          <div class="pt-5 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" routerLink="/xk92-admin/products" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="isSubmitting() || isUploadingVariant()" class="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              @if (isSubmitting()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              } @else {
                {{ isEditMode() ? 'Update Product' : 'Save Product' }}
              }
            </button>
          </div>

        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    category_id: [null as number | null, [Validators.required]],
    description: [''],
    condition: ['new'],
    is_featured: [false],
    is_active: [true],
    refurbished_details: this.fb.group({
      boxIncluded: [true],
      notes: ['']
    })
  });

  /** Accessor shortcut for the refurb sub-group */
  get refurbDetailsGroup() {
    return this.form.get('refurbished_details') as any;
  }

  /** Grade options for refurbished condition */
  readonly refurbGrades = [
    { value: 'like_new',  label: 'Like New',  desc: 'Essentially perfect', color: '#059669' },
    { value: 'excellent', label: 'Excellent',  desc: 'Minor wear only',     color: '#0284c7' },
    { value: 'good',      label: 'Good',       desc: 'Visible light marks', color: '#d97706' },
    { value: 'fair',      label: 'Fair',       desc: 'Noticeable wear',     color: '#dc2626' },
  ];

  /** Battery Health options */
  readonly batteryOptions = [
    { value: '>90%', label: '>90%' },
    { value: '80%-90%', label: '80% - 90%' },
    { value: '<80%', label: '<80%' },
    { value: 'N/A', label: 'N/A' },
  ];

  /** Selected refurbished details */
  availableGrades = signal<string[]>([]);
  availableBatteryHealths = signal<string[]>([]);
  refurbAccessories = signal<string[]>([]);

  isEditMode = signal(false);
  productId = signal<string | null>(null);
  isPageLoading = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  // Bulk update state
  bulkTargetFilter = signal<string>('all');
  bulkTargetField = signal<'price' | 'salePrice' | 'stock'>('price');
  bulkTargetValue = signal<number | null>(null);
  
  storageOptions = signal<string[]>([]);
  colours = signal<string[]>([]);
  simTypes = signal<string[]>([]);
  Math = Math;

  /** The variant matrix — one entry per Color×Storage combination */
  variantMatrix = signal<ProductVariant[]>([]);

  manualSlug = signal(false);
  isUploadingVariant = signal(false);

  /** Variants grouped by color for the table UI */
  variantsByColor = computed(() => {
    const matrix = this.variantMatrix();
    const colorOrder = this.colours();
    const groups: { color: string; variants: ProductVariant[] }[] = [];
    for (const color of colorOrder) {
      const variants = matrix.filter(v => v.color === color);
      if (variants.length > 0) {
        groups.push({ color, variants });
      }
    }
    return groups;
  });

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
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  canDeactivate(): boolean {
    if (this.form.dirty && !this.submitted) {
      return window.confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  onSlugManuallyEdited() {
    this.manualSlug.set(true);
  }

  loadProduct(id: string) {
    this.isPageLoading.set(true);
    this.api.get<{ success: boolean, data: any }>(`/api/admin/products/${id}`).subscribe({
      next: (res) => {
        const p = res.data;

        // Determine the saved condition — default to 'new' only if truly absent
        const savedCondition: 'new' | 'refurbished' | 'both' =
          (p.condition === 'refurbished' || p.condition === 'both') ? p.condition : 'new';

        this.form.patchValue({
          name: p.name,
          slug: p.slug,
          category_id: p.category_id,
          description: p.description || '',
          condition: savedCondition,
          is_featured: !!p.is_featured,
          is_active: !!p.is_active
        });

        // Load refurbished details if present
        if (p.refurbished_details) {
          try {
            const rd: RefurbishedDetails = JSON.parse(p.refurbished_details);
            this.form.get('refurbished_details')?.patchValue({
              boxIncluded: rd.boxIncluded ?? true,
              notes: rd.notes || ''
            });
            this.availableGrades.set(rd.availableGrades || []);
            this.availableBatteryHealths.set(rd.availableBatteryHealths || []);
            this.refurbAccessories.set(rd.accessories || []);
          } catch {}
        }

        if (p.storage_options) {
          try { this.storageOptions.set(JSON.parse(p.storage_options)); } catch {}
        }
        if (p.colours) {
          try { this.colours.set(JSON.parse(p.colours)); } catch {}
        }
        if (p.sim_types) {
          try { this.simTypes.set(JSON.parse(p.sim_types)); } catch {}
        }
        if (p.variants) {
          try {
            const loaded = JSON.parse(p.variants) as ProductVariant[];
            this.variantMatrix.set(loaded);
          } catch {}
        }

        this.manualSlug.set(true);
        this.isPageLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load product details. Returning to products list.');
        this.router.navigate(['/xk92-admin/products']);
      }
    });
  }

  /** Generate all Color×Storage combinations, preserving existing variant data */
  generateVariantMatrix() {
    const colors = this.colours();
    const storages = this.storageOptions();
    const sims = this.simTypes();
    const simLoop = sims.length > 0 ? sims : [undefined];
    const existing = this.variantMatrix();
    const productCondition = this.form.get('condition')?.value || 'new';

    const grades = this.availableGrades();
    const batteryHealths = this.availableBatteryHealths();
    
    // Default loop for grades and battery if none selected, so at least one row generates if they forgot
    const gradesLoop = grades.length > 0 ? grades : [undefined];
    const batteryLoop = batteryHealths.length > 0 ? batteryHealths : [undefined];

    // When 'both', generate New row + Refurbished row per combination
    const conditionLoop: Array<'new' | 'refurbished' | undefined> =
      productCondition === 'both' ? ['new', 'refurbished'] : [undefined];

    const newMatrix: ProductVariant[] = [];
    for (const color of colors) {
      for (const storage of storages) {
        for (const simType of simLoop) {
          for (const variantCondition of conditionLoop) {
            // For 'new' or 'both'->'new' condition, we don't multiply by grades/battery
            const isNew = productCondition === 'new' || variantCondition === 'new';
            const currentGradesLoop = isNew ? [undefined] : gradesLoop;
            const currentBatteryLoop = isNew ? [undefined] : batteryLoop;

            for (const grade of currentGradesLoop) {
              for (const batteryHealth of currentBatteryLoop) {
                const prev = existing.find(v =>
                  v.color.toLowerCase() === color.toLowerCase() &&
                  v.storage.toLowerCase() === storage.toLowerCase() &&
                  (v.simType || '').toLowerCase() === (simType || '').toLowerCase() &&
                  (variantCondition ? (v.condition === variantCondition) : !v.condition) &&
                  (grade ? (v.grade === grade) : !v.grade) &&
                  (batteryHealth ? (v.batteryHealth === batteryHealth) : !v.batteryHealth)
                );
                const colorImages = existing.find(v => v.color.toLowerCase() === color.toLowerCase())?.images ?? [];
                newMatrix.push({
                  color,
                  storage,
                  ...(simType ? { simType } : {}),
                  ...(variantCondition ? { condition: variantCondition } : {}),
                  ...(grade ? { grade } : {}),
                  ...(batteryHealth ? { batteryHealth } : {}),
                  price: prev?.price ?? 0,
                  salePrice: prev?.salePrice ?? null,
                  stock: prev?.stock ?? 0,
                  sku: prev?.sku ?? null,
                  isActive: prev?.isActive ?? true,
                  images: colorImages
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

  /** Update a single field on a variant in the matrix */
  updateVariantField(variant: ProductVariant, field: keyof ProductVariant, value: any) {
    this.variantMatrix.update(matrix =>
      matrix.map(v => v === variant ? { ...v, [field]: value } : v)
    );
    this.form.markAsDirty();
  }

  /** Handles sale price input separately because of null/empty logic that template can't express */
  onSalePriceChange(event: Event, variant: ProductVariant) {
    const val = (event.target as HTMLInputElement).value;
    this.updateVariantField(variant, 'salePrice', val ? +val : null);
  }

  /** Get images for a specific color from the matrix */
  colorImages(color: string): string[] {
    const variant = this.variantMatrix().find(v => v.color.toLowerCase() === color.toLowerCase());
    return variant?.images ?? [];
  }

  /** Remove an image at index from all variants of the same color */
  removeVariantImage(color: string, index: number) {
    this.variantMatrix.update(matrix =>
      matrix.map(v => {
        if (v.color.toLowerCase() === color.toLowerCase()) {
          const imgs = [...v.images];
          imgs.splice(index, 1);
          return { ...v, images: imgs };
        }
        return v;
      })
    );
    this.form.markAsDirty();
  }

  /** Upload images for a specific color variant */
  onVariantImageSelected(event: Event, color: string) {
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
        // Apply the uploaded URLs to all variants of this color
        this.variantMatrix.update(matrix =>
          matrix.map(v => {
            if (v.color.toLowerCase() === color.toLowerCase()) {
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

  onChipInput(event: KeyboardEvent, type: 'storage' | 'colour' | 'simType') {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      
      if (value) {
        if (type === 'storage' && !this.storageOptions().includes(value)) {
          this.storageOptions.update(v => [...v, value]);
        } else if (type === 'colour' && !this.colours().includes(value)) {
          this.colours.update(v => [...v, value]);
        } else if (type === 'simType' && !this.simTypes().includes(value)) {
          this.simTypes.update(v => [...v, value]);
        }
        input.value = '';
        this.form.markAsDirty();
      }
    }
  }

  onAccessoryInput(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value && !this.refurbAccessories().includes(value)) {
        this.refurbAccessories.update(v => [...v, value]);
        this.form.markAsDirty();
      }
      input.value = '';
    }
  }

  removeAccessory(value: string) {
    this.refurbAccessories.update(v => v.filter(a => a !== value));
    this.form.markAsDirty();
  }

  removeChip(type: 'storage' | 'colour' | 'simType', value: string) {
    if (type === 'storage') {
      this.storageOptions.update(v => v.filter(item => item !== value));
      this.variantMatrix.update(m => m.filter(v => v.storage !== value));
    } else if (type === 'colour') {
      this.colours.update(v => v.filter(item => item !== value));
      this.variantMatrix.update(m => m.filter(v => v.color !== value));
    } else {
      this.simTypes.update(v => v.filter(item => item !== value));
      this.variantMatrix.update(m => m.filter(v => v.simType !== value));
    }
    this.form.markAsDirty();
  }

  toggleGrade(value: string) {
    this.availableGrades.update(arr => 
      arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
    );
    this.form.markAsDirty();
  }

  toggleBatteryHealth(value: string) {
    this.availableBatteryHealths.update(arr => 
      arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
    );
    this.form.markAsDirty();
  }

  copyVariantToOtherColors(sourceVariant: ProductVariant) {
    this.variantMatrix.update(matrix => {
      return matrix.map(v => {
        if (
          v.color !== sourceVariant.color &&
          v.storage === sourceVariant.storage &&
          v.simType === sourceVariant.simType &&
          v.condition === sourceVariant.condition &&
          v.grade === sourceVariant.grade &&
          v.batteryHealth === sourceVariant.batteryHealth
        ) {
          return {
            ...v,
            price: sourceVariant.price,
            salePrice: sourceVariant.salePrice,
            stock: sourceVariant.stock,
            isActive: sourceVariant.isActive
          };
        }
        return v;
      });
    });
    this.form.markAsDirty();
    this.toast.success(`Copied pricing to all other colours for ${sourceVariant.storage}`);
  }

  applyBulkUpdate() {
    const val = this.bulkTargetValue();
    if (val === null) return;
    const filter = this.bulkTargetFilter();
    const field = this.bulkTargetField();

    let count = 0;
    this.variantMatrix.update(matrix => {
      return matrix.map(v => {
        let match = false;
        if (filter === 'all') match = true;
        else if (filter === 'new') match = v.condition === 'new';
        else if (filter === 'refurbished') match = v.condition === 'refurbished';
        else if (filter.startsWith('grade:')) match = v.grade === filter.replace('grade:', '');
        else if (filter.startsWith('storage:')) match = v.storage === filter.replace('storage:', '');
        
        if (match) {
          count++;
          return { ...v, [field]: val };
        }
        return v;
      });
    });
    
    if (count > 0) {
      this.form.markAsDirty();
      this.toast.success(`Updated ${count} variants.`);
    } else {
      this.toast.info('No variants matched the selected filter.');
    }
  }

  /** Core upload logic — returns the public URL or null on failure */
  private async uploadSingleFile(file: File): Promise<string | null> {
    const contentType = file.type || 'application/octet-stream';

    const presignRes = await firstValueFrom(
      this.api.post<{
        success: boolean;
        data: {
          uploadUrl: string | null;
          publicUrl: string;
          filename: string;
          useDirectUpload?: boolean;
        };
      }>('/api/admin/upload-url', {
        filename: file.name,
        contentType,
      })
    );

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
    
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      this.submitError.set('Please fill out all required fields correctly.');
      this.submitted = false;
      return;
    }

    this.isSubmitting.set(true);
    
    const condition = this.form.value.condition || 'new';
    const hasRefurb = condition === 'refurbished' || condition === 'both';

    let refurbDetails: RefurbishedDetails | null = null;
    if (hasRefurb) {
      const rdForm = this.form.get('refurbished_details')?.value;
      refurbDetails = {
        availableGrades: this.availableGrades(),
        availableBatteryHealths: this.availableBatteryHealths(),
        boxIncluded: rdForm?.boxIncluded ?? true,
        accessories: this.refurbAccessories(),
        notes: rdForm?.notes || ''
      };
    }

    const { refurbished_details: _rd, ...formValues } = this.form.value as any;

    const payload = {
      ...formValues,
      condition,
      refurbished_details: refurbDetails,
      storage_options: this.storageOptions(),
      colours: this.colours(),
      sim_types: this.simTypes(),
      variants: this.variantMatrix()
    };

    const request = this.isEditMode() 
      ? this.api.put(`/api/admin/products/${this.productId()}`, payload)
      : this.api.post('/api/admin/products', payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode() ? 'Product updated successfully!' : 'Product saved successfully!');
        this.router.navigate(['/xk92-admin/products']);
      },
      error: (err: Error) => {
        this.submitError.set(err.message || 'Failed to save product. Please try again.');
        this.isSubmitting.set(false);
        this.submitted = false; 
      }
    });
  }
}
