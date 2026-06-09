import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, EMPTY } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  // Skip global interception for login requests so login component can show specific errors
  if (req.url.includes('/api/admin/login')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Connection / Network errors
      if (error.status === 0) {
        toast.error('Connection failed. Please check your internet connection.');
        return throwError(() => error);
      }

      // 2. Auth errors
      if (error.status === 401) {
        auth.logout();
        toast.warning('Session expired. Please sign in again.');
        return throwError(() => error);
      }

      // 3. Not Found
      if (error.status === 404) {
        // Return EMPTY so the subscriber doesn't throw, they just get no data
        return EMPTY;
      }

      // 4. Server errors (500+)
      if (error.status >= 500) {
        toast.error('Something went wrong. Please try again.');
        return throwError(() => error);
      }

      // Let other errors (e.g. 400 Bad Request) pass through to the component
      return throwError(() => error);
    })
  );
};
