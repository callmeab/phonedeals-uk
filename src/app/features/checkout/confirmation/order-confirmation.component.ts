import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ConfirmationState {
  orderId: string;
  email: string;
  firstName?: string;
  productName?: string;
  productImage?: string;
  network?: string;
  contractMonths?: number;
  monthlyCost?: number;
  upfrontCost?: number;
  color?: string;
  storage?: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './order-confirmation.component.scss',
  template: `
    <div class="confirmation-page">
      <!-- Animated background elements -->
      <div class="bg-decoration">
        <div class="bg-blob bg-blob-1"></div>
        <div class="bg-blob bg-blob-2"></div>
        <div class="bg-blob bg-blob-3"></div>
      </div>

      <div class="confirmation-container">

        <!-- Success animation -->
        <div class="success-animation">
          <div class="success-circle">
            <svg class="checkmark" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div class="confetti-wrapper">
            <div class="confetti confetti-1">🎉</div>
            <div class="confetti confetti-2">✨</div>
            <div class="confetti confetti-3">🎊</div>
            <div class="confetti confetti-4">⭐</div>
          </div>
        </div>

        <!-- Heading -->
        <h1 class="heading" [class.animate-in]="animateIn">
          Order Confirmed!
        </h1>
        <p class="sub-heading" [class.animate-in]="animateIn">
          {{ state.firstName ? 'Thank you, ' + state.firstName + '!' : 'Thank you for your order!' }}
          Your order has been placed successfully.
        </p>

        <!-- Order Reference Card -->
        <div class="order-ref-card" [class.animate-in]="animateIn">
          <div class="order-ref-label">Order Reference</div>
          <div class="order-ref-id">{{ shortOrderId }}</div>
          <div class="order-ref-full" *ngIf="state.orderId">
            Full ID: <span>{{ state.orderId }}</span>
          </div>
        </div>

        <!-- Product Summary Card -->
        <div class="summary-card" [class.animate-in]="animateIn" *ngIf="state.productName">

          <!-- Product row -->
          <div class="product-row">
            <div class="product-image-wrapper" *ngIf="state.productImage">
              <img [src]="state.productImage" [alt]="state.productName" class="product-image" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ state.productName }}</h3>
              <div class="product-meta">
                <span class="meta-badge" *ngIf="state.color">{{ state.color }}</span>
                <span class="meta-badge" *ngIf="state.storage">{{ state.storage }}</span>
                <span class="meta-badge network-badge" *ngIf="state.network && state.network !== 'Outright'">{{ state.network }}</span>
              </div>
            </div>
          </div>

          <!-- Pricing row -->
          <div class="pricing-section">
            <div class="price-item" *ngIf="state.monthlyCost">
              <span class="price-label">Monthly</span>
              <span class="price-value">£{{ state.monthlyCost | number:'1.2-2' }}<span class="price-suffix">/mo</span></span>
            </div>
            <div class="price-divider" *ngIf="state.monthlyCost && state.upfrontCost !== undefined"></div>
            <div class="price-item" *ngIf="state.upfrontCost !== undefined">
              <span class="price-label">Upfront</span>
              <span class="price-value accent">£{{ state.upfrontCost | number:'1.2-2' }}</span>
            </div>
            <div class="price-divider" *ngIf="state.contractMonths"></div>
            <div class="price-item" *ngIf="state.contractMonths">
              <span class="price-label">Contract</span>
              <span class="price-value">{{ state.contractMonths }} months</span>
            </div>
          </div>
        </div>

        <!-- What happens next -->
        <div class="next-steps" [class.animate-in]="animateIn">
          <h3 class="steps-title">What happens next?</h3>
          <div class="steps-grid">
            <div class="step-item">
              <div class="step-icon">📧</div>
              <div class="step-text">
                <strong>Confirmation email</strong>
                <span>Sent to <strong class="email-highlight">{{ state.email || 'your inbox' }}</strong></span>
              </div>
            </div>
            <div class="step-item">
              <div class="step-icon">📋</div>
              <div class="step-text">
                <strong>Order processing</strong>
                <span>We'll review and prepare your order</span>
              </div>
            </div>
            <div class="step-item">
              <div class="step-icon">🚚</div>
              <div class="step-text">
                <strong>Fast delivery</strong>
                <span>Estimated delivery within 3–5 business days</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Spam hint -->
        <div class="spam-notice" [class.animate-in]="animateIn" *ngIf="state.email">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spam-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>Don't see the email? Check your <strong>spam or junk folder</strong> — sometimes emails can end up there.</span>
        </div>

        <!-- Actions -->
        <div class="actions" [class.animate-in]="animateIn">
          <button (click)="goHome()" class="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  `
})
export class OrderConfirmationComponent implements OnInit {
  private router = inject(Router);

  state: ConfirmationState = { orderId: '', email: '' };
  animateIn = false;

  get shortOrderId(): string {
    if (!this.state.orderId) return '—';
    // Show a cleaner short ref: first 8 chars uppercase
    const clean = this.state.orderId.replace(/-/g, '');
    return 'MB-' + clean.substring(0, 8).toUpperCase();
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras.state as ConfirmationState | undefined;

    if (navState?.orderId) {
      this.state = navState;
    } else {
      // Fallback: user refreshed — history.state may still carry the values
      const fallback = history.state as ConfirmationState | undefined;
      if (fallback?.orderId) {
        this.state = fallback;
      }
    }

    // Trigger animations after mount
    setTimeout(() => { this.animateIn = true; }, 100);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
