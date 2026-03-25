// js/api/student.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const studentAPI = {
    // Academic
    getGrades: () => apiClient.get(API_ENDPOINTS.STUDENT.GRADES),
    getAttendance: () => apiClient.get(API_ENDPOINTS.STUDENT.ATTENDANCE),
    getMaterials: () => apiClient.get(API_ENDPOINTS.STUDENT.MATERIALS),
    
    // Messaging
    sendMessage: (receiverId, content) => 
        apiClient.post(API_ENDPOINTS.STUDENT.MESSAGE, { receiverId, content }),
    getMessages: (otherUserId) => apiClient.get(API_ENDPOINTS.STUDENT.MESSAGES(otherUserId)),
    
    // Account
    setFirstPassword: (data) => apiClient.post(API_ENDPOINTS.STUDENT.SET_FIRST_PASSWORD, data),
    
    // Dashboard
    getDashboard: () => apiClient.get(API_ENDPOINTS.STUDENT.DASHBOARD)
};