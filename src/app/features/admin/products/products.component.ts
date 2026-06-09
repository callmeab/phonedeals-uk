import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  template: `
    <div class="bg-white shadow rounded-lg p-6 border border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900">Products</h1>
      <p class="mt-2 text-gray-600">Product management data table will be implemented here.</p>
    </div>
  `
})
export class AdminProductsComponent {}
