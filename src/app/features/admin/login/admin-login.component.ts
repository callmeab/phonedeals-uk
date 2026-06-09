import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div class="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10">
          
          <!-- Neutral header area, no brand details -->
          <div class="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center">
            <div class="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-center text-2xl font-bold tracking-tight text-gray-900">Sign In</h2>
          </div>

          <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input 
                  id="email" 
                  formControlName="email" 
                  type="email" 
                  autocomplete="email"
                  class="block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                  [ngClass]="{'border-red-300 focus:border-red-500 focus:ring-red-500': isFieldInvalid('email'), 'border-gray-300': !isFieldInvalid('email')}"
                >
              </div>
              @if (isFieldInvalid('email')) {
                <p class="mt-2 text-sm text-red-600">Please enter a valid email address.</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="mt-1 relative">
                <input 
                  id="password" 
                  formControlName="password" 
                  [type]="showPassword() ? 'text' : 'password'" 
                  autocomplete="current-password"
                  class="block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-accent focus:outline-none focus:ring-accent sm:text-sm pr-10"
                  [ngClass]="{'border-red-300 focus:border-red-500 focus:ring-red-500': isFieldInvalid('password'), 'border-gray-300': !isFieldInvalid('password')}"
                >
                <button 
                  type="button" 
                  (click)="togglePassword()" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  tabindex="-1"
                >
                  <span class="sr-only">{{ showPassword() ? 'Hide password' : 'Show password' }}</span>
                  @if (!showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="mt-2 text-sm text-red-600">Password is required.</p>
              }
            </div>

            @if (errorMessage()) {
              <div class="rounded-md bg-red-50 p-4 border border-red-200">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">{{ errorMessage() }}</h3>
                  </div>
                </div>
              </div>
            }

            <div>
              <button 
                type="submit" 
                [disabled]="isLoading() || loginForm.disabled"
                class="flex w-full justify-center rounded-md border border-transparent bg-accent py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                @if (isLoading()) {
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                } @else {
                  Sign In
                }
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {
    effect(() => {
      // If already authenticated, bounce directly to the dashboard
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/xk92-admin/dashboard']);
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(field: 'email' | 'password'): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && this.submitted());
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.loginForm.disable();

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        // Navigation is handled implicitly by the AuthService and effect()
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message || 'Invalid credentials. Please try again.');
        this.isLoading.set(false);
        this.loginForm.enable();
      }
    });
  }
}
