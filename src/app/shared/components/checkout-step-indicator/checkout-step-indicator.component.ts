import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-step-indicator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8">
      <!-- Mobile View (<640px) -->
      <div class="sm:hidden text-center py-2 relative">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Step {{ currentStep }} of {{ totalSteps }}
        </p>
        <h2 class="text-2xl font-bold text-gray-900">
          {{ stepLabels[currentStep - 1] }}
        </h2>
        
        <!-- Subtle mini progress bar -->
        <div class="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out" 
               [style.width]="(currentStep / totalSteps) * 100 + '%'"></div>
        </div>
      </div>

      <!-- Desktop View (>=640px) -->
      <div class="hidden sm:flex items-center justify-between max-w-2xl mx-auto relative px-4">
        <!-- Connecting Lines (Background) -->
        <div class="absolute top-6 left-14 right-14 h-0.5 bg-gray-200 -z-10"></div>
        <div class="absolute top-6 left-14 h-0.5 bg-blue-600 -z-10 transition-all duration-300 ease-in-out"
             [style.width]="(currentStep === 1) ? '0%' : (currentStep === 2) ? '50%' : '100%'"
             style="max-width: calc(100% - 7rem);"></div>

        @for (label of stepLabels; track $index; let i = $index) {
          <div class="flex flex-col items-center gap-3 relative z-10 w-24">
            
            <!-- Completed Step -->
            @if (currentStep > i + 1) {
              <div class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm transition-all shadow-blue-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            }

            <!-- Current Step -->
            @if (currentStep === i + 1) {
              <div class="w-12 h-12 rounded-full bg-white border-4 border-blue-600 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm transition-all">
                {{ i + 1 }}
              </div>
            }

            <!-- Future Step -->
            @if (currentStep < i + 1) {
              <div class="w-12 h-12 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center font-bold text-lg transition-all">
                {{ i + 1 }}
              </div>
            }

            <!-- Label -->
            <span class="text-sm font-bold text-center tracking-tight"
                  [ngClass]="{
                    'text-gray-900': currentStep >= i + 1,
                    'text-gray-400': currentStep < i + 1
                  }">
              {{ label }}
            </span>
          </div>
        }
      </div>
    </div>
  `
})
export class CheckoutStepIndicatorComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 3;
  @Input() stepLabels: string[] = ['Your Details', 'Review', 'Payment'];
}
