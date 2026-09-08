<?php
require_once 'config.php';

class AuthController {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function login($email, $password) {
        try {
            // Get user from database
            $stmt = $this->pdo->prepare("
                SELECT id, email, password, first_name, last_name, role, status, avatar 
                FROM employees 
                WHERE email = ? AND status = 'Active'
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user || !verifyPassword($password, $user['password'])) {
                return ['success' => false, 'message' => 'Invalid email or password'];
            }
            
            // Start session
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['name'] = $user['first_name'] . ' ' . $user['last_name'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['avatar'] = $user['avatar'];
            
            // Update last login
            $this->updateLastLogin($user['id']);
            
            return [
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['first_name'] . ' ' . $user['last_name'],
                    'role' => $user['role'],
                    'avatar' => $user['avatar']
                ]
            ];
            
        } catch (Exception $e) {
            logError("Login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Login failed'];
        }
    }
    
    public function logout() {
        session_start();
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }
    
    public function register($data) {
        try {
            // Validate required fields
            $required = ['first_name', 'last_name', 'email', 'password', 'department', 'position'];
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
            
            // Hash password
            $hashedPassword = hashPassword($data['password']);
            
            // Generate employee ID
            $employeeId = $this->generateEmployeeId();
            
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
                'Active',
                $data['avatar'] ?? 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            ]);
            
            return ['success' => true, 'message' => 'Employee registered successfully'];
            
        } catch (Exception $e) {
            logError("Registration error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Registration failed'];
        }
    }
    
    public function changePassword($userId, $currentPassword, $newPassword) {
        try {
            // Get current password hash
            $stmt = $this->pdo->prepare("SELECT password FROM employees WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user || !verifyPassword($currentPassword, $user['password'])) {
                return ['success' => false, 'message' => 'Current password is incorrect'];
            }
            
            // Update password
            $hashedPassword = hashPassword($newPassword);
            $stmt = $this->pdo->prepare("UPDATE employees SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $userId]);
            
            return ['success' => true, 'message' => 'Password changed successfully'];
            
        } catch (Exception $e) {
            logError("Password change error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Password change failed'];
        }
    }
    
    public function getCurrentUser() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'message' => 'Not authenticated'];
        }
        
        try {
            $stmt = $this->pdo->prepare("
                SELECT id, employee_id, first_name, last_name, email, phone,
                       department, position, role, salary, join_date, status, avatar
                FROM employees WHERE id = ?
            ");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            return [
                'success' => true,
                'user' => $user
            ];
            
        } catch (Exception $e) {
            logError("Get current user error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to get user data'];
        }
    }
    
    private function updateLastLogin($userId) {
        try {
            $stmt = $this->pdo->prepare("UPDATE employees SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$userId]);
        } catch (Exception $e) {
            logError("Update last login error: " . $e->getMessage());
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
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    $auth = new AuthController($pdo);
    
    switch ($action) {
        case 'login':
            $result = $auth->login($input['email'] ?? '', $input['password'] ?? '');
            sendJsonResponse($result);
            break;
            
        case 'logout':
            $result = $auth->logout();
            sendJsonResponse($result);
            break;
            
        case 'register':
            hasPermission('hr'); // Only HR and above can register employees
            $result = $auth->register($input);
            sendJsonResponse($result);
            break;
            
        case 'change_password':
            requireAuth();
            $result = $auth->changePassword(
                $_SESSION['user_id'],
                $input['current_password'] ?? '',
                $input['new_password'] ?? ''
            );
            sendJsonResponse($result);
            break;
            
        case 'get_current_user':
            $result = $auth->getCurrentUser();
            sendJsonResponse($result);
            break;
            
        default:
            sendJsonResponse(['error' => 'Invalid action'], 400);
    }
}
?>