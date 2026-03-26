// js/dashboard/roles/SuperAdminDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml } from '../../core/utils.js';

export class SuperAdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.schools = [];
        this.pendingSchools = [];
    }

    async loadData() {
        console.log('📊 Loading super admin data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            const [schoolsRes, pendingRes] = await Promise.all([
                fetch('https://shuleaibackend-32h1.onrender.com/api/super-admin/schools', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/super-admin/pending-schools', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            if (schoolsRes.ok) {
                const data = await schoolsRes.json();
                this.schools = data.data || [];
            }
            if (pendingRes.ok) {
                const data = await pendingRes.json();
                this.pendingSchools = data.data || [];
            }
        } catch (error) {
            console.error('Error loading super admin data:', error);
        }
    }

    render() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h2 class="text-2xl font-bold">Super Admin Dashboard</h2>
                    <p class="text-muted-foreground mt-2">Welcome, ${escapeHtml(user.name) || 'Super Admin'}!</p>
                </div>
                
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Total Schools</p><h3 class="text-2xl font-bold">${this.schools.length}</h3></div><div class="h-12 w-12 rounded-lg bg-blue-100"><i data-lucide="building-2" class="h-6 w-6 text-blue-600 m-3"></i></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Active Schools</p><h3 class="text-2xl font-bold">${this.schools.filter(s => s.status === 'active').length}</h3></div><div class="h-12 w-12 rounded-lg bg-green-100"><i data-lucide="check-circle" class="h-6 w-6 text-green-600 m-3"></i></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Pending Approvals</p><h3 class="text-2xl font-bold">${this.pendingSchools.length}</h3></div><div class="h-12 w-12 rounded-lg bg-yellow-100"><i data-lucide="clock" class="h-6 w-6 text-yellow-600 m-3"></i></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Total Users</p><h3 class="text-2xl font-bold">-</h3></div><div class="h-12 w-12 rounded-lg bg-purple-100"><i data-lucide="users" class="h-6 w-6 text-purple-600 m-3"></i></div></div>
                </div>
                
                <div class="grid gap-4 md:grid-cols-2">
                    <button onclick="window.router?.navigate('schools')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="building-2" class="h-8 w-8 mx-auto mb-3 text-blue-600"></i><h4 class="font-semibold text-center">Manage Schools</h4></button>
                    <button onclick="window.router?.navigate('settings')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="settings" class="h-8 w-8 mx-auto mb-3 text-purple-600"></i><h4 class="font-semibold text-center">Platform Settings</h4></button>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    showSection(section) {
        console.log('Showing section:', section);
        this.refresh();
    }
}
