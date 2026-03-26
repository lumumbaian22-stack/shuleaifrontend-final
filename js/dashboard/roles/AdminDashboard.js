// js/dashboard/roles/AdminDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, getInitials, timeAgo } from '../../core/utils.js';

export class AdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.students = [];
        this.teachers = [];
        this.pendingTeachers = [];
        this.classes = [];
        this.enrollmentChart = null;
        this.gradeChart = null;
        this.currentSection = 'dashboard';
    }

    async loadData() {
        console.log('📊 Loading admin dashboard data...');
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const [studentsRes, teachersRes, pendingRes, classesRes] = await Promise.all([
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/students', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/teachers', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/approvals/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/classes', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (studentsRes.ok) this.students = (await studentsRes.json()).data || [];
            if (teachersRes.ok) this.teachers = (await teachersRes.json()).data || [];
            if (pendingRes.ok) this.pendingTeachers = (await pendingRes.json()).data?.teachers || [];
            if (classesRes.ok) this.classes = (await classesRes.json()).data || [];

            console.log(`✅ Students: ${this.students.length}, Teachers: ${this.teachers.length}, Classes: ${this.classes.length}`);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    // ==================== CHARTS ====================

    initCharts() {
        const monthlyData = this.calculateMonthlyEnrollment();

        const enrollmentCtx = document.getElementById('admin-enrollmentChart');
        if (enrollmentCtx && typeof Chart !== 'undefined') {
            if (this.enrollmentChart) this.enrollmentChart.destroy();
            this.enrollmentChart = new Chart(enrollmentCtx, {
                type: 'line',
                data: {
                    labels: monthlyData.labels,
                    datasets: [{
                        label: 'Students',
                        data: monthlyData.values,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
                }
            });
        }

        const gradeCtx = document.getElementById('admin-gradeChart');
        if (gradeCtx && typeof Chart !== 'undefined') {
            if (this.gradeChart) this.gradeChart.destroy();

            const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
            this.students.forEach(s => {
                const avg = s.average || 0;
                if (avg >= 80) gradeCounts.A++;
                else if (avg >= 65) gradeCounts.B++;
                else if (avg >= 50) gradeCounts.C++;
                else if (avg >= 35) gradeCounts.D++;
                else gradeCounts.E++;
            });

            this.gradeChart = new Chart(gradeCtx, {
                type: 'doughnut',
                data: {
                    labels: ['A (80-100)', 'B (65-79)', 'C (50-64)', 'D (35-49)', 'E (0-34)'],
                    datasets: [{
                        data: [gradeCounts.A, gradeCounts.B, gradeCounts.C, gradeCounts.D, gradeCounts.E],
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const label = ctx.label || '';
                                    const val = ctx.raw || 0;
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                    return `${label}: ${val} students (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    calculateMonthlyEnrollment() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const now = new Date();
        const monthlyCounts = [0, 0, 0, 0, 0, 0];

        this.students.forEach(s => {
            const enrollDate = s.enrollmentDate ? new Date(s.enrollmentDate) : null;
            if (enrollDate) {
                const monthDiff = (now.getMonth() + 12 - enrollDate.getMonth()) % 12;
                if (monthDiff >= 0 && monthDiff < 6) monthlyCounts[5 - monthDiff]++;
            }
        });

        let cumulative = 0;
        const cumulativeData = monthlyCounts.map(c => {
            cumulative += c;
            return cumulative || Math.floor(Math.random() * 50) + 500;
        });

        return { labels: months, values: cumulativeData };
    }

    // ==================== RENDER SECTIONS ====================

    render() {
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in" id="admin-dashboard-content">
                <!-- School Profile -->
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <h2 class="text-2xl font-bold">${escapeHtml(school.name) || 'Your School'}</h2>
                                <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">${school.status === 'active' ? 'Active' : 'Pending'}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <p class="text-sm"><span class="font-mono bg-muted px-2 py-1 rounded">${escapeHtml(school.shortCode) || 'SHL-XXXXX'}</span></p>
                                <button onclick="window.showNameChangeModal()" class="text-sm text-primary hover:underline">Change School Name</button>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                            <p class="text-xs text-muted-foreground">Share this code with teachers</p>
                            <p class="text-lg font-mono font-bold">${escapeHtml(school.shortCode) || 'SHL-XXXXX'}</p>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Total Students</p><h3 class="text-2xl font-bold">${this.students.length}</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center"><i data-lucide="users" class="h-6 w-6 text-blue-600"></i></div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Teachers</p><h3 class="text-2xl font-bold">${this.teachers.length}</h3><p class="text-xs text-green-600 mt-1"><span class="font-semibold">${this.pendingTeachers.length}</span> pending</p></div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center"><i data-lucide="user-plus" class="h-6 w-6 text-violet-600"></i></div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Classes</p><h3 class="text-2xl font-bold">${this.classes.length}</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center"><i data-lucide="book-open" class="h-6 w-6 text-emerald-600"></i></div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Attendance Rate</p><h3 class="text-2xl font-bold">94%</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center"><i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i></div>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Enrollment Trends (Last 6 Months)</h3>
                        <div class="chart-container h-64"><canvas id="admin-enrollmentChart"></canvas></div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Grade Distribution</h3>
                        <div class="chart-container h-64"><canvas id="admin-gradeChart"></canvas></div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => { this.initCharts(); if (window.lucide) window.lucide.createIcons(); }, 100);
    }

    // ==================== SECTION RENDERERS ====================

    renderStudentsSection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Student Management</h2>
                    <div class="flex gap-2">
                        <button onclick="window.showAddStudentModal()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg">+ Add Student</button>
                        <button onclick="window.refreshAdminStudentList()" class="px-4 py-2 border rounded-lg">Refresh</button>
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-4">
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Total Students</p><p class="text-2xl font-bold">${this.students.length}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Active</p><p class="text-2xl font-bold text-green-600">${this.students.filter(s => s.status === 'active').length}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Suspended</p><p class="text-2xl font-bold text-red-600">${this.students.filter(s => s.status === 'suspended').length}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Graduated</p><p class="text-2xl font-bold text-blue-600">${this.students.filter(s => s.status === 'graduated').length}</p></div>
                </div>
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="px-4 py-3 text-left">Student</th><th class="px-4 py-3 text-left">ELIMUID</th><th class="px-4 py-3 text-left">Grade</th><th class="px-4 py-3 text-left">Status</th><th class="px-4 py-3 text-left">Parent</th><th class="px-4 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y">${this.renderStudentsTableRows()}</tbody></table></div>
                </div>
            </div>
        `;
    }

    renderStudentsTableRows() {
        if (!this.students.length) return '<tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>';
        return this.students.map(s => {
            const user = s.User || {};
            const initials = getInitials(user.name);
            const statusClass = s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
            return `<tr class="hover:bg-accent/50"><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><span class="text-sm font-medium text-blue-700">${initials}</span></div><span class="font-medium">${escapeHtml(user.name)}</span></div></td><td class="px-4 py-3"><span class="font-mono text-xs bg-muted px-2 py-1 rounded">${s.elimuid || 'N/A'}</span></td><td class="px-4 py-3">${s.grade || 'N/A'}</td><td class="px-4 py-3"><span class="px-2 py-1 ${statusClass} text-xs rounded-full">${s.status || 'active'}</span></td><td class="px-4 py-3">${user.email || '-'}</td><td class="px-4 py-3 text-right"><button onclick="window.viewStudentDetails('${s.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="eye" class="h-4 w-4"></i></button><button onclick="window.editStudent('${s.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="edit" class="h-4 w-4"></i></button><button onclick="window.copyElimuid('${s.elimuid}')" class="p-2 hover:bg-purple-100 rounded-lg"><i data-lucide="copy" class="h-4 w-4"></i></button></td></tr>`;
        }).join('');
    }

    renderTeachersSection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Teacher Management</h2>
                    <button onclick="window.refreshTeachersList()" class="px-4 py-2 border rounded-lg">Refresh</button>
                </div>
                <div class="grid gap-4 md:grid-cols-3">
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Total Teachers</p><p class="text-2xl font-bold">${this.teachers.length}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Active</p><p class="text-2xl font-bold text-green-600">${this.teachers.filter(t => t.isActive !== false).length}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Pending Approval</p><p class="text-2xl font-bold text-yellow-600">${this.pendingTeachers.length}</p></div>
                </div>
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="px-4 py-3 text-left">Teacher</th><th class="px-4 py-3 text-left">Email</th><th class="px-4 py-3 text-left">Subjects</th><th class="px-4 py-3 text-left">Status</th><th class="px-4 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y">${this.renderTeachersTableRows()}</tbody></table></div>
                </div>
                <div class="rounded-xl border bg-card overflow-hidden"><div class="p-4 border-b"><h3 class="font-semibold">Pending Teacher Approvals</h3></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-muted/50"><tr><th class="px-4 py-3 text-left">Teacher</th><th class="px-4 py-3 text-left">Email</th><th class="px-4 py-3 text-left">Subjects</th><th class="px-4 py-3 text-left">Applied</th><th class="px-4 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y">${this.renderPendingTeachersRows()}</tbody></table></div></div>
            </div>
        `;
    }

    renderTeachersTableRows() {
        if (!this.teachers.length) return '<tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No teachers found</td></tr>';
        return this.teachers.map(t => {
            const user = t.User || {};
            const initials = getInitials(user.name);
            const statusClass = t.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
            return `<tr class="hover:bg-accent/50"><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><span class="text-sm font-medium text-blue-700">${initials}</span></div><span class="font-medium">${escapeHtml(user.name)}</span></div></td><td class="px-4 py-3">${escapeHtml(user.email)}</td><td class="px-4 py-3">${(t.subjects || []).join(', ') || '-'}</td><td class="px-4 py-3"><span class="px-2 py-1 ${statusClass} text-xs rounded-full">${t.isActive !== false ? 'Active' : 'Inactive'}</span></td><td class="px-4 py-3 text-right"><button onclick="window.viewTeacherDetails('${t.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="eye" class="h-4 w-4"></i></button><button onclick="window.editTeacher('${t.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="edit" class="h-4 w-4"></i></button></td></tr>`;
        }).join('');
    }

    renderPendingTeachersRows() {
        if (!this.pendingTeachers.length) return '<tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No pending approvals</td></tr>';
        return this.pendingTeachers.map(t => {
            const user = t.User || {};
            const initials = getInitials(user.name);
            return `<tr class="hover:bg-accent/50"><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center"><span class="text-sm font-medium text-violet-700">${initials}</span></div><span class="font-medium">${escapeHtml(user.name)}</span></div></td><td class="px-4 py-3">${escapeHtml(user.email)}</td><td class="px-4 py-3">${(t.subjects || []).join(', ') || '-'}</td><td class="px-4 py-3">${timeAgo(t.createdAt)}</td><td class="px-4 py-3 text-right"><button onclick="window.approveTeacher('${t.id}')" class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 mr-2">Approve</button><button onclick="window.rejectTeacher('${t.id}')" class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200">Reject</button></td></tr>`;
        }).join('');
    }

    renderClassesSection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Class Management</h2>
                    <button onclick="window.showAddClassModal()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg">+ Add Class</button>
                </div>
                <div class="grid gap-4">
                    ${this.classes.map(cls => `
                        <div class="border rounded-lg p-4 bg-card hover:shadow-md">
                            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div><h3 class="font-semibold text-lg">${escapeHtml(cls.name)}</h3><p class="text-sm text-muted-foreground">Grade: ${escapeHtml(cls.grade)} | Stream: ${escapeHtml(cls.stream) || 'N/A'}</p><p class="text-sm mt-1">Class Teacher: <span class="${cls.Teacher ? 'text-green-600' : 'text-yellow-600'}">${cls.Teacher?.User?.name || 'Not assigned'}</span></p><p class="text-xs text-muted-foreground mt-1">${cls.studentCount || 0} students</p></div>
                                <div class="flex gap-2"><button onclick="window.assignTeacherToClass('${cls.id}')" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Assign Teacher</button><button onclick="window.editClass('${cls.id}')" class="p-2 border rounded-lg hover:bg-accent"><i data-lucide="edit" class="h-4 w-4"></i></button></div>
                            </div>
                        </div>
                    `).join('')}
                    ${this.classes.length === 0 ? '<div class="text-center py-12 border rounded-lg"><p class="text-muted-foreground">No classes found.</p></div>' : ''}
                </div>
            </div>
        `;
    }

    renderSettingsSection() {
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        const curriculum = school.system || 'cbc';
        return `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">School Settings</h2>
                <div class="rounded-xl border bg-card p-6">
                    <div class="space-y-4">
                        <div><label class="block text-sm font-medium mb-1">School Name</label><input type="text" id="settings-school-name" value="${escapeHtml(school.name) || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                        <div><label class="block text-sm font-medium mb-1">School Level</label><select id="settings-school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="primary">Primary</option><option value="secondary" selected>Secondary</option><option value="both">Both</option></select></div>
                        <div><label class="block text-sm font-medium mb-1">Curriculum</label><select id="settings-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="cbc" ${curriculum === 'cbc' ? 'selected' : ''}>CBC</option><option value="844" ${curriculum === '844' ? 'selected' : ''}>8-4-4</option><option value="british" ${curriculum === 'british' ? 'selected' : ''}>British</option><option value="american" ${curriculum === 'american' ? 'selected' : ''}>American</option></select></div>
                        <button onclick="window.saveSchoolSettings()" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== SECTION SWITCHER ====================

    showSection(section) {
        this.currentSection = section;
        const content = document.getElementById('dashboard-content');
        const pageTitle = document.getElementById('page-title');

        const titles = { dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers', classes: 'Classes', settings: 'Settings' };
        if (pageTitle) pageTitle.textContent = titles[section] || section;

        switch (section) {
            case 'dashboard': this.render(); break;
            case 'students': content.innerHTML = this.renderStudentsSection(); setTimeout(() => lucide?.createIcons(), 100); break;
            case 'teachers': content.innerHTML = this.renderTeachersSection(); setTimeout(() => lucide?.createIcons(), 100); break;
            case 'classes': content.innerHTML = this.renderClassesSection(); setTimeout(() => lucide?.createIcons(), 100); break;
            case 'settings': content.innerHTML = this.renderSettingsSection(); setTimeout(() => lucide?.createIcons(), 100); break;
            default: this.render();
        }

        // Update sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('bg-sidebar-accent', 'text-sidebar-accent-foreground');
            if (link.dataset.section === section) link.classList.add('bg-sidebar-accent', 'text-sidebar-accent-foreground');
        });
    }

    refreshStudents() { this.loadData().then(() => this.showSection('students')); }
    refreshTeachers() { this.loadData().then(() => this.showSection('teachers')); }
    async refresh() { await this.loadData(); this.showSection(this.currentSection); }
}
