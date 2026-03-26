// js/main.js - ES MODULE ENTRY POINT
import { store } from './core/store.js';
import { loadDashboard } from './dashboard/index.js';
import { handleLogin, handleStudentLogin } from './features/auth/login.js';
import { getInitials, timeAgo, formatDate, escapeHtml } from './core/utils.js';

console.log('🚀 main.js loaded (ES Module)');

// Make globally available for onclick handlers
window.store = store;
window.handleLogin = handleLogin;
window.handleStudentLogin = handleStudentLogin;
window.getInitials = getInitials;
window.timeAgo = timeAgo;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;

// Wait for DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM ready');
    
    // Check existing session
    const user = store.getUser();
    const token = store.getToken();
    const role = localStorage.getItem('userRole');
    
    if (user && token && role) {
        console.log('Found existing session, loading dashboard');
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        
        try {
            await loadDashboard(role);
        } catch (error) {
            console.error('Dashboard load failed:', error);
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500">Failed to load dashboard: ${error.message}</p>
                    <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                </div>
            `;
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
            if (success) window.closeAuthModal();
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
