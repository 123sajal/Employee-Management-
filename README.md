# Employee Management System

A full-stack web app for managing employees, departments, and roles — built with Angular 18, Node.js, Express, and MySQL.

![Stack](https://img.shields.io/badge/Angular-18-red) ![Stack](https://img.shields.io/badge/Node.js-18+-green) ![Stack](https://img.shields.io/badge/MySQL-8.0-blue)

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Angular 18, Angular Material, TypeScript |
| Backend   | Node.js, Express.js                 |
| Database  | MySQL 8                             |
| Auth      | JWT + bcrypt                        |

---

## Features

- JWT authentication with protected routes
- Employee CRUD — search, filter, sort, paginate, export to CSV
- Department and role management
- Profile photo upload
- Dashboard with live stats
- Responsive layout with Angular Material

---

## Prerequisites

- Node.js 18+
- MySQL 8+
- Angular CLI 18+

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system
```

### 2. Database

```bash
mysql -u root -p < backend/src/database/schema.sql
```

This creates the database, all tables, and seeds 15 sample employees.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your database credentials, then:

```bash
npm run dev
```

API runs at `http://localhost:5000`

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:4200`

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_management_db

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:4200
```

---

## API Endpoints

All routes except login and register require `Authorization: Bearer <token>`.

### Auth
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
POST   /api/auth/change-password
```

### Employees
```
GET    /api/employees
GET    /api/employees/stats
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
```

Query params: `search`, `department`, `role`, `status`, `sortBy`, `sortOrder`, `page`, `limit`

### Departments
```
GET    /api/departments
GET    /api/departments/:id
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
```

### Roles
```
GET    /api/roles
GET    /api/roles/:id
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id
```

---

## Default Credentials

```
Email:    admin@ems.com
Password: Admin@123
```

---

## Project Structure

```
employee-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   └── routes/
│   ├── uploads/
│   └── .env.example
│
└── frontend/
    └── src/app/
        ├── core/          # models, services, guards, interceptors
        ├── features/      # auth, dashboard, employees, departments, roles
        ├── layout/        # shell, sidebar, navbar
        └── shared/        # reusable components, pipes, utils
```

---

## License

MIT
