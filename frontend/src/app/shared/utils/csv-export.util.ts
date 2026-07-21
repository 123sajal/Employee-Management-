import { Employee } from '../../core/models/employee.model';

export function exportEmployeesToCSV(employees: Employee[], filename = 'employees.csv'): void {
  const headers = [
    'Employee ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'Department', 'Role', 'Salary', 'Date of Joining', 'Status', 'Address',
  ];

  const rows = employees.map((e) => [
    e.employee_id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone           ?? '',
    e.department_name ?? '',
    e.role_title      ?? '',
    e.salary,
    e.date_of_joining ? e.date_of_joining.split('T')[0] : '',
    e.status,
    (e.address ?? '').replace(/,/g, ' '),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
