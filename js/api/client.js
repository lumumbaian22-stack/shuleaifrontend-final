// js/api/client.js
import { API_BASE_URL } from '../constants/api.js';
import { store } from '../core/store.js';
import { eventBus, EVENTS } from '../core/events.js';

class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = null;
        this.refreshToken = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    setRefreshToken(token) {
        this.refreshToken = token;
        if (token) {
            localStorage.setItem('refreshToken', token);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }

    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    getRefreshToken() {
        return this.refreshToken || localStorage.getItem('refreshToken');
    }

    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method,
            headers,
            credentials: 'include',
            ...options
        };
        
        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, config);
            const responseData = await response.json();
            
            // Handle token refresh on 401
            if (response.status === 401 && this.getRefreshToken()) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry the original request with new token
                    headers['Authorization'] = `Bearer ${this.token}`;
                    const retryResponse = await fetch(url, {
                        ...config,
                        headers
                    });
                    const retryData = await retryResponse.json();
                    
                    if (!retryResponse.ok) {
                        throw new Error(retryData.message || 'API request failed');
                    }
                    return retryData;
                }
            }
            
            if (!response.ok) {
                throw new Error(responseData.message || `API request failed: ${response.status}`);
            }
            
            return responseData;
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            eventBus.emit(EVENTS.API_ERROR, { endpoint, method, error: error.message });
            throw error;
        }
    }

    async refreshAccessToken() {
        if (this.isRefreshing) {
            // Wait for the refresh to complete
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }
        
        this.isRefreshing = true;
        
        try {
            const refreshToken = this.getRefreshToken();
            const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                this.setToken(data.token);
                if (data.refreshToken) {
                    this.setRefreshToken(data.refreshToken);
                }
                
                // Notify all subscribers
                this.refreshSubscribers.forEach(callback => callback(true));
                this.refreshSubscribers = [];
                
                return true;
            } else {
                // Refresh failed, clear tokens
                this.clearTokens();
                this.refreshSubscribers.forEach(callback => callback(false));
                this.refreshSubscribers = [];
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            this.refreshSubscribers.forEach(callback => callback(false));
            this.refreshSubscribers = [];
            return false;
        } finally {
            this.isRefreshing = false;
        }
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }

    get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    patch(endpoint, data, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }

    upload(endpoint, file, onProgress, options = {}) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const xhr = new XMLHttpRequest();
            const token = this.getToken();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        resolve({ success: true, message: 'Upload successful' });
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });
            
            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            
            xhr.open('POST', `${this.baseURL}${endpoint}`);
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            xhr.send(formData);
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);