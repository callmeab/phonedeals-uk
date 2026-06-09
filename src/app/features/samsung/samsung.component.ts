import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID
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
  selector: 'app-samsung',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent],
  template: `
    <!-- ============================================================
         HERO SECTION — Samsung deep blue gradient
         ============================================================ -->
    <section class="relative overflow-hidden" style="background: linear-gradient(135deg, #0F172A 0%, #0D1F5C 55%, #1428A0 100%);">
      <!-- Grid texture overlay -->
      <div class="absolute inset-0 opacity-[0.05]"
        style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 48px 48px;">
      </div>
      <!-- Radial glow — Samsung blue -->
      <div class="absolute left-0 bottom-0 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none"
           style="background: radial-gradient(circle, rgba(20,40,160,0.5) 0%, transparent 70%); transform: translate(-20%, 30%);">
      </div>
      <!-- Secondary glow top-right -->
      <div class="absolute right-0 top-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-30"
           style="background: radial-gradient(circle, #1428A0 0%, transparent 70%); transform: translate(30%, -30%);">
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          <!-- Text content -->
          <div class="flex-1 text-center lg:text-left">
            <app-breadcrumb [items]="[{ label: 'Samsung', route: '/samsung' }]"></app-breadcrumb>

            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
                 style="background: rgba(20,40,160,0.3); border-color: rgba(20,40,160,0.6); color: #93B4FF;">
              <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #93B4FF;"></span>
              UK Deals Updated Daily
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Samsung Galaxy<br>
              <span style="color: #93B4FF;">Deals</span>
            </h1>

            <p class="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl lg:max-w-none">
              Find the best Samsung Galaxy S, A and Z Fold contract deals.
              Compare prices across every major UK network — no markup, no bias.
            </p>

            <!-- Quick stats -->
            <div class="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div class="text-center lg:text-left">
                <p class="text-2xl font-black text-white">{{ totalCount() }}+</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5">Galaxy models</p>
              </div>
              <div class="w-px bg-slate-700 hidden sm:block"></div>
              <div class="text-center lg:text-left">
                <p class="text-2xl font-black text-white">7</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5">Networks compared</p>
              </div>
              <div class="w-px bg-slate-700 hidden sm:block"></div>
              <div class="text-center lg:text-left">
                <p class="text-2xl font-black" style="color: #93B4FF;">Free</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5">No hidden fees</p>
              </div>
            </div>
          </div>

          <!-- Hero graphic — Galaxy-inspired abstract device -->
          <div class="flex-shrink-0 lg:w-64 xl:w-80 flex items-center justify-center">
            <div class="relative">
              <!-- Outer glow ring -->
              <div class="absolute inset-0 rounded-[48px] blur-2xl scale-110"
                   style="background: rgba(20,40,160,0.4);"></div>
              <!-- Phone SVG — slim Galaxy proportions -->
              <svg viewBox="0 0 200 420" class="relative w-44 lg:w-56 xl:w-64 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <!-- Body — more elongated for Galaxy -->
                <rect x="14" y="8" width="172" height="404" rx="40" ry="40" fill="#1E293B" stroke="#1428A0" stroke-width="2.5"/>
                <!-- Screen -->
                <rect x="22" y="16" width="156" height="388" rx="32" ry="32" fill="#0A1628"/>
                <!-- Punch-hole camera (Galaxy style — centred dot) -->
                <circle cx="100" cy="38" r="9" fill="#1E293B"/>
                <circle cx="100" cy="38" r="5" fill="#0A1628"/>
                <!-- Screen gradient wash -->
                <rect x="30" y="58" width="140" height="310" rx="14" fill="url(#samsungGrad)" opacity="0.8"/>
                <!-- UI elements — abstract Galaxy One UI cards -->
                <rect x="36" y="74" width="128" height="60" rx="14" fill="#1428A0" opacity="0.6"/>
                <rect x="48" y="84" width="50" height="8" rx="4" fill="#ffffff" opacity="0.7"/>
                <rect x="48" y="98" width="80" height="6" rx="3" fill="#93B4FF" opacity="0.6"/>
                <rect x="48" y="110" width="60" height="6" rx="3" fill="#93B4FF" opacity="0.4"/>
                <!-- Widget row -->
                <rect x="36" y="146" width="58" height="58" rx="14" fill="#0D1F5C" opacity="0.8"/>
                <rect x="106" y="146" width="58" height="58" rx="14" fill="#0D1F5C" opacity="0.8"/>
                <!-- Icon grid -->
                <rect x="44" y="218" width="24" height="24" rx="7" fill="#1428A0" opacity="0.9"/>
                <rect x="76" y="218" width="24" height="24" rx="7" fill="#10B981" opacity="0.8"/>
                <rect x="108" y="218" width="24" height="24" rx="7" fill="#F59E0B" opacity="0.8"/>
                <rect x="140" y="218" width="24" height="24" rx="7" fill="#EC4899" opacity="0.8"/>
                <rect x="44" y="254" width="24" height="24" rx="7" fill="#8B5CF6" opacity="0.8"/>
                <rect x="76" y="254" width="24" height="24" rx="7" fill="#EF4444" opacity="0.8"/>
                <rect x="108" y="254" width="24" height="24" rx="7" fill="#06B6D4" opacity="0.8"/>
                <rect x="140" y="254" width="24" height="24" rx="7" fill="#84CC16" opacity="0.8"/>
                <!-- Bottom navigation bar -->
                <rect x="30" y="296" width="140" height="50" rx="12" fill="#1428A0" opacity="0.25"/>
                <circle cx="65" cy="321" r="8" fill="#93B4FF" opacity="0.5"/>
                <circle cx="100" cy="321" r="8" fill="#ffffff" opacity="0.7"/>
                <circle cx="135" cy="321" r="8" fill="#93B4FF" opacity="0.5"/>
                <!-- Bottom pill nav -->
                <rect x="72" y="374" width="56" height="5" rx="2.5" fill="#334155"/>
                <!-- Side buttons -->
                <rect x="10" y="125" width="4" height="44" rx="2" fill="#1428A0"/>
                <rect x="186" y="110" width="4" height="32" rx="2" fill="#1428A0"/>
                <rect x="186" y="152" width="4" height="32" rx="2" fill="#1428A0"/>
                <defs>
                  <linearGradient id="samsungGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1428A0" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#0A1628" stop-opacity="0"/>
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
    <div class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4 py-3">

          <!-- Model chips — horizontally scrollable -->
          <div class="flex-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <div class="flex items-center gap-2 w-max">
              <button
                (click)="setModelFilter('all')"
                class="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2"
                [style.ring-color]="'#1428A0'"
                [ngClass]="activeModel() === 'all'
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                [style.background-color]="activeModel() === 'all' ? '#1428A0' : ''"
              >
                All Samsung
              </button>

              @for (model of dynamicModels(); track model) {
                <button
                  (click)="setModelFilter(model)"
                  class="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2"
                  [ngClass]="activeModel() === model
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  [style.background-color]="activeModel() === model ? '#1428A0' : ''"
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
              class="text-sm font-medium text-gray-700 border border-gray-300 rounded-lg py-1.5 pl-3 pr-3 bg-white focus:outline-none focus:ring-2 focus:border-blue-800 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="monthly_asc">Monthly Cost ↑</option>
              <option value="monthly_desc">Monthly Cost ↓</option>
              <option value="newest">Newest First</option>
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
              of <span class="font-semibold text-gray-800">{{ filteredProducts().length }}</span> Samsung Galaxy phones
            </p>
            @if (activeModel() !== 'all') {
              <button
                (click)="setModelFilter('all')"
                class="text-xs font-medium underline focus:outline-none"
                style="color: #1428A0;"
              >
                Clear filter
              </button>
            }
          </div>
        }

        <!-- Loading -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <app-product-card-skeleton></app-product-card-skeleton>
            }
          </div>

        <!-- Error -->
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-24">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-700">Couldn't load deals</h3>
            <p class="mt-1 text-sm text-gray-400">{{ error() }}</p>
            <button (click)="load()"
              class="mt-5 px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm"
              style="background: #1428A0; focus-ring-color: #1428A0;"
            >
              Try again
            </button>
          </div>

        <!-- Empty -->
        } @else if (filteredProducts().length === 0) {
          <app-empty-state
            icon='<svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
            heading="No Samsung Galaxy deals available at the moment"
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
                class="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 text-sm font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 shadow-sm"
                style="border-color: #1428A0; color: #1428A0;"
                onmouseenter="this.style.background='#1428A0'; this.style.color='white';"
                onmouseleave="this.style.background=''; this.style.color='#1428A0';"
              >
                @if (isLoadingMore()) {
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading…
                } @else {
                  Load more Samsung phones
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
export class SamsungComponent implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);

  private allProducts = signal<Product[]>([]);

  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal<string | null>(null);
  activeModel = signal<string>('all');
  sortKey = signal<SortKey>('featured');
  visibleCount = signal(PAGE_SIZE);

  /** Keyword list ordered by recency — newest models first so chips appear left-to-right */
  private readonly modelKeywords = [
    'Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy S26',
    'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25',
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy Z Fold7', 'Galaxy Z Fold6', 'Galaxy Z Fold5',
    'Galaxy Z Flip7', 'Galaxy Z Flip6', 'Galaxy Z Flip5',
    'Galaxy A57', 'Galaxy A56', 'Galaxy A55', 'Galaxy A36', 'Galaxy A35',
  ];

  dynamicModels = computed(() => {
    const products = this.allProducts();
    const found = new Set<string>();
    products.forEach(p => {
      const match = this.modelKeywords.find(kw =>
        p.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (match) found.add(match);
    });
    // Preserve the priority order from modelKeywords
    return this.modelKeywords.filter(kw => found.has(kw));
  });

  totalCount = computed(() => this.allProducts().length);

  filteredProducts = computed(() => {
    let list = [...this.allProducts()];
    const model = this.activeModel();

    if (model !== 'all') {
      list = list.filter(p => p.name.toLowerCase().includes(model.toLowerCase()));
    }

    const sort = this.sortKey();
    if (sort === 'featured') {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  });

  displayedProducts = computed(() => this.filteredProducts().slice(0, this.visibleCount()));

  canLoadMore = computed(() => this.visibleCount() < this.filteredProducts().length);

  readonly trustItems = [
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>', label: 'Independent comparison' },
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>', label: 'Updated daily' },
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', label: 'No hidden charges' },
    { icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>', label: '7 UK networks' },
  ];

  ngOnInit(): void {
    this.seo.setPageTitle('Samsung Galaxy Deals');
    this.seo.setCanonicalUrl('/samsung');
    this.seo.setMetaTags({
      description: 'Compare the best Samsung Galaxy contract deals in the UK. Find cheap monthly plans for Galaxy S, A and Z Fold series from EE, O2, Vodafone, Three and more.',
      keywords: 'Samsung Galaxy deals, Samsung contracts, cheap Samsung plans, Galaxy S deals, Galaxy Z Fold deals, UK Samsung deals',
      ogImage: 'https://www.phonedealsuk.co.uk/og-samsung.png',
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Samsung Galaxy Deals | PhoneDeals UK',
      description: 'Compare the best Samsung Galaxy contract deals from all UK networks.',
      url: 'https://www.phonedealsuk.co.uk/samsung',
    });
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.visibleCount.set(PAGE_SIZE);

    this.api.get<{ success: boolean; data: Product[] }>('/api/products', { category: 'samsung' }).subscribe({
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
    this.visibleCount.set(PAGE_SIZE);
  }

  onSortChange(event: Event) {
    this.sortKey.set((event.target as HTMLSelectElement).value as SortKey);
    this.visibleCount.set(PAGE_SIZE);
  }

  loadMore() {
    this.isLoadingMore.set(true);
    setTimeout(() => {
      this.visibleCount.update(n => n + PAGE_SIZE);
      this.isLoadingMore.set(false);
    }, 300);
  }
}
