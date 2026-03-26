// js/api/client.js
export const API_BASE_URL = 'https://shuleaibackend-32h1.onrender.com';

export const apiClient = {
    async request(method, url, data = null, headers = {}) {
        const token = localStorage.getItem('authToken');
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        if (token) requestHeaders['Authorization'] = `Bearer ${token}`;
        
        const config = { method, headers: requestHeaders, credentials: 'include' };
        if (data && method !== 'GET') config.body = JSON.stringify(data);
        
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'API request failed');
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    get(url, headers) { return this.request('GET', url, null, headers); },
    post(url, data, headers) { return this.request('POST', url, data, headers); },
    put(url, data, headers) { return this.request('PUT', url, data, headers); },
    delete(url, headers) { return this.request('DELETE', url, null, headers); }
};
