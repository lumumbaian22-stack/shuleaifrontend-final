// js/api/auth.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const authAPI = {
    superAdminLogin: (email, password, secretKey) => 
        apiClient.post(API_ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN, { email, password, secretKey }),
    
    adminSignup: (data) => 
        apiClient.post(API_ENDPOINTS.AUTH.ADMIN_SIGNUP, data),
    
    teacherSignup: (data) => 
        apiClient.post(API_ENDPOINTS.AUTH.TEACHER_SIGNUP, data),
    
    parentSignup: (data) => 
        apiClient.post(API_ENDPOINTS.AUTH.PARENT_SIGNUP, data),
    
    studentLogin: (elimuid, password) => 
        apiClient.post(API_ENDPOINTS.AUTH.STUDENT_LOGIN, { elimuid, password }),
    
    login: (email, password, role) => 
        apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password, role }),
    
    verifySchoolCode: (schoolCode) => 
        apiClient.post(API_ENDPOINTS.AUTH.VERIFY_SCHOOL, { schoolCode }),
    
    getMe: () => apiClient.get(API_ENDPOINTS.AUTH.GET_ME),
    
    logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
    
    changePassword: (currentPassword, newPassword) => 
        apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword }),
    
    refreshToken: (refreshToken) => 
        apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })
};