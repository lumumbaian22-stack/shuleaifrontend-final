// js/main.js - APPLICATION ENTRY POINT (Global Version)
// No imports/exports - everything is global

console.log('🚀 main.js loaded');

// Application state
window.App = {
    dashboard: null,
    initialized: false,
    currentUser: null,
    currentRole: null
};

// ============================================
// INITIALIZATION
// ============================================

window.initApplication = async function() {
    console.log('🚀 Initializing ShuleAI...');

    try {
        // 1. Load theme
        loadTheme();
        
        // 2. Check authentication
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('userRole');
        
        if (token && user && role) {
            try {
                window.App.currentUser = JSON.parse(user);
                window.App.currentRole = role;
                console.log('✅ User authenticated:', window.App.currentUser.name);
                
                // Show dashboard
                await showDashboard(role);
                
                // Connect WebSocket if available
                if (typeof connectWebSocket === 'function') {
                    setTimeout(connectWebSocket, 500);
                }
            } catch (e) {
                console.error('Failed to parse user:', e);
                showLandingPage();
            }
        } else {
            console.log('User not authenticated, showing landing page');
            showLandingPage();
        }
        
        window.App.initialized = true;
        console.log('✅ Application initialized');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        if (typeof showToast === 'function') {
            showToast(error.message, 'error');
        }
    }
};

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
}

function showLandingPage() {
    const landingPage = document.getElementById('landing-page');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (landingPage) landingPage.style.display = 'block';
    if (dashboardContainer) dashboardContainer.style.display = 'none';
}

async function showDashboard(role) {
    console.log('📊 Showing dashboard for role:', role);
    
    // Normalize role
    if (role === 'super_admin') role = 'superadmin';
    
    // Hide landing, show dashboard
    const landingPage = document.getElementById('landing-page');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (landingPage) landingPage.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    // Create dashboard based on role
    if (role === 'superadmin' && typeof SuperAdminDashboard !== 'undefined') {
        window.App.dashboard = new SuperAdminDashboard('dashboard-content');
        await window.App.dashboard.init();
    } 
    else if (role === 'admin' && typeof AdminDashboard !== 'undefined') {
        window.App.dashboard = new AdminDashboard('dashboard-content');
        await window.App.dashboard.init();
    }
    else if (role === 'teacher' && typeof TeacherDashboard !== 'undefined') {
        window.App.dashboard = new TeacherDashboard('dashboard-content');
        await window.App.dashboard.init();
    }
    else if (role === 'parent' && typeof ParentDashboard !== 'undefined') {
        window.App.dashboard = new ParentDashboard('dashboard-content');
        await window.App.dashboard.init();
    }
    else if (role === 'student' && typeof StudentDashboard !== 'undefined') {
        window.App.dashboard = new StudentDashboard('dashboard-content');
        await window.App.dashboard.init();
    }
    else {
        console.error('Unknown role or dashboard not loaded:', role);
        document.getElementById('dashboard-content').innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500">Dashboard not available for role: ${role}</p>
                <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
            </div>
        `;
    }
    
    // Update sidebar and user info
    if (typeof updateSidebar === 'function') updateSidebar(role);
    if (typeof updateUserInfo === 'function') updateUserInfo();
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

window.showDashboard = showDashboard;
window.showLandingPage = showLandingPage;
window.showDashboardSection = function(section) {
    if (window.App.dashboard && window.App.dashboard.showSection) {
        window.App.dashboard.showSection(section);
    } else if (typeof window.loadSection === 'function') {
        window.loadSection(section);
    } else {
        console.log('Loading section:', section);
        if (typeof showToast === 'function') {
            showToast('Loading ' + section + '...', 'info');
        }
    }
};

// ============================================
// AUTH FUNCTIONS
// ============================================

window.openAuthModal = function(role, mode) {
    console.log('Opening auth modal for:', role, mode);
    window.currentRole = role;
    
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');
    
    if (!modal || !titleEl || !contentEl) {
        console.error('Auth modal elements not found');
        return;
    }
    
    titleEl.textContent = mode === 'signin' ? `Sign In as ${role}` : `Sign Up as ${role}`;
    contentEl.innerHTML = getAuthForm(role, mode);
    modal.classList.remove('hidden');
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
};

function getAuthForm(role, mode) {
    if (role === 'superadmin') {
        return `
            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Secret Key</label><input type="password" id="auth-secret-key" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
        `;
    }
    
    if (mode === 'signin') {
        return `
            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
        `;
    }
    
    if (role === 'admin') {
        return `
            <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="auth-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">School Name</label><input type="text" id="auth-school-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">School Level</label><select id="auth-school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="both">Both</option></select></div>
            <div><label class="block text-sm font-medium mb-1">Curriculum</label><select id="auth-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="cbc">CBC</option><option value="844">8-4-4</option><option value="british">British</option><option value="american">American</option></select></div>
            <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" id="auth-phone" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div class="bg-blue-50 p-3 rounded-lg"><p class="text-xs text-blue-600">Your school will be pending approval.</p></div>
        `;
    }
    
    if (role === 'teacher') {
        return `
            <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="auth-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div class="flex gap-2"><div class="flex-1"><label class="block text-sm font-medium mb-1">School Code</label><input type="text" id="auth-school-code" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div><div class="flex items-end"><button type="button" onclick="verifySchoolCodeInput()" class="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Verify</button></div></div>
            <div id="school-verify-status" class="text-xs hidden"></div>
            <div><label class="block text-sm font-medium mb-1">Subjects</label><input type="text" id="auth-subjects" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Qualification</label><input type="text" id="auth-qualification" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" id="auth-phone" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
        `;
    }
    
    if (role === 'parent') {
        return `
            <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="auth-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Student's ELIMUID</label><input type="text" id="auth-student-elimuid" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" id="auth-phone" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
        `;
    }
    
    return '';
}

window.openStudentLoginModal = function() {
    window.currentRole = 'student';
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');
    
    if (!modal || !titleEl || !contentEl) return;
    
    titleEl.textContent = 'Student Login';
    contentEl.innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 p-3 rounded-lg"><p class="text-xs text-blue-600">Welcome! Use your ELIMUID and default password: <strong>Student123!</strong></p></div>
            <div><label class="block text-sm font-medium mb-1">ELIMUID</label><input type="text" id="auth-elimuid" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required></div>
            <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required></div>
            <div class="flex justify-end gap-2 mt-6"><button onclick="closeAuthModal()" class="px-4 py-2 border rounded-lg">Cancel</button><button onclick="handleStudentLogin()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Login</button></div>
        </div>
    `;
    modal.classList.remove('hidden');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.handleStudentLogin = async function() {
    const elimuid = document.getElementById('auth-elimuid')?.value;
    const password = document.getElementById('auth-password')?.value;
    
    if (!elimuid || !password) {
        showToast('ELIMUID and password required', 'error');
        return;
    }
    
    showLoading();
    try {
        const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/student/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elimuid, password })
        });
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('userRole', 'student');
            showToast('Login successful!', 'success');
            closeAuthModal();
            window.location.reload();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showToast(error.message || 'Invalid credentials', 'error');
    } finally {
        hideLoading();
    }
};

