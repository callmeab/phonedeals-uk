import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  private addToast(type: Toast['type'], message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update(current => {
      const updated = [...current, { id, type, message }];
      if (updated.length > 3) {
        return updated.slice(updated.length - 3);
      }
      return updated;
    });

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  success(message: string) { this.addToast('success', message); }
  error(message: string) { this.addToast('error', message); }
  info(message: string) { this.addToast('info', message); }
  warning(message: string) { this.addToast('warning', message); }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
