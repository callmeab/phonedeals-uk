import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean | number;
}

// The ID of the row currently being edited inline (null = none).
// A string key 'new' signals the unsaved "Add Category" row.
type EditingKey = number | 'new' | null;

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12 max-w-4xl">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p class="text-sm text-gray-500 mt-1">Manage product categories for the storefront.</p>
        </div>
        <button
          (click)="addNewRow()"
          [disabled]="editingKey() !== null"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Category
        </button>
      </div>

      <!-- ⚠️ Warning Banner -->
      <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <svg class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <p class="text-sm font-semibold text-amber-800">Heads up — this site currently supports iPhone and Samsung categories.</p>
          <p class="text-sm text-amber-700 mt-0.5">
            Adding a new category here requires corresponding <strong>frontend route configuration</strong> (new listing page, navigation link, and header menu entry) to be effective on the storefront.
          </p>
        </div>
      </div>

      <!-- Table -->
      @if (isLoading()) {
        <div class="flex justify-center py-20 bg-white rounded-xl border border-gray-100">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Order</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Status</th>
                <th scope="col" class="relative px-6 py-3 w-32"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">

              <!-- Existing category rows -->
              @for (cat of categories(); track cat.id) {
                <tr [class.bg-blue-50]="editingKey() === cat.id">

                  @if (editingKey() === cat.id) {
                    <!-- ✏️ EDIT ROW -->
                    <td class="px-6 py-3">
                      <input [formControl]="editForm.controls.name" type="text"
                        class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                        [class.border-red-400]="editForm.controls.name.invalid && editForm.controls.name.touched"
                        placeholder="Category name"
                      >
                      @if (editForm.controls.name.invalid && editForm.controls.name.touched) {
                        <p class="mt-0.5 text-xs text-red-600">Name is required</p>
                      }
                    </td>
                    <td class="px-6 py-3">
                      <span class="text-sm text-gray-400 font-mono">{{ cat.slug }}</span>
                      <p class="text-xs text-gray-400 mt-0.5">Slug cannot be changed</p>
                    </td>
                    <td class="px-6 py-3">
                      <input [formControl]="editForm.controls.display_order" type="number" min="1"
                        class="block w-20 rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      >
                    </td>
                    <td class="px-6 py-3">
                      <button
                        type="button"
                        (click)="editForm.controls.is_active.setValue(!editForm.controls.is_active.value)"
                        class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                        [class.bg-accent]="editForm.controls.is_active.value"
                        [class.bg-gray-200]="!editForm.controls.is_active.value"
                      >
                        <span
                          class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                          [class.translate-x-4]="editForm.controls.is_active.value"
                          [class.translate-x-0]="!editForm.controls.is_active.value"
                        ></span>
                      </button>
                    </td>
                    <td class="px-6 py-3 text-right whitespace-nowrap">
                      <div class="flex justify-end gap-2">
                        <button (click)="saveEdit(cat)" [disabled]="isSaving()"
                          class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {{ isSaving() ? 'Saving...' : 'Save' }}
                        </button>
                        <button (click)="cancelEdit()"
                          class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>

                  } @else {
                    <!-- 📖 READ-ONLY ROW -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                          <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-semibold text-gray-900">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <code class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">{{ cat.slug }}</code>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ cat.display_order }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full mr-1.5"
                          [ngClass]="cat.is_active ? 'bg-green-500' : 'bg-gray-400'"
                        ></span>
                        {{ cat.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        (click)="startEdit(cat)"
                        [disabled]="editingKey() !== null"
                        class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                        Edit
                      </button>
                    </td>
                  }

                </tr>
              }

              <!-- ➕ NEW ROW (when adding) -->
              @if (editingKey() === 'new') {
                <tr class="bg-green-50">
                  <td class="px-6 py-3">
                    <input [formControl]="newForm.controls.name" type="text"
                      class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      [class.border-red-400]="newForm.controls.name.invalid && newForm.controls.name.touched"
                      placeholder="e.g. Google Pixel"
                    >
                    @if (newForm.controls.name.invalid && newForm.controls.name.touched) {
                      <p class="mt-0.5 text-xs text-red-600">Name is required</p>
                    }
                  </td>
                  <td class="px-6 py-3">
                    <input [formControl]="newForm.controls.slug" type="text"
                      class="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      [class.border-red-400]="newForm.controls.slug.invalid && newForm.controls.slug.touched"
                      placeholder="e.g. google-pixel"
                    >
                    @if (newForm.controls.slug.invalid && newForm.controls.slug.touched) {
                      <p class="mt-0.5 text-xs text-red-600">Valid slug is required</p>
                    }
                  </td>
                  <td class="px-6 py-3">
                    <input [formControl]="newForm.controls.display_order" type="number" min="1"
                      class="block w-20 rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    >
                  </td>
                  <td class="px-6 py-3">
                    <span class="text-xs text-gray-400 italic">Active by default</span>
                  </td>
                  <td class="px-6 py-3 text-right whitespace-nowrap">
                    <div class="flex justify-end gap-2">
                      <button (click)="saveNew()" [disabled]="isSaving()"
                        class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {{ isSaving() ? 'Creating...' : 'Create' }}
                      </button>
                      <button (click)="cancelEdit()"
                        class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              }

            </tbody>
          </table>

          @if (categories().length === 0 && editingKey() !== 'new') {
            <div class="text-center py-12 text-gray-400">
              <svg class="mx-auto h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <p class="text-sm font-medium">No categories found.</p>
              <p class="text-xs mt-1">Run the seed script to add iPhone and Samsung, or click "Add Category" above.</p>
            </div>
          }
        </div>

        <!-- Row-level error -->
        @if (rowError()) {
          <div class="rounded-md bg-red-50 border border-red-200 p-3 flex gap-2 items-start shadow-sm">
            <svg class="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="text-sm text-red-700">{{ rowError() }}</p>
          </div>
        }
      }

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(NonNullableFormBuilder);

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  editingKey = signal<EditingKey>(null);
  rowError = signal<string | null>(null);

  // Form for editing an existing row
  editForm = this.fb.group({
    name:          ['', Validators.required],
    display_order: [1],
    is_active:     [true],
  });

  // Form for the "new row" at the bottom
  newForm = this.fb.group({
    name:          ['', Validators.required],
    slug:          ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    display_order: [99],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.api.get<{ success: boolean; data: Category[] }>('/api/admin/categories').subscribe({
      next: res => {
        this.categories.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  startEdit(cat: Category) {
    this.rowError.set(null);
    this.editForm.reset({
      name:          cat.name,
      display_order: cat.display_order,
      is_active:     !!cat.is_active,
    });
    this.editingKey.set(cat.id);
  }

  addNewRow() {
    this.rowError.set(null);
    this.newForm.reset({ name: '', slug: '', display_order: 99 });
    this.editingKey.set('new');
  }

  cancelEdit() {
    this.editingKey.set(null);
    this.rowError.set(null);
  }

  saveEdit(cat: Category) {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;

    this.rowError.set(null);
    this.isSaving.set(true);

    const payload = {
      name:          this.editForm.value.name,
      display_order: this.editForm.value.display_order,
      is_active:     this.editForm.value.is_active,
    };

    this.api.put<{ success: boolean; data: Category }>(`/api/admin/categories/${cat.id}`, payload).subscribe({
      next: res => {
        this.categories.update(list => list.map(c => c.id === cat.id ? res.data : c));
        this.isSaving.set(false);
        this.editingKey.set(null);
      },
      error: (err: Error) => {
        this.rowError.set(err.message || 'Failed to save category.');
        this.isSaving.set(false);
      },
    });
  }

  saveNew() {
    this.newForm.markAllAsTouched();
    if (this.newForm.invalid) return;

    this.rowError.set(null);
    this.isSaving.set(true);

    const payload = {
      name:          this.newForm.value.name,
      slug:          this.newForm.value.slug,
      display_order: this.newForm.value.display_order,
    };

    this.api.post<{ success: boolean; data: Category }>('/api/admin/categories', payload).subscribe({
      next: res => {
        this.categories.update(list => [...list, res.data]);
        this.isSaving.set(false);
        this.editingKey.set(null);
      },
      error: (err: Error) => {
        this.rowError.set(err.message || 'Failed to create category. The slug may already be in use.');
        this.isSaving.set(false);
      },
    });
  }
}
