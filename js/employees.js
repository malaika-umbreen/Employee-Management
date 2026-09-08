// Employees management JavaScript
class EmployeeManager {
    constructor() {
        this.employees = [
            {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com',
                phone: '+1 (555) 123-4567',
                department: 'IT',
                position: 'Senior Software Engineer',
                role: 'user',
                salary: 85000,
                joinDate: '2022-01-15',
                status: 'Active',
                avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            },
            {
                id: 2,
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@company.com',
                phone: '+1 (555) 234-5678',
                department: 'HR',
                position: 'HR Manager',
                role: 'hr',
                salary: 75000,
                joinDate: '2021-03-10',
                status: 'Active',
                avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            },
            {
                id: 3,
                firstName: 'Michael',
                lastName: 'Chen',
                email: 'michael.chen@company.com',
                phone: '+1 (555) 345-6789',
                department: 'Finance',
                position: 'Financial Analyst',
                role: 'clerk',
                salary: 65000,
                joinDate: '2022-06-20',
                status: 'Active',
                avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            },
            {
                id: 4,
                firstName: 'Emily',
                lastName: 'Davis',
                email: 'emily.davis@company.com',
                phone: '+1 (555) 456-7890',
                department: 'Marketing',
                position: 'Marketing Specialist',
                role: 'user',
                salary: 58000,
                joinDate: '2023-02-14',
                status: 'Active',
                avatar: 'https://images.pexels.com/photos/1239300/pexels-photo-1239300.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            },
            {
                id: 5,
                firstName: 'David',
                lastName: 'Wilson',
                email: 'david.wilson@company.com',
                phone: '+1 (555) 567-8901',
                department: 'IT',
                position: 'System Administrator',
                role: 'admin',
                salary: 78000,
                joinDate: '2021-11-08',
                status: 'Active',
                avatar: 'https://images.pexels.com/photos/1239295/pexels-photo-1239295.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            },
            {
                id: 6,
                firstName: 'Lisa',
                lastName: 'Anderson',
                email: 'lisa.anderson@company.com',
                phone: '+1 (555) 678-9012',
                department: 'HR',
                position: 'Recruiter',
                role: 'user',
                salary: 52000,
                joinDate: '2023-05-22',
                status: 'On Leave',
                avatar: 'https://images.pexels.com/photos/1239297/pexels-photo-1239297.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            }
        ];
        
        this.filteredEmployees = [...this.employees];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editingEmployee = null;
        
        this.init();
    }

    init() {
        this.loadEmployees();
        this.bindEvents();
        this.updatePagination();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filterEmployees();
            }, 300));
        }

