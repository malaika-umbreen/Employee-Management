// Profile page JavaScript
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.bindEvents();
        this.loadProfileData();
    }

    loadCurrentUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    bindEvents() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showTab(tabName);
            });
        });

        // Profile form submission
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Password form submission
        const passwordForm = document.querySelector('.password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Toggle switches
        const toggleSwitches = document.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.savePreference(e.target.name || e.target.id, e.target.checked);
            });
        });

        // Theme and language changes
        const themeSelect = document.getElementById('theme');
        const languageSelect = document.getElementById('language');
        
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }

    loadProfileData() {
        if (!this.currentUser) return;

        // Update profile header
        const profileName = document.getElementById('profileName');
        const profileTitle = document.getElementById('profileTitle');
        const profileImage = document.getElementById('profileImage');

        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileTitle) profileTitle.textContent = this.getRoleTitle(this.currentUser.role);
        if (profileImage) profileImage.src = this.currentUser.avatar;

        // Load form data
        this.loadFormData();
        this.loadPreferences();
    }

    loadFormData() {
        // Basic information
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');

        if (firstName && this.currentUser.name) {
            const nameParts = this.currentUser.name.split(' ');
            firstName.value = nameParts[0] || '';
            if (lastName) lastName.value = nameParts.slice(1).join(' ') || '';
        }

        if (email) email.value = this.currentUser.email || '';
        if (phone) phone.value = '+1 (555) 123-4567'; // Default phone

        // Additional fields with default values
        const address = document.getElementById('address');
        const birthDate = document.getElementById('birthDate');
        const gender = document.getElementById('gender');
        const emergencyContact = document.getElementById('emergencyContact');
        const emergencyPhone = document.getElementById('emergencyPhone');

        if (address) address.value = '123 Main St, New York, NY 10001';
        if (birthDate) birthDate.value = '1990-01-15';
        if (gender) gender.value = 'male';
        if (emergencyContact) emergencyContact.value = 'Jane Doe';
        if (emergencyPhone) emergencyPhone.value = '+1 (555) 987-6543';
    }

    loadPreferences() {
        // Load saved preferences from localStorage
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        // Set toggle switches
        const toggles = {
            emailNotifications: true,
            pushNotifications: false,
            smsNotifications: false,
            smsAuth: false,
            emailAuth: true
        };

        Object.keys(toggles).forEach(key => {
            const toggle = document.querySelector(`input[name="${key}"], input[id="${key}"]`);
            if (toggle) {
                toggle.checked = preferences[key] !== undefined ? preferences[key] : toggles[key];
            }
        });

        // Set theme and language
        const theme = document.getElementById('theme');
        const language = document.getElementById('language');
        
        if (theme) theme.value = preferences.theme || 'light';
        if (language) language.value = preferences.language || 'en';
    }

    showTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to clicked button
        const clickedBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        if (clickedBtn) {
            clickedBtn.classList.add('active');
        }
    }

    saveProfile() {
        const formData = new FormData(document.querySelector('.profile-form'));
        const profileData = Object.fromEntries(formData.entries());

        // Update current user data
        if (this.currentUser) {
            this.currentUser.name = `${profileData.firstName} ${profileData.lastName}`;
            this.currentUser.email = profileData.email;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // Update UI
            this.loadProfileData();
        }

        this.showNotification('Profile updated successfully!', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords
        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match!', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters long!', 'error');
            return;
        }

        // In a real application, you would validate the current password
        // and update it on the server
        
        // Clear form
        document.querySelector('.password-form').reset();
        
        this.showNotification('Password changed successfully!', 'success');
    }

    savePreference(key, value) {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        preferences[key] = value;
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
        this.showNotification('Preference saved!', 'success');
    }

    changeTheme(theme) {
        // Apply theme changes
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save preference
        this.savePreference('theme', theme);
        
        this.showNotification(`Theme changed to ${theme}!`, 'success');
    }

    changeLanguage(language) {
        // In a real application, you would load language files
        // and update all text content
        
        this.savePreference('language', language);
        
        const languageNames = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French'
        };
        
        this.showNotification(`Language changed to ${languageNames[language]}!`, 'success');
    }

    changeProfilePhoto() {
        // In a real application, you would open a file picker
        // and upload the image to a server
        
        const photos = [
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'https://images.pexels.com/photos/1239300/pexels-photo-1239300.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        ];
        
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        
        // Update profile image
        const profileImages = document.querySelectorAll('#profileImage, .user-avatar');
        profileImages.forEach(img => {
            img.src = randomPhoto;
        });
        
        // Update current user
        if (this.currentUser) {
            this.currentUser.avatar = randomPhoto;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        this.showNotification('Profile photo updated!', 'success');
    }

    getRoleTitle(role) {
        const roleTitles = {
            'admin': 'System Administrator',
            'hr': 'HR Manager',
            'clerk': 'Office Clerk',
            'user': 'Employee'
        };
        
        return roleTitles[role] || 'Employee';
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
function showTab(tabName) {
    window.profileManager.showTab(tabName);
}

function changeProfilePhoto() {
    window.profileManager.changeProfilePhoto();
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.profile-section')) {
        window.profileManager = new ProfileManager();
    }
});

// Make functions globally available
window.showTab = showTab;
window.changeProfilePhoto = changeProfilePhoto;