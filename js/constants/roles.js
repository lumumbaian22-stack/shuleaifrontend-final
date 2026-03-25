// js/constants/roles.js
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    TEACHER: 'teacher',
    PARENT: 'parent',
    STUDENT: 'student'
};

export const ROLE_DISPLAY_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.PARENT]: 'Parent',
    [ROLES.STUDENT]: 'Student'
};

export const ROLE_COLORS = {
    [ROLES.SUPER_ADMIN]: 'purple',
    [ROLES.ADMIN]: 'blue',
    [ROLES.TEACHER]: 'green',
    [ROLES.PARENT]: 'orange',
    [ROLES.STUDENT]: 'cyan'
};

export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['*'],
    [ROLES.ADMIN]: ['manage_teachers', 'manage_classes', 'manage_students', 'manage_duty', 'view_reports'],
    [ROLES.TEACHER]: ['manage_grades', 'manage_attendance', 'manage_students', 'view_reports'],
    [ROLES.PARENT]: ['view_child', 'report_absence', 'make_payment', 'view_reports'],
    [ROLES.STUDENT]: ['view_grades', 'view_attendance', 'chat_ai', 'view_materials']
};