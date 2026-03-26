// js/features/auth/login.js
console.log('🔑 login.js loaded');

async function handleLogin(role, email, password, secretKey = null) {
    console.log('Attempting login for role:', role);
    
    try {
        let response;
        
        if (role === 'superadmin') {
            response = await window.api.auth.superAdminLogin(email, password, secretKey);
        } else {
            response = await window.api.auth.login(email, password, role);
        }
        
        if (response.success) {
            const user = response.data.user;
            const token = response.data.token;
            const school = response.data.school;
            
            // Save to store
            user.token = token;
            store.setUser(user);
            store.setToken(token);
            if (school) store.setSchool(school);
            localStorage.setItem('userRole', user.role);
            
            console.log('Login successful:', user.name);
            
            // Load dashboard directly - NO RELOAD
            await loadDashboard(user.role);
            
            // Hide landing, show dashboard
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';
            
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

async function handleStudentLogin(elimuid, password) {
    console.log('Student login attempt');
    
    try {
        const response = await window.api.auth.studentLogin(elimuid, password);
        
        if (response.success) {
            const user = response.data.user;
            const token = response.data.token;
            const student = response.data.student;
            
            user.token = token;
            store.setUser(user);
            store.setToken(token);
            localStorage.setItem('userRole', 'student');
            if (student) localStorage.setItem('student', JSON.stringify(student));
            
            console.log('Student login successful');
            
            await loadDashboard('student');
            
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('dashboard-container').style.display = 'block';
            
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

// Make globally available
window.handleLogin = handleLogin;
window.handleStudentLogin = handleStudentLogin;
