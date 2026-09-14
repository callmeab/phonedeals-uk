import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AdminPreorderService,
  AdminPreorderDetail,
  PreorderStatus
} from '../../../core/services/admin-preorder.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-preorder-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './preorder-detail.component.html'
})
export class AdminPreorderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public preorderService = inject(AdminPreorderService);
  private toast = inject(ToastService);

  preorder = signal<AdminPreorderDetail | null>(null);
  isLoading = signal<boolean>(true);
  isUpdatingStatus = signal<boolean>(false);
  copiedField = signal<string | null>(null);
  showSensitiveBank = signal<boolean>(false);

  readonly statusOptions: { value: PreorderStatus; label: string }[] = [
    { value: 'new', label: 'New Booking' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'ready_for_collection', label: 'Ready for Collection' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPreorder(id);
    } else {
      this.router.navigate(['/xk92-admin/preorders']);
    }
  }

  loadPreorder(id: string): void {
    this.isLoading.set(true);
    this.preorderService.getPreorderById(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.preorder.set(res.data);
        } else {
          this.toast.error('Pre-order not found');
          this.router.navigate(['/xk92-admin/preorders']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Failed to load pre-order details');
        this.router.navigate(['/xk92-admin/preorders']);
      }
    });
  }

  updateStatus(newStatus: PreorderStatus): void {
    const current = this.preorder();
    if (!current) return;

    this.isUpdatingStatus.set(true);
    this.preorderService.updateStatus(current.id, newStatus).subscribe({
      next: (res) => {
        this.isUpdatingStatus.set(false);
        if (res.success) {
          this.toast.success('Reservation status updated');
          this.preorder.set(res.data);
        }
      },
      error: () => {
        this.isUpdatingStatus.set(false);
        this.toast.error('Failed to update status');
      }
    });
  }

  getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ready_for_collection': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  getStatusIcon(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'new': return '🆕';
      case 'confirmed': return '⏳';
      case 'ready_for_collection': return '📦';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  }

  getColorHex(color?: string): string {
    switch ((color || '').toLowerCase()) {
      case 'glacier': return '#C4D8E2';
      case 'burgundy': return '#5B1E31';
      case 'silver': return '#E2E4E5';
      case 'black': return '#2C2C2E';
      default: return '#94A3B8';
    }
  }

  getNetworkLogo(network?: string | null): string {
    if (!network) return '';
    const net = network.toLowerCase().replace(/\s+/g, '-');
    if (net === 'ee') return '/EE-sim-logo.png';
    if (net === 'o2') return '/O2-sim-logo.jpg';
    if (net === 'vodafone') return '/Vodafone-sim-logo.png';
    if (net === 'three') return '/three-sim-logo.jpg';
    if (net === 'sky-mobile') return '/sky-mobile-sim-logo.jpg';
    if (net === 'id-mobile') return '/id-mobile-sim-logo.png';
    if (net === 'bt-mobile') return '/BT-mobile-sim-logo.png';
    return '';
  }

  calculateAge(dob?: string): string {
    if (!dob) return '';
    try {
      const birth = new Date(dob);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return isNaN(age) ? '' : `${age} years old`;
    } catch {
      return '';
    }
  }

  maskSortCode(sortCode?: string): string {
    if (!sortCode) return 'Not Provided';
    if (this.showSensitiveBank()) return sortCode;
    const parts = sortCode.split('-');
    if (parts.length === 3) {
      return `••-••-${parts[2]}`;
    }
    return sortCode.length >= 2 ? `••••••${sortCode.slice(-2)}` : sortCode;
  }

  maskAccountNumber(acc?: string): string {
    if (!acc) return 'Not Provided';
    if (this.showSensitiveBank()) return acc;
    return acc.length >= 4 ? `••••${acc.slice(-4)}` : acc;
  }

  toggleMaskBank(): void {
    this.showSensitiveBank.update(v => !v);
  }

  copyToClipboard(text?: string, label?: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.copiedField.set(label || 'Copied');
    this.toast.info(`Copied ${label || 'value'} to clipboard`);
    setTimeout(() => {
      this.copiedField.set(null);
    }, 2000);
  }

  getInsuranceLabel(plan?: string, billing?: string): string {
    if (!plan || plan === 'none') return 'No Protection Plan Selected';
    if (plan === 'lite') {
      const price = billing === 'annual' ? '£10.83/mo (£130/yr)' : '£12.00/mo';
      return `Insurance Lite — ${price}`;
    }
    if (plan === 'complete') {
      const price = billing === 'annual' ? '£15.00/mo (£180/yr)' : '£16.00/mo';
      return `Insurance Complete (Full Theft & Loss) — ${price}`;
    }
    return plan;
  }
}
