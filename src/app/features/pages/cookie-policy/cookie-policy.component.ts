import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
      <div class="prose max-w-none text-gray-700">
        <p class="mb-4">This Cookie Policy explains how Mobello.uk uses cookies and similar technologies to recognize you when you visit our website.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">1. What are Cookies?</h2>
        <p class="mb-4">Cookies are small data files that are placed on your computer or mobile device when you visit a website.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">2. How We Use Cookies</h2>
        <p class="mb-4">We use cookies to understand how you use our site, personalize content, and improve your user experience.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">3. Managing Cookies</h2>
        <p class="mb-4">You have the right to decide whether to accept or reject cookies. You can set your web browser controls to accept or refuse cookies.</p>
        <p class="mt-8 text-sm text-gray-500">Last updated: {{ currentDate | date }}</p>
      </div>
    </div>
  `
})
export class CookiePolicyComponent {
  currentDate = new Date();
}
