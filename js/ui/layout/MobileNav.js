// js/ui/layout/MobileNav.js
import { store } from '../../core/store.js';
import { ROLES } from '../../constants/roles.js';

export const MobileNav = {
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const role = store.getState('currentRole');
        const config = this.getNavItems(role);
        
        container.innerHTML = `
            <div class="flex items-center justify-around">
                ${config.map(item => `
                    <a href="#" onclick="window.router.navigate('${item.section}')" 
                       class="mobile-nav-item flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground" 
                       data-section="${item.section}">
                        <i data-lucide="${item.icon}" class="h-5 w-5"></i>
                        <span class="text-xs mt-1">${item.label}</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    getNavItems(role) {
        const configs = {
            [ROLES.SUPER_ADMIN]: [
                { icon: 'shield', label: 'Dashboard', section: 'dashboard' },
                { icon: 'building-2', label: 'Schools', section: 'schools' },
                { icon: 'check-circle', label: 'Approvals', section: 'school-approvals' },
                { icon: 'activity', label: 'Health', section: 'platform-health' }
            ],
            [ROLES.ADMIN]: [
                { icon: 'layout-dashboard', label: 'Home', section: 'dashboard' },
                { icon: 'users', label: 'Teachers', section: 'teachers' },
                { icon: 'graduation-cap', label: 'Students', section: 'students' },
                { icon: 'clock', label: 'Duty', section: 'duty' }
            ],
            [ROLES.TEACHER]: [
                { icon: 'layout-dashboard', label: 'Home', section: 'dashboard' },
                { icon: 'users', label: 'Students', section: 'students' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'clock', label: 'Duty', section: 'duty' }
            ],
            [ROLES.PARENT]: [
                { icon: 'layout-dashboard', label: 'Home', section: 'dashboard' },
                { icon: 'trending-up', label: 'Progress', section: 'progress' },
                { icon: 'credit-card', label: 'Payments', section: 'payments' },
                { icon: 'message-circle', label: 'Messages', section: 'chat' }
            ],
            [ROLES.STUDENT]: [
                { icon: 'layout-dashboard', label: 'Home', section: 'dashboard' },
                { icon: 'trending-up', label: 'Grades', section: 'grades' },
                { icon: 'calendar-check', label: 'Attendance', section: 'attendance' },
                { icon: 'message-circle', label: 'Chat', section: 'chat' }
            ]
        };
        
        return configs[role] || configs[ROLES.STUDENT];
    },
    
    setActive(section) {
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('text-primary');
            if (item.dataset.section === section) {
                item.classList.add('text-primary');
            }
        });
    }
};

window.MobileNav = MobileNav;