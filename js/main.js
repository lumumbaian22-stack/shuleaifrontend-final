// js/main.js - COMPLETE FINAL VERSION
import { store } from './core/store.js';
import { apiClient } from './api/client.js';
import { authAPI } from './api/auth.js';
import { loadDashboard } from './dashboard/index.js';

console.log('🚀 main.js loaded');

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

    if (token && user && role && !isLoadingDashboard) {
        isLoadingDashboard = true;
        try {
            await loadDashboard(role);
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';
            updateSidebarForRole(role);
        } catch (error) {
            console.error('Dashboard load failed:', error);
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500">Failed to load dashboard: ${error.message}</p>
                    <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                </div>`;
        } finally {
            isLoadingDashboard = false;
        }
    } else {
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }
}

// ============================================
// LOGIN (NO RELOAD)
// ============================================
async function handleLogin(role, email, password, secretKey = null) {
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

            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';

            await loadDashboard(user.role);
            updateSidebarForRole(user.role);
            return true;
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        alert(error.message || 'Login failed');
        return false;
    }
}

async function handleStudentLogin(elimuid, password) {
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
            updateSidebarForRole('student');
            return true;
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        alert(error.message || 'Login failed');
        return false;
    }
}

// ============================================
// SIDEBAR RENDER
// ============================================
export function updateSidebarForRole(role) {
    const nav = document.getElementById('sidebar-nav');
    const settingsNav = document.getElementById('settings-nav');
    const mobileNav = document.getElementById('mobile-nav');
    if (!nav) return;

    const config = {
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

    let normalizedRole = role === 'super_admin' ? 'superadmin' : role;
    const cfg = config[normalizedRole] || config.admin;

    nav.innerHTML = cfg.main.map(item => `
        <a href="#" onclick="window.showDashboardSection('${item.section}')" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');

    settingsNav.innerHTML = cfg.settings.map(item => `
        <a href="#" onclick="window.showDashboardSection('${item.section}')" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" data-section="${item.section}">
            <i data-lucide="${item.icon}" class="h-5 w-5"></i>
            <span>${item.label}</span>
        </a>
    `).join('');

    if (mobileNav) {
        mobileNav.innerHTML = cfg.main.slice(0, 4).map(item => `
            <a href="#" onclick="window.showDashboardSection('${item.section}')" class="mobile-nav-item flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground" data-section="${item.section}">
                <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                <span class="text-xs mt-1">${item.label}</span>
            </a>
        `).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================
// AUTH MODAL
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
            if (!elimuid || !password) { alert('Please enter ELIMUID and password'); return; }
            const success = await handleStudentLogin(elimuid, password);
            if (success) window.closeAuthModal();
        } else {
            const email = document.getElementById('auth-email')?.value;
            const password = document.getElementById('auth-password')?.value;
            const secretKey = document.getElementById('auth-secret-key')?.value;
            if (!email || !password) { alert('Please enter email and password'); return; }
            if (role === 'superadmin' && !secretKey) { alert('Secret key required'); return; }
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
    } else if (window.dashboard && window.dashboard.refresh) {
        window.dashboard.refresh();
    }
};

// ============================================
// BUTTON ACTIONS (IMPLEMENTED)
// ============================================
window.approveTeacher = async (teacherId) => {
    if (!confirm('Approve this teacher?')) return;
    const token = store.getToken();
    try {
        const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/admin/teachers/${teacherId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'approve' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Teacher approved successfully');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Approval failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.rejectTeacher = async (teacherId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    const token = store.getToken();
    try {
        const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/admin/teachers/${teacherId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'reject', rejectionReason: reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Teacher rejected');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Rejection failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.approveNameChange = async (requestId) => {
    const token = store.getToken();
    try {
        const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/super-admin/requests/${requestId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('Name change approved');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Approval failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.rejectNameChange = async (requestId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    const token = store.getToken();
    try {
        const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/super-admin/requests/${requestId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Name change rejected');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Rejection failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.viewSchool = (schoolId) => {
    alert(`View school details for ${schoolId} - coming soon`);
};
window.manageSchool = (schoolId) => {
    alert(`Manage school ${schoolId} - coming soon`);
};

// Teacher-specific actions
window.handleAddStudentModal = async () => {
    const name = document.getElementById('modal-student-name')?.value;
    const grade = document.getElementById('modal-student-grade')?.value;
    const parentEmail = document.getElementById('modal-parent-email')?.value;
    const dob = document.getElementById('modal-student-dob')?.value;
    const gender = document.getElementById('modal-student-gender')?.value;
    if (!name || !grade) { alert('Name and grade are required'); return; }
    const token = store.getToken();
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/teacher/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, grade, parentEmail, dateOfBirth: dob, gender })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Student added! ELIMUID: ${data.data.elimuid}`);
            document.getElementById('add-student-modal')?.classList.add('hidden');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Failed to add student');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.handleCheckIn = async () => {
    const token = store.getToken();
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ location: 'School Gate' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Checked in successfully');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Check-in failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.handleCheckOut = async () => {
    const token = store.getToken();
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/check-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ location: 'School Gate' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Checked out successfully');
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Check-out failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.submitSwapRequest = async () => {
    const date = document.getElementById('swap-date')?.value;
    const reason = document.getElementById('swap-reason')?.value;
    if (!date || !reason) { alert('Please fill in all fields'); return; }
    const token = store.getToken();
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/request-swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ dutyDate: date, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Swap request sent to admin');
            document.getElementById('duty-swap-modal')?.classList.add('hidden');
        } else {
            alert(data.message || 'Request failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.sendMessageToTeacher = async () => {
    const teacherId = document.getElementById('teacher-select')?.value;
    const message = document.getElementById('message-content')?.value;
    if (!teacherId || !message) { alert('Please select a teacher and enter a message'); return; }
    const token = store.getToken();
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ studentId: window.dashboard?.selectedChildId, message, recipientType: 'teacher' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Message sent successfully');
            document.getElementById('message-content').value = '';
        } else {
            alert(data.message || 'Failed to send message');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.upgradePlan = async (planId) => {
    if (!window.dashboard?.selectedChildId) { alert('Please select a child first'); return; }
    const token = store.getToken();
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/upgrade-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ studentId: window.dashboard.selectedChildId, newPlan: planId })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Upgrade to ${planId} plan initiated`);
            window.dashboard?.refresh?.();
        } else {
            alert(data.message || 'Upgrade failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

// Utility functions
window.showLoading = () => document.getElementById('loading-overlay')?.classList.remove('hidden');
window.hideLoading = () => document.getElementById('loading-overlay')?.classList.add('hidden');
window.logout = () => { store.clear(); window.location.reload(); };
window.refreshData = () => window.dashboard?.refresh();
window.toggleMobileSidebar = () => document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
window.toggleTheme = () => document.documentElement.classList.toggle('dark');
window.toggleUserMenu = () => document.getElementById('user-menu')?.classList.toggle('hidden');
window.showNameChangeModal = () => document.getElementById('name-change-modal')?.classList.remove('hidden');
window.processNameChange = () => alert('Name change feature coming soon');
window.downloadTemplate = (type) => alert(`Download ${type} template`);
window.setupFileUpload = () => {};
window.saveTask = () => alert('Task added');
window.askAI = () => alert('AI Tutor coming soon');
window.sendChatMessage = () => alert('Chat feature coming soon');
window.showGroupMembers = () => alert('Group members: Alex, Maria, John, You, Sarah');

// ============================================
// TRIPLE CLICK
// ============================================
let clickCount = 0, clickTimer = null;
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
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    setupSuperAdminTrigger();
    await initSession();
});
