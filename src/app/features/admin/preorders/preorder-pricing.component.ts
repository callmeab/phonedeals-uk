import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminPreorderService,
  PreorderProductVariant,
  PriceHistoryItem,
  BulkPriceUpdatePayload,
  UpdateProductPricePayload
} from '../../../core/services/admin-preorder.service';
import { ToastService } from '../../../core/services/toast.service';

interface EditFormState {
  id: number;
  model: string;
  storage: string;
  color: string;
  price_gbp: number;
  deposit_amount: number;
  stock_status: 'available' | 'limited' | 'sold_out';
}

@Component({
  selector: 'app-preorder-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './preorder-pricing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreorderPricingComponent implements OnInit {
  private preorderService = inject(AdminPreorderService);
  private toast = inject(ToastService);

  // Data Signals
  variants = signal<PreorderProductVariant[]>([]);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Filters
  filterModel = signal<string>('all');
  filterColor = signal<string>('all');
  filterStockStatus = signal<string>('all');

  // Selection for bulk actions
  selectedIds = signal<number[]>([]);

  // Single Edit Modal State
  editingItem = signal<EditFormState | null>(null);

  // Bulk Edit Modal State
  showBulkModal = signal<boolean>(false);
  bulkAdjustmentType = signal<'flat' | 'fixed'>('flat');
  bulkAdjustmentAmount = signal<number | null>(null);
  bulkFixedPrice = signal<number | null>(null);
  bulkDeposit = signal<number | null>(null);
  bulkStockStatus = signal<string>('keep');

  // History Modal State
  historyVariant = signal<PreorderProductVariant | null>(null);
  historyRecords = signal<PriceHistoryItem[]>([]);
  isLoadingHistory = signal<boolean>(false);

  // Inline quick-editing tracker (variant ID currently undergoing inline edit)
  inlineEditingId = signal<number | null>(null);
  inlinePrice = signal<number | null>(null);
  inlineDeposit = signal<number | null>(null);
  inlineStockStatus = signal<string>('available');

  // Computed Groups
  proVariants = computed(() => {
    return this.filteredVariants().filter(v => v.model === 'iPhone 18 Pro');
  });

  proMaxVariants = computed(() => {
    return this.filteredVariants().filter(v => v.model === 'iPhone 18 Pro Max');
  });

  filteredVariants = computed(() => {
    let list = this.variants();
    const m = this.filterModel();
    const c = this.filterColor();
    const s = this.filterStockStatus();

    if (m !== 'all') {
      list = list.filter(v => v.model === m);
    }
    if (c !== 'all') {
      list = list.filter(v => v.color === c);
    }
    if (s !== 'all') {
      list = list.filter(v => v.stock_status === s);
    }
    return list;
  });

  // Selection Computeds
  isAllSelected = computed(() => {
    const list = this.filteredVariants();
    if (list.length === 0) return false;
    const selected = this.selectedIds();
    return list.every(v => selected.includes(v.id));
  });

  selectedCount = computed(() => this.selectedIds().length);

  ngOnInit(): void {
    this.loadVariants();
  }

  loadVariants(): void {
    this.isLoading.set(true);
    this.preorderService.getPreorderProducts().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.variants.set(res.data);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Failed to load pre-order product variants.');
        console.error('Failed to load variants', err);
      }
    });
  }

  // --- Selection Logic ---
  toggleSelectAll(): void {
    const list = this.filteredVariants();
    if (this.isAllSelected()) {
      // Unselect all currently filtered
      const filteredIds = new Set(list.map(v => v.id));
      this.selectedIds.update(current => current.filter(id => !filteredIds.has(id)));
    } else {
      // Select all currently filtered
      const newIds = new Set([...this.selectedIds(), ...list.map(v => v.id)]);
      this.selectedIds.set(Array.from(newIds));
    }
  }

  toggleSelectRow(id: number): void {
    this.selectedIds.update(current => {
      if (current.includes(id)) {
        return current.filter(x => x !== id);
      } else {
        return [...current, id];
      }
    });
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  selectGroup(model: string): void {
    const groupItems = this.variants().filter(v => v.model === model);
    const groupIds = groupItems.map(v => v.id);
    const current = new Set(this.selectedIds());
    const allGroupSelected = groupIds.every(id => current.has(id));

    if (allGroupSelected) {
      this.selectedIds.update(c => c.filter(id => !groupIds.includes(id)));
    } else {
      groupIds.forEach(id => current.add(id));
      this.selectedIds.set(Array.from(current));
    }
  }

  isGroupAllSelected(model: string): boolean {
    const groupItems = this.variants().filter(v => v.model === model);
    if (groupItems.length === 0) return false;
    const selected = new Set(this.selectedIds());
    return groupItems.every(v => selected.has(v.id));
  }

  // --- Inline Editing Logic ---
  startInlineEdit(variant: PreorderProductVariant): void {
    this.inlineEditingId.set(variant.id);
    this.inlinePrice.set(variant.price_gbp);
    this.inlineDeposit.set(variant.deposit_amount);
    this.inlineStockStatus.set(variant.stock_status);
  }

  cancelInlineEdit(): void {
    this.inlineEditingId.set(null);
    this.inlinePrice.set(null);
    this.inlineDeposit.set(null);
  }

  saveInlineEdit(variant: PreorderProductVariant): void {
    const price = this.inlinePrice();
    const deposit = this.inlineDeposit();
    const status = this.inlineStockStatus() as 'available' | 'limited' | 'sold_out';

    if (price === null || isNaN(price) || price <= 0) {
      this.toast.error('Price must be a valid positive amount.');
      return;
    }

    if (deposit === null || isNaN(deposit) || deposit < 0) {
      this.toast.error('Deposit must be a valid non-negative amount.');
      return;
    }

    if (deposit >= price) {
      this.toast.error(`Deposit (£${deposit.toFixed(2)}) must be less than retail price (£${price.toFixed(2)}).`);
      return;
    }

    this.isSaving.set(true);
    const payload: UpdateProductPricePayload = {
      price_gbp: price,
      deposit_amount: deposit,
      stock_status: status
    };

    this.preorderService.updatePreorderProductPrice(variant.id, payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.inlineEditingId.set(null);
        if (res.success && res.data) {
          this.toast.success(res.message || 'Price updated successfully.');
          this.updateVariantInList(res.data);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        const errMsg = err?.error?.error || 'Failed to update price.';
        this.toast.error(errMsg);
      }
    });
  }

  // --- Modal Edit Logic ---
  openEditModal(variant: PreorderProductVariant): void {
    this.editingItem.set({
      id: variant.id,
      model: variant.model,
      storage: variant.storage,
      color: variant.color,
      price_gbp: variant.price_gbp,
      deposit_amount: variant.deposit_amount,
      stock_status: variant.stock_status
    });
  }

  closeEditModal(): void {
    this.editingItem.set(null);
  }

  saveModalEdit(): void {
    const item = this.editingItem();
    if (!item) return;

    if (!item.price_gbp || item.price_gbp <= 0) {
      this.toast.error('Please enter a valid retail price greater than £0.');
      return;
    }

    if (item.deposit_amount === undefined || item.deposit_amount === null || item.deposit_amount < 0) {
      this.toast.error('Please enter a valid non-negative deposit amount.');
      return;
    }

    if (item.deposit_amount >= item.price_gbp) {
      this.toast.error(`Deposit amount (£${item.deposit_amount.toFixed(2)}) must be strictly less than retail price (£${item.price_gbp.toFixed(2)}).`);
      return;
    }

    this.isSaving.set(true);
    const payload: UpdateProductPricePayload = {
      price_gbp: item.price_gbp,
      deposit_amount: item.deposit_amount,
      stock_status: item.stock_status
    };

    this.preorderService.updatePreorderProductPrice(item.id, payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.closeEditModal();
        if (res.success && res.data) {
          this.toast.success(res.message || 'Variant updated successfully.');
          this.updateVariantInList(res.data);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        const errMsg = err?.error?.error || 'Failed to update variant.';
        this.toast.error(errMsg);
      }
    });
  }

  // --- Bulk Edit Logic ---
  openBulkModal(): void {
    if (this.selectedIds().length === 0) {
      this.toast.warning('Please select at least one variant to bulk edit.');
      return;
    }
    this.bulkAdjustmentType.set('flat');
    this.bulkAdjustmentAmount.set(null);
    this.bulkFixedPrice.set(null);
    this.bulkDeposit.set(null);
    this.bulkStockStatus.set('keep');
    this.showBulkModal.set(true);
  }

  closeBulkModal(): void {
    this.showBulkModal.set(false);
  }

  applyBulkAdjustmentQuick(amount: number): void {
    this.bulkAdjustmentType.set('flat');
    this.bulkAdjustmentAmount.set(amount);
  }

  saveBulkEdit(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;

    const payload: BulkPriceUpdatePayload = { ids };

    if (this.bulkAdjustmentType() === 'flat') {
      const adj = this.bulkAdjustmentAmount();
      if (adj === null || isNaN(adj)) {
        this.toast.error('Please specify a price adjustment amount (e.g. +50 or -30).');
        return;
      }
      payload.adjustment = adj;
    } else {
      const fixed = this.bulkFixedPrice();
      if (fixed === null || isNaN(fixed) || fixed <= 0) {
        this.toast.error('Please enter a valid positive price.');
        return;
      }
      payload.price_gbp = fixed;
    }

    if (this.bulkDeposit() !== null && !isNaN(this.bulkDeposit()!)) {
      if (this.bulkDeposit()! < 0) {
        this.toast.error('Deposit cannot be negative.');
        return;
      }
      payload.deposit_amount = this.bulkDeposit()!;
    }

    if (this.bulkStockStatus() !== 'keep') {
      payload.stock_status = this.bulkStockStatus() as 'available' | 'limited' | 'sold_out';
    }

    this.isSaving.set(true);
    this.preorderService.bulkUpdatePrices(payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.closeBulkModal();
        this.toast.success(res.message || `Updated ${res.updatedCount} variants.`);
        this.clearSelection();
        this.loadVariants(); // Refresh all live records
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.error || 'Failed to apply bulk update.';
        this.toast.error(msg);
      }
    });
  }

  // --- Price History Modal Logic ---
  openHistoryModal(variant: PreorderProductVariant): void {
    this.historyVariant.set(variant);
    this.historyRecords.set([]);
    this.isLoadingHistory.set(true);

    this.preorderService.getPriceHistory(variant.id).subscribe({
      next: (res) => {
        this.isLoadingHistory.set(false);
        if (res.success && res.data) {
          this.historyRecords.set(res.data);
        }
      },
      error: (err) => {
        this.isLoadingHistory.set(false);
        this.toast.error('Failed to load price history.');
        console.error('History load error', err);
      }
    });
  }

  closeHistoryModal(): void {
    this.historyVariant.set(null);
    this.historyRecords.set([]);
  }

  // --- Helpers ---
  private updateVariantInList(updated: PreorderProductVariant): void {
    this.variants.update(list => list.map(v => v.id === updated.id ? updated : v));
  }

  getColorHex(color: string): string {
    switch (color) {
      case 'Glacier': return '#C4D8E2';
      case 'Burgundy': return '#5B1E31';
      case 'Silver': return '#E2E4E5';
      case 'Black': return '#2C2C2E';
      default: return '#94A3B8';
    }
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return 'Original Launch';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
