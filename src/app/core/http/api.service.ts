import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  get<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      }
    }
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams }));
  }

  post<T>(path: string, body: unknown, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.baseUrl}${path}`, body, { params: this.buildParams(params) }));
  }

  put<T>(path: string, body: unknown, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.baseUrl}${path}`, body, { params: this.buildParams(params) }));
  }

  delete<T = void>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.baseUrl}${path}`, { params: this.buildParams(params) }));
  }

  private buildParams(params?: Record<string, string | number | boolean | null | undefined>): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
