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
  templateUrl: './samsung.component.html',
  styleUrl: './samsung.component.scss',
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
