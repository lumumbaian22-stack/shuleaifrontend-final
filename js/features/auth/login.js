// js/features/auth/login.js
import { authAPI } from '../../api/auth.js';
import { store } from '../../core/store.js';
import { loadDashboard } from '../../dashboard/index.js';

export async function handleLogin(role, email, password, secretKey = null) {
    console.log('Attempting login for role:', role);
    try {
        let response;
        if (role === 'superadmin') {
            response = await authAPI.superAdminLogin(email, password, secretKey);
        } else {
            response = await authAPI.login(email, password, role);
        }
        
        if (response.success) {
            const user = response.data.user;
            const token = response.data.token;
            const school = response.data.school;
            
            user.token = token;
            store.setUser(user);
            store.setToken(token);
            if (school) store.setSchool(school);
            localStorage.setItem('userRole', user.role);
            
            console.log('Login successful:', user.name);
            
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';
            
            await loadDashboard(user.role);
            return true;
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed');
        return false;
    }
}

export async function handleStudentLogin(elimuid, password) {
    console.log('Student login attempt');
    try {
        const response = await authAPI.studentLogin(elimuid, password);
        if (response.success) {
            const user = response.data.user;
            const token = response.data.token;
            user.token = token;
            store.setUser(user);
            store.setToken(token);
            localStorage.setItem('userRole', 'student');
            
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';
            
            await loadDashboard('student');
            return true;
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Student login error:', error);
        alert(error.message || 'Login failed');
        return false;
    }
}
