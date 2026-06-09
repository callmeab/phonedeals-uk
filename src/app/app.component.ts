import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    @if (isAdminRoute()) {
      <router-outlet></router-outlet>
    } @else {
      <app-header></app-header>
      <main class="min-h-screen pt-20">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    }
    <app-toast></app-toast>
  `
})
export class AppComponent {
  private router = inject(Router);

  // Reactively track if the current route is an admin route
  isAdminRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects.startsWith('/xk92-admin'))
    ),
    { initialValue: this.router.url.startsWith('/xk92-admin') }
  );
}
