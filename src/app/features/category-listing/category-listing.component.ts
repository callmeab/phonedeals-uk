import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { Product } from '../../core/models/product.model';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card/product-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ChangeDetectionStrategy, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';

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
  templateUrl: './category-listing.component.html',
  styleUrl: './category-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListingComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

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

  heroStyle = computed(() => {
    const s = this.slug();
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    const styleIndex = Math.abs(hash) % 3;
    return `style${styleIndex + 1}`;
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
    { icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>'), label: 'Independent comparison' },
    { icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'), label: 'Updated daily' },
    { icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'), label: 'No hidden charges' },
    { icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>'), label: '7 UK networks' },
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
