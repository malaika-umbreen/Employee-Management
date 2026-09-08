<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'employee_management');
define('DB_USER', 'root');
define('DB_PASS', '');

// Application configuration
define('APP_NAME', 'Employee Management System');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/employee-management');

// Security configuration
define('JWT_SECRET', 'your-secret-key-here');
define('PASSWORD_SALT', 'your-salt-here');

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 for HTTPS

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('America/New_York');

// CORS headers for API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Utility functions
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function logError($message, $file = 'error.log') {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($file, $logMessage, FILE_APPEND | LOCK_EX);
}

// Authentication helper
function requireAuth() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }
    return $_SESSION;
}

function hasPermission($requiredRole) {
    $session = requireAuth();
    $userRole = $session['role'] ?? 'user';
    
    $roleHierarchy = [
        'user' => 1,
        'clerk' => 2,
        'hr' => 3,
        'admin' => 4
    ];
    
    $userLevel = $roleHierarchy[$userRole] ?? 0;
    $requiredLevel = $roleHierarchy[$requiredRole] ?? 0;
    
    if ($userLevel < $requiredLevel) {
        sendJsonResponse(['error' => 'Insufficient permissions'], 403);
    }
    
    return true;
}
?>