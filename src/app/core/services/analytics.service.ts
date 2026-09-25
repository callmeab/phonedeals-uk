import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Initializes Cloudflare Web Analytics beacon if running in browser
   * and a production token is configured. Local development is gated.
   */
  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!environment.production || !environment.cloudflareWebAnalyticsToken) {
      return;
    }

    // Guard against duplicate script injection
    if (document.querySelector('script[src*="cloudflareinsights.com/beacon.min.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute(
      'data-cf-beacon',
      JSON.stringify({
        token: environment.cloudflareWebAnalyticsToken,
        spa: true
      })
    );

    document.body.appendChild(script);
  }
}
