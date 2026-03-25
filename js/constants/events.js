// js/constants/events.js
export const EVENTS = {
    // Auth events
    LOGIN_SUCCESS: 'auth:login:success',
    LOGIN_FAILED: 'auth:login:failed',
    LOGOUT: 'auth:logout',
    SESSION_EXPIRED: 'auth:session:expired',
    
    // User events
    USER_UPDATED: 'user:updated',
    PROFILE_UPDATED: 'profile:updated',
    PASSWORD_CHANGED: 'password:changed',
    
    // School events
    SCHOOL_UPDATED: 'school:updated',
    SCHOOL_NAME_CHANGED: 'school:name:changed',
    SCHOOL_APPROVED: 'school:approved',
    SCHOOL_SUSPENDED: 'school:suspended',
    SCHOOL_REACTIVATED: 'school:reactivated',
    
    // Teacher events
    TEACHER_ADDED: 'teacher:added',
    TEACHER_UPDATED: 'teacher:updated',
    TEACHER_DELETED: 'teacher:deleted',
    TEACHER_APPROVED: 'teacher:approved',
    TEACHER_REJECTED: 'teacher:rejected',
    
    // Student events
    STUDENT_ADDED: 'student:added',
    STUDENT_UPDATED: 'student:updated',
    STUDENT_DELETED: 'student:deleted',
    STUDENT_SUSPENDED: 'student:suspended',
    STUDENT_REACTIVATED: 'student:reactivated',
    
    // Class events
    CLASS_ADDED: 'class:added',
    CLASS_UPDATED: 'class:updated',
    CLASS_DELETED: 'class:deleted',
    TEACHER_ASSIGNED: 'teacher:assigned',
    
    // Grade events
    GRADES_ENTERED: 'grades:entered',
    GRADES_UPDATED: 'grades:updated',
    
    // Attendance events
    ATTENDANCE_TAKEN: 'attendance:taken',
    ATTENDANCE_UPDATED: 'attendance:updated',
    
    // Duty events
    DUTY_ROSTER_GENERATED: 'duty:roster:generated',
    DUTY_CHECK_IN: 'duty:checkin',
    DUTY_CHECK_OUT: 'duty:checkout',
    DUTY_SWAP_REQUESTED: 'duty:swap:requested',
    DUTY_SWAP_APPROVED: 'duty:swap:approved',
    
    // Message events
    MESSAGE_SENT: 'message:sent',
    MESSAGE_RECEIVED: 'message:received',
    MESSAGE_READ: 'message:read',
    
    // Notification events
    NOTIFICATION_RECEIVED: 'notification:received',
    NOTIFICATION_READ: 'notification:read',
    
    // Curriculum events
    CURRICULUM_CHANGED: 'curriculum:changed',
    SUBJECTS_UPDATED: 'subjects:updated',
    
    // Payment events
    PAYMENT_MADE: 'payment:made',
    PAYMENT_CONFIRMED: 'payment:confirmed',
    SUBSCRIPTION_UPDATED: 'subscription:updated',
    
    // UI events
    DASHBOARD_LOADED: 'dashboard:loaded',
    SECTION_CHANGED: 'section:changed',
    MODAL_OPENED: 'modal:opened',
    MODAL_CLOSED: 'modal:closed',
    TOAST_SHOW: 'toast:show',
    LOADING_START: 'loading:start',
    LOADING_END: 'loading:end',
    
    // Real-time events
    WS_CONNECTED: 'websocket:connected',
    WS_DISCONNECTED: 'websocket:disconnected',
    WS_ERROR: 'websocket:error',
    
    // System events
    ERROR_OCCURRED: 'error:occurred',
    NETWORK_ERROR: 'error:network',
    API_ERROR: 'error:api'
};