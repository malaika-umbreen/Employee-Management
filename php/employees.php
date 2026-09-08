<?php
require_once 'config.php';

class EmployeeController {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getAllEmployees($filters = []) {
        try {
            $where = ["status != 'Deleted'"];
            $params = [];
            
            // Apply filters
            if (!empty($filters['search'])) {
                $where[] = "(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR position LIKE ?)";
                $searchTerm = '%' . $filters['search'] . '%';
                $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            }
            
            if (!empty($filters['department'])) {
                $where[] = "department = ?";
                $params[] = $filters['department'];
            }
            
            if (!empty($filters['status'])) {
                $where[] = "status = ?";
                $params[] = $filters['status'];
            }
            
            if (!empty($filters['role'])) {
                $where[] = "role = ?";
                $params[] = $filters['role'];
            }
            
            $whereClause = implode(' AND ', $where);
            
            // Get total count
            $countStmt = $this->pdo->prepare("SELECT COUNT(*) as total FROM employees WHERE $whereClause");
            $countStmt->execute($params);
            $total = $countStmt->fetch()['total'];
            
            // Get paginated results
            $page = intval($filters['page'] ?? 1);
            $limit = intval($filters['limit'] ?? 10);
            $offset = ($page - 1) * $limit;
            
            $stmt = $this->pdo->prepare("
                SELECT id, employee_id, first_name, last_name, email, phone,
                       department, position, role, salary, join_date, status, avatar
                FROM employees 
                WHERE $whereClause
                ORDER BY join_date DESC
                LIMIT ? OFFSET ?
            ");
            
            $stmt->execute(array_merge($params, [$limit, $offset]));
            $employees = $stmt->fetchAll();
            
            return [
                'success' => true,
                'data' => $employees,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ];
            
        } catch (Exception $e) {
            logError("Get employees error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch employees'];
        }
    }
    
    public function getEmployee($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT id, employee_id, first_name, last_name, email, phone,
                       department, position, role, salary, join_date, status, avatar,
                       created_at, updated_at, last_login
                FROM employees 
                WHERE id = ? AND status != 'Deleted'
            ");
            $stmt->execute([$id]);
            $employee = $stmt->fetch();
            
            if (!$employee) {
                return ['success' => false, 'message' => 'Employee not found'];
            }
            
            return ['success' => true, 'data' => $employee];
            
        } catch (Exception $e) {
            logError("Get employee error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch employee'];
        }
    }
    
    public function createEmployee($data) {
        try {
            // Validate required fields
            $required = ['first_name', 'last_name', 'email', 'department', 'position'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return ['success' => false, 'message' => "Field $field is required"];
                }
            }
            
            // Validate email
            if (!validateEmail($data['email'])) {
                return ['success' => false, 'message' => 'Invalid email format'];
            }
            
            // Check if email already exists
            $stmt = $this->pdo->prepare("SELECT id FROM employees WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'Email already exists'];
            }
            
            // Generate employee ID
            $employeeId = $this->generateEmployeeId();
            
            // Generate default password
            $defaultPassword = 'password123';
            $hashedPassword = hashPassword($defaultPassword);
            
            // Insert new employee
            $stmt = $this->pdo->prepare("
                INSERT INTO employees (
                    employee_id, first_name, last_name, email, password, phone,
                    department, position, role, salary, join_date, status, avatar
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $employeeId,
                sanitizeInput($data['first_name']),
                sanitizeInput($data['last_name']),
                sanitizeInput($data['email']),
                $hashedPassword,
                sanitizeInput($data['phone'] ?? ''),
                sanitizeInput($data['department']),
                sanitizeInput($data['position']),
                sanitizeInput($data['role'] ?? 'user'),
                floatval($data['salary'] ?? 0),
                $data['join_date'] ?? date('Y-m-d'),
                $data['status'] ?? 'Active',
                $data['avatar'] ?? 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            ]);
            
            $newId = $this->pdo->lastInsertId();
            
            return [
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => ['id' => $newId, 'employee_id' => $employeeId]
            ];
            
        } catch (Exception $e) {
            logError("Create employee error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create employee'];
        }
    }
    
    public function updateEmployee($id, $data) {
        try {
            // Check if employee exists
            $stmt = $this->pdo->prepare("SELECT id FROM employees WHERE id = ? AND status != 'Deleted'");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                return ['success' => false, 'message' => 'Employee not found'];
            }
            
            // Validate email if provided
            if (!empty($data['email']) && !validateEmail($data['email'])) {
                return ['success' => false, 'message' => 'Invalid email format'];
            }
            
            // Check if email already exists (excluding current employee)
            if (!empty($data['email'])) {
                $stmt = $this->pdo->prepare("SELECT id FROM employees WHERE email = ? AND id != ?");
                $stmt->execute([$data['email'], $id]);
                if ($stmt->fetch()) {
                    return ['success' => false, 'message' => 'Email already exists'];
                }
            }
            
            // Build update query
            $updateFields = [];
            $params = [];
            
            $allowedFields = [
                'first_name', 'last_name', 'email', 'phone', 'department',
                'position', 'role', 'salary', 'status', 'avatar'
            ];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $field === 'salary' ? floatval($data[$field]) : sanitizeInput($data[$field]);
                }
            }
            
