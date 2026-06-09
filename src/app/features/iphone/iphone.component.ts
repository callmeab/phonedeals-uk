import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card/product-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const PAGE_SIZE = 12;

type SortKey = 'monthly_asc' | 'monthly_desc' | 'newest' | 'featured';

@Component({
  selector: 'app-iphone',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent],
  template: `
    <!-- ============================================================
         HERO SECTION
         ============================================================ -->
    <section class="relative bg-primary overflow-hidden">
      <!-- Background grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 48px 48px;">
      </div>
      <!-- Radial glow -->
      <div class="absolute right-0 top-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          <!-- Text content -->
          <div class="flex-1 text-center lg:text-left">
            <app-breadcrumb [items]="[{ label: 'iPhone', route: '/iphone' }]"></app-breadcrumb>

            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase mb-4">
              <span class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
              UK Deals Updated Daily
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
              iPhone<br>
              <span class="text-accent">Deals</span>
            </h1>

            <p class="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl lg:max-w-none">
              Compare the latest iPhone contract deals from EE, O2, Vodafone and more.
              Find the best monthly price across every UK network.
            </p>

            <!-- Quick stats -->
            <div class="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div class="text-center lg:text-left">
                <p class="text-2xl font-black text-white">{{ totalCount() }}+</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5">Models available</p>
              </div>
              <div class="w-px bg-slate-700 hidden sm:block"></div>
              <div class="text-center lg:text-left">
                <p class="text-2xl font-black text-white">7</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5">Networks compared</p>
              </div>
              <div class="w-px bg-slate-700 hidden sm:block"></div>
              <div class="text-center lg:text-left">
                <p class="text-2xl font-black text-accent">Free</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5">No hidden fees</p>
              </div>
            </div>
          </div>

          <!-- Hero graphic — stylised iPhone silhouette in SVG -->
          <div class="flex-shrink-0 lg:w-64 xl:w-80 flex items-center justify-center">
            <div class="relative">
              <!-- Glow ring -->
              <div class="absolute inset-0 rounded-[48px] bg-accent/20 blur-2xl scale-110"></div>
              <!-- Phone body -->
              <svg viewBox="0 0 200 400" class="relative w-44 lg:w-56 xl:w-64 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <!-- Body -->
                <rect x="10" y="10" width="180" height="380" rx="36" ry="36" fill="#1E293B" stroke="#334155" stroke-width="2"/>
                <!-- Screen -->
                <rect x="20" y="20" width="160" height="360" rx="28" ry="28" fill="#0F172A"/>
                <!-- Dynamic island -->
                <rect x="72" y="34" width="56" height="22" rx="11" fill="#1E293B"/>
                <!-- Screen content glow -->
                <rect x="30" y="70" width="140" height="290" rx="12" fill="url(#screenGrad)" opacity="0.7"/>
                <!-- App icons grid (abstract) -->
                <rect x="44" y="90" width="28" height="28" rx="7" fill="#3B82F6" opacity="0.8"/>
                <rect x="84" y="90" width="28" height="28" rx="7" fill="#10B981" opacity="0.8"/>
                <rect x="124" y="90" width="28" height="28" rx="7" fill="#8B5CF6" opacity="0.8"/>
                <rect x="44" y="130" width="28" height="28" rx="7" fill="#F59E0B" opacity="0.8"/>
                <rect x="84" y="130" width="28" height="28" rx="7" fill="#EF4444" opacity="0.8"/>
                <rect x="124" y="130" width="28" height="28" rx="7" fill="#EC4899" opacity="0.8"/>
                <!-- Bottom bar -->
                <rect x="70" y="340" width="60" height="5" rx="2.5" fill="#334155"/>
                <!-- Side buttons -->
                <rect x="6" y="120" width="4" height="36" rx="2" fill="#334155"/>
                <rect x="6" y="168" width="4" height="36" rx="2" fill="#334155"/>
                <rect x="190" y="140" width="4" height="52" rx="2" fill="#334155"/>
                <defs>
                  <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#0F172A" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ============================================================
         FILTER & SORT BAR (sticky)
         ============================================================ -->
    <div #filterBar class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4 py-3">

          <!-- Model chips — horizontally scrollable -->
          <div class="flex-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <div class="flex items-center gap-2 w-max">
              <button
                (click)="setModelFilter('all')"
                class="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
                [ngClass]="activeModel() === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                All iPhones
              </button>

              @for (model of dynamicModels(); track model) {
                <button
                  (click)="setModelFilter(model)"
                  class="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent"
                  [ngClass]="activeModel() === model
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ model }}
                </button>
              }
            </div>
          </div>

          <!-- Divider -->
          <div class="hidden sm:block w-px h-7 bg-gray-200 flex-shrink-0"></div>

          <!-- Sort dropdown -->
          <div class="flex-shrink-0">
            <select
              [value]="sortKey()"
              (change)="onSortChange($event)"
              class="text-sm font-medium text-gray-700 border border-gray-300 rounded-lg py-1.5 pl-3 pr-3 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent cursor-pointer"
            >
              <option value="monthly_asc">Monthly Cost ↑</option>
              <option value="monthly_desc">Monthly Cost ↓</option>
              <option value="newest">Newest First</option>
              <option value="featured">Featured First</option>
            </select>
          </div>

        </div>
      </div>
    </div>

    <!-- ============================================================
         PRODUCT GRID
         ============================================================ -->
    <section class="bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <!-- Results count -->
        @if (!isLoading() && displayedProducts().length > 0) {
          <div class="mb-6 flex items-center justify-between">
            <p class="text-sm text-gray-500">
              Showing <span class="font-semibold text-gray-800">{{ displayedProducts().length }}</span>
              of <span class="font-semibold text-gray-800">{{ filteredProducts().length }}</span> iPhones
            </p>
            @if (activeModel() !== 'all') {
              <button
                (click)="setModelFilter('all')"
                class="text-xs font-medium text-accent hover:text-blue-700 underline focus:outline-none"
              >
                Clear filter
              </button>
            }
          </div>
        }

        <!-- Loading state -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <app-product-card-skeleton></app-product-card-skeleton>
            }
          </div>

        <!-- Error state -->
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-24">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-700">Couldn't load deals</h3>
            <p class="mt-1 text-sm text-gray-400">{{ error() }}</p>
            <button (click)="load()" class="mt-5 px-5 py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 shadow-sm">
              Try again
            </button>
          </div>

        <!-- Empty state -->
        } @else if (filteredProducts().length === 0) {
          <app-empty-state
            icon='<svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
            heading="No iPhone deals available at the moment"
            subheading="Check back soon — we update deals daily."
          ></app-empty-state>

        <!-- Grid -->
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            @for (product of displayedProducts(); track product.id) {
              <app-product-card [product]="product" variant="grid"></app-product-card>
            }
          </div>

          <!-- Load More -->
          @if (canLoadMore()) {
            <div class="mt-10 flex flex-col items-center gap-3">
              <button
                (click)="loadMore()"
                [disabled]="isLoadingMore()"
                class="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-accent text-accent text-sm font-bold tracking-wide hover:bg-accent hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 shadow-sm"
              >
                @if (isLoadingMore()) {
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading…
                } @else {
                  Load more iPhones
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                }
              </button>
              <p class="text-xs text-gray-400">
                {{ displayedProducts().length }} of {{ filteredProducts().length }} shown
              </p>
            </div>
          }
        }

      </div>
    </section>

    <!-- ============================================================
         TRUST STRIP
         ============================================================ -->
    <section class="bg-white border-t border-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
          @for (item of trustItems; track item.label) {
            <div class="flex items-center gap-2.5 text-gray-500">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                   [innerHTML]="item.icon"></div>
              <span class="text-sm font-medium">{{ item.label }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IphoneComponent implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);

  // Raw data from API
  private allProducts = signal<Product[]>([]);

  // UI state
  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal<string | null>(null);
  activeModel = signal<string>('all');
  sortKey = signal<SortKey>('featured');
  visibleCount = signal(PAGE_SIZE);

  // Derived: unique model labels parsed from product names
  dynamicModels = computed(() => {
    const products = this.allProducts();
    const modelKeywords = ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
                           'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
                           'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
                           'iPhone 13', 'iPhone 12', 'iPhone SE'];

    const found = new Set<string>();
    products.forEach(p => {
      const match = modelKeywords.find(kw => p.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) found.add(match);
    });
    return Array.from(found);
  });

  totalCount = computed(() => this.allProducts().length);

  // Products after model filter applied
  filteredProducts = computed(() => {
    let list = [...this.allProducts()];
    const model = this.activeModel();

    if (model !== 'all') {
      list = list.filter(p => p.name.toLowerCase().includes(model.toLowerCase()));
    }

    // Sort
    const sort = this.sortKey();
    if (sort === 'featured') {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    // monthly_asc / monthly_desc — no sorting on product level (deals hold cost)
    // When product-level sort is unavailable, featured is the best proxy

    return list;
  });

  // Products shown so far (before "Load More")
  displayedProducts = computed(() => this.filteredProducts().slice(0, this.visibleCount()));

  canLoadMore = computed(() => this.visibleCount() < this.filteredProducts().length);

  readonly trustItems = [
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>', label: 'Independent comparison' },
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>', label: 'Updated daily' },
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', label: 'No hidden charges' },
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>', label: '7 UK networks' },
  ];

  ngOnInit(): void {
    this.seo.setPageTitle('iPhone Deals');
    this.seo.setCanonicalUrl('/iphone');
    this.seo.setMetaTags({
      description: 'Compare the best iPhone contract deals in the UK. Find cheap monthly plans from EE, O2, Vodafone, Three, Sky Mobile and more. Updated daily.',
      keywords: 'iPhone deals, iPhone contracts, cheap iPhone plans, EE iPhone, O2 iPhone, Vodafone iPhone, UK iPhone deals',
      ogImage: 'https://www.phonedealsuk.co.uk/og-iphone.png',
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'iPhone Deals | PhoneDeals UK',
      description: 'Compare the best iPhone contract deals from all UK networks.',
      url: 'https://www.phonedealsuk.co.uk/iphone',
    });
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.visibleCount.set(PAGE_SIZE);

    this.api.get<{ success: boolean; data: Product[] }>('/api/products', { category: 'iphone' }).subscribe({
      next: res => {
        this.allProducts.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load products.');
        this.isLoading.set(false);
      }
    });
  }

  setModelFilter(model: string) {
    this.activeModel.set(model);
    this.visibleCount.set(PAGE_SIZE); // reset pagination on filter change
  }

  onSortChange(event: Event) {
    this.sortKey.set((event.target as HTMLSelectElement).value as SortKey);
    this.visibleCount.set(PAGE_SIZE);
  }

  loadMore() {
    this.isLoadingMore.set(true);
    // Simulate a brief async tick so the spinner renders before the DOM update
    setTimeout(() => {
      this.visibleCount.update(n => n + PAGE_SIZE);
      this.isLoadingMore.set(false);
    }, 300);
  }
}
