import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AdminPreorderService,
  AdminPreorderItem,
  PreorderStats,
  PreorderStatus,
  PreorderFilterParams
} from '../../../core/services/admin-preorder.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-preorders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './preorders-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPreordersListComponent implements OnInit {
  private preorderService = inject(AdminPreorderService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Data Signals
  preorders = signal<AdminPreorderItem[]>([]);
  stats = signal<PreorderStats | null>(null);
  isLoading = signal<boolean>(false);
  isStatsLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);

  // Pagination Signals
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalItems = signal<number>(0);
  totalPages = signal<number>(1);

  // Filter Signals
  searchTerm = signal<string>('');
  selectedModel = signal<string>('all');
  selectedColor = signal<string>('all');
  selectedStorage = signal<string>('all');
  selectedStatus = signal<string>('all');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  // Search Debounce Subject
  private searchSubject = new Subject<string>();
  copiedField = signal<string | null>(null);

  // Available Status Options
  readonly statusOptions: { value: PreorderStatus; label: string }[] = [
    { value: 'new', label: 'New Booking' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'ready_for_collection', label: 'Ready for Collection' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadStats();
    this.loadPreorders();

    // Debounce search input by 300ms
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.loadPreorders();
      });
  }

  loadStats(): void {
    this.isStatsLoading.set(true);
    this.preorderService.getStats().subscribe({
      next: (res) => {
        this.isStatsLoading.set(false);
        if (res.success && res.data) {
          this.stats.set(res.data);
        }
      },
      error: () => {
        this.isStatsLoading.set(false);
      }
    });
  }

  loadPreorders(): void {
    this.isLoading.set(true);
    const params: PreorderFilterParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      model: this.selectedModel(),
      color: this.selectedColor(),
      storage: this.selectedStorage(),
      status: this.selectedStatus(),
      dateFrom: this.dateFrom(),
      dateTo: this.dateTo()
    };

    this.preorderService.getPreorders(params).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.preorders.set(res.data || []);
          this.totalItems.set(res.total || 0);
          this.totalPages.set(res.totalPages || 1);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Failed to load pre-orders');
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadPreorders();
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedModel.set('all');
    this.selectedColor.set('all');
    this.selectedStorage.set('all');
    this.selectedStatus.set('all');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.currentPage.set(1);
    this.loadPreorders();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadPreorders();
    }
  }

  exportCsv(): void {
    this.isExporting.set(true);
    const params: PreorderFilterParams = {
      search: this.searchTerm(),
      model: this.selectedModel(),
      color: this.selectedColor(),
      status: this.selectedStatus(),
      dateFrom: this.dateFrom(),
      dateTo: this.dateTo()
    };

    this.preorderService.exportCsv(params).subscribe({
      next: (blob) => {
        this.isExporting.set(false);
        this.preorderService.downloadBlob(blob);
        this.toast.success('Bookings exported to CSV successfully');
      },
      error: () => {
        this.isExporting.set(false);
        this.toast.error('Failed to export CSV');
      }
    });
  }

  openDetail(item: AdminPreorderItem): void {
    this.router.navigate(['/xk92-admin/preorders', item.id]);
  }

  copyToClipboard(text: string, label: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.copiedField.set(label);
    this.toast.info('Copied ' + label + ' to clipboard');
    setTimeout(() => {
      this.copiedField.set(null);
    }, 2000);
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ready_for_collection':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusLabel(status: string): string {
    const opt = this.statusOptions.find((o) => o.value === (status || '').toLowerCase());
    return opt ? opt.label : status;
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
}