window.handleAuthSubmit = async function() {
    const modalTitle = document.getElementById('auth-modal-title').textContent;
    const mode = modalTitle.includes('Sign In') ? 'signin' : 'signup';
    const role = window.currentRole;
    
    showLoading();
    
    try {
        if (role === 'superadmin' && mode === 'signin') {
            const email = document.getElementById('auth-email')?.value;
            const password = document.getElementById('auth-password')?.value;
            const secretKey = document.getElementById('auth-secret-key')?.value;
            
            if (!email || !password || !secretKey) {
                showToast('All fields required', 'error');
                return;
            }
            
            const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/super-admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, secretKey })
            });
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                localStorage.setItem('userRole', 'super_admin');
                showToast('Login successful', 'success');
                closeAuthModal();
                window.location.reload();
            } else {
                throw new Error(data.message);
            }
        } 
        else if (mode === 'signin') {
            const email = document.getElementById('auth-email')?.value;
            const password = document.getElementById('auth-password')?.value;
            
            if (!email || !password) {
                showToast('Email and password required', 'error');
                return;
            }
            
            const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                localStorage.setItem('userRole', role);
                if (data.data.school) {
                    localStorage.setItem('school', JSON.stringify(data.data.school));
                }
                showToast('Login successful', 'success');
                closeAuthModal();
                window.location.reload();
            } else {
                throw new Error(data.message);
            }
        }
        else if (role === 'admin' && mode === 'signup') {
            const adminData = {
                name: document.getElementById('auth-name')?.value,
                email: document.getElementById('auth-email')?.value,
                password: document.getElementById('auth-password')?.value,
                phone: document.getElementById('auth-phone')?.value,
                schoolName: document.getElementById('auth-school-name')?.value,
                schoolLevel: document.getElementById('auth-school-level')?.value,
                curriculum: document.getElementById('auth-curriculum')?.value
            };
            
            if (!adminData.name || !adminData.email || !adminData.password || !adminData.schoolName) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/admin/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData)
            });
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                if (data.data?.shortCode) {
                    showToast(`Your school code: ${data.data.shortCode}`, 'info', 10000);
                }
                closeAuthModal();
            } else {
                throw new Error(data.message);
            }
        }
        else if (role === 'teacher' && mode === 'signup') {
            const schoolCode = document.getElementById('auth-school-code')?.value;
            if (!schoolCode) {
                showToast('School code required', 'error');
                return;
            }
            
            const subjects = document.getElementById('auth-subjects')?.value;
            const teacherData = {
                name: document.getElementById('auth-name')?.value,
                email: document.getElementById('auth-email')?.value,
                password: document.getElementById('auth-password')?.value,
                phone: document.getElementById('auth-phone')?.value,
                schoolCode: schoolCode,
                subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
                qualification: document.getElementById('auth-qualification')?.value
            };
            
            if (!teacherData.name || !teacherData.email || !teacherData.password) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/teacher/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherData)
            });
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                closeAuthModal();
            } else {
                throw new Error(data.message);
            }
        }
        else if (role === 'parent' && mode === 'signup') {
            const parentData = {
                name: document.getElementById('auth-name')?.value,
                email: document.getElementById('auth-email')?.value,
                password: document.getElementById('auth-password')?.value,
                phone: document.getElementById('auth-phone')?.value,
                studentElimuid: document.getElementById('auth-student-elimuid')?.value
            };
            
            if (!parentData.name || !parentData.email || !parentData.password || !parentData.studentElimuid) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            const response = await fetch('https://shuleaibackend-32h1.onrender.com/api/auth/parent/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parentData)
            });
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                closeAuthModal();
            } else {
                throw new Error(data.message);
            }
        }
    } catch (error) {
        showToast(error.message || 'Authentication failed', 'error');
    } finally {
        hideLoading();
    }
};

