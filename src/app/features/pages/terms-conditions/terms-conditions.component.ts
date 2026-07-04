import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
      <div class="prose max-w-none text-gray-700">
        <p class="mb-4">These Terms and Conditions govern your use of the Mobello.uk website and services.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p class="mb-4">By accessing or using our website, you agree to be bound by these Terms and Conditions.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">2. Use of Service</h2>
        <p class="mb-4">You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of others.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">3. Disclaimer</h2>
        <p class="mb-4">Mobello.uk is an independent comparison site. Prices and deals shown are indicative and subject to change without notice.</p>
        <p class="mt-8 text-sm text-gray-500">Last updated: {{ currentDate | date }}</p>
      </div>
    </div>
  `
})
export class TermsConditionsComponent {
  currentDate = new Date();
}
