import { Component, ChangeDetectionStrategy, signal, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass, AsyncPipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, AsyncPipe],
  template: `
    <!-- Skip to content link for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent text-white px-4 py-2 rounded z-[100] font-semibold">
      Skip to main content
    </a>

    <header 
      [ngClass]="{
        'bg-primary/95 backdrop-blur-md shadow-lg border-b border-white/10': isScrolled(),
        'bg-primary border-b border-transparent': !isScrolled()
      }"
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 text-white"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Logo -->
          <div class="flex-shrink-0">
            <a routerLink="/" class="text-2xl font-bold tracking-tight">
              PhoneDeals<span class="text-accent">UK</span>
            </a>
          </div>
          
          <!-- Desktop Nav -->
          <nav role="navigation" aria-label="Main Navigation" class="hidden lg:flex items-center space-x-8 h-full">
            <a routerLink="/" routerLinkActive="text-accent border-accent" [routerLinkActiveOptions]="{exact: true}" class="text-gray-300 hover:text-white h-full inline-flex items-center px-1 text-sm font-medium border-b-2 border-transparent transition-colors duration-200">Home</a>
            <a routerLink="/iphone" routerLinkActive="text-accent border-accent" class="text-gray-300 hover:text-white h-full inline-flex items-center px-1 text-sm font-medium border-b-2 border-transparent transition-colors duration-200">iPhone</a>
            <a routerLink="/samsung" routerLinkActive="text-accent border-accent" class="text-gray-300 hover:text-white h-full inline-flex items-center px-1 text-sm font-medium border-b-2 border-transparent transition-colors duration-200">Samsung</a>
          </nav>

          <!-- Desktop CTA -->
          <div class="hidden lg:flex items-center">
            <a routerLink="/" class="flex items-center space-x-2 bg-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 shadow-md shadow-accent/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Compare deals</span>
            </a>
          </div>

          <!-- Mobile menu button -->
          <div class="lg:hidden flex items-center">
            <button 
              (click)="toggleMobileMenu()" 
              type="button" 
              class="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent p-2 rounded-md"
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
              [attr.aria-expanded]="isMobileMenuOpen()"
            >
              @if (!isMobileMenuOpen()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Nav Drawer -->
      <div 
        id="mobile-menu"
        class="lg:hidden absolute top-20 left-0 w-full bg-primary/95 backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden flex flex-col"
        [ngClass]="isMobileMenuOpen() ? 'h-[calc(100vh-5rem)] opacity-100 border-t border-white/10' : 'h-0 opacity-0 border-transparent border-t-0'"
      >
        <nav role="navigation" aria-label="Mobile Navigation" class="px-4 pt-4 pb-6 flex-1 flex flex-col space-y-2">
          <a routerLink="/" routerLinkActive="text-accent bg-white/5" [routerLinkActiveOptions]="{exact: true}" class="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-4 rounded-md text-lg font-medium transition-colors">Home</a>
          <a routerLink="/iphone" routerLinkActive="text-accent bg-white/5" class="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-4 rounded-md text-lg font-medium transition-colors">iPhone</a>
          <a routerLink="/samsung" routerLinkActive="text-accent bg-white/5" class="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-4 rounded-md text-lg font-medium transition-colors">Samsung</a>
          
          <div class="pt-6 pb-2 mt-auto">
            <a routerLink="/" class="flex items-center justify-center space-x-2 bg-accent hover:bg-blue-600 text-white w-full px-5 py-4 rounded-full text-lg font-semibold transition-colors shadow-sm shadow-accent/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Compare deals</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private router = inject(Router);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  constructor() {
    // Automatically close mobile menu when navigating to a new route
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

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 80);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }
}
