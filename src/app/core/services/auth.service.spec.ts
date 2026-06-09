import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Clear local storage to ensure clean state
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    // Re-initialize service to pick up clean state
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should set token and return true for valid login', (done) => {
    service.login('admin@phonedeals.co.uk', 'admin123').subscribe({
      next: (res) => {
        expect(res.success).toBeTrue();
        expect(service.isAuthenticated()).toBeTrue();
        expect(service.getToken()).toBe('fake-jwt');
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, token: 'fake-jwt' });
  });

  it('should throw error for invalid login', (done) => {
    service.login('wrong@email.com', 'badpass').subscribe({
      error: (err) => {
        expect(err.message).toBe('Invalid credentials');
        expect(service.isAuthenticated()).toBeFalse();
        expect(service.getToken()).toBeNull();
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/login`);
    req.flush({ success: false, error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear token and navigate on logout', () => {
    localStorage.setItem('admin_token', 'test');
    const newService = TestBed.inject(AuthService);
    expect(newService.isAuthenticated()).toBeTrue();

    newService.logout();
    expect(newService.isAuthenticated()).toBeFalse();
    expect(newService.getToken()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/xk92-admin/login']);
  });
});
