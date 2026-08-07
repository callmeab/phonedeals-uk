import { Routes } from '@angular/router';
import { checkoutGuard } from './features/checkout/checkout.guard';

export const routes: Routes = [
  {
    path: 'xk92-admin/login',
    loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'xk92-admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
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
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/orders.component').then(m => m.AdminOrdersComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/admin/orders/order-detail.component').then(m => m.AdminOrderDetailComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
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
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
        canDeactivate: [checkoutGuard],
      },
      {
        path: 'order-confirmation',
        loadComponent: () => import('./features/checkout/confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./features/pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () => import('./features/pages/terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent),
      },
      {
        path: 'cookie-policy',
        loadComponent: () => import('./features/pages/cookie-policy/cookie-policy.component').then(m => m.CookiePolicyComponent),
      },
      {
        path: 'contact-us',
        loadComponent: () => import('./features/pages/contact-us/contact-us.component').then(m => m.ContactUsComponent),
      },
      {
        path: ':slug',
        loadComponent: () => import('./features/category-listing/category-listing.component').then(m => m.CategoryListingComponent),
      },
      { 
        path: '**', 
        loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent) 
      }
    ]
  }
];
