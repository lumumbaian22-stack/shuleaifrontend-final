// js/api/admin.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const adminAPI = {
    // Teacher management
    getTeachers: () => apiClient.get(API_ENDPOINTS.ADMIN.TEACHERS),
    getStudents: () => apiClient.get(API_ENDPOINTS.ADMIN.STUDENTS),
    getParents: () => apiClient.get(API_ENDPOINTS.ADMIN.PARENTS),
    getPendingApprovals: () => apiClient.get(API_ENDPOINTS.ADMIN.PENDING_APPROVALS),
    
    approveTeacher: (teacherId, action, rejectionReason) => 
        apiClient.post(API_ENDPOINTS.ADMIN.APPROVE_TEACHER(teacherId), { action, rejectionReason }),
    
    deactivateTeacher: (teacherId, data) => 
        apiClient.post(API_ENDPOINTS.ADMIN.DEACTIVATE_TEACHER(teacherId), data),
    
    activateTeacher: (teacherId) => 
        apiClient.post(API_ENDPOINTS.ADMIN.ACTIVATE_TEACHER(teacherId)),
    
    deleteTeacher: (teacherId) => 
        apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_TEACHER(teacherId)),
    
    // Student management
    suspendStudent: (studentId, data) => 
        apiClient.post(API_ENDPOINTS.ADMIN.SUSPEND_STUDENT(studentId), data),
    
    reactivateStudent: (studentId) => 
        apiClient.post(API_ENDPOINTS.ADMIN.REACTIVATE_STUDENT(studentId)),
    
    expelStudent: (studentId, data) => 
        apiClient.post(API_ENDPOINTS.ADMIN.EXCEL_STUDENT(studentId), data),
    
    getStudentDetails: (studentId) => 
        apiClient.get(API_ENDPOINTS.ADMIN.STUDENT_DETAILS?.(studentId) || `/api/admin/students/${studentId}`),
    
    // Class management
    getClasses: () => apiClient.get(API_ENDPOINTS.ADMIN.CLASSES),
    createClass: (data) => apiClient.post(API_ENDPOINTS.ADMIN.CREATE_CLASS, data),
    updateClass: (classId, data) => apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_CLASS(classId), data),
    deleteClass: (classId) => apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_CLASS(classId)),
    getAvailableTeachers: () => apiClient.get(API_ENDPOINTS.ADMIN.AVAILABLE_TEACHERS),
    assignTeacherToClass: (classId, teacherId) => 
        apiClient.post(API_ENDPOINTS.ADMIN.ASSIGN_TEACHER(classId), { teacherId }),
    
    // School settings
    getSchoolSettings: () => apiClient.get(API_ENDPOINTS.ADMIN.SETTINGS),
    updateSchoolSettings: (data) => apiClient.put(API_ENDPOINTS.ADMIN.SETTINGS, data),
    
    // Duty management
    generateDutyRoster: (startDate, endDate) => 
        apiClient.post(API_ENDPOINTS.ADMIN.DUTY_GENERATE, { startDate, endDate }),
    getDutyStats: () => apiClient.get(API_ENDPOINTS.ADMIN.DUTY_STATS),
    getFairnessReport: () => apiClient.get(API_ENDPOINTS.ADMIN.FAIRNESS_REPORT),
    getUnderstaffedAreas: () => apiClient.get(API_ENDPOINTS.ADMIN.UNDERSTAFFED),
    getTeacherWorkload: () => apiClient.get(API_ENDPOINTS.ADMIN.TEACHER_WORKLOAD),
    manualAdjustDuty: (data) => apiClient.post(API_ENDPOINTS.ADMIN.ADJUST_DUTY, data)
};