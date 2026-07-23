import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './order-confirmation.component.scss',
  template: `
    <div class="confirmation-container">
      
      <div class="text-center py-12">
        <div class="success-icon-wrapper">
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 class="title">Order Confirmed!</h1>
        
        <div class="order-details-card">
          <p class="thank-you-text">
            Thank you for your order. Your order reference is:
          </p>
          <p class="order-id">
            {{ orderId || '—' }}
          </p>
          <p class="email-text" *ngIf="email">
            A confirmation email has been sent to <br>
            <strong class="email-address">{{ email }}</strong>
            <span class="spam-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spam-hint-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              If you don't receive it within a few minutes, please check your <strong>spam or junk folder</strong> — sometimes emails can end up there.
            </span>
          </p>
          <p class="email-text" *ngIf="!email">
            Check your inbox for a confirmation email.
          </p>
        </div>

        <button (click)="goHome()" class="btn-home">
          Return to Home
        </button>
      </div>

    </div>
  `
})
export class OrderConfirmationComponent implements OnInit {
  private router = inject(Router);

  orderId: string = '';
  email: string   = '';

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { orderId: string; email: string } | undefined;
    
    if (state?.orderId) {
      // Preferred path: state passed via router.navigate()
      this.orderId = state.orderId;
      this.email   = state.email || '';
    } else {
      // Fallback: user refreshed the page — history.state may still carry the values
      const stateFallback = history.state as { orderId?: string; email?: string };
      this.orderId = stateFallback?.orderId || '';
      this.email   = stateFallback?.email   || '';
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
