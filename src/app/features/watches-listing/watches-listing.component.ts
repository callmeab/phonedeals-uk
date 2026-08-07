import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card/product-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const PAGE_SIZE = 12;
type SortKey = 'newest' | 'featured' | 'price_asc' | 'price_desc';

@Component({
  selector: 'app-watches-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent],
  templateUrl: './watches-listing.component.html',
  styleUrl: './watches-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchesListingComponent implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  private allProducts = signal<Product[]>([]);

  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal<string | null>(null);
  activeBrand = signal<string>('all');
  sortKey = signal<SortKey>('featured');
  visibleCount = signal(PAGE_SIZE);

  readonly brandKeywords = [
    'Apple Watch', 'Samsung Galaxy Watch', 'Samsung Galaxy Watch Ultra',
    'Samsung Galaxy Watch FE', 'Apple Watch Ultra',
  ];

  totalCount = computed(() => this.allProducts().length);

  dynamicBrands = computed(() => {
    const products = this.allProducts();
    const found = new Set<string>();
    products.forEach(p => {
      const match = this.brandKeywords.find(kw => p.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) found.add(match);
    });
    return this.brandKeywords.filter(kw => found.has(kw));
  });

  filteredProducts = computed(() => {
    let list = [...this.allProducts()];
    const brand = this.activeBrand();
    if (brand !== 'all') {
      list = list.filter(p => p.name.toLowerCase().includes(brand.toLowerCase()));
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
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`), label: '18hr Battery Life' },
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`), label: 'Health Monitoring' },
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`), label: 'Free UK Delivery' },
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`), label: '12-Month Warranty' },
  ];

  ngOnInit(): void {
    this.seo.setPageTitle('Smart Watch Deals UK');
    this.seo.setCanonicalUrl('/smart-watches');
    this.seo.setMetaTags({
      description: 'Shop the best smart watch deals in the UK. Apple Watch Series 10, Apple Watch Ultra, Samsung Galaxy Watch 7 and more. New and refurbished with free delivery.',
      keywords: 'smart watch deals UK, Apple Watch deals, Samsung Galaxy Watch, buy smartwatch UK, Apple Watch Series 10',
      ogImage: 'https://www.phonedeals.co.uk/og-watches.png',
    });
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.visibleCount.set(PAGE_SIZE);

    this.api.get<{ success: boolean; data: Product[] }>('/api/products', { category: 'smart-watches' }).subscribe({
      next: res => {
        this.allProducts.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load smart watches.');
        this.isLoading.set(false);
      }
    });
  }

  setBrandFilter(brand: string) {
    this.activeBrand.set(brand);
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
