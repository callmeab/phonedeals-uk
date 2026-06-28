import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Settings Configuration</h3>
        <p class="mt-1 text-sm text-gray-500">Manage your store's global settings.</p>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
          <p class="text-gray-500">Settings coming soon.</p>
        </div>
      </div>
    </div>
  `
})
export class AdminSettingsComponent {}
