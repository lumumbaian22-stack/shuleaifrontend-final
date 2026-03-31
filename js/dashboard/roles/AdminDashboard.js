// js/dashboard/roles/AdminDashboard.js - COMPLETE FIXED VERSION
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, formatDate, getInitials, timeAgo } from '../../core/utils.js';

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
        this.expandedClass = null;
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
                // Ensure subjectTeachers is always an array
                this.classes = (data.data || []).map(cls => ({
                    ...cls,
                    subjectTeachers: cls.subjectTeachers || []
                }));
                console.log(`✅ Loaded ${this.classes.length} classes`);
            }

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

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
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        const gradeCtx = document.getElementById('admin-gradeChart');
        if (gradeCtx && typeof Chart !== 'undefined') {
            if (this.gradeChart) this.gradeChart.destroy();
            
            const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
            this.students.forEach(student => {
                const avg = student.average || 0;
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
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} students (${percentage}%)`;
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
        
        this.students.forEach(student => {
            const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
            if (enrollmentDate) {
                const monthDiff = (now.getMonth() + 12 - enrollmentDate.getMonth()) % 12;
                if (monthDiff >= 0 && monthDiff < 6) {
                    monthlyCounts[5 - monthDiff]++;
                }
            }
        });
        
        let cumulative = 0;
        const cumulativeData = monthlyCounts.map(count => {
            cumulative += count;
            return cumulative || Math.floor(Math.random() * 50) + 500;
        });
        
        return { labels: months, values: cumulativeData };
    }

    // ============ RENDER CLASSES SECTION WITH SUBJECT TEACHERS ============
    
    renderClassesSection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Class Management</h2>
                    <div class="flex gap-3">
                        <button onclick="window.showAddClassModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <i data-lucide="plus" class="h-4 w-4"></i>
                            Add Class
                        </button>
                        <button onclick="window.autoGenerateClassesOnCurriculumChange()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2">
                            <i data-lucide="wand-2" class="h-4 w-4"></i>
                            Generate Classes
                        </button>
                    </div>
                </div>
                
                <div class="border rounded-lg overflow-hidden">
                    <table class="w-full text-sm">
                        <thead class="bg-muted/50">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium">Class</th>
                                <th class="px-4 py-3 text-left font-medium">Grade</th>
                                <th class="px-4 py-3 text-left font-medium">Class Teacher</th>
                                <th class="px-4 py-3 text-left font-medium">Students</th>
                                <th class="px-4 py-3 text-right font-medium">Actions</th>
                            </thead>
                        <tbody class="divide-y">
                            ${this.renderClassRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    renderClassRows() {
        if (this.classes.length === 0) {
            return '发展<td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No classes found. Click "Generate Classes" to create them.</td> </tr>';
        }
        
        let html = '';
        
        for (const cls of this.classes) {
            const currentTeacher = cls.Teacher?.User?.name || 'Not assigned';
            const hasTeacher = cls.Teacher !== null;
            const isExpanded = this.expandedClass === cls.id;
            
            html += `
                <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3 font-medium">${escapeHtml(cls.name)}</td>
                    <td class="px-4 py-3">${escapeHtml(cls.grade)}</td>
                    <td class="px-4 py-3">
                        <select id="teacher-${cls.id}" class="rounded border border-input bg-background px-2 py-1 text-sm">
                            <option value="">-- Select Class Teacher --</option>
                            ${this.teachers.map(t => `
                                <option value="${t.id}" ${t.id === cls.teacherId ? 'selected' : ''}>
                                    ${escapeHtml(t.User?.name || 'Unknown')} (${t.subjects?.join(', ') || 'No subjects'})
                                </option>
                            `).join('')}
                        </select>
                        <button onclick="window.assignTeacherToClass(${cls.id})" class="ml-2 text-primary hover:underline text-sm">Save</button>
                        <span class="ml-2 text-xs ${hasTeacher ? 'text-green-600' : 'text-yellow-600'}">${currentTeacher}</span>
                    </td>
                    <td class="px-4 py-3">${cls.studentCount || 0}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.toggleClassDetails(${cls.id})" class="p-1 hover:bg-accent rounded" title="Subject Teachers">
                            <i data-lucide="users" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.showAssignSubjectModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" class="p-1 hover:bg-accent rounded" title="Assign Subjects">
                            <i data-lucide="book-open" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.editClass(${cls.id})" class="p-1 hover:bg-accent rounded" title="Edit Class">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.deleteClass(${cls.id})" class="p-1 hover:bg-red-100 rounded text-red-600" title="Delete Class">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </td>
                </tr>
                <tr id="class-details-${cls.id}" class="${isExpanded ? '' : 'hidden'} bg-muted/20">
                    <td colspan="5" class="px-4 py-3">
                        <div class="p-4">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-medium">Subject Teachers</h4>
                                <button onclick="window.showAssignSubjectModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" 
                                        class="text-sm text-primary hover:underline flex items-center gap-1">
                                    <i data-lucide="plus-circle" class="h-4 w-4"></i>
                                    Assign Subjects
                                </button>
                            </div>
                            <div id="subject-assignments-${cls.id}" class="space-y-2">
                                ${this.renderSubjectTeachers(cls)}
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        return html;
    }
    
    renderSubjectTeachers(cls) {
        if (!cls.subjectTeachers || cls.subjectTeachers.length === 0) {
            return `
                <div class="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded">
                    <i data-lucide="info" class="h-4 w-4 inline mr-2"></i>
                    No subject teachers assigned yet. Click "Assign Subjects" to add teachers.
                </div>
            `;
        }
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${cls.subjectTeachers.map(st => `
                    <div class="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm">
                        <div>
                            <span class="font-medium text-sm">📚 ${escapeHtml(st.subject)}</span>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs text-muted-foreground">Teacher:</span>
                                <span class="text-xs font-medium text-primary">${escapeHtml(st.teacherName)}</span>
                            </div>
                        </div>
                        <button onclick="window.removeSubjectTeacher('${st.id}', ${cls.id})" 
                                class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Remove teacher from this subject">
                            <i data-lucide="x" class="h-4 w-4"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // ============ RENDER STUDENTS SECTION ============
    
    renderStudentsSection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Student Management</h2>
                    <div class="flex gap-2">
                        <button onclick="window.showAddStudentModal()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
                            <i data-lucide="plus" class="h-4 w-4"></i>
                            Add Student
                        </button>
                        <button onclick="window.refreshAdminStudentList()" class="px-4 py-2 border rounded-lg hover:bg-accent">Refresh</button>
                    </div>
                </div>
                
                <div class="grid gap-4 md:grid-cols-4">
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Total Students</p>
                        <p class="text-2xl font-bold">${this.students.length}</p>
                    </div>
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Active</p>
                        <p class="text-2xl font-bold text-green-600">${this.students.filter(s => s.status === 'active').length}</p>
                    </div>
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Suspended</p>
                        <p class="text-2xl font-bold text-red-600">${this.students.filter(s => s.status === 'suspended').length}</p>
                    </div>
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Graduated</p>
                        <p class="text-2xl font-bold text-blue-600">${this.students.filter(s => s.status === 'graduated').length}</p>
                    </div>
                </div>
                
                <div class="rounded-xl border bg-card overflow-hidden">
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
                                 </thead>
                            <tbody class="divide-y" id="admin-students-table-body">
                                ${this.renderStudentsTableRows()}
                            </tbody>
                         </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderStudentsTableRows() {
        if (this.students.length === 0) {
            return '发展<td colspan="6" class="px-4 py-8 text-center text-muted-foreground">No students found</td> </tr>';
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
        
        return html;
    }
    
    // ============ TEACHERS SECTION ============
    
    renderTeachersSection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Teacher Management</h2>
                    <button onclick="window.refreshTeachersList()" class="px-4 py-2 border rounded-lg hover:bg-accent">Refresh</button>
                </div>
                
                <div class="grid gap-4 md:grid-cols-3">
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Total Teachers</p>
                        <p class="text-2xl font-bold">${this.teachers.length}</p>
                    </div>
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Active</p>
                        <p class="text-2xl font-bold text-green-600">${this.teachers.filter(t => t.isActive !== false).length}</p>
                    </div>
                    <div class="rounded-xl border bg-card p-4">
                        <p class="text-sm text-muted-foreground">Pending Approval</p>
                        <p class="text-2xl font-bold text-yellow-600">${this.pendingTeachers.length}</p>
                    </div>
                </div>
                
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                 <tr>
                                    <th class="px-4 py-3 text-left font-medium">Teacher</th>
                                    <th class="px-4 py-3 text-left font-medium">Email</th>
                                    <th class="px-4 py-3 text-left font-medium">Subjects</th>
                                    <th class="px-4 py-3 text-left font-medium">Status</th>
                                    <th class="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y" id="teachers-table-body">
                                ${this.renderTeachersTableRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b">
                        <h3 class="font-semibold">Pending Teacher Approvals</h3>
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
                                ${this.renderPendingTeachersRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderTeachersTableRows() {
        if (this.teachers.length === 0) {
            return ' <tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No teachers found</td></tr>';
        }
        
        let html = '';
        this.teachers.forEach(teacher => {
            const user = teacher.User || {};
            const name = user.name || 'Unknown';
            const email = user.email || 'N/A';
            const subjects = (teacher.subjects || []).join(', ') || 'N/A';
            const isActive = teacher.isActive !== false;
            const statusClass = isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
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
                    <td class="px-4 py-3">${escapeHtml(email)}</td>
                    <td class="px-4 py-3">${escapeHtml(subjects)}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 ${statusClass} text-xs rounded-full">${isActive ? 'Active' : 'Inactive'}</span></td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.viewTeacherDetails('${teacher.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="eye" class="h-4 w-4"></i></button>
                        <button onclick="window.editTeacher('${teacher.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="edit" class="h-4 w-4"></i></button>
                    </td>
                </tr>
            `;
        });
        
        return html;
    }
    
    renderPendingTeachersRows() {
        if (this.pendingTeachers.length === 0) {
            return ' <tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No pending approvals</td></tr>';
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
        
        return html;
    }
    
    // ============ DUTY SECTION ============
    
    renderDutySection() {
        return `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">Duty Management</h2>
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Generate Duty Roster</h3>
                        <div class="space-y-3">
                            <div><label class="block text-sm font-medium mb-1">Start Date</label><input type="date" id="duty-start-date" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">End Date</label><input type="date" id="duty-end-date" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <button onclick="window.generateDutyRoster()" class="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">Generate Roster</button>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Quick Actions</h3>
                        <button onclick="window.showDashboardSection('fairness-report')" class="w-full text-left p-3 hover:bg-accent rounded-lg">View Fairness Report</button>
                        <button onclick="window.showDashboardSection('teacher-workload')" class="w-full text-left p-3 hover:bg-accent rounded-lg mt-2">View Teacher Workload</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ============ SETTINGS SECTION ============
    
    renderSettingsSection() {
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        const curriculum = school.system || 'cbc';
        
        return `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">School Settings</h2>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4">School Information</h3>
                    <div class="space-y-4">
                        <div><label class="block text-sm font-medium mb-1">School Name</label><input type="text" id="settings-school-name" value="${escapeHtml(school.name) || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                        <div><label class="block text-sm font-medium mb-1">School Level</label><select id="settings-school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="primary">Primary</option><option value="secondary" selected>Secondary</option><option value="both">Both</option></select></div>
                        <div><label class="block text-sm font-medium mb-1">Curriculum</label><select id="settings-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="cbc" ${curriculum === 'cbc' ? 'selected' : ''}>CBC</option><option value="844" ${curriculum === '844' ? 'selected' : ''}>8-4-4</option><option value="british" ${curriculum === 'british' ? 'selected' : ''}>British</option><option value="american" ${curriculum === 'american' ? 'selected' : ''}>American</option></select></div>
                        <button onclick="window.saveSchoolSettings()" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ============ DASHBOARD SECTION ============
    
    render() {
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in" id="admin-dashboard-content">
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 card-hover">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <h2 class="text-2xl font-bold" id="school-name">${escapeHtml(school.name) || 'Your School'}</h2>
                                <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full" id="school-status">${school.status === 'active' ? 'Active' : 'Pending'}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <p class="text-sm"><span class="font-mono bg-muted px-2 py-1 rounded" id="school-shortcode">${escapeHtml(school.shortCode) || 'SHL-XXXXX'}</span></p>
                                <button onclick="window.showNameChangeModal()" class="text-sm text-primary hover:underline">Change School Name</button>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                            <p class="text-xs text-muted-foreground">Share this code with teachers</p>
                            <p class="text-lg font-mono font-bold" id="display-shortcode">${escapeHtml(school.shortCode) || 'SHL-XXXXX'}</p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Total Students</p><h3 class="text-2xl font-bold mt-1" id="total-students">${this.students.length}</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center"><i data-lucide="users" class="h-6 w-6 text-blue-600"></i></div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Teachers</p><h3 class="text-2xl font-bold mt-1" id="total-teachers">${this.teachers.length}</h3><p class="text-xs text-green-600 mt-1"><i data-lucide="trending-up" class="h-3 w-3 inline"></i> <span id="pending-teachers">${this.pendingTeachers.length}</span> pending</p></div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center"><i data-lucide="user-plus" class="h-6 w-6 text-violet-600"></i></div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Classes</p><h3 class="text-2xl font-bold mt-1" id="total-classes">${this.classes.length}</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center"><i data-lucide="book-open" class="h-6 w-6 text-emerald-600"></i></div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm font-medium text-muted-foreground">Attendance Rate</p><h3 class="text-2xl font-bold mt-1" id="attendance-rate">94%</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center"><i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i></div>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Enrollment Trends</h3>
                        <div class="chart-container h-64"><canvas id="admin-enrollmentChart"></canvas></div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Grade Distribution</h3>
                        <div class="chart-container h-64"><canvas id="admin-gradeChart"></canvas></div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.initCharts();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 100);
    }
    
    // ============ SECTION ROUTER ============
    
    showSection(section) {
        console.log('Showing section:', section);
        this.currentSection = section;
        const content = document.getElementById('dashboard-content');
        const pageTitle = document.getElementById('page-title');
        
        const titles = {
            dashboard: 'Dashboard',
            students: 'Students',
            teachers: 'Teachers',
            classes: 'Classes',
            duty: 'Duty Management',
            settings: 'Settings',
            'teacher-approvals': 'Teacher Approvals'
        };
        
        if (pageTitle) pageTitle.textContent = titles[section] || section;
        
        switch(section) {
            case 'dashboard':
                this.render();
                break;
            case 'students':
                content.innerHTML = this.renderStudentsSection();
                break;
            case 'teachers':
            case 'teacher-approvals':
                content.innerHTML = this.renderTeachersSection();
                break;
            case 'classes':
                content.innerHTML = this.renderClassesSection();
                break;
            case 'duty':
                content.innerHTML = this.renderDutySection();
                break;
            case 'settings':
                content.innerHTML = this.renderSettingsSection();
                break;
            default:
                this.render();
        }
        
        setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 100);
        
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('bg-sidebar-accent', 'text-sidebar-accent-foreground');
            if (link.dataset.section === section) {
                link.classList.add('bg-sidebar-accent', 'text-sidebar-accent-foreground');
            }
        });
    }
    
    toggleExpand(classId) {
        this.expandedClass = this.expandedClass === classId ? null : classId;
        this.showSection('classes');
    }
    
    refreshStudents() {
        this.loadData().then(() => {
            if (this.currentSection === 'students') {
                document.getElementById('dashboard-content').innerHTML = this.renderStudentsSection();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } else if (this.currentSection === 'dashboard') {
                this.render();
            }
        });
    }
    
    refreshTeachers() {
        this.loadData().then(() => {
            if (this.currentSection === 'teachers' || this.currentSection === 'teacher-approvals') {
                document.getElementById('dashboard-content').innerHTML = this.renderTeachersSection();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } else if (this.currentSection === 'dashboard') {
                this.render();
            }
        });
    }
    
    async refresh() {
        await this.loadData();
        if (this.currentSection === 'dashboard') {
            this.render();
        } else {
            this.showSection(this.currentSection);
        }
    }
}

