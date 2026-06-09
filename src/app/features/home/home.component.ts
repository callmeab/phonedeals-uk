import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card/product-card-skeleton.component';
import { NETWORK_COLOURS } from '../../core/models/deal.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent],
  template: `

    <!-- ============================================================
         SECTION 1 — HERO
         ============================================================ -->
    <section class="relative overflow-hidden bg-primary">

      <!-- Layered gradient mesh -->
      <div class="absolute inset-0"
        style="background: radial-gradient(ellipse 80% 60% at 60% -10%, rgba(59,130,246,0.35) 0%, transparent 60%),
                           radial-gradient(ellipse 50% 40% at 100% 80%, rgba(59,130,246,0.15) 0%, transparent 50%);"></div>

      <!-- Subtle dot grid -->
      <div class="absolute inset-0 opacity-[0.035]"
        style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 36px 36px;"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 xl:py-32 text-center">

        <!-- Pill label -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold tracking-widest uppercase mb-8">
          <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Updated Daily · All Major UK Networks
        </div>

        <!-- Headline -->
        <h1 class="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.02] tracking-tight">
          Find the Perfect<br>
          <span class="relative inline-block">
            <span class="text-accent">Phone Deal</span>
            <!-- Underline squiggle accent -->
            <svg class="absolute -bottom-2 left-0 w-full h-3 text-accent/40" viewBox="0 0 300 12" preserveAspectRatio="none">
              <path d="M0 8 Q37.5 0 75 8 Q112.5 16 150 8 Q187.5 0 225 8 Q262.5 16 300 8" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>
          </span>
        </h1>

        <!-- Subheadline -->
        <p class="mt-7 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Compare iPhone and Samsung contract deals from <strong class="text-white font-bold">all major UK networks</strong>.
          No bias. No registration. Just the best price.
        </p>

        <!-- CTA buttons -->
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/iphone"
            class="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-primary rounded-xl text-base font-bold shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
          >
            <!-- Apple logo SVG -->
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Browse iPhone Deals
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>

          <a routerLink="/samsung"
            class="group inline-flex items-center gap-2.5 px-8 py-4 bg-transparent text-white border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-xl text-base font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
          >
            <!-- Samsung-style icon -->
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
            </svg>
            Browse Samsung Deals
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Trust indicators -->
        <div class="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          @for (trust of trustIndicators; track trust) {
            <div class="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              {{ trust }}
            </div>
          }
        </div>

      </div>

      <!-- Bottom wave divider -->
      <div class="relative h-12 -mb-1">
        <svg class="absolute bottom-0 w-full" viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48L60 40C120 32 240 16 360 12C480 8 600 16 720 22C840 28 960 32 1080 30C1200 28 1320 20 1380 16L1440 12V48H1380C1320 48 1200 48 1080 48C960 48 840 48 720 48C600 48 480 48 360 48C240 48 120 48 60 48H0Z" fill="#F8FAFC"/>
        </svg>
      </div>
    </section>

    <!-- ============================================================
         SECTION 2 — FEATURED iPHONE DEALS
         ============================================================ -->
    <section class="bg-surface py-14 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Heading row -->
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="text-xs font-bold text-accent uppercase tracking-widest mb-1">Apple</p>
            <h2 class="text-2xl sm:text-3xl font-black text-gray-900">Latest iPhone Deals</h2>
          </div>
          <a routerLink="/iphone"
            class="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-blue-700 transition-colors focus:outline-none focus:underline flex-shrink-0"
          >
            View All
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Product row: horizontally scrollable with peek effect -->
        @if (isLoading()) {
          <!-- Shimmer skeleton -->
          <div class="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            @for (i of skeletons; track i) {
              <div class="flex-shrink-0 w-[220px] sm:w-[240px]">
                <app-product-card-skeleton></app-product-card-skeleton>
              </div>
            }
          </div>

        } @else if (iphoneProducts().length === 0) {
          <div class="text-center py-10 text-gray-400 text-sm">No iPhone deals available right now.</div>

        } @else {
          <div class="flex gap-5 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            @for (product of iphoneProducts(); track product.id) {
              <div class="flex-shrink-0 w-[220px] sm:w-[240px] snap-start">
                <app-product-card [product]="product" variant="grid"></app-product-card>
              </div>
            }
            <!-- "View All" trailing card -->
            <div class="flex-shrink-0 w-[180px] sm:w-[200px] snap-start flex items-stretch">
              <a routerLink="/iphone"
                class="flex flex-col items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed border-accent/30 text-accent font-bold text-sm hover:bg-accent/5 hover:border-accent transition-all duration-200 text-center px-4 py-8"
              >
                <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                View all iPhone deals
              </a>
            </div>
          </div>
        }

      </div>
    </section>

    <!-- ============================================================
         SECTION 3 — FEATURED SAMSUNG DEALS
         ============================================================ -->
    <section class="bg-white py-14 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest mb-1" style="color: #1428A0;">Samsung</p>
            <h2 class="text-2xl sm:text-3xl font-black text-gray-900">Latest Samsung Galaxy Deals</h2>
          </div>
          <a routerLink="/samsung"
            class="inline-flex items-center gap-1.5 text-sm font-bold transition-colors focus:outline-none focus:underline flex-shrink-0"
            style="color: #1428A0;"
          >
            View All
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (isLoading()) {
          <div class="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            @for (i of skeletons; track i) {
              <div class="flex-shrink-0 w-[220px] sm:w-[240px]">
                <app-product-card-skeleton></app-product-card-skeleton>
              </div>
            }
          </div>

        } @else if (samsungProducts().length === 0) {
          <div class="text-center py-10 text-gray-400 text-sm">No Samsung deals available right now.</div>

        } @else {
          <div class="flex gap-5 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            @for (product of samsungProducts(); track product.id) {
              <div class="flex-shrink-0 w-[220px] sm:w-[240px] snap-start">
                <app-product-card [product]="product" variant="grid"></app-product-card>
              </div>
            }
            <div class="flex-shrink-0 w-[180px] sm:w-[200px] snap-start flex items-stretch">
              <a routerLink="/samsung"
                class="flex flex-col items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed text-sm font-bold hover:opacity-80 transition-all duration-200 text-center px-4 py-8"
                style="border-color: rgba(20,40,160,0.3); color: #1428A0;"
              >
                <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: rgba(20,40,160,0.1);">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                View all Samsung deals
              </a>
            </div>
          </div>
        }

      </div>
    </section>

    <!-- ============================================================
         SECTION 4 — NETWORK LOGOS STRIP
         ============================================================ -->
    <section class="bg-gray-50 border-y border-gray-200 py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-7">
          Available on all major UK networks
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          @for (network of networks; track network.name) {
            <span
              class="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-extrabold tracking-wide shadow-sm border transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              [ngClass]="network.classes"
            >
              {{ network.name }}
            </span>
          }
        </div>
      </div>
    </section>

    <!-- ============================================================
         SECTION 5 — WHY USE PHONEDEALS UK
         ============================================================ -->
    <section class="bg-white py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Section title -->
        <div class="text-center mb-12">
          <p class="text-xs font-bold text-accent uppercase tracking-widest mb-2">Why PhoneDeals UK?</p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">The smarter way to compare</h2>
          <p class="mt-3 text-base text-gray-500 max-w-xl mx-auto">
            We do the hard work so you don't have to. Find the best deal in seconds.
          </p>
        </div>

        <!-- Feature cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          @for (feature of features; track feature.title) {
            <div class="relative group bg-surface rounded-2xl border border-gray-100 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <!-- Icon -->
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                   [ngClass]="feature.iconBg">
                <div [innerHTML]="feature.icon" class="w-7 h-7" [ngClass]="feature.iconColor"></div>
              </div>
              <!-- Text -->
              <h3 class="text-lg font-black text-gray-900 mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ feature.description }}</p>
              <!-- Decorative corner glow -->
              <div class="absolute top-0 right-0 w-24 h-24 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                <div class="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl" [ngClass]="feature.glowColor"></div>
              </div>
            </div>
          }
        </div>

      </div>
    </section>

    <!-- ============================================================
         SECTION 6 — CTA BANNER
         ============================================================ -->
    <section class="relative overflow-hidden bg-accent">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle, #fff 1.5px, transparent 1.5px); background-size: 28px 28px;"></div>
      <!-- Glow blobs -->
      <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-blue-300 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">

        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          Ready to find your<br class="hidden sm:block"> perfect deal?
        </h2>
        <p class="mt-4 text-base sm:text-lg text-blue-100 font-medium max-w-xl mx-auto">
          Thousands of deals compared. Zero cost to you. Updated daily.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/iphone"
            class="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl text-base font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Compare iPhone Deals
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>

          <a routerLink="/samsung"
            class="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl text-base font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
            </svg>
            Compare Samsung Deals
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Small trust note -->
        <p class="mt-6 text-xs text-blue-200 font-medium">
          Free to use · No account required · Independent comparison
        </p>

      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  iphoneProducts = signal<Product[]>([]);
  samsungProducts = signal<Product[]>([]);
  isLoading = signal(true);

  /** Array of 4 items just for *ngFor skeleton loop */
  readonly skeletons = [1, 2, 3, 4];

  readonly trustIndicators = [
    'No registration required',
    'Updated daily',
    'UK networks only',
    'Free comparison',
  ];

  readonly networks = [
    { name: 'EE',         classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'  },
    { name: 'O2',         classes: 'bg-blue-100 text-blue-800 border-blue-200'        },
    { name: 'Vodafone',   classes: 'bg-red-100 text-red-800 border-red-200'           },
    { name: 'Three',      classes: 'bg-orange-100 text-orange-800 border-orange-200'  },
    { name: 'Sky Mobile', classes: 'bg-teal-100 text-teal-800 border-teal-200'        },
    { name: 'iD Mobile',  classes: 'bg-purple-100 text-purple-800 border-purple-200'  },
    { name: 'BT Mobile',  classes: 'bg-indigo-100 text-indigo-800 border-indigo-200'  },
  ];

  readonly features = [
    {
      title: 'Compare in seconds',
      description: 'See every available contract deal for any iPhone or Samsung side-by-side. Monthly cost, data, upfront — all in one place.',
      icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
      iconBg: 'bg-blue-100',
      iconColor: 'text-accent',
      glowColor: 'bg-blue-400',
    },
    {
      title: 'No hidden fees',
      description: "Every price shown is what you actually pay. We don't add commissions or mark-up prices. What you see is what the network charges.",
      icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
      iconBg: 'bg-green-100',
      iconColor: 'text-success',
      glowColor: 'bg-green-400',
    },
    {
      title: 'UK networks only',
      description: "We only list deals from networks operating in the UK. EE, O2, Vodafone, Three, Sky Mobile, iD Mobile, and BT Mobile — that's it.",
      icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      glowColor: 'bg-purple-400',
    },
  ];

  ngOnInit(): void {
    this.seo.setPageTitle('Compare iPhone & Samsung Contract Deals');
    this.seo.setCanonicalUrl('/');
    this.seo.setMetaTags({
      description: 'Find the best iPhone and Samsung Galaxy contract deals from every major UK network. Compare EE, O2, Vodafone, Three, Sky Mobile and more. Updated daily, free to use.',
      keywords: 'iPhone deals, Samsung deals, phone contracts, UK network deals, cheap phone deals, EE deals, O2 deals, Vodafone deals',
      ogImage: 'https://www.phonedealsuk.co.uk/og-home.png',
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'PhoneDeals UK',
      url: 'https://www.phonedealsuk.co.uk',
      description: 'Independent UK comparison site for iPhone and Samsung contract deals.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.phonedealsuk.co.uk/iphone',
        'query-input': 'required name=search_term_string'
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadFeaturedProducts();
    }
  }

  private loadFeaturedProducts(): void {
    forkJoin({
      iphones: this.api.get<{ success: boolean; data: Product[] }>(
        '/api/products', { category: 'iphone', featured: 'true', limit: '6' }
      ),
      samsungs: this.api.get<{ success: boolean; data: Product[] }>(
        '/api/products', { category: 'samsung', featured: 'true', limit: '6' }
      ),
    }).subscribe({
      next: ({ iphones, samsungs }) => {
        // If no featured products, fall back to any products
        const iphoneList = iphones.data?.length ? iphones.data : [];
        const samsungList = samsungs.data?.length ? samsungs.data : [];

        // If featured returned empty, load any 6 as fallback
        if (!iphoneList.length) {
          this.loadFallback('iphone');
        } else {
          this.iphoneProducts.set(iphoneList);
        }
        if (!samsungList.length) {
          this.loadFallback('samsung');
        } else {
          this.samsungProducts.set(samsungList);
        }

        this.isLoading.set(false);
      },
      error: () => {
        // Even on error, stop the shimmer
        this.isLoading.set(false);
      }
    });
  }

  private loadFallback(category: 'iphone' | 'samsung'): void {
    this.api.get<{ success: boolean; data: Product[] }>(
      '/api/products', { category, limit: '6' }
    ).subscribe({
      next: res => {
        if (category === 'iphone') this.iphoneProducts.set(res.data || []);
        else this.samsungProducts.set(res.data || []);
      }
    });
  }
}
