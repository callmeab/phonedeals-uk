import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoMetaTags {
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private readonly siteName = 'Mobello.uk';
  private readonly siteUrl = 'https://www.Mobello.uk.co.uk';

  /** Sets browser/tab title as "{title} | Mobello.uk" */
  setPageTitle(title: string): void {
    this.titleService.setTitle(`${title} | ${this.siteName}`);
    this.meta.updateTag({ property: 'og:title', content: `${title} | ${this.siteName}` });
  }

  /** Sets all standard + Open Graph meta tags */
  setMetaTags(tags: SeoMetaTags): void {
    if (tags.description) {
      this.meta.updateTag({ name: 'description', content: tags.description });
      this.meta.updateTag({ property: 'og:description', content: tags.ogDescription ?? tags.description });
    }
    if (tags.keywords) {
      this.meta.updateTag({ name: 'keywords', content: tags.keywords });
    }
    if (tags.ogTitle) {
      this.meta.updateTag({ property: 'og:title', content: tags.ogTitle });
    }
    if (tags.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: tags.ogImage });
    }

    // Always set stable tags
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:type', content: tags.ogType ?? 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:site', content: '@Mobello.uk' });
  }

  /** Adds or updates the <link rel="canonical"> tag */
  setCanonicalUrl(path: string): void {
    // Normalise â€” strip trailing slash, ensure leading slash
    const cleanPath = '/' + path.replace(/^\/|\/$/g, '');
    const href = `${this.siteUrl}${cleanPath === '/' ? '' : cleanPath}`;

    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);

    // Also set as OG url
    this.meta.updateTag({ property: 'og:url', content: href });
  }

  /**
   * Injects (or replaces) a <script type="application/ld+json"> block in <head>.
   * Safe to call multiple times on the same page â€” previous script is removed first.
   */
  setStructuredData(schema: object): void {
    // Remove any existing JSON-LD block we manage
    const existing = this.document.querySelector('script[data-seo="mobello-ld"]');
    if (existing) existing.remove();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'mobello-ld');
    script.text = JSON.stringify(schema, null, 0);
    this.document.head.appendChild(script);
  }

  /** Removes the managed JSON-LD script â€” call in ngOnDestroy on dynamic pages */
  removeStructuredData(): void {
    const existing = this.document.querySelector('script[data-seo="mobello-ld"]');
    if (existing) existing.remove();
  }
}
