// js/main.js - COMPLETE ENTRY POINT (NO RELOAD LOOPS)
import { store } from './core/store.js';
import { apiClient } from './api/client.js';
import { authAPI } from './api/auth.js';
import { loadDashboard } from './dashboard/index.js';

console.log('🚀 main.js loaded (ES Module)');

// ============================================
// SESSION MANAGEMENT
// ============================================

let isInitialized = false;
let isLoadingDashboard = false;

async function initSession() {
    if (isInitialized) return;
    isInitialized = true;

    const token = store.getToken();
    const user = store.getUser();
    const role = localStorage.getItem('userRole');

    console.log('Session check:', { token: !!token, user: !!user, role });

    if (token && user && role && !isLoadingDashboard) {
        console.log('Existing session found, loading dashboard...');
        isLoadingDashboard = true;
        try {
            await loadDashboard(role);
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';
        } catch (error) {
            console.error('Failed to load dashboard:', error);
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
}

// ============================================
// LOGIN HANDLERS (NO PAGE RELOAD)
// ============================================

async function handleLogin(role, email, password, secretKey = null) {
    console.log('Login attempt:', role);
    try {
        let response;
        if (role === 'superadmin') {
            response = await authAPI.superAdminLogin(email, password, secretKey);
        } else {
            response = await authAPI.login(email, password, role);
        }

        if (response.success) {
            const user = response.data.user;
            const token = response.data.token;
            const school = response.data.school;

            user.token = token;
            store.setUser(user);
            store.setToken(token);
            if (school) store.setSchool(school);
            localStorage.setItem('userRole', user.role);

            console.log('Login successful, loading dashboard...');

            // Hide landing, show dashboard container
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';

            // Load dashboard directly (NO RELOAD)
            await loadDashboard(user.role);
            return true;
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed');
        return false;
    }
}

async function handleStudentLogin(elimuid, password) {
    console.log('Student login attempt');
    try {
        const response = await authAPI.studentLogin(elimuid, password);
        if (response.success) {
            const user = response.data.user;
            const token = response.data.token;
            user.token = token;
            store.setUser(user);
            store.setToken(token);
            localStorage.setItem('userRole', 'student');

            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';

            await loadDashboard('student');
            return true;
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Student login error:', error);
        alert(error.message || 'Login failed');
        return false;
    }
}

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
            if (success) window.closeAuthModal();
        }
    } else {
        alert('Signup feature coming soon');
    }
};

// ============================================
// DASHBOARD NAVIGATION
// ============================================

window.showDashboardSection = function(section) {
    if (window.dashboard && window.dashboard.showSection) {
        window.dashboard.showSection(section);
    } else {
        console.warn('Dashboard not ready, section:', section);
        // Fallback: just refresh dashboard if possible
        if (window.dashboard && window.dashboard.refresh) window.dashboard.refresh();
    }
};

// ============================================
// GLOBAL UI HELPERS (for dashboard buttons)
// ============================================

window.showLoading = () => document.getElementById('loading-overlay')?.classList.remove('hidden');
window.hideLoading = () => document.getElementById('loading-overlay')?.classList.add('hidden');
window.showToast = (msg, type) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2`;
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};
window.logout = () => { store.clear(); window.location.reload(); };
window.refreshData = () => { if (window.dashboard && window.dashboard.refresh) window.dashboard.refresh(); };
window.toggleMobileSidebar = () => document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
window.toggleTheme = () => document.documentElement.classList.toggle('dark');
window.toggleUserMenu = () => document.getElementById('user-menu')?.classList.toggle('hidden');
window.showNameChangeModal = () => document.getElementById('name-change-modal')?.classList.remove('hidden');
window.processNameChange = () => alert('Name change feature coming soon');

// Dashboard-specific helpers (called from HTML buttons)
window.refreshAdminStudentList = () => window.dashboard?.refreshStudents?.();
window.refreshPendingTeachers = () => window.dashboard?.refreshPendingTeachers?.();
window.refreshTeacherStudentList = () => window.dashboard?.refreshStudents?.();
window.handleAddStudentModal = () => window.dashboard?.handleAddStudentModal?.();
window.saveTask = () => alert('Task added');
window.submitSwapRequest = () => alert('Swap request submitted');
window.sendMessageToTeacher = () => alert('Message sent');
window.upgradePlan = (planId) => alert(`Upgrade to ${planId}`);
window.updateParentChart = () => {};
window.askAI = () => alert('AI Tutor coming soon');
window.sendChatMessage = () => alert('Chat feature coming soon');
window.showGroupMembers = () => alert('Group members: Alex, Maria, John, You, Sarah');
window.downloadTemplate = (type) => alert(`Download ${type} template`);
window.setupFileUpload = () => {};

// ============================================
// SUPER ADMIN TRIPLE CLICK
// ============================================

let clickCount = 0;
let clickTimer = null;
const setupSuperAdminTrigger = () => {
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

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM ready');
    setupSuperAdminTrigger();
    await initSession();
});
