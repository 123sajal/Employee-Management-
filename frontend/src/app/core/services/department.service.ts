import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment }  from '../../../environments/environment';
import { Department }   from '../models/department.model';
import { ApiResponse }  from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly apiUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Department>): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Department>): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}
