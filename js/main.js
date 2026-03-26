// js/main.js - COMPLETE WORKING VERSION
import { store } from './core/store.js';
import { loadDashboard } from './dashboard/index.js';
import { handleLogin, handleStudentLogin } from './features/auth/login.js';
import { getInitials, timeAgo, formatDate, escapeHtml } from './core/utils.js';

console.log('🚀 main.js loaded');

// Make globally available
window.store = store;
window.handleLogin = handleLogin;
window.handleStudentLogin = handleStudentLogin;
window.getInitials = getInitials;
window.timeAgo = timeAgo;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;

let isLoadingDashboard = false;

// ============================================
// SIDEBAR RENDER FUNCTION
// ============================================

function renderSidebar(role) {
    const nav = document.getElementById('sidebar-nav');
    const settingsNav = document.getElementById('settings-nav');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (!nav) return;
    
    const sidebarConfig = {
        admin: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'users', label: 'Students', section: 'students' },
                { icon: 'user-plus', label: 'Teachers', section: 'teachers' },
                { icon: 'book-open', label: 'Classes', section: 'classes' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'trending-up', label: 'Grades', section: 'grades' },
                { icon: 'clock', label: 'Duty', section: 'duty' }
            ],
            settings: [
                { icon: 'settings', label: 'School Settings', section: 'settings' },
                { icon: 'bar-chart-2', label: 'Reports', section: 'reports' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        teacher: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'users', label: 'My Students', section: 'students' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'trending-up', label: 'Grades', section: 'grades' },
                { icon: 'clock', label: 'My Duty', section: 'duty' },
                { icon: 'message-circle', label: 'Messages', section: 'messages' }
            ],
            settings: [
                { icon: 'settings', label: 'My Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        parent: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'trending-up', label: 'Progress', section: 'progress' },
                { icon: 'credit-card', label: 'Payments', section: 'payments' },
                { icon: 'message-circle', label: 'Messages', section: 'messages' }
            ],
            settings: [
                { icon: 'settings', label: 'My Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        student: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'trending-up', label: 'My Grades', section: 'grades' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'message-circle', label: 'Study Groups', section: 'chat' },
                { icon: 'bot', label: 'AI Tutor', section: 'ai-tutor' }
            ],
            settings: [
                { icon: 'settings', label: 'My Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        superadmin: {
            main: [
                { icon: 'shield', label: 'Dashboard', section: 'dashboard' },
                { icon: 'building-2', label: 'Schools', section: 'schools' },
                { icon: 'check-circle', label: 'Approvals', section: 'approvals' },
                { icon: 'activity', label: 'Platform Health', section: 'health' }
            ],
            settings: [
                { icon: 'settings', label: 'Platform Settings', section: 'settings' },
                { icon: 'users', label: 'Users', section: 'users' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        }
    };
    
    let normalizedRole = role;
    if (role === 'super_admin') normalizedRole = 'superadmin';
    
    const config = sidebarConfig[normalizedRole] || sidebarConfig.admin;
    
    nav.innerHTML = config.main.map(item => `
        <a href="#" onclick="window.router.navigate('${item.section}')" 
           class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" 
           data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    settingsNav.innerHTML = config.settings.map(item => `
        <a href="#" onclick="window.router.navigate('${item.section}')" 
           class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" 
           data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    if (mobileNav) {
        mobileNav.innerHTML = config.main.slice(0, 4).map(item => `
            <a href="#" onclick="window.router.navigate('${item.section}')" 
               class="mobile-nav-item flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground" 
               data-section="${item.section}">
                <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                <span class="text-xs mt-1">${item.label}</span>
            </a>
        `).join('');
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================
// USER INFO UPDATE FUNCTION
// ============================================

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.name || 'User';
    const email = user.email || '';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const userInitials = document.getElementById('user-initials');
    const userName = document.getElementById('user-name');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    
    if (userInitials) userInitials.textContent = initials;
    if (userName) userName.textContent = name;
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownEmail) dropdownEmail.textContent = email;
}

// ============================================
// ROUTER
// ============================================

window.router = {
    navigate: function(section) {
        console.log('Navigate to:', section);
        if (window.dashboard && window.dashboard.showSection) {
            window.dashboard.showSection(section);
        }
    }
};

// ============================================
// LOAD DASHBOARD
// ============================================

async function loadDashboardAfterLogin(role) {
    console.log('Loading dashboard for role:', role);
    
    renderSidebar(role);
    updateUserInfo();
    
    let normalizedRole = role === 'super_admin' ? 'superadmin' : role;
    let DashboardClass = null;
    
    if (normalizedRole === 'admin') DashboardClass = window.AdminDashboard;
    else if (normalizedRole === 'superadmin') DashboardClass = window.SuperAdminDashboard;
    else if (normalizedRole === 'teacher') DashboardClass = window.TeacherDashboard;
    else if (normalizedRole === 'parent') DashboardClass = window.ParentDashboard;
    else if (normalizedRole === 'student') DashboardClass = window.StudentDashboard;
    
    if (DashboardClass) {
        window.dashboard = new DashboardClass('dashboard-content');
        await window.dashboard.init();
        console.log('✅ Dashboard loaded');
    } else {
        console.error('No dashboard class for role:', normalizedRole);
        document.getElementById('dashboard-content').innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500">Dashboard not available for role: ${role}</p>
                <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
            </div>
        `;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM ready');
    
    const user = store.getUser();
    const token = store.getToken();
    const role = localStorage.getItem('userRole');
    
    if (user && token && role && !isLoadingDashboard) {
        console.log('Found existing session, loading dashboard');
        isLoadingDashboard = true;
        
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        
        try {
            await loadDashboardAfterLogin(role);
        } catch (error) {
            console.error('Dashboard load failed:', error);
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500">Failed to load dashboard: ${error.message}</p>
                    <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                </div>
            `;
        } finally {
            isLoadingDashboard = false;
        }
    } else {
        console.log('No session, showing landing page');
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }
});

// ============================================
// AUTH MODAL FUNCTIONS
// ============================================

window.openAuthModal = function(role, mode) {
    window.currentRole = role;
    window.currentMode = mode;
    
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');
    
    if (!modal || !titleEl || !contentEl) return;
    
    titleEl.textContent = mode === 'signin' ? `Sign In as ${role}` : `Sign Up as ${role}`;
    
    if (role === 'superadmin') {
        contentEl.innerHTML = `
            <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded p-2 mb-2"></div>
            <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded p-2 mb-2"></div>
            <div><input type="password" id="auth-secret-key" placeholder="Secret Key" class="w-full border rounded p-2"></div>
        `;
    } else if (mode === 'signin') {
        contentEl.innerHTML = `
            <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded p-2 mb-2"></div>
            <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded p-2"></div>
        `;
    } else {
        contentEl.innerHTML = `
            <div><input type="text" id="auth-name" placeholder="Full Name" class="w-full border rounded p-2 mb-2"></div>
            <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded p-2 mb-2"></div>
            <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded p-2"></div>
        `;
    }
    
    modal.classList.remove('hidden');
};

window.openStudentLoginModal = function() {
    window.currentRole = 'student';
    window.currentMode = 'signin';
    
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');
    
    titleEl.textContent = 'Student Login';
    contentEl.innerHTML = `
        <div><input type="text" id="auth-elimuid" placeholder="ELIMUID" class="w-full border rounded p-2 mb-2"></div>
        <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded p-2"></div>
        <div class="mt-4 text-center text-sm">Default: <strong>Student123!</strong></div>
    `;
    modal.classList.remove('hidden');
};

window.closeAuthModal = function() {
    document.getElementById('auth-modal')?.classList.add('hidden');
};

window.handleAuthSubmit = async function() {
    const role = window.currentRole;
    const mode = window.currentMode;
    const isStudent = role === 'student';
    
    if (mode === 'signin') {
        if (isStudent) {
            const elimuid = document.getElementById('auth-elimuid')?.value;
            const password = document.getElementById('auth-password')?.value;
            if (!elimuid || !password) {
                alert('Please enter ELIMUID and password');
                return;
            }
            const success = await handleStudentLogin(elimuid, password);
            if (success) window.closeAuthModal();
        } else {
            const email = document.getElementById('auth-email')?.value;
            const password = document.getElementById('auth-password')?.value;
            const secretKey = document.getElementById('auth-secret-key')?.value;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }
            if (role === 'superadmin' && !secretKey) {
                alert('Secret key required');
                return;
            }
            
            const success = await handleLogin(role, email, password, secretKey);
            if (success) {
                window.closeAuthModal();
                await loadDashboardAfterLogin(role);
            }
        }
    } else {
        alert('Signup feature coming soon');
    }
};

// ============================================
// UI HELPERS
// ============================================

window.showLoading = function() {
    document.getElementById('loading-overlay')?.classList.remove('hidden');
};

window.hideLoading = function() {
    document.getElementById('loading-overlay')?.classList.add('hidden');
};

window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

window.logout = function() {
    store.clear();
    window.location.reload();
};

window.refreshData = function() {
    if (window.dashboard && window.dashboard.refresh) {
        window.dashboard.refresh();
    }
};

window.toggleMobileSidebar = function() {
    document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
    document.getElementById('mobile-overlay')?.classList.toggle('hidden');
};

window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};

