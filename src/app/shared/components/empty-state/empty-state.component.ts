import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 border border-gray-100 shadow-sm" [innerHTML]="icon"></div>
      <h3 class="text-xl font-bold text-gray-900">{{ heading }}</h3>
      <p class="mt-2 text-sm text-gray-500 max-w-md mx-auto">{{ subheading }}</p>
      
      @if (actionLabel && actionRoute) {
        <a [routerLink]="actionRoute" 
           class="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
          {{ actionLabel }}
        </a>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) heading!: string;
  @Input({ required: true }) subheading!: string;
  @Input() actionLabel?: string;
  @Input() actionRoute?: string | any[];
}
