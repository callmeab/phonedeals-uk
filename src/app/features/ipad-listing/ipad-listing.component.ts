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
  selector: 'app-ipad-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent],
  templateUrl: './ipad-listing.component.html',
  styleUrl: './ipad-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IpadListingComponent implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  private allProducts = signal<Product[]>([]);

  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal<string | null>(null);
  activeFilter = signal<string>('all');
  sortKey = signal<SortKey>('featured');
  visibleCount = signal(PAGE_SIZE);

  readonly modelKeywords = [
    'iPad Pro', 'iPad Air', 'iPad mini', 'iPad (10th Gen)', 'iPad (9th Gen)',
  ];

  totalCount = computed(() => this.allProducts().length);

  dynamicModels = computed(() => {
    const products = this.allProducts();
    const found = new Set<string>();
    products.forEach(p => {
      const match = this.modelKeywords.find(kw => p.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) found.add(match);
    });
    return this.modelKeywords.filter(kw => found.has(kw));
  });

  filteredProducts = computed(() => {
    let list = [...this.allProducts()];
    const filter = this.activeFilter();
    if (filter !== 'all') {
      list = list.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
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
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`), label: 'Verified Devices' },
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`), label: 'Free Next Day Delivery' },
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`), label: '14-Day Returns' },
    { icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`), label: '12 Month Warranty' },
  ];

  ngOnInit(): void {
    this.seo.setPageTitle('iPad Deals UK');
    this.seo.setCanonicalUrl('/ipad');
    this.seo.setMetaTags({
      description: 'Shop the latest iPad deals in the UK. Compare iPad Pro, iPad Air, iPad mini and standard iPad prices. New and refurbished options available with free delivery.',
      keywords: 'iPad deals UK, iPad Pro deals, iPad Air, iPad mini, buy iPad, refurbished iPad UK',
      ogImage: 'https://www.phonedeals.co.uk/og-ipad.png',
    });
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.visibleCount.set(PAGE_SIZE);

    this.api.get<{ success: boolean; data: Product[] }>('/api/products', { category: 'ipad' }).subscribe({
      next: res => {
        this.allProducts.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load iPads.');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(f: string) {
    this.activeFilter.set(f);
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