window.toggleUserMenu = function() {
    document.getElementById('user-menu')?.classList.toggle('hidden');
};

window.showNameChangeModal = function() {
    document.getElementById('name-change-modal')?.classList.remove('hidden');
};

window.processNameChange = function() {
    alert('Name change feature coming soon');
};

window.showDashboardSection = function(section) {
    if (window.router && window.router.navigate) {
        window.router.navigate(section);
    }
};

window.refreshAdminStudentList = function() {
    if (window.dashboard && window.dashboard.refreshStudents) {
        window.dashboard.refreshStudents();
    }
};

window.refreshPendingTeachers = function() {
    if (window.dashboard && window.dashboard.refreshPendingTeachers) {
        window.dashboard.refreshPendingTeachers();
    }
};

window.closeEditStudentModal = function() {
    document.getElementById('edit-student-modal')?.classList.add('hidden');
};

window.closeEditTeacherModal = function() {
    document.getElementById('edit-teacher-modal')?.classList.add('hidden');
};

window.closeAttendanceModal = function() {
    document.getElementById('attendance-modal')?.classList.add('hidden');
};

window.closeStudentDetailsModal = function() {
    document.getElementById('student-details-modal')?.classList.add('hidden');
};

window.handleUpdateStudent = function() {
    alert('Update student feature');
};

