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
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Dispatched': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getNetworkLogo(network: string): string {
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
}
