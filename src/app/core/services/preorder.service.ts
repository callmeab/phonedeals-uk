import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PreorderProduct,
  PreorderApiResponse,
  PreorderReservationRequest,
  PreorderReservationResult
} from '../models/preorder.model';

@Injectable({
  providedIn: 'root'
})
export class PreorderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Primary Selection Signals
  selectedModel = signal<'iPhone 18 Pro' | 'iPhone 18 Pro Max'>('iPhone 18 Pro');
  selectedColor = signal<'Black' | 'Silver' | 'Glacier' | 'Burgundy'>('Glacier');
  selectedStorage = signal<'256GB' | '512GB' | '1TB' | '2TB'>('256GB');
  purchaseType = signal<'outright' | 'contract'>('outright');
  selectedNetwork = signal<string>('SIM-Free');

  // Async State Signals
  variants = signal<PreorderProduct[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  lastReservation = signal<PreorderReservationResult | null>(null);

  // Available options
  readonly models = [
    {
      name: 'iPhone 18 Pro' as const,
      display: '6.3-inch',
      displayTitle: '6.3" Display',
      startingPrice: 1199.00
    },
    {
      name: 'iPhone 18 Pro Max' as const,
      display: '6.9-inch',
      displayTitle: '6.9" Display',
      startingPrice: 1299.00
    }
  ];

  readonly colors = [
    { name: 'Glacier' as const,  hex: '#C4D8E2', label: 'Glacier Blue', description: 'Exclusive frosty titanium finish' },
    { name: 'Burgundy' as const, hex: '#5B1E31', label: 'Deep Burgundy', description: 'Rich metallic cabernet' },
    { name: 'Silver' as const,   hex: '#E2E4E5', label: 'Natural Silver', description: 'Sleek brushed aerospace titanium' },
    { name: 'Black' as const,    hex: '#2C2C2E', label: 'Space Black', description: 'Stealth satin dark titanium' }
  ];

  readonly storages = ['256GB', '512GB', '1TB', '2TB'] as const;

  readonly networks = [
    { name: 'SIM-Free', label: 'SIM-Free / Unlocked', badge: 'Outright', note: 'Use with any network' },
    { name: 'EE', label: 'EE Network Deal', badge: '5G Max', note: 'Fastest UK 5G network' },
    { name: 'O2', label: 'O2 Priority Deal', badge: 'EU Roaming', note: 'Priority perks & rewards' },
    { name: 'Vodafone', label: 'Vodafone Deal', badge: 'Reliable', note: 'Global roaming & Evo' },
    { name: 'Three', label: 'Three Mobile Deal', badge: 'Best Value', note: 'Unlimited 5G data deals' }
  ];

  // Computed Properties
  currentVariant = computed(() => {
    return this.variants().find(
      v => v.model === this.selectedModel() &&
           v.storage === this.selectedStorage() &&
           v.color === this.selectedColor()
    );
  });

  currentPrice = computed(() => {
    const variant = this.currentVariant();
    if (variant) return variant.price_gbp;
    // Fallback baseline calculation
    const base = this.selectedModel() === 'iPhone 18 Pro' ? 1199 : 1299;
    const tierStep = { '256GB': 0, '512GB': 200, '1TB': 400, '2TB': 600 }[this.selectedStorage()] ?? 0;
    return base + tierStep;
  });

  depositAmount = computed(() => {
    return this.currentVariant()?.deposit_amount ?? 99.00;
  });

  // Active view angle: 1 (front), 2 (perspective), 3 (studio profile)
  selectedAngle = signal<1 | 2 | 3>(1);

  currentImagePath = computed(() => {
    const isMax = this.selectedModel() === 'iPhone 18 Pro Max';
    const modelSegment = isMax ? 'iphone-18-pro-max' : 'iphone-18-pro';
    
    // Exact case-sensitive mapping matching the files in public/iphone-18/
    let colorSegment = 'black';
    if (this.selectedColor() === 'Silver') colorSegment = 'silver';
    else if (this.selectedColor() === 'Glacier') colorSegment = 'Glacier';
    else if (this.selectedColor() === 'Burgundy') colorSegment = 'Burgundy';

    const angle = this.selectedAngle();
    const suffix = angle === 1 ? '' : `-${angle}`;

    return `/iphone-18/${modelSegment}-${colorSegment}${suffix}.webp`;
  });

  currentGalleryAngles = computed(() => {
    const isMax = this.selectedModel() === 'iPhone 18 Pro Max';
    const modelSegment = isMax ? 'iphone-18-pro-max' : 'iphone-18-pro';
    let colorSegment = 'black';
    if (this.selectedColor() === 'Silver') colorSegment = 'silver';
    else if (this.selectedColor() === 'Glacier') colorSegment = 'Glacier';
    else if (this.selectedColor() === 'Burgundy') colorSegment = 'Burgundy';

    return [
      { angle: 1 as const, path: `/iphone-18/${modelSegment}-${colorSegment}.webp`, label: 'Front' },
      { angle: 2 as const, path: `/iphone-18/${modelSegment}-${colorSegment}-2.webp`, label: 'Angle' },
      { angle: 3 as const, path: `/iphone-18/${modelSegment}-${colorSegment}-3.webp`, label: 'Profile' }
    ];
  });

  expectedImageFilename = computed(() => {
    const isMax = this.selectedModel() === 'iPhone 18 Pro Max';
    const modelSegment = isMax ? 'iphone-18-pro-max' : 'iphone-18-pro';
    let colorSegment = 'black';
    if (this.selectedColor() === 'Silver') colorSegment = 'silver';
    else if (this.selectedColor() === 'Glacier') colorSegment = 'Glacier';
    else if (this.selectedColor() === 'Burgundy') colorSegment = 'Burgundy';
    return `${modelSegment}-${colorSegment}.webp`;
  });

  // Fetch Variants from Edge API
  loadPreorderData(): Observable<PreorderApiResponse> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http.get<PreorderApiResponse>(`${this.apiUrl}/api/preorder/iphone18`).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data?.variants) {
          this.variants.set(res.data.variants);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load pre-order specifications.');
        return throwError(() => err);
      })
    );
  }

  // Create Reservation
  createReservation(req: PreorderReservationRequest): Observable<{ success: boolean; reservationRef: string; details: PreorderReservationResult }> {
    return this.http.post<{ success: boolean; reservationRef: string; details: PreorderReservationResult }>(
      `${this.apiUrl}/api/preorder/reserve`,
      req
    ).pipe(
      tap(res => {
        if (res.success && res.details) {
          this.lastReservation.set(res.details);
          // Persist to session storage for seamless reload on confirmation page
          if (typeof sessionStorage !== 'undefined') {
            try {
              sessionStorage.setItem('mobello_preorder_last', JSON.stringify(res.details));
            } catch (e) {
              console.warn('Could not save reservation to sessionStorage', e);
            }
          }
        }
      })
    );
  }

  // Lookup existing reservation by reference
  getReservationByRef(ref: string): Observable<{ success: boolean; data: PreorderReservationResult }> {
    return this.http.get<{ success: boolean; data: PreorderReservationResult }>(
      `${this.apiUrl}/api/preorder/reservation/${ref}`
    );
  }

  // Retrieve cached last reservation
  getLastReservation(): PreorderReservationResult | null {
    if (this.lastReservation()) {
      return this.lastReservation();
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('mobello_preorder_last');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.lastReservation.set(parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse cached reservation', e);
      }
    }
    return null;
  }
}
