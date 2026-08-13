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
  theme_color?: string;
}

// The ID of the row currently being edited inline (null = none).
// A string key 'new' signals the unsaved "Add Category" row.
type EditingKey = number | 'new' | null;

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6 pb-12 max-w-7xl">

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


      <!-- Table -->
      @if (isLoading()) {
        <div class="flex justify-center py-20 bg-white rounded-xl border border-gray-100">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Theme Color</th>
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
                      <div class="space-y-2 min-w-48">
                        <label class="relative block h-24 rounded-xl border border-gray-200 shadow-inner overflow-hidden cursor-pointer"
                          [style.background]="getThemePickerBackground(editForm.controls.theme_color.value)"
                        >
                          <input
                            type="color"
                            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            [value]="getThemeHex(editForm.controls.theme_color.value)"
                            (input)="setThemeColor('edit', $event)"
                          >
                          <span class="absolute right-3 top-3 h-5 w-5 rounded-full border-2 border-white shadow"
                            [style.background]="getThemeHex(editForm.controls.theme_color.value)"
                          ></span>
                        </label>
                        <div class="flex items-center justify-between text-xs text-gray-500">
                          <span>{{ getThemeHex(editForm.controls.theme_color.value) }}</span>
                          <span>Click to choose</span>
                        </div>
                      </div>
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
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="h-4 w-4 rounded-full border border-gray-300" [style.background]="getThemeHex(cat.theme_color)"></div>
                        <span class="text-xs text-gray-500">{{ getThemeColorLabel(cat.theme_color) }}</span>
                      </div>
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
                      <div class="flex justify-end gap-3">
                        <button
                          (click)="startEdit(cat)"
                          [disabled]="editingKey() !== null || deletingCategoryId() === cat.id"
                          class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          (click)="deleteCategory(cat)"
                          [disabled]="editingKey() !== null || deletingCategoryId() === cat.id"
                          class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          {{ deletingCategoryId() === cat.id ? 'Deleting...' : 'Delete' }}
                        </button>
                      </div>
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
                    <div class="space-y-2 min-w-48">
                      <label class="relative block h-24 rounded-xl border border-gray-200 shadow-inner overflow-hidden cursor-pointer"
                        [style.background]="getThemePickerBackground(newForm.controls.theme_color.value)"
                      >
                        <input
                          type="color"
                          class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          [value]="getThemeHex(newForm.controls.theme_color.value)"
                          (input)="setThemeColor('new', $event)"
                        >
                        <span class="absolute right-3 top-3 h-5 w-5 rounded-full border-2 border-white shadow"
                          [style.background]="getThemeHex(newForm.controls.theme_color.value)"
                        ></span>
                      </label>
                      <div class="flex items-center justify-between text-xs text-gray-500">
                        <span>{{ getThemeHex(newForm.controls.theme_color.value) }}</span>
                        <span>Click to choose</span>
                      </div>
                    </div>
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

  private defaultThemeColor = '#2563eb';

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  deletingCategoryId = signal<number | null>(null);
  editingKey = signal<EditingKey>(null);
  rowError = signal<string | null>(null);

  // Form for editing an existing row
  editForm = this.fb.group({
    name:          ['', Validators.required],
    theme_color:   [this.createThemeValue(this.defaultThemeColor)],
    display_order: [1],
    is_active:     [true],
  });

  // Form for the "new row" at the bottom
  newForm = this.fb.group({
    name:          ['', Validators.required],
    slug:          ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    theme_color:   [this.createThemeValue(this.defaultThemeColor)],
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
      theme_color:   cat.theme_color || this.createThemeValue(this.defaultThemeColor),
      display_order: cat.display_order,
      is_active:     !!cat.is_active,
    });
    this.editingKey.set(cat.id);
  }

  addNewRow() {
    this.rowError.set(null);
    this.newForm.reset({ name: '', slug: '', theme_color: this.createThemeValue(this.defaultThemeColor), display_order: 99 });
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
      theme_color:   this.editForm.value.theme_color,
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
      theme_color:   this.newForm.value.theme_color,
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

  deleteCategory(cat: Category) {
    const confirmed = window.confirm(`Delete "${cat.name}" category? This cannot be undone.`);
    if (!confirmed) return;

    this.rowError.set(null);
    this.deletingCategoryId.set(cat.id);

    this.api.delete<{ success: boolean }>(`/api/admin/categories/${cat.id}`).subscribe({
      next: () => {
        this.categories.update(list => list.filter(c => c.id !== cat.id));
        this.deletingCategoryId.set(null);
      },
      error: (err: Error) => {
        this.rowError.set(err.message || 'Failed to delete category.');
        this.deletingCategoryId.set(null);
      },
    });
  }

  getThemeColorBg(themeColor?: string) {
    return '';
  }

  getThemeColorLabel(themeColor?: string) {
    return this.getThemeHex(themeColor).toUpperCase();
  }

  getThemeHex(themeColor?: string | null) {
    const theme = this.getThemePreset(themeColor || undefined);
    return theme.accent;
  }

  getThemePickerBackground(themeColor?: string | null) {
    const accent = this.getThemeHex(themeColor);
    return `linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(0,0,0,0.45)), linear-gradient(135deg, #ffffff 0%, ${accent} 55%, #020617 100%)`;
  }

  setThemeColor(form: 'edit' | 'new', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const themeValue = this.createThemeValue(value);

    if (form === 'edit') {
      this.editForm.controls.theme_color.setValue(themeValue);
    } else {
      this.newForm.controls.theme_color.setValue(themeValue);
    }
  }

  private getThemePreset(themeColor?: string) {
    try {
      const theme = themeColor ? JSON.parse(themeColor) as { accent?: string; bg?: string } : {};
      if (theme.accent && /^#[0-9a-fA-F]{6}$/.test(theme.accent)) {
        return { accent: theme.accent };
      }
      if (theme.bg) {
        return { accent: this.classToHex(theme.bg) };
      }
    } catch {
      return { accent: this.defaultThemeColor };
    }

    return { accent: this.defaultThemeColor };
  }

  private createThemeValue(accent: string) {
    const color = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : this.defaultThemeColor;
    const dark = this.mixHex(color, '#020617', 0.62);
    const soft = this.mixHex(color, '#ffffff', 0.38);

    return JSON.stringify({
      accent: color,
      heroBackground: `radial-gradient(circle at 70% 18%, ${soft}55 0, transparent 32%), linear-gradient(135deg, ${dark} 0%, #020617 58%, ${color} 145%)`,
      heroGlow: `radial-gradient(circle, ${color}80 0%, ${color}28 38%, transparent 72%)`,
      heroPanel: `linear-gradient(135deg, ${color} 0%, ${dark} 100%)`,
    });
  }

  private classToHex(className: string) {
    const colorMap: Record<string, string> = {
      'bg-black': '#111827',
      'bg-blue-600': '#2563eb',
      'bg-green-600': '#16a34a',
      'bg-purple-600': '#9333ea',
      'bg-slate-900': '#0f172a',
      'bg-zinc-900': '#18181b',
      'bg-gray-900': '#111827',
      'bg-neutral-900': '#171717',
    };

    return colorMap[className] || this.defaultThemeColor;
  }

  private mixHex(from: string, to: string, weight: number) {
    const fromRgb = this.hexToRgb(from);
    const toRgb = this.hexToRgb(to);
    const mixed = fromRgb.map((channel, index) =>
      Math.round(channel * (1 - weight) + toRgb[index] * weight)
    );

    return `#${mixed.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  private hexToRgb(hex: string) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }
}
