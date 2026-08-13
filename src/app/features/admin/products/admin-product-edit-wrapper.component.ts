import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminProductFormComponent } from './admin-product-form.component';
import { AdminProductFormAccessoriesComponent } from './admin-product-form-accessories.component';
import { AdminProductFormIpadComponent } from './admin-product-form-ipad.component';
import { AdminProductFormWatchesComponent } from './admin-product-form-watches.component';

@Component({
  selector: 'app-admin-product-edit-wrapper',
  standalone: true,
  imports: [
    CommonModule, 
    LoadingSpinnerComponent,
    AdminProductFormComponent,
    AdminProductFormAccessoriesComponent,
    AdminProductFormIpadComponent,
    AdminProductFormWatchesComponent
  ],
  template: `
    @if (isLoading()) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-32 flex flex-col items-center justify-center">
        <app-loading-spinner size="lg"></app-loading-spinner>
        <p class="mt-4 text-sm text-gray-500 font-medium">Loading product routing...</p>
      </div>
    } @else {
      @if (categoryId() === 6) {
        <app-admin-product-form-accessories #formRef></app-admin-product-form-accessories>
      } @else if (categoryId() === 7) {
        <app-admin-product-form-ipad #formRef></app-admin-product-form-ipad>
      } @else if (categoryId() === 8) {
        <app-admin-product-form-watches #formRef></app-admin-product-form-watches>
      } @else {
        <app-admin-product-form #formRef></app-admin-product-form>
      }
    }
  `
})
export class AdminProductEditWrapperComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  
  isLoading = signal(true);
  categoryId = signal<number | null>(null);

  @ViewChild('formRef') formRef: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<{ success: boolean; data: Product }>(`/api/admin/products/${id}`).subscribe({
        next: (res) => {
          if (res.data) {
            this.categoryId.set(res.data.category_id);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  hasUnsavedChanges() {
    if (this.formRef && this.formRef.form) {
      return this.formRef.form.dirty && !this.formRef.submitted;
    }
    return false;
  }
}
