// js/dashboard/roles/AdminDashboard.js
// THIS IS THE CORRECT VERSION - No ES6 modules, pure JavaScript

// Note: BaseDashboard is already global from BaseDashboard.js

class AdminDashboard extends window.BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.pendingTeachers = [];
        this.students = [];
        this.teachers = [];
        this.classes = [];
        this.school = {};
    }

    async loadData() {
        console.log('📊 Loading admin dashboard data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            // Fetch students
            const studentsRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/admin/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (studentsRes.ok) {
                const data = await studentsRes.json();
                this.students = data.data || [];
            }

            // Fetch teachers
            const teachersRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/admin/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (teachersRes.ok) {
                const data = await teachersRes.json();
                this.teachers = data.data || [];
            }

            // Fetch pending approvals
            const pendingRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/admin/approvals/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (pendingRes.ok) {
                const data = await pendingRes.json();
                this.pendingTeachers = data.data?.teachers || [];
            }

            // Fetch classes
            const classesRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/admin/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (classesRes.ok) {
                const data = await classesRes.json();
                this.classes = data.data || [];
            }

            // Get school from localStorage
            try {
                this.school = JSON.parse(localStorage.getItem('school') || '{}');
            } catch(e) {
                this.school = {};
            }

            this.stats = {
                totalStudents: this.students.length,
                totalTeachers: this.teachers.length,
                totalClasses: this.classes.length,
                pendingApprovals: this.pendingTeachers.length
            };

            console.log(`✅ Loaded: ${this.students.length} students, ${this.teachers.length} teachers, ${this.classes.length} classes`);

        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- School Profile -->
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 class="text-2xl font-bold">${this.school.name || 'Your School'}</h2>
                            <p class="text-sm text-muted-foreground mt-1">Short Code: ${this.school.shortCode || 'SHL-XXXXX'}</p>
                        </div>
                        <button onclick="window.showNameChangeModal()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">Change School Name</button>
                    </div>
                </div>
                
                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-muted-foreground">Total Students</p>
                                <h3 class="text-2xl font-bold">${this.students.length}</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i data-lucide="users" class="h-6 w-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-muted-foreground">Teachers</p>
                                <h3 class="text-2xl font-bold">${this.teachers.length}</h3>
                                <p class="text-xs text-green-600 mt-1">${this.pendingTeachers.length} pending</p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <i data-lucide="user-plus" class="h-6 w-6 text-violet-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-muted-foreground">Classes</p>
                                <h3 class="text-2xl font-bold">${this.classes.length}</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <i data-lucide="book-open" class="h-6 w-6 text-emerald-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-muted-foreground">Attendance Rate</p>
                                <h3 class="text-2xl font-bold">94%</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pending Teachers Section -->
                ${this.pendingTeachers.length > 0 ? `
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b bg-yellow-50 dark:bg-yellow-900/20">
                        <h3 class="font-semibold">Pending Teacher Approvals (${this.pendingTeachers.length})</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-3 text-left">Teacher</th>
                                    <th class="px-4 py-3 text-left">Email</th>
                                    <th class="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                ${this.pendingTeachers.map(t => `
                                    <tr class="hover:bg-accent/50">
                                        <td class="px-4 py-3">${t.User?.name || 'Unknown'}</td>
                                        <td class="px-4 py-3">${t.User?.email || 'N/A'}</td>
                                        <td class="px-4 py-3 text-right">
                                            <button onclick="window.dashboard.approveTeacher('${t.id}')" class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 mr-2">Approve</button>
                                            <button onclick="window.dashboard.rejectTeacher('${t.id}')" class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200">Reject</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}
                
                <!-- Students Section -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="font-semibold">Students</h3>
                        <button onclick="window.dashboard.showAddStudentModal()" class="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">+ Add Student</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-3 text-left">Student</th>
                                    <th class="px-4 py-3 text-left">ELIMUID</th>
                                    <th class="px-4 py-3 text-left">Grade</th>
                                    <th class="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                ${this.students.slice(0, 10).map(s => `
                                    <tr class="hover:bg-accent/50">
                                        <td class="px-4 py-3">
                                            <div class="flex items-center gap-3">
                                                <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span class="text-blue-700 text-sm font-medium">${(s.User?.name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</span>
                                                </div>
                                                <span>${s.User?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3"><span class="font-mono text-xs bg-muted px-2 py-1 rounded">${s.elimuid || 'N/A'}</span></td>
                                        <td class="px-4 py-3">${s.grade || 'N/A'}</td>
                                        <td class="px-4 py-3 text-right">
                                            <button onclick="window.dashboard.deleteStudent('${s.id}')" class="p-1 text-red-600 hover:bg-red-50 rounded">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${this.students.length === 0 ? '<tr><td colspan="4" class="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="grid gap-4 md:grid-cols-3">
                    <button onclick="window.router?.navigate('students')" class="p-4 border rounded-lg hover:bg-accent text-center">
                        <i data-lucide="users" class="h-8 w-8 mx-auto text-green-600 mb-2"></i>
                        <p class="font-medium">Student Management</p>
                    </button>
                    <button onclick="window.router?.navigate('teachers')" class="p-4 border rounded-lg hover:bg-accent text-center">
                        <i data-lucide="user-plus" class="h-8 w-8 mx-auto text-blue-600 mb-2"></i>
                        <p class="font-medium">Teacher Management</p>
                    </button>
                    <button onclick="window.router?.navigate('settings')" class="p-4 border rounded-lg hover:bg-accent text-center">
                        <i data-lucide="settings" class="h-8 w-8 mx-auto text-purple-600 mb-2"></i>
                        <p class="font-medium">School Settings</p>
                    </button>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ================= ACTIONS =================

    async approveTeacher(teacherId) {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        if (!confirm('Approve this teacher?')) return;
        
        this.showLoading();
        try {
            const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/admin/teachers/${teacherId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'approve' })
            });
            
            if (res.ok) {
                window.showToast('✅ Teacher approved', 'success');
                this.refresh();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            window.showToast('Failed to approve teacher', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async rejectTeacher(teacherId) {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        
        this.showLoading();
        try {
            const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/admin/teachers/${teacherId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'reject', rejectionReason: reason })
            });
            
            if (res.ok) {
                window.showToast('Teacher rejected', 'info');
                this.refresh();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            window.showToast('Failed to reject teacher', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteStudent(studentId) {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        if (!confirm('Delete this student? This cannot be undone.')) return;
        
        this.showLoading();
        try {
            const res = await fetch(`https://shuleaibackend-32h1.onrender.com/api/admin/students/${studentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                window.showToast('✅ Student deleted', 'success');
                this.refresh();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            window.showToast('Failed to delete student', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showAddStudentModal() {
        // Create a simple modal using prompt for now (quick fix)
        const name = prompt('Enter student name:');
        if (!name) return;
        
        const grade = prompt('Enter grade:');
        if (!grade) return;
        
        this.handleAddStudent(name, grade);
    }

    async handleAddStudent(name, grade) {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        this.showLoading();
        try {
            const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/teacher/students', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, grade })
            });
            
            if (res.ok) {
                const data = await res.json();
                window.showToast(`✅ Student added! ELIMUID: ${data.data.elimuid}`, 'success');
                this.refresh();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            window.showToast('Failed to add student', 'error');
        } finally {
            this.hideLoading();
        }
    }
}

// CRITICAL: Make it globally available
window.AdminDashboard = AdminDashboard;
console.log('✅ AdminDashboard registered globally');
