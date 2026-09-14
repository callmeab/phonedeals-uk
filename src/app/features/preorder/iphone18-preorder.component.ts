import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PreorderService } from '../../core/services/preorder.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';
import { CanDeactivatePreorder } from './preorder.guard';
import {
  ukPhoneValidator,
  sortCodeValidator,
  accountNumberValidator,
  ageValidator
} from '../../core/utils/form-validators';
import { PreorderReservationRequest } from '../../core/models/preorder.model';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-iphone18-preorder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './iphone18-preorder.component.html',
  styleUrl: './iphone18-preorder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Iphone18PreorderComponent implements OnInit, OnDestroy, CanDeactivatePreorder {
  public preorder = inject(PreorderService);
  private seo = inject(SeoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Multi-step form
  reservationForm!: FormGroup;
  currentStep = signal<1 | 2 | 3>(1);
  isSubmitting = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  formError = signal<string | null>(null);
  stepAnimating = signal<boolean>(false);

  // Variant selection completed flag
  variantSelected = signal<boolean>(false);

  // Image fallback tracking
  imageLoadError = signal<boolean>(false);
  heroBannerError = signal<boolean>(false);

  // Countdown timer
  countdown = signal<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private timerInterval: any = null;

  // Release Date: September 18, 2026, 08:00:00 UK BST
  private readonly targetReleaseDate = new Date('2026-09-18T08:00:00+01:00').getTime();

  // Address & Insurance options (same as checkout)
  readonly timeAtAddressOptions = ['<1 Year', '1-2 Years', '2-5 Years', '5+ Years'];
  readonly timeWithBankOptions   = ['<1 Year', '1-2 Years', '2-5 Years', '5-10 Years', '10+ Years'];

  // Insurance feature lists (same as checkout)
  readonly liteIncluded  = ['Accidental Damage', 'Breakdown', 'Accessories up to £300', 'Worldwide Cover', '24/7 Expert Support'];
  readonly liteExcluded  = ['Excess Pay', 'Unpaid Premium Claims', 'Cosmetic Damage', 'Theft', 'Loss'];
  readonly completeIncluded = ['Accidental Damage', 'Breakdown', 'Accessories up to £300', 'Worldwide Cover', '24/7 Expert Support', 'Theft', 'Loss'];
  readonly completeExcluded = ['Excess Pay', 'Cosmetic Damage', 'Theft/Loss While Unattended'];

  // Specs highlight computed
  currentSpecs = computed(() => {
    const isMax = this.preorder.selectedModel() === 'iPhone 18 Pro Max';
    return {
      screen: isMax ? '6.9" Super Retina XDR' : '6.3" Super Retina XDR',
      chip: 'Apple A20 Pro (2nm) with 6-core GPU',
      camera: isMax ? '48MP Quad-Pixel + 10x Periscope Telephoto' : '48MP Quad-Pixel + 5x Telephoto',
      chassis: 'Grade 5 Aerospace Micro-Titanium',
      battery: isMax ? 'Up to 33 hrs video playback' : 'Up to 29 hrs video playback'
    };
  });

  ngOnInit(): void {
    this.initForm();
    this.initSeo();
    this.initCountdown();

    // Fetch live variants from edge D1 API
    this.preorder.loadPreorderData().subscribe({
      error: () => {
        // Service handles local fallback baseline automatically
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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

  // ── Sort code auto-format (identical to checkout) ─────────────────────────

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

  // ── Guard interface ────────────────────────────────────────────────────

  hasUnsavedChanges(): boolean {
    return (this.reservationForm.dirty || this.currentStep() > 1 || this.variantSelected()) && !this.isSubmitted();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your pre-booking data will be lost.';
    }
  }

  // ── SEO ───────────────────────────────────────────────────────────────────

  private initSeo(): void {
    this.seo.setPageTitle('iPhone 18 Pro & Pro Max Pre-Order UK | Reserve Now');
    this.seo.setMetaTags({
      description: 'Reserve the Apple iPhone 18 Pro & iPhone 18 Pro Max ahead of UK release. Lock in priority queue allocation with a £99 100% refundable deposit.',
      keywords: 'iPhone 18 Pro pre order, iPhone 18 Pro Max UK, iPhone 18 reserve, Apple A20 Pro, PhoneDeals UK, Mobello',
      ogTitle: 'Reserve the iPhone 18 Pro & Pro Max in the UK | Mobello.UK',
      ogDescription: 'Pre-order the iPhone 18 Pro Series with Apple A20 Pro chip. Choose Glacier Blue, Burgundy, Silver, or Black. 100% refundable deposit.',
      ogImage: '/iphone-18/iphone-18-pro.webp',
      ogType: 'product'
    });
    this.seo.setCanonicalUrl('/iphone-18-pro-preorder');

    // Schema.org Structured Data
    this.seo.setStructuredData({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'Apple iPhone 18 Pro Series',
      image: [
        'https://mobello.uk/iphone-18/iphone-18-pro.webp',
        'https://mobello.uk/iphone-18/iphone-18-pro-max-Glacier.webp'
      ],
      description: 'Pre-booking for Apple iPhone 18 Pro and iPhone 18 Pro Max featuring Apple A20 Pro (2nm) chip.',
      brand: {
        '@type': 'Brand',
        name: 'Apple'
      },
      offers: {
        '@type': 'Offer',
        url: 'https://mobello.uk/iphone-18-pro-preorder',
        priceCurrency: 'GBP',
        price: '1199.00',
        availability: 'https://schema.org/PreOrder',
        priceValidUntil: '2026-09-18'
      }
    });
  }

  // ── Countdown ────────────────────────────────────────────────────────────

  private initCountdown(): void {
    this.updateCountdown();
    if (isPlatformBrowser(this.platformId)) {
      this.timerInterval = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  private updateCountdown(): void {
    const now = Date.now();
    const diff = Math.max(0, this.targetReleaseDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    this.countdown.set({ days, hours, minutes, seconds });
  }

  // ── Variant selection helpers ──────────────────────────────────────────────

  selectModel(model: 'iPhone 18 Pro' | 'iPhone 18 Pro Max'): void {
    this.preorder.selectedModel.set(model);
    this.imageLoadError.set(false);
  }

  selectColor(color: 'Black' | 'Silver' | 'Glacier' | 'Burgundy'): void {
    this.preorder.selectedColor.set(color);
    this.imageLoadError.set(false);
  }

  selectAngle(angle: 1 | 2 | 3): void {
    this.preorder.selectedAngle.set(angle);
    this.imageLoadError.set(false);
  }

  selectStorage(storage: '256GB' | '512GB' | '1TB' | '2TB'): void {
    this.preorder.selectedStorage.set(storage);
  }

  selectPurchaseType(type: 'outright' | 'contract'): void {
    this.preorder.purchaseType.set(type);
    if (type === 'outright') {
      this.preorder.selectedNetwork.set('SIM-Free');
    } else if (this.preorder.selectedNetwork() === 'SIM-Free') {
      this.preorder.selectedNetwork.set('EE');
    }
  }

  selectNetwork(net: string): void {
    this.preorder.selectedNetwork.set(net);
  }

  // Called when user clicks "Continue to Reservation" after variant selection
  proceedToForm(): void {
    this.variantSelected.set(true);
    // Scroll to the form area
    setTimeout(() => {
      const el = document.getElementById('preorder-checkout-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Image error handling
  onImageError(): void {
    this.imageLoadError.set(true);
  }

  onHeroError(): void {
    this.heroBannerError.set(true);
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
