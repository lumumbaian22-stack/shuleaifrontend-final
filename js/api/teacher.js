// js/api/teacher.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const teacherAPI = {
    // Student management
    getMyStudents: () => apiClient.get(API_ENDPOINTS.TEACHER.STUDENTS),
    addStudent: (data) => apiClient.post(API_ENDPOINTS.TEACHER.ADD_STUDENT, data),
    deleteStudent: (studentId) => apiClient.delete(API_ENDPOINTS.TEACHER.DELETE_STUDENT(studentId)),
    
    // Grade management
    enterMarks: (data) => apiClient.post(API_ENDPOINTS.TEACHER.MARKS, data),
    
    // Attendance
    takeAttendance: (data) => apiClient.post(API_ENDPOINTS.TEACHER.ATTENDANCE, data),
    
    // Comments
    addComment: (data) => apiClient.post(API_ENDPOINTS.TEACHER.COMMENT, data),
    
    // CSV upload
    uploadMarksCSV: (formData, onProgress) => 
        apiClient.upload(API_ENDPOINTS.TEACHER.UPLOAD_MARKS, formData, onProgress),
    
    // Messaging
    getConversations: () => apiClient.get(API_ENDPOINTS.TEACHER.CONVERSATIONS),
    getMessages: (otherUserId) => apiClient.get(API_ENDPOINTS.TEACHER.MESSAGES(otherUserId)),
    markMessagesAsRead: (otherUserId) => apiClient.put(API_ENDPOINTS.TEACHER.MARK_READ(otherUserId)),
    replyToParent: (data) => apiClient.post(API_ENDPOINTS.TEACHER.REPLY, data),
    
    // Dashboard
    getDashboard: () => apiClient.get(API_ENDPOINTS.TEACHER.DASHBOARD)
};