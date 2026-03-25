// js/api/upload.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const uploadAPI = {
    uploadStudents: (formData, onProgress) => 
        apiClient.upload(API_ENDPOINTS.UPLOAD.STUDENTS, formData, onProgress),
    uploadMarks: (formData, onProgress) => 
        apiClient.upload(API_ENDPOINTS.UPLOAD.MARKS, formData, onProgress),
    uploadAttendance: (formData, onProgress) => 
        apiClient.upload(API_ENDPOINTS.UPLOAD.ATTENDANCE, formData, onProgress),
    downloadTemplate: (type) => 
        apiClient.get(API_ENDPOINTS.UPLOAD.TEMPLATE(type), { responseType: 'blob' }),
    validateCSV: (formData) => 
        apiClient.upload(API_ENDPOINTS.UPLOAD.VALIDATE, formData),
    getUploadHistory: () => apiClient.get(API_ENDPOINTS.UPLOAD.HISTORY)
};