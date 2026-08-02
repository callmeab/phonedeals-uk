import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Product, ProductVariant, RefurbishedDetails, normalizeProductCondition } from '../../core/models/product.model';
import { Deal } from '../../core/models/deal.model';
import { CartItem } from '../../core/models/cart.model';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { DealCardComponent } from '../../shared/components/deal-card/deal-card.component';
import { DealCardSkeletonComponent } from '../../shared/components/deal-card/deal-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { resolveProductImageUrl, getPrimaryProductImage, PLACEHOLDER_PHONE_IMAGE } from '../../core/utils/image-url';

type DealSort = 'monthly' | 'data' | 'upfront';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DealCardComponent, DealCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent, LoadingSpinnerComponent],
  template: `
    @if (isLoading()) {
      <!-- Full-page loading -->
      <div class="min-h-screen bg-surface flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <app-loading-spinner size="lg"></app-loading-spinner>
          <p class="text-sm text-gray-400 font-medium animate-pulse">Loading product details…</p>
        </div>
      </div>

    } @else if (!product()) {
      <div class="min-h-screen bg-surface flex items-center justify-center">
        <p class="text-gray-400">Redirecting…</p>
      </div>

    } @else {
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <app-breadcrumb [items]="breadcrumbItems()" theme="light"></app-breadcrumb>
        </div>
      </div>

      <div class="bg-surface min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">

            <!-- ================================================
                 LEFT COLUMN — Image panel
                 ================================================ -->
            <div class="lg:w-[44%] xl:w-[42%] flex-shrink-0">
              <div class="lg:sticky lg:top-20 space-y-4">

                <!-- ── Image panel: [color strip | main image] ── -->
                <div class="flex gap-3">

                  <!-- Vertical color thumbnail strip (left side) -->
                  @if (colours().length > 0) {
                    <div class="flex flex-col gap-2 w-[72px] flex-shrink-0">
                      @for (colour of colours(); track colour) {
                        <button
                          (click)="selectedColour.set(colour)"
                          class="relative group w-full aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all duration-200 focus:outline-none shadow-sm hover:shadow-md"
                          [ngClass]="selectedColour() === colour
                            ? 'border-accent shadow-md ring-2 ring-accent ring-offset-1'
                            : 'border-gray-200 hover:border-gray-400'"
                          [title]="colour"
                        >
                          <!-- Show first image of this color as thumbnail -->
                          @if (colorFirstImage(colour); as thumb) {
                            <img
                              [src]="thumb"
                              [alt]="colour"
                              (error)="onImageError($event)"
                              class="w-full h-full object-contain p-1 transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                            >
                          } @else {
                            <!-- Fallback: color swatch dot -->
                            <div class="w-full h-full flex items-center justify-center">
                              <span
                                class="w-7 h-7 rounded-full shadow-inner border border-white/30"
                                [style.background-color]="colourToHex(colour)"
                              ></span>
                            </div>
                          }
                          <!-- Selected check mark -->
                          @if (selectedColour() === colour) {
                            <div class="absolute bottom-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center shadow-sm">
                              <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            </div>
                          }
                          <!-- Color label tooltip on hover -->
                          <div class="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                            {{ colour }}
                          </div>
                        </button>
                      }
                    </div>
                  }

                  <!-- Main image -->
                  <div class="flex-1 relative bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden aspect-[4/3] flex items-center justify-center p-6 group min-w-0">
                    @if (product()!.is_featured) {
                      <div class="absolute top-0 right-0 z-10">
                        <div class="relative overflow-hidden w-24 h-24">
                          <div class="absolute top-[18px] right-[-22px] bg-accent text-white text-[10px] font-bold uppercase tracking-wider py-1 w-28 text-center rotate-45 shadow-md">
                            Featured
                          </div>
                        </div>
                      </div>
                    }
                    @if (selectedImage()) {
                      <img
                        [src]="selectedImage()!"
                        [alt]="product()!.name"
                        (error)="onImageError($event)"
                        class="max-w-full max-h-full object-contain transition-all duration-500 ease-out group-hover:scale-[1.03]"
                      >
                    } @else {
                      <div class="flex flex-col items-center justify-center gap-3 text-gray-200">
                        <svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.75" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        <p class="text-sm text-gray-400 font-medium">No image available</p>
                      </div>
                    }

                    <!-- Image counter badge -->
                    @if (galleryImages().length > 1) {
                      <div class="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {{ currentImageIndex() + 1 }} / {{ galleryImages().length }}
                      </div>
                    }

                    <!-- Prev/Next arrows for gallery navigation -->
                    @if (galleryImages().length > 1) {
                      <button (click)="prevImage()" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 transition-all duration-150 focus:outline-none opacity-0 group-hover:opacity-100">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                      </button>
                      <button (click)="nextImage()" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 transition-all duration-150 focus:outline-none opacity-0 group-hover:opacity-100">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    }
                  </div>
                </div>

                <!-- Horizontal thumbnail strip (current color images only) -->
                @if (galleryImages().length > 0) {
                  <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    @for (img of galleryImages(); track img; let i = $index) {
                      <button
                        (click)="selectedImage.set(img)"
                        class="flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden bg-white transition-all duration-150 focus:outline-none"
                        [ngClass]="selectedImage() === img
                          ? 'border-accent shadow-md ring-1 ring-accent'
                          : 'border-gray-200 hover:border-gray-400'"
                      >
                        <img [src]="img" [alt]="product()!.name + ' image ' + (i+1)" (error)="onImageError($event)" class="w-full h-full object-contain p-0.5" loading="lazy">
                      </button>
                    }
                  </div>
                }

                <!-- Selected color label -->
                @if (selectedColour()) {
                  <div class="flex items-center gap-2 px-1">
                    <span
                      class="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                      [style.background-color]="colourToHex(selectedColour()!)"
                    ></span>
                    <p class="text-sm font-semibold text-gray-700">{{ selectedColour() }}</p>
                    @if (galleryImages().length > 0) {
                      <span class="text-xs text-gray-400">· {{ galleryImages().length }} photo{{ galleryImages().length === 1 ? '' : 's' }}</span>
                    }
                  </div>
                }

              </div><!-- /sticky -->
            </div><!-- /left col -->

            <!-- ================================================
                 RIGHT COLUMN — Info, Storage, Pricing & Deals
                 ================================================ -->
            <div class="flex-1 min-w-0 space-y-6">

              <!-- Product header card -->
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

                <!-- Category badge -->
                <div class="flex items-center gap-2 mb-3">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                    [ngClass]="isSamsung() ? 'bg-blue-700 text-white' : 'bg-gray-800 text-white'">
                    {{ product()!.category_name || 'Phone' }}
                  </span>
                  @if (product()!.is_featured) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-accent">
                      ★ Featured
                    </span>
                  }
                </div>

                <!-- Product name -->
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                  {{ product()!.name }}
                </h1>

                <!-- Description -->
                @if (product()!.description) {
                  <p class="mt-3 text-sm text-gray-500 leading-relaxed">{{ product()!.description }}</p>
                }

                <!-- Condition Toggle (only for 'both' condition products) -->
                @if (product()!.condition === 'both') {
                  <div class="mt-5 pt-5 border-t border-gray-100">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Choose Condition</p>
                    <div class="flex gap-3">
                      <!-- New -->
                      <button
                        (click)="selectedCondition.set('new')"
                        class="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 transition-all duration-200 focus:outline-none"
                        [ngClass]="selectedCondition() === 'new'
                          ? 'border-accent bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'"
                      >
                        <svg class="h-4 w-4" [class.text-accent]="selectedCondition() === 'new'" [class.text-gray-400]="selectedCondition() !== 'new'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" />
                        </svg>
                        <div class="text-left">
                          <p class="text-sm font-bold" [class.text-accent]="selectedCondition() === 'new'" [class.text-gray-700]="selectedCondition() !== 'new'">Brand New</p>
                          <p class="text-[11px]" [class.text-blue-500]="selectedCondition() === 'new'" [class.text-gray-400]="selectedCondition() !== 'new'">Sealed in box</p>
                        </div>
                        @if (selectedCondition() === 'new') {
                          <svg class="h-4 w-4 text-accent ml-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        }
                      </button>

                      <!-- Refurbished -->
                      <button
                        (click)="selectedCondition.set('refurbished')"
                        class="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 transition-all duration-200 focus:outline-none"
                        [ngClass]="selectedCondition() === 'refurbished'
                          ? 'border-amber-400 bg-amber-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'"
                      >
                        <svg class="h-4 w-4" [class.text-amber-500]="selectedCondition() === 'refurbished'" [class.text-gray-400]="selectedCondition() !== 'refurbished'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <div class="text-left">
                          <p class="text-sm font-bold" [class.text-amber-600]="selectedCondition() === 'refurbished'" [class.text-gray-700]="selectedCondition() !== 'refurbished'">Refurbished</p>
                          <p class="text-[11px]" [class.text-amber-500]="selectedCondition() === 'refurbished'" [class.text-gray-400]="selectedCondition() !== 'refurbished'">Tested &amp; certified</p>
                        </div>
                        @if (selectedCondition() === 'refurbished') {
                          <svg class="h-4 w-4 text-amber-500 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        }
                      </button>
                    </div>
                  </div>
                }

                <!-- Refurbished Options (Grade and Battery) -->
                @if (product()!.condition === 'refurbished' || (product()!.condition === 'both' && selectedCondition() === 'refurbished')) {
                  @if (availableGrades().length > 0) {
                    <div class="mt-5 pt-5 border-t border-gray-100">
                      <div class="flex items-center justify-between mb-3">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Cosmetic Grade</p>
                        @if (selectedGrade()) {
                          <span class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{{ selectedGrade() === 'like_new' ? 'Like New' : selectedGrade() === 'excellent' ? 'Excellent' : selectedGrade() === 'good' ? 'Good' : 'Fair' }}</span>
                        }
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        @for (grade of availableGrades(); track grade) {
                          <button
                            (click)="selectedGrade.set(grade)"
                            class="relative flex flex-col text-left rounded-lg border-2 p-3 transition-all duration-150 focus:outline-none"
                            [class.border-amber-400]="selectedGrade() === grade"
                            [class.bg-amber-50]="selectedGrade() === grade"
                            [class.border-gray-200]="selectedGrade() !== grade"
                            [class.hover:border-amber-200]="selectedGrade() !== grade"
                          >
                            <span class="text-sm font-bold text-gray-800">
                              {{ grade === 'like_new' ? 'Like New' : grade === 'excellent' ? 'Excellent' : grade === 'good' ? 'Good' : 'Fair' }}
                            </span>
                            @if (selectedGrade() === grade) {
                              <span class="absolute top-2 right-2">
                                <svg class="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                              </span>
                            }
                          </button>
                        }
                      </div>
                    </div>
                  }

                  @if (availableBatteryHealths().length > 0) {
                    <div class="mt-5 pt-5 border-t border-gray-100">
                      <div class="flex items-center justify-between mb-3">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Battery Health</p>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        @for (battery of availableBatteryHealths(); track battery) {
                          <button
                            (click)="selectedBattery.set(battery)"
                            class="px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus:outline-none"
                            [class.border-amber-400]="selectedBattery() === battery"
                            [class.bg-amber-50]="selectedBattery() === battery"
                            [class.text-amber-800]="selectedBattery() === battery"
                            [class.border-gray-200]="selectedBattery() !== battery"
                            [class.text-gray-600]="selectedBattery() !== battery"
                            [class.hover:border-amber-200]="selectedBattery() !== battery"
                          >
                            {{ battery }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                }

                <!-- Storage selector (in right column) -->
                @if (storageOptions().length > 0) {
                  <div class="mt-5 pt-5 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-3">
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Storage</p>
                      @if (selectedStorage()) {
                        <span class="text-xs font-semibold text-accent bg-blue-50 px-2 py-0.5 rounded-full">{{ selectedStorage() }}</span>
                      }
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (opt of storageOptions(); track opt) {
                        <button
                          (click)="!isStorageUnavailable(opt) && selectedStorage.set(opt)"
                          class="relative px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                          [ngClass]="storageButtonClass(opt)"
                          [title]="isStorageUnavailable(opt) ? 'Out of stock' : opt"
                        >
                          {{ opt }}
                          @if (isStorageUnavailable(opt)) {
                            <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span class="block w-[calc(100%-12px)] h-px bg-red-300 rotate-[-10deg]"></span>
                            </span>
                          }
                          <!-- Price label under storage -->
                          @if (storagePrice(opt); as sp) {
                            <span class="block text-[10px] font-semibold mt-0.5"
                              [ngClass]="storageButtonClass(opt).includes('border-accent') ? 'text-accent' : 'text-gray-400'"
                            >£{{ sp.toFixed(0) }}</span>
                          }
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- SIM Type selector (below storage) -->
                @if (simTypes().length > 0) {
                  <div class="mt-5 pt-5 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-3">
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">SIM Type</p>
                      @if (selectedSimType()) {
                        <span class="text-xs font-semibold text-accent bg-blue-50 px-2 py-0.5 rounded-full">{{ selectedSimType() }}</span>
                      }
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (sim of simTypes(); track sim) {
                        <button
                          (click)="!isSimTypeUnavailable(sim) && selectedSimType.set(sim)"
                          class="relative px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                          [ngClass]="simTypeButtonClass(sim)"
                          [title]="isSimTypeUnavailable(sim) ? 'Out of stock' : sim"
                        >
                          {{ sim }}
                          @if (isSimTypeUnavailable(sim)) {
                            <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span class="block w-[calc(100%-12px)] h-px bg-red-300 rotate-[-10deg]"></span>
                            </span>
                          }
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- Price and availability block -->
                @if (selectedVariant(); as sv) {
                  <div class="mt-5 pt-5 border-t border-gray-100">
                    <div class="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Device Price</p>
                        <div class="flex items-baseline gap-2 flex-wrap">
                          @if (variantSalePrice()) {
                            <span class="text-4xl font-black text-red-500">£{{ variantSalePrice()!.toFixed(2) }}</span>
                            <span class="text-xl font-semibold text-gray-400 line-through">£{{ variantPrice()!.toFixed(2) }}</span>
                            <span class="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                              {{ discountPercent() }}% OFF
                            </span>
                          } @else {
                            <span class="text-4xl font-black text-gray-900">£{{ variantPrice()!.toFixed(2) }}</span>
                          }
                        </div>
                        @if (variantSku()) {
                          <p class="mt-1.5 text-xs text-gray-400 font-mono tracking-wider">SKU: {{ variantSku() }}</p>
                        }
                      </div>

                      <!-- Stock badge -->
                      <div class="flex flex-col items-end gap-1">
                        @if (isOutOfStock()) {
                          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                            <span class="w-2 h-2 rounded-full bg-red-500"></span>
                            Out of Stock
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-green-50 text-green-700 border border-green-200">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span>
                            In Stock
                          </span>
                        }
                        <p class="text-xs text-gray-400 mt-0.5">
                          <span class="font-medium">{{ selectedColour() }}</span> · {{ selectedStorage() }}
                        </p>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- No variant data — show deals-based price -->
                  <div class="mt-5 pt-5 border-t border-gray-100">
                    @if (dealsLoading()) {
                      <div class="h-10 w-40 bg-gray-100 rounded-lg animate-pulse"></div>
                    } @else if (lowestPrice() !== null) {
                      <div class="flex items-baseline gap-2">
                        <span class="text-sm text-gray-500 font-medium">From</span>
                        <span class="text-4xl font-black text-accent">£{{ lowestPrice()!.toFixed(2) }}</span>
                        <span class="text-base text-gray-400 font-medium">/month</span>
                      </div>
                      <p class="mt-1 text-xs text-gray-400">
                        Cheapest available contract · prices may vary by storage &amp; colour
                      </p>
                    } @else {
                      <p class="text-sm text-gray-400 italic">No contract deals added yet for this product.</p>
                    }
                  </div>
                }

                <!-- Contract price hint (when variant price is shown) -->
                @if (selectedVariant() && !dealsLoading() && lowestPrice() !== null) {
                  <div class="mt-3 pt-3 border-t border-gray-50">
                    <p class="text-xs text-gray-400">
                      Or get it from <span class="font-semibold text-accent">£{{ lowestPrice()!.toFixed(2) }}/month</span> on contract below
                    </p>
                  </div>
                }
              </div>

              <!-- ============================================
                   REFURBISHED DETAILS CARD
                   ============================================ -->
              @if (product()!.condition === 'refurbished' || product()!.condition === 'both') {
                <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <!-- Card Header -->
                  <div class="px-5 py-4 border-b border-amber-200 bg-white/60 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                        <svg class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-sm font-bold text-amber-900">Refurbished Details</h3>
                        <p class="text-[11px] text-amber-600">Professionally tested &amp; certified</p>
                      </div>
                    </div>
                    <!-- Condition badge (New + Refurbished available) -->
                    @if (product()!.condition === 'both') {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        New &amp; Refurb Available
                      </span>
                    }
                  </div>

                  <!-- Card Body -->
                  <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <!-- Grade -->
                    @if (selectedGrade()) {
                      <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-0.5">
                          <div class="h-8 w-8 rounded-lg flex items-center justify-center" [style.background-color]="gradeColor(selectedGrade()!) + '20'">
                            <svg class="h-4 w-4" [style.color]="gradeColor(selectedGrade()!)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Cosmetic Grade</p>
                          <span class="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                            [style.color]="gradeColor(selectedGrade()!)"
                            [style.background-color]="gradeColor(selectedGrade()!) + '15'"
                            [style.border-color]="gradeColor(selectedGrade()!) + '40'"
                          >
                            {{ gradeLabel(selectedGrade()!) }}
                          </span>
                          <p class="text-[11px] text-gray-500 mt-0.5">{{ gradeDescription(selectedGrade()!) }}</p>
                        </div>
                      </div>
                    }

                    <!-- Battery Health -->
                    @if (selectedBattery()) {
                      <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-0.5">
                          <div class="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100">
                            <svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Battery Health</p>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm font-bold text-gray-800">{{ selectedBattery() }}</span>
                          </div>
                          <p class="text-[11px] text-gray-500 mt-0.5">Tested for peak performance capacity</p>
                        </div>
                      </div>
                    }

                    <!-- Box Included (only if refurbished_details available) -->
                    @if (refurbishedDetails(); as rd) {
                      <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-0.5">
                          <div class="h-8 w-8 rounded-lg flex items-center justify-center"
                            [class.bg-green-100]="rd.boxIncluded"
                            [class.bg-gray-100]="!rd.boxIncluded"
                          >
                            <svg class="h-4 w-4"
                              [class.text-green-600]="rd.boxIncluded"
                              [class.text-gray-400]="!rd.boxIncluded"
                              fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Original Box</p>
                          @if (rd.boxIncluded) {
                            <div class="flex items-center gap-1.5 mt-1">
                              <svg class="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span class="text-sm font-semibold text-green-700">Box Included</span>
                            </div>
                          } @else {
                            <div class="flex items-center gap-1.5 mt-1">
                              <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span class="text-sm font-semibold text-gray-500">No Box</span>
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Accessories -->
                      @if (rd.accessories && rd.accessories.length > 0) {
                        <div class="flex items-start gap-3 sm:col-span-2">
                          <div class="flex-shrink-0 mt-0.5">
                            <div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">What's in the Box</p>
                            <div class="flex flex-wrap gap-1.5">
                              @for (acc of rd.accessories; track acc) {
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {{ acc }}
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                      }
                    }

                  </div>

                  <!-- Notes -->
                  @if (refurbishedDetails()?.notes) {
                    <div class="px-5 py-3 bg-white/50 border-t border-amber-100">
                      <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Engineer's Notes</p>
                      <p class="text-xs text-gray-600 leading-relaxed">{{ refurbishedDetails()!.notes }}</p>
                    </div>
                  }
                </div>
              }

              <!-- ============================================
                   DEALS SECTION
                   ============================================ -->
              <div>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 class="text-lg font-bold text-gray-900">Available Deals</h2>
                    @if (!dealsLoading() && sortedDeals().length > 0) {
                      <p class="text-xs text-gray-400 mt-0.5">{{ sortedDeals().length }} deal{{ sortedDeals().length === 1 ? '' : 's' }} from {{ uniqueNetworks() }} network{{ uniqueNetworks() === 1 ? '' : 's' }}</p>
                    }
                  </div>
                  @if (sortedDeals().length > 1) {
                    <div class="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                      @for (tab of sortTabs; track tab.key) {
                        <button
                          (click)="dealSort.set(tab.key)"
                          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                          [ngClass]="dealSort() === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'"
                        >
                          {{ tab.label }}
                        </button>
                      }
                    </div>
                  }
                </div>

                @if (dealsLoading()) {
                  <div class="space-y-4">
                    @for (i of [1,2,3]; track i) {
                      <app-deal-card-skeleton></app-deal-card-skeleton>
                    }
                  </div>
                } @else if (sortedDeals().length === 0) {
                  <app-empty-state
                    icon='<svg class="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>'
                    heading="No contract deals yet"
                    subheading="This product is listed on the site, but no network deals have been added. Add deals in the admin panel (Deals section) for this product to appear here."
                  ></app-empty-state>
                } @else {
                  <div class="space-y-4">
                    @for (deal of sortedDeals(); track deal.id) {
                      <app-deal-card
                        [deal]="deal"
                        [isHighlighted]="deal.id === bestValueDealId()"
                        (getDeal)="onGetDeal($event)"
                      ></app-deal-card>
                    }
                  </div>
                }
              </div><!-- /deals section -->

            </div><!-- /right col -->
          </div><!-- /two-col flex -->
        </div>
      </div>

    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);
  private toast = inject(ToastService);
  private cart = inject(CartService);

  // --- Data signals ---
  product = signal<Product | null>(null);
  deals = signal<Deal[]>([]);

  // --- UI state ---
  isLoading = signal(true);
  dealsLoading = signal(true);
  selectedImage = signal<string | null>(null);
  selectedStorage = signal<string | null>(null);
  selectedColour = signal<string | null>(null);
  selectedSimType = signal<string | null>(null);
  selectedCondition = signal<'new' | 'refurbished' | null>(null); // only used when product.condition === 'both'
  selectedGrade = signal<string | null>(null);
  selectedBattery = signal<string | null>(null);
  dealSort = signal<DealSort>('monthly');

  readonly sortTabs: { key: DealSort; label: string }[] = [
    { key: 'monthly',  label: 'Monthly Cost' },
    { key: 'data',     label: 'Data' },
    { key: 'upfront',  label: 'Upfront Cost' },
  ];

  // --- Derived ---
  primaryImageUrl = computed(() =>
    resolveProductImageUrl(getPrimaryProductImage(this.product()))
  );

  /** All parsed variants from the backend */
  productVariants = computed<ProductVariant[]>(() => {
    const p = this.product();
    if (!p?.variants) return [];
    try { return JSON.parse(p.variants) as ProductVariant[]; } catch { return []; }
  });

  /** The single variant matching current color+storage+simType+condition+grade+battery selection */
  selectedVariant = computed<ProductVariant | null>(() => {
    const col = this.selectedColour();
    const sto = this.selectedStorage();
    const sim = this.selectedSimType();
    const cond = this.selectedCondition();
    const grade = this.selectedGrade();
    const battery = this.selectedBattery();
    const variants = this.productVariants();
    const productCondition = normalizeProductCondition(this.product()?.condition);
    
    if (!col || !sto || !variants.length) return null;
    
    const isNew = productCondition === 'new' || (productCondition === 'both' && cond === 'new');

    return variants.find(v =>
      v.color.toLowerCase() === col.toLowerCase() &&
      v.storage.toLowerCase() === sto.toLowerCase() &&
      (!sim || (v.simType || '').toLowerCase() === sim.toLowerCase()) &&
      // Match condition only when product has 'both'
      (productCondition !== 'both' || (cond ? v.condition === cond : true)) &&
      // Match grade & battery only if we are looking at a refurbished variant
      (isNew || (grade ? v.grade === grade : true)) &&
      (isNew || (battery ? v.batteryHealth === battery : true))
    ) ?? null;
  });

  /** Gallery images: use the selected color's images (from any variant of that color), fallback to global gallery */
  galleryImages = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];

    const selectedCol = this.selectedColour();
    const variants = this.productVariants();

    // 1. Try finding specific images for the selected color (use first matching variant)
    if (selectedCol && variants.length > 0) {
      const colorVariant = variants.find(v =>
        v.color.toLowerCase() === selectedCol.toLowerCase() &&
        v.images && v.images.length > 0
      );
      if (colorVariant) {
        return colorVariant.images
          .map(url => resolveProductImageUrl(url))
          .filter((url): url is string => !!url);
      }
    }

    // 2. Fallback to first variant with images
    const withImages = variants.find(v => v.images && v.images.length > 0);
    if (withImages) {
      return withImages.images
        .map(url => resolveProductImageUrl(url))
        .filter((url): url is string => !!url);
    }

    return [];
  });

  // Variant pricing helpers
  variantPrice = computed<number | null>(() => {
    const v = this.selectedVariant();
    return v?.price != null ? v.price : null;
  });

  variantSalePrice = computed<number | null>(() => {
    const v = this.selectedVariant();
    return v?.salePrice != null ? v.salePrice : null;
  });

  variantStock = computed<number | null>(() => {
    const v = this.selectedVariant();
    return v?.stock != null ? v.stock : null;
  });

  variantSku = computed<string | null>(() => {
    const v = this.selectedVariant();
    return v?.sku ?? null;
  });

  isOutOfStock = computed(() => {
    const stock = this.variantStock();
    if (stock === null) return false; // no variant data — not applicable
    return stock <= 0;
  });

  storageOptions = computed<string[]>(() => {
    const p = this.product();
    if (!p?.storage_options) return [];
    try { return JSON.parse(p.storage_options) as string[]; } catch { return []; }
  });

  simTypes = computed<string[]>(() => {
    const p = this.product();
    if (!p?.sim_types) return [];
    try { return JSON.parse(p.sim_types) as string[]; } catch { return []; }
  });

  /** Parsed refurbished details — null if product is not refurbished or has no details */
  refurbishedDetails = computed<RefurbishedDetails | null>(() => {
    const p = this.product();
    if (!p?.refurbished_details) return null;
    try { return JSON.parse(p.refurbished_details) as RefurbishedDetails; } catch { return null; }
  });

  availableGrades = computed<string[]>(() => {
    return this.refurbishedDetails()?.availableGrades || [];
  });

  availableBatteryHealths = computed<string[]>(() => {
    return this.refurbishedDetails()?.availableBatteryHealths || [];
  });

  colours = computed<string[]>(() => {
    const p = this.product();
    if (!p?.colours) return [];
    try { return JSON.parse(p.colours) as string[]; } catch { return []; }
  });

  isSamsung = computed(() =>
    this.product()?.category_name?.toLowerCase().includes('samsung') ||
    this.product()?.category_id === 2
  );

  categoryRoute = computed(() =>
    this.isSamsung() ? '/samsung' : '/iphone'
  );

  breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const p = this.product();
    if (!p) return [];
    return [
      { label: p.category_name || 'Phones', route: this.categoryRoute() },
      { label: p.name }
    ];
  });

  lowestPrice = computed<number | null>(() => {
    const d = this.deals();
    if (!d.length) return null;
    return Math.min(...d.map(deal => deal.monthly_cost));
  });

  /** Best value = lowest total cost over contract period (monthly × months + upfront) */
  bestValueDealId = computed<number | null>(() => {
    const d = this.deals();
    if (!d.length) return null;
    return d.reduce((best, deal) => {
      const totalBest = best.monthly_cost * best.contract_months + best.upfront_cost;
      const totalDeal = deal.monthly_cost * deal.contract_months + deal.upfront_cost;
      return totalDeal < totalBest ? deal : best;
    }, d[0]).id;
  });

  sortedDeals = computed<Deal[]>(() => {
    const list = [...this.deals()];
    const sort = this.dealSort();
    if (sort === 'monthly') {
      list.sort((a, b) => a.monthly_cost - b.monthly_cost);
    } else if (sort === 'data') {
      list.sort((a, b) => b.data_gb - a.data_gb); // descending: most data first
    } else if (sort === 'upfront') {
      list.sort((a, b) => a.upfront_cost - b.upfront_cost);
    }
    return list;
  });

  uniqueNetworks = computed(() =>
    new Set(this.deals().map(d => d.network)).size
  );

  /** Returns true if a storage option has no stock for the currently selected color & sim */
  isStorageUnavailable(storage: string): boolean {
    const col = this.selectedColour();
    const sim = this.selectedSimType();
    const variants = this.productVariants();
    if (!col || !variants.length) return false;
    const v = variants.find(
      vv => vv.color.toLowerCase() === col.toLowerCase() &&
            vv.storage.toLowerCase() === storage.toLowerCase() &&
            (!sim || (vv.simType || '').toLowerCase() === sim.toLowerCase())
    );
    if (!v) return false; // variant not defined — assume available
    return (v.isActive === false) || (v.stock <= 0);
  }

  /** Returns Tailwind classes for a storage button based on availability + selection */
  storageButtonClass(opt: string): string {
    const selected = this.selectedStorage() === opt;
    const unavailable = this.isStorageUnavailable(opt);
    if (unavailable) {
      return 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50';
    }
    if (selected) {
      return 'border-accent bg-accent/5 text-accent';
    }
    return 'border-gray-200 text-gray-600 hover:border-gray-400';
  }

  /** Returns true if a SIM Type has no stock for the currently selected color & storage */
  isSimTypeUnavailable(sim: string): boolean {
    const col = this.selectedColour();
    const sto = this.selectedStorage();
    const variants = this.productVariants();
    if (!col || !sto || !variants.length) return false;
    const v = variants.find(
      vv => vv.color.toLowerCase() === col.toLowerCase() &&
            vv.storage.toLowerCase() === sto.toLowerCase() &&
            (vv.simType || '').toLowerCase() === sim.toLowerCase()
    );
    if (!v) return false;
    return (v.isActive === false) || (v.stock <= 0);
  }

  /** Returns Tailwind classes for a SIM Type button based on availability + selection */
  simTypeButtonClass(sim: string): string {
    const selected = this.selectedSimType() === sim;
    const unavailable = this.isSimTypeUnavailable(sim);
    if (unavailable) {
      return 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50';
    }
    if (selected) {
      return 'border-accent bg-accent/5 text-accent';
    }
    return 'border-gray-200 text-gray-600 hover:border-gray-400';
  }

  /** Returns the first resolved image URL for a given color (used in the vertical color strip thumbnails) */
  colorFirstImage(color: string): string | null {
    const variants = this.productVariants();
    const colorVariant = variants.find(v =>
      v.color.toLowerCase() === color.toLowerCase() &&
      v.images && v.images.length > 0
    );
    if (!colorVariant) return null;
    return resolveProductImageUrl(colorVariant.images[0]);
  }

  /** Returns the price for a given storage option under the currently selected color */
  storagePrice(storage: string): number | null {
    const col = this.selectedColour();
    const variants = this.productVariants();
    if (!col || !variants.length) return null;
    const sim = this.selectedSimType();
    const v = variants.find(
      vv => vv.color.toLowerCase() === this.selectedColour()?.toLowerCase() &&
            vv.storage.toLowerCase() === storage.toLowerCase() &&
            (!sim || (vv.simType || '').toLowerCase() === sim.toLowerCase())
    );
    return v?.price ?? null;
  }

  /** Calculates the discount percentage from regular price to sale price */
  discountPercent = computed<number | null>(() => {
    const price = this.variantPrice();
    const sale = this.variantSalePrice();
    if (!price || !sale || price <= 0) return null;
    return Math.round(((price - sale) / price) * 100);
  });

  /** Index of the currently selected image in the gallery */
  currentImageIndex = computed<number>(() => {
    const img = this.selectedImage();
    const gallery = this.galleryImages();
    if (!img || !gallery.length) return 0;
    const idx = gallery.indexOf(img);
    return idx >= 0 ? idx : 0;
  });

  /** Navigate to previous gallery image */
  prevImage(): void {
    const gallery = this.galleryImages();
    if (!gallery.length) return;
    const idx = this.currentImageIndex();
    this.selectedImage.set(gallery[(idx - 1 + gallery.length) % gallery.length]);
  }

  /** Navigate to next gallery image */
  nextImage(): void {
    const gallery = this.galleryImages();
    if (!gallery.length) return;
    const idx = this.currentImageIndex();
    this.selectedImage.set(gallery[(idx + 1) % gallery.length]);
  }

  constructor() {
    // When colour changes: update gallery images → reset selected image to first variant image
    effect(() => {
      const col = this.selectedColour();
      if (!col) return;
      
      const images = this.galleryImages();
      if (images.length > 0) {
        this.selectedImage.set(images[0]);
      } else {
        this.selectedImage.set(this.primaryImageUrl());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.router.navigate(['/']);
      return;
    }
    this.fetchProduct(slug);
  }

  ngOnDestroy(): void {
    this.seo.removeStructuredData();
  }

  private fetchProduct(slug: string) {
    this.isLoading.set(true);

    this.api.get<{ success: boolean; data: Product }>(`/api/products/${slug}`).subscribe({
      next: res => {
        if (!res.data) {
          this.router.navigate(['/']);
          return;
        }
        const p = res.data;
        this.product.set(p);
        this.selectedImage.set(resolveProductImageUrl(getPrimaryProductImage(p)));

        // Auto-select first storage + colour + simType
        const storage = this.storageOptions();
        if (storage.length) this.selectedStorage.set(storage[0]);
        const cols = this.colours();
        if (cols.length) this.selectedColour.set(cols[0]);
        const sims = this.simTypes();
        if (sims.length) this.selectedSimType.set(sims[0]);
        
        const normalizedCondition = normalizeProductCondition(p.condition, p.refurbished_details);
        if (normalizedCondition === 'both') this.selectedCondition.set('new');
        else if (normalizedCondition === 'refurbished') this.selectedCondition.set('refurbished');

        // Auto-select first grade and battery
        const grades = this.availableGrades();
        if (grades.length) this.selectedGrade.set(grades[0]);
        const batteries = this.availableBatteryHealths();
        if (batteries.length) this.selectedBattery.set(batteries[0]);

        this.isLoading.set(false);
        this.updateSeo(p);
        this.fetchDeals(p.id);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  private fetchDeals(productId: number) {
    this.dealsLoading.set(true);
    this.api.get<{ success: boolean; data: Deal[] }>('/api/deals', { product_id: String(productId) }).subscribe({
      next: res => {
        this.deals.set(res.data || []);
        this.dealsLoading.set(false);
        this.buildAndInjectJsonLd();
      },
      error: () => {
        this.dealsLoading.set(false);
      }
    });
  }

  private updateSeo(p: Product) {
    const categoryName = p.category_name || 'phone';
    const lowestStr = this.lowestPrice() ? `from £${this.lowestPrice()!.toFixed(2)}/month` : 'great prices';

    this.seo.setPageTitle(`${p.name} Deals`);
    this.seo.setCanonicalUrl(`/phones/${p.slug}`);
    this.seo.setMetaTags({
      description: `Compare the best ${p.name} contract deals in the UK. ${lowestStr === 'great prices' ? 'Find' : `From ${lowestStr} with`} EE, O2, Vodafone, Three and more. Updated daily.`,
      keywords: `${p.name} deals, ${p.name} contract, cheap ${p.name}, ${categoryName} deals UK`,
      ogImage: getPrimaryProductImage(p) ?? undefined,
      ogType: 'product',
    });
  }

  private buildAndInjectJsonLd() {
    const p = this.product();
    if (!p) return;

    const deals = this.deals();
    const offers = deals.map(d => ({
      '@type': 'Offer',
      price: d.monthly_cost.toFixed(2),
      priceCurrency: 'GBP',
      seller: { '@type': 'Organization', name: d.network },
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
    }));

    this.seo.setStructuredData({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: p.name,
      description: p.description || `${p.name} contract deals from UK networks.`,
      image: getPrimaryProductImage(p) || undefined,
      brand: {
        '@type': 'Brand',
        name: p.category_name?.toLowerCase().includes('samsung') ? 'Samsung' : 'Apple',
      },
      offers: offers.length > 0 ? offers : undefined,
    });
  }

  onGetDeal(deal: Deal): void {
    const p = this.product();
    if (!p) return;

    const item: CartItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      dealId: deal.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      primaryImageUrl: this.primaryImageUrl() ?? '',
      network: deal.network,
      contractMonths: deal.contract_months,
      monthlyCost: deal.monthly_cost,
      upfrontCost: deal.upfront_cost,
      dataGb: deal.data_gb,
      addedAt: Date.now(),
      color: this.selectedColour() ?? undefined,
      storage: this.selectedStorage() ?? undefined,
      simType: this.selectedSimType() ?? undefined
    };

    const added = this.cart.addItem(item);
    if (!added) {
      this.toast.info('This deal is already in your cart.');
    }

    this.router.navigate(['/cart']);
  }

  /** Maps colour names to approximate hex values dynamically based on keywords */
  colourToHex(colour: string): string {
    const key = colour.toLowerCase().trim();

    // 1. Exact matches for some common manufacturer specific shades
    const exactMap: Record<string, string> = {
      'black': '#1C1C1E', 'midnight': '#1C1C1E', 'starlight': '#FAF7F0',
      'product red': '#DC2626', 'sierra blue': '#67A3BF', 'pacific blue': '#3D6B8C',
      'alpine blue': '#5B8DB8'
    };
    if (exactMap[key]) return exactMap[key];

    // 2. Dynamic Keyword Matching
    // We look for color words inside the string. 
    // By finding the *last* occurring keyword, we correctly handle names like "Titanium Silverblue" (blue wins).
    const colorKeywords: Record<string, string> = {
      'gold': '#D4AF37', 'champagne': '#D4AF37',
      'yellow': '#FACC15', 'lemon': '#FACC15',
      'rose': '#EC4899', 'pink': '#EC4899', 'magenta': '#EC4899',
      'purple': '#8B5CF6', 'violet': '#8B5CF6', 'lavender': '#8B5CF6', 'lilac': '#8B5CF6', 'plum': '#8B5CF6',
      'red': '#DC2626', 'crimson': '#DC2626', 'ruby': '#DC2626',
      'orange': '#F97316', 'coral': '#F97316',
      'blue': '#3B82F6', 'navy': '#1E3A8A', 'cyan': '#06B6D4', 'sapphire': '#2563EB',
      'green': '#22C55E', 'jade': '#10B981', 'emerald': '#059669', 'mint': '#34D399', 'sage': '#84A98C',
      'teal': '#14B8A6',
      'white': '#F3F4F6', 'pearl': '#F3F4F6', 'snow': '#F3F4F6', 'porcelain': '#F3F4F6',
      'black': '#1C1C1E', 'obsidian': '#1C1C1E', 'jet': '#1C1C1E', 'charcoal': '#374151',
      'grey': '#9CA3AF', 'gray': '#9CA3AF', 'silver': '#E5E7EB', 'titanium': '#8C8C8C', 'graphite': '#4B5563', 'slate': '#64748B'
    };

    let lastMatchHex = null;
    let lastMatchIndex = -1;

    for (const [kw, hex] of Object.entries(colorKeywords)) {
      const idx = key.lastIndexOf(kw);
      if (idx > lastMatchIndex) {
        lastMatchIndex = idx;
        lastMatchHex = hex;
      }
    }

    if (lastMatchHex) return lastMatchHex;

    // 3. Fallback
    return '#94A3B8'; // slate-400
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith(PLACEHOLDER_PHONE_IMAGE)) return;
    img.src = PLACEHOLDER_PHONE_IMAGE;
  }

  /** Returns the hex color for a given refurbished grade */
  gradeColor(grade: string): string {
    const map: Record<string, string> = {
      like_new:  '#059669',
      excellent: '#0284c7',
      good:      '#d97706',
      fair:      '#dc2626',
    };
    return map[grade] ?? '#6b7280';
  }

  /** Returns the display label for a refurbished grade */
  gradeLabel(grade: string): string {
    const map: Record<string, string> = {
      like_new:  'Like New',
      excellent: 'Excellent',
      good:      'Good',
      fair:      'Fair',
    };
    return map[grade] ?? grade;
  }

  /** Returns the description for a refurbished grade */
  gradeDescription(grade: string): string {
    const map: Record<string, string> = {
      like_new:  'Essentially perfect condition — barely used',
      excellent: 'Minor signs of wear, screen and body in great shape',
      good:      'Light scratches visible but fully functional',
      fair:      'Noticeable wear marks — screen and internals fully tested',
    };
    return map[grade] ?? '';
  }
}
