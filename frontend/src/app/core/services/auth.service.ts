import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router }     from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment }   from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/user.model';
import { ApiResponse }   from '../models/api-response.model';

const TOKEN_KEY = 'ems_token';
const USER_KEY  = 'ems_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private _token = signal<string | null>(this.loadToken());
  private _user  = signal<User | null>(this.loadUser());

  readonly isLoggedIn  = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly token       = computed(() => this._token());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success) {
          this.persistSession(res.data.token, res.data.user);
        }
      }),
      catchError((err) => throwError(() => err))
    );
  }

  register(data: { username: string; email: string; password: string; role?: string }) {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, data);
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  private persistSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