        // Filter dropdowns
        const filters = ['departmentFilter', 'statusFilter', 'roleFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.filterEmployees();
                });
            }
        });

        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.employee-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }

        // Employee form
        const employeeForm = document.getElementById('employeeForm');
        if (employeeForm) {
            employeeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEmployee();
            });
        }
    }

    loadEmployees() {
        const tbody = document.getElementById('employeesTableBody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageEmployees = this.filteredEmployees.slice(startIndex, endIndex);

        tbody.innerHTML = pageEmployees.map(employee => `
            <tr>
                <td>
                    <input type="checkbox" class="employee-checkbox" value="${employee.id}">
                </td>
                <td>
                    <div class="employee-cell">
                        <img src="${employee.avatar}" alt="${employee.firstName} ${employee.lastName}">
                        <div class="employee-details">
                            <div class="name">${employee.firstName} ${employee.lastName}</div>
                            <div class="email">${employee.email}</div>
                        </div>
                    </div>
                </td>
                <td>EMP${String(employee.id).padStart(3, '0')}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td><span class="role-badge ${employee.role}">${employee.role}</span></td>
                <td><span class="status-badge ${employee.status.toLowerCase().replace(' ', '-')}">${employee.status}</span></td>
                <td>${this.formatDate(employee.joinDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="employeeManager.editEmployee(${employee.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="employeeManager.deleteEmployee(${employee.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateShowingInfo();
    }

    filterEmployees() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const departmentFilter = document.getElementById('departmentFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const roleFilter = document.getElementById('roleFilter')?.value || '';

        this.filteredEmployees = this.employees.filter(employee => {
            const matchesSearch = 
                employee.firstName.toLowerCase().includes(searchTerm) ||
                employee.lastName.toLowerCase().includes(searchTerm) ||
                employee.email.toLowerCase().includes(searchTerm) ||
                employee.position.toLowerCase().includes(searchTerm);
            
            const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
            const matchesStatus = !statusFilter || employee.status === statusFilter;
            const matchesRole = !roleFilter || employee.role === roleFilter;

            return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
        });

        this.currentPage = 1;
        this.loadEmployees();
        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
        const paginationNumbers = document.getElementById('paginationNumbers');
        
        if (paginationNumbers) {
            let paginationHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    paginationHTML += `
                        <button class="page-number ${i === this.currentPage ? 'active' : ''}" 
                                onclick="employeeManager.goToPage(${i})">
                            ${i}
                        </button>
                    `;
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    paginationHTML += '<span class="pagination-ellipsis">...</span>';
                }
            }
            
            paginationNumbers.innerHTML = paginationHTML;
        }

        // Update pagination info
        this.updateShowingInfo();
    }

    updateShowingInfo() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredEmployees.length);
        
        const showingStart = document.getElementById('showingStart');
        const showingEnd = document.getElementById('showingEnd');
        const totalEmployees = document.getElementById('totalEmployees');
        
        if (showingStart) showingStart.textContent = startIndex;
        if (showingEnd) showingEnd.textContent = endIndex;
        if (totalEmployees) totalEmployees.textContent = this.filteredEmployees.length;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadEmployees();
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadEmployees();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.loadEmployees();
            this.updatePagination();
        }
    }

    openAddEmployeeModal() {
        this.editingEmployee = null;
        document.getElementById('modalTitle').textContent = 'Add New Employee';
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeModal').classList.add('active');
        document.getElementById('employeeModal').style.display = 'flex';
    }

    editEmployee(id) {
        this.editingEmployee = this.employees.find(emp => emp.id === id);
        if (!this.editingEmployee) return;

        document.getElementById('modalTitle').textContent = 'Edit Employee';
        
        // Fill form with employee data
        document.getElementById('firstName').value = this.editingEmployee.firstName;
        document.getElementById('lastName').value = this.editingEmployee.lastName;
        document.getElementById('email').value = this.editingEmployee.email;
        document.getElementById('phone').value = this.editingEmployee.phone;
        document.getElementById('department').value = this.editingEmployee.department;
        document.getElementById('position').value = this.editingEmployee.position;
        document.getElementById('role').value = this.editingEmployee.role;
        document.getElementById('salary').value = this.editingEmployee.salary;
        document.getElementById('joinDate').value = this.editingEmployee.joinDate;
        document.getElementById('status').value = this.editingEmployee.status;

        document.getElementById('employeeModal').classList.add('active');
        document.getElementById('employeeModal').style.display = 'flex';
    }

    saveEmployee() {
        const formData = new FormData(document.getElementById('employeeForm'));
        const employeeData = Object.fromEntries(formData.entries());

        if (this.editingEmployee) {
            // Update existing employee
            const index = this.employees.findIndex(emp => emp.id === this.editingEmployee.id);
            this.employees[index] = {
                ...this.employees[index],
                ...employeeData
            };
            this.showNotification('Employee updated successfully!', 'success');
        } else {
            // Add new employee
            const newEmployee = {
                id: Math.max(...this.employees.map(e => e.id)) + 1,
                ...employeeData,
                avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            };
            this.employees.push(newEmployee);
            this.showNotification('Employee added successfully!', 'success');
        }

        this.closeEmployeeModal();
        this.filterEmployees();
    }

    deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employees = this.employees.filter(emp => emp.id !== id);
            this.filterEmployees();
            this.showNotification('Employee deleted successfully!', 'success');
        }
    }

    closeEmployeeModal() {
        document.getElementById('employeeModal').classList.remove('active');
        document.getElementById('employeeModal').style.display = 'none';
        this.editingEmployee = null;
    }

    exportEmployees() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.showNotification('Employees exported successfully!', 'success');
    }

    generateCSV() {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Position', 'Role', 'Salary', 'Join Date', 'Status'];
        const rows = this.filteredEmployees.map(emp => [
            emp.id,
            emp.firstName,
            emp.lastName,
            emp.email,
            emp.phone,
            emp.department,
            emp.position,
            emp.role,
            emp.salary,
            emp.joinDate,
            emp.status
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    showNotification(message, type = 'info') {
        // Create notification element
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
        
        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                }
                .notification-success { border-left: 4px solid var(--success-500); }
                .notification-error { border-left: 4px solid var(--error-500); }
                .notification-info { border-left: 4px solid var(--primary-500); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .notification-success .notification-content i { color: var(--success-500); }
                .notification-error .notification-content i { color: var(--error-500); }
                .notification-info .notification-content i { color: var(--primary-500); }
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--gray-400);
                    cursor: pointer;
                    padding: 4px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global functions
function openAddEmployeeModal() {
    window.employeeManager.openAddEmployeeModal();
}

function closeEmployeeModal() {
    window.employeeManager.closeEmployeeModal();
}

function exportEmployees() {
    window.employeeManager.exportEmployees();
}

function previousPage() {
    window.employeeManager.previousPage();
}

function nextPage() {
    window.employeeManager.nextPage();
}

// Initialize employee manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.employees-section')) {
        window.employeeManager = new EmployeeManager();
    }
});

// Make functions globally available
window.openAddEmployeeModal = openAddEmployeeModal;
window.closeEmployeeModal = closeEmployeeModal;
window.exportEmployees = exportEmployees;
window.previousPage = previousPage;
window.nextPage = nextPage;