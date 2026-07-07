import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Product, ProductVariant } from '../../core/models/product.model';
import { Deal } from '../../core/models/deal.model';
import { CartItem } from '../../core/models/cart.model';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { DealCardComponent } from '../../shared/components/deal-card/deal-card.component';
import { DealCardSkeletonComponent } from '../../shared/components/deal-card/deal-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { resolveProductImageUrl, PLACEHOLDER_PHONE_IMAGE } from '../../core/utils/image-url';

type DealSort = 'monthly' | 'data' | 'upfront';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DealCardComponent, DealCardSkeletonComponent, EmptyStateComponent, BreadcrumbComponent, LoadingSpinnerComponent],
  template: `
    @if (isLoading()) {
      <!-- Full-page loading -->
      <div class="min-h-screen bg-surface flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <app-loading-spinner size="lg"></app-loading-spinner>
          <p class="text-sm text-gray-400 font-medium animate-pulse">Loading product details…</p>
        </div>
      </div>

    } @else if (!product()) {
      <!-- 404 state — redirect handled in ts, this is a brief flash guard -->
      <div class="min-h-screen bg-surface flex items-center justify-center">
        <p class="text-gray-400">Redirecting…</p>
      </div>

    } @else {
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <app-breadcrumb [items]="breadcrumbItems()" theme="light"></app-breadcrumb>
        </div>
      </div>

      <!-- ======================================================
           MAIN TWO-COLUMN LAYOUT
           ====================================================== -->
      <div class="bg-surface min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">

            <!-- =============================================
                 LEFT COLUMN — Images & Variants
                 ============================================= -->
            <div class="lg:w-[42%] xl:w-[40%] flex-shrink-0">
              <div class="lg:sticky lg:top-20 space-y-5">

                <!-- Main image -->
                <div class="relative bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden aspect-[4/3] flex items-center justify-center p-6 group">
                  @if (product()!.is_featured) {
                    <div class="absolute top-0 right-0 z-10">
                      <div class="relative overflow-hidden w-24 h-24">
                        <div class="absolute top-[18px] right-[-22px] bg-accent text-white text-[10px] font-bold uppercase tracking-wider py-1 w-28 text-center rotate-45 shadow-md">
                          Featured
                        </div>
                      </div>
                    </div>
                  }
                  @if (selectedImage()) {
                    <img
                      [src]="selectedImage()!"
                      [alt]="product()!.name"
                      (error)="onImageError($event)"
                      class="max-w-full max-h-full object-contain transition-all duration-500 ease-out group-hover:scale-[1.03]"
                    >
                  } @else {
                    <div class="flex flex-col items-center justify-center gap-3 text-gray-200">
                      <svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.75" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      <p class="text-sm text-gray-400 font-medium">No image available</p>
                    </div>
                  }
                </div>

                <!-- Thumbnail strip -->
                @if (galleryImages().length > 0) {
                  <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    <!-- Primary image thumbnail -->
                    @if (primaryImageUrl()) {
                      <button
                        (click)="selectedImage.set(primaryImageUrl()!)"
                        class="flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white transition-all duration-150 focus:outline-none"
                        [ngClass]="selectedImage() === primaryImageUrl()
                          ? 'border-accent shadow-md shadow-blue-100'
                          : 'border-gray-200 hover:border-gray-400'"
                      >
                        <img [src]="primaryImageUrl()!" [alt]="product()!.name" (error)="onImageError($event)" class="w-full h-full object-contain p-1">
                      </button>
                    }
                    @for (img of galleryImages(); track img) {
                      <button
                        (click)="selectedImage.set(img)"
                        class="flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white transition-all duration-150 focus:outline-none"
                        [ngClass]="selectedImage() === img
                          ? 'border-accent shadow-md shadow-blue-100'
                          : 'border-gray-200 hover:border-gray-400'"
                      >
                        <img [src]="img" [alt]="product()!.name" (error)="onImageError($event)" class="w-full h-full object-contain p-1" loading="lazy">
                      </button>
                    }
                  </div>
                }

                <!-- Colour swatches -->
                @if (colours().length > 0) {
                  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Colours</p>
                    <div class="flex flex-wrap gap-3">
                      @for (colour of colours(); track colour) {
                        <button
                          (click)="selectedColour.set(colour)"
                          class="group flex items-center gap-2 focus:outline-none"
                          [title]="colour"
                        >
                          <span
                            class="w-6 h-6 rounded-full border-2 transition-all duration-150 shadow-sm"
                            [style.background-color]="colourToHex(colour)"
                            [ngClass]="selectedColour() === colour
                              ? 'border-accent scale-125'
                              : 'border-transparent group-hover:border-gray-400 group-hover:scale-110'"
                          ></span>
                          <span class="text-xs text-gray-500 group-hover:text-gray-700 transition-colors" [ngClass]="selectedColour() === colour ? 'text-accent font-semibold' : ''">
                            {{ colour }}
                          </span>
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- Storage pills -->
                @if (storageOptions().length > 0) {
                  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Storage</p>
                    <div class="flex flex-wrap gap-2">
                      @for (opt of storageOptions(); track opt) {
                        <button
                          (click)="selectedStorage.set(opt)"
                          class="px-3.5 py-1.5 rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                          [ngClass]="selectedStorage() === opt
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'"
                        >
                          {{ opt }}
                        </button>
                      }
                    </div>
                  </div>
                }

              </div><!-- /sticky -->
            </div><!-- /left col -->

            <!-- =============================================
                 RIGHT COLUMN — Info & Deals
                 ============================================= -->
            <div class="flex-1 min-w-0 space-y-6">

              <!-- Product header -->
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <!-- Category badge -->
                <div class="flex items-center gap-2 mb-3">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                    [ngClass]="isSamsung() ? 'bg-blue-700 text-white' : 'bg-gray-800 text-white'">
                    {{ product()!.category_name || 'Phone' }}
                  </span>
                  @if (product()!.is_featured) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-accent">
                      ★ Featured
                    </span>
                  }
                </div>

                <!-- Product name -->
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                  {{ product()!.name }}
                </h1>

                <!-- Description -->
                @if (product()!.description) {
                  <p class="mt-3 text-sm text-gray-500 leading-relaxed">{{ product()!.description }}</p>
                }

                <!-- "From" price -->
                <div class="mt-5 pt-5 border-t border-gray-100">
                  @if (dealsLoading()) {
                    <div class="h-10 w-40 bg-gray-100 rounded-lg animate-pulse"></div>
                  } @else if (lowestPrice() !== null) {
                    <div class="flex items-baseline gap-2">
                      <span class="text-sm text-gray-500 font-medium">From</span>
                      <span class="text-4xl font-black text-accent">£{{ lowestPrice()!.toFixed(2) }}</span>
                      <span class="text-base text-gray-400 font-medium">/month</span>
                    </div>
                    <p class="mt-1 text-xs text-gray-400">
                      Cheapest available contract · prices may vary by storage &amp; colour
                    </p>
                  } @else {
                    <p class="text-sm text-gray-400 italic">No contract deals added yet for this product.</p>
                  }
                </div>
              </div>

              <!-- ============================================
                   DEALS SECTION
                   ============================================ -->
              <div>
                <!-- Deals header + sort tabs -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 class="text-lg font-bold text-gray-900">Available Deals</h2>
                    @if (!dealsLoading() && sortedDeals().length > 0) {
                      <p class="text-xs text-gray-400 mt-0.5">{{ sortedDeals().length }} deal{{ sortedDeals().length === 1 ? '' : 's' }} from {{ uniqueNetworks() }} network{{ uniqueNetworks() === 1 ? '' : 's' }}</p>
                    }
                  </div>

                  <!-- Sort tabs -->
                  @if (sortedDeals().length > 1) {
                    <div class="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                      @for (tab of sortTabs; track tab.key) {
                        <button
                          (click)="dealSort.set(tab.key)"
                          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                          [ngClass]="dealSort() === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'"
                        >
                          {{ tab.label }}
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- Deal list -->
                @if (dealsLoading()) {
                  <div class="space-y-4">
                    @for (i of [1,2,3]; track i) {
                      <app-deal-card-skeleton></app-deal-card-skeleton>
                    }
                  </div>

                } @else if (sortedDeals().length === 0) {
                  <app-empty-state
                    icon='<svg class="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>'
                    heading="No contract deals yet"
                    subheading="This product is listed on the site, but no network deals have been added. Add deals in the admin panel (Deals section) for this product to appear here."
                  ></app-empty-state>

                } @else {
                  <div class="space-y-4">
                    @for (deal of sortedDeals(); track deal.id; let i = $index) {
                      <app-deal-card
                        [deal]="deal"
                        [isHighlighted]="deal.id === bestValueDealId()"
                        (getDeal)="onGetDeal($event)"
                      ></app-deal-card>
                    }
                  </div>
                }

              </div><!-- /deals section -->

            </div><!-- /right col -->
          </div><!-- /two-col flex -->
        </div>
      </div>

    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);
  private toast = inject(ToastService);
  private cart = inject(CartService);

  // --- Data signals ---
  product = signal<Product | null>(null);
  deals = signal<Deal[]>([]);

  // --- UI state ---
  isLoading = signal(true);
  dealsLoading = signal(true);
  selectedImage = signal<string | null>(null);
  selectedStorage = signal<string | null>(null);
  selectedColour = signal<string | null>(null);
  dealSort = signal<DealSort>('monthly');

  // JSON-LD script element ref — now managed by SeoService

  readonly sortTabs: { key: DealSort; label: string }[] = [
    { key: 'monthly',  label: 'Monthly Cost' },
    { key: 'data',     label: 'Data' },
    { key: 'upfront',  label: 'Upfront Cost' },
  ];

  // --- Derived ---
  primaryImageUrl = computed(() =>
    resolveProductImageUrl(this.product()?.primary_image_url ?? null)
  );

  productVariants = computed<ProductVariant[]>(() => {
    const p = this.product();
    if (!p?.variants) return [];
    try { return JSON.parse(p.variants) as ProductVariant[]; } catch { return []; }
  });

  galleryImages = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];

    const selectedCol = this.selectedColour();
    const variants = this.productVariants();
    
    // 1. Try finding specific images for the selected color
    if (selectedCol && variants.length > 0) {
      const variant = variants.find(v => v.color.toLowerCase() === selectedCol.toLowerCase());
      if (variant && variant.images && variant.images.length > 0) {
        return variant.images
          .map(url => resolveProductImageUrl(url))
          .filter((url): url is string => !!url);
      }
    }

    // 2. Fallback to default gallery_images
    if (!p.gallery_images) return [];
    try {
      return (JSON.parse(p.gallery_images) as string[])
        .map(url => resolveProductImageUrl(url))
        .filter((url): url is string => !!url);
    } catch {
      return [];
    }
  });

  storageOptions = computed<string[]>(() => {
    const p = this.product();
    if (!p?.storage_options) return [];
    try { return JSON.parse(p.storage_options) as string[]; } catch { return []; }
  });

  colours = computed<string[]>(() => {
    const p = this.product();
    if (!p?.colours) return [];
    try { return JSON.parse(p.colours) as string[]; } catch { return []; }
  });

  isSamsung = computed(() =>
    this.product()?.category_name?.toLowerCase().includes('samsung') ||
    this.product()?.category_id === 2
  );

  categoryRoute = computed(() =>
    this.isSamsung() ? '/samsung' : '/iphone'
  );

  breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const p = this.product();
    if (!p) return [];
    return [
      { label: p.category_name || 'Phones', route: this.categoryRoute() },
      { label: p.name }
    ];
  });

  lowestPrice = computed<number | null>(() => {
    const d = this.deals();
    if (!d.length) return null;
    return Math.min(...d.map(deal => deal.monthly_cost));
  });

  /** Best value = lowest total cost over contract period (monthly × months + upfront) */
  bestValueDealId = computed<number | null>(() => {
    const d = this.deals();
    if (!d.length) return null;
    return d.reduce((best, deal) => {
      const totalBest = best.monthly_cost * best.contract_months + best.upfront_cost;
      const totalDeal = deal.monthly_cost * deal.contract_months + deal.upfront_cost;
      return totalDeal < totalBest ? deal : best;
    }, d[0]).id;
  });

  sortedDeals = computed<Deal[]>(() => {
    const list = [...this.deals()];
    const sort = this.dealSort();
    if (sort === 'monthly') {
      list.sort((a, b) => a.monthly_cost - b.monthly_cost);
    } else if (sort === 'data') {
      list.sort((a, b) => b.data_gb - a.data_gb); // descending: most data first
    } else if (sort === 'upfront') {
      list.sort((a, b) => a.upfront_cost - b.upfront_cost);
    }
    return list;
  });

  uniqueNetworks = computed(() =>
    new Set(this.deals().map(d => d.network)).size
  );

  constructor() {
    effect(() => {
      const col = this.selectedColour();
      if (!col) return;
      
      const images = this.galleryImages();
      // If there are variant images or gallery images for this color, pick the first one. 
      // Otherwise fallback to primary.
      if (images.length > 0) {
        this.selectedImage.set(images[0]);
      } else {
        this.selectedImage.set(this.primaryImageUrl());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.router.navigate(['/']);
      return;
    }
    this.fetchProduct(slug);
  }

  ngOnDestroy(): void {
    this.seo.removeStructuredData();
  }

  private fetchProduct(slug: string) {
    this.isLoading.set(true);

    this.api.get<{ success: boolean; data: Product }>(`/api/products/${slug}`).subscribe({
      next: res => {
        if (!res.data) {
          this.router.navigate(['/']);
          return;
        }
        const p = res.data;
        this.product.set(p);
        this.selectedImage.set(resolveProductImageUrl(p.primary_image_url));

        // Auto-select first storage + colour
        const storage = this.storageOptions();
        if (storage.length) this.selectedStorage.set(storage[0]);
        const cols = this.colours();
        if (cols.length) this.selectedColour.set(cols[0]);

        this.isLoading.set(false);
        this.updateSeo(p);
        this.fetchDeals(p.id);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  private fetchDeals(productId: number) {
    this.dealsLoading.set(true);
    this.api.get<{ success: boolean; data: Deal[] }>('/api/deals', { product_id: String(productId) }).subscribe({
      next: res => {
        this.deals.set(res.data || []);
        this.dealsLoading.set(false);
        this.buildAndInjectJsonLd();
      },
      error: () => {
        this.dealsLoading.set(false);
      }
    });
  }

  private updateSeo(p: Product) {
    const categoryName = p.category_name || 'phone';
    const lowestStr = this.lowestPrice() ? `from £${this.lowestPrice()!.toFixed(2)}/month` : 'great prices';

    this.seo.setPageTitle(`${p.name} Deals`);
    this.seo.setCanonicalUrl(`/phones/${p.slug}`);
    this.seo.setMetaTags({
      description: `Compare the best ${p.name} contract deals in the UK. ${lowestStr === 'great prices' ? 'Find' : `From ${lowestStr} with`} EE, O2, Vodafone, Three and more. Updated daily.`,
      keywords: `${p.name} deals, ${p.name} contract, cheap ${p.name}, ${categoryName} deals UK`,
      ogImage: p.primary_image_url ?? undefined,
      ogType: 'product',
    });
  }

  private buildAndInjectJsonLd() {
    const p = this.product();
    if (!p) return;

    const deals = this.deals();
    const offers = deals.map(d => ({
      '@type': 'Offer',
      price: d.monthly_cost.toFixed(2),
      priceCurrency: 'GBP',
      seller: { '@type': 'Organization', name: d.network },
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
    }));

    this.seo.setStructuredData({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: p.name,
      description: p.description || `${p.name} contract deals from UK networks.`,
      image: p.primary_image_url || undefined,
      brand: {
        '@type': 'Brand',
        name: p.category_name?.toLowerCase().includes('samsung') ? 'Samsung' : 'Apple',
      },
      offers: offers.length > 0 ? offers : undefined,
    });
  }

  onGetDeal(deal: Deal): void {
    const p = this.product();
    if (!p) return;

    const item: CartItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      dealId: deal.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      primaryImageUrl: this.primaryImageUrl() ?? '',
      network: deal.network,
      contractMonths: deal.contract_months,
      monthlyCost: deal.monthly_cost,
      upfrontCost: deal.upfront_cost,
      dataGb: deal.data_gb,
      addedAt: Date.now()
    };

    const added = this.cart.addItem(item);
    if (!added) {
      this.toast.info('This deal is already in your cart.');
    }

    this.router.navigate(['/cart']);
  }

  /** Maps colour names to approximate hex values for the swatch circles */
  colourToHex(colour: string): string {
    const map: Record<string, string> = {
      // Blacks / darks
      'black': '#1C1C1E', 'midnight': '#1C1C1E', 'space black': '#1C1C1E',
      'graphite': '#4A4A4A', 'space grey': '#6E6E73', 'space gray': '#6E6E73',
      // Whites / lights
      'white': '#F5F5F7', 'starlight': '#FAF7F0', 'silver': '#E0E0E0',
      'pearl': '#F8F4EC', 'pearl white': '#F8F4EC',
      // Blues
      'blue': '#3B82F6', 'deep purple': '#6B21A8', 'alpine blue': '#5B8DB8',
      'sierra blue': '#67A3BF', 'pacific blue': '#3D6B8C', 'sky blue': '#87CEEB',
      // Purples / pinks
      'purple': '#9333EA', 'lavender': '#C4B5FD', 'lilac': '#D8B4FE',
      'pink': '#EC4899', 'rose': '#FB7185', 'product red': '#DC2626',
      // Greens / teals
      'green': '#22C55E', 'sage': '#84A98C', 'mint': '#6EE7B7',
      'teal': '#14B8A6', 'forest green': '#166534',
      // Yellows / golds
      'yellow': '#EAB308', 'gold': '#D4AF37', 'titanium': '#8C8C8C',
      'natural titanium': '#C4BAB0', 'white titanium': '#E8E3DC',
      'black titanium': '#2C2C2E', 'desert titanium': '#C4A882',
      // Oranges
      'orange': '#F97316', 'coral': '#FF6B6B',
    };

    const key = colour.toLowerCase().trim();
    return map[key] ?? '#94A3B8'; // slate-400 fallback
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith(PLACEHOLDER_PHONE_IMAGE)) return;
    img.src = PLACEHOLDER_PHONE_IMAGE;
  }
}
