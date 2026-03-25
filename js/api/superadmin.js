// js/api/superadmin.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const superAdminAPI = {
    // Overview
    getOverview: () => apiClient.get(API_ENDPOINTS.SUPER_ADMIN.OVERVIEW),
    
    // School management
    getSchools: () => apiClient.get(API_ENDPOINTS.SUPER_ADMIN.SCHOOLS),
    getPendingSchools: () => apiClient.get(API_ENDPOINTS.SUPER_ADMIN.PENDING_SCHOOLS),
    getSuspendedSchools: () => apiClient.get(API_ENDPOINTS.SUPER_ADMIN.SUSPENDED_SCHOOLS),
    
    createSchool: (data) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.CREATE_SCHOOL, data),
    updateSchool: (schoolId, data) => apiClient.put(API_ENDPOINTS.SUPER_ADMIN.UPDATE_SCHOOL(schoolId), data),
    deleteSchool: (schoolId) => apiClient.delete(API_ENDPOINTS.SUPER_ADMIN.DELETE_SCHOOL(schoolId)),
    
    approveSchool: (schoolId) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.APPROVE_SCHOOL(schoolId)),
    rejectSchool: (schoolId, reason) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.REJECT_SCHOOL(schoolId), { reason }),
    suspendSchool: (schoolId, reason) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.SUSPEND_SCHOOL(schoolId), { reason }),
    reactivateSchool: (schoolId, reason) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.REACTIVATE_SCHOOL(schoolId), { reason }),
    
    // Name change requests
    getPendingRequests: () => apiClient.get(API_ENDPOINTS.SUPER_ADMIN.REQUESTS),
    approveRequest: (requestId) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.APPROVE_REQUEST(requestId)),
    rejectRequest: (requestId, reason) => apiClient.post(API_ENDPOINTS.SUPER_ADMIN.REJECT_REQUEST(requestId), { reason }),
    
    // Bank details
    updateBankDetails: (schoolId, data) => apiClient.put(API_ENDPOINTS.SUPER_ADMIN.BANK_DETAILS(schoolId), data)
};