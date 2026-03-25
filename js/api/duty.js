// js/api/duty.js
import { apiClient } from './client.js';
import { API_ENDPOINTS } from '../constants/api.js';

export const dutyAPI = {
    getTodayDuty: () => apiClient.get(API_ENDPOINTS.DUTY.TODAY),
    getWeeklyDuty: () => apiClient.get(API_ENDPOINTS.DUTY.WEEK),
    checkIn: (data) => apiClient.post(API_ENDPOINTS.DUTY.CHECK_IN, data),
    checkOut: (data) => apiClient.post(API_ENDPOINTS.DUTY.CHECK_OUT, data),
    updatePreferences: (data) => apiClient.put(API_ENDPOINTS.DUTY.PREFERENCES, data),
    requestSwap: (data) => apiClient.post(API_ENDPOINTS.DUTY.REQUEST_SWAP, data)
};