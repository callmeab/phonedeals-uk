import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService, Title, Meta]
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    document = TestBed.inject(DOCUMENT);
  });

  it('should set page title with suffix', () => {
    spyOn(titleService, 'setTitle');
    service.setPageTitle('Test Page');
    expect(titleService.setTitle).toHaveBeenCalledWith('Test Page | Mobello.uk');
  });

  it('should update meta tags', () => {
    spyOn(metaService, 'updateTag');
    service.setMetaTags({
      description: 'Test Description',
      keywords: 'test, keywords',
      ogImage: 'http://test.com/img.jpg',
      ogType: 'article'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Test Description' });
    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'keywords', content: 'test, keywords' });
    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:image', content: 'http://test.com/img.jpg' });
    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'article' });
  });

  it('should set canonical URL', () => {
    service.setCanonicalUrl('/test-path/');
    
    // Check canonical link
    const link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    expect(link).toBeTruthy();
    expect(link?.href).toBe('https://www.Mobello.uk.co.uk/test-path');

    // Check og:url
    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(ogUrl).toBeTruthy();
    expect(ogUrl?.getAttribute('content')).toBe('https://www.Mobello.uk.co.uk/test-path');
  });
});
