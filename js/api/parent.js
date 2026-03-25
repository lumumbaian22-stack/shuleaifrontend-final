// js/api/parent.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const parentAPI = {
    // Children
    getChildren: () => apiClient.get(API_ENDPOINTS.PARENT.CHILDREN),
    getChildSummary: (studentId) => apiClient.get(API_ENDPOINTS.PARENT.CHILD_SUMMARY(studentId)),
    
    // Attendance
    reportAbsence: (data) => apiClient.post(API_ENDPOINTS.PARENT.REPORT_ABSENCE, data),
    
    // Payments
    makePayment: (data) => apiClient.post(API_ENDPOINTS.PARENT.PAY, data),
    getPayments: () => apiClient.get(API_ENDPOINTS.PARENT.PAYMENTS),
    getSubscriptionPlans: () => apiClient.get(API_ENDPOINTS.PARENT.PLANS),
    upgradePlan: (data) => apiClient.post(API_ENDPOINTS.PARENT.UPGRADE_PLAN, data),
    confirmPayment: (data) => apiClient.post(API_ENDPOINTS.PARENT.CONFIRM_PAYMENT, data),
    
    // Messaging
    sendMessage: (data) => apiClient.post(API_ENDPOINTS.PARENT.MESSAGE, data),
    getConversations: () => apiClient.get(API_ENDPOINTS.PARENT.CONVERSATIONS),
    getMessages: (otherUserId) => apiClient.get(API_ENDPOINTS.PARENT.MESSAGES(otherUserId))
};