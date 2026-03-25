// js/main.js
import { store } from './core/store.js';
import { realtime } from './core/realtime.js';
import { router } from './core/router.js';
import { eventBus, EVENTS } from './core/events.js';
import { toast } from './ui/feedback/Toast.js';
import { sidebar } from './ui/layout/Sidebar.js';
import { modalManager } from './ui/components/Modal.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { HelpPage } from './pages/HelpPage.js';
import { useAuth } from './hooks/useAuth.js';

class Application {
    constructor() {
        this.currentPage = null;
        this.initialized = false;
    }

    async init() {
        console.log('🚀 Initializing ShuleAI...');

        try {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            this.loadTheme();
            
            // Render layout components
            this.renderLayout();
            
            const authenticated = await store.loadInitialState();

            if (!authenticated) {
                await LandingPage.render('app-content');
                this.setupLandingPageListeners();
                this.initialized = true;
                return;
            }

            this.setupRouter();
            router.init(false);

            const user = store.getState('user');
            if (user?.id) {
                realtime.connect(localStorage.getItem('authToken'), user.id, user.schoolCode);
            }

            this.setupGlobalListeners();
            this.initialized = true;
            console.log('✅ Application initialized');

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            toast.error(error.message);
        }
    }

    renderLayout() {
        // Header
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
                    <button onclick="window.sidebar?.toggle()" class="lg:hidden p-2 hover:bg-accent rounded-lg touch-target">
                        <i data-lucide="menu" class="h-5 w-5"></i>
                    </button>
                    <div class="flex-1">
                        <h1 id="page-title" class="text-xl font-semibold">Dashboard</h1>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="hidden md:flex relative">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"></i>
                            <input type="text" placeholder="Search..." class="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        </div>
                        <button onclick="window.notifications?.toggle()" class="relative p-2 hover:bg-accent rounded-lg touch-target" id="notification-btn">
                            <i data-lucide="bell" class="h-5 w-5"></i>
                            <span id="notification-badge" class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 hidden"></span>
                        </button>
                        <button onclick="window.theme.toggle()" class="p-2 hover:bg-accent rounded-lg touch-target">
                            <i data-lucide="sun" class="h-5 w-5 hidden dark:block"></i>
                            <i data-lucide="moon" class="h-5 w-5 block dark:hidden"></i>
                        </button>
                        <div class="relative">
                            <button onclick="window.userMenu?.toggle()" class="flex items-center gap-2 p-2 hover:bg-accent rounded-lg">
                                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm">
                                    <span id="user-initials">JD</span>
                                </div>
                                <span class="hidden md:block text-sm font-medium" id="user-name">John Doe</span>
                                <i data-lucide="chevron-down" class="h-4 w-4 hidden md:block"></i>
                            </button>
                            <div id="user-menu" class="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg hidden animate-fade-in">
                                <div class="px-3 py-2 border-b">
                                    <p class="text-sm font-medium" id="dropdown-user-name">John Doe</p>
                                    <p class="text-xs text-muted-foreground" id="dropdown-user-email">john@shuleai.edu</p>
                                </div>
                                <a href="#" onclick="window.router.navigate('profile')" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md">
                                    <i data-lucide="user" class="h-4 w-4"></i> Profile
                                </a>
                                <a href="#" onclick="window.router.navigate('settings')" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md">
                                    <i data-lucide="settings" class="h-4 w-4"></i> Settings
                                </a>
                                <div class="border-t mt-2 pt-2">
                                    <button onclick="window.auth.logout()" class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                        <i data-lucide="log-out" class="h-4 w-4"></i> Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            `;
        }
        
        // Footer
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            const year = new Date().getFullYear();
            footerContainer.innerHTML = `
                <footer class="bg-card border-t border-border py-12">
                    <div class="container mx-auto px-4">
                        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                        <i data-lucide="graduation-cap" class="h-4 w-4 text-white"></i>
                                    </div>
                                    <span class="text-lg font-bold">ShuleAI</span>
                                </div>
                                <p class="text-sm text-muted-foreground">Modern school management for the digital age. Empowering education through intelligence.</p>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-4">Quick Links</h4>
                                <ul class="space-y-2 text-sm text-muted-foreground">
                                    <li><a href="#" class="hover:text-foreground transition-colors">About Us</a></li>
                                    <li><a href="#" class="hover:text-foreground transition-colors">Features</a></li>
                                    <li><a href="#" class="hover:text-foreground transition-colors">Pricing</a></li>
                                    <li><a href="#" class="hover:text-foreground transition-colors">Blog</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-4">Support</h4>
                                <ul class="space-y-2 text-sm text-muted-foreground">
                                    <li><a href="#" class="hover:text-foreground transition-colors">Help Center</a></li>
                                    <li><a href="#" class="hover:text-foreground transition-colors">Documentation</a></li>
                                    <li><a href="#" class="hover:text-foreground transition-colors">Contact Us</a></li>
                                    <li><a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-4">Connect</h4>
                                <div class="flex gap-3">
                                    <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="twitter" class="h-4 w-4"></i></a>
                                    <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="linkedin" class="h-4 w-4"></i></a>
                                    <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="github" class="h-4 w-4"></i></a>
                                    <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="mail" class="h-4 w-4"></i></a>
                                </div>
                                <p class="text-sm text-muted-foreground mt-4">© ${year} ShuleAI. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            `;
        }
        
        // Mobile Nav
        const mobileNavContainer = document.getElementById('mobile-nav-container');
        if (mobileNavContainer) {
            mobileNavContainer.innerHTML = `
                <nav class="mobile-bottom-nav lg:hidden safe-area-bottom fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t z-40 pb-[env(safe-area-inset-bottom)]">
                    <div class="flex items-center justify-around" id="mobile-nav"></div>
                </nav>
            `;
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }
        });
    }

    setupRouter() {
        router.addRoute('/', () => this.showPage('landing'));
        router.addRoute('/dashboard', () => this.showPage('dashboard'));
        router.addRoute('/profile', () => this.showPage('profile'));
        router.addRoute('/settings', () => this.showPage('settings'));
        router.addRoute('/help', () => this.showPage('help'));
        router.addRoute('/students', () => this.showPage('dashboard', 'students'));
        router.addRoute('/teachers', () => this.showPage('dashboard', 'teachers'));
        router.addRoute('/classes', () => this.showPage('dashboard', 'classes'));
        router.addRoute('/attendance', () => this.showPage('dashboard', 'attendance'));
        router.addRoute('/grades', () => this.showPage('dashboard', 'grades'));
        router.addRoute('/duty', () => this.showPage('dashboard', 'duty'));
        router.addRoute('/payments', () => this.showPage('dashboard', 'payments'));
        router.addRoute('/calendar', () => this.showPage('dashboard', 'calendar'));
    }

    async showPage(page, section = null) {
        const container = document.getElementById('app-content');
        if (!container) return;

        const user = store.getState('user');
        const isAuthenticated = !!user;

        if (page === 'landing') {
            await LandingPage.render('app-content');
            document.getElementById('dashboard-container').style.display = 'none';
            document.getElementById('landing-page').style.display = 'block';
            return;
        }

        if (!isAuthenticated) {
            router.navigate('/');
            return;
        }

        document.getElementById('dashboard-container').style.display = 'block';
        document.getElementById('landing-page').style.display = 'none';

        if (page === 'dashboard') {
            await DashboardPage.render('app-content');
            if (section && DashboardPage.dashboard && DashboardPage.dashboard.showSection) {
                DashboardPage.dashboard.showSection(section);
            }
        } else if (page === 'profile') {
            await ProfilePage.render('app-content');
        } else if (page === 'settings') {
            await SettingsPage.render('app-content');
        } else if (page === 'help') {
            await HelpPage.render('app-content');
        }

        this.updateUserInfo();
        this.setPageTitle(page, section);
        sidebar.setActive(section || page);
        this.setMobileNavActive(section || page);
    }

    updateUserInfo() {
        const user = store.getState('user');
        const name = user?.name || 'User';
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        const userInitials = document.getElementById('user-initials');
        const userName = document.getElementById('user-name');
        const dropdownName = document.getElementById('dropdown-user-name');
        const dropdownEmail = document.getElementById('dropdown-user-email');
        
        if (userInitials) userInitials.textContent = initials;
        if (userName) userName.textContent = name;
        if (dropdownName) dropdownName.textContent = name;
        if (dropdownEmail) dropdownEmail.textContent = user?.email || '';
    }

    setPageTitle(page, section) {
        const titles = {
            dashboard: { dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers', classes: 'Classes', attendance: 'Attendance', grades: 'Grades', duty: 'Duty Management', payments: 'Payments', calendar: 'Calendar' },
            profile: 'Profile',
            settings: 'Settings',
            help: 'Help Center'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl) {
            if (page === 'dashboard' && section && titles.dashboard[section]) {
                titleEl.textContent = titles.dashboard[section];
            } else {
                titleEl.textContent = titles[page] || 'ShuleAI';
            }
        }
    }

    setMobileNavActive(section) {
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('text-primary');
            if (item.dataset.section === section) {
                item.classList.add('text-primary');
            }
        });
    }

    setupLandingPageListeners() {
        let clickCount = 0;
        const secretTrigger = document.getElementById('secret-logo-trigger');
        if (secretTrigger) {
            secretTrigger.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 3) {
                    const superAdminCard = document.getElementById('superadmin-role-card');
                    if (superAdminCard) superAdminCard.classList.remove('hidden');
                    toast.show('Super Admin access granted', 'info');
                    clickCount = 0;
                }
                setTimeout(() => clickCount = 0, 2000);
            });
        }
    }

    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bg-black/50')) modalManager.closeAll();
        });

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('user-menu');
            const btn = e.target.closest('[data-action="toggle-user-menu"]');
            if (menu && !menu.contains(e.target) && !btn) menu.classList.add('hidden');
        });

        store.subscribe((state) => {
            if (state.schoolSettings?.curriculum !== state.curriculum && DashboardPage.dashboard) {
                DashboardPage.dashboard.refresh();
            }
        });

        eventBus.on(EVENTS.WS_DISCONNECTED, () => toast.warning('Connection lost. Reconnecting...', 3000));
        eventBus.on(EVENTS.ERROR_OCCURRED, (error) => toast.error(error.message || 'An error occurred'));
    }
}

// Global utilities - THESE MUST BE OUTSIDE THE CLASS
window.theme = { 
    toggle: function() { 
        document.documentElement.classList.toggle('dark'); 
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); 
        if (DashboardPage.dashboard && DashboardPage.dashboard.charts) { 
            var isDark = document.documentElement.classList.contains('dark'); 
            Object.values(DashboardPage.dashboard.charts).forEach(function(chart) {
                if (window.ChartRenderer && window.ChartRenderer.updateTheme) {
                    window.ChartRenderer.updateTheme(chart, isDark);
                }
            });
        } 
    } 
};

window.userMenu = { 
    toggle: function() { 
        var menu = document.getElementById('user-menu');
        if (menu) menu.classList.toggle('hidden');
    } 
};

window.notifications = { 
    toggle: function() { 
        toast.info('Notifications feature coming soon'); 
    } 
};

// Auth utilities
window.auth = {
    logout: function() {
        localStorage.clear();
        window.location.reload();
    }
};

// Make auth available from useAuth as well
var authHook = useAuth();
if (authHook && authHook.logout) {
    window.auth.logout = authHook.logout;
}

// Start the application
document.addEventListener('DOMContentLoaded', function() { 
    var app = new Application(); 
    app.init(); 
    window.__app = app;
});