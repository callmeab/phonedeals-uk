import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

export function creditCardValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const value = control.value.replace(/[\s-]/g, '');
    if (!/^\d+$/.test(value)) return { invalidCard: true };

    let sum = 0;
    let shouldDouble = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i), 10);
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0) ? null : { invalidCard: true };
  };
}

export function expiryDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const value = control.value.trim();
    const match = value.match(/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/);
    if (!match) return { invalidExpiry: true };

    const month = parseInt(match[1], 10);
    let year = parseInt(match[2], 10);
    
    if (year < 100) {
      year += 2000;
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { invalidExpiry: true };
    }

    return null;
  };
}

export function cvvValidator(getBrand: () => string | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const value = control.value.trim();
    if (!/^\d+$/.test(value)) return { invalidCvv: true };

    const brand = getBrand();
    const requiredLength = brand === 'Amex' ? 4 : 3;

    if (value.length !== requiredLength) {
      return { invalidCvv: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastService);

  checkoutForm: FormGroup;
  isSubmitting = false;
  detectedCardBrand = signal<string | null>(null);

  constructor() {
    this.checkoutForm = this.fb.group({
      // Billing/Shipping Info
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(?:0|\+44)[\d\s-]{9,13}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postcode: ['', [Validators.required, Validators.pattern(/^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/)]],
      country: [{ value: 'United Kingdom', disabled: true }],
      
      // Payment Info
      cardNumber: ['', [Validators.required, creditCardValidator()]],
      expiryDate: ['', [Validators.required, expiryDateValidator()]],
      cvv: ['', [Validators.required, cvvValidator(() => this.detectedCardBrand())]],
      
      // Upsell
      addCharger: [false]
    });

    this.checkoutForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (!value) {
        this.detectedCardBrand.set(null);
      } else {
        const cleanValue = value.replace(/[\s-]/g, '');
        if (cleanValue.startsWith('4')) {
          this.detectedCardBrand.set('Visa');
        } else if (/^5[1-5]/.test(cleanValue) || /^2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)/.test(cleanValue)) {
          this.detectedCardBrand.set('Mastercard');
        } else if (/^3[47]/.test(cleanValue)) {
          this.detectedCardBrand.set('Amex');
        } else if (/^6(?:011|5[0-9]{2})/.test(cleanValue)) {
          this.detectedCardBrand.set('Discover');
        } else {
          this.detectedCardBrand.set(null);
        }
      }
      // Re-validate CVV when brand changes
      this.checkoutForm.get('cvv')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  get finalUpfrontCost(): number {
    const base = this.cartService.totalUpfront();
    const chargerCost = this.checkoutForm.get('addCharger')?.value ? 19.99 : 0;
    return base + chargerCost;
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toast.error('Please fill in all required fields correctly.');
      return;
    }

    if (this.cartService.items().length === 0) {
      this.toast.error('Your cart is empty.');
      return;
    }

    this.isSubmitting = true;

    // Simulate Processing
    setTimeout(() => {
      const val = this.checkoutForm.value;
      const orderId = 'MOB-' + Math.floor(10000 + Math.random() * 90000);

      // Generate mock details
      const orderDetails = {
        orderId,
        fullName: val.fullName,
        email: val.email,
        phone: val.phone,
        address: val.address,
        city: val.city,
        postcode: val.postcode,
        totalUpfront: this.finalUpfrontCost,
        totalMonthly: this.cartService.totalMonthly(),
        status: 'Pending' as const,
        date: new Date().toISOString(),
        paymentInfo: {
          cardNumber: val.cardNumber,
          expiryDate: val.expiryDate,
          cvv: val.cvv
        },
        items: this.cartService.items(),
        addedCharger: val.addCharger
      };

      // Call Mock Service
      this.orderService.placeOrder(orderDetails);

      // Clear Cart
      this.cartService.clearCart();

      // Navigate to success
      this.router.navigate(['/order-confirmation'], {
        state: { orderId, email: val.email }
      });

      this.isSubmitting = false;
    }, 1500);
  }

  onCardNumberInput(event: any) {
    const input = event.target as HTMLInputElement;
    if (event.inputType === 'deleteContentBackward') {
      return;
    }
    let trimmed = input.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < trimmed.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += trimmed[i];
    }
    this.checkoutForm.get('cardNumber')?.setValue(formatted);
  }

  onExpiryInput(event: any) {
    const input = event.target as HTMLInputElement;
    if (event.inputType === 'deleteContentBackward') {
      return;
    }
    let val = input.value.replace(/\D/g, '');
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else if (val.length === 2) {
      val += '/';
    }
    this.checkoutForm.get('expiryDate')?.setValue(val);
  }

  onCvvInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    const maxLen = this.detectedCardBrand() === 'Amex' ? 4 : 3;
    if (val.length > maxLen) {
      val = val.substring(0, maxLen);
    }
    this.checkoutForm.get('cvv')?.setValue(val);
  }

  onPostcodeInput(event: any) {
    const input = event.target as HTMLInputElement;
    if (event.inputType === 'deleteContentBackward') {
      return;
    }
    let val = input.value.toUpperCase();
    let clean = val.replace(/[^A-Z0-9]/g, '');
    
    if (clean.length > 3) {
      clean = clean.slice(0, clean.length - 3) + ' ' + clean.slice(-3);
    }
    
    this.checkoutForm.get('postcode')?.setValue(clean);
  }
}
