// js/dashboard/roles/SuperAdminDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, formatDate, timeAgo } from '../../core/utils.js';

export class SuperAdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.schools = [];
        this.pendingSchools = [];
        this.nameChangeRequests = [];
    }

    async loadData() {
        console.log('📊 Loading super admin data...');
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const [schoolsRes, pendingRes, requestsRes] = await Promise.all([
                fetch('https://shuleaibackend-32h1.onrender.com/api/super-admin/schools', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/super-admin/pending-schools', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/super-admin/requests', {
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
            if (requestsRes.ok) {
                const data = await requestsRes.json();
                this.nameChangeRequests = data.data || [];
            }
        } catch (error) {
            console.error('Error loading super admin data:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Total Schools</p>
                                <h3 class="text-2xl font-bold mt-1" id="total-schools">${this.schools.length}</h3>
                                <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <i data-lucide="trending-up" class="h-3 w-3"></i>
                                    <span id="new-schools">${this.pendingSchools.length}</span> pending
                                </p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i data-lucide="building-2" class="h-6 w-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Active Schools</p>
                                <h3 class="text-2xl font-bold mt-1" id="active-admins">${this.schools.filter(s => s.status === 'active').length}</h3>
                                <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <i data-lucide="trending-up" class="h-3 w-3"></i>
                                    +<span id="new-admins">${this.schools.filter(s => s.status === 'pending').length}</span> new
                                </p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <i data-lucide="user-plus" class="h-6 w-6 text-violet-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                                <h3 class="text-2xl font-bold mt-1" id="pending-approvals">${this.pendingSchools.length}</h3>
                                <p class="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                    <i data-lucide="clock" class="h-3 w-3"></i>
                                    Awaiting review
                                </p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <i data-lucide="alert-circle" class="h-6 w-6 text-amber-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Revenue (MTD)</p>
                                <h3 class="text-2xl font-bold mt-1" id="revenue">$1,240</h3>
                                <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <i data-lucide="trending-up" class="h-3 w-3"></i>
                                    +<span id="revenue-growth">15</span>% from last month
                                </p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <i data-lucide="dollar-sign" class="h-6 w-6 text-emerald-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts Row -->
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold">School Growth Trends</h3>
                            <select class="text-sm border rounded-md px-2 py-1 bg-background" onchange="window.updateSuperAdminChart(this.value)">
                                <option value="year">This Year</option>
                                <option value="last-year">Last Year</option>
                            </select>
                        </div>
                        <div class="chart-container h-64">
                            <canvas id="superadmin-enrollmentChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold">School Distribution</h3>
                            <select class="text-sm border rounded-md px-2 py-1 bg-background" onchange="window.updateSuperAdminPieChart(this.value)">
                                <option value="level">By Level</option>
                                <option value="region">By Region</option>
                            </select>
                        </div>
                        <div class="chart-container h-64">
                            <canvas id="superadmin-gradeChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Admin Management Table -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="font-semibold">School/Admin Management</h3>
                        <span class="text-sm text-muted-foreground" id="school-count">${this.schools.length} total</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr><th class="px-4 py-3 text-left font-medium">School</th><th class="px-4 py-3 text-left font-medium">Admin</th><th class="px-4 py-3 text-left font-medium">Level</th><th class="px-4 py-3 text-left font-medium">Status</th><th class="px-4 py-3 text-right font-medium">Actions</th></tr>
                            </thead>
                            <tbody class="divide-y" id="schools-table-body">
                                ${this.schools.map(school => {
                                    const admin = school.admins?.[0] || {};
                                    const statusClass = school.status === 'active' ? 'bg-green-100 text-green-700' : school.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';
                                    return `
                                        <tr class="hover:bg-accent/50 transition-colors">
                                            <td class="px-4 py-3 font-medium">${escapeHtml(school.name)}</td>
                                            <td class="px-4 py-3">${escapeHtml(admin.email)}</td>
                                            <td class="px-4 py-3">${school.settings?.schoolLevel || 'N/A'}</td>
                                            <td class="px-4 py-3"><span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusClass}">${school.status}</span></td>
                                            <td class="px-4 py-3 text-right">
                                                <button onclick="window.viewSchool('${school.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="eye" class="h-4 w-4"></i></button>
                                                <button onclick="window.manageSchool('${school.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="more-vertical" class="h-4 w-4"></i></button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${this.schools.length === 0 ? '<tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No schools found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Name Change Requests -->
                <div class="rounded-xl border bg-card">
                    <div class="p-4 border-b">
                        <h3 class="font-semibold">Name Change Requests</h3>
                    </div>
                    <div class="divide-y" id="name-change-requests">
                        ${this.nameChangeRequests.map(req => `
                            <div class="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                                <div>
                                    <p class="text-sm font-medium">${escapeHtml(req.currentName)} → ${escapeHtml(req.newName)}</p>
                                    <p class="text-xs text-muted-foreground">Payment: $50 verified • ${timeAgo(req.createdAt)}</p>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="window.approveNameChange('${req.id}')" class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200">Approve</button>
                                    <button onclick="window.rejectNameChange('${req.id}')" class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200">Reject</button>
                                </div>
                            </div>
                        `).join('')}
                        ${this.nameChangeRequests.length === 0 ? '<div class="p-8 text-center text-muted-foreground">No pending requests</div>' : ''}
                    </div>
                </div>
            </div>
        `;

        // Initialize charts after render
        this.initCharts();
    }

    initCharts() {
        const enrollCtx = document.getElementById('superadmin-enrollmentChart');
        const gradeCtx = document.getElementById('superadmin-gradeChart');
        if (enrollCtx && !window.superEnrollChart) {
            window.superEnrollChart = new Chart(enrollCtx, {
                type: 'line',
                data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'New Schools', data: [2,3,4,3,5,7], borderColor: '#3b82f6', fill: true }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        if (gradeCtx && !window.superGradeChart) {
            window.superGradeChart = new Chart(gradeCtx, {
                type: 'doughnut',
                data: { labels: ['Primary', 'Secondary', 'Mixed'], datasets: [{ data: [12,18,4], backgroundColor: ['#3b82f6','#8b5cf6','#10b981'] }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
            });
        }
    }

    showSection(section) {
        if (section === 'dashboard') this.refresh();
        else if (section === 'schools') alert('School management coming soon');
        else if (section === 'settings') alert('Platform settings coming soon');
    }

    async refresh() {
        await this.loadData();
        this.render();
    }
}

// Global functions for super admin
window.viewSchool = (id) => alert('View school: ' + id);
window.manageSchool = (id) => alert('Manage school: ' + id);
window.approveNameChange = (id) => alert('Approve name change: ' + id);
window.rejectNameChange = (id) => alert('Reject name change: ' + id);
window.updateSuperAdminChart = (value) => console.log('Update chart', value);
window.updateSuperAdminPieChart = (value) => console.log('Update pie chart', value);
