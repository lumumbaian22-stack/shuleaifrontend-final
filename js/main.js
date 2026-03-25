// js/main.js - ENTRY POINT ONLY
console.log('🚀 main.js loaded');

// Initialize app
async function initApp() {
    console.log('Initializing app...');

    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    console.log('Token:', !!token, 'Role:', role);
    console.log('AdminDashboard exists:', typeof window.AdminDashboard === 'function');

    if (token && role) {
        console.log('User logged in as:', role);

        // Hide landing, show dashboard container
        const landing = document.getElementById('landing-page');
        const dashboardContainer = document.getElementById('dashboard-container');
        if (landing) landing.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';

        // Normalize role
        let normalizedRole = role === 'super_admin' ? 'superadmin' : role;

        // Get dashboard class
        let DashboardClass = null;
        if (normalizedRole === 'admin') DashboardClass = window.AdminDashboard;
        else if (normalizedRole === 'superadmin') DashboardClass = window.SuperAdminDashboard;
        else if (normalizedRole === 'teacher') DashboardClass = window.TeacherDashboard;
        else if (normalizedRole === 'parent') DashboardClass = window.ParentDashboard;
        else if (normalizedRole === 'student') DashboardClass = window.StudentDashboard;

        if (DashboardClass) {
            try {
                console.log('Creating dashboard instance for:', normalizedRole);
                window.dashboard = new DashboardClass('dashboard-content');
                await window.dashboard.init();
                console.log('✅ Dashboard initialized');
            } catch (error) {
                console.error('❌ Dashboard init failed:', error);
                document.getElementById('dashboard-content').innerHTML = `
                    <div class="text-center py-12">
                        <p class="text-red-500">Failed to load dashboard: ${error.message}</p>
                        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                    </div>
                `;
            }
        } else {
            console.error('No dashboard class for role:', normalizedRole);
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500">Dashboard not available for role: ${role}</p>
                    <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                </div>
            `;
        }
    } else {
        console.log('Not logged in, showing landing page');
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }
}

// Router
window.router = {
    navigate: function(section) {
        console.log('Navigate to:', section);
        if (window.dashboard && window.dashboard.showSection) {
            window.dashboard.showSection(section);
        } else {
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <h2 class="text-2xl font-bold mb-4">${section}</h2>
                    <p class="text-muted-foreground">This section is under development.</p>
                    <button onclick="window.dashboard?.refresh()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Back to Dashboard</button>
                </div>
            `;
        }
    }
};

// Auth modal functions
window.openAuthModal = function(role, mode) {
    console.log('Open auth modal:', role, mode);
    window.currentRole = role;
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');

    if (!modal || !titleEl || !contentEl) return;

    titleEl.textContent = mode === 'signin' ? `Sign In as ${role}` : `Sign Up as ${role}`;

    if (role === 'superadmin') {
        contentEl.innerHTML = `
            <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded-lg p-2 mb-2"></div>
            <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded-lg p-2 mb-2"></div>
            <div><input type="password" id="auth-secret-key" placeholder="Secret Key" class="w-full border rounded-lg p-2"></div>
        `;
    } else if (mode === 'signin') {
        contentEl.innerHTML = `
            <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded-lg p-2 mb-2"></div>
            <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded-lg p-2"></div>
        `;
    } else {
        contentEl.innerHTML = `
            <div><input type="text" id="auth-name" placeholder="Full Name" class="w-full border rounded-lg p-2 mb-2"></div>
            <div><input type="email" id="auth-email" placeholder="Email" class="w-full border rounded-lg p-2 mb-2"></div>
            <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded-lg p-2"></div>
        `;
    }

    modal.classList.remove('hidden');
};

window.openStudentLoginModal = function() {
    window.currentRole = 'student';
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');

    titleEl.textContent = 'Student Login';
    contentEl.innerHTML = `
        <div><input type="text" id="auth-elimuid" placeholder="ELIMUID" class="w-full border rounded-lg p-2 mb-2"></div>
        <div><input type="password" id="auth-password" placeholder="Password" class="w-full border rounded-lg p-2"></div>
        <div class="mt-4 text-center text-sm text-muted-foreground">Default password: <strong>Student123!</strong></div>
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

    if (!password) return alert('Please enter password');
    if (isStudent && !elimuid) return alert('Please enter ELIMUID');
    if (!isStudent && !email) return alert('Please enter email');
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

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

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
    } catch (error) {
        alert('Login failed: ' + error.message);
    } finally {
        window.hideLoading();
    }
};

window.handleStudentLogin = window.handleAuthSubmit;

// UI helpers
window.verifySchoolCodeInput = () => alert('School code verification');
window.showNameChangeModal = () => alert('Name change feature');
window.processNameChange = () => alert('Processing...');
window.showToast = (msg, type) => alert(msg);
window.showLoading = () => document.getElementById('loading-overlay')?.classList.remove('hidden');
window.hideLoading = () => document.getElementById('loading-overlay')?.classList.add('hidden');
window.toggleMobileSidebar = () => document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
window.toggleTheme = () => document.documentElement.classList.toggle('dark');
window.logout = () => { localStorage.clear(); window.location.reload(); };
window.refreshData = () => window.dashboard?.refresh();
window.showDashboardSection = window.router.navigate;

// Triple click for super admin
let clickCount = 0;
let clickTimer = null;
document.addEventListener('DOMContentLoaded', function() {
    const trigger = document.getElementById('secret-logo-trigger');
    if (trigger) {
        trigger.addEventListener('click', function() {
            clickCount++;
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => clickCount = 0, 2000);
            if (clickCount === 3) {
                const card = document.getElementById('superadmin-role-card');
                if (card) card.classList.remove('hidden');
                clickCount = 0;
                if (clickTimer) clearTimeout(clickTimer);
            }
        });
    }

    // Start app
    initApp();
});
