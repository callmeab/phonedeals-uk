import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card/product-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const PAGE_SIZE = 12;
type SortKey = 'monthly_asc' | 'monthly_desc' | 'newest' | 'featured';
type CategoryTheme = {
  accent: string;
  heroBackground: string;
  heroGlow: string;
  heroPanel: string;
  bg?: string;
  gradient?: string;
  textHighlight?: string;
};

interface Category {
  id: number;
  name: string;
  slug: string;
  theme_color?: string;
}

@Component({
  selector: 'app-category-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent],
  template: `
    <!-- ============================================================
         HERO SECTION
         ============================================================ -->
    <section [style.background]="getHeroBackground()" class="pt-28 pb-24 md:pt-36 md:pb-32 text-center relative overflow-hidden transition-colors duration-500">
      
      <div class="absolute inset-0 flex justify-center items-center pointer-events-none opacity-50">
        <div class="w-[760px] h-[760px] rounded-full blur-3xl transition-all duration-500" [style.background]="categoryTheme().heroGlow"></div>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f5f7] to-transparent"></div>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-center mb-6">
          <app-breadcrumb [items]="[{ label: categoryName(), route: '/' + slug() }]" class="opacity-60 grayscale"></app-breadcrumb>
        </div>

        <div class="mx-auto mb-8 h-20 w-20 rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center text-4xl font-black text-white"
          [style.background]="categoryTheme().heroPanel"
          [style.boxShadow]="'0 24px 80px ' + categoryTheme().accent + '55'"
        >
          {{ categoryInitial() }}
        </div>

        <p class="text-xs sm:text-sm font-semibold tracking-widest text-white/80 uppercase mb-4">
          Best UK Deals
        </p>

        <h1 class="text-6xl sm:text-8xl md:text-[9rem] font-black text-white tracking-tighter leading-none mb-6">
          {{ categoryName() }}<span [style.color]="categoryTheme().accent">.</span>
        </h1>

        <p class="text-lg sm:text-2xl md:text-3xl text-white/65 font-medium tracking-tight max-w-2xl mx-auto">
          Compare the best {{ categoryName() }} deals across all UK networks.
        </p>

        <div class="mt-16 flex flex-wrap justify-center items-center gap-10 md:gap-20 text-white">
          <div class="text-center">
            <p class="text-3xl font-semibold tracking-tight">{{ totalCount() }}+</p>
            <p class="text-sm text-white/45 font-medium mt-1">Products available</p>
          </div>
          <div class="w-px h-10 bg-white/15"></div>
          <div class="text-center">
            <p class="text-3xl font-semibold tracking-tight">7</p>
            <p class="text-sm text-white/45 font-medium mt-1">Networks</p>
          </div>
          <div class="w-px h-10 bg-white/15"></div>
          <div class="text-center">
            <p class="text-3xl font-semibold tracking-tight">100%</p>
            <p class="text-sm text-white/45 font-medium mt-1">Independent</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         FILTER & SORT BAR
         ============================================================ -->
    <div class="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 sm:py-4">

          <!-- Sort dropdown -->
          <div class="flex-shrink-0 relative mt-2 sm:mt-0">
            <select
              [value]="sortKey()"
              (change)="onSortChange($event)"
              class="appearance-none bg-transparent text-sm font-medium text-gray-900 pb-1 border-b-2 border-black focus:outline-none cursor-pointer pr-5"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest First</option>
              <option value="monthly_asc">Price: Low to High</option>
              <option value="monthly_desc">Price: High to Low</option>
            </select>
            <svg class="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

        </div>
      </div>
    </div>

    <!-- ============================================================
         PRODUCT GRID
         ============================================================ -->
    <section class="bg-[#f5f5f7] min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">

        <!-- Loading state -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="bg-white rounded-3xl p-6 shadow-sm"><app-product-card-skeleton></app-product-card-skeleton></div>
            }
          </div>

        <!-- Error state -->
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-32 text-center">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
               <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 tracking-tight">Something went wrong.</h3>
            <p class="mt-2 text-gray-500">{{ error() }}</p>
            <button (click)="load()" class="mt-8 px-6 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors">
              Try Again
            </button>
          </div>

        <!-- Empty state -->
        } @else if (filteredProducts().length === 0) {
          <div class="bg-white rounded-[2.5rem] shadow-sm py-20 px-4 text-center">
            <app-empty-state
              icon='<svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
              heading="No products found in this category."
              subheading="Check back later or explore other categories."
            ></app-empty-state>
          </div>

        <!-- Grid -->
        } @else {
          <div class="mb-8">
            <p class="text-[13px] font-medium text-gray-500">
              Showing {{ displayedProducts().length }} of {{ filteredProducts().length }} results
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            @for (product of displayedProducts(); track product.id) {
              <div class="bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-2 overflow-hidden border border-gray-100">
                 <app-product-card [product]="product" variant="grid"></app-product-card>
              </div>
            }
          </div>

          <!-- Load More -->
          @if (canLoadMore()) {
            <div class="mt-16 flex justify-center">
              <button
                (click)="loadMore()"
                [disabled]="isLoadingMore()"
                class="px-8 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center min-w-[200px]"
              >
                @if (isLoadingMore()) {
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Loading...
                } @else {
                  View More {{ categoryName() }}
                }
              </button>
            </div>
          }
        }

      </div>
    </section>

    <!-- Trust Strip -->
    <section class="bg-white py-12 border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          @for (item of trustItems; track item.label) {
            <div class="flex items-center gap-3 text-gray-900 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black" [innerHTML]="item.icon"></div>
              <span class="text-sm font-bold tracking-tight">{{ item.label }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListingComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);

  slug = signal<string>('');
  categories = signal<Category[]>([]);
  selectedCategory = computed(() => this.categories().find(category => category.slug === this.slug()));
  categoryName = computed(() => {
    const selected = this.selectedCategory();
    if (selected) return selected.name;

    const s = this.slug();
    // Convert slug to title: "mobile-parts" → "Mobile Parts"
    return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  });

  categoryTheme = computed(() => {
    const savedTheme = this.parseCategoryTheme(this.selectedCategory()?.theme_color);
    if (savedTheme) return savedTheme;

    const s = this.slug().toLowerCase();
    
    // Explicit themes for specific keywords
    if (s.includes('mobile-part') || s.includes('parts')) {
      return this.createTheme('#06b6d4');
    }
    if (s.includes('tablet') || s.includes('ipad')) {
      return this.createTheme('#ec4899');
    }
    if (s.includes('accessori')) {
      return this.createTheme('#10b981');
    }
    if (s.includes('watch') || s.includes('smartwatch')) {
      return this.createTheme('#f97316');
    }
    
    // Deterministic random theme for any other unknown category based on string hash
    const colors = [
      '#f43f5e',
      '#3b82f6',
      '#a855f7',
      '#22c55e',
      '#64748b',
    ];
    
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.createTheme(colors[Math.abs(hash) % colors.length]);
  });

  private allProducts = signal<Product[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal<string | null>(null);
  sortKey = signal<SortKey>('featured');
  visibleCount = signal(PAGE_SIZE);

  totalCount = computed(() => this.allProducts().length);

  filteredProducts = computed(() => {
    let list = [...this.allProducts()];
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
    { icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>', label: 'Independent comparison' },
    { icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>', label: 'Updated daily' },
    { icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', label: 'No hidden charges' },
    { icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>', label: '7 UK networks' },
  ];

  ngOnInit(): void {
    this.loadCategories();

    // Read slug from URL params — works for any category
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.slug.set(slug);

      const name = this.categoryName();
      this.seo.setPageTitle(`${name} Deals`);
      this.seo.setCanonicalUrl(`/category/${slug}`);
      this.seo.setMetaTags({
        description: `Compare the best ${name} deals in the UK. Find cheap monthly plans from all major networks.`,
        keywords: `${name} deals, ${name} contracts, cheap ${name} plans, UK ${name} deals`,
      });

      if (isPlatformBrowser(this.platformId)) {
        this.load();
      }
    });
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.visibleCount.set(PAGE_SIZE);

    this.api.get<{ success: boolean; data: Product[] }>('/api/products', { category: this.slug() }).subscribe({
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

  private loadCategories() {
    this.api.get<{ success: boolean; data: Category[] }>('/api/categories').subscribe({
      next: res => this.categories.set(res.data || []),
      error: () => this.categories.set([]),
    });
  }

  private parseCategoryTheme(themeColor?: string): CategoryTheme | null {
    if (!themeColor) return null;

    try {
      const theme = JSON.parse(themeColor) as Partial<CategoryTheme>;
      if (theme.accent && theme.heroBackground && theme.heroGlow && theme.heroPanel) {
        return {
          accent: theme.accent,
          heroBackground: theme.heroBackground,
          heroGlow: theme.heroGlow,
          heroPanel: theme.heroPanel,
        };
      }
      if (theme.bg) {
        return this.createTheme(this.classToHex(theme.bg));
      }
    } catch {
      return null;
    }

    return null;
  }

  categoryInitial() {
    return this.categoryName().charAt(0).toUpperCase() || 'C';
  }

  getHeroBackground() {
    return this.categoryTheme().heroBackground;
  }

  private createTheme(accent: string): CategoryTheme {
    const color = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#2563eb';
    const dark = this.mixHex(color, '#020617', 0.62);
    const soft = this.mixHex(color, '#ffffff', 0.38);

    return {
      accent: color,
      heroBackground: `radial-gradient(circle at 70% 18%, ${soft}55 0, transparent 32%), linear-gradient(135deg, ${dark} 0%, #020617 58%, ${color} 145%)`,
      heroGlow: `radial-gradient(circle, ${color}80 0%, ${color}28 38%, transparent 72%)`,
      heroPanel: `linear-gradient(135deg, ${color} 0%, ${dark} 100%)`,
    };
  }

  private classToHex(className: string) {
    const colorMap: Record<string, string> = {
      'bg-black': '#111827',
      'bg-blue-600': '#2563eb',
      'bg-green-600': '#16a34a',
      'bg-purple-600': '#9333ea',
      'bg-slate-900': '#0f172a',
      'bg-zinc-900': '#18181b',
      'bg-gray-900': '#111827',
      'bg-neutral-900': '#171717',
    };

    return colorMap[className] || '#2563eb';
  }

  private mixHex(from: string, to: string, weight: number) {
    const fromRgb = this.hexToRgb(from);
    const toRgb = this.hexToRgb(to);
    const mixed = fromRgb.map((channel, index) =>
      Math.round(channel * (1 - weight) + toRgb[index] * weight)
    );

    return `#${mixed.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  private hexToRgb(hex: string) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
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
