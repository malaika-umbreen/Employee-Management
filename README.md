# Employee Management System

A full-stack **Employee Management System** built for DBA coursework. The frontend is vanilla **HTML/CSS/JavaScript**, and the backend is **PHP + MySQL**. It covers employee records, departments, attendance, and payroll, with role-based access (Admin, HR, Clerk, User), an analytics dashboard, and seed data for testing.

![Employee Management dashboard](https://github.com/user-attachments/assets/a39053a8-6edb-4775-8e78-080e479ecf6c)

---

## Table of Contents

- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [Module Details](#module-details)
- [PHP Controllers & Endpoints](#php-controllers--endpoints)
- [Security & Production Notes](#security--production-notes)
- [Testing](#testing)
- [Screenshots](#screenshots)

---

## Key Features

### Core Modules
- **Employees** — create, view, filter, update, and delete employee records; pagination; CSV export.
- **Departments** — create and list departments, with manager and budget.
- **Attendance** — record daily attendance (check-in/out, breaks, total hours, status).
- **Payroll** — record pay cycles (basic salary, overtime, bonus, deductions, tax, net).

### Dashboard
- KPI cards: **Total Employees**, **Departments**, **Attendance Rate**, **Monthly Payroll**.
- Recent activity, recent employees, and quick actions.

![Dashboard KPIs](https://github.com/user-attachments/assets/98c08ea1-fb67-4675-9726-acb57239eb77)

### Roles & Permissions

Client-side permissions are defined in `public/js/auth.js`:

| Role  | Permissions |
|-------|-------------|
| Admin | read, write, delete, manage_users, manage_system |
| HR    | read, write, manage_employees, manage_payroll |
| Clerk | read, write |
| User  | read |

UI access mapping (`public/js/main.js`):

| Role       | Visible Pages |
|------------|---------------|
| Admin / HR | Dashboard, Employees, Departments, Attendance, Payroll, Reports*, Profile |
| Clerk      | Dashboard, Employees, Attendance, Profile |
| User       | Dashboard, Profile |

\* *Reports link is present in the UI; the Reports page itself is not yet included.*

![Role-based navigation](https://github.com/user-attachments/assets/c194e0ab-0467-49e2-b6f7-be64ad849e36)
![Role-based navigation, alternate view](https://github.com/user-attachments/assets/ca7f47d5-c111-4a29-a8f3-6a08d7b39f2f)

### Authentication
- **Demo login (client-side):** uses `localStorage` for quick testing with demo accounts (see [Demo Accounts](#demo-accounts)).
- **Server-side (PHP) building blocks:** `php/AuthController` supports `login`, `logout`, `register`, `changePassword`, `getCurrentUser` — implemented but not yet wired to routes.

### Database
MySQL schema with the following tables (see `public/202501617165613_quiet_art.sql`):

`employees`, `departments`, `attendance`, `payroll`, `leave_requests`, `performance_reviews`, `system_logs`

Seed data includes Admin/HR/Clerk/User records. Hash comments in the SQL file indicate the initial password for demo rows is `password`.

---

## Project Structure

```
public/
├── index.html              # Login (demo mode)
├── dashboard.html          # Main dashboard
├── employees.html          # Employee CRUD (UI)
├── departments.html        # Department CRUD (UI + PHP)
├── attendance.html         # Attendance CRUD (UI + PHP)
├── payroll.html            # Payroll CRUD (UI + PHP)
├── profile.html            # Profile view
├── 202501617165613_quiet_art.sql   # Full schema + seed data
├── db.php                  # mysqli connection (procedural)
├── fetch_*.php             # Minimal GET endpoints (attendance/department/payroll)
├── insert_*.php            # Minimal POST endpoints (attendance/department/payroll)
├── php/
│   ├── config.php          # App/DB helpers (hash/verify, constants)
│   ├── auth.php            # AuthController (login/register/etc.)
│   └── employees.php       # EmployeeController (CRUD, stats)
├── js/
│   ├── auth.js              # Demo auth + role permissions
│   ├── dashboard.js         # Dashboard data/widgets (demo)
│   ├── employees.js         # Employee table, filters, export
│   ├── profile.js           # Profile interactions (demo)
│   └── main.js               # Layout, role-based UI, session handling
└── css/
    ├── styles.css
    ├── dashboard.css
    └── login.css

docs/
└── DBA_Project_Report.docx  # Coursework report
```

> **Note:** the repository currently has `css/`, `js/`, and `php/` folders at the repo root as well as inside `public/`. Keep the copies inside `public/` (that's what the HTML pages reference) and remove the duplicate top-level folders, or move their contents into `public/` if the top-level ones are the ones actually in use. See [Recommended Cleanup](#recommended-cleanup) below.

---

## Quick Start

### Requirements
- **XAMPP / LAMP / WAMP** (PHP 8+ recommended)
- **MySQL 5.7+**
- A web browser

### 1. Database Setup
1. Create a database named `employee_management`.
2. Import the schema and seed data:
   ```bash
   mysql -u root -p employee_management < public/202501617165613_quiet_art.sql
   ```

### 2. Configure the Backend
- For the simple endpoints used by the HTML pages, set your credentials in `public/db.php`:
  ```php
  $host = "localhost";
  $user = "root";
  $pass = "";
  $db   = "employee_management";
  ```
- For the object-oriented controllers, adjust constants (including `JWT_SECRET`) in `public/php/config.php`.

### 3. Run the App
1. Copy the `public/` folder into your server root (e.g., `htdocs/ems`).
2. Open `http://localhost/ems/index.html` for the demo login.
3. Open the Departments, Attendance, and Payroll pages to test PHP inserts and fetches.

---

## Demo Accounts

Client-side demo accounts (from `js/auth.js`):

| Role  | Email          | Password  |
|-------|----------------|-----------|
| Admin | admin@ems.com  | admin123  |
| HR    | hr@ems.com     | hr123     |
| Clerk | clerk@ems.com  | clerk123  |
| User  | user@ems.com   | user123   |

Database seed users (from the SQL file) use the same emails, with an initial password of `password` (see the hash comments in the SQL file).

---

## Module Details

### Employees
- List, search (name / email / department / role / status), filter, sort, and paginate.
- Add / edit / delete employee (Admin & HR in the UI).
- Bulk select and CSV export.

### Departments
- Create a department (name, description, manager_id, budget, status).
- List departments (server-rendered HTML table via `fetch_department.php`).

### Attendance
- Add an attendance entry (employee_id, date, check_in/out, break_duration, total_hours, status, notes).
- List attendance for review (via `fetch_attendance.php`).

### Payroll
- Add a payroll record (period, basic salary, overtime hours/rate/amount, bonus, deductions, tax, net, status, processed_by).
- List payroll records (via `fetch_payroll.php`).

### Profile
- Static profile template with cards for personal and employment details.

---

## PHP Controllers & Endpoints

### Controllers (OOP)
- **AuthController** (`public/php/auth.php`): `login`, `logout`, `register`, `changePassword`, `getCurrentUser`
- **EmployeeController** (`public/php/employees.php`): `getAllEmployees`, `getEmployee`, `createEmployee`, `updateEmployee`, `deleteEmployee`, `getEmployeeStats`

> These classes are ready to be wired behind an API route (e.g., `api.php?action=login`).

### Simple Endpoints (used by the HTML pages)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `fetch_department.php`  | GET  | List departments (HTML table) |
| `insert_department.php` | POST | Create a department |
| `fetch_attendance.php`  | GET  | List attendance (HTML table) |
| `insert_attendance.php` | POST | Create an attendance record |
| `fetch_payroll.php`     | GET  | List payroll (HTML table) |
| `insert_payroll.php`    | POST | Create a payroll record |

---

## Security & Production Notes

This project is **educational**. Before deploying to production:

- Replace demo auth with real server-side sessions/JWT and disable the client-side demo accounts.
- Switch all SQL to **prepared statements** (current `insert_*.php` files use string interpolation).
- Validate and sanitize all inputs server-side; escape output to prevent **XSS**.
- Add CSRF protection on forms.
- Store secrets outside the repo (environment variables); set a strong `JWT_SECRET` / `PASSWORD_SALT`.
- Use proper password hashing (`password_hash`) and enforce a strong password policy.
- Implement backend access control by role, not just client-side UI hiding.
- Add logging and auditing (`system_logs`) and proper error handling.

---

## Testing

- Log in with each role and verify UI permissions (buttons/menus hidden as expected).
- Exercise the Departments, Attendance, and Payroll forms; verify records appear in their tables.
- Try CSV export from the Employees module.

---

## Screenshots

Add screenshots to `docs/screenshots/` and reference them here, e.g.:

```
docs/screenshots/
├── login.png
├── dashboard.png
├── employees.png
├── attendance.png
└── payroll.png
```

```markdown
![Login](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
```

---

## Recommended Cleanup

Based on the current repo layout, a few housekeeping items would make the structure match this README:

1. **Consolidate `css/`, `js/`, `php/`** — right now these exist both at the repo root and inside `public/`. Keep one copy (the `public/` ones, since that's what the HTML pages reference) and delete the root-level duplicates.
2. **Remove leftover `placeholder.md` files** — several folders (`css/`, `js/`, `php/`, `docs/`, `public/`) contain a `placeholder.md`, likely left over from creating empty folders on GitHub. These can be deleted once each folder has real content.
3. **Keep `docs/` for non-code files** — the DBA project report (`DBA_Project_Report.docx`) and future `screenshots/` folder belong here.

