import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { CookieNoticeComponent } from './shared/components/cookie-notice/cookie-notice.component';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CookieNoticeComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-cookie-notice></app-cookie-notice>
  `
})
export class AppComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.analyticsService.init();
  }
}

