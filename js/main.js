// js/main.js - SIMPLIFIED WORKING VERSION
console.log('🚀 main.js loaded');

// Global state
window.App = {
    dashboard: null,
    currentUser: null,
    currentRole: null
};

// ============================================
// INITIALIZATION
// ============================================

window.initApplication = async function() {
    console.log('🚀 Initializing ShuleAI...');

    try {
        // Load theme
        loadTheme();
        
        // Check authentication
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        const role = localStorage.getItem('userRole');
        
        console.log('Auth check:', { token: !!token, userStr: !!userStr, role });
        
        if (token && userStr && role) {
            try {
                window.App.currentUser = JSON.parse(userStr);
                window.App.currentRole = role;
                console.log('✅ User authenticated:', window.App.currentUser.name);
                
                // Show dashboard
                await showDashboard(role);
                
            } catch (e) {
                console.error('Failed to parse user:', e);
                showLandingPage();
            }
        } else {
            console.log('User not authenticated, showing landing page');
            showLandingPage();
        }
        
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

// ============================================
// DASHBOARD RENDERING - SIMPLE VERSION
// ============================================

async function showDashboard(role) {
    console.log('📊 Showing dashboard for role:', role);
    
    // Normalize role
    if (role === 'super_admin') role = 'superadmin';
    
    // Hide landing, show dashboard
    const landingPage = document.getElementById('landing-page');
    const dashboardContainer = document.getElementById('dashboard-container');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (landingPage) landingPage.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    if (!dashboardContent) {
        console.error('Dashboard content container not found');
        return;
    }
    
    // Get user data
    const user = window.App.currentUser || {};
    const school = JSON.parse(localStorage.getItem('school') || '{}');
    
    // Render simple dashboard based on role
    if (role === 'admin') {
        dashboardContent.innerHTML = renderAdminDashboard(user, school);
    } 
    else if (role === 'superadmin') {
        dashboardContent.innerHTML = renderSuperAdminDashboard(user);
    }
    else if (role === 'teacher') {
        dashboardContent.innerHTML = renderTeacherDashboard(user);
    }
    else if (role === 'parent') {
        dashboardContent.innerHTML = renderParentDashboard(user);
    }
    else if (role === 'student') {
        dashboardContent.innerHTML = renderStudentDashboard(user);
    }
    else {
        dashboardContent.innerHTML = `<div class="text-center py-12"><p class="text-red-500">Unknown role: ${role}</p><button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button></div>`;
    }
    
    // Update sidebar
    updateSidebar(role);
    
    // Update user info in header
    updateUserInfo();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// ============================================
// DASHBOARD RENDERERS
// ============================================

function renderAdminDashboard(user, school) {
    return `
        <div class="space-y-6 animate-fade-in">
            <!-- School Profile Card -->
            <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-2xl font-bold">${school.name || 'Your School'}</h2>
                            <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">${school.status || 'Active'}</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <p class="text-sm"><span class="font-mono bg-muted px-2 py-1 rounded">Short Code: ${school.shortCode || 'SHL-XXXXX'}</span></p>
                            <button onclick="window.showNameChangeModal()" class="text-sm text-primary hover:underline">Change School Name</button>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                        <p class="text-xs text-muted-foreground">Share this code with teachers</p>
                        <p class="text-lg font-mono font-bold">${school.shortCode || 'SHL-XXXXX'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border bg-card p-6">
                    <div class="flex items-center justify-between">
                        <div><p class="text-sm font-medium text-muted-foreground">Total Students</p><h3 class="text-2xl font-bold mt-1">0</h3></div>
                        <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center"><i data-lucide="users" class="h-6 w-6 text-blue-600"></i></div>
                    </div>
                </div>
                <div class="rounded-xl border bg-card p-6">
                    <div class="flex items-center justify-between">
                        <div><p class="text-sm font-medium text-muted-foreground">Teachers</p><h3 class="text-2xl font-bold mt-1">0</h3><p class="text-xs text-green-600 mt-1">0 pending approval</p></div>
                        <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center"><i data-lucide="user-plus" class="h-6 w-6 text-violet-600"></i></div>
                    </div>
                </div>
                <div class="rounded-xl border bg-card p-6">
                    <div class="flex items-center justify-between">
                        <div><p class="text-sm font-medium text-muted-foreground">Classes</p><h3 class="text-2xl font-bold mt-1">0</h3></div>
                        <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center"><i data-lucide="book-open" class="h-6 w-6 text-emerald-600"></i></div>
                    </div>
                </div>
                <div class="rounded-xl border bg-card p-6">
                    <div class="flex items-center justify-between">
                        <div><p class="text-sm font-medium text-muted-foreground">Attendance Rate</p><h3 class="text-2xl font-bold mt-1">94%</h3></div>
                        <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center"><i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i></div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="grid gap-4 md:grid-cols-3">
                <button onclick="window.showDashboardSection('students')" class="p-6 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="users" class="h-8 w-8 text-green-600 mb-3"></i>
                    <h4 class="font-semibold">Student Management</h4>
                    <p class="text-sm text-muted-foreground">View and manage all students</p>
                </button>
                <button onclick="window.showDashboardSection('teachers')" class="p-6 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="user-plus" class="h-8 w-8 text-blue-600 mb-3"></i>
                    <h4 class="font-semibold">Teacher Management</h4>
                    <p class="text-sm text-muted-foreground">Manage teachers and approvals</p>
                </button>
                <button onclick="window.showDashboardSection('settings')" class="p-6 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="settings" class="h-8 w-8 text-purple-600 mb-3"></i>
                    <h4 class="font-semibold">School Settings</h4>
                    <p class="text-sm text-muted-foreground">Configure curriculum and subjects</p>
                </button>
            </div>
            
            <!-- Welcome Message -->
            <div class="rounded-xl border bg-card p-6 text-center">
                <i data-lucide="check-circle" class="h-12 w-12 mx-auto text-green-500 mb-3"></i>
                <h3 class="text-xl font-semibold mb-2">Welcome back, ${user.name || 'Admin'}!</h3>
                <p class="text-muted-foreground">Your school dashboard is ready. Use the buttons above to manage your school.</p>
            </div>
        </div>
    `;
}

function renderSuperAdminDashboard(user) {
    return `
        <div class="space-y-6 animate-fade-in">
            <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
                <h2 class="text-2xl font-bold">Super Admin Dashboard</h2>
                <p class="text-muted-foreground mt-2">Welcome, ${user.name || 'Super Admin'}! Manage all schools and platform settings.</p>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border bg-card p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Total Schools</p><h3 class="text-2xl font-bold">0</h3></div><div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center"><i data-lucide="building-2" class="h-6 w-6 text-blue-600"></i></div></div></div>
                <div class="rounded-xl border bg-card p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Active Schools</p><h3 class="text-2xl font-bold">0</h3></div><div class="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center"><i data-lucide="check-circle" class="h-6 w-6 text-green-600"></i></div></div></div>
                <div class="rounded-xl border bg-card p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Pending Approvals</p><h3 class="text-2xl font-bold">0</h3></div><div class="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center"><i data-lucide="clock" class="h-6 w-6 text-yellow-600"></i></div></div></div>
                <div class="rounded-xl border bg-card p-6"><div class="flex items-center justify-between"><div><p class="text-sm text-muted-foreground">Total Users</p><h3 class="text-2xl font-bold">0</h3></div><div class="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center"><i data-lucide="users" class="h-6 w-6 text-purple-600"></i></div></div></div>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2">
                <button onclick="window.showDashboardSection('schools')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="building-2" class="h-8 w-8 mx-auto mb-3 text-blue-600"></i><h4 class="font-semibold text-center">Manage Schools</h4><p class="text-sm text-muted-foreground text-center">View and manage all registered schools</p></button>
                <button onclick="window.showDashboardSection('settings')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="settings" class="h-8 w-8 mx-auto mb-3 text-purple-600"></i><h4 class="font-semibold text-center">Platform Settings</h4><p class="text-sm text-muted-foreground text-center">Configure global platform settings</p></button>
            </div>
        </div>
    `;
}

function renderTeacherDashboard(user) {
    return `
        <div class="space-y-6 animate-fade-in">
            <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
                <h2 class="text-2xl font-bold">Teacher Dashboard</h2>
                <p class="text-muted-foreground mt-2">Welcome back, ${user.name || 'Teacher'}!</p>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My Students</p><h3 class="text-2xl font-bold">0</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Class Average</p><h3 class="text-2xl font-bold">0%</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Attendance Today</p><h3 class="text-2xl font-bold">0/0</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Pending Tasks</p><h3 class="text-2xl font-bold">0</h3></div></div>
            </div>
            
            <div class="grid gap-4 md:grid-cols-4">
                <button onclick="window.showDashboardSection('students')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="users" class="h-6 w-6 mx-auto mb-2 text-blue-600"></i><p class="text-center font-medium">My Students</p></button>
                <button onclick="window.showDashboardSection('attendance')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="calendar-check" class="h-6 w-6 mx-auto mb-2 text-green-600"></i><p class="text-center font-medium">Attendance</p></button>
                <button onclick="window.showDashboardSection('grades')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="trending-up" class="h-6 w-6 mx-auto mb-2 text-purple-600"></i><p class="text-center font-medium">Grades</p></button>
                <button onclick="window.showDashboardSection('duty')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="clock" class="h-6 w-6 mx-auto mb-2 text-amber-600"></i><p class="text-center font-medium">My Duty</p></button>
            </div>
        </div>
    `;
}

function renderParentDashboard(user) {
    return `
        <div class="space-y-6 animate-fade-in">
            <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                <h2 class="text-2xl font-bold">Parent Dashboard</h2>
                <p class="text-muted-foreground mt-2">Welcome, ${user.name || 'Parent'}! Track your child's progress.</p>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Attendance</p><h3 class="text-2xl font-bold">95%</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Class Average</p><h3 class="text-2xl font-bold">82%</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Homework</p><h3 class="text-2xl font-bold">3</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Fee Balance</p><h3 class="text-2xl font-bold">$250</h3></div></div>
            </div>
            
            <div class="grid gap-4 md:grid-cols-3">
                <button onclick="window.showDashboardSection('progress')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="trending-up" class="h-8 w-8 mx-auto mb-3 text-green-600"></i><h4 class="font-semibold text-center">Academic Progress</h4></button>
                <button onclick="window.showDashboardSection('payments')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="credit-card" class="h-8 w-8 mx-auto mb-3 text-blue-600"></i><h4 class="font-semibold text-center">Payments</h4></button>
                <button onclick="window.showDashboardSection('chat')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="message-circle" class="h-8 w-8 mx-auto mb-3 text-purple-600"></i><h4 class="font-semibold text-center">Message Teacher</h4></button>
            </div>
        </div>
    `;
}

function renderStudentDashboard(user) {
    return `
        <div class="space-y-6 animate-fade-in">
            <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
                <h2 class="text-2xl font-bold">Student Dashboard</h2>
                <p class="text-muted-foreground mt-2">Welcome, ${user.name || 'Student'}! Keep track of your learning.</p>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My ELIMUID</p><h3 class="text-lg font-mono font-bold">${user.elimuid || 'ELI-2024-001'}</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Class Average</p><h3 class="text-2xl font-bold">82%</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My Attendance</p><h3 class="text-2xl font-bold">95%</h3></div></div>
                <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Study Groups</p><h3 class="text-2xl font-bold">3</h3></div></div>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2">
                <button onclick="window.showDashboardSection('grades')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="trending-up" class="h-8 w-8 mx-auto mb-3 text-green-600"></i><h4 class="font-semibold text-center">My Grades</h4></button>
                <button onclick="window.showDashboardSection('attendance')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="calendar-check" class="h-8 w-8 mx-auto mb-3 text-blue-600"></i><h4 class="font-semibold text-center">Attendance</h4></button>
            </div>
        </div>
    `;
}

// ============================================
// SIDEBAR FUNCTIONS
// ============================================

function updateSidebar(role) {
    const nav = document.getElementById('sidebar-nav');
    const settingsNav = document.getElementById('settings-nav');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (!nav) return;
    
    const sidebarConfig = {
        superadmin: {
            main: [
                { icon: 'shield', label: 'Dashboard', section: 'dashboard' },
                { icon: 'building-2', label: 'Schools', section: 'schools' },
                { icon: 'settings', label: 'Settings', section: 'settings' }
            ],
            settings: [
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        admin: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'users', label: 'Students', section: 'students' },
                { icon: 'user-plus', label: 'Teachers', section: 'teachers' },
                { icon: 'book-open', label: 'Classes', section: 'classes' },
                { icon: 'clock', label: 'Duty', section: 'duty' }
            ],
            settings: [
                { icon: 'settings', label: 'Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        teacher: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'users', label: 'My Students', section: 'students' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'trending-up', label: 'Grades', section: 'grades' },
                { icon: 'clock', label: 'My Duty', section: 'duty' }
            ],
            settings: [
                { icon: 'settings', label: 'Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        parent: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'trending-up', label: 'Progress', section: 'progress' },
                { icon: 'credit-card', label: 'Payments', section: 'payments' },
                { icon: 'message-circle', label: 'Messages', section: 'chat' }
            ],
            settings: [
                { icon: 'settings', label: 'Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        },
        student: {
            main: [
                { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                { icon: 'trending-up', label: 'My Grades', section: 'grades' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'message-circle', label: 'Chat', section: 'chat' }
            ],
            settings: [
                { icon: 'settings', label: 'Settings', section: 'settings' },
                { icon: 'help-circle', label: 'Help', section: 'help' }
            ]
        }
    };
    
    const config = sidebarConfig[role] || sidebarConfig.admin;
    
    nav.innerHTML = config.main.map(item => `
        <a href="#" onclick="window.showDashboardSection('${item.section}')" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    settingsNav.innerHTML = config.settings.map(item => `
        <a href="#" onclick="window.showDashboardSection('${item.section}')" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    if (mobileNav) {
        mobileNav.innerHTML = config.main.slice(0, 4).map(item => `
            <a href="#" onclick="window.showDashboardSection('${item.section}')" class="mobile-nav-item flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground" data-section="${item.section}">
                <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                <span class="text-xs mt-1">${item.label}</span>
            </a>
        `).join('');
    }
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

function updateUserInfo() {
    const user = window.App.currentUser || {};
    const name = user.name || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const userInitials = document.getElementById('user-initials');
    const userName = document.getElementById('user-name');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    
    if (userInitials) userInitials.textContent = initials;
    if (userName) userName.textContent = name;
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownEmail) dropdownEmail.textContent = user.email || '';
}

// ============================================
// SECTION HANDLER
// ============================================

window.showDashboardSection = function(section) {
    console.log('Showing section:', section);
    
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;
    
    const pageTitle = document.getElementById('page-title');
    const sectionTitles = {
        dashboard: 'Dashboard',
        students: 'Students',
        teachers: 'Teachers',
        classes: 'Classes',
        attendance: 'Attendance',
        grades: 'Grades',
        duty: 'Duty Management',
        progress: 'Academic Progress',
        payments: 'Payments',
        chat: 'Messages',
        settings: 'Settings',
        help: 'Help Center',
        schools: 'School Management'
    };
    
    if (pageTitle) pageTitle.textContent = sectionTitles[section] || section;
    
    // Simple placeholder for sections
    dashboardContent.innerHTML = `
        <div class="text-center py-12">
            <i data-lucide="loader-circle" class="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin"></i>
            <h2 class="text-2xl font-bold mb-2">${sectionTitles[section] || section}</h2>
            <p class="text-muted-foreground">This section is under development. Check back soon!</p>
            <button onclick="window.showDashboardSection('dashboard')" class="mt-6 px-4 py-2 bg-primary text-white rounded-lg">Back to Dashboard</button>
        </div>
    `;
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('bg-sidebar-accent', 'text-sidebar-accent-foreground');
        if (link.dataset.section === section) {
            link.classList.add('bg-sidebar-accent', 'text-sidebar-accent-foreground');
        }
    });
};

// ============================================
// AUTH FUNCTIONS (from your existing code)
// ============================================

window.openAuthModal = function(role, mode) {
    console.log('Opening auth modal for:', role, mode);
    window.currentRole = role;
    
    const modal = document.getElementById('auth-modal');
    const titleEl = document.getElementById('auth-modal-title');
    const contentEl = document.getElementById('auth-modal-content');
    
    if (!modal || !titleEl || !contentEl) return;
    
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
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
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

window.showNameChangeModal = function() {
    const modal = document.getElementById('name-change-modal');
    if (modal) modal.classList.remove('hidden');
};

window.processNameChange = function() {
    showToast('Name change feature coming soon', 'info');
};

window.logout = function() {
    localStorage.clear();
    window.location.reload();
};

// ============================================
// UI HELPERS
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
};

window.toggleNotifications = function() {
    showToast('No new notifications', 'info');
};

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
// START APPLICATION
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initApplication);
} else {
    window.initApplication();
}
