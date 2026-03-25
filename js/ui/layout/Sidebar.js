// js/ui/layout/Sidebar.js
import { store } from '../../core/store.js';
import { ROLES, ROLE_DISPLAY_NAMES } from '../../constants/roles.js';
import { router } from '../../core/router.js';

class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.nav = document.getElementById('sidebar-nav');
        this.settingsNav = document.getElementById('settings-nav');
        this.mobileNav = document.getElementById('mobile-nav');
        this.overlay = document.getElementById('mobile-overlay');
        this.isMobile = window.innerWidth < 1024;
        
        this.setupResizeListener();
        this.setupStoreSubscription();
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth < 1024;
            
            if (wasMobile && !this.isMobile && this.sidebar) {
                this.sidebar.classList.remove('-translate-x-full');
            }
        });
    }

    setupStoreSubscription() {
        store.subscribe((state) => {
            const role = state.currentRole;
            if (role) {
                this.updateSidebar(role);
            }
        });
    }

    updateSidebar(role) {
        const config = this.getSidebarConfig(role);
        
        if (this.nav) {
            this.nav.innerHTML = config.main.map(item => `
                <a href="#" onclick="window.router.navigate('${item.section}')" 
                   class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" 
                   data-section="${item.section}">
                    <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                    <span>${item.label}</span>
                </a>
            `).join('');
        }
        
        if (this.settingsNav) {
            this.settingsNav.innerHTML = config.settings.map(item => `
                <a href="#" onclick="window.router.navigate('${item.section}')" 
                   class="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors sidebar-link" 
                   data-section="${item.section}">
                    <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                    <span>${item.label}</span>
                </a>
            `).join('');
        }
        
        if (this.mobileNav) {
            this.mobileNav.innerHTML = config.main.slice(0, 4).map(item => `
                <a href="#" onclick="window.router.navigate('${item.section}')" 
                   class="mobile-nav-item flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground" 
                   data-section="${item.section}">
                    <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                    <span class="text-xs mt-1">${item.label}</span>
                </a>
            `).join('');
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    getSidebarConfig(role) {
        const configs = {
            [ROLES.SUPER_ADMIN]: {
                main: [
                    { icon: 'shield', label: 'Dashboard', section: 'dashboard' },
                    { icon: 'building-2', label: 'Schools', section: 'schools' },
                    { icon: 'check-circle', label: 'School Approvals', section: 'school-approvals' },
                    { icon: 'file-edit', label: 'Name Changes', section: 'name-change-requests' },
                    { icon: 'activity', label: 'Platform Health', section: 'platform-health' }
                ],
                settings: [
                    { icon: 'settings', label: 'Platform Settings', section: 'settings' },
                    { icon: 'help-circle', label: 'Help', section: 'help' }
                ]
            },
            [ROLES.ADMIN]: {
                main: [
                    { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                    { icon: 'users', label: 'Teachers', section: 'teachers' },
                    { icon: 'user-plus', label: 'Teacher Approvals', section: 'teacher-approvals' },
                    { icon: 'graduation-cap', label: 'Students', section: 'students' },
                    { icon: 'calendar', label: 'Calendar', section: 'calendar' },
                    { icon: 'clock', label: 'Duty', section: 'duty' },
                    { icon: 'bar-chart-2', label: 'Fairness Report', section: 'fairness-report' },
                    { icon: 'book-open', label: 'Custom Subjects', section: 'custom-subjects' }
                ],
                settings: [
                    { icon: 'settings', label: 'School Settings', section: 'settings' },
                    { icon: 'help-circle', label: 'Help', section: 'help' },
                    { icon: 'users', label: 'Classes', section: 'class-management' }
                ]
            },
            [ROLES.TEACHER]: {
                main: [
                    { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                    { icon: 'users', label: 'My Students', section: 'students' },
                    { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                    { icon: 'trending-up', label: 'Grades', section: 'grades' },
                    { icon: 'check-square', label: 'Tasks', section: 'tasks' },
                    { icon: 'clock', label: 'My Duty', section: 'duty' },
                    { icon: 'settings', label: 'Duty Preferences', section: 'duty-preferences' },
                    { icon: 'message-circle', label: 'Staff Chat', section: 'chat' }
                ],
                settings: [
                    { icon: 'settings', label: 'My Settings', section: 'settings' },
                    { icon: 'help-circle', label: 'Help', section: 'help' }
                ]
            },
            [ROLES.PARENT]: {
                main: [
                    { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                    { icon: 'trending-up', label: 'Progress', section: 'progress' },
                    { icon: 'credit-card', label: 'Payments', section: 'payments' },
                    { icon: 'message-circle', label: 'Messages', section: 'chat' }
                ],
                settings: [
                    { icon: 'settings', label: 'My Settings', section: 'settings' },
                    { icon: 'help-circle', label: 'Help', section: 'help' }
                ]
            },
            [ROLES.STUDENT]: {
                main: [
                    { icon: 'layout-dashboard', label: 'Dashboard', section: 'dashboard' },
                    { icon: 'trending-up', label: 'My Grades', section: 'grades' },
                    { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                    { icon: 'message-circle', label: 'Study Chat', section: 'chat' },
                    { icon: 'bot', label: 'AI Tutor', section: 'ai-tutor' },
                    { icon: 'calendar', label: 'Schedule', section: 'schedule' }
                ],
                settings: [
                    { icon: 'settings', label: 'My Settings', section: 'settings' },
                    { icon: 'help-circle', label: 'Help', section: 'help' }
                ]
            }
        };
        
        return configs[role] || configs[ROLES.STUDENT];
    }

    setActive(section) {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('bg-sidebar-accent', 'text-sidebar-accent-foreground');
        });
        
        const activeLink = document.querySelector(`.sidebar-link[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('bg-sidebar-accent', 'text-sidebar-accent-foreground');
        }
        
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('text-primary');
            if (item.dataset.section === section) {
                item.classList.add('text-primary');
            }
        });
    }

    toggle() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('-translate-x-full');
            if (this.overlay) {
                this.overlay.classList.toggle('hidden');
            }
        }
    }

    close() {
        if (this.sidebar && this.isMobile) {
            this.sidebar.classList.add('-translate-x-full');
            if (this.overlay) {
                this.overlay.classList.add('hidden');
            }
        }
    }
}

export const sidebar = new SidebarManager();
window.sidebar = sidebar;