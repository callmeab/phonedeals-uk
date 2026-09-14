import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
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
          <div class="flex items-center  text-white font-semibold text-lg tracking-tight">
            <img src="/image-logo/logo.png" alt="Logo" class="h-16 w-auto object-contain">
            <span>Mobello Admin</span>
          </div>
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
            routerLink="/xk92-admin/orders" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Shopping Cart -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Orders
          </a>

          <a 
            routerLink="/xk92-admin/preorders" 
            routerLinkActive="bg-accent text-white" 
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-center">
              <svg class="mr-3 h-5 w-5 shrink-0 text-indigo-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>iPhone 18 Bookings</span>
            </div>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              NEW
            </span>
          </a>

          <a 
            routerLink="/xk92-admin/preorders/pricing" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group pl-6"
          >
            <svg class="mr-3 h-4 w-4 shrink-0 text-emerald-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Manage Pricing</span>
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
            routerLink="/xk92-admin/categories" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- View Grid (Category) -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Categories
          </a>

          <a 
            routerLink="/xk92-admin/deals" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Tag (Deals) -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Deals
          </a>

          <a 
            routerLink="/xk92-admin/settings" 
            routerLinkActive="bg-accent text-white" 
            class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors group"
          >
            <!-- Cog -->
            <svg class="mr-3 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
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
        
        <!-- Top Navbar -->
        <header class="bg-white shadow-sm border-b border-gray-200 shrink-0 z-10 relative">
          <div class="flex items-center justify-between px-4 sm:px-6 py-3">
            <div class="flex items-center">
              <button 
                type="button" 
                class="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent rounded-md mr-4"
                (click)="toggleMobileMenu()"
              >
                <span class="sr-only">Open sidebar</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 class="text-xl font-semibold text-gray-800 hidden sm:block">Welcome, Admin</h2>
              <span class="font-semibold text-gray-900 sm:hidden">Mobello Admin</span>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button class="text-gray-400 hover:text-gray-500 relative focus:outline-none">
                <span class="sr-only">View notifications</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <!-- Notification Badge -->
                <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              <!-- Profile Dropdown (Simplified for layout) -->
              <div class="flex items-center space-x-3 border-l pl-4 border-gray-200">
                <div class="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                  A
                </div>
                <div class="hidden md:block">
                  <p class="text-sm font-medium text-gray-700 truncate max-w-[150px]">{{ adminEmail() }}</p>
                </div>
              </div>
            </div>
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
export class AdminLayoutComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMobileMenuOpen = signal(false);

  // Fallback email just in case, heavily relying on the signal's value
  adminEmail = signal(this.authService.currentAdmin()?.email || 'admin@mobello.uk');

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
