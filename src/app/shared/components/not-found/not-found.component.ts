import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p class="text-gray-600 max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. The link might be broken, or the page may have been removed.
      </p>
      <a routerLink="/" class="px-6 py-3 bg-accent text-white font-medium rounded-full hover:bg-blue-600 transition-colors shadow-md">
        Go Home
      </a>
    </div>
  `
})
export class NotFoundComponent {}
