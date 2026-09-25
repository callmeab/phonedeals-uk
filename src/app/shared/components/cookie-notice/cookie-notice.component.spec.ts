import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CookieNoticeComponent } from './cookie-notice.component';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('CookieNoticeComponent', () => {
  let component: CookieNoticeComponent;
  let fixture: ComponentFixture<CookieNoticeComponent>;
  const STORAGE_KEY = 'mobello_cookie_notice_dismissed';

  beforeEach(async () => {
    localStorage.removeItem(STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [CookieNoticeComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CookieNoticeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show notice on initial visit when not dismissed', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.isVisible()).toBeFalse();

    tick(400);
    expect(component.isVisible()).toBeTrue();
  }));

  it('should not show notice if already dismissed in localStorage', fakeAsync(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    fixture.detectChanges();

    tick(400);
    expect(component.isVisible()).toBeFalse();
  }));

  it('should dismiss notice and save timestamp in localStorage when dismiss() is called', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    expect(component.isVisible()).toBeTrue();

    component.dismiss();
    expect(component.isVisible()).toBeFalse();
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
  }));
});
