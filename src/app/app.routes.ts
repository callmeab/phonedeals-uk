import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'iphone',
    loadComponent: () => import('./features/iphone/iphone.component').then(m => m.IphoneComponent),
  },
  {
    path: 'samsung',
    loadComponent: () => import('./features/samsung/samsung.component').then(m => m.SamsungComponent),
  },
  {
    path: 'phones/:slug',
    loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: 'xk92-admin/login',
    loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'xk92-admin',
    loadComponent: () => import('./features/admin/admin-shell.component').then(m => m.AdminShellComponent),
    canActivate: [() => import('./core/guards/admin.guard').then(m => m.adminGuard)],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/admin/products/admin-product-form.component').then(m => m.AdminProductFormComponent),
        canDeactivate: [() => import('./core/guards/unsaved-changes.guard').then(m => m.unsavedChangesGuard)]
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/admin/products/admin-product-form.component').then(m => m.AdminProductFormComponent),
        canDeactivate: [() => import('./core/guards/unsaved-changes.guard').then(m => m.unsavedChangesGuard)]
      },
      {
        path: 'deals',
        loadComponent: () => import('./features/admin/deals/deals.component').then(m => m.AdminDealsComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
