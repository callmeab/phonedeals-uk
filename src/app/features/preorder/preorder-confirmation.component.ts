import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PreorderService } from '../../core/services/preorder.service';
import { SeoService } from '../../core/services/seo.service';
import { PreorderReservationResult } from '../../core/models/preorder.model';

@Component({
  selector: 'app-preorder-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './preorder-confirmation.component.html',
  styleUrl: './preorder-confirmation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreorderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private preorderService = inject(PreorderService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  reservation = signal<PreorderReservationResult | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.setPageTitle('Reservation Confirmed | iPhone 18 Pre-Order UK');

    const ref = this.route.snapshot.queryParamMap.get('ref');
    const cached = this.preorderService.getLastReservation();

    if (cached && (!ref || cached.reservationRef === ref)) {
      this.reservation.set(cached);
      this.isLoading.set(false);
      return;
    }

    if (ref) {
      this.preorderService.getReservationByRef(ref).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            const d = res.data as any;
            this.reservation.set({
              id: d.id,
              reservationRef: d.reservation_ref || d.reservationRef,
              customerName: d.customer_name || d.customerName,
              customerEmail: d.customer_email || d.customerEmail,
              customerPhone: d.customer_phone || d.customerPhone,
              model: d.model,
              storage: d.storage,
              color: d.color,
              purchaseType: d.purchase_type || d.purchaseType || 'outright',
              network: d.network || 'SIM-Free',
              priceGbp: Number(d.price_gbp ?? d.priceGbp ?? 1199),
              depositAmount: Number(d.deposit_amount ?? d.depositAmount ?? 99),
              imagePath: d.image_path || d.imagePath || '',
              releaseDate: d.release_date || d.releaseDate || '2026-09-18'
            });
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set('Could not find reservation details. Please check your confirmation email.');
        }
      });
    } else {
      this.isLoading.set(false);
      this.error.set('No reservation reference provided.');
    }
  }

  printPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }
}
