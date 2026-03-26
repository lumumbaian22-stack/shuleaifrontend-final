// js/api/auth.js
import { apiClient } from './client.js';

export const authAPI = {
    login(email, password, role) {
        return apiClient.post('/api/auth/login', { email, password, role });
    },
    
    superAdminLogin(email, password, secretKey) {
        return apiClient.post('/api/auth/super-admin/login', { email, password, secretKey });
    },
    
    studentLogin(elimuid, password) {
        return apiClient.post('/api/auth/student/login', { elimuid, password });
    },
    
    adminSignup(data) {
        return apiClient.post('/api/auth/admin/signup', data);
    },
    
    teacherSignup(data) {
        return apiClient.post('/api/auth/teacher/signup', data);
    },
    
    parentSignup(data) {
        return apiClient.post('/api/auth/parent/signup', data);
    },
    
    getMe() {
        return apiClient.get('/api/auth/me');
    },
    
    logout() {
        return apiClient.post('/api/auth/logout');
    }
};
