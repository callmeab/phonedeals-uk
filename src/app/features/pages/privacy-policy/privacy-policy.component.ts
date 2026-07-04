import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div class="prose max-w-none text-gray-700">
        <p class="mb-4">Welcome to Mobello.uk. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p class="mb-4">We may collect personal information such as your name, email address, and browsing data when you use our website.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p class="mb-4">We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.</p>
        <h2 class="text-xl font-semibold mt-6 mb-3">3. Data Security</h2>
        <p class="mb-4">We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p>
        <p class="mt-8 text-sm text-gray-500">Last updated: {{ currentDate | date }}</p>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent {
  currentDate = new Date();
}
