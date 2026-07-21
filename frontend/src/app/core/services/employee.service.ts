import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Employee,
  EmployeeFilter,
  EmployeeListResponse,
  EmployeeStats,
} from '../models/employee.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(filter: EmployeeFilter = {}): Observable<EmployeeListResponse> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<EmployeeListResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`);
  }

  create(data: FormData): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, data);
  }

  update(id: number, data: FormData): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<ApiResponse<EmployeeStats>> {
    return this.http.get<ApiResponse<EmployeeStats>>(`${this.apiUrl}/stats`);
  }
}
