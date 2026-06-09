import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6" aria-label="Breadcrumb">
      <a routerLink="/" class="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">Home</a>
      
      @for (item of items; track item.label; let last = $last) {
        <svg class="w-3 h-3 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
        </svg>
        
        @if (!last && item.route) {
          <a [routerLink]="item.route" class="hover:text-white transition-colors capitalize focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">
            {{ item.label }}
          </a>
        } @else {
          <span class="text-slate-300 capitalize truncate max-w-[200px]" [attr.aria-current]="last ? 'page' : null">
            {{ item.label }}
          </span>
        }
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  @Input({ required: true }) items: BreadcrumbItem[] = [];
}