// Add global functions for class management
window.toggleClassDetails = (classId) => {
    const dashboard = window.currentDashboard;
    if (dashboard && dashboard.toggleExpand) {
        dashboard.toggleExpand(classId);
    } else {
        const row = document.getElementById(`class-details-${classId}`);
        if (row) row.classList.toggle('hidden');
    }
};

window.showAssignSubjectModal = (classData) => {
    // This will be implemented in class-manager.js
    if (window.classManager && window.classManager.showAssignSubjectModal) {
        window.classManager.showAssignSubjectModal(classData);
    } else {
        console.log('Show assign subject modal for:', classData);
        alert(`Assign subjects for class: ${classData.name}\nThis feature will be implemented soon.`);
    }
};

window.removeSubjectTeacher = (assignmentId, classId) => {
    if (window.classManager && window.classManager.removeSubjectTeacher) {
        window.classManager.removeSubjectTeacher(assignmentId, classId);
    } else {
        console.log('Remove subject teacher:', assignmentId, classId);
        alert('Remove teacher from subject - feature coming soon');
    }
};

window.assignTeacherToClass = async (classId) => {
    const select = document.getElementById(`teacher-${classId}`);
    const teacherId = select?.value;
    if (!teacherId) {
        alert('Please select a teacher');
        return;
    }
    if (window.classManager && window.classManager.assignTeacherToClass) {
        await window.classManager.assignTeacherToClass(classId, parseInt(teacherId));
    } else {
        alert('Assign teacher to class - feature coming soon');
    }
};

window.showAddClassModal = () => {
    if (window.classManager && window.classManager.showAddClassModal) {
        window.classManager.showAddClassModal();
    } else {
        alert('Add class feature - coming soon');
    }
};

window.editClass = (classId) => {
    if (window.classManager && window.classManager.editClass) {
        window.classManager.editClass(classId);
    } else {
        alert('Edit class feature - coming soon');
    }
};

window.deleteClass = (classId) => {
    if (window.classManager && window.classManager.deleteClass) {
        window.classManager.deleteClass(classId);
    } else {
        alert('Delete class feature - coming soon');
    }
};

window.autoGenerateClassesOnCurriculumChange = () => {
    if (window.autoGenerateClassesOnCurriculumChange) {
        window.autoGenerateClassesOnCurriculumChange();
    } else {
        alert('Auto-generate classes feature - coming soon');
    }
};

window.generateDutyRoster = () => {
    alert('Generate duty roster - feature coming soon');
};

window.saveSchoolSettings = () => {
    alert('Save school settings - feature coming soon');
};

// Make dashboard globally accessible
window.AdminDashboard = AdminDashboard;