window.verifySchoolCodeInput = async function() {
    const code = document.getElementById('auth-school-code')?.value;
    if (!code) {
        showToast('Please enter a school code', 'error');
        return;
    }
    
    showLoading();
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
            statusDiv.innerHTML = `<i data-lucide="check-circle" class="h-3 w-3 inline mr-1"></i> Verified: ${data.data.schoolName}`;
            statusDiv.classList.remove('hidden');
            showToast(`School found: ${data.data.schoolName}`, 'success');
        } else {
            throw new Error(data.message);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (error) {
        const statusDiv = document.getElementById('school-verify-status');
        statusDiv.className = 'text-xs mt-1 p-2 bg-red-100 text-red-700 rounded-lg';
        statusDiv.innerHTML = `<i data-lucide="x-circle" class="h-3 w-3 inline mr-1"></i> ${error.message}`;
        statusDiv.classList.remove('hidden');
        showToast(error.message || 'Invalid school code', 'error');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } finally {
        hideLoading();
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
};

window.closeNameChangeModal = function() {
    const modal = document.getElementById('name-change-modal');
    if (modal) modal.classList.add('hidden');
};

window.closePasswordChangeModal = function() {
    const modal = document.getElementById('password-change-modal');
    if (modal) modal.classList.add('hidden');
};

window.processNameChange = function() {
    showToast('Name change feature coming soon', 'info');
};

window.logout = function() {
    localStorage.clear();
    window.location.reload();
};

// ============================================
// UI HELPER FUNCTIONS
// ============================================

window.showToast = function(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
    const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
    
    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`;
    toast.innerHTML = `<i data-lucide="${icons[type]}" class="h-5 w-5"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

window.showLoading = function() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
};

window.hideLoading = function() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
};

window.toggleMobileSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
};

window.toggleUserMenu = function() {
    const menu = document.getElementById('user-menu');
    if (menu) menu.classList.toggle('hidden');
};

window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    if (typeof updateChartTheme === 'function') updateChartTheme();
};

window.toggleNotifications = function() {
    showToast('No new notifications', 'info');
};

// Load saved theme
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

// ============================================
// TRIPLE-CLICK FOR SUPER ADMIN
// ============================================

(function() {
    let clickCount = 0;
    let clickTimer = null;
    
    const setupTrigger = function() {
        const trigger = document.getElementById('secret-logo-trigger');
        if (trigger) {
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                clickCount++;
                
                if (clickTimer) clearTimeout(clickTimer);
                clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
                
                if (clickCount === 3) {
                    const superAdminCard = document.getElementById('superadmin-role-card');
                    if (superAdminCard) {
                        superAdminCard.classList.remove('hidden');
                        superAdminCard.style.display = 'flex';
                        if (typeof showToast === 'function') {
                            showToast('🔓 Super Admin access granted!', 'success');
                        }
                    }
                    clickCount = 0;
                    if (clickTimer) clearTimeout(clickTimer);
                }
            });
            return true;
        }
        return false;
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTrigger);
    } else {
        setupTrigger();
        setTimeout(setupTrigger, 500);
    }
})();

// ============================================
// AUTO-LOAD DASHBOARD AFTER LOGIN
// ============================================

(function() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
        setTimeout(() => {
            const landingPage = document.getElementById('landing-page');
            const dashboardContainer = document.getElementById('dashboard-container');
            
            if (landingPage && landingPage.style.display !== 'none') {
                console.log('Auto-loading dashboard for role:', userRole);
                if (landingPage) landingPage.style.display = 'none';
                if (dashboardContainer) dashboardContainer.style.display = 'block';
                showDashboard(userRole);
            }
        }, 100);
    }
})();

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initApplication);
} else {
    window.initApplication();
}
