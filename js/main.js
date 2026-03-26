// js/main.js - COMPLETE WORKING VERSION
console.log('🚀 main.js loaded');

// ============================================
// DASHBOARD LOADER (NO RELOAD)
// ============================================

async function loadDashboard(role) {
    console.log('Loading dashboard for role:', role);
    
    // Normalize role
    let normalizedRole = role;
    if (role === 'super_admin') normalizedRole = 'superadmin';
    
    // Hide landing, show dashboard container
    const landing = document.getElementById('landing-page');
    const dashboardContainer = document.getElementById('dashboard-container');
    if (landing) landing.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    // Get dashboard class
    let DashboardClass = null;
    if (normalizedRole === 'admin') DashboardClass = window.AdminDashboard;
    else if (normalizedRole === 'superadmin') DashboardClass = window.SuperAdminDashboard;
    else if (normalizedRole === 'teacher') DashboardClass = window.TeacherDashboard;
    else if (normalizedRole === 'parent') DashboardClass = window.ParentDashboard;
    else if (normalizedRole === 'student') DashboardClass = window.StudentDashboard;
    
    if (DashboardClass) {
        try {
            window.dashboard = new DashboardClass('dashboard-content');
            await window.dashboard.init();
            console.log('✅ Dashboard loaded successfully');
            return true;
        } catch (error) {
            console.error('Dashboard error:', error);
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500">Failed to load dashboard: ${error.message}</p>
                    <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                </div>
            `;
            return false;
        }
    } else {
        console.error('No dashboard class for role:', normalizedRole);
        document.getElementById('dashboard-content').innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500">Dashboard not available for role: ${role}</p>
                <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
            </div>
        `;
        return false;
    }
}

// ============================================
// INITIALIZE APP (CHECK EXISTING SESSION)
// ============================================

async function initApp() {
    console.log('Initializing app...');

    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (token && role) {
        console.log('Already logged in as:', role);
        await loadDashboard(role);
    } else {
        console.log('Not logged in, showing landing page');
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }
}

// ============================================
// AUTH MODAL FUNCTIONS
// ============================================

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

// ============================================
// LOGIN HANDLER (NO PAGE REFRESH)
// ============================================

window.handleAuthSubmit = async function() {
    const role = window.currentRole;
    const isStudent = role === 'student';
    const elimuid = isStudent ? document.getElementById('auth-elimuid')?.value : null;
    const email = !isStudent ? document.getElementById('auth-email')?.value : null;
    const password = document.getElementById('auth-password')?.value;
    const secretKey = document.getElementById('auth-secret-key')?.value;

    if (!password) {
        alert('Please enter password');
        return;
    }
    if (isStudent && !elimuid) {
        alert('Please enter ELIMUID');
        return;
    }
    if (!isStudent && !email) {
        alert('Please enter email');
        return;
    }
    if (role === 'superadmin' && !secretKey) {
        alert('Secret key required');
        return;
    }

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
            // Save to localStorage
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('userRole', data.data.user.role);
            if (data.data.school) {
                localStorage.setItem('school', JSON.stringify(data.data.school));
            }

            // Close modal
            window.closeAuthModal();

            // Load dashboard directly (NO PAGE REFRESH)
            await loadDashboard(data.data.user.role);

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

// ============================================
// VERIFY SCHOOL CODE
// ============================================

window.verifySchoolCodeInput = async function() {
    const code = document.getElementById('auth-school-code')?.value;
    if (!code) {
        alert('Please enter a school code');
        return;
    }
    
    window.showLoading();
    try {
        const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/verify-school', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolCode: code })
        });
        
        const data = await response.json();
        const statusDiv = document.getElementById('school-verify-status');
        
        if (data.success) {
            statusDiv.className = 'text-xs mt-1 p-2 bg-green-100 text-green-700 rounded-lg';
            statusDiv.innerHTML = `✅ Verified: ${data.data.schoolName}`;
            statusDiv.classList.remove('hidden');
            alert(`School found: ${data.data.schoolName}`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        const statusDiv = document.getElementById('school-verify-status');
        statusDiv.className = 'text-xs mt-1 p-2 bg-red-100 text-red-700 rounded-lg';
        statusDiv.innerHTML = `❌ ${error.message}`;
        statusDiv.classList.remove('hidden');
        alert(error.message);
    } finally {
        window.hideLoading();
    }
};

// ============================================
// UI HELPER FUNCTIONS
// ============================================

window.showNameChangeModal = function() {
    alert('Name change feature coming soon');
};

window.processNameChange = function() {
    alert('Processing...');
};

window.showToast = function(msg, type) {
    alert(msg);
};

window.showLoading = function() {
    document.getElementById('loading-overlay')?.classList.remove('hidden');
};

window.hideLoading = function() {
    document.getElementById('loading-overlay')?.classList.add('hidden');
};

window.toggleMobileSidebar = function() {
    document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
    document.getElementById('mobile-overlay')?.classList.toggle('hidden');
};

window.toggleUserMenu = function() {
    document.getElementById('user-menu')?.classList.toggle('hidden');
};

window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};

window.toggleNotifications = function() {
    alert('No new notifications');
};

window.logout = function() {
    localStorage.clear();
    window.location.reload();
};

window.refreshData = function() {
    if (window.dashboard) window.dashboard.refresh();
};

window.showDashboardSection = function(section) {
    if (window.dashboard && window.dashboard.showSection) {
        window.dashboard.showSection(section);
    } else if (window.router && window.router.navigate) {
        window.router.navigate(section);
    } else {
        console.log('Navigate to:', section);
        alert('Section: ' + section);
    }
};

// Simple router
window.router = {
    navigate: function(section) {
        window.showDashboardSection(section);
    }
};

// ============================================
// TRIPLE CLICK FOR SUPER ADMIN
// ============================================

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
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Start the app
    initApp();
});
