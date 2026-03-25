// js/pages/DashboardPage.js
import { store } from '../core/store.js';
import { DashboardFactory } from '../dashboard/index.js';

export const DashboardPage = {
    dashboard: null,
    
    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const user = store.getState('user');
        const role = store.getState('currentRole');
        
        if (!user || !role) {
            container.innerHTML = '<div class="text-center py-12">Please log in to view your dashboard</div>';
            return;
        }
        
        container.innerHTML = '<div id="dashboard-content"></div>';
        
        this.dashboard = DashboardFactory.create(role, 'dashboard-content');
        await this.dashboard.init();
    },
    
    refresh() {
        if (this.dashboard) {
            this.dashboard.refresh();
        }
    },
    
    destroy() {
        if (this.dashboard) {
            this.dashboard.destroy();
            this.dashboard = null;
        }
    }
};

window.DashboardPage = DashboardPage;