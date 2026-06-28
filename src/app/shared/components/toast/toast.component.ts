import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed z-[9999] flex flex-col gap-3
                bottom-4 left-4 right-4
                sm:left-auto sm:right-5 sm:bottom-5 sm:top-auto sm:w-[380px]
                pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto relative flex items-start gap-3.5 px-4 py-3.5 rounded-2xl shadow-2xl overflow-hidden border"
          [ngClass]="{
            'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200':   toast.type === 'success',
            'bg-gradient-to-r from-red-50   to-rose-50   border-red-200':         toast.type === 'error',
            'bg-gradient-to-r from-amber-50  to-yellow-50 border-amber-200':      toast.type === 'warning',
            'bg-gradient-to-r from-blue-50   to-sky-50    border-blue-200':       toast.type === 'info'
          }">

          <!-- Coloured left accent bar -->
          <div class="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
               [ngClass]="{
                 'bg-emerald-500': toast.type === 'success',
                 'bg-red-500':     toast.type === 'error',
                 'bg-amber-500':   toast.type === 'warning',
                 'bg-blue-500':    toast.type === 'info'
               }"></div>

          <!-- Icon -->
          <div class="flex-shrink-0 ml-2 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center"
               [ngClass]="{
                 'bg-emerald-100': toast.type === 'success',
                 'bg-red-100':     toast.type === 'error',
                 'bg-amber-100':   toast.type === 'warning',
                 'bg-blue-100':    toast.type === 'info'
               }">
            @if (toast.type === 'success') {
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            } @else if (toast.type === 'error') {
              <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            } @else {
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pt-0.5">
            <p class="text-sm font-semibold leading-snug"
               [ngClass]="{
                 'text-emerald-900': toast.type === 'success',
                 'text-red-900':     toast.type === 'error',
                 'text-amber-900':   toast.type === 'warning',
                 'text-blue-900':    toast.type === 'info'
               }">
              {{ toastTitle(toast.type) }}
            </p>
            <p class="mt-0.5 text-sm leading-relaxed"
               [ngClass]="{
                 'text-emerald-700': toast.type === 'success',
                 'text-red-700':     toast.type === 'error',
                 'text-amber-700':   toast.type === 'warning',
                 'text-blue-700':    toast.type === 'info'
               }">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 mt-0.5 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1"
            [ngClass]="{
              'hover:bg-emerald-200/60 focus:ring-emerald-400': toast.type === 'success',
              'hover:bg-red-200/60     focus:ring-red-400':     toast.type === 'error',
              'hover:bg-amber-200/60   focus:ring-amber-400':   toast.type === 'warning',
              'hover:bg-blue-200/60    focus:ring-blue-400':    toast.type === 'info'
            }"
            aria-label="Dismiss notification"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Progress bar -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 toast-progress"
               [ngClass]="{
                 'bg-emerald-400': toast.type === 'success',
                 'bg-red-400':     toast.type === 'error',
                 'bg-amber-400':   toast.type === 'warning',
                 'bg-blue-400':    toast.type === 'info'
               }"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    /* Slide in from right (desktop) / up from bottom (mobile) */
    div.pointer-events-auto {
      animation: toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes toast-slide-in {
      from {
        transform: translateX(110%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Progress bar drains from full width to 0 over 4 seconds */
    .toast-progress {
      animation: toast-drain 4s linear forwards;
      transform-origin: left;
    }

    @keyframes toast-drain {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }

    @media (max-width: 639px) {
      div.pointer-events-auto {
        animation: toast-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes toast-slide-up {
        from { transform: translateY(120%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastTitle(type: string): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error':   return 'Something went wrong';
      case 'warning': return 'Warning';
      case 'info':    return 'Info';
      default:        return 'Notice';
    }
  }
}
