// js/main.js - APPLICATION ENTRY POINT ONLY
console.log('🚀 main.js loaded');

// Application state
window.App = {
    dashboard: null,
    currentUser: null,
    currentRole: null
};

// Initialize application
window.initApplication = async function() {
    console.log('Initializing...');
    
    // Check if logged in
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
        try {
            window.App.currentUser = JSON.parse(localStorage.getItem('user'));
            window.App.currentRole = role;
            
            // Show dashboard
            await showDashboard(role);
        } catch (e) {
            console.error('Error:', e);
            showLandingPage();
        }
    } else {
        showLandingPage();
    }
};

function showLandingPage() {
    const landing = document.getElementById('landing-page');
    const dashboard = document.getElementById('dashboard-container');
    if (landing) landing.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
}

async function showDashboard(role) {
    console.log('Showing dashboard for:', role);
    
    // Hide landing, show dashboard container
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    
    // Create dashboard based on role
    const DashboardClass = {
        'admin': AdminDashboard,
        'super_admin': SuperAdminDashboard,
        'teacher': TeacherDashboard,
        'parent': ParentDashboard,
        'student': StudentDashboard
    }[role];
    
    if (DashboardClass) {
        window.App.dashboard = new DashboardClass('dashboard-content');
        await window.App.dashboard.init();
        window.dashboard = window.App.dashboard;
    } else {
        console.error('No dashboard for role:', role);
        document.getElementById('dashboard-content').innerHTML = '<div class="text-center py-12"><p class="text-red-500">Dashboard not available</p></div>';
    }
    
    // Update sidebar and user info
    if (typeof updateSidebar === 'function') updateSidebar(role);
    if (typeof updateUserInfo === 'function') updateUserInfo();
}

// Update user info in header
function updateUserInfo() {
    const user = window.App.currentUser || {};
    const name = user.name || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const els = ['user-initials', 'user-name', 'dropdown-user-name'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = id === 'user-initials' ? initials : name;
    });
    
    const emailEl = document.getElementById('dropdown-user-email');
    if (emailEl) emailEl.textContent = user.email || '';
}

// Simple sidebar update
function updateSidebar(role) {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    
    const items = role === 'admin' 
        ? [{ icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' }, { icon: 'users', label: 'Students', section: 'students' }, { icon: 'user-plus', label: 'Teachers', section: 'teachers' }, { icon: 'settings', label: 'Settings', section: 'settings' }]
        : [{ icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' }, { icon: 'settings', label: 'Settings', section: 'settings' }];
    
    nav.innerHTML = items.map(item => `
        <a href="#" onclick="window.router?.navigate('${item.section}')" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent sidebar-link" data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initApplication);
} else {
    window.initApplication();
}

// Global helpers
window.showToast = function(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-amber-500' };
    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2`;
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

window.toggleMobileSidebar = () => {
    document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
    document.getElementById('mobile-overlay')?.classList.toggle('hidden');
};

window.toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};

window.logout = () => {
    localStorage.clear();
    window.location.reload();
};

window.refreshData = () => {
    if (window.App.dashboard) window.App.dashboard.refresh();
};
