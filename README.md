# Employee-Management_

A full-stack **Employee Management System** for DBA coursework. The UI is built with **HTML/CSS/JS** (vanilla) and the backend is **PHP + MySQL**. It covers employee records, departments, attendance, and payroll with role‑based access (Admin, HR, Clerk, User), an analytics dashboard, and seed data for testing.



![IMG-20250827-WA0000](https://github.com/user-attachments/assets/a39053a8-6edb-4775-8e78-080e479ecf6c)



## ✨ Key Features

### Core Modules
- **Employees:** Create, view, filter, update, delete employees; pagination; CSV export.
- **Departments:** Create and list departments with manager and budget.
- **Attendance:** Record daily attendance (check‑in/out, breaks, total hours, status).
- **Payroll:** Record pay cycles (basic salary, overtime, bonus, deductions, tax, net).

### Dashboard
- KPI cards: **Total Employees**, **Departments**, **Attendance Rate**, **Monthly Payroll**.
- Recent activity/employees and quick actions.

![IMG-20250827-WA0001](https://github.com/user-attachments/assets/98c08ea1-fb67-4675-9726-acb57239eb77)
osition visualization.


### Roles & Permissions
Client‑side permissions (see `public/js/auth.js`):
- **Admin:** read • write • delete • manage_users • manage_system
- **HR:** read • write • manage_employees • manage_payroll
- **Clerk:** read • write
- **User:** read

UI access mapping (see `public/js/main.js`):
- **Admin/HR:** Dashboard, Employees, Departments, Attendance, Payroll, Reports*, Profile

- ![IMG-20250827-WA0003](https://github.com/user-attachments/assets/c194e0ab-0467-49e2-b6f7-be64ad849e36)

![IMG-20250827-WA0005](https://github.com/user-attachments/assets/ca7f47d5-c111-4a29-a8f3-6a08d7b39f2f)

- **Clerk:** Dashboard, Employees, Attendance, Profile  
- **User:** Dashboard, Profile  
\* _Reports link present in UI; page not included._

### Authentication
- **Demo login (client‑side):** Uses localStorage for quick testing with demo accounts.
- **Server‑side (PHP) building blocks:** `php/AuthController` supports `login`, `logout`, `register`, `changePassword`, `getCurrentUser` (not wired to routes yet).

### Database
MySQL schema with these tables (see `public/202501617165613_quiet_art.sql`):
`employees`, `departments`, `attendance`, `payroll`, `leave_requests`, `performance_reviews`, `system_logs`.

Seed employees include **Admin/HR/Clerk/User** records. Hash comments indicate the initial password is **`password`** for demo rows.


## 🗂 Project Structure

---

public/
├── index.html                # Login (demo mode)
├── dashboard.html            # Main dashboard
├── employees.html            # Employee CRUD (UI)
├── departments.html          # Department CRUD (UI + PHP)
├── attendance.html           # Attendance CRUD (UI + PHP)
├── payroll.html              # Payroll CRUD (UI + PHP)
├── profile.html              # Profile view
├── 202501617165613_quiet_art.sql   # Full schema + seed data
├── db.php                    # mysqli connection (procedural)
├── fetch_*.php / insert_*.php# Minimal endpoints (attendance/department/payroll)
├── php/
│   ├── config.php            # App/DB helpers (hash/verify, constants)
│   ├── auth.php              # AuthController (login/register/etc.)
│   └── employees.php         # EmployeeController (CRUD, stats)
├── js/
│   ├── auth.js               # Demo auth + role permissions
│   ├── dashboard.js          # Dashboard data/widgets (demo)
│   ├── employees.js          # Employee table, filters, export
│   ├── profile.js            # Profile interactions (demo)
│   └── main.js               # Layout, role-based UI, session handling
└── css/
    ├── styles.css
    ├── dashboard.css
    └── login.css

---

## 🚀 Quick Start

### Requirements
- **XAMPP/LAMP/WAMP** (PHP 8+ recommended), **MySQL 5.7+**
- A web browser

### 1) Database Setup
1. Create database: `employee_management`
2. Import schema + seed data:
   ```bash
   mysql -u root -p employee_management < public/202501617165613_quiet_art.sql
   ```

### 2) Configure Backend
- For the simple endpoints used by the HTML pages, set credentials in `public/db.php`:
  ```php
  $host = "localhost";
  $user = "root";
  $pass = "";
  $db   = "employee_management";
  ```
- For the object‑oriented controllers, adjust `public/php/config.php` (constants, JWT_SECRET, etc.).

### 3) Run the App
- Copy the **public/** folder into your server root (e.g., `htdocs/ems`).
- Open **`http://localhost/ems/index.html`** to use the demo login.
- Open **Departments / Attendance / Payroll** pages to test PHP inserts & fetches.

---

## 🔐 Demo Accounts

Client‑side demo (from `js/auth.js`):

| Role  | Email             | Password  |
|------|--------------------|-----------|
| Admin| admin@ems.com      | admin123  |
| HR   | hr@ems.com         | hr123     |
| Clerk| clerk@ems.com      | clerk123  |
| User | user@ems.com       | user123   |

Database seed users (from SQL) have email like above and initial password **`password`** (see hash comments).



## 🧩 Module Details

### Employees
- List, search (name/email/department/role/status), filter (role/status/department), sort, paginate.
- Add/Edit/Delete employee (Admin & HR in UI).
- Bulk select, CSV export.

### Departments
- Create department (name, description, manager_id, budget, status).
- List departments (server‑rendered HTML table via `fetch_department.php`).

### Attendance
- Add attendance entry (employee_id, date, check_in/out, break_duration, total_hours, status, notes).
- List attendance for review (via `fetch_attendance.php`).

### Payroll
- Add payroll record (period, basic salary, overtime hours/rate/amount, bonus, deductions, tax, net, status, processed_by).
- List payroll (via `fetch_payroll.php`).

### Profile
- Static profile template with cards for personal and employment details.



## 🔧 Available PHP Controllers & Endpoints

### Controllers (OOP)
- **AuthController** (`public/php/auth.php`): `login`, `logout`, `register`, `changePassword`, `getCurrentUser`
- **EmployeeController** (`public/php/employees.php`): `getAllEmployees`, `getEmployee`, `createEmployee`, `updateEmployee`, `deleteEmployee`, `getEmployeeStats`

> These classes are ready to be wired behind an API route (e.g., `api.php?action=login`).

### Simple Endpoints (used by HTML pages)
- `fetch_department.php` (GET): list departments (HTML table)
- `insert_department.php` (POST): create department
- `fetch_attendance.php` (GET): list attendance (HTML table)
- `insert_attendance.php` (POST): create attendance
- `fetch_payroll.php` (GET): list payroll (HTML table)
- `insert_payroll.php` (POST): create payroll


## 🔒 Security & Production Notes

This project is **educational**. Before production:
- Replace demo auth with real server‑side sessions/JWT; disable client‑side demo accounts.
- Switch all SQL to **prepared statements** (current `insert_*` use string interpolation).
- Validate/sanitize all inputs (server‑side), escape output to prevent **XSS**.
- Add CSRF protection on forms.
- Store secrets outside the repo (env vars), set strong `JWT_SECRET`/`PASSWORD_SALT`.
- Use password hashing (`password_hash`) & enforce strong password policy.
- Implement access control on backend endpoints by role.
- Add logging/auditing (`system_logs`) and error handling.



## 🧪 Testing

- Log in with each role and verify UI permissions (buttons/menus hidden as expected).
- Exercise Departments/Attendance/Payroll forms; verify records appear in tables.
- Try CSV export from Employees module.



## 📸 Screenshots (placeholders)

```
/docs/screenshots/
  login.png
  dashboard.png
  employees.png
  attendance.png
  payroll.png

