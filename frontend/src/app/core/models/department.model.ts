export interface Department {
  id: number;
  name: string;
  description: string | null;
  is_active: number;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}
