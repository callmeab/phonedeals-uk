import { Injectable, signal } from '@angular/core';

export interface StoreSettings {
  general: {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
  };
  notifications: {
    newOrderAlerts: boolean;
    inventoryWarnings: boolean;
    dailySummaries: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'mobello_admin_settings';
  
  private defaultSettings: StoreSettings = {
    general: {
      storeName: 'Mobello',
      supportEmail: 'support@mobello.co.uk',
      supportPhone: '+44 800 123 4567',
      address: '123 Tech Street, London, UK'
    },
    notifications: {
      newOrderAlerts: true,
      inventoryWarnings: false,
      dailySummaries: true
    }
  };

  private settingsSignal = signal<StoreSettings>(this.loadSettings());

  constructor() {}

  get settings() {
    return this.settingsSignal.asReadonly();
  }

  updateSettings(newSettings: StoreSettings): void {
    this.saveSettings(newSettings);
    this.settingsSignal.set(newSettings);
  }

  private loadSettings(): StoreSettings {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : this.defaultSettings;
      } catch (e) {
        console.error('Failed to load settings from localStorage', e);
        return this.defaultSettings;
      }
    }
    return this.defaultSettings;
  }

  private saveSettings(settings: StoreSettings): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
      }
    }
  }
}
