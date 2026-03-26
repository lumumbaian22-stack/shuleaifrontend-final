// js/dashboard/index.js
console.log('🏭 dashboard/index.js loaded');

function loadDashboard(role) {
    console.log('Loading dashboard for role:', role);
    
    let dashboard = null;
    const containerId = 'dashboard-content';
    
    if (role === 'admin') {
        dashboard = new AdminDashboard(containerId);
    } else if (role === 'teacher') {
        dashboard = new TeacherDashboard(containerId);
    } else if (role === 'parent') {
        dashboard = new ParentDashboard(containerId);
    } else if (role === 'student') {
        dashboard = new StudentDashboard(containerId);
    } else if (role === 'super_admin' || role === 'superadmin') {
        dashboard = new SuperAdminDashboard(containerId);
    } else {
        console.error('Unknown role:', role);
        return null;
    }
    
    window.dashboard = dashboard;
    return dashboard.init();
}

window.loadDashboard = loadDashboard;
