import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  template: `
    <div class="h-screen flex overflow-hidden bg-gray-50">
      
      <!-- Mobile sidebar backdrop -->
      @if (isMobileMenuOpen()) {
        <div 
          class="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden transition-opacity"
          (click)="toggleMobileMenu()"
          aria-hidden="true"
        ></div>
      }

      <!-- Sidebar -->
      <aside 
        class="fixed inset-y-0 left-0 z-50 w-[240px] bg-primary flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0"
        [ngClass]="isMobileMenuOpen() ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
      >
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-white/10 shrink-0">
          <span class="text-white font-semibold text-lg tracking-tight">PhoneDeals Admin</span>
          <button (click)="toggleMobileMenu()" class="lg:hidden text-gray-300 hover:text-white focus:outline-none">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Sidebar Links -->
        <nav class="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <a 
            routerLink="/xk92-admin/dashboard" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Chart Bar -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </a>

          <a 
            routerLink="/xk92-admin/products" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Device Mobile -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Products
          </a>

          <a 
            routerLink="/xk92-admin/deals" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Currency Pound -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deals
          </a>

          <a 
            routerLink="/xk92-admin/categories" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Tag -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categories
          </a>
        </nav>

        <!-- Sidebar Footer (User info & Logout) -->
        <div class="shrink-0 border-t border-white/10 p-4">
          <div class="flex items-center mb-4 px-2">
            <div class="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
              A
            </div>
            <div class="ml-3 overflow-hidden">
              <p class="text-xs font-medium text-gray-300 truncate" title="{{ adminEmail() }}">{{ adminEmail() }}</p>
            </div>
          </div>
          <button 
            (click)="onSignOut()"
            class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden w-full">
        
        <!-- Mobile Top Bar -->
        <header class="lg:hidden bg-white shadow-sm border-b border-gray-200 shrink-0">
          <div class="flex items-center justify-between px-4 sm:px-6 py-3">
            <button 
              type="button" 
              class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
              (click)="toggleMobileMenu()"
            >
              <span class="sr-only">Open sidebar</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span class="font-semibold text-gray-900">PhoneDeals Admin</span>
            <div class="w-6"></div> <!-- Spacer for centering -->
          </div>
        </header>

        <!-- Scrollable content -->
        <main class="flex-1 overflow-y-auto outline-none focus:outline-none bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div class="max-w-[1400px] mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
        
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminShellComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMobileMenuOpen = signal(false);

  // Fallback email just in case, heavily relying on the signal's value
  adminEmail = signal(this.authService.currentAdmin()?.email || 'admin@phonedeals.co.uk');

  constructor() {
    effect(() => {
      const current = this.authService.currentAdmin();
      if (current?.email) {
        this.adminEmail.set(current.email);
      }
    }, { allowSignalWrites: true });

    // Automatically close the mobile menu whenever the router finishes navigating
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        if (this.isMobileMenuOpen()) {
          this.isMobileMenuOpen.set(false);
        }
      });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  onSignOut() {
    this.authService.logout();
  }
}
