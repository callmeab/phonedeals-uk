import {
  Component, Input, ChangeDetectionStrategy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { resolveProductImageUrl, getPrimaryProductImage, PLACEHOLDER_PHONE_IMAGE } from '../../../core/utils/image-url';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ============================================================
         GRID VARIANT — vertical card for listing pages
         ============================================================ -->
    @if (variant === 'grid') {
      <div
        (click)="navigate()"
        class="group relative bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
        [attr.aria-label]="'View deals for ' + product.name"
        role="button"
        tabindex="0"
        (keydown.enter)="navigate()"
      >
        <!-- Image area -->
        <div class="relative overflow-hidden bg-white aspect-[4/3] flex items-center justify-center px-6 pt-6 pb-2">

          <!-- Category badge — top-left overlay -->
          <span class="absolute top-3 left-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-sm"
            [ngClass]="getCategoryClasses()"
          >
            {{ product.category_name || (product.category_id === 1 ? 'iPhone' : 'Samsung') }}
          </span>

          <!-- Condition badge — bottom-left overlay -->
          <span
            class="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-sm"
            [ngClass]="conditionBadge.classes"
          >
            {{ conditionBadge.icon }} {{ conditionBadge.label }}
          </span>

          <!-- Featured ribbon — top-right -->
          @if (product.is_featured) {
            <div class="absolute top-0 right-0 z-10">
              <div class="relative overflow-hidden w-24 h-24">
                <div class="absolute top-[18px] right-[-22px] bg-accent text-white text-[10px] font-bold uppercase tracking-wider py-1 w-28 text-center rotate-45 shadow-md">
                  Featured
                </div>
              </div>
            </div>
          }

          <!-- Product image -->
          @if (primaryImageUrl()) {
            <img
              [src]="primaryImageUrl()!"
              [alt]="product.name"
              width="320"
              height="240"
              fetchpriority="high"
              loading="eager"
              (error)="onImageError($event)"
              class="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            >
          } @else {
            <!-- Placeholder when no image -->
            <div class="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.04]">
              <svg class="w-20 h-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
          }
        </div>

        <!-- Card body -->
        <div class="flex flex-col flex-1 px-5 pb-5 pt-3">

          <!-- Product name -->
          <h3 class="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-accent transition-colors duration-200">
            {{ product.name }}
          </h3>

          <!-- Storage chips -->
          @if (storageOptions.length > 0) {
            <div class="flex flex-wrap gap-1.5 mt-2.5">
              @for (opt of storageOptions.slice(0, 4); track opt) {
                <span class="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold tracking-wide">
                  {{ opt }}
                </span>
              }
              @if (storageOptions.length > 4) {
                <span class="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-medium">
                  +{{ storageOptions.length - 4 }} more
                </span>
              }
            </div>
          }

          <!-- Spacer -->
          <div class="flex-1 min-h-3"></div>

          <!-- CTA -->
          <button
            (click)="navigate(); $event.stopPropagation()"
            class="mt-4 w-full py-2.5 rounded-xl border-2 border-accent text-accent text-sm font-bold tracking-wide
                   transition-all duration-200 ease-out
                   group-hover:bg-accent group-hover:text-white
                   focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            View Deals
          </button>
        </div>
      </div>
    }

    <!-- ============================================================
         LIST VARIANT — horizontal row for mobile-first listings
         ============================================================ -->
    @if (variant === 'list') {
      <div
        (click)="navigate()"
        class="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer px-4 py-4"
        [attr.aria-label]="'View deals for ' + product.name"
        role="button"
        tabindex="0"
        (keydown.enter)="navigate()"
      >
        <!-- Thumbnail -->
        <div class="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
          @if (primaryImageUrl()) {
            <img
              [src]="primaryImageUrl()!"
              [alt]="product.name"
              width="80"
              height="80"
              loading="lazy"
              (error)="onImageError($event)"
              class="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            >
          } @else {
            <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          }
        </div>

        <!-- Name + chips -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1 flex-wrap">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide" [ngClass]="getCategoryClasses()">
              {{ product.category_name || (product.category_id === 1 ? 'iPhone' : 'Samsung') }}
            </span>
            <!-- Condition badge for list variant -->
            <span
              class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
              [ngClass]="conditionBadge.classes"
            >
              {{ conditionBadge.icon }} {{ conditionBadge.label }}
            </span>
            @if (product.is_featured) {
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-accent">★ Featured</span>
            }
          </div>
          <h3 class="text-sm font-bold text-gray-900 truncate group-hover:text-accent transition-colors">{{ product.name }}</h3>
          @if (storageOptions.length > 0) {
            <div class="flex flex-wrap gap-1 mt-1.5">
              @for (opt of storageOptions.slice(0, 3); track opt) {
                <span class="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold">{{ opt }}</span>
              }
              @if (storageOptions.length > 3) {
                <span class="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[10px]">+{{ storageOptions.length - 3 }}</span>
              }
            </div>
          }
        </div>

        <!-- View deals link -->
        <div class="flex-shrink-0">
          <span class="inline-flex items-center gap-1 text-sm font-bold text-accent group-hover:translate-x-1 transition-transform duration-200">
            View Deals
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() variant: 'grid' | 'list' = 'grid';

  private router = inject(Router);

  primaryImageUrl(): string | null {
    return resolveProductImageUrl(getPrimaryProductImage(this.product));
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith(PLACEHOLDER_PHONE_IMAGE)) return;
    img.src = PLACEHOLDER_PHONE_IMAGE;
  }

  get storageOptions(): string[] {
    if (!this.product.storage_options) return [];
    try {
      const parsed = JSON.parse(this.product.storage_options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  getCategoryClasses(): string {
    // Apple iPhone → silver/grey badge; Samsung Galaxy → blue badge
    const name = this.product.category_name || '';
    if (name.toLowerCase().includes('iphone') || this.product.category_id === 1) {
      return 'bg-gray-800 text-white';
    }
    return 'bg-blue-600 text-white';
  }

  /** Returns icon, label and CSS classes for the condition badge */
  get conditionBadge(): { icon: string; label: string; classes: string } {
    const condition = this.product.condition ?? 'new';
    switch (condition) {
      case 'refurbished':
        return {
          icon: '🔄',
          label: 'Refurbished',
          classes: 'bg-amber-100 text-amber-800 border border-amber-300',
        };
      case 'both':
        return {
          icon: '✨',
          label: 'New & Refurb',
          classes: 'bg-purple-100 text-purple-800 border border-purple-300',
        };
      case 'new':
      default:
        return {
          icon: '🟢',
          label: 'New',
          classes: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        };
    }
  }

  navigate(): void {
    this.router.navigate(['/phones', this.product.slug]);
  }
}

