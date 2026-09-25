import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-surface py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="border-b border-gray-200 pb-8 mb-8">
          <nav class="flex items-center text-xs text-gray-500 mb-3 space-x-2">
            <a routerLink="/" class="hover:text-accent transition-colors">Home</a>
            <span>/</span>
            <span class="text-gray-900 font-medium">Cookie Policy</span>
          </nav>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Cookie Policy</h1>
          <p class="mt-2 text-sm text-gray-600">
            Last updated: February 2025 &bull; In compliance with UK GDPR and PECR
          </p>
        </div>

        <!-- Content -->
        <div class="space-y-10 text-gray-700 leading-relaxed">
          
          <!-- Introduction -->
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p class="mb-3">
              This Cookie Policy explains how <strong>Mobello.uk</strong> (operated by PhoneDeals UK) uses cookies, local browser storage, and privacy-preserving analytics technologies when you visit our website.
            </p>
            <p>
              We believe in minimal, transparent data practices. We only store essential technical state required to make the site work for you (such as your shopping cart), and our traffic analytics are completely <strong>cookie-less</strong> and privacy-first.
            </p>
          </section>

          <!-- What are cookies -->
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3">2. What are Cookies and Local Storage?</h2>
            <p class="mb-3">
              Cookies are small text files placed on your device by websites that you visit. Web storage (such as HTML5 <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800">localStorage</code>) provides a similar capability, enabling web applications to remember information on your device across pages or visits.
            </p>
            <p>
              Under the UK Privacy and Electronic Communications Regulations (PECR) and UK GDPR, cookies and storage technologies that are <em>strictly necessary</em> to provide a service explicitly requested by the user do not require prior consent, though transparency about their use is required.
            </p>
          </section>

          <!-- Essential cookies / storage table -->
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3">3. Essential Functional Storage We Use</h2>
            <p class="mb-4">
              We do not use marketing, advertising, or cross-site tracking cookies. We only use strictly necessary technical storage to provide core site functionality:
            </p>

            <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead class="bg-gray-50 text-gray-900 font-semibold">
                  <tr>
                    <th scope="col" class="px-4 py-3.5 sm:px-6">Key / Name</th>
                    <th scope="col" class="px-4 py-3.5 sm:px-6">Type</th>
                    <th scope="col" class="px-4 py-3.5 sm:px-6">Purpose</th>
                    <th scope="col" class="px-4 py-3.5 sm:px-6">Duration</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 text-gray-600">
                  <tr class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 sm:px-6 font-mono text-xs font-semibold text-primary">pdk_cart</td>
                    <td class="px-4 py-3 sm:px-6">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">localStorage</span>
                    </td>
                    <td class="px-4 py-3 sm:px-6">Stores items in your shopping basket so your selections remain saved as you browse and proceed to checkout.</td>
                    <td class="px-4 py-3 sm:px-6 text-xs">Persistent (until basket cleared or order completed)</td>
                  </tr>
                  <tr class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 sm:px-6 font-mono text-xs font-semibold text-primary">admin_token</td>
                    <td class="px-4 py-3 sm:px-6">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">localStorage</span>
                    </td>
                    <td class="px-4 py-3 sm:px-6">Encrypted authentication token (JWT) for authorized administrator login and secure dashboard access.</td>
                    <td class="px-4 py-3 sm:px-6 text-xs">Session / 7 days</td>
                  </tr>
                  <tr class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 sm:px-6 font-mono text-xs font-semibold text-primary">admin_email</td>
                    <td class="px-4 py-3 sm:px-6">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">localStorage</span>
                    </td>
                    <td class="px-4 py-3 sm:px-6">Stores the authenticated administrator email to display active profile in the admin portal.</td>
                    <td class="px-4 py-3 sm:px-6 text-xs">Session / 7 days</td>
                  </tr>
                  <tr class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 sm:px-6 font-mono text-xs font-semibold text-primary">mobello_cookie_notice_dismissed</td>
                    <td class="px-4 py-3 sm:px-6">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">localStorage</span>
                    </td>
                    <td class="px-4 py-3 sm:px-6">Remembers that you have dismissed the informational cookie notice so it does not reappear on every page.</td>
                    <td class="px-4 py-3 sm:px-6 text-xs">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p class="mt-3 text-xs text-gray-500">
              * The legal basis for this technical storage is UK PECR Regulation 6(4)(a) and GDPR Article 6(1)(b)/(f) (strictly necessary to facilitate the service requested by the user).
            </p>
          </section>

          <!-- Privacy-Friendly Traffic Analytics (Cloudflare Web Analytics) -->
          <section class="bg-white rounded-2xl border border-blue-100 p-6 sm:p-8 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">4. Privacy-First Website Analytics (Cloudflare)</h2>
                <p class="text-xs text-accent font-semibold tracking-wide uppercase">Cookie-less &bull; No Personal Data Collected</p>
              </div>
            </div>

            <p class="mb-4">
              To measure aggregate visitor trends, page popularity, referral sources, and Core Web Vitals (such as site loading speed and responsiveness), Mobello.uk uses <strong>Cloudflare Web Analytics</strong>.
            </p>

            <ul class="space-y-2 mb-4 text-sm text-gray-600 list-disc list-inside">
              <li><strong>Zero Cookies:</strong> Cloudflare Web Analytics does not set any cookies on your device and does not read any existing cookies.</li>
              <li><strong>Zero Local Storage Tracking:</strong> It does not store tracking identifiers or session tokens in localStorage or sessionStorage.</li>
              <li><strong>Zero Personal Data:</strong> IP addresses are discarded at the edge and never stored or associated with analytics data. No personal data or user profiles are created.</li>
              <li><strong>No Cross-Site Tracking:</strong> Your activity is never tracked across other websites or shared with advertising networks.</li>
              <li><strong>PECR & GDPR Compliant Without Consent:</strong> Because no cookies are used and no personal data is processed, Cloudflare Web Analytics does not require cookie consent under UK PECR / GDPR.</li>
            </ul>

            <p class="text-sm">
              For further technical and privacy details, please consult Cloudflare's official resources:
            </p>
            <div class="mt-3 flex flex-wrap gap-3">
              <a
                href="https://developers.cloudflare.com/analytics/web-analytics/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-xs font-medium text-accent hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                Cloudflare Web Analytics Documentation
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-xs font-medium text-accent hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                Cloudflare Privacy Policy
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
          </section>

          <!-- Managing cookies in browsers -->
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3">5. Managing Cookies & Local Storage in Your Browser</h2>
            <p class="mb-3">
              You can configure your browser to block or delete cookies and web storage at any time. Please note that disabling local storage may prevent you from saving items in your shopping cart or completing an order.
            </p>
            <p class="text-sm">
              Instructions for managing storage in common browsers:
            </p>
            <ul class="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Google Chrome</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Apple Safari</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <!-- Contact section -->
          <section class="border-t border-gray-200 pt-8">
            <h2 class="text-xl font-bold text-gray-900 mb-3">6. Questions & Contact</h2>
            <p class="mb-4">
              If you have any questions about our use of cookies or privacy practices, please contact us via our contact page:
            </p>
            <a
              routerLink="/contact-us"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              Contact Us
            </a>
          </section>

        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookiePolicyComponent {}