            if (empty($updateFields)) {
                return ['success' => false, 'message' => 'No fields to update'];
            }
            
            $updateFields[] = "updated_at = NOW()";
            $params[] = $id;
            
            $sql = "UPDATE employees SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            return ['success' => true, 'message' => 'Employee updated successfully'];
            
        } catch (Exception $e) {
            logError("Update employee error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update employee'];
        }
    }
    
    public function deleteEmployee($id) {
        try {
            // Check if employee exists
            $stmt = $this->pdo->prepare("SELECT id FROM employees WHERE id = ? AND status != 'Deleted'");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                return ['success' => false, 'message' => 'Employee not found'];
            }
            
            // Soft delete - update status to 'Deleted'
            $stmt = $this->pdo->prepare("UPDATE employees SET status = 'Deleted', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);
            
            return ['success' => true, 'message' => 'Employee deleted successfully'];
            
        } catch (Exception $e) {
            logError("Delete employee error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete employee'];
        }
    }
    
    public function getEmployeeStats() {
        try {
            $stats = [];
            
            // Total employees
            $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM employees WHERE status != 'Deleted'");
            $stats['total_employees'] = $stmt->fetch()['total'];
            
            // Active employees
            $stmt = $this->pdo->query("SELECT COUNT(*) as active FROM employees WHERE status = 'Active'");
            $stats['active_employees'] = $stmt->fetch()['active'];
            
            // Employees by department
            $stmt = $this->pdo->query("
                SELECT department, COUNT(*) as count 
                FROM employees 
                WHERE status != 'Deleted' 
                GROUP BY department
            ");
            $stats['by_department'] = $stmt->fetchAll();
            
            // Employees by role
            $stmt = $this->pdo->query("
                SELECT role, COUNT(*) as count 
                FROM employees 
                WHERE status != 'Deleted' 
                GROUP BY role
            ");
            $stats['by_role'] = $stmt->fetchAll();
            
            // Recent hires (last 30 days)
            $stmt = $this->pdo->query("
                SELECT COUNT(*) as recent_hires 
                FROM employees 
                WHERE join_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
                AND status != 'Deleted'
            ");
            $stats['recent_hires'] = $stmt->fetch()['recent_hires'];
            
            return ['success' => true, 'data' => $stats];
            
        } catch (Exception $e) {
            logError("Get employee stats error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch employee statistics'];
        }
    }
    
    private function generateEmployeeId() {
        $stmt = $this->pdo->query("SELECT MAX(CAST(SUBSTRING(employee_id, 4) AS UNSIGNED)) as max_id FROM employees WHERE employee_id LIKE 'EMP%'");
        $result = $stmt->fetch();
        $nextId = ($result['max_id'] ?? 0) + 1;
        return 'EMP' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
    
    $employeeController = new EmployeeController($pdo);
    
    if (isset($_GET['id'])) {
        // Get single employee
        $result = $employeeController->getEmployee($_GET['id']);
    } elseif (isset($_GET['stats'])) {
        // Get employee statistics
        $result = $employeeController->getEmployeeStats();
    } else {
        // Get all employees with filters
        $filters = [
            'search' => $_GET['search'] ?? '',
            'department' => $_GET['department'] ?? '',
            'status' => $_GET['status'] ?? '',
            'role' => $_GET['role'] ?? '',
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 10
        ];
        $result = $employeeController->getAllEmployees($filters);
    }
    
    sendJsonResponse($result);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    hasPermission('hr'); // Only HR and above can create employees
    
    $input = json_decode(file_get_contents('php://input'), true);
    $employeeController = new EmployeeController($pdo);
    
    $result = $employeeController->createEmployee($input);
    sendJsonResponse($result);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    hasPermission('hr'); // Only HR and above can update employees
    
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendJsonResponse(['error' => 'Employee ID is required'], 400);
    }
    
    $employeeController = new EmployeeController($pdo);
    $result = $employeeController->updateEmployee($id, $input);
    sendJsonResponse($result);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    hasPermission('hr'); // Only HR and above can delete employees
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendJsonResponse(['error' => 'Employee ID is required'], 400);
    }
    
    $employeeController = new EmployeeController($pdo);
    $result = $employeeController->deleteEmployee($id);
    sendJsonResponse($result);
}
?>