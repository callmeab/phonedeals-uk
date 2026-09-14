import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PreorderService } from '../../core/services/preorder.service';
import { SeoService } from '../../core/services/seo.service';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-iphone18-preorder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './iphone18-preorder.component.html',
  styleUrl: './iphone18-preorder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Iphone18PreorderComponent implements OnInit, OnDestroy {
  public preorder = inject(PreorderService);
  private seo = inject(SeoService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Image fallback tracking
  imageLoadError = signal<boolean>(false);
  heroBannerError = signal<boolean>(false);

  // Countdown timer
  countdown = signal<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private timerInterval: any = null;

  // Release Date: September 18, 2026, 08:00:00 UK BST
  private readonly targetReleaseDate = new Date('2026-09-18T08:00:00+01:00').getTime();

  // Specs highlight computed
  currentSpecs = computed(() => {
    const isMax = this.preorder.selectedModel() === 'iPhone 18 Pro Max';
    return {
      screen: isMax ? '6.9" Super Retina XDR' : '6.3" Super Retina XDR',
      chip: 'Apple A20 Pro (2nm) with 6-core GPU',
      camera: isMax ? '48MP Quad-Pixel + 10x Periscope Telephoto' : '48MP Quad-Pixel + 5x Telephoto',
      chassis: 'Grade 5 Aerospace Micro-Titanium',
      battery: isMax ? 'Up to 33 hrs video playback' : 'Up to 29 hrs video playback'
    };
  });

  ngOnInit(): void {
    this.initSeo();
    this.initCountdown();

    // Fetch live variants from edge D1 API
    this.preorder.loadPreorderData().subscribe({
      error: () => {
        // Service handles local fallback baseline automatically
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // ── SEO ───────────────────────────────────────────────────────────────────

  private initSeo(): void {
    this.seo.setPageTitle('iPhone 18 Pro & Pro Max Pre-Order UK | Reserve Now');
    this.seo.setMetaTags({
      description: 'Reserve the Apple iPhone 18 Pro & iPhone 18 Pro Max ahead of UK release. Lock in priority queue allocation with a £99 100% refundable deposit.',
      keywords: 'iPhone 18 Pro pre order, iPhone 18 Pro Max UK, iPhone 18 reserve, Apple A20 Pro, PhoneDeals UK, Mobello',
      ogTitle: 'Reserve the iPhone 18 Pro & Pro Max in the UK | Mobello.UK',
      ogDescription: 'Pre-order the iPhone 18 Pro Series with Apple A20 Pro chip. Choose Glacier Blue, Burgundy, Silver, or Black. 100% refundable deposit.',
      ogImage: '/iphone-18/iphone-18-pro.webp',
      ogType: 'product'
    });
    this.seo.setCanonicalUrl('/iphone-18-pro-preorder');

    // Schema.org Structured Data
    this.seo.setStructuredData({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'Apple iPhone 18 Pro Series',
      image: [
        'https://mobello.uk/iphone-18/iphone-18-pro.webp',
        'https://mobello.uk/iphone-18/iphone-18-pro-max-Glacier.webp'
      ],
      description: 'Pre-booking for Apple iPhone 18 Pro and iPhone 18 Pro Max featuring Apple A20 Pro (2nm) chip.',
      brand: {
        '@type': 'Brand',
        name: 'Apple'
      },
      offers: {
        '@type': 'Offer',
        url: 'https://mobello.uk/iphone-18-pro-preorder',
        priceCurrency: 'GBP',
        price: '1199.00',
        availability: 'https://schema.org/PreOrder',
        priceValidUntil: '2026-09-18'
      }
    });
  }

  // ── Countdown ────────────────────────────────────────────────────────────

  private initCountdown(): void {
    this.updateCountdown();
    if (isPlatformBrowser(this.platformId)) {
      this.timerInterval = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  private updateCountdown(): void {
    const now = Date.now();
    const diff = Math.max(0, this.targetReleaseDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    this.countdown.set({ days, hours, minutes, seconds });
  }

  // ── Variant selection helpers ──────────────────────────────────────────────

  selectModel(model: 'iPhone 18 Pro' | 'iPhone 18 Pro Max'): void {
    this.preorder.selectedModel.set(model);
    this.imageLoadError.set(false);
  }

  selectColor(color: 'Black' | 'Silver' | 'Glacier' | 'Burgundy'): void {
    this.preorder.selectedColor.set(color);
    this.imageLoadError.set(false);
  }

  selectAngle(angle: 1 | 2 | 3): void {
    this.preorder.selectedAngle.set(angle);
    this.imageLoadError.set(false);
  }

  selectStorage(storage: '256GB' | '512GB' | '1TB' | '2TB'): void {
    this.preorder.selectedStorage.set(storage);
  }

  selectPurchaseType(type: 'outright' | 'contract'): void {
    this.preorder.purchaseType.set(type);
    if (type === 'outright') {
      this.preorder.selectedNetwork.set('SIM-Free');
    } else if (this.preorder.selectedNetwork() === 'SIM-Free') {
      this.preorder.selectedNetwork.set('EE');
    }
  }

  selectNetwork(net: string): void {
    this.preorder.selectedNetwork.set(net);
  }

  // Navigate to dedicated pre-order checkout page
  proceedToCheckout(): void {
    this.router.navigate(['/iphone-18-pro-preorder/checkout']);
  }

  // Image error handling
  onImageError(): void {
    this.imageLoadError.set(true);
  }

  onHeroError(): void {
    this.heroBannerError.set(true);
  }
}
