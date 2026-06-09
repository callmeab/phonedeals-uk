import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should return true if user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    
    const result = TestBed.runInInjectionContext(() => {
      return adminGuard({} as any, {} as any);
    });

    expect(result).toBeTrue();
  });

  it('should return UrlTree to login if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const urlTree = {} as any;
    routerSpy.createUrlTree.and.returnValue(urlTree);
    
    const result = TestBed.runInInjectionContext(() => {
      return adminGuard({} as any, {} as any);
    });

    expect(result).toBe(urlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/xk92-admin/login']);
  });
});
