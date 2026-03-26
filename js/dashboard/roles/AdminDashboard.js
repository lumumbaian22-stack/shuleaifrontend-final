// js/dashboard/roles/AdminDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, formatDate, getInitials, timeAgo } from '../../core/utils.js';

export class AdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.students = [];
        this.teachers = [];
        this.pendingTeachers = [];
        this.classes = [];
    }

    async loadData() {
        console.log('📊 Loading admin dashboard data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            const [studentsRes, teachersRes, pendingRes, classesRes] = await Promise.all([
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/students', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/teachers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/approvals/pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/classes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (studentsRes.ok) {
                const data = await studentsRes.json();
                this.students = data.data || [];
                console.log(`✅ Loaded ${this.students.length} students`);
            }
            if (teachersRes.ok) {
                const data = await teachersRes.json();
                this.teachers = data.data || [];
                console.log(`✅ Loaded ${this.teachers.length} teachers`);
            }
            if (pendingRes.ok) {
                const data = await pendingRes.json();
                this.pendingTeachers = data.data?.teachers || [];
                console.log(`✅ Loaded ${this.pendingTeachers.length} pending teachers`);
            }
            if (classesRes.ok) {
                const data = await classesRes.json();
                this.classes = data.data || [];
                console.log(`✅ Loaded ${this.classes.length} classes`);
            }

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    render() {
        // Load the admin.html content into the container
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in" id="admin-dashboard-content">
                <!-- School Profile Card -->
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 card-hover">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <h2 class="text-2xl font-bold" id="school-name">Your School</h2>
                                <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full" id="school-status">Active</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <p class="text-sm"><span class="font-mono bg-muted px-2 py-1 rounded" id="school-shortcode">SHL-XXXXX</span></p>
                                <button onclick="window.showNameChangeModal()" class="text-sm text-primary hover:underline">Change School Name</button>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                            <p class="text-xs text-muted-foreground">Share this code with teachers</p>
                            <p class="text-lg font-mono font-bold" id="display-shortcode">SHL-XXXXX</p>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Total Students</p>
                                <h3 class="text-2xl font-bold mt-1" id="total-students">0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i data-lucide="users" class="h-6 w-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Teachers</p>
                                <h3 class="text-2xl font-bold mt-1" id="total-teachers">0</h3>
                                <p class="text-xs text-green-600 mt-1 flex items-center gap-1" id="pending-teachers-text">
                                    <i data-lucide="trending-up" class="h-3 w-3"></i>
                                    <span id="pending-teachers">0</span> pending approval
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
                                <p class="text-sm font-medium text-muted-foreground">Classes</p>
                                <h3 class="text-2xl font-bold mt-1" id="total-classes">0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <i data-lucide="book-open" class="h-6 w-6 text-emerald-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                                <h3 class="text-2xl font-bold mt-1" id="attendance-rate">94%</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="grid gap-4 md:grid-cols-3">
                    <button onclick="window.showDashboardSection('teacher-approvals')" class="p-6 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="user-plus" class="h-8 w-8 text-blue-600 mb-3"></i>
                        <h4 class="font-semibold">Teacher Approvals</h4>
                        <p class="text-sm text-muted-foreground">Approve pending teachers</p>
                        <span class="mt-2 inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700" id="pending-count-badge">0 pending</span>
                    </button>
                    
                    <button onclick="window.showDashboardSection('students')" class="p-6 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="users" class="h-8 w-8 text-green-600 mb-3"></i>
                        <h4 class="font-semibold">Student Management</h4>
                        <p class="text-sm text-muted-foreground">View and manage all students</p>
                    </button>
                    
                    <button onclick="window.showDashboardSection('settings')" class="p-6 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="settings" class="h-8 w-8 text-purple-600 mb-3"></i>
                        <h4 class="font-semibold">School Settings</h4>
                        <p class="text-sm text-muted-foreground">Configure curriculum and subjects</p>
                    </button>
                </div>

                <!-- Student Management Table -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="font-semibold">Student Management</h3>
                        <button onclick="window.refreshAdminStudentList()" class="px-3 py-1 border rounded-lg text-sm hover:bg-accent">Refresh</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-3 text-left font-medium">Student</th>
                                    <th class="px-4 py-3 text-left font-medium">ELIMUID</th>
                                    <th class="px-4 py-3 text-left font-medium">Grade</th>
                                    <th class="px-4 py-3 text-left font-medium">Status</th>
                                    <th class="px-4 py-3 text-left font-medium">Parent</th>
                                    <th class="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y" id="admin-students-table-body">
                                <tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">Loading students...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Teacher Approval Queue -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="font-semibold">Pending Teacher Approvals</h3>
                        <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full" id="pending-count">0</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-3 text-left font-medium">Teacher</th>
                                    <th class="px-4 py-3 text-left font-medium">Email</th>
                                    <th class="px-4 py-3 text-left font-medium">Subjects</th>
                                    <th class="px-4 py-3 text-left font-medium">Applied</th>
                                    <th class="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y" id="pending-teachers-table">
                                <tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No pending approvals</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Student Details Modal -->
            <div id="student-details-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeStudentDetailsModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Student Details</h3>
                            <button onclick="window.closeStudentDetailsModal()" class="p-2 hover:bg-accent rounded-lg">
                                <i data-lucide="x" class="h-5 w-5"></i>
                            </button>
                        </div>
                        <div class="modal-content space-y-4"></div>
                        <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <button onclick="window.closeStudentDetailsModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Student Modal -->
            <div id="edit-student-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeEditStudentModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <h3 class="text-lg font-semibold mb-4">Edit Student</h3>
                        <input type="hidden" id="edit-student-id">
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="edit-student-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="edit-student-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Grade/Class</label><input type="text" id="edit-student-grade" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Status</label><select id="edit-student-status" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option><option value="graduated">Graduated</option></select></div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button onclick="window.closeEditStudentModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                            <button onclick="window.handleUpdateStudent()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Student</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Teacher Modal -->
            <div id="edit-teacher-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeEditTeacherModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <h3 class="text-lg font-semibold mb-4">Edit Teacher</h3>
                        <input type="hidden" id="edit-teacher-id">
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="edit-teacher-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="edit-teacher-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Subjects</label><input type="text" id="edit-teacher-subjects" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Department</label><input type="text" id="edit-teacher-department" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button onclick="window.closeEditTeacherModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                            <button onclick="window.handleUpdateTeacher()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Teacher</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Attendance Modal -->
            <div id="attendance-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeAttendanceModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Attendance History</h3>
                            <button onclick="window.closeAttendanceModal()" class="p-2 hover:bg-accent rounded-lg">
                                <i data-lucide="x" class="h-5 w-5"></i>
                            </button>
                        </div>
                        <div class="modal-content space-y-4"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Update all data after rendering HTML
        this.updateSchoolInfo();
        this.updateStats();
        this.renderStudentsTable();
        this.renderPendingTeachersTable();
    }
    
    updateSchoolInfo() {
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        const schoolNameEl = document.getElementById('school-name');
        const schoolShortcodeEl = document.getElementById('school-shortcode');
        const displayShortcodeEl = document.getElementById('display-shortcode');
        const schoolStatusEl = document.getElementById('school-status');
        
        if (schoolNameEl) schoolNameEl.textContent = school.name || 'Your School';
        if (schoolShortcodeEl) schoolShortcodeEl.textContent = school.shortCode || 'SHL-XXXXX';
        if (displayShortcodeEl) displayShortcodeEl.textContent = school.shortCode || 'SHL-XXXXX';
        if (schoolStatusEl) {
            schoolStatusEl.textContent = school.status || 'Active';
            schoolStatusEl.className = `px-3 py-1 ${school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs rounded-full`;
        }
    }
    
    updateStats() {
        const totalStudentsEl = document.getElementById('total-students');
        const totalTeachersEl = document.getElementById('total-teachers');
        const totalClassesEl = document.getElementById('total-classes');
        const pendingTeachersEl = document.getElementById('pending-teachers');
        const pendingCountBadge = document.getElementById('pending-count-badge');
        const pendingCount = document.getElementById('pending-count');
        
        if (totalStudentsEl) totalStudentsEl.textContent = this.students.length;
        if (totalTeachersEl) totalTeachersEl.textContent = this.teachers.length;
        if (totalClassesEl) totalClassesEl.textContent = this.classes.length;
        if (pendingTeachersEl) pendingTeachersEl.textContent = this.pendingTeachers.length;
        if (pendingCountBadge) pendingCountBadge.textContent = `${this.pendingTeachers.length} pending`;
        if (pendingCount) pendingCount.textContent = this.pendingTeachers.length;
    }
    
    renderStudentsTable() {
        const container = document.getElementById('admin-students-table-body');
        if (!container) return;
        
        if (this.students.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>';
            return;
        }
        
        let html = '';
        this.students.forEach(student => {
            const user = student.User || {};
            const name = user.name || 'Unknown';
            const elimuid = student.elimuid || 'N/A';
            const grade = student.grade || 'N/A';
            const status = student.status || 'active';
            const statusClass = status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
            const parentEmail = user.email || '-';
            const initials = getInitials(name);
            
            html += `
                <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="font-medium text-blue-700 text-sm">${initials}</span>
                            </div>
                            <span class="font-medium">${escapeHtml(name)}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3"><span class="font-mono text-xs bg-muted px-2 py-1 rounded">${elimuid}</span></td>
                    <td class="px-4 py-3">${grade}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 ${statusClass} text-xs rounded-full">${status}</span></td>
                    <td class="px-4 py-3">${parentEmail}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.viewStudentDetails('${student.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="eye" class="h-4 w-4"></i></button>
                        <button onclick="window.editStudent('${student.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="edit" class="h-4 w-4"></i></button>
                        <button onclick="window.copyElimuid('${elimuid}')" class="p-2 hover:bg-purple-100 rounded-lg"><i data-lucide="copy" class="h-4 w-4"></i></button>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    renderPendingTeachersTable() {
        const container = document.getElementById('pending-teachers-table');
        if (!container) return;
        
        if (this.pendingTeachers.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No pending approvals</td></tr>';
            return;
        }
        
        let html = '';
        this.pendingTeachers.forEach(teacher => {
            const user = teacher.User || {};
            const name = user.name || 'Unknown';
            const email = user.email || 'N/A';
            const subjects = (teacher.subjects || []).join(', ') || 'N/A';
            const applied = timeAgo(teacher.createdAt);
            const initials = getInitials(name);
            
            html += `
                <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                                <span class="font-medium text-violet-700 text-sm">${initials}</span>
                            </div>
                            <span class="font-medium">${escapeHtml(name)}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">${escapeHtml(email)}</td>
                    <td class="px-4 py-3">${escapeHtml(subjects)}</td>
                    <td class="px-4 py-3">${applied}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.approveTeacher('${teacher.id}')" class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 mr-2">Approve</button>
                        <button onclick="window.rejectTeacher('${teacher.id}')" class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200">Reject</button>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    refreshStudents() {
        this.loadData().then(() => {
            this.renderStudentsTable();
            this.updateStats();
        });
    }
    
    refreshPendingTeachers() {
        this.loadData().then(() => {
            this.renderPendingTeachersTable();
            this.updateStats();
        });
    }
    
    showSection(section) {
        console.log('Showing section:', section);
        if (section === 'students') {
            this.refreshStudents();
        } else if (section === 'teachers' || section === 'teacher-approvals') {
            this.refreshPendingTeachers();
        } else if (section === 'dashboard') {
            this.refresh();
        }
    }
    
    async refresh() {
        await this.loadData();
        this.updateSchoolInfo();
        this.updateStats();
        this.renderStudentsTable();
        this.renderPendingTeachersTable();
    }
}

// Make functions globally available
window.refreshAdminStudentList = () => {
    if (window.dashboard) window.dashboard.refreshStudents();
};
window.refreshPendingTeachers = () => {
    if (window.dashboard) window.dashboard.refreshPendingTeachers();
};
window.viewStudentDetails = (id) => alert('View student: ' + id);
window.editStudent = (id) => alert('Edit student: ' + id);
window.copyElimuid = (elimuid) => { navigator.clipboard.writeText(elimuid); alert('Copied: ' + elimuid); };
window.approveTeacher = (id) => alert('Approve teacher: ' + id);
window.rejectTeacher = (id) => alert('Reject teacher: ' + id);
window.handleUpdateStudent = () => alert('Update student');
window.handleUpdateTeacher = () => alert('Update teacher');
window.closeEditStudentModal = () => document.getElementById('edit-student-modal')?.classList.add('hidden');
window.closeEditTeacherModal = () => document.getElementById('edit-teacher-modal')?.classList.add('hidden');
window.closeAttendanceModal = () => document.getElementById('attendance-modal')?.classList.add('hidden');
window.closeStudentDetailsModal = () => document.getElementById('student-details-modal')?.classList.add('hidden');
