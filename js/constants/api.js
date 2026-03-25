// js/constants/api.js
export const API_BASE_URL = 'https://shuleaibackend-32h1.onrender.com';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        SUPER_ADMIN_LOGIN: '/api/auth/super-admin/login',
        ADMIN_SIGNUP: '/api/auth/admin/signup',
        TEACHER_SIGNUP: '/api/auth/teacher/signup',
        PARENT_SIGNUP: '/api/auth/parent/signup',
        STUDENT_LOGIN: '/api/auth/student/login',
        VERIFY_SCHOOL: '/api/auth/verify-school',
        REFRESH_TOKEN: '/api/auth/refresh-token',
        LOGOUT: '/api/auth/logout',
        GET_ME: '/api/auth/me',
        CHANGE_PASSWORD: '/api/auth/change-password'
    },
    SUPER_ADMIN: {
        OVERVIEW: '/api/super-admin/overview',
        SCHOOLS: '/api/super-admin/schools',
        PENDING_SCHOOLS: '/api/super-admin/pending-schools',
        SUSPENDED_SCHOOLS: '/api/super-admin/suspended-schools',
        CREATE_SCHOOL: '/api/super-admin/schools',
        UPDATE_SCHOOL: (id) => `/api/super-admin/schools/${id}`,
        DELETE_SCHOOL: (id) => `/api/super-admin/schools/${id}`,
        APPROVE_SCHOOL: (id) => `/api/super-admin/schools/${id}/approve`,
        REJECT_SCHOOL: (id) => `/api/super-admin/schools/${id}/reject`,
        SUSPEND_SCHOOL: (id) => `/api/super-admin/schools/${id}/suspend`,
        REACTIVATE_SCHOOL: (id) => `/api/super-admin/schools/${id}/reactivate`,
        REQUESTS: '/api/super-admin/requests',
        APPROVE_REQUEST: (id) => `/api/super-admin/requests/${id}/approve`,
        REJECT_REQUEST: (id) => `/api/super-admin/requests/${id}/reject`,
        BANK_DETAILS: (id) => `/api/super-admin/bank-details/${id}`
    },
    ADMIN: {
        TEACHERS: '/api/admin/teachers',
        STUDENTS: '/api/admin/students',
        PARENTS: '/api/admin/parents',
        PENDING_APPROVALS: '/api/admin/approvals/pending',
        APPROVE_TEACHER: (id) => `/api/admin/teachers/${id}/approve`,
        DEACTIVATE_TEACHER: (id) => `/api/admin/teachers/${id}/deactivate`,
        ACTIVATE_TEACHER: (id) => `/api/admin/teachers/${id}/activate`,
        DELETE_TEACHER: (id) => `/api/admin/teachers/${id}`,
        SUSPEND_STUDENT: (id) => `/api/admin/students/${id}/suspend`,
        REACTIVATE_STUDENT: (id) => `/api/admin/students/${id}/reactivate`,
        EXCEL_STUDENT: (id) => `/api/admin/students/${id}/expel`,
        CLASSES: '/api/admin/classes',
        CREATE_CLASS: '/api/admin/classes',
        UPDATE_CLASS: (id) => `/api/admin/classes/${id}`,
        DELETE_CLASS: (id) => `/api/admin/classes/${id}`,
        AVAILABLE_TEACHERS: '/api/admin/available-teachers',
        ASSIGN_TEACHER: (id) => `/api/admin/classes/${id}/assign-teacher`,
        SETTINGS: '/api/admin/settings',
        DUTY_GENERATE: '/api/admin/duty/generate',
        DUTY_STATS: '/api/admin/duty/stats',
        FAIRNESS_REPORT: '/api/admin/duty/fairness-report',
        UNDERSTAFFED: '/api/admin/duty/understaffed',
        TEACHER_WORKLOAD: '/api/admin/duty/teacher-workload',
        ADJUST_DUTY: '/api/admin/duty/adjust'
    },
    TEACHER: {
        STUDENTS: '/api/teacher/students',
        ADD_STUDENT: '/api/teacher/students',
        DELETE_STUDENT: (id) => `/api/teacher/students/${id}`,
        MARKS: '/api/teacher/marks',
        ATTENDANCE: '/api/teacher/attendance',
        COMMENT: '/api/teacher/comment',
        UPLOAD_MARKS: '/api/teacher/upload/marks',
        CONVERSATIONS: '/api/teacher/conversations',
        MESSAGES: (id) => `/api/teacher/messages/${id}`,
        MARK_READ: (id) => `/api/teacher/messages/read/${id}`,
        REPLY: '/api/teacher/reply',
        DASHBOARD: '/api/teacher/dashboard'
    },
    PARENT: {
        CHILDREN: '/api/parent/children',
        CHILD_SUMMARY: (id) => `/api/parent/child/${id}/summary`,
        REPORT_ABSENCE: '/api/parent/report-absence',
        PAY: '/api/parent/pay',
        PAYMENTS: '/api/parent/payments',
        PLANS: '/api/parent/plans',
        UPGRADE_PLAN: '/api/parent/upgrade-plan',
        MESSAGE: '/api/parent/message',
        CONVERSATIONS: '/api/parent/conversations',
        MESSAGES: (id) => `/api/parent/messages/${id}`,
        CONFIRM_PAYMENT: '/api/parent/payment-confirm'
    },
    STUDENT: {
        GRADES: '/api/student/grades',
        ATTENDANCE: '/api/student/attendance',
        MATERIALS: '/api/student/materials',
        MESSAGE: '/api/student/message',
        MESSAGES: (id) => `/api/student/messages/${id}`,
        SET_FIRST_PASSWORD: '/api/student/set-first-password',
        DASHBOARD: '/api/student/dashboard'
    },
    DUTY: {
        TODAY: '/api/duty/today',
        WEEK: '/api/duty/week',
        CHECK_IN: '/api/duty/check-in',
        CHECK_OUT: '/api/duty/check-out',
        PREFERENCES: '/api/duty/preferences',
        REQUEST_SWAP: '/api/duty/request-swap'
    },
    UPLOAD: {
        STUDENTS: '/api/upload/students',
        MARKS: '/api/upload/marks',
        ATTENDANCE: '/api/upload/attendance',
        TEMPLATE: (type) => `/api/upload/template/${type}`,
        VALIDATE: '/api/upload/validate',
        HISTORY: '/api/upload/history'
    },
    SCHOOL: {
        NAME_CHANGE_REQUEST: '/api/school/name-change-request',
        NAME_CHANGE_REQUESTS: '/api/school/name-change-requests'
    },
    ANALYTICS: {
        STUDENT: (id) => `/api/analytics/student/${id}`,
        CLASS: (id) => `/api/analytics/class/${id}`,
        SCHOOL: '/api/analytics/school',
        COMPARE: (id) => `/api/analytics/compare/${id}`
    },
    PUBLIC: {
        DUTY_TODAY: (id) => `/api/public/duty/today?schoolId=${id}`,
        DUTY_WEEK: (id) => `/api/public/duty/week?schoolId=${id}`,
        SCHOOL_INFO: (id) => `/api/public/school/${id}`
    }
};