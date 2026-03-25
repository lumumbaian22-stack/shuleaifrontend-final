// js/dashboard/index.js
import { store } from '../core/store.js';
import { ROLES } from '../constants/roles.js';
import SuperAdminDashboard from './roles/SuperAdminDashboard.js';
import AdminDashboard from './roles/AdminDashboard.js';
import TeacherDashboard from './roles/TeacherDashboard.js';
import ParentDashboard from './roles/ParentDashboard.js';
import StudentDashboard from './roles/StudentDashboard.js';

class DashboardFactory {
    /**
     * Create a dashboard instance for the given role
     * @param {string} role - User role
     * @param {string} containerId - ID of the container element
     * @returns {object} dashboard instance
     */
    static create(role, containerId) {
        const user = store.getState('user');

        if (!user) {
            console.warn('User not authenticated, cannot create dashboard');
            return null;
        }

        let dashboard = null;

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
                console.error(`Invalid role: ${role}`);
                dashboard = null;
        }

        if (dashboard) {
            // store globally for easy access
            window.dashboard = dashboard;
        }

        return dashboard;
    }

    /**
     * Check if a role is valid
     * @param {string} role 
     * @returns {boolean}
     */
    static isValidRole(role) {
        return Object.values(ROLES).includes(role);
    }

    /**
     * Return all available roles
     * @returns {Array<string>}
     */
    static getAvailableRoles() {
        return Object.values(ROLES);
    }
}

// Attach to window for global access
window.DashboardFactory = DashboardFactory;

export default DashboardFactory;
