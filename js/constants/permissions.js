// js/constants/permissions.js
export const PERMISSIONS = {
    // Super Admin only
    MANAGE_ALL_SCHOOLS: 'manage:all:schools',
    MANAGE_ALL_USERS: 'manage:all:users',
    VIEW_PLATFORM_METRICS: 'view:platform:metrics',
    CONFIGURE_PLATFORM: 'configure:platform',
    
    // Admin permissions
    MANAGE_SCHOOL: 'manage:school',
    MANAGE_TEACHERS: 'manage:teachers',
    MANAGE_STUDENTS: 'manage:students',
    MANAGE_CLASSES: 'manage:classes',
    MANAGE_DUTY: 'manage:duty',
    VIEW_REPORTS: 'view:reports',
    APPROVE_TEACHERS: 'approve:teachers',
    CONFIGURE_CURRICULUM: 'configure:curriculum',
    
    // Teacher permissions
    MANAGE_MY_STUDENTS: 'manage:my:students',
    ENTER_GRADES: 'enter:grades',
    TAKE_ATTENDANCE: 'take:attendance',
    ADD_COMMENTS: 'add:comments',
    VIEW_MY_CLASS: 'view:my:class',
    UPLOAD_CSV: 'upload:csv',
    VIEW_OWN_DUTY: 'view:own:duty',
    CHECK_IN_DUTY: 'checkin:duty',
    
    // Parent permissions
    VIEW_CHILD_ACADEMICS: 'view:child:academics',
    VIEW_CHILD_ATTENDANCE: 'view:child:attendance',
    REPORT_ABSENCE: 'report:absence',
    MAKE_PAYMENT: 'make:payment',
    VIEW_FEES: 'view:fees',
    MESSAGE_TEACHER: 'message:teacher',
    
    // Student permissions
    VIEW_OWN_GRADES: 'view:own:grades',
    VIEW_OWN_ATTENDANCE: 'view:own:attendance',
    ACCESS_MATERIALS: 'access:materials',
    USE_AI_TUTOR: 'use:ai:tutor',
    CHAT_PEERS: 'chat:peers',
    VIEW_DUTY: 'view:duty'
};

export const ROLE_PERMISSION_MAP = {
    super_admin: Object.values(PERMISSIONS),
    admin: [
        PERMISSIONS.MANAGE_SCHOOL,
        PERMISSIONS.MANAGE_TEACHERS,
        PERMISSIONS.MANAGE_STUDENTS,
        PERMISSIONS.MANAGE_CLASSES,
        PERMISSIONS.MANAGE_DUTY,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.APPROVE_TEACHERS,
        PERMISSIONS.CONFIGURE_CURRICULUM
    ],
    teacher: [
        PERMISSIONS.MANAGE_MY_STUDENTS,
        PERMISSIONS.ENTER_GRADES,
        PERMISSIONS.TAKE_ATTENDANCE,
        PERMISSIONS.ADD_COMMENTS,
        PERMISSIONS.VIEW_MY_CLASS,
        PERMISSIONS.UPLOAD_CSV,
        PERMISSIONS.VIEW_OWN_DUTY,
        PERMISSIONS.CHECK_IN_DUTY
    ],
    parent: [
        PERMISSIONS.VIEW_CHILD_ACADEMICS,
        PERMISSIONS.VIEW_CHILD_ATTENDANCE,
        PERMISSIONS.REPORT_ABSENCE,
        PERMISSIONS.MAKE_PAYMENT,
        PERMISSIONS.VIEW_FEES,
        PERMISSIONS.MESSAGE_TEACHER
    ],
    student: [
        PERMISSIONS.VIEW_OWN_GRADES,
        PERMISSIONS.VIEW_OWN_ATTENDANCE,
        PERMISSIONS.ACCESS_MATERIALS,
        PERMISSIONS.USE_AI_TUTOR,
        PERMISSIONS.CHAT_PEERS,
        PERMISSIONS.VIEW_DUTY
    ]
};

export function hasPermission(userRole, permission) {
    const permissions = ROLE_PERMISSION_MAP[userRole] || [];
    return permissions.includes(permission) || permissions.includes('*');
}