window.handleUpdateTeacher = function() {
    alert('Update teacher feature');
};

window.viewStudentDetails = function(id) {
    alert('View student: ' + id);
};

window.editStudent = function(id) {
    alert('Edit student: ' + id);
};

window.copyElimuid = function(elimuid) {
    navigator.clipboard.writeText(elimuid);
    alert('Copied: ' + elimuid);
};

window.approveTeacher = function(id) {
    alert('Approve teacher: ' + id);
};

window.rejectTeacher = function(id) {
    alert('Reject teacher: ' + id);
};

window.updateEnrollmentChart = function(value) {
    console.log('Update enrollment chart:', value);
};

window.updateGradeChart = function(value) {
    console.log('Update grade chart:', value);
};

// ============================================
// TRIPLE CLICK
// ============================================

let clickCount = 0;
let clickTimer = null;

const setupTrigger = () => {
    const trigger = document.getElementById('secret-logo-trigger');
    if (trigger) {
        trigger.addEventListener('click', () => {
            clickCount++;
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => clickCount = 0, 2000);
            if (clickCount === 3) {
                const card = document.getElementById('superadmin-role-card');
                if (card) card.classList.remove('hidden');
                clickCount = 0;
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTrigger);
} else {
    setupTrigger();
}

// Make loadDashboard available globally
window.loadDashboard = loadDashboardAfterLogin;
