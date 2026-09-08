// Dashboard specific JavaScript
class Dashboard {
    constructor() {
        this.stats = {
            totalEmployees: 248,
            totalDepartments: 8,
            attendanceRate: 94.2,
            monthlyPayroll: 184250
        };
        
        this.recentEmployees = [
            {
                id: 1,
                name: 'Sarah Johnson',
                role: 'Software Engineer',
                avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                status: 'active',
                joinDate: '2024-01-15'
            },
            {
                id: 2,
                name: 'Michael Chen',
                role: 'Product Manager',
                avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                status: 'active',
                joinDate: '2024-01-10'
            },
            {
                id: 3,
                name: 'Emily Davis',
                role: 'UX Designer',
                avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                status: 'active',
                joinDate: '2024-01-08'
            },
            {
                id: 4,
                name: 'David Wilson',
                role: 'Data Analyst',
                avatar: 'https://images.pexels.com/photos/1239300/pexels-photo-1239300.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                status: 'active',
                joinDate: '2024-01-05'
            }
        ];
        
        this.init();
    }

    init() {
        this.loadStats();
        this.loadRecentEmployees();
        this.initializeCharts();
        this.bindEvents();
    }

    loadStats() {
        // Update stats cards
        document.getElementById('totalEmployees').textContent = this.stats.totalEmployees;
        document.getElementById('totalDepartments').textContent = this.stats.totalDepartments;
        document.getElementById('attendanceRate').textContent = this.stats.attendanceRate + '%';
        document.getElementById('monthlyPayroll').textContent = this.formatCurrency(this.stats.monthlyPayroll);
    }

    loadRecentEmployees() {
        const container = document.getElementById('recentEmployees');
        if (!container) return;

        container.innerHTML = this.recentEmployees.map(employee => `
            <div class="employee-item">
                <img src="${employee.avatar}" alt="${employee.name}" class="employee-avatar">
                <div class="employee-info">
                    <h4 class="employee-name">${employee.name}</h4>
                    <p class="employee-role">${employee.role}</p>
                </div>
                <span class="employee-status ${employee.status}">${employee.status}</span>
            </div>
        `).join('');
    }

    initializeCharts() {
        this.createDepartmentChart();
        this.createAttendanceChart();
    }

    createDepartmentChart() {
        const container = document.getElementById('departmentChart');
        if (!container) return;

        const departments = [
            { name: 'IT', count: 45, color: '#3B82F6' },
            { name: 'HR', count: 12, color: '#14B8A6' },
            { name: 'Finance', count: 18, color: '#F97316' },
            { name: 'Marketing', count: 25, color: '#EF4444' },
            { name: 'Operations', count: 32, color: '#8B5CF6' },
            { name: 'Sales', count: 28, color: '#10B981' }
        ];

        const total = departments.reduce((sum, dept) => sum + dept.count, 0);

        container.innerHTML = `
            <div class="department-stats">
                ${departments.map(dept => `
                    <div class="dept-stat">
                        <div class="dept-bar">
                            <div class="dept-fill" style="width: ${(dept.count / total) * 100}%; background-color: ${dept.color}"></div>
                        </div>
                        <div class="dept-info">
                            <span class="dept-name">${dept.name}</span>
                            <span class="dept-count">${dept.count}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add CSS for department chart
        if (!document.getElementById('dept-chart-styles')) {
            const style = document.createElement('style');
            style.id = 'dept-chart-styles';
            style.textContent = `
                .department-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .dept-stat {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .dept-bar {
                    flex: 1;
                    height: 8px;
                    background-color: var(--gray-200);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .dept-fill {
                    height: 100%;
                    transition: width 0.5s ease;
                }
                .dept-info {
                    display: flex;
                    justify-content: space-between;
                    min-width: 100px;
                }
                .dept-name {
                    font-size: var(--text-sm);
                    color: var(--gray-700);
                }
                .dept-count {
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    color: var(--gray-800);
                }
            `;
            document.head.appendChild(style);
        }
    }

    createAttendanceChart() {
        const container = document.getElementById('attendanceChart');
        if (!container) return;

        const attendanceData = [
            { day: 'Mon', rate: 96 },
            { day: 'Tue', rate: 94 },
            { day: 'Wed', rate: 98 },
            { day: 'Thu', rate: 92 },
            { day: 'Fri', rate: 89 },
            { day: 'Sat', rate: 85 },
            { day: 'Sun', rate: 78 }
        ];

        const maxRate = Math.max(...attendanceData.map(d => d.rate));

        container.innerHTML = `
            <div class="attendance-chart">
                ${attendanceData.map(data => `
                    <div class="chart-bar">
                        <div class="bar-fill" style="height: ${(data.rate / maxRate) * 100}%"></div>
                        <span class="bar-label">${data.day}</span>
                        <span class="bar-value">${data.rate}%</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Add CSS for attendance chart
        if (!document.getElementById('attendance-chart-styles')) {
            const style = document.createElement('style');
            style.id = 'attendance-chart-styles';
            style.textContent = `
                .attendance-chart {
                    display: flex;
                    align-items: end;
                    gap: 1rem;
                    height: 200px;
                    padding: 1rem 0;
                }
                .chart-bar {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                    position: relative;
                }
                .bar-fill {
                    width: 100%;
                    background: linear-gradient(to top, var(--primary-600), var(--primary-400));
                    border-radius: 4px 4px 0 0;
                    transition: height 0.5s ease;
                    margin-bottom: auto;
                }
                .bar-label {
                    font-size: var(--text-xs);
                    color: var(--gray-600);
                    margin-top: 0.5rem;
                }
                .bar-value {
                    position: absolute;
                    top: -1.5rem;
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    color: var(--gray-800);
                }
            `;
            document.head.appendChild(style);
        }
    }

    bindEvents() {
        // Chart control buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                chartBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // Here you would typically reload chart data based on the selected period
            });
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Method to refresh dashboard data
    refresh() {
        this.loadStats();
        this.loadRecentEmployees();
        this.initializeCharts();
    }

    // Method to update stats (could be called from API)
    updateStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        this.loadStats();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard-container')) {
        window.dashboard = new Dashboard();
    }
});