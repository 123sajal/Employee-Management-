export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager';
  is_active: number;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
    expiresIn: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}
