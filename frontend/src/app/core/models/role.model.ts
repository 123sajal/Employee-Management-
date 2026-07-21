export interface Role {
  id: number;
  title: string;
  description: string | null;
  department_id: number | null;
  department_name?: string | null;
  is_active: number;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}
