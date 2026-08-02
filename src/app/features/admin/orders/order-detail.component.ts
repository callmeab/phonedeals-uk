import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService, OrderDetails } from '../../../core/services/order.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-detail.component.html',
  styles: []
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public orderService = inject(OrderService);

  order: OrderDetails | undefined;
  statusOptions: OrderDetails['status'][] = ['Pending', 'Dispatched', 'Completed', 'Cancelled'];
  copiedField: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.order = this.orderService.getOrderById(id);
      if (!this.order) {
        this.router.navigate(['/xk92-admin/orders']);
      }
    }
  }

  updateStatus(newStatus: OrderDetails['status']): void {
    if (this.order) {
      this.orderService.updateOrderStatus(this.order.orderId, newStatus);
      this.order.status = newStatus;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Dispatched': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Dispatched': return '🚚';
      case 'Completed': return '✅';
      case 'Cancelled': return '❌';
      default: return '📦';
    }
  }

  getNetworkLogo(network: string): string {
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
      return `${age} years old`;
    } catch {
      return '';
    }
  }

  copyToClipboard(text?: string, label?: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.copiedField = label || 'Copied';
    setTimeout(() => {
      this.copiedField = null;
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

