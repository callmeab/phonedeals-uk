import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-primary text-gray-300 py-12 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Main Footer Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">
          
          <!-- Column 1: Brand -->
          <div class="space-y-4">
            <a routerLink="/" class="text-2xl font-bold tracking-tight text-white inline-block">
              PhoneDeals<span class="text-accent">UK</span>
            </a>
            <p class="text-sm font-medium text-gray-400">
              The best iPhone and Samsung deals in the UK
            </p>
            <p class="text-xs text-gray-500 max-w-sm mt-4 leading-relaxed">
              PhoneDeals UK is an independent comparison site. Prices shown are indicative and subject to change.
            </p>
          </div>

          <!-- Column 2: Quick Links -->
          <div>
            <h3 class="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Quick Links</h3>
            <ul class="space-y-3">
              <li>
                <a routerLink="/" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Home</a>
              </li>
              <li>
                <a routerLink="/iphone" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">iPhone Deals</a>
              </li>
              <li>
                <a routerLink="/samsung" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Samsung Deals</a>
              </li>
              <li>
                <a routerLink="/" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Compare Plans</a>
              </li>
            </ul>
          </div>

          <!-- Column 3: Legal & Info -->
          <div>
            <h3 class="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Legal & Info</h3>
            <ul class="space-y-3">
              <li>
                <a href="#" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Privacy Policy</a>
              </li>
              <li>
                <a href="#" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Cookie Policy</a>
              </li>
              <li>
                <a href="#" class="text-sm hover:text-white hover:text-accent transition-colors duration-200">Contact Us</a>
              </li>
            </ul>
          </div>
          
        </div>

        <!-- Bottom Bar -->
        <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p class="text-xs text-gray-500">
            &copy; {{ currentYear }} PhoneDeals UK. All rights reserved.
          </p>
          
          <!-- Network Text Badges -->
          <div class="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <span class="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10 select-none">EE</span>
            <span class="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10 select-none">O2</span>
            <span class="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10 select-none">Vodafone</span>
            <span class="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10 select-none">Three</span>
            <span class="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10 select-none">Sky Mobile</span>
          </div>
        </div>
        
      </div>
    </footer>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
