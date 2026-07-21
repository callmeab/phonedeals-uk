import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { CanDeactivateCheckout } from './checkout.guard';

// ── Validators ──────────────────────────────────────────────────────────────

export function ukPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    // Accepts: 07xxxxxxxxx or +447xxxxxxxxx
    const isValid = /^(\+44\s?7|07)\d{9}$/.test(control.value.replace(/\s+/g, ''));
    return isValid ? null : { invalidUkPhone: true };
  };
}

export function sortCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const isValid = /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(control.value);
    return isValid ? null : { invalidSortCode: true };
  };
}

export function accountNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const isValid = /^[0-9]{8}$/.test(control.value);
    return isValid ? null : { invalidAccountNumber: true };
  };
}

export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
  };
}

// ── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, CanDeactivateCheckout {
  private fb           = inject(FormBuilder);
  public  cartService  = inject(CartService);
  private orderService = inject(OrderService);
  private router       = inject(Router);
  private toast        = inject(ToastService);
  private http         = inject(HttpClient);


  checkoutForm!: FormGroup;
  currentStep: 1 | 2 | 3 = 1;
  isSubmitting = false;
  /** Flips to true after a successful order submission so the guard never
   *  blocks the automatic redirect to /order-confirmation. */
  isSubmitted = false;
  stepAnimating = false;

  readonly timeAtAddressOptions = ['<1 Year', '1-2 Years', '2-5 Years', '5+ Years'];
  readonly timeWithBankOptions   = ['<1 Year', '1-2 Years', '2-5 Years', '5-10 Years', '10+ Years'];

  // Insurance feature lists
  readonly liteIncluded  = ['Accidental Damage', 'Breakdown', 'Accessories up to £300', 'Worldwide Cover', '24/7 Expert Support'];
  readonly liteExcluded  = ['Excess Pay', 'Unpaid Premium Claims', 'Cosmetic Damage', 'Theft', 'Loss'];
  readonly completeIncluded = ['Accidental Damage', 'Breakdown', 'Accessories up to £300', 'Worldwide Cover', '24/7 Expert Support', 'Theft', 'Loss'];
  readonly completeExcluded = ['Excess Pay', 'Cosmetic Damage', 'Theft/Loss While Unattended'];

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit() {
    this.initForm();
  }

  // ── Form initialisation ───────────────────────────────────────────────────

  private initForm() {
    this.checkoutForm = this.fb.group({
      personalDetails: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName:  ['', [Validators.required, Validators.minLength(2)]],
        email:     ['', [Validators.required, Validators.email]],
        phone:     ['', [Validators.required, ukPhoneValidator()]],
        dob:       ['', [Validators.required, ageValidator(18)]]
      }),

      addressAndInsurance: this.fb.group({
        postcode:       ['', Validators.required],
        currentAddress: ['', Validators.required],
        timeAtAddress:  ['1-2 Years', Validators.required],
        insurancePlan:  ['none'],       // 'none' | 'lite' | 'complete'
        insuranceBilling: ['monthly']  // 'monthly' | 'annual'
      }),

      paymentAndExtras: this.fb.group({
        accountName:   ['', Validators.required],
        sortCode:      ['', [Validators.required, sortCodeValidator()]],
        accountNumber: ['', [Validators.required, accountNumberValidator()]],
        timeWithBank:  ['1-2 Years', Validators.required],
        addCharger:    [false],
        addCover:      [false]
      })
    });
  }

  // ── Step helpers ──────────────────────────────────────────────────────────

  get stepGroup(): FormGroup {
    const names: Record<number, string> = {
      1: 'personalDetails',
      2: 'addressAndInsurance',
      3: 'paymentAndExtras'
    };
    return this.checkoutForm.get(names[this.currentStep]) as FormGroup;
  }

  nextStep() {
    if (this.stepGroup.invalid) {
      this.stepGroup.markAllAsTouched();
      this.toast.error('Please complete all highlighted fields correctly.');
      return;
    }
    if (this.currentStep < 3) {
      this.animateStep(() => {
        this.currentStep = (this.currentStep + 1) as 1 | 2 | 3;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.animateStep(() => {
        this.currentStep = (this.currentStep - 1) as 1 | 2 | 3;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  private animateStep(callback: () => void) {
    this.stepAnimating = true;
    setTimeout(() => {
      callback();
      this.stepAnimating = false;
    }, 200);
  }

  isStepComplete(step: number): boolean {
    const names: Record<number, string> = {
      1: 'personalDetails',
      2: 'addressAndInsurance',
      3: 'paymentAndExtras'
    };
    return (this.checkoutForm.get(names[step]) as FormGroup)?.valid ?? false;
  }

  // ── Form value setters ────────────────────────────────────────────────────

  setTimeControl(controlPath: string, value: string) {
    this.checkoutForm.get(controlPath)?.setValue(value);
    this.checkoutForm.get(controlPath)?.markAsTouched();
  }

  setInsurancePlan(plan: 'none' | 'lite' | 'complete') {
    this.checkoutForm.get('addressAndInsurance.insurancePlan')?.setValue(plan);
    // Reset billing to monthly when switching plan
    this.checkoutForm.get('addressAndInsurance.insuranceBilling')?.setValue('monthly');
  }

  setInsuranceBilling(billing: 'monthly' | 'annual') {
    this.checkoutForm.get('addressAndInsurance.insuranceBilling')?.setValue(billing);
  }

  // ── Sort code auto-format ─────────────────────────────────────────────────

  onSortCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const inputEvent = event as InputEvent;
    if (inputEvent.inputType === 'deleteContentBackward') return;

    let digits = input.value.replace(/\D/g, '').substring(0, 6);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += '-';
      formatted += digits[i];
    }
    this.checkoutForm.get('paymentAndExtras.sortCode')?.setValue(formatted, { emitEvent: false });
    // Move cursor to end
    setTimeout(() => { input.setSelectionRange(formatted.length, formatted.length); }, 0);
  }

  onAccountNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 8);
    this.checkoutForm.get('paymentAndExtras.accountNumber')?.setValue(val, { emitEvent: false });
  }

  // ── Dynamic pricing ───────────────────────────────────────────────────────

  get insuranceMonthlyCost(): number {
    const plan    = this.checkoutForm?.get('addressAndInsurance.insurancePlan')?.value ?? 'none';
    const billing = this.checkoutForm?.get('addressAndInsurance.insuranceBilling')?.value ?? 'monthly';

    if (plan === 'none') return 0;

    if (plan === 'lite') {
      return billing === 'monthly' ? 12.00 : parseFloat((130 / 12).toFixed(2));
    }
    if (plan === 'complete') {
      return billing === 'monthly' ? 16.00 : parseFloat((180 / 12).toFixed(2));
    }
    return 0;
  }

  get insuranceLabel(): string {
    const plan    = this.checkoutForm?.get('addressAndInsurance.insurancePlan')?.value ?? 'none';
    const billing = this.checkoutForm?.get('addressAndInsurance.insuranceBilling')?.value ?? 'monthly';
    if (plan === 'none') return '';
    const name = plan === 'lite' ? 'Insurance Lite' : 'Insurance Complete';
    const suffix = billing === 'annual' ? '/mo (annual)' : '/mo';
    return `${name} — £${this.insuranceMonthlyCost.toFixed(2)}${suffix}`;
  }

  get extrasUpfrontCost(): number {
    let cost = 0;
    if (this.checkoutForm?.get('paymentAndExtras.addCharger')?.value) cost += 19.99;
    if (this.checkoutForm?.get('paymentAndExtras.addCover')?.value)   cost += 14.99;
    return cost;
  }

  get finalUpfrontCost(): number {
    return this.cartService.totalUpfront() + this.extrasUpfrontCost;
  }

  get finalMonthlyCost(): number {
    return this.cartService.totalMonthly() + this.insuranceMonthlyCost;
  }

  // ── Guard interface ────────────────────────────────────────────────────────

  /**
   * Called by `checkoutGuard` (CanDeactivate) when the user tries to navigate
   * away from the checkout page.
   *
   * Returns `true` (dirty form + not yet submitted) to trigger the confirm
   * dialog, or `false` to let navigation proceed silently.
   */
  hasUnsavedChanges(): boolean {
    // Warn if the user has either typed anything (dirty) OR progressed
    // past step 1 — both are strong signals they have work in progress.
    return (this.checkoutForm.dirty || this.currentStep > 1) && !this.isSubmitted;
  }

  /**
   * Catches browser tab close / hard refresh events.
   * The browser will show its own generic leave prompt when returnValue is set.
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      // Required for cross-browser support (Chrome ignores the string value
      // but still shows the native prompt when returnValue is set).
      event.returnValue = 'Are you sure you want to leave? Your checkout data will be lost.';
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit() {
    this.checkoutForm.markAllAsTouched();
    if (this.checkoutForm.invalid) {
      this.toast.error('Please complete all required fields correctly.');
      return;
    }
    if (this.cartService.items().length === 0) {
      this.toast.error('Your cart is empty.');
      return;
    }

    this.isSubmitting = true;

    const val      = this.checkoutForm.value;
    const personal = val.personalDetails;
    const address  = val.addressAndInsurance;

    // Build the request payload for POST /api/checkout/create-intent
    // Note: dealId is set to the first cart item's deal ID if available.
    // In a full implementation this would come from CheckoutStateService.
    const cartItems = this.cartService.items();
    const firstItem = cartItems[0] as any;

    const payload = {
      customer: {
        firstName:      personal.firstName,
        lastName:       personal.lastName,
        email:          personal.email,
        mobile:         personal.phone,
        dateOfBirth:    personal.dob,
        marketingOptIn: false,
      },
      dealId:          firstItem?.dealId ?? firstItem?.id ?? null,
      networkProvider: firstItem?.network ?? '',
      deliveryAddress: {
        line1:    address.currentAddress,
        line2:    null,
        city:     address.city || 'London',
        county:   null,
        postcode: address.postcode,
      },
      sameAsDelivery: true,
    };

    this.http.post<{ success: boolean; orderId: string; email: string }>(
      '/api/checkout/create-intent',
      payload
    ).subscribe({
      next: (response) => {
        if (response.success) {
          const orderId      = response.orderId;
          const email        = response.email || personal.email;

          // Build a local order record so the admin panel can see it
          const orderDetails: any = {
            orderId,
            fullName:     `${personal.firstName} ${personal.lastName}`,
            email,
            address:      address.currentAddress,
            city:         address.city || '',
            postcode:     address.postcode,
            phone:        personal.phone,
            totalUpfront: this.finalUpfrontCost,
            totalMonthly: this.finalMonthlyCost,
            status:       'Pending',
            date:         new Date().toISOString(),
            paymentInfo:  { cardNumber: val.paymentAndExtras.accountNumber, expiryDate: '', cvv: '' },
            items:        cartItems,
            insurance:    address.insurancePlan,
            addedCharger: val.paymentAndExtras.addCharger,
            addedCover:   val.paymentAndExtras.addCover,
          };

          // Mark submitted BEFORE navigation so the guard allows the redirect
          this.isSubmitted = true;
          this.orderService.placeOrder(orderDetails);
          this.cartService.clearCart();

          this.router.navigate(['/order-confirmation'], { state: { orderId, email } });
        } else {
          this.toast.error('Order could not be placed. Please try again.');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('[checkout] API error:', err);
        // Graceful fallback for local dev without backend running
        const orderId = 'MOB-' + Math.floor(10000 + Math.random() * 90000);
        const email   = personal.email;

        const orderDetails: any = {
          orderId,
          fullName:     `${personal.firstName} ${personal.lastName}`,
          email,
          address:      address.currentAddress,
          city:         '',
          postcode:     address.postcode,
          phone:        personal.phone,
          totalUpfront: this.finalUpfrontCost,
          totalMonthly: this.finalMonthlyCost,
          status:       'Pending',
          date:         new Date().toISOString(),
          paymentInfo:  { cardNumber: val.paymentAndExtras.accountNumber, expiryDate: '', cvv: '' },
          items:        this.cartService.items(),
          insurance:    address.insurancePlan,
          addedCharger: val.paymentAndExtras.addCharger,
          addedCover:   val.paymentAndExtras.addCover,
        };

        this.toast.error('Could not reach server. Using offline mode.');
        this.isSubmitted = true;
        this.orderService.placeOrder(orderDetails);
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation'], { state: { orderId, email } });
        this.isSubmitting = false;
      },
    });
  }
}
