import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit, PLATFORM_ID, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SeoService } from '../../core/services/seo.service';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card/product-card-skeleton.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  @ViewChild('iphoneSlider') iphoneSliderRef?: ElementRef<HTMLDivElement>;
  @ViewChild('samsungSlider') samsungSliderRef?: ElementRef<HTMLDivElement>;

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

  getNetworkLogo(network: string): string {
    const net = network.toLowerCase().replace(/\s+/g, '-');
    if (net === 'ee') return '/EE-sim-logo.png';
    if (net === 'o2') return '/O2-sim-logo.jpg';
    if (net === 'vodafone') return '/Vodafone-sim-logo.png';
    if (net === 'three') return '/three-sim-logo.jpg';
    if (net === 'sky-mobile') return '/sky-mobile-sim-logo.jpg';
    if (net === 'id-mobile') return '/id-mobile-sim-logo.png';
    if (net === 'bt-mobile') return '/BT-mobile-sim-logo.png';
    return '';
  }

  readonly howItWorks = [
    {
      number: '1',
      title: 'Choose your device',
      description: 'Select from the latest iPhone or Samsung Galaxy models available right now.',
      icon: inject(DomSanitizer).bypassSecurityTrustHtml('<svg fill="none" viewBox="0 0 24 24" class="w-full h-full text-blue-600"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" /><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke-opacity="0.3" d="M12 2v0a2 2 0 012 2v0a2 2 0 01-2 2v0a2 2 0 01-2-2v0a2 2 0 012-2z" fill="currentColor"/></svg>')
    },
    {
      number: '2',
      title: 'Compare the deals',
      description: 'Our engine finds prices across all major UK networks instantly. View data, upfront costs and monthly fees.',
      icon: inject(DomSanitizer).bypassSecurityTrustHtml('<svg fill="none" viewBox="0 0 24 24" class="w-full h-full text-indigo-500"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke-opacity="0.3" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" fill="currentColor"/></svg>')
    },
    {
      number: '3',
      title: 'Get the best price',
      description: 'Click straight through to the provider and secure your chosen contract at the best possible price.',
      icon: inject(DomSanitizer).bypassSecurityTrustHtml('<svg fill="none" viewBox="0 0 24 24" class="w-full h-full text-green-500"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.746 3.746 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>')
    }
  ];

  readonly features = [
    {
      title: 'Compare in seconds',
      description: 'See every available contract deal for any iPhone or Samsung side-by-side. Monthly cost, data, upfront â€” all in one place.',
      icon: inject(DomSanitizer).bypassSecurityTrustHtml('<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'),
      iconBg: 'bg-blue-100',
      iconColor: 'text-accent',
      gradientStyle: 'from-blue-50 to-transparent'
    },
    {
      title: 'No hidden fees',
      description: "Every price shown is what you actually pay. We don't add commissions or mark-up prices. What you see is what the network charges.",
      icon: inject(DomSanitizer).bypassSecurityTrustHtml('<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>'),
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      gradientStyle: 'from-green-50 to-transparent'
    },
    {
      title: 'UK networks only',
      description: "We only list deals from networks operating in the UK. EE, O2, Vodafone, Three, Sky Mobile, iD Mobile, and BT Mobile â€” that's it.",
      icon: inject(DomSanitizer).bypassSecurityTrustHtml('<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>'),
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      gradientStyle: 'from-purple-50 to-transparent'
    },
  ];

  readonly faqItems = [
    {
      question: 'Is this service completely free to use?',
      answer: 'Yes, absolutely. We do not charge users to compare deals. We are fully independent and our goal is to help you find the best contract price available.'
    },
    {
      question: 'How often do you update the contract deals?',
      answer: 'Our systems pull the latest pricing data daily directly from trusted UK networks and retailers, ensuring you have access to accurate, up-to-date prices.'
    },
    {
      question: 'Do you add a commission onto the phone price?',
      answer: 'No! The price you see on Mobello.uk is the exact price you pay with the network. We do not inflate the monthly costs or upfront fees.'
    },
    {
      question: 'Can I keep my current phone number?',
      answer: 'Yes. When you click through to buy a deal and sign the contract, you can request a PAC code from your current network provider to port your existing number across seamlessly.'
    }
  ];

  ngOnInit(): void {
    this.seo.setPageTitle('Compare iPhone & Samsung Contract Deals');
    this.seo.setCanonicalUrl('/');
    this.seo.setMetaTags({
      description: 'Find the best iPhone and Samsung Galaxy contract deals from every major UK network. Compare EE, O2, Vodafone, Three, Sky Mobile and more. Updated daily, free to use.',
      keywords: 'iPhone deals, Samsung deals, phone contracts, UK network deals, cheap phone deals, EE deals, O2 deals, Vodafone deals',
      ogImage: 'https://www.Mobello.uk.co.uk/og-home.png',
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Mobello.uk',
      url: 'https://www.Mobello.uk.co.uk',
      description: 'Independent UK comparison site for iPhone and Samsung contract deals.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.Mobello.uk.co.uk/iphone',
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

  scrollSlider(sliderKey: 'iphone' | 'samsung', direction: number): void {
    const slider = sliderKey === 'iphone' ? this.iphoneSliderRef?.nativeElement : this.samsungSliderRef?.nativeElement;
    if (!slider) return;
    const card = slider.querySelector('.snap-start') as HTMLElement;
    const scrollAmount = card ? (card.offsetWidth + 24) * 1.5 : 550;
    slider.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  }
}
