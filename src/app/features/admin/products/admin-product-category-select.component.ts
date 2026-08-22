import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

interface CategoryCard {
  id: number;
  name: string;
  slug: string;
  route: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

@Component({
  selector: 'app-admin-product-category-select',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto space-y-8 pb-12">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Add New Product</h1>
          <p class="text-sm text-gray-500 mt-1">Step 1 of 2 — Pehle product category choose karein</p>
        </div>
        <a routerLink="/xk92-admin/products"
           class="text-sm font-medium text-gray-500 hover:text-gray-700 underline focus:outline-none mt-1">
          Cancel &amp; Return
        </a>
      </div>

      <!-- Progress Indicator -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">1</span>
          <span class="text-sm font-semibold text-accent">Select Category</span>
        </div>
        <div class="flex-1 h-px bg-gray-200"></div>
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-400 text-xs font-bold">2</span>
          <span class="text-sm font-medium text-gray-400">Fill Product Details</span>
        </div>
      </div>

      <!-- Category Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (cat of categories; track cat.id) {
          <button
            type="button"
            (click)="selectCategory(cat)"
            class="group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            [class]="cat.bgColor + ' ' + cat.borderColor + ' hover:' + cat.borderColor"
          >
            <!-- Icon -->
            <div class="flex h-14 w-14 items-center justify-center rounded-xl shadow-sm"
                 [class]="cat.color">
              <span class="text-2xl" [innerHTML]="cat.icon"></span>
            </div>

            <!-- Text -->
            <div class="flex-1">
              <h2 class="text-lg font-bold" [class]="cat.textColor">{{ cat.name }}</h2>
              <p class="mt-1 text-sm text-gray-500 leading-snug">{{ cat.description }}</p>
            </div>

            <!-- Arrow -->
            <div class="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <!-- Selected check (hover state) -->
            <div class="absolute right-5 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                Select
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        }
      </div>

      <!-- Help text -->
      <p class="text-center text-xs text-gray-400">
        Category ek baar choose karne ke baad form mein automatically set ho jayegi.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductCategorySelectComponent {
  private router = inject(Router);

  readonly categories: CategoryCard[] = [
    {
      id: 1,
      name: 'Mobile Phone',
      slug: 'iphone',
      route: '/xk92-admin/products/new/mobile',
      icon: '📱',
      description: 'iPhone ya Samsung — storage, colours, SIM type, aur refurbished variants ke saath.',
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
    },
    {
      id: 3,
      name: 'Accessories',
      slug: 'accessories',
      route: '/xk92-admin/products/new/accessories',
      icon: '🎧',
      description: 'Cases, chargers, cables, screen protectors — phone compatibility ke saath.',
      color: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
    },
    /* iPad disabled for now
    {
      id: 4,
      name: 'iPad',
      slug: 'ipad',
      route: '/xk92-admin/products/new/ipad',
      icon: '📟',
      description: 'iPad models — storage, WiFi/Cellular, colours, condition aur variants ke saath.',
      color: 'bg-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      textColor: 'text-violet-900',
    },
    */
    {
      id: 5,
      name: 'Smart Watch',
      slug: 'smart-watches',
      route: '/xk92-admin/products/new/watches',
      icon: '⌚',
      description: 'Apple Watch ya Samsung Watch — size, band, GPS/Cellular ke saath.',
      color: 'bg-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
    },
  ];

  selectCategory(cat: CategoryCard) {
    this.router.navigate([cat.route]);
  }
}
