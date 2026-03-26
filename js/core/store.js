// js/core/store.js
export const store = {
    user: null,
    token: null,
    school: null,

    setUser(user) {
        this.user = user;
        if (user && user.token) this.token = user.token;
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser() {
        return this.user || JSON.parse(localStorage.getItem('user') || 'null');
    },

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    },

    getToken() {
        return this.token || localStorage.getItem('authToken');
    },

    setSchool(school) {
        this.school = school;
        localStorage.setItem('school', JSON.stringify(school));
    },

    getSchool() {
        return this.school || JSON.parse(localStorage.getItem('school') || '{}');
    },

    clear() {
        this.user = null;
        this.token = null;
        this.school = null;
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('school');
        localStorage.removeItem('userRole');
    }
};
