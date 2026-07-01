import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div class="cd-backdrop" [class.cd-backdrop-visible]="visible" (click)="onCancel()"></div>

    <!-- Modal Panel -->
    <div class="cd-panel-wrap" [class.cd-panel-visible]="visible" role="alertdialog"
         aria-modal="true" [attr.aria-labelledby]="'cd-title'" [attr.aria-describedby]="'cd-msg'">
      <div class="cd-panel" #panel>

        <!-- Icon -->
        <div class="cd-icon-wrap" [ngClass]="iconClass">
          <!-- Warning -->
          <svg *ngIf="options.icon !== 'danger'" class="cd-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <!-- Danger (leave) -->
          <svg *ngIf="options.icon === 'danger'" class="cd-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <!-- Content -->
        <div class="cd-body">
          <h2 class="cd-title" id="cd-title">{{ options.title }}</h2>
          <p class="cd-message" id="cd-msg">{{ options.message }}</p>
        </div>

        <!-- Warning chips -->
        <div class="cd-chips">
          <span class="cd-chip">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            Your progress will be lost
          </span>
          <span class="cd-chip">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            Form data is not saved
          </span>
        </div>

        <!-- Actions -->
        <div class="cd-actions">
          <button class="cd-btn-cancel" (click)="onCancel()" #cancelBtn>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7 7-7"/>
            </svg>
            {{ options.cancelText }}
          </button>
          <button class="cd-btn-confirm" (click)="onConfirm()">
            {{ options.confirmText }}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Backdrop ────────────────────────────────────────────── */
    .cd-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0);
      backdrop-filter: blur(0px);
      z-index: 1000;
      transition: background 0.3s ease, backdrop-filter 0.3s ease;
      pointer-events: none;
    }
    .cd-backdrop-visible {
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      pointer-events: auto;
    }

    /* ── Panel wrapper ───────────────────────────────────────── */
    .cd-panel-wrap {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      pointer-events: none;
    }
    .cd-panel-visible { pointer-events: auto; }

    /* ── Panel ───────────────────────────────────────────────── */
    .cd-panel {
      background: #fff;
      border-radius: 1.5rem;
      box-shadow:
        0 25px 50px -12px rgba(0,0,0,0.35),
        0 0 0 1px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 420px;
      margin: 1rem;
      padding: 2rem;
      transform: scale(0.85) translateY(20px);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
    }
    .cd-panel-visible .cd-panel {
      transform: scale(1) translateY(0);
      opacity: 1;
    }

    /* ── Icon ────────────────────────────────────────────────── */
    .cd-icon-wrap {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .cd-icon-warning {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 2px solid #f59e0b;
      color: #b45309;
    }
    .cd-icon-danger {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border: 2px solid #f87171;
      color: #dc2626;
    }
    .cd-icon {
      width: 1.75rem;
      height: 1.75rem;
    }

    /* ── Body ────────────────────────────────────────────────── */
    .cd-body { text-align: center; margin-bottom: 1.25rem; }
    .cd-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem;
    }
    .cd-message {
      font-size: 0.9375rem;
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }

    /* ── Warning chips ───────────────────────────────────────── */
    .cd-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .cd-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 2rem;
      padding: 0.3rem 0.75rem;
      svg { width: 0.875rem; height: 0.875rem; }
    }

    /* ── Actions ─────────────────────────────────────────────── */
    .cd-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .cd-btn-cancel {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.875rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.875rem;
      background: #fff;
      color: #374151;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      svg { width: 1rem; height: 1rem; }
      &:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    }

    .cd-btn-confirm {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.875rem 1rem;
      border: none;
      border-radius: 0.875rem;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
      font-size: 0.9375rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(239,68,68,0.35);
      transition: all 0.2s;
      svg { width: 1rem; height: 1rem; }
      &:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 6px 18px rgba(239,68,68,0.45); transform: translateY(-1px); }
      &:active { transform: translateY(0); }
    }
  `]
})
export class ConfirmDialogComponent implements OnInit {
  @Input() options: ConfirmDialogOptions = {};
  @Output() result = new EventEmitter<boolean>();
  @ViewChild('cancelBtn') cancelBtn!: ElementRef<HTMLButtonElement>;

  visible = false;

  get iconClass(): string {
    return this.options.icon === 'danger' ? 'cd-icon-wrap cd-icon-danger' : 'cd-icon-wrap cd-icon-warning';
  }

  ngOnInit() {
    // Trigger entrance animation on next tick
    requestAnimationFrame(() => { this.visible = true; });
  }

  onConfirm() {
    // Emit immediately — do NOT delay with setTimeout.
    // The service handles the exit animation + DOM cleanup after the fact.
    this.result.emit(true);
  }

  onCancel() {
    this.result.emit(false);
  }

  /** Close on Escape key */
  @HostListener('document:keydown.escape')
  onEscape() { this.onCancel(); }
}
