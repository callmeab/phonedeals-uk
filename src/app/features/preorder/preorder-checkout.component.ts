import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PreorderService } from '../../core/services/preorder.service';
import { ToastService } from '../../core/services/toast.service';
import { SeoService } from '../../core/services/seo.service';
import { CanDeactivatePreorder } from './preorder.guard';
import {
  ukPhoneValidator,
  sortCodeValidator,
  accountNumberValidator,
  ageValidator
} from '../../core/utils/form-validators';
import { PreorderReservationRequest } from '../../core/models/preorder.model';

@Component({
  selector: 'app-preorder-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './preorder-checkout.component.html',
  styleUrl: './iphone18-preorder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreorderCheckoutComponent implements OnInit, CanDeactivatePreorder {
  public preorder = inject(PreorderService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastService);
  private seo = inject(SeoService);

  // Multi-step form
  reservationForm!: FormGroup;
  currentStep = signal<1 | 2 | 3>(1);
  isSubmitting = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  formError = signal<string | null>(null);
  stepAnimating = signal<boolean>(false);

  // Address & Insurance options (same as checkout)
  readonly timeAtAddressOptions = ['<1 Year', '1-2 Years', '2-5 Years', '5+ Years'];
  readonly timeWithBankOptions   = ['<1 Year', '1-2 Years', '2-5 Years', '5-10 Years', '10+ Years'];

  // Insurance feature lists
  readonly liteIncluded  = ['Accidental Damage', 'Breakdown', 'Accessories up to £300', 'Worldwide Cover', '24/7 Expert Support'];
  readonly liteExcluded  = ['Excess Pay', 'Unpaid Premium Claims', 'Cosmetic Damage', 'Theft', 'Loss'];
  readonly completeIncluded = ['Accidental Damage', 'Breakdown', 'Accessories up to £300', 'Worldwide Cover', '24/7 Expert Support', 'Theft', 'Loss'];
  readonly completeExcluded = ['Excess Pay', 'Cosmetic Damage', 'Theft/Loss While Unattended'];

  ngOnInit(): void {
    this.initForm();
    this.seo.setPageTitle('Pre-Order Checkout | iPhone 18 Pro Priority Allocation');

    // Ensure data is loaded
    this.preorder.loadPreorderData().subscribe({
      error: () => {}
    });
  }

  // ── Form initialisation (3-step structure matching checkout) ─────────────

  private initForm(): void {
    this.reservationForm = this.fb.group({
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
        city:           ['', Validators.required],
        timeAtAddress:  ['1-2 Years', Validators.required],
        insurancePlan:  ['none'],
        insuranceBilling: ['monthly']
      }),

      paymentAndExtras: this.fb.group({
        accountName:   ['', Validators.required],
        sortCode:      ['', [Validators.required, sortCodeValidator()]],
        accountNumber: ['', [Validators.required, accountNumberValidator()]],
        timeWithBank:  ['1-2 Years', Validators.required]
      })
    });
  }

  // ── Step helpers (identical to checkout) ────────────────────────────────

  get stepGroup(): FormGroup {
    const names: Record<number, string> = {
      1: 'personalDetails',
      2: 'addressAndInsurance',
      3: 'paymentAndExtras'
    };
    return this.reservationForm.get(names[this.currentStep()]) as FormGroup;
  }

  nextStep(): void {
    if (this.stepGroup.invalid) {
      this.stepGroup.markAllAsTouched();
      this.toast.error('Please complete all highlighted fields correctly.');
      return;
    }
    if (this.currentStep() < 3) {
      this.animateStep(() => {
        this.currentStep.set((this.currentStep() + 1) as 1 | 2 | 3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.animateStep(() => {
        this.currentStep.set((this.currentStep() - 1) as 1 | 2 | 3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  private animateStep(callback: () => void): void {
    this.stepAnimating.set(true);
    setTimeout(() => {
      callback();
      this.stepAnimating.set(false);
    }, 200);
  }

  isStepComplete(step: number): boolean {
    const names: Record<number, string> = {
      1: 'personalDetails',
      2: 'addressAndInsurance',
      3: 'paymentAndExtras'
    };
    return (this.reservationForm.get(names[step]) as FormGroup)?.valid ?? false;
  }

  // ── Form value setters ────────────────────────────────────────────────────

  setTimeControl(controlPath: string, value: string): void {
    this.reservationForm.get(controlPath)?.setValue(value);
    this.reservationForm.get(controlPath)?.markAsTouched();
  }

  setInsurancePlan(plan: 'none' | 'lite' | 'complete'): void {
    this.reservationForm.get('addressAndInsurance.insurancePlan')?.setValue(plan);
    this.reservationForm.get('addressAndInsurance.insuranceBilling')?.setValue('monthly');
  }

  setInsuranceBilling(billing: 'monthly' | 'annual'): void {
    this.reservationForm.get('addressAndInsurance.insuranceBilling')?.setValue(billing);
  }

  // ── Sort code auto-format ────────────────────────────────────────────────

  onSortCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputEvent = event as InputEvent;
    if (inputEvent.inputType === 'deleteContentBackward') return;

    let digits = input.value.replace(/\D/g, '').substring(0, 6);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += '-';
      formatted += digits[i];
    }
    this.reservationForm.get('paymentAndExtras.sortCode')?.setValue(formatted, { emitEvent: false });
    setTimeout(() => { input.setSelectionRange(formatted.length, formatted.length); }, 0);
  }

  onAccountNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 8);
    this.reservationForm.get('paymentAndExtras.accountNumber')?.setValue(val, { emitEvent: false });
  }

  // ── Dynamic pricing (insurance) ────────────────────────────────────────────

  get insuranceMonthlyCost(): number {
    const plan    = this.reservationForm?.get('addressAndInsurance.insurancePlan')?.value ?? 'none';
    const billing = this.reservationForm?.get('addressAndInsurance.insuranceBilling')?.value ?? 'monthly';

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
    const plan    = this.reservationForm?.get('addressAndInsurance.insurancePlan')?.value ?? 'none';
    const billing = this.reservationForm?.get('addressAndInsurance.insuranceBilling')?.value ?? 'monthly';
    if (plan === 'none') return '';
    const name = plan === 'lite' ? 'Insurance Lite' : 'Insurance Complete';
    const suffix = billing === 'annual' ? '/mo (annual)' : '/mo';
    return `${name} — £${this.insuranceMonthlyCost.toFixed(2)}${suffix}`;
  }

  getColorHex(color: string): string {
    switch ((color || '').toLowerCase()) {
      case 'glacier':
        return '#C4D8E2';
      case 'burgundy':
        return '#5B1E31';
      case 'silver':
        return '#E2E4E5';
      case 'black':
        return '#2C2C2E';
      default:
        return '#94A3B8';
    }
  }

  // ── Guard interface ────────────────────────────────────────────────────

  hasUnsavedChanges(): boolean {
    return (this.reservationForm.dirty || this.currentStep() > 1) && !this.isSubmitted();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your pre-booking data will be lost.';
    }
  }

  // ── Submission ─────────────────────────────────────────────────────────────

  submitReservation(): void {
    this.reservationForm.markAllAsTouched();
    if (this.reservationForm.invalid) {
      this.toast.error('Please complete all required fields correctly.');
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    const val = this.reservationForm.value;
    const personal = val.personalDetails;
    const address  = val.addressAndInsurance;
    const payment  = val.paymentAndExtras;

    const req: PreorderReservationRequest = {
      firstName:      personal.firstName,
      lastName:       personal.lastName,
      email:          personal.email,
      phone:          personal.phone,
      dateOfBirth:    personal.dob,
      model:          this.preorder.selectedModel(),
      storage:        this.preorder.selectedStorage(),
      color:          this.preorder.selectedColor(),
      purchaseType:   this.preorder.purchaseType(),
      network:        this.preorder.selectedNetwork(),
      deliveryAddress: {
        line1:    address.currentAddress,
        line2:    null,
        city:     address.city,
        county:   null,
        postcode: address.postcode,
      },
      timeAtAddress:    address.timeAtAddress,
      accountHolderName: payment.accountName,
      sortCode:         payment.sortCode,
      accountNumber:    payment.accountNumber,
      timeWithBank:     payment.timeWithBank,
      insurancePlan:    address.insurancePlan,
      insuranceBilling: address.insuranceBilling,
      marketingOptIn:   false,
    };

    this.preorder.createReservation(req).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);
        this.toast.success(`Priority Reservation confirmed! Ref: ${res.reservationRef}`);
        this.router.navigate(['/iphone-18-pro-preorder/confirmation'], {
          queryParams: { ref: res.reservationRef }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const apiErrors = err?.error?.errors as Record<string, string> | undefined;
        let errMsg: string;
        if (apiErrors && Object.keys(apiErrors).length > 0) {
          const messages = Object.values(apiErrors).join(' • ');
          errMsg = `Please fix the following: ${messages}`;
        } else if (err?.error?.message) {
          errMsg = err.error.message;
        } else {
          errMsg = err?.error?.error || 'Unable to place pre-booking reservation. Please try again.';
        }
        this.formError.set(errMsg);
        this.toast.error(errMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
