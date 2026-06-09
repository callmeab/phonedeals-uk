import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal, NETWORK_COLOURS } from '../../../core/models/deal.model';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- "Best Value" label sits above the card boundary when highlighted -->
    @if (isHighlighted) {
      <div class="flex justify-center mb-0">
        <span class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-accent text-white text-xs font-bold tracking-widest uppercase shadow-md">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          Best Value
        </span>
      </div>
    }

    <!-- Main card -->
    <div
      class="relative bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      [ngClass]="isHighlighted
        ? 'border-2 border-accent shadow-lg shadow-blue-100 ring-1 ring-accent/20'
        : 'border border-gray-200 shadow-md hover:shadow-xl'"
    >

      <!-- Network header strip -->
      <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
        <!-- Network badge -->
        <span
          class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-extrabold tracking-wide"
          [ngClass]="networkClasses"
        >
          {{ deal.network }}
        </span>

        <!-- Contract length -->
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
          <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ deal.contract_months }} month contract
        </span>
      </div>

      <!-- Pricing block -->
      <div class="px-5 pt-5 pb-3">
        <div class="flex items-end gap-1 leading-none">
          <span class="text-[13px] font-semibold text-gray-500 mb-1.5">£</span>
          <span class="text-5xl font-black text-gray-900 tracking-tighter">{{ monthlyWhole }}</span>
          <span class="text-2xl font-bold text-gray-700 mb-1">.{{ monthlyPence }}</span>
          <span class="text-sm text-gray-400 font-medium mb-1.5 ml-0.5">/mo</span>
        </div>

        <!-- Upfront cost -->
        <p class="mt-2 text-sm"
           [ngClass]="deal.upfront_cost > 0 ? 'text-gray-500' : 'text-success font-semibold'"
        >
          @if (deal.upfront_cost > 0) {
            £{{ deal.upfront_cost.toFixed(2) }} upfront cost
          } @else {
            ✓ No upfront cost
          }
        </p>
      </div>

      <!-- Allowances -->
      <div class="px-5 py-3 space-y-2.5 border-t border-gray-100">

        <!-- Data -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-800">
              {{ deal.data_gb === 9999 ? 'Unlimited' : deal.data_gb + 'GB' }} data
            </p>
            @if (deal.data_gb === 9999) {
              <p class="text-xs text-gray-400">No data caps</p>
            }
          </div>
        </div>

        <!-- Minutes & Texts -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <p class="text-sm font-bold text-gray-800">
            @if (deal.minutes === 9999 && deal.texts === 9999) {
              Unlimited calls &amp; texts
            } @else if (deal.minutes === 9999) {
              Unlimited calls, {{ deal.texts === 9999 ? 'unlimited' : deal.texts }} texts
            } @else {
              {{ deal.minutes }} mins &amp; {{ deal.texts === 9999 ? 'unlimited' : deal.texts }} texts
            }
          </p>
        </div>

      </div>

      <!-- Deal highlights (max 3) -->
      @if (highlights.length > 0) {
        <div class="px-5 py-3 border-t border-gray-100">
          <ul class="space-y-1.5">
            @for (h of highlights.slice(0, 3); track h) {
              <li class="flex items-start gap-2 text-xs text-gray-600">
                <svg class="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                {{ h }}
              </li>
            }
          </ul>
        </div>
      }

      <!-- CTA -->
      <div class="px-5 pb-5 pt-4 mt-auto">
        <button
          (click)="onGetDeal()"
          class="w-full py-3 rounded-xl text-sm font-bold tracking-wide text-white transition-all duration-200 ease-out
                 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          [ngClass]="isHighlighted
            ? 'bg-accent hover:bg-blue-600 shadow-md shadow-blue-200 active:scale-[0.98]'
            : 'bg-primary hover:bg-slate-700 active:scale-[0.98]'"
        >
          Get this deal
          <svg class="inline-block w-4 h-4 ml-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealCardComponent {
  @Input({ required: true }) deal!: Deal;
  @Input() isHighlighted = false;
  @Output() getDeal = new EventEmitter<Deal>();

  onGetDeal(): void {
    this.getDeal.emit(this.deal);
  }

  /** Split the monthly cost into whole + pence for large typography */
  get monthlyWhole(): string {
    return Math.floor(this.deal.monthly_cost).toString();
  }

  get monthlyPence(): string {
    const pence = Math.round((this.deal.monthly_cost % 1) * 100);
    return pence.toString().padStart(2, '0');
  }

  get highlights(): string[] {
    if (!this.deal.deal_highlights) return [];
    try {
      const parsed = JSON.parse(this.deal.deal_highlights);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  get networkClasses(): string {
    const colours = NETWORK_COLOURS[this.deal.network];
    if (!colours) return 'bg-gray-100 text-gray-700';
    return `${colours.bg} ${colours.text}`;
  }
}
