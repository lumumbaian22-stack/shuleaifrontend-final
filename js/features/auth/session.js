// js/features/auth/session.js
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { eventBus, EVENTS } from '../../core/events.js';

export const session = {
    sessionTimeout: null,
    sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
    
    init() {
        this.resetTimeout();
        
        // Listen for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetTimeout());
        });
        
        // Listen for logout event
        eventBus.on(EVENTS.LOGOUT, () => this.clear());
    },
    
    resetTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        this.sessionTimeout = setTimeout(() => {
            this.expireSession();
        }, this.sessionTimeoutMs);
    },
    
    async expireSession() {
        toast.warning('Your session has expired. Please log in again.', 5000);
        
        // Clear tokens
        apiClient.clearTokens();
        store.dispatch({ type: 'USER_LOGOUT' });
        
        // Redirect to landing page
        const landingPage = document.getElementById('landing-page');
        const dashboardContainer = document.getElementById('dashboard-container');
        
        if (landingPage) landingPage.style.display = 'block';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
        
        eventBus.emit(EVENTS.SESSION_EXPIRED);
    },
    
    async validateSession() {
        try {
            const response = await apiClient.get('/api/auth/me');
            return response.success && response.data.user;
        } catch (error) {
            return false;
        }
    },
    
    clear() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    session.init();
});

window.session = session;