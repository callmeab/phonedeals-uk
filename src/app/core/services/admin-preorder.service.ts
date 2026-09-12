import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PreorderStatus = 'new' | 'confirmed' | 'ready_for_collection' | 'completed' | 'cancelled';

export interface AdminPreorderItem {
  id: string;
  reservation_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  model: 'iPhone 18 Pro' | 'iPhone 18 Pro Max';
  storage: '256GB' | '512GB' | '1TB' | '2TB';
  color: 'Black' | 'Silver' | 'Glacier' | 'Burgundy';
  purchase_type: 'outright' | 'contract';
  network: string | null;
  contract_months: number;
  price_gbp: number;
  deposit_amount: number;
  deposit_status: 'PAID' | 'PENDING' | 'REFUNDED';
  status: PreorderStatus;
  marketing_opt_in: number;
  created_at: string;
  updated_at?: string | null;
  image_path?: string;
  display_size?: string;
}

export interface AdminPreorderDetail extends AdminPreorderItem {
  release_date?: string;
}

export interface PreorderStats {
  totalBookings: number;
  activeBookings: number;
  totalDeposits: number;
  mostPopularModel: string;
  mostPopularColor: string;
  mostPopularStorage: string;
  byModel: Record<string, number>;
  byColor: Record<string, number>;
  byStorage: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface PreorderFilterParams {
  status?: string;
  model?: string;
  color?: string;
  storage?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PreorderListResponse {
  success: boolean;
  data: AdminPreorderItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPreorderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/admin/preorders`;

  getPreorders(params: PreorderFilterParams = {}): Observable<PreorderListResponse> {
    let httpParams = new HttpParams();

    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.model && params.model !== 'all') {
      httpParams = httpParams.set('model', params.model);
    }
    if (params.color && params.color !== 'all') {
      httpParams = httpParams.set('color', params.color);
    }
    if (params.storage && params.storage !== 'all') {
      httpParams = httpParams.set('storage', params.storage);
    }
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.dateFrom) {
      httpParams = httpParams.set('dateFrom', params.dateFrom);
    }
    if (params.dateTo) {
      httpParams = httpParams.set('dateTo', params.dateTo);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<PreorderListResponse>(this.baseUrl, { params: httpParams });
  }

  getStats(): Observable<{ success: boolean; data: PreorderStats }> {
    return this.http.get<{ success: boolean; data: PreorderStats }>(`${this.baseUrl}/stats`);
  }

  getPreorderById(id: string): Observable<{ success: boolean; data: AdminPreorderDetail }> {
    return this.http.get<{ success: boolean; data: AdminPreorderDetail }>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, status: PreorderStatus): Observable<{ success: boolean; message: string; data: AdminPreorderDetail }> {
    return this.http.patch<{ success: boolean; message: string; data: AdminPreorderDetail }>(
      `${this.baseUrl}/${id}`,
      { status }
    );
  }

  exportCsv(params: PreorderFilterParams = {}): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.model && params.model !== 'all') {
      httpParams = httpParams.set('model', params.model);
    }
    if (params.color && params.color !== 'all') {
      httpParams = httpParams.set('color', params.color);
    }
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.dateFrom) {
      httpParams = httpParams.set('dateFrom', params.dateFrom);
    }
    if (params.dateTo) {
      httpParams = httpParams.set('dateTo', params.dateTo);
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  downloadBlob(blob: Blob, filename?: string): void {
    const today = new Date().toISOString().split('T')[0];
    const name = filename || `iphone18-bookings-${today}.csv`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
