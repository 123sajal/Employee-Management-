export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department_id: number | null;
  department_name: string | null;
  role_id: number | null;
  role_title: string | null;
  salary: number;
  date_of_joining: string;
  address: string | null;
  status: 'active' | 'inactive';
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFilter {
  search?:     string;
  department?: string | number;
  role?:       string | number;
  status?:     string;
  sortBy?:     string;
  sortOrder?:  'ASC' | 'DESC';
  page?:       number;
  limit?:      number;
}

export interface Pagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface EmployeeListResponse {
  success:    boolean;
  data:       Employee[];
  pagination: Pagination;
}

export interface EmployeeStats {
  totals: {
    total_employees:  number;
    active_employees: number;
    inactive_employees: number;
    avg_salary:       number;
    total_departments: number;
    total_roles:      number;
  };
  byDepartment:    { department: string; count: number }[];
  recentEmployees: Employee[];
}
