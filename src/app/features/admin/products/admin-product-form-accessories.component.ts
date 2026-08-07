import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../core/services/toast.service';

function frontendSlugify(text: string): string {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

interface AccessoryVariant {
  colour: string;
  compatibility: string;
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  images: string[];
}

/** CATEGORY_ID for Mobile Accessories in the DB */
const ACCESSORIES_CATEGORY_ID = 3;

@Component({
  selector: 'app-admin-product-form-accessories',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12 max-w-4xl mx-auto">

      <!-- Back Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <a routerLink="/xk92-admin/products/new" class="hover:text-accent transition-colors">← Change Category</a>
        <span>/</span>
        <span class="font-semibold text-emerald-700">Mobile Accessories</span>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-xl">🎧</span>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">New Mobile Accessory</h1>
          </div>
          <p class="text-sm text-gray-500 ml-12">Add a new accessory to your catalog (Cases, Chargers, Cables, etc.)</p>
        </div>
        <a routerLink="/xk92-admin/products" class="text-sm font-medium text-gray-500 hover:text-gray-700 underline focus:outline-none">
          Cancel &amp; Return
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">

        <!-- Basic Info -->
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div class="p-6 space-y-6">

            <!-- Name & Type Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="acc-name" class="block text-sm font-medium text-gray-700">Product Name <span class="text-red-500">*</span></label>
                <input type="text" id="acc-name" formControlName="name"
                  placeholder="e.g. Spigen Ultra Hybrid Case"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                  [class.border-red-300]="isFieldInvalid('name')"
                >
                @if (isFieldInvalid('name')) {
                  <p class="mt-1 text-xs text-red-600">Product name is required.</p>
                }
              </div>

              <div>
                <label for="acc-type" class="block text-sm font-medium text-gray-700">Accessory Type <span class="text-red-500">*</span></label>
                <select id="acc-type" formControlName="accessory_type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border bg-white"
                  [class.border-red-300]="isFieldInvalid('accessory_type')"
                >
                  <option value="" disabled>Select type...</option>
                  <option value="Case">Case / Cover</option>
                  <option value="Charger">Charger</option>
                  <option value="Cable">Cable</option>
                  <option value="Screen Protector">Screen Protector</option>
                  <option value="Earphones">Earphones / Headphones</option>
                  <option value="Power Bank">Power Bank</option>
                  <option value="Mount">Car / Desk Mount</option>
                  <option value="Other">Other</option>
                </select>
                @if (isFieldInvalid('accessory_type')) {
                  <p class="mt-1 text-xs text-red-600">Accessory type is required.</p>
                }
              </div>
            </div>

            <!-- Slug -->
            <div>
              <label for="acc-slug" class="block text-sm font-medium text-gray-700">URL Slug <span class="text-red-500">*</span></label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  site.com/products/
                </span>
                <input type="text" id="acc-slug" formControlName="slug" (input)="onSlugManuallyEdited()"
                  class="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
                  [class.border-red-300]="isFieldInvalid('slug')"
                >
              </div>
              @if (isFieldInvalid('slug')) {
                <p class="mt-1 text-xs text-red-600">Valid URL slug required (lowercase, numbers, hyphens).</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label for="acc-description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="acc-description" formControlName="description" rows="4"
                placeholder="Product details, features, material, compatibility notes..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border resize-y"
              ></textarea>
            </div>

            <!-- Toggles -->
            <div class="flex flex-col sm:flex-row gap-8 pt-2">
              <div class="flex items-center">
                <input id="acc-is_active" type="checkbox" formControlName="is_active" class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded">
                <label for="acc-is_active" class="ml-2 block text-sm text-gray-900 font-medium">Active (Visible on site)</label>
              </div>
              <div class="flex items-center">
                <input id="acc-is_featured" type="checkbox" formControlName="is_featured" class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded">
                <label for="acc-is_featured" class="ml-2 block text-sm text-gray-900 font-medium">Featured (Pinned to top)</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Colours & Compatibility -->
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-900">Step 1 — Colours &amp; Compatibility</h3>
            <p class="text-sm text-gray-500 mt-1">Colours aur phone models add karein — variant matrix auto-generate hogi.</p>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Colours -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Available Colours</label>
              <p class="text-xs text-gray-500 mb-3">Press Enter or comma to add (e.g., Black, Clear, Navy Blue).</p>
              <div class="flex flex-wrap gap-2 mb-3">
                @for (colour of colours(); track colour) {
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    {{ colour }}
                    <button type="button" (click)="removeChip('colour', colour)"
                      class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-emerald-500 hover:bg-emerald-200 focus:outline-none">
                      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                }
              </div>
              <input type="text" placeholder="Add colour..."
                (keydown)="onChipInput($event, 'colour')"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
              >
              <p class="text-xs text-gray-400 mt-1">e.g. Black, Clear, Navy, Red, Midnight</p>
            </div>

            <!-- Compatibility -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Compatibility</label>
              <p class="text-xs text-gray-500 mb-3">Press Enter or comma to add (e.g., iPhone 15 Pro).</p>
              <div class="flex flex-wrap gap-2 mb-3">
                @for (compat of compatibility(); track compat) {
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {{ compat }}
                    <button type="button" (click)="removeChip('compat', compat)"
                      class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 focus:outline-none">
                      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                }
              </div>
              <input type="text" placeholder="Add phone model..."
                (keydown)="onChipInput($event, 'compat')"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3 border"
              >
              <p class="text-xs text-gray-400 mt-1">e.g. iPhone 15 Pro, iPhone 15 Pro Max, Samsung S24</p>
            </div>
          </div>

          <!-- Generate Button -->
          @if (colours().length > 0 || compatibility().length > 0) {
            <div class="px-6 pb-6">
              <button type="button" (click)="generateVariantMatrix()"
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors focus:outline-none">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate Variant Matrix ({{ colours().length }} colour × {{ compatibility().length || 1 }} compatibility)
              </button>
            </div>
          }
        </div>

        <!-- Variant Matrix -->
        @if (variantMatrix().length > 0) {
          <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Step 2 — Variant Pricing &amp; Stock</h3>
                <p class="text-sm text-gray-500 mt-1">Har variant ke liye price, stock, aur SKU set karein.</p>
              </div>
              <span class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {{ variantMatrix().length }} variants
              </span>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Colour</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Compatibility</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (£)</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sale Price (£)</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  @for (variant of variantMatrix(); track $index) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {{ variant.colour }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-gray-600 text-xs">{{ variant.compatibility }}</td>
                      <td class="px-4 py-3">
                        <input type="number" min="0" step="0.01" [value]="variant.price"
                          (change)="updateVariantField(variant, 'price', +$any($event.target).value)"
                          class="w-24 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-1.5 px-2 border"
                        >
                      </td>
                      <td class="px-4 py-3">
                        <input type="number" min="0" step="0.01" [value]="variant.salePrice ?? ''"
                          (change)="onSalePriceChange($event, variant)"
                          placeholder="—"
                          class="w-24 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-1.5 px-2 border"
                        >
                      </td>
                      <td class="px-4 py-3">
                        <input type="number" min="0" step="1" [value]="variant.stock"
                          (change)="updateVariantField(variant, 'stock', +$any($event.target).value)"
                          class="w-20 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-1.5 px-2 border"
                        >
                      </td>
                      <td class="px-4 py-3">
                        <input type="text" [value]="variant.sku ?? ''"
                          (change)="updateVariantField(variant, 'sku', $any($event.target).value || null)"
                          placeholder="—"
                          class="w-28 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-1.5 px-2 border"
                        >
                      </td>
                      <td class="px-4 py-3 text-center">
                        <input type="checkbox" [checked]="variant.isActive"
                          (change)="updateVariantField(variant, 'isActive', $any($event.target).checked)"
                          class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                        >
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Error Banner -->
        @if (submitError()) {
          <div class="rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ submitError() }}</h3>
              </div>
            </div>
          </div>
        }

        <!-- Submit Bar -->
        <div class="pt-5 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" routerLink="/xk92-admin/products/new"
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors">
            ← Back to Categories
          </button>
          <button type="submit" [disabled]="isSubmitting()"
            class="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              Save Accessory
            }
          </button>
        </div>

      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductFormAccessoriesComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    accessory_type: ['', Validators.required],
    description: [''],
    is_featured: [false],
    is_active: [true],
  });

  colours = signal<string[]>([]);
  compatibility = signal<string[]>([]);
  variantMatrix = signal<AccessoryVariant[]>([]);
  manualSlug = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  private submitted = false;

  constructor() {
    this.form.get('name')?.valueChanges.pipe(takeUntilDestroyed()).subscribe(name => {
      if (!this.manualSlug() && name) {
        this.form.patchValue({ slug: frontendSlugify(name) }, { emitEvent: false });
      }
    });
  }

  canDeactivate(): boolean {
    if (this.form.dirty && !this.submitted) {
      return window.confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  onSlugManuallyEdited() {
    this.manualSlug.set(true);
  }

  onChipInput(event: KeyboardEvent, type: 'colour' | 'compat') {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value) {
        if (type === 'colour' && !this.colours().includes(value)) {
          this.colours.update(v => [...v, value]);
        } else if (type === 'compat' && !this.compatibility().includes(value)) {
          this.compatibility.update(v => [...v, value]);
        }
        input.value = '';
        this.form.markAsDirty();
      }
    }
  }

  removeChip(type: 'colour' | 'compat', value: string) {
    if (type === 'colour') {
      this.colours.update(v => v.filter(i => i !== value));
      this.variantMatrix.update(m => m.filter(v => v.colour !== value));
    } else {
      this.compatibility.update(v => v.filter(i => i !== value));
      this.variantMatrix.update(m => m.filter(v => v.compatibility !== value));
    }
    this.form.markAsDirty();
  }

  generateVariantMatrix() {
    const colours = this.colours();
    const compats = this.compatibility().length > 0 ? this.compatibility() : ['Universal'];
    const existing = this.variantMatrix();

    const newMatrix: AccessoryVariant[] = [];
    for (const colour of colours) {
      for (const compat of compats) {
        const prev = existing.find(v => v.colour === colour && v.compatibility === compat);
        newMatrix.push({
          colour,
          compatibility: compat,
          price: prev?.price ?? 0,
          salePrice: prev?.salePrice ?? null,
          stock: prev?.stock ?? 0,
          sku: prev?.sku ?? null,
          isActive: prev?.isActive ?? true,
          images: prev?.images ?? [],
        });
      }
    }
    this.variantMatrix.set(newMatrix);
    this.form.markAsDirty();
  }

  updateVariantField(variant: AccessoryVariant, field: keyof AccessoryVariant, value: any) {
    this.variantMatrix.update(matrix =>
      matrix.map(v => v === variant ? { ...v, [field]: value } : v)
    );
    this.form.markAsDirty();
  }

  onSalePriceChange(event: Event, variant: AccessoryVariant) {
    const val = (event.target as HTMLInputElement).value;
    this.updateVariantField(variant, 'salePrice', val ? +val : null);
  }

  onSubmit() {
    this.submitted = true;
    this.submitError.set(null);

    Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());

    if (this.form.invalid) {
      this.submitError.set('Please fill out all required fields correctly.');
      this.submitted = false;
      return;
    }

    if (this.colours().length === 0) {
      this.submitError.set('Kam se kam ek colour add karein aur variant matrix generate karein.');
      this.submitted = false;
      return;
    }

    if (this.variantMatrix().length === 0) {
      this.submitError.set('"Generate Variant Matrix" button press karein pehle.');
      this.submitted = false;
      return;
    }

    this.isSubmitting.set(true);

    const { accessory_type, ...baseForm } = this.form.value as any;

    const payload = {
      ...baseForm,
      category_id: ACCESSORIES_CATEGORY_ID,
      colours: this.colours(),
      // Reuse storage_options to store accessory_type for this category
      storage_options: [accessory_type],
      // Reuse sim_types to store compatibility list
      sim_types: this.compatibility(),
      variants: this.variantMatrix(),
    };

    this.api.post('/api/admin/products', payload).subscribe({
      next: () => {
        this.toast.success('Accessory saved successfully!');
        this.router.navigate(['/xk92-admin/products']);
      },
      error: (err: Error) => {
        this.submitError.set(err.message || 'Failed to save accessory. Please try again.');
        this.isSubmitting.set(false);
        this.submitted = false;
      }
    });
  }
}
