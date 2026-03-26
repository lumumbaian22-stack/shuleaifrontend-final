// js/main.js - MINIMAL ENTRY POINT ONLY
import { store } from './core/store.js';
import { getInitials, timeAgo, formatDate, escapeHtml } from './core/utils.js';

console.log('🚀 main.js loaded');

// Make utilities globally available
window.getInitials = getInitials;
window.timeAgo = timeAgo;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.store = store;

let isLoading = false;

// ============================================
// SIDEBAR RENDER
// ============================================

function renderSidebar(role) {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    
    const config = {
        admin: [
            { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
            { icon: 'users', label: 'Students', section: 'students' },
            { icon: 'user-plus', label: 'Teachers', section: 'teachers' },
            { icon: 'book-open', label: 'Classes', section: 'classes' },
            { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
            { icon: 'trending-up', label: 'Grades', section: 'grades' },
            { icon: 'clock', label: 'Duty', section: 'duty' },
            { icon: 'settings', label: 'Settings', section: 'settings' }
        ]
    };
    
    const items = config[role] || config.admin;
    
    nav.innerHTML = items.map(item => `
        <a href="#" onclick="window.router.navigate('${item.section}')" 
           class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors sidebar-link" 
           data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================
// UPDATE USER INFO
// ============================================

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.name || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const initialsEl = document.getElementById('user-initials');
    const nameEl = document.getElementById('user-name');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    
    if (initialsEl) initialsEl.textContent = initials;
    if (nameEl) nameEl.textContent = name;
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownEmail) dropdownEmail.textContent = user.email || '';
}

// ============================================
// LOAD DASHBOARD
// ============================================

async function loadDashboard(role) {
    console.log('Loading dashboard for role:', role);
    
    renderSidebar(role);
    updateUserInfo();
    
    const roleMap = {
        'admin': window.AdminDashboard,
        'super_admin': window.SuperAdminDashboard,
        'teacher': window.TeacherDashboard,
        'parent': window.ParentDashboard,
        'student': window.StudentDashboard
    };
    
    const DashboardClass = roleMap[role];
    
    if (DashboardClass) {
        window.dashboard = new DashboardClass('dashboard-content');
        await window.dashboard.init();
        console.log('✅ Dashboard loaded');
    } else {
        console.error('No dashboard for role:', role);
    }
}

// ============================================
// ROUTER
// ============================================

window.router = {
    navigate: function(section) {
        if (window.dashboard && window.dashboard.showSection) {
            window.dashboard.showSection(section);
        }
    }
};

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role && !isLoading) {
        isLoading = true;
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        await loadDashboard(role);
        isLoading = false;
    } else {
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }
});

// ============================================
// AUTH MODAL
// ============================================

window.openAuthModal = function(role, mode) {
    window.currentRole = role;
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const content = document.getElementById('auth-modal-content');
    
    title.textContent = mode === 'signin' ? `Sign In as ${role}` : `Sign Up as ${role}`;
    content.innerHTML = `
        <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded p-2 mb-2"></div>
        <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded p-2"></div>
        ${role === 'superadmin' ? '<div><input type="password" id="auth-secret-key" placeholder="Secret Key" class="w-full border rounded p-2 mt-2"></div>' : ''}
    `;
    modal.classList.remove('hidden');
};

window.openStudentLoginModal = function() {
    window.currentRole = 'student';
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const content = document.getElementById('auth-modal-content');
    
    title.textContent = 'Student Login';
    content.innerHTML = `
        <div><input type="text" id="auth-elimuid" placeholder="ELIMUID" class="w-full border rounded p-2 mb-2"></div>
        <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded p-2"></div>
        <div class="mt-2 text-sm text-center">Default: Student123!</div>
    `;
    modal.classList.remove('hidden');
};

window.closeAuthModal = function() {
    document.getElementById('auth-modal')?.classList.add('hidden');
};

window.handleAuthSubmit = async function() {
    const role = window.currentRole;
    const isStudent = role === 'student';
    const elimuid = isStudent ? document.getElementById('auth-elimuid')?.value : null;
    const email = !isStudent ? document.getElementById('auth-email')?.value : null;
    const password = document.getElementById('auth-password')?.value;
    const secretKey = document.getElementById('auth-secret-key')?.value;
    
    if (!password) return alert('Enter password');
    if (isStudent && !elimuid) return alert('Enter ELIMUID');
    if (!isStudent && !email) return alert('Enter email');
    if (role === 'superadmin' && !secretKey) return alert('Secret key required');
    
    window.showLoading();
    
    try {
        let url, body;
        if (isStudent) {
            url = 'https://shuleaibackend-32h1.onrender.com/api/auth/student/login';
            body = { elimuid, password };
        } else if (role === 'superadmin') {
            url = 'https://shuleaibackend-32h1.onrender.com/api/auth/super-admin/login';
            body = { email, password, secretKey };
        } else {
            url = 'https://shuleaibackend-32h1.onrender.com/api/auth/login';
            body = { email, password, role };
        }
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('userRole', data.data.user.role);
            if (data.data.school) localStorage.setItem('school', JSON.stringify(data.data.school));
            
            window.closeAuthModal();
            window.location.reload();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        alert('Login failed: ' + err.message);
    } finally {
        window.hideLoading();
    }
};

// ============================================
// UI HELPERS
// ============================================

window.showLoading = () => document.getElementById('loading-overlay')?.classList.remove('hidden');
window.hideLoading = () => document.getElementById('loading-overlay')?.classList.add('hidden');
window.showToast = (msg) => alert(msg);
window.logout = () => { localStorage.clear(); window.location.reload(); };
window.toggleMobileSidebar = () => document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
window.toggleTheme = () => document.documentElement.classList.toggle('dark');
window.toggleUserMenu = () => document.getElementById('user-menu')?.classList.toggle('hidden');
window.showDashboardSection = (s) => window.router.navigate(s);

// ============================================
// TRIPLE CLICK
// ============================================

let clickCount = 0, clickTimer;
const trigger = document.getElementById('secret-logo-trigger');
if (trigger) {
    trigger.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => clickCount = 0, 2000);
        if (clickCount === 3) {
            document.getElementById('superadmin-role-card')?.classList.remove('hidden');
            clickCount = 0;
        }
    });
}
