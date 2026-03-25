// js/dashboard/roles/AdminDashboard.js
//import { BaseDashboard } from '../base/BaseDashboard.js';
//import { adminAPI } from '../../api/admin.js';
//import { store } from '../../core/store.js';
//import { toast } from '../../ui/feedback/Toast.js';
//import { modalManager } from '../../ui/components/Modal.js';
//import { ChartRenderer } from '../base/ChartRenderer.js';
//import { StatsRenderer } from '../base/StatsRenderer.js';
//import { TableRenderer } from '../base/TableRenderer.js';
//import { formatDate, timeAgo, getInitials, formatCurrency } from '../../core/utils.js';
//import { getGradeFromScore } from '../../constants/curriculum.js';

AdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.pendingTeachers = [];
        this.recentActivity = [];
        this.school = null;
        this.students = [];
        this.teachers = [];
        this.classes = [];
    }

    async loadData() {
        console.log('📊 Loading admin dashboard data...');
        
        // Get data from store first (cached)
        const cachedData = store.getState('dashboard')?.admin;
        if (cachedData && !this.needsRefresh(cachedData)) {
            this.data = cachedData;
            this.students = cachedData.students || [];
            this.teachers = cachedData.teachers || [];
            this.classes = cachedData.classes || [];
            this.pendingTeachers = cachedData.pendingTeachers || [];
            return;
        }
        
        // Fetch fresh data from API
        try {
            const [teachersRes, studentsRes, pendingRes, classesRes] = await Promise.all([
                adminAPI.getTeachers().catch(() => ({ data: [] })),
                adminAPI.getStudents().catch(() => ({ data: [] })),
                adminAPI.getPendingApprovals().catch(() => ({ data: { teachers: [] } })),
                adminAPI.getClasses().catch(() => ({ data: [] }))
            ]);
            
            this.students = studentsRes.data || [];
            this.teachers = teachersRes.data || [];
            this.pendingTeachers = pendingRes.data?.teachers || [];
            this.classes = classesRes.data || [];
            
            // Get school info from store
            this.school = store.getState('school') || {};
            
            this.data = {
                students: this.students,
                teachers: this.teachers,
                pendingTeachers: this.pendingTeachers,
                classes: this.classes,
                school: this.school
            };
            
            this.stats = {
                totalStudents: this.students.length,
                totalTeachers: this.teachers.length,
                totalClasses: this.classes.length,
                pendingApprovals: this.pendingTeachers.length,
                attendanceRate: 94 // Would come from real API
            };
            
            // Cache in store
            store.dispatch({
                type: 'DASHBOARD_DATA',
                payload: { role: 'admin', data: this.data, timestamp: Date.now() }
            });
            
        } catch (error) {
            console.error('Failed to load admin data:', error);
            this.showError('Failed to load dashboard data');
            throw error;
        }
    }
    
    needsRefresh(cachedData) {
        // Refresh if cache is older than 5 minutes
        return !cachedData.timestamp || (Date.now() - cachedData.timestamp) > 5 * 60 * 1000;
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                ${this.renderSchoolProfile()}
                <div id="stats-container" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold">Enrollment Trends</h3>
                            <button onclick="window.dashboard?.refreshChart('enrollment')" class="text-xs text-primary hover:underline">Refresh</button>
                        </div>
                        <div class="chart-container h-64" id="enrollment-chart-container"></div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold">Grade Distribution</h3>
                            <select id="grade-distribution-filter" class="text-xs border rounded px-2 py-1 bg-background">
                                <option value="all">All Grades</option>
                                ${this.getUniqueGrades().map(grade => `<option value="${grade}">${grade}</option>`).join('')}
                            </select>
                        </div>
                        <div class="chart-container h-64" id="grade-chart-container"></div>
                    </div>
                </div>
                ${this.renderPendingTeachersTable()}
                ${this.renderStudentsTable()}
                ${this.renderQuickActions()}
            </div>
        `;
        
        // Render stats
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            StatsRenderer.render(statsContainer, this.stats, 'admin');
        }
        
        // Render charts
        this.renderCharts();
        
        // Set up filter listener
        const gradeFilter = document.getElementById('grade-distribution-filter');
        if (gradeFilter) {
            gradeFilter.addEventListener('change', (e) => this.updateGradeChart(e.target.value));
        }
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    renderSchoolProfile() {
        const statusColor = this.school?.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700';
        
        return `
            <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-2xl font-bold school-name-display">${this.school?.name || 'Your School'}</h2>
                            <span class="px-3 py-1 ${statusColor} text-xs rounded-full">
                                ${this.school?.status || 'pending'}
                            </span>
                        </div>
                        <div class="flex items-center gap-4 flex-wrap">
                            <p class="text-sm"><span class="font-mono bg-muted px-2 py-1 rounded">Short Code: ${this.school?.shortCode || 'SHL-XXXXX'}</span></p>
                            <button onclick="window.dashboard?.showNameChangeModal()" class="text-sm text-primary hover:underline">Change School Name ($50)</button>
                            <button onclick="window.dashboard?.showCurriculumModal()" class="text-sm text-primary hover:underline">Change Curriculum</button>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                        <p class="text-xs text-muted-foreground">Share this code with teachers</p>
                        <p class="text-lg font-mono font-bold">${this.school?.shortCode || 'SHL-XXXXX'}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPendingTeachersTable() {
        if (!this.pendingTeachers || this.pendingTeachers.length === 0) {
            return '';
        }
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold">Pending Teacher Approvals</h3>
                    <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">${this.pendingTeachers.length}</span>
                </div>
                <div id="pending-teachers-table-container"></div>
            </div>
        `;
    }
    
    renderStudentsTable() {
        if (!this.students || this.students.length === 0) {
            return `
                <div class="rounded-xl border bg-card p-8 text-center">
                    <i data-lucide="users" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground">No students found</p>
                    <button onclick="window.dashboard?.showAddStudentModal()" class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Add Student</button>
                </div>
            `;
        }
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold">Student Management</h3>
                    <div class="flex gap-2">
                        <button onclick="window.dashboard?.showAddStudentModal()" class="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg">+ Add Student</button>
                        <button onclick="window.dashboard?.refreshStudents()" class="px-3 py-1 border rounded-lg text-sm hover:bg-accent">Refresh</button>
                    </div>
                </div>
                <div id="students-table-container"></div>
            </div>
        `;
    }
    
    renderQuickActions() {
        return `
            <div class="grid gap-4 md:grid-cols-4">
                <button onclick="window.dashboard?.showSection('teacher-approvals')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="user-plus" class="h-6 w-6 text-blue-600 mb-2"></i>
                    <p class="font-medium">Teacher Approvals</p>
                    <p class="text-xs text-muted-foreground">Approve pending teachers</p>
                    ${this.pendingTeachers.length ? `<span class="mt-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">${this.pendingTeachers.length} pending</span>` : ''}
                </button>
                
                <button onclick="window.dashboard?.showSection('students')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="users" class="h-6 w-6 text-green-600 mb-2"></i>
                    <p class="font-medium">Student Management</p>
                    <p class="text-xs text-muted-foreground">View and manage all students</p>
                </button>
                
                <button onclick="window.dashboard?.showSection('classes')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="book-open" class="h-6 w-6 text-purple-600 mb-2"></i>
                    <p class="font-medium">Class Management</p>
                    <p class="text-xs text-muted-foreground">Create and manage classes</p>
                </button>
                
                <button onclick="window.dashboard?.showSection('duty')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="clock" class="h-6 w-6 text-amber-600 mb-2"></i>
                    <p class="font-medium">Duty Management</p>
                    <p class="text-xs text-muted-foreground">Generate duty rosters</p>
                </button>
            </div>
        `;
    }
    
    renderCharts() {
        // Enrollment chart
        const enrollmentContainer = document.getElementById('enrollment-chart-container');
        if (enrollmentContainer) {
            const enrollmentData = this.generateEnrollmentData();
            this.charts.enrollment = ChartRenderer.render(enrollmentContainer, enrollmentData, 'line');
        }
        
        // Grade distribution chart
        this.renderGradeChart('all');
    }
    
    renderGradeChart(filter = 'all') {
        const gradeContainer = document.getElementById('grade-chart-container');
        if (!gradeContainer) return;
        
        let gradeData;
        if (filter === 'all') {
            gradeData = this.generateGradeDistributionData();
        } else {
            gradeData = this.generateGradeDistributionDataForGrade(filter);
        }
        
        if (this.charts.grade) {
            ChartRenderer.destroy(this.charts.grade);
        }
        this.charts.grade = ChartRenderer.render(gradeContainer, gradeData, 'doughnut');
    }
    
    generateEnrollmentData() {
        // This would come from real API
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [520, 535, 543, 550, 558, 565],
            label: 'Students'
        };
    }
    
    generateGradeDistributionData() {
        // Count students by grade
        const gradeCounts = {};
        this.students.forEach(student => {
            const grade = student.grade || 'Unknown';
            gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        });
        
        return {
            labels: Object.keys(gradeCounts),
            values: Object.values(gradeCounts)
        };
    }
    
    generateGradeDistributionDataForGrade(grade) {
        // For a specific grade, show subject performance
        // This would come from real API
        return {
            labels: ['A', 'B', 'C', 'D', 'E'],
            values: [12, 18, 8, 4, 2]
        };
    }
    
    getUniqueGrades() {
        const grades = new Set();
        this.students.forEach(student => {
            if (student.grade) grades.add(student.grade);
        });
        return Array.from(grades).sort();
    }
    
    updateGradeChart(filter) {
        this.renderGradeChart(filter);
    }
    
    refreshChart(chartType) {
        if (chartType === 'enrollment') {
            // Refresh enrollment chart data
            const enrollmentContainer = document.getElementById('enrollment-chart-container');
            if (enrollmentContainer && this.charts.enrollment) {
                const newData = this.generateEnrollmentData();
                this.charts.enrollment.data.datasets[0].data = newData.values;
                this.charts.enrollment.data.labels = newData.labels;
                this.charts.enrollment.update();
            }
        } else if (chartType === 'grade') {
            const filter = document.getElementById('grade-distribution-filter')?.value || 'all';
            this.updateGradeChart(filter);
        }
    }
    
    renderPendingTeachersTable() {
        const container = document.getElementById('pending-teachers-table-container');
        if (!container) return;
        
        const config = {
            columns: [
                { key: 'User.name', label: 'Teacher', align: 'left', dataLabel: 'Teacher' },
                { key: 'User.email', label: 'Email', align: 'left', dataLabel: 'Email' },
                { key: 'subjects', label: 'Subjects', align: 'left', dataLabel: 'Subjects', render: (val) => (val || []).join(', ') || '-' },
                { key: 'qualification', label: 'Qualification', align: 'left', dataLabel: 'Qualification', render: (val) => val || '-' },
                { key: 'createdAt', label: 'Applied', align: 'left', dataLabel: 'Applied', render: (val) => timeAgo(val) },
                { key: 'id', label: 'Actions', align: 'right', dataLabel: 'Actions', render: (val, row) => `
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="window.dashboard?.approveTeacher('${val}')" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors">Approve</button>
                        <button onclick="window.dashboard?.rejectTeacher('${val}')" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors">Reject</button>
                        <button onclick="window.dashboard?.viewTeacherDetails('${val}')" class="p-1 hover:bg-accent rounded-lg" title="View Details">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                    </div>
                ` }
            ],
            data: this.pendingTeachers,
            emptyMessage: 'No pending teacher approvals'
        };
        
        TableRenderer.render(container, config);
    }
    
    renderStudentsTable() {
        const container = document.getElementById('students-table-container');
        if (!container) return;
        
        const config = {
            columns: [
                { key: 'User.name', label: 'Student', align: 'left', dataLabel: 'Student', render: (val, row) => `
                    <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="font-medium text-blue-700 text-sm">${getInitials(val)}</span>
                        </div>
                        <span class="font-medium">${val || 'Unknown'}</span>
                    </div>
                ` },
                { key: 'elimuid', label: 'ELIMUID', align: 'left', dataLabel: 'ELIMUID', render: (val) => `<span class="font-mono text-xs bg-muted px-2 py-1 rounded">${val || 'N/A'}</span>` },
                { key: 'grade', label: 'Grade', align: 'left', dataLabel: 'Grade', render: (val) => val || 'N/A' },
                { key: 'status', label: 'Status', align: 'left', dataLabel: 'Status', render: (val) => `
                    <span class="px-2 py-1 ${val === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs rounded-full">
                        ${val || 'active'}
                    </span>
                ` },
                { key: 'User.email', label: 'Parent Email', align: 'left', dataLabel: 'Parent Email', render: (val) => val || '-' },
                { key: 'id', label: 'Actions', align: 'right', dataLabel: 'Actions', render: (val, row) => `
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="window.dashboard?.viewStudentDetails('${val}')" class="p-2 hover:bg-accent rounded-lg" title="View Details">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.editStudent('${val}')" class="p-2 hover:bg-accent rounded-lg" title="Edit">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                        ${row.status === 'active' ? 
                            `<button onclick="window.dashboard?.suspendStudent('${val}', '${row.User?.name || 'Student'}')" class="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600" title="Suspend">
                                <i data-lucide="pause-circle" class="h-4 w-4"></i>
                            </button>` : 
                            `<button onclick="window.dashboard?.reactivateStudent('${val}', '${row.User?.name || 'Student'}')" class="p-2 hover:bg-green-100 rounded-lg text-green-600" title="Reactivate">
                                <i data-lucide="play-circle" class="h-4 w-4"></i>
                            </button>`
                        }
                        <button onclick="window.dashboard?.deleteStudent('${val}', '${row.User?.name || 'Student'}')" class="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.copyElimuid('${row.elimuid}')" class="p-2 hover:bg-purple-100 rounded-lg text-purple-600" title="Copy ELIMUID">
                            <i data-lucide="copy" class="h-4 w-4"></i>
                        </button>
                    </div>
                ` }
            ],
            data: this.students,
            emptyMessage: 'No students found'
        };
        
        TableRenderer.render(container, config);
    }
    
    // ============ Action Methods ============
    
    async approveTeacher(teacherId) {
        if (!confirm('Approve this teacher?')) return;
        
        toast.loading(true);
        try {
            await adminAPI.approveTeacher(teacherId, 'approve');
            toast.success('✅ Teacher approved successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to approve teacher');
        } finally {
            toast.loading(false);
        }
    }
    
    async rejectTeacher(teacherId) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;
        
        toast.loading(true);
        try {
            await adminAPI.approveTeacher(teacherId, 'reject', reason);
            toast.info('Teacher rejected');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to reject teacher');
        } finally {
            toast.loading(false);
        }
    }
    
    async suspendStudent(studentId, studentName) {
        const reason = prompt(`Enter reason for suspending ${studentName}:`);
        if (!reason) return;
        
        if (!confirm(`⚠️ Are you sure you want to suspend ${studentName}?`)) return;
        
        toast.loading(true);
        try {
            await adminAPI.suspendStudent(studentId, { reason });
            toast.success(`✅ ${studentName} suspended`);
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to suspend student');
        } finally {
            toast.loading(false);
        }
    }
    
    async reactivateStudent(studentId, studentName) {
        if (!confirm(`Reactivate ${studentName}?`)) return;
        
        toast.loading(true);
        try {
            await adminAPI.reactivateStudent(studentId);
            toast.success(`✅ ${studentName} reactivated`);
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to reactivate student');
        } finally {
            toast.loading(false);
        }
    }
    
    async deleteStudent(studentId, studentName) {
        if (!confirm(`⚠️ Are you sure you want to permanently delete ${studentName}? This action cannot be undone.`)) return;
        
        const confirmText = prompt('Type "DELETE" to confirm:');
        if (confirmText !== 'DELETE') {
            toast.info('Cancelled');
            return;
        }
        
        toast.loading(true);
        try {
            await adminAPI.deleteStudent(studentId);
            toast.success(`✅ ${studentName} deleted`);
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to delete student');
        } finally {
            toast.loading(false);
        }
    }
    
    copyElimuid(elimuid) {
        if (!elimuid) {
            toast.error('No ELIMUID to copy');
            return;
        }
        navigator.clipboard.writeText(elimuid)
            .then(() => toast.success('ELIMUID copied to clipboard'))
            .catch(() => toast.error('Failed to copy'));
    }
    
    viewStudentDetails(studentId) {
        // Find student from data
        const student = this.students.find(s => s.id == studentId);
        if (!student) {
            toast.error('Student not found');
            return;
        }
        
        this.showStudentDetailsModal(student);
    }
    
    viewTeacherDetails(teacherId) {
        const teacher = this.teachers.find(t => t.id == teacherId);
        if (!teacher) {
            toast.error('Teacher not found');
            return;
        }
        
        this.showTeacherDetailsModal(teacher);
    }
    
    showStudentDetailsModal(student) {
        const user = student.User || {};
        
        const modal = modalManager.create('student-details-modal', 'Student Details');
        modal.setContent(`
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <span class="font-medium text-green-700 text-xl">${getInitials(user.name)}</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-lg">${user.name || 'N/A'}</h4>
                        <p class="text-sm text-muted-foreground">${user.email || 'No email'}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-muted/30 rounded-lg">
                        <p class="text-xs text-muted-foreground">ELIMUID</p>
                        <p class="font-mono text-sm font-bold text-primary">${student.elimuid || 'N/A'}</p>
                    </div>
                    <div class="p-3 bg-muted/30 rounded-lg">
                        <p class="text-xs text-muted-foreground">Grade</p>
                        <p class="font-medium">${student.grade || 'N/A'}</p>
                    </div>
                </div>
                <div class="border-t pt-4">
                    <p class="text-sm"><span class="font-medium">Gender:</span> ${student.gender || 'Not specified'}</p>
                    <p class="text-sm"><span class="font-medium">DOB:</span> ${formatDate(student.dateOfBirth) || 'N/A'}</p>
                    <p class="text-sm"><span class="font-medium">Status:</span> ${student.status || 'active'}</p>
                    <p class="text-sm"><span class="font-medium">Enrolled:</span> ${formatDate(student.enrollmentDate) || 'N/A'}</p>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('student-details-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                    <button onclick="window.dashboard?.copyElimuid('${student.elimuid}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Copy ELIMUID</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    showTeacherDetailsModal(teacher) {
        const user = teacher.User || {};
        
        const modal = modalManager.create('teacher-details-modal', 'Teacher Details');
        modal.setContent(`
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="font-medium text-blue-700 text-xl">${getInitials(user.name)}</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-lg">${user.name || 'N/A'}</h4>
                        <p class="text-sm text-muted-foreground">${user.email || 'No email'}</p>
                        <p class="text-xs text-muted-foreground">Employee ID: ${teacher.employeeId || 'N/A'}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-muted/30 rounded-lg">
                        <p class="text-xs text-muted-foreground">Subjects</p>
                        <p class="font-medium">${(teacher.subjects || []).join(', ') || 'N/A'}</p>
                    </div>
                    <div class="p-3 bg-muted/30 rounded-lg">
                        <p class="text-xs text-muted-foreground">Department</p>
                        <p class="font-medium">${teacher.department || 'General'}</p>
                    </div>
                </div>
                <div class="border-t pt-4">
                    <p class="text-sm"><span class="font-medium">Class Teacher:</span> ${teacher.classTeacher || 'Not assigned'}</p>
                    <p class="text-sm"><span class="font-medium">Qualification:</span> ${teacher.qualification || 'N/A'}</p>
                    <p class="text-sm"><span class="font-medium">Status:</span> ${teacher.approvalStatus || 'pending'}</p>
                    <p class="text-sm"><span class="font-medium">Joined:</span> ${formatDate(teacher.dateJoined) || 'N/A'}</p>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('teacher-details-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                    <button onclick="window.dashboard?.editTeacher('${teacher.id}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Edit Teacher</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    showAddStudentModal() {
        const modal = modalManager.create('add-student-modal', 'Add New Student');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Full Name *</label>
                    <input type="text" id="student-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Grade/Class *</label>
                    <input type="text" id="student-grade" placeholder="e.g., 10A, Form 2" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Parent Email</label>
                    <input type="email" id="parent-email" placeholder="parent@example.com" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Date of Birth</label>
                    <input type="date" id="student-dob" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Gender</label>
                    <select id="student-gender" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p class="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                        <i data-lucide="info" class="h-4 w-4 flex-shrink-0 mt-0.5"></i>
                        <span>Default password: <strong>Student123!</strong> Student will be prompted to change on first login.</span>
                    </p>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('add-student-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.handleAddStudent()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add Student</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async handleAddStudent() {
        const name = document.getElementById('student-name')?.value;
        const grade = document.getElementById('student-grade')?.value;
        const parentEmail = document.getElementById('parent-email')?.value;
        const dob = document.getElementById('student-dob')?.value;
        const gender = document.getElementById('student-gender')?.value;
        
        if (!name || !grade) {
            toast.error('Name and grade are required');
            return;
        }
        
        toast.loading(true);
        try {
            const response = await adminAPI.addStudent({ name, grade, parentEmail, dateOfBirth: dob, gender });
            toast.success(`✅ Student added! ELIMUID: ${response.data.elimuid}`);
            modalManager.close('add-student-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to add student');
        } finally {
            toast.loading(false);
        }
    }
    
    editStudent(studentId) {
        const student = this.students.find(s => s.id == studentId);
        if (!student) {
            toast.error('Student not found');
            return;
        }
        
        const modal = modalManager.create('edit-student-modal', 'Edit Student');
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="edit-student-id" value="${student.id}">
                <div>
                    <label class="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" id="edit-student-name" value="${student.User?.name || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" id="edit-student-email" value="${student.User?.email || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Grade/Class</label>
                    <input type="text" id="edit-student-grade" value="${student.grade || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Status</label>
                    <select id="edit-student-status" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="active" ${student.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="suspended" ${student.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                        <option value="graduated" ${student.status === 'graduated' ? 'selected' : ''}>Graduated</option>
                    </select>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('edit-student-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.handleUpdateStudent()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Student</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async handleUpdateStudent() {
        const studentId = document.getElementById('edit-student-id')?.value;
        const name = document.getElementById('edit-student-name')?.value;
        const email = document.getElementById('edit-student-email')?.value;
        const grade = document.getElementById('edit-student-grade')?.value;
        const status = document.getElementById('edit-student-status')?.value;
        
        if (!studentId) {
            toast.error('Student ID not found');
            return;
        }
        
        toast.loading(true);
        try {
            await adminAPI.updateStudent(studentId, { name, email, grade, status });
            toast.success('✅ Student updated successfully');
            modalManager.close('edit-student-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to update student');
        } finally {
            toast.loading(false);
        }
    }
    
    editTeacher(teacherId) {
        const teacher = this.teachers.find(t => t.id == teacherId);
        if (!teacher) {
            toast.error('Teacher not found');
            return;
        }
        
        const modal = modalManager.create('edit-teacher-modal', 'Edit Teacher');
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="edit-teacher-id" value="${teacher.id}">
                <div>
                    <label class="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" id="edit-teacher-name" value="${teacher.User?.name || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" id="edit-teacher-email" value="${teacher.User?.email || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Subjects (comma separated)</label>
                    <input type="text" id="edit-teacher-subjects" value="${(teacher.subjects || []).join(', ')}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Department</label>
                    <select id="edit-teacher-department" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="mathematics" ${teacher.department === 'mathematics' ? 'selected' : ''}>Mathematics</option>
                        <option value="science" ${teacher.department === 'science' ? 'selected' : ''}>Science</option>
                        <option value="languages" ${teacher.department === 'languages' ? 'selected' : ''}>Languages</option>
                        <option value="humanities" ${teacher.department === 'humanities' ? 'selected' : ''}>Humanities</option>
                        <option value="technical" ${teacher.department === 'technical' ? 'selected' : ''}>Technical</option>
                        <option value="sports" ${teacher.department === 'sports' ? 'selected' : ''}>Sports</option>
                        <option value="general" ${teacher.department === 'general' ? 'selected' : ''}>General</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Class Teacher (if applicable)</label>
                    <input type="text" id="edit-teacher-class" value="${teacher.classTeacher || ''}" placeholder="e.g., Grade 10A" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Qualification</label>
                    <input type="text" id="edit-teacher-qualification" value="${teacher.qualification || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('edit-teacher-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.handleUpdateTeacher()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Teacher</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async handleUpdateTeacher() {
        const teacherId = document.getElementById('edit-teacher-id')?.value;
        const name = document.getElementById('edit-teacher-name')?.value;
        const email = document.getElementById('edit-teacher-email')?.value;
        const subjects = document.getElementById('edit-teacher-subjects')?.value;
        const department = document.getElementById('edit-teacher-department')?.value;
        const classTeacher = document.getElementById('edit-teacher-class')?.value;
        const qualification = document.getElementById('edit-teacher-qualification')?.value;
        
        if (!teacherId) {
            toast.error('Teacher ID not found');
            return;
        }
        
        toast.loading(true);
        try {
            await adminAPI.updateTeacher(teacherId, {
                name,
                email,
                subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
                department,
                classTeacher,
                qualification
            });
            toast.success('✅ Teacher updated successfully');
            modalManager.close('edit-teacher-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to update teacher');
        } finally {
            toast.loading(false);
        }
    }
    
    showNameChangeModal() {
        const modal = modalManager.create('name-change-modal', 'Change School Name');
        modal.setContent(`
            <div class="space-y-4">
                <p class="text-sm text-muted-foreground">Fee: $50 (one-time payment)</p>
                <div>
                    <label class="block text-sm font-medium mb-1">New School Name</label>
                    <input type="text" id="new-school-name" placeholder="Enter new school name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Reason for Change</label>
                    <textarea id="change-reason" rows="3" placeholder="Why do you want to change the school name?" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('name-change-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.processNameChange()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Proceed to Payment</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async processNameChange() {
        const newName = document.getElementById('new-school-name')?.value;
        const reason = document.getElementById('change-reason')?.value;
        
        if (!newName) {
            toast.error('Please enter a new school name');
            return;
        }
        
        toast.loading(true);
        try {
            const response = await adminAPI.requestNameChange({ newName, reason });
            toast.success('✅ Name change request sent to Super Admin for approval');
            modalManager.close('name-change-modal');
        } catch (error) {
            toast.error(error.message || 'Failed to submit name change request');
        } finally {
            toast.loading(false);
        }
    }
    
    showCurriculumModal() {
        const currentCurriculum = this.school?.system || 'cbc';
        
        const modal = modalManager.create('curriculum-modal', 'Change Curriculum');
        modal.setContent(`
            <div class="space-y-4">
                <p class="text-sm text-muted-foreground">Changing curriculum will affect how grades are calculated for all students.</p>
                <div>
                    <label class="block text-sm font-medium mb-1">Select Curriculum</label>
                    <select id="curriculum-select" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="cbc" ${currentCurriculum === 'cbc' ? 'selected' : ''}>CBC (Competency Based Curriculum)</option>
                        <option value="844" ${currentCurriculum === '844' ? 'selected' : ''}>8-4-4 System</option>
                        <option value="british" ${currentCurriculum === 'british' ? 'selected' : ''}>British Curriculum</option>
                        <option value="american" ${currentCurriculum === 'american' ? 'selected' : ''}>American Curriculum</option>
                    </select>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p class="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
                        <i data-lucide="alert-triangle" class="h-4 w-4 flex-shrink-0 mt-0.5"></i>
                        <span>⚠️ Changing curriculum will update grading for all students. This action cannot be undone.</span>
                    </p>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('curriculum-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.handleCurriculumChange()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Change Curriculum</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async handleCurriculumChange() {
        const newCurriculum = document.getElementById('curriculum-select')?.value;
        if (!newCurriculum) return;
        
        if (!confirm(`⚠️ Are you sure you want to change the curriculum to ${newCurriculum.toUpperCase()}? This will affect grading for all students.`)) return;
        
        toast.loading(true);
        try {
            await adminAPI.updateSchoolSettings({ curriculum: newCurriculum });
            toast.success(`✅ Curriculum changed to ${newCurriculum.toUpperCase()}`);
            modalManager.close('curriculum-modal');
            
            // Update store
            store.dispatch({
                type: 'CURRICULUM_UPDATED',
                payload: { curriculum: newCurriculum }
            });
            
            // Broadcast to all users
            if (window.realtime) {
                window.realtime.emitCurriculumUpdate(newCurriculum);
            }
            
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to change curriculum');
        } finally {
            toast.loading(false);
        }
    }
    
    refreshStudents() {
        this.refresh();
    }
    
    refreshTeachers() {
        this.refresh();
    }
    
    showSection(section) {
        if (window.router) {
            window.router.navigate(section);
        }
    }
    
    setupRealtimeSubscriptions() {
        if (!window.realtime) return;
        
        // Listen for student updates
        window.realtime.on('student-added', () => this.refresh());
        window.realtime.on('student-updated', () => this.refresh());
        window.realtime.on('student-deleted', () => this.refresh());
        
        // Listen for teacher updates
        window.realtime.on('teacher-updated', () => this.refresh());
        window.realtime.on('teacher-approved', () => this.refresh());
        
        // Listen for curriculum updates
        window.realtime.on('curriculum-updated', () => this.refresh());
        
        // Listen for class updates
        window.realtime.on('class-assigned', () => this.refresh());
    }
    
    attachEventListeners() {
        // Add any dashboard-specific event listeners
    }
}

// Make dashboard globally accessible
window.AdminDashboard = AdminDashboard;
