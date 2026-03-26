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
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        
        // Update stats in the HTML
        this.updateStats();
        
        // Render the student table
        this.renderStudentsTable();
        
        // Render pending teachers table
        this.renderPendingTeachersTable();
        
        // Update school info
        this.updateSchoolInfo(school);
        
        // Update pending count badges
        this.updatePendingCounts();
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
    
    updateSchoolInfo(school) {
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
    
    updatePendingCounts() {
        const pendingCountBadge = document.getElementById('pending-count-badge');
        const pendingCount = document.getElementById('pending-count');
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
                    <td class="px-4 py-3">
                        <span class="font-mono text-xs bg-muted px-2 py-1 rounded">${elimuid}</span>
                    </td>
                    <td class="px-4 py-3">${grade}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 ${statusClass} text-xs rounded-full">${status}</span>
                    </td>
                    <td class="px-4 py-3">${parentEmail}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.viewStudentDetails('${student.id}')" class="p-2 hover:bg-accent rounded-lg" title="View">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.editStudent('${student.id}')" class="p-2 hover:bg-accent rounded-lg" title="Edit">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.copyElimuid('${elimuid}')" class="p-2 hover:bg-purple-100 rounded-lg text-purple-600" title="Copy">
                            <i data-lucide="copy" class="h-4 w-4"></i>
                        </button>
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
            this.updatePendingCounts();
        });
    }
    
    showSection(section) {
        console.log('Showing section:', section);
        // Handle navigation to different sections
        if (section === 'students') {
            this.refreshStudents();
        } else if (section === 'teachers') {
            this.refreshPendingTeachers();
        } else if (section === 'dashboard') {
            this.refresh();
        } else if (section === 'settings') {
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-12">
                    <h2 class="text-2xl font-bold mb-4">School Settings</h2>
                    <p class="text-muted-foreground">Settings page coming soon.</p>
                </div>
            `;
        } else if (section === 'teacher-approvals') {
            this.refreshPendingTeachers();
        }
    }
    
    async refresh() {
        await this.loadData();
        this.updateStats();
        this.renderStudentsTable();
        this.renderPendingTeachersTable();
        this.updatePendingCounts();
    }
}

// Make functions globally available
window.viewStudentDetails = function(studentId) {
    alert('View student details: ' + studentId);
};

window.editStudent = function(studentId) {
    alert('Edit student: ' + studentId);
};

window.copyElimuid = function(elimuid) {
    navigator.clipboard.writeText(elimuid).then(() => {
        alert('ELIMUID copied: ' + elimuid);
    }).catch(() => {
        alert('Failed to copy');
    });
};

window.approveTeacher = async function(teacherId) {
    if (!confirm('Approve this teacher?')) return;
    alert('Approving teacher: ' + teacherId);
    // Add API call here
};

window.rejectTeacher = async function(teacherId) {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    alert('Rejecting teacher: ' + teacherId);
    // Add API call here
};
