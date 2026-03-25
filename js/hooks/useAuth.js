// js/hooks/useAuth.js
import { store } from '../core/store.js';
import { apiClient } from '../api/client.js';
import { toast } from '../ui/feedback/Toast.js';

export const useAuth = () => {
    const user = store.getState('user');
    const isAuthenticated = !!user;
    const role = user?.role;
    
    const login = async (email, password, role) => {
        try {
            const response = await apiClient.post('/api/auth/login', { email, password, role });
            if (response.success) {
                store.dispatch({ type: 'USER_UPDATED', payload: { user: response.data.user } });
                apiClient.setToken(response.data.token);
                toast.success('Login successful');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return false;
        }
    };
    
    const logout = async () => {
        try {
            await apiClient.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        apiClient.clearTokens();
        store.dispatch({ type: 'USER_LOGOUT' });
        toast.success('Logged out');
        window.location.reload();
    };
    
    const hasPermission = (permission) => {
        // Implement permission check based on role
        return true;
    };
    
    return { user, isAuthenticated, role, login, logout, hasPermission };
};

window.useAuth = useAuth;