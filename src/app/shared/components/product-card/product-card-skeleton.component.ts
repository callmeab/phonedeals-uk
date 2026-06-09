import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    @if (variant === 'grid') {
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse h-full flex flex-col">
        <!-- Image area -->
        <div class="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200"></div>
        
        <!-- Content area -->
        <div class="p-5 flex flex-col flex-1 gap-4">
          <!-- Title -->
          <div class="h-5 bg-gray-200 rounded-full w-3/4"></div>
          
          <!-- Chips -->
          <div class="flex gap-2">
            <div class="h-6 w-16 bg-gray-100 rounded-full"></div>
            <div class="h-6 w-16 bg-gray-100 rounded-full"></div>
            <div class="h-6 w-16 bg-gray-100 rounded-full hidden sm:block"></div>
          </div>
          
          <div class="mt-auto pt-4">
            <!-- Button -->
            <div class="h-10 bg-gray-100 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    } @else {
      <!-- List variant skeleton -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse flex flex-col sm:flex-row p-4 gap-4">
        <div class="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div class="flex-1 space-y-3 py-1">
          <div class="h-5 bg-gray-200 rounded-full w-1/3"></div>
          <div class="flex gap-2">
            <div class="h-5 w-14 bg-gray-100 rounded-full"></div>
            <div class="h-5 w-14 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardSkeletonComponent {
  @Input() variant: 'grid' | 'list' = 'grid';
}
