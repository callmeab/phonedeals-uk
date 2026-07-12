import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { SettingsService, StoreSettings } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="max-w-5xl mx-auto pb-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p class="text-sm text-gray-500 mt-1">Manage your store's configuration and preferences.</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        <!-- Sidebar Navigation -->
        <div class="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-2 shrink-0">
          <button 
            (click)="activeTab = 'general'"
            [ngClass]="activeTab === 'general' ? 'bg-white shadow-sm border-gray-200 text-indigo-600' : 'border-transparent text-gray-600 hover:bg-gray-100'"
            class="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            General
          </button>
          <button 
            (click)="activeTab = 'notifications'"
            [ngClass]="activeTab === 'notifications' ? 'bg-white shadow-sm border-gray-200 text-indigo-600' : 'border-transparent text-gray-600 hover:bg-gray-100'"
            class="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </button>
          <button 
            (click)="activeTab = 'security'"
            [ngClass]="activeTab === 'security' ? 'bg-white shadow-sm border-gray-200 text-indigo-600' : 'border-transparent text-gray-600 hover:bg-gray-100'"
            class="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 p-8">
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
            
            <!-- General Settings Tab -->
            @if (activeTab === 'general') {
              <div formGroupName="general" class="space-y-6 max-w-2xl">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">General Information</h3>
                  <p class="text-sm text-gray-500 mt-1">Update your store's basic details and contact info.</p>
                </div>
                <hr class="border-gray-100">

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Store Name <span class="text-red-500">*</span></label>
                    <input type="text" formControlName="storeName" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none" placeholder="e.g. Mobello">
                    @if (settingsForm.get('general.storeName')?.invalid && settingsForm.get('general.storeName')?.touched) {
                      <p class="text-xs text-red-500 mt-1">Store name is required.</p>
                    }
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Support Email <span class="text-red-500">*</span></label>
                    <input type="email" formControlName="supportEmail" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none" placeholder="support@example.com">
                    @if (settingsForm.get('general.supportEmail')?.invalid && settingsForm.get('general.supportEmail')?.touched) {
                      <p class="text-xs text-red-500 mt-1">A valid email is required.</p>
                    }
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input type="text" formControlName="supportPhone" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none" placeholder="+44 800...">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                    <textarea formControlName="address" rows="3" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none resize-none" placeholder="Enter full address..."></textarea>
                  </div>
                </div>
              </div>
            }

            <!-- Notifications Tab -->
            @if (activeTab === 'notifications') {
              <div formGroupName="notifications" class="space-y-6 max-w-2xl">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Email Notifications</h3>
                  <p class="text-sm text-gray-500 mt-1">Choose what alerts you want to receive.</p>
                </div>
                <hr class="border-gray-100">

                <div class="space-y-4">
                  <!-- Toggle 1 -->
                  <div class="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors">
                    <div>
                      <p class="text-sm font-medium text-gray-900">New Order Alerts</p>
                      <p class="text-xs text-gray-500">Receive an email whenever a new order is placed.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="newOrderAlerts" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <!-- Toggle 2 -->
                  <div class="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors">
                    <div>
                      <p class="text-sm font-medium text-gray-900">Inventory Warnings</p>
                      <p class="text-xs text-gray-500">Get notified when a product is low on stock.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="inventoryWarnings" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <!-- Toggle 3 -->
                  <div class="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors">
                    <div>
                      <p class="text-sm font-medium text-gray-900">Daily Summaries</p>
                      <p class="text-xs text-gray-500">Receive a daily digest of store performance.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="dailySummaries" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            }

            <!-- Security Tab -->
            @if (activeTab === 'security') {
              <div class="space-y-6 max-w-2xl">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Account Security</h3>
                  <p class="text-sm text-gray-500 mt-1">Manage your admin password and security preferences.</p>
                </div>
                <hr class="border-gray-100">
                
                <div class="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <div class="flex gap-3">
                    <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 class="text-sm font-semibold text-amber-800">Mock Implementation</h4>
                      <p class="text-xs text-amber-700 mt-1">Password changes are disabled in this demo environment.</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4 opacity-50 pointer-events-none">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" disabled class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value="********">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" disabled class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Enter new password">
                  </div>
                </div>
              </div>
            }

            <!-- Form Actions -->
            <div class="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button"
                (click)="resetForm()"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none">
                Reset
              </button>
              <button 
                type="submit"
                [disabled]="settingsForm.invalid || !settingsForm.dirty"
                class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);

  activeTab: 'general' | 'notifications' | 'security' = 'general';
  
  settingsForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const currentSettings = this.settingsService.settings();
    
    this.settingsForm = this.fb.group({
      general: this.fb.group({
        storeName: [currentSettings.general.storeName, Validators.required],
        supportEmail: [currentSettings.general.supportEmail, [Validators.required, Validators.email]],
        supportPhone: [currentSettings.general.supportPhone],
        address: [currentSettings.general.address]
      }),
      notifications: this.fb.group({
        newOrderAlerts: [currentSettings.notifications.newOrderAlerts],
        inventoryWarnings: [currentSettings.notifications.inventoryWarnings],
        dailySummaries: [currentSettings.notifications.dailySummaries]
      })
    });
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      const formValue = this.settingsForm.value;
      this.settingsService.updateSettings(formValue as StoreSettings);
      this.settingsForm.markAsPristine();
      this.toast.success('Settings updated successfully!');
    } else {
      this.settingsForm.markAllAsTouched();
      this.toast.error('Please fix the errors in the form.');
    }
  }

  resetForm() {
    const currentSettings = this.settingsService.settings();
    this.settingsForm.patchValue(currentSettings);
    this.settingsForm.markAsPristine();
  }
}
