// js/features/auth/login.js
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { API_ENDPOINTS } from '../../constants/api.js';

export const login = {
    async handleSubmit(role, mode) {
        if (mode === 'signin') {
            await this.signIn(role);
        } else {
            await this.signUp(role);
        }
    },
    
    async signIn(role) {
        const email = document.getElementById('auth-email')?.value;
        const password = document.getElementById('auth-password')?.value;
        
        if (!email || !password) {
            toast.error('Email and password are required');
            return;
        }
        
        toast.loading(true);
        
        try {
            let response;
            
            if (role === 'superadmin') {
                const secretKey = document.getElementById('auth-secret-key')?.value;
                if (!secretKey) {
                    toast.error('Secret key is required');
                    return;
                }
                response = await apiClient.post(API_ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN, { email, password, secretKey });
            } else if (role === 'student') {
                const elimuid = document.getElementById('auth-elimuid')?.value;
                if (!elimuid) {
                    toast.error('ELIMUID is required');
                    return;
                }
                response = await apiClient.post(API_ENDPOINTS.AUTH.STUDENT_LOGIN, { elimuid, password });
            } else {
                response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password, role });
            }
            
            if (response.success) {
                const token = response.data.token;
                const user = response.data.user;
                
                apiClient.setToken(token);
                
                store.dispatch({ type: 'USER_UPDATED', payload: { user } });
                
                toast.success('Login successful');
                modalManager.close('auth-modal');
                
                // Reload to initialize dashboard
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            toast.loading(false);
        }
    },
    
    async signUp(role) {
        let data = {};
        
        if (role === 'admin') {
            data = {
                name: document.getElementById('auth-name')?.value,
                email: document.getElementById('auth-email')?.value,
                password: document.getElementById('auth-password')?.value,
                phone: document.getElementById('auth-phone')?.value,
                schoolName: document.getElementById('auth-school-name')?.value,
                schoolLevel: document.getElementById('auth-school-level')?.value,
                curriculum: document.getElementById('auth-curriculum')?.value
            };
        } else if (role === 'teacher') {
            const schoolCode = document.getElementById('auth-school-code')?.value;
            if (!schoolCode) {
                toast.error('School code is required');
                return;
            }
            
            data = {
                name: document.getElementById('auth-name')?.value,
                email: document.getElementById('auth-email')?.value,
                password: document.getElementById('auth-password')?.value,
                phone: document.getElementById('auth-phone')?.value,
                schoolCode: schoolCode,
                subjects: document.getElementById('auth-subjects')?.value?.split(',').map(s => s.trim()) || [],
                qualification: document.getElementById('auth-qualification')?.value
            };
        } else if (role === 'parent') {
            data = {
                name: document.getElementById('auth-name')?.value,
                email: document.getElementById('auth-email')?.value,
                password: document.getElementById('auth-password')?.value,
                phone: document.getElementById('auth-phone')?.value,
                studentElimuid: document.getElementById('auth-student-elimuid')?.value
            };
        }
        
        // Validate required fields
        if (!data.name || !data.email || !data.password) {
            toast.error('Please fill all required fields');
            return;
        }
        
        toast.loading(true);
        
        try {
            let response;
            
            if (role === 'admin') {
                response = await apiClient.post(API_ENDPOINTS.AUTH.ADMIN_SIGNUP, data);
            } else if (role === 'teacher') {
                response = await apiClient.post(API_ENDPOINTS.AUTH.TEACHER_SIGNUP, data);
            } else if (role === 'parent') {
                response = await apiClient.post(API_ENDPOINTS.AUTH.PARENT_SIGNUP, data);
            }
            
            toast.success(response.message || 'Registration successful');
            modalManager.close('auth-modal');
            
            if (response.data?.shortCode) {
                toast.info(`Your school code: ${response.data.shortCode}`, 10000);
            }
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            toast.loading(false);
        }
    }
};

window.auth = login;