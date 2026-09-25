import { Component, OnInit, inject, signal, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-notice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (isVisible()) {
      <aside
        class="fixed bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-up"
        role="region"
        aria-label="Cookie and Privacy Notice"
      >
        <div class="flex items-start gap-3.5">
          <!-- Cookie Icon -->
          <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mt-0.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 3.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-4 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm8 2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-4-1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h2 class="text-sm font-semibold text-white">Cookie & Privacy Notice</h2>
              <button
                type="button"
                (click)="dismiss()"
                class="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500"
                aria-label="Close cookie banner"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              We use essential cookies and storage for cart persistence and secure sign-in. Our website analytics (Cloudflare) are privacy-first and cookie-less.
              <a
                routerLink="/cookie-policy"
                class="text-accent hover:text-blue-400 underline font-medium ml-1 inline-block transition-colors"
              >Learn more</a>
            </p>

            <div class="flex items-center justify-end">
              <button
                type="button"
                (click)="dismiss()"
                class="px-4 py-1.5 bg-accent hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </aside>
    }
  `,
  styles: [`
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieNoticeComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'mobello_cookie_notice_dismissed';

  isVisible = signal<boolean>(false);

  ngOnInit(): void {
    if (this.isBrowser) {
      try {
        const dismissed = localStorage.getItem(this.STORAGE_KEY);
        if (!dismissed) {
          setTimeout(() => {
            this.isVisible.set(true);
          }, 350);
        }
      } catch {
        // Fallback if localStorage is restricted
      }
    }
  }

  dismiss(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STORAGE_KEY, new Date().toISOString());
      } catch {
        // Fallback
      }
    }
    this.isVisible.set(false);
  }
}
