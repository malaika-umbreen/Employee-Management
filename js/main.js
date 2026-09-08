// Main JavaScript functionality
class EMS {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check authentication
        this.checkAuth();
        
        // Initialize components
        this.initializeSidebar();
        this.initializeUserMenu();
        this.initializeRoleBasedAccess();
        this.loadUserData();
        
        // Bind global events
        this.bindGlobalEvents();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    initializeSidebar() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                
                // Save state
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            });
            
            // Restore state
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            }
            
            // Mobile responsiveness
            if (window.innerWidth <= 1024) {
                sidebar.classList.add('collapsed');
            }
        }
    }

    initializeUserMenu() {
        const userBtn = document.querySelector('.user-btn');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.remove('active');
            });
        }
    }

    initializeRoleBasedAccess() {
        if (!this.currentUser) return;
        
        const role = this.currentUser.role;
        const navItems = document.querySelectorAll('.nav-item');
        
        // Define role permissions
        const permissions = {
            admin: ['dashboard', 'employees', 'departments', 'attendance', 'payroll', 'reports', 'profile'],
            hr: ['dashboard', 'employees', 'departments', 'attendance', 'payroll', 'reports', 'profile'],
            clerk: ['dashboard', 'employees', 'attendance', 'profile'],
            user: ['dashboard', 'profile']
        };
        
        const allowedPages = permissions[role] || [];
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                const href = link.getAttribute('href');
                const page = href ? href.replace('.html', '') : '';
                
                if (!allowedPages.includes(page)) {
                    item.style.display = 'none';
                }
            }
        });
        
        // Hide/show action buttons based on role
        this.updateActionButtons(role);
    }

    updateActionButtons(role) {
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        const actionButtons = document.querySelectorAll('.action-btn.delete');
        
        // Only admin and HR can add/delete employees
        if (addEmployeeBtn && !['admin', 'hr'].includes(role)) {
            addEmployeeBtn.style.display = 'none';
        }
        
        if (!['admin', 'hr'].includes(role)) {
            actionButtons.forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    loadUserData() {
        if (!this.currentUser) return;
        
        // Update user name in header
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = this.currentUser.name;
        });
        
        // Update profile name
        const profileNameElement = document.getElementById('profileName');
        if (profileNameElement) {
            profileNameElement.textContent = this.currentUser.name;
        }
        
        // Update user avatar
        const userAvatars = document.querySelectorAll('.user-avatar');
        userAvatars.forEach(avatar => {
            avatar.src = this.currentUser.avatar;
        });
    }

    bindGlobalEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 1024) {
                sidebar?.classList.add('collapsed');
            }
        });
        
        // Handle logout
        const logoutLinks = document.querySelectorAll('a[onclick="logout()"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sidebarCollapsed');
            window.location.href = 'index.html';
        }
    }

    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('collapsed');
}

function toggleUserMenu() {
    const userDropdown = document.querySelector('.user-dropdown');
    userDropdown?.classList.toggle('active');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sidebarCollapsed');
        window.location.href = 'index.html';
    }
}

// Initialize EMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ems = new EMS();
});

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;