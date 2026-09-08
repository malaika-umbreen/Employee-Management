// Authentication JavaScript
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.redirectToDashboard();
        }

        // Bind form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.querySelector('.login-btn');
        
        // Show loading state
        this.showLoading(loginBtn);
        
        try {
            // Simulate API call
            await this.simulateLogin(email, password);
            
            // Success
            this.showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading(loginBtn);
        }
    }

    async simulateLogin(email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo accounts
        const demoAccounts = {
            'admin@ems.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
            'hr@ems.com': { password: 'hr123', role: 'hr', name: 'HR Manager' },
            'clerk@ems.com': { password: 'clerk123', role: 'clerk', name: 'Office Clerk' },
            'user@ems.com': { password: 'user123', role: 'user', name: 'John Doe' }
        };
        
        const account = demoAccounts[email.toLowerCase()];
        
        if (!account || account.password !== password) {
            throw new Error('Invalid email or password');
        }
        
        // Set current user
        this.currentUser = {
            email: email,
            name: account.name,
            role: account.role,
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        };
        
        this.isAuthenticated = true;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    redirectToDashboard() {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    }

    showLoading(button) {
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    }

    hideLoading(button) {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }

    showError(message) {
        this.removeMessages();
        const form = document.getElementById('loginForm');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        form.insertBefore(errorDiv, form.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        this.removeMessages();
        const form = document.getElementById('loginForm');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        form.insertBefore(successDiv, form.firstChild);
    }

    removeMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasPermission(permission) {
        if (!this.isAuthenticated) return false;
        
        const permissions = {
            admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
            hr: ['read', 'write', 'manage_employees', 'manage_payroll'],
            clerk: ['read', 'write'],
            user: ['read']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes(permission);
    }
}

// Demo account functions
function fillDemo(role) {
    const credentials = {
        admin: { email: 'admin@ems.com', password: 'admin123' },
        hr: { email: 'hr@ems.com', password: 'hr123' },
        clerk: { email: 'clerk@ems.com', password: 'clerk123' },
        user: { email: 'user@ems.com', password: 'user123' }
    };
    
    const cred = credentials[role];
    if (cred) {
        document.getElementById('email').value = cred.email;
        document.getElementById('password').value = cred.password;
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleButton.className = 'fas fa-eye';
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Make it globally available
window.authManager = authManager;
window.fillDemo = fillDemo;
window.togglePassword = togglePassword;