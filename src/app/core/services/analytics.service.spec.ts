import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    // Clean up any existing beacon scripts
    document.querySelectorAll('script[src*="cloudflareinsights.com/beacon.min.js"]').forEach(s => s.remove());

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AnalyticsService);
  });

  afterEach(() => {
    document.querySelectorAll('script[src*="cloudflareinsights.com/beacon.min.js"]').forEach(s => s.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not inject beacon script when token is empty or not in production', () => {
    environment.production = false;
    environment.cloudflareWebAnalyticsToken = '';

    service.init();

    const script = document.querySelector('script[src*="cloudflareinsights.com/beacon.min.js"]');
    expect(script).toBeNull();
  });

  it('should inject beacon script when in production with valid token', () => {
    environment.production = true;
    environment.cloudflareWebAnalyticsToken = 'test-token-12345';

    service.init();

    const script = document.querySelector('script[src*="cloudflareinsights.com/beacon.min.js"]') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.defer).toBeTrue();
    expect(script.getAttribute('data-cf-beacon')).toBe(JSON.stringify({
      token: 'test-token-12345',
      spa: true
    }));

    // Reset back
    environment.production = false;
    environment.cloudflareWebAnalyticsToken = '';
  });

  it('should not inject duplicate scripts if called multiple times', () => {
    environment.production = true;
    environment.cloudflareWebAnalyticsToken = 'test-token-12345';

    service.init();
    service.init();

    const scripts = document.querySelectorAll('script[src*="cloudflareinsights.com/beacon.min.js"]');
    expect(scripts.length).toBe(1);

    // Reset back
    environment.production = false;
    environment.cloudflareWebAnalyticsToken = '';
  });
});
