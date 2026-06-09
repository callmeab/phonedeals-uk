import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-deal-card-skeleton',
  standalone: true,
  template: `
    <div class="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 animate-pulse">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        <!-- Left: Network & Term -->
        <div class="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-200 flex-shrink-0"></div>
          
          <div class="space-y-3 w-full max-w-[200px]">
            <div class="h-6 bg-gray-200 rounded-full w-3/4"></div>
            <div class="h-5 bg-gray-100 rounded-full w-1/2"></div>
            <div class="flex gap-2 pt-1">
              <div class="h-6 w-20 bg-gray-100 rounded-full"></div>
              <div class="h-6 w-16 bg-gray-100 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Right: Price & CTA -->
        <div class="flex flex-row sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto gap-4 sm:gap-3 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-4 sm:mt-0">
          <div class="space-y-2 text-left sm:text-right">
            <div class="h-8 bg-gray-200 rounded-full w-24 sm:ml-auto"></div>
            <div class="h-4 bg-gray-100 rounded-full w-16 sm:ml-auto"></div>
          </div>
          <div class="h-12 bg-gray-200 rounded-xl w-32 sm:w-40"></div>
        </div>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealCardSkeletonComponent {}
