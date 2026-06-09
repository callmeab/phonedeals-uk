import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Admin {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private tokenSignal = signal<string | null>(localStorage.getItem('admin_token'));
  private adminSignal = signal<Admin | null>(
    localStorage.getItem('admin_email') ? { email: localStorage.getItem('admin_email')! } : null
  );

  isAuthenticated = computed(() => !!this.tokenSignal());
  currentAdmin = computed(() => this.adminSignal());

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(email: string, password: string): Observable<{ success: boolean; token: string }> {
    return new Observable(observer => {
      this.http.post<{ success: boolean; token?: string; error?: string }>(
        `${environment.apiUrl}/api/admin/login`,
        { email, password }
      ).subscribe({
        next: (res) => {
          if (res.success && res.token) {
            localStorage.setItem('admin_token', res.token);
            localStorage.setItem('admin_email', email);
            this.tokenSignal.set(res.token);
            this.adminSignal.set({ email });
            observer.next({ success: true, token: res.token });
            observer.complete();
          } else {
            observer.error(new Error(res.error || 'Invalid credentials'));
          }
        },
        error: (err) => {
          observer.error(new Error(err.error?.error || 'Invalid credentials'));
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    this.tokenSignal.set(null);
    this.adminSignal.set(null);
    this.router.navigate(['/xk92-admin/login']);
  }
}
