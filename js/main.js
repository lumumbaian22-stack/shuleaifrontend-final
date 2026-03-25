// js/main.js - APPLICATION ENTRY POINT ONLY
// This file should ONLY initialize the application and nothing else

import { store } from './core/store.js';
import { realtime } from './core/realtime.js';
import { router } from './core/router.js';
import { eventBus, EVENTS } from './core/events.js';
import { toast } from './ui/feedback/Toast.js';
import { sidebar } from './ui/layout/Sidebar.js';
import { Header } from './ui/layout/Header.js';
import { Footer } from './ui/layout/Footer.js';
import { MobileNav } from './ui/layout/MobileNav.js';
import { modalManager } from './ui/components/Modal.js';
import { DashboardFactory } from './dashboard/index.js';
import { LandingPage } from './pages/LandingPage.js';
import { auth } from './features/auth/session.js';

class Application {
    constructor() {
        this.dashboard = null;
        this.initialized = false;
    }

    async init() {
        console.log('🚀 Initializing ShuleAI...');

        try {
            // 1. Initialize UI components
            this.initUI();
            
            // 2. Load theme
            this.loadTheme();
            
            // 3. Check authentication
            const isAuthenticated = await store.loadInitialState();
            
            if (!isAuthenticated) {
                await this.showLandingPage();
                this.initialized = true;
                return;
            }
            
            // 4. Get user from store
            const user = store.getState('user');
            const role = store.getState('currentRole');
            
            if (!user || !role) {
                console.error('No user or role found');
                await this.showLandingPage();
                return;
            }
            
            // 5. Update user info in header
            Header.updateUserInfo();
            
            // 6. Initialize realtime connection
            if (user.id) {
                realtime.connect(
                    localStorage.getItem('authToken'),
                    user.id,
                    user.schoolCode
                );
            }
            
            // 7. Setup router
            this.setupRouter();
            
            // 8. Create and show dashboard
            await this.showDashboard(role);
            
            this.initialized = true;
            console.log('✅ Application initialized');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            toast.error(error.message);
        }
    }
    
    initUI() {
        // Render header, footer, etc.
        Header.render('header-container');
        Footer.render();
        MobileNav.render('mobile-nav-container');
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    }
    
    async showLandingPage() {
        await LandingPage.render('app-content');
        document.getElementById('dashboard-container').style.display = 'none';
        document.getElementById('landing-page').style.display = 'block';
    }
    
    async showDashboard(role) {
        console.log('📊 Showing dashboard for role:', role);
        
        // Normalize role
        if (role === 'super_admin') role = 'superadmin';
        
        // Hide landing, show dashboard
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        
        // Create dashboard instance
        this.dashboard = DashboardFactory.create(role, 'dashboard-content');
        await this.dashboard.init();
        
        // Store reference globally
        window.dashboard = this.dashboard;
    }
    
    setupRouter() {
        // Define routes
        router.addRoute('/', () => this.showLandingPage());
        router.addRoute('/dashboard', () => this.dashboard?.refresh());
        router.addRoute('/profile', () => this.dashboard?.showSection?.('profile'));
        router.addRoute('/settings', () => this.dashboard?.showSection?.('settings'));
        router.addRoute('/help', () => this.dashboard?.showSection?.('help'));
        router.addRoute('/students', () => this.dashboard?.showSection?.('students'));
        router.addRoute('/teachers', () => this.dashboard?.showSection?.('teachers'));
        router.addRoute('/classes', () => this.dashboard?.showSection?.('classes'));
        router.addRoute('/attendance', () => this.dashboard?.showSection?.('attendance'));
        router.addRoute('/grades', () => this.dashboard?.showSection?.('grades'));
        router.addRoute('/duty', () => this.dashboard?.showSection?.('duty'));
        router.addRoute('/payments', () => this.dashboard?.showSection?.('payments'));
        router.addRoute('/calendar', () => this.dashboard?.showSection?.('calendar'));
        
        router.init(false);
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.init();
    window.__app = app;
});

// ============================================
// GLOBAL FUNCTIONS (for backward compatibility)
// ============================================

window.showToast = (message, type, duration) => toast.show(message, type, duration);
window.showLoading = () => toast.loading(true);
window.hideLoading = () => toast.loading(false);
window.toggleMobileSidebar = () => sidebar.toggle();
window.toggleUserMenu = () => {
    const menu = document.getElementById('user-menu');
    if (menu) menu.classList.toggle('hidden');
};
window.toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};
window.toggleNotifications = () => toast.info('No new notifications');
window.logout = () => auth.logout();
window.showDashboardSection = (section) => {
    if (window.dashboard?.showSection) {
        window.dashboard.showSection(section);
    } else {
        router.navigate(section);
    }
};
