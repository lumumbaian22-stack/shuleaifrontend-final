// js/dashboard/index.js
//import { store } from '../core/store.js';
//import { ROLES } from '../constants/roles.js';
//import SuperAdminDashboard from './roles/SuperAdminDashboard.js';
//import AdminDashboard from './roles/AdminDashboard.js';
//import TeacherDashboard from './roles/TeacherDashboard.js';
//import ParentDashboard from './roles/ParentDashboard.js';
//import StudentDashboard from './roles/StudentDashboard.js';

class DashboardFactory {
    static create(role, containerId) {
        const user = store.getState('user');
        
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        let dashboard;
        
        switch (role) {
            case ROLES.SUPER_ADMIN:
                dashboard = new SuperAdminDashboard(containerId);
                break;
            case ROLES.ADMIN:
                dashboard = new AdminDashboard(containerId);
                break;
            case ROLES.TEACHER:
                dashboard = new TeacherDashboard(containerId);
                break;
            case ROLES.PARENT:
                dashboard = new ParentDashboard(containerId);
                break;
            case ROLES.STUDENT:
                dashboard = new StudentDashboard(containerId);
                break;
            default:
                throw new Error(`Invalid role: ${role}`);
        }
        
        // Store reference globally (optional)
        window.dashboard = dashboard;
        
        return dashboard;
    }
    
    static isValidRole(role) {
        return Object.values(ROLES).includes(role);
    }
    
    static getAvailableRoles() {
        return Object.values(ROLES);
    }
}

// Export for use in main.js
export default DashboardFactory;

// Also attach to window for global access (if needed)
window.DashboardFactory = DashboardFactory;
