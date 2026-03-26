// js/main.js - ENTRY POINT ONLY
console.log('🚀 main.js loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM ready, checking for existing session...');
    
    // Check if user is already logged in
    const user = store.getUser();
    const token = store.getToken();
    const role = localStorage.getItem('userRole');
    
    console.log('Existing session:', { hasUser: !!user, hasToken: !!token, role });
    
    if (user && token && role) {
        console.log('Found existing session, loading dashboard...');
        
        // Hide landing, show dashboard
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        
        // Load dashboard
        try {
            await loadDashboard(role);
            console.log('Dashboard loaded successfully');
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500">Failed to load dashboard: ${error.message}</p>
                    <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
                </div>
            `;
        }
    } else {
        console.log('No existing session, showing landing page');
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('dashboard-container').style.display = 'none';
    }
});

// ============================================
// AUTH MODAL FUNCTIONS (Global)
// ============================================

window.openAuthModal = function(role, mode) {
    console.log('Open auth modal:', role, mode);
    window.currentRole = role;
    window.currentMode = mode;
    
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
    window.currentMode = 'signin';
    
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
            await handleStudentLogin(elimuid, password);
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
            
            await handleLogin(role, email, password, secretKey);
        }
        window.closeAuthModal();
    } else {
        // Signup - implement if needed
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
    alert(message); // Simple fallback
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

// ============================================
// TRIPLE CLICK FOR SUPER ADMIN
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
                if (clickTimer) clearTimeout(clickTimer);
            }
        });
    }
};

// Initialize trigger
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSuperAdminTrigger);
} else {
    setupSuperAdminTrigger();
}
