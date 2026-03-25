// js/dashboard/roles/TeacherDashboard.js

import BaseDashboard from '../base/BaseDashboard.js'; 

import { teacherAPI } from '../../api/teacher.js';
import { dutyAPI } from '../../api/duty.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { ChartRenderer } from '../base/ChartRenderer.js';import { StatsRenderer } from '../base/StatsRenderer.js';
import { TableRenderer } from '../base/TableRenderer.js';
import { formatDate, timeAgo, getInitials } from '../../core/utils.js';
import { getGradeFromScore, CURRICULUM_CONFIG } from '../../constants/curriculum.js';

export class TeacherDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.students = [];
        this.todayDuty = null;
        this.weeklyDuty = [];
        this.messages = [];
        this.unreadCount = 0;
        this.teacher = null;
    }

    async loadData() {
        console.log('📊 Loading teacher dashboard data...');
        
        try {
            const [studentsRes, dutyRes, messagesRes, dashboardRes] = await Promise.all([
                teacherAPI.getMyStudents().catch(() => ({ data: [] })),
                dutyAPI.getTodayDuty().catch(() => ({ data: null })),
                teacherAPI.getConversations().catch(() => ({ data: [] })),
                teacherAPI.getDashboard().catch(() => ({ data: {} }))
            ]);
            
            this.students = studentsRes.data || [];
            this.todayDuty = dutyRes.data;
            this.messages = messagesRes.data || [];
            this.teacher = dashboardRes.data?.teacher || {};
            
            // Calculate unread count
            this.unreadCount = this.messages.reduce((sum, msg) => sum + (msg.unreadCount || 0), 0);
            
            // Calculate stats
            const totalScores = this.students.reduce((sum, s) => sum + (s.average || 0), 0);
            const classAverage = this.students.length > 0 ? Math.round(totalScores / this.students.length) : 0;
            
            this.stats = {
                myStudents: this.students.length,
                classAverage: classAverage,
                attendanceToday: `${this.students.filter(s => s.attendanceToday === 'present').length}/${this.students.length}`,
                pendingTasks: 0 // Would come from API
            };
            
            this.data = {
                students: this.students,
                todayDuty: this.todayDuty,
                messages: this.messages,
                teacher: this.teacher
            };
            
        } catch (error) {
            console.error('Failed to load teacher data:', error);
            this.showError('Failed to load dashboard data');
            throw error;
        }
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div id="stats-container" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
                
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold">Today's Schedule</h3>
                            <button onclick="window.dashboard?.viewFullSchedule()" class="text-xs text-primary hover:underline">View Full Schedule</button>
                        </div>
                        <div id="today-schedule-container"></div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold">Performance Trends</h3>
                            <select id="performance-period" class="text-xs border rounded px-2 py-1 bg-background">
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="term">This Term</option>
                            </select>
                        </div>
                        <div class="chart-container h-64" id="performance-chart-container"></div>
                    </div>
                </div>
                
                ${this.renderStudentsTable()}
                ${this.renderMessagesSection()}
                ${this.renderDutyCard()}
                ${this.renderQuickActions()}
            </div>
        `;
        
        // Render stats
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            StatsRenderer.render(statsContainer, this.stats, 'teacher');
        }
        
        // Render schedule
        this.renderSchedule();
        
        // Render performance chart
        this.renderPerformanceChart();
        
        // Set up period filter
        const periodFilter = document.getElementById('performance-period');
        if (periodFilter) {
            periodFilter.addEventListener('change', () => this.renderPerformanceChart());
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    renderStudentsTable() {
        if (!this.students || this.students.length === 0) {
            return `
                <div class="rounded-xl border bg-card p-8 text-center">
                    <i data-lucide="users" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground">No students in your class yet</p>
                    <button onclick="window.dashboard?.showAddStudentModal()" class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Add Student</button>
                </div>
            `;
        }
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold">My Students</h3>
                    <div class="flex gap-2">
                        <button onclick="window.dashboard?.showAddStudentModal()" class="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg">+ Add Student</button>
                        <button onclick="window.dashboard?.refreshStudents()" class="px-3 py-1 border rounded-lg text-sm hover:bg-accent">Refresh</button>
                    </div>
                </div>
                <div id="students-table-container"></div>
            </div>
        `;
    }
    
    renderMessagesSection() {
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold flex items-center gap-2">
                        <i data-lucide="message-circle" class="h-5 w-5 text-primary"></i>
                        Parent Messages
                    </h3>
                    <span class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium" id="message-count-badge">${this.unreadCount}</span>
                </div>
                <div id="messages-container"></div>
                <div class="p-4 border-t">
                    <button onclick="window.dashboard?.loadMessages()" class="w-full py-2 text-sm border rounded-lg hover:bg-accent flex items-center justify-center gap-2">
                        <i data-lucide="refresh-cw" class="h-4 w-4"></i>
                        Refresh Messages
                    </button>
                </div>
            </div>
        `;
    }
    
    renderDutyCard() {
        const duty = this.todayDuty?.duties?.find(d => d.teacherId === this.teacher?.id);
        const hasDuty = duty !== undefined;
        const dutyArea = duty?.area || 'No duty today';
        const dutyStatus = duty?.checkedIn ? 'Checked In' : duty?.checkedOut ? 'Checked Out' : 'Not Checked In';
        const statusClass = duty?.checkedIn ? 'bg-green-100 text-green-700' : 
                           duty?.checkedOut ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700';
        
        return `
            <div class="rounded-xl border bg-card p-6" id="duty-card">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold">Today's Duty</h3>
                        <p class="text-sm text-muted-foreground" id="duty-location">${dutyArea}</p>
                        ${duty?.timeSlot ? `<p class="text-xs text-muted-foreground mt-1">${duty.timeSlot.start} - ${duty.timeSlot.end}</p>` : ''}
                    </div>
                    <span class="duty-status px-2 py-1 ${statusClass} text-xs rounded-full" id="duty-status">${dutyStatus}</span>
                </div>
                <div class="mt-4 flex gap-3">
                    <button onclick="window.dashboard?.checkIn()" class="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors ${hasDuty && !duty?.checkedIn && !duty?.checkedOut ? '' : 'opacity-50 cursor-not-allowed'}" 
                            id="check-in-btn" ${hasDuty && !duty?.checkedIn && !duty?.checkedOut ? '' : 'disabled'}>
                        <i data-lucide="log-in" class="inline h-4 w-4 mr-2"></i>
                        Check In
                    </button>
                    <button onclick="window.dashboard?.checkOut()" class="flex-1 border border-input bg-background py-2 rounded-lg hover:bg-accent transition-colors ${hasDuty && duty?.checkedIn && !duty?.checkedOut ? '' : 'opacity-50 cursor-not-allowed'}" 
                            id="check-out-btn" ${hasDuty && duty?.checkedIn && !duty?.checkedOut ? '' : 'disabled'}>
                        <i data-lucide="log-out" class="inline h-4 w-4 mr-2"></i>
                        Check Out
                    </button>
                </div>
                ${hasDuty ? `
                    <div class="mt-3 flex justify-between">
                        <span class="text-xs text-muted-foreground" id="duty-rating">Last rating: <span id="last-rating">4.5</span>/5</span>
                        <button onclick="window.dashboard?.showDutySwapModal()" class="text-xs text-primary hover:underline">Request Swap</button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderQuickActions() {
        return `
            <div class="grid gap-4 md:grid-cols-4">
                <button onclick="window.dashboard?.showAddStudentModal()" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="user-plus" class="h-6 w-6 text-blue-600 mb-2"></i>
                    <p class="font-medium">Add Student</p>
                    <p class="text-xs text-muted-foreground">Enroll new student</p>
                </button>
                
                <button onclick="window.dashboard?.showSection('attendance')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="calendar-check" class="h-6 w-6 text-green-600 mb-2"></i>
                    <p class="font-medium">Take Attendance</p>
                    <p class="text-xs text-muted-foreground">Mark today's attendance</p>
                </button>
                
                <button onclick="window.dashboard?.showSection('grades')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="trending-up" class="h-6 w-6 text-purple-600 mb-2"></i>
                    <p class="font-medium">Enter Marks</p>
                    <p class="text-xs text-muted-foreground">Record exam results</p>
                </button>
                
                <button onclick="window.dashboard?.showBulkUpload()" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="upload" class="h-6 w-6 text-amber-600 mb-2"></i>
                    <p class="font-medium">Bulk Upload</p>
                    <p class="text-xs text-muted-foreground">Upload CSV file</p>
                </button>
            </div>
        `;
    }
    
    renderSchedule() {
        const container = document.getElementById('today-schedule-container');
        if (!container) return;
        
        // Sample schedule - would come from API
        const schedule = [
            { time: '8:00 - 9:30', subject: 'Mathematics', room: 'Room 101' },
            { time: '10:00 - 11:30', subject: 'English', room: 'Room 203' },
            { time: '12:00 - 1:30', subject: 'Science', room: 'Lab 1' }
        ];
        
        container.innerHTML = `
            <div class="space-y-3">
                ${schedule.map(item => `
                    <div class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                            <p class="font-medium">${item.subject}</p>
                            <p class="text-xs text-muted-foreground">${item.room}</p>
                        </div>
                        <span class="text-sm">${item.time}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderPerformanceChart() {
        const container = document.getElementById('performance-chart-container');
        if (!container) return;
        
        const period = document.getElementById('performance-period')?.value || 'week';
        
        // Sample data - would come from API
        const data = {
            week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], values: [74, 78, 76, 82, 85] },
            month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [72, 75, 78, 82] },
            term: { labels: ['Test 1', 'Test 2', 'Test 3', 'Exam'], values: [70, 75, 80, 85] }
        };
        
        const chartData = data[period] || data.week;
        
        if (this.charts.performance) {
            ChartRenderer.destroy(this.charts.performance);
        }
        
        this.charts.performance = ChartRenderer.render(container, {
            labels: chartData.labels,
            values: chartData.values,
            label: 'Class Average'
        }, 'line');
    }
    
    renderStudentsTable() {
        const container = document.getElementById('students-table-container');
        if (!container) return;
        
        const schoolSettings = store.getState('schoolSettings') || {};
        const curriculum = schoolSettings.curriculum || 'cbc';
        const level = schoolSettings.schoolLevel || 'secondary';
        
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
                { key: 'grade', label: 'Class', align: 'left', dataLabel: 'Class', render: (val) => val || 'N/A' },
                { key: 'elimuid', label: 'ELIMUID', align: 'left', dataLabel: 'ELIMUID', render: (val) => `<span class="font-mono text-xs bg-muted px-2 py-1 rounded">${val || 'N/A'}</span>` },
                { key: 'attendance', label: 'Attendance', align: 'left', dataLabel: 'Attendance', render: (val) => `
                    <div class="flex items-center gap-2">
                        <div class="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div class="h-full w-[${val || 95}%] bg-green-500 rounded-full"></div>
                        </div>
                        <span class="text-xs">${val || 95}%</span>
                    </div>
                ` },
                { key: 'average', label: 'Average', align: 'left', dataLabel: 'Average', render: (val) => {
                    const gradeInfo = getGradeFromScore(val || 0, curriculum, level);
                    const colorClass = (val || 0) >= 80 ? 'text-green-600' : (val || 0) >= 60 ? 'text-yellow-600' : 'text-red-600';
                    return `<span class="font-semibold ${colorClass}">${val || 0}% (${gradeInfo.grade})</span>`;
                } },
                { key: 'id', label: 'Actions', align: 'right', dataLabel: 'Actions', render: (val, row) => `
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="window.dashboard?.viewStudentDetails('${val}')" class="p-2 hover:bg-accent rounded-lg" title="View Details">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.enterGrades('${val}')" class="p-2 hover:bg-accent rounded-lg" title="Enter Grades">
                            <i data-lucide="trending-up" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.markAttendance('${val}')" class="p-2 hover:bg-accent rounded-lg" title="Mark Attendance">
                            <i data-lucide="calendar-check" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.copyElimuid('${row.elimuid}')" class="p-2 hover:bg-purple-100 rounded-lg text-purple-600" title="Copy ELIMUID">
                            <i data-lucide="copy" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.deleteStudent('${val}', '${row.User?.name || 'Student'}')" class="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </div>
                ` }
            ],
            data: this.students,
            emptyMessage: 'No students in your class'
        };
        
        TableRenderer.render(container, config);
    }
    
    renderMessagesContainer() {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        if (!this.messages || this.messages.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center">
                    <i data-lucide="message-circle" class="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50"></i>
                    <p class="text-muted-foreground">No messages from parents yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="divide-y">
                ${this.messages.map(msg => `
                    <div class="p-4 hover:bg-accent/50 transition-colors cursor-pointer ${msg.unreadCount > 0 ? 'bg-primary/5' : ''}" 
                         onclick="window.dashboard?.openConversation('${msg.userId}')">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <p class="font-medium">${msg.userName || 'Parent'}</p>
                                    ${msg.studentName ? `<p class="text-xs text-muted-foreground">about ${msg.studentName}</p>` : ''}
                                </div>
                                <p class="text-sm text-muted-foreground mt-1 truncate">${msg.lastMessage || ''}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-muted-foreground">${timeAgo(msg.lastMessageTime)}</p>
                                ${msg.unreadCount > 0 ? 
                                    `<span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">${msg.unreadCount}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // ============ Action Methods ============
    
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
            const response = await teacherAPI.addStudent({ name, grade, parentEmail, dateOfBirth: dob, gender });
            toast.success(`✅ Student added! ELIMUID: ${response.data.elimuid}`);
            modalManager.close('add-student-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to add student');
        } finally {
            toast.loading(false);
        }
    }
    
    async deleteStudent(studentId, studentName) {
        if (!confirm(`⚠️ Are you sure you want to remove ${studentName} from your class? This action cannot be undone.`)) return;
        
        toast.loading(true);
        try {
            await teacherAPI.deleteStudent(studentId);
            toast.success(`✅ ${studentName} removed from class`);
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to delete student');
        } finally {
            toast.loading(false);
        }
    }
    
    viewStudentDetails(studentId) {
        const student = this.students.find(s => s.id == studentId);
        if (!student) {
            toast.error('Student not found');
            return;
        }
        
        this.showStudentDetailsModal(student);
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
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('student-details-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                    <button onclick="window.dashboard?.copyElimuid('${student.elimuid}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Copy ELIMUID</button>
                </div>
            </div>
        `);
        modal.open();
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
    
    async checkIn() {
        toast.loading(true);
        try {
            await dutyAPI.checkIn({ location: 'School Gate' });
            toast.success('✅ Checked in successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to check in');
        } finally {
            toast.loading(false);
        }
    }
    
    async checkOut() {
        toast.loading(true);
        try {
            await dutyAPI.checkOut({ location: 'School Gate' });
            toast.success('✅ Checked out successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to check out');
        } finally {
            toast.loading(false);
        }
    }
    
    showDutySwapModal() {
        const modal = modalManager.create('duty-swap-modal', 'Request Duty Swap');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Date</label>
                    <input type="date" id="swap-date" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Reason</label>
                    <textarea id="swap-reason" rows="3" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('duty-swap-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.submitSwapRequest()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Submit Request</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async submitSwapRequest() {
        const date = document.getElementById('swap-date')?.value;
        const reason = document.getElementById('swap-reason')?.value;
        
        if (!date || !reason) {
            toast.error('Please fill in all fields');
            return;
        }
        
        toast.loading(true);
        try {
            await dutyAPI.requestSwap({ dutyDate: date, reason });
            toast.success('✅ Swap request sent to admin');
            modalManager.close('duty-swap-modal');
        } catch (error) {
            toast.error(error.message || 'Failed to request swap');
        } finally {
            toast.loading(false);
        }
    }
    
    async loadMessages() {
        toast.loading(true);
        try {
            const response = await teacherAPI.getConversations();
            this.messages = response.data || [];
            this.unreadCount = this.messages.reduce((sum, msg) => sum + (msg.unreadCount || 0), 0);
            
            const badge = document.getElementById('message-count-badge');
            if (badge) badge.textContent = this.unreadCount;
            
            this.renderMessagesContainer();
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            toast.loading(false);
        }
    }
    
    openConversation(userId) {
        // Implementation for opening conversation
        toast.info('Opening conversation...');
    }
    
    enterGrades(studentId) {
        // Implementation for grade entry
        toast.info('Grade entry feature coming soon');
    }
    
    markAttendance(studentId) {
        // Implementation for attendance marking
        toast.info('Attendance marking feature coming soon');
    }
    
    showBulkUpload() {
        const modal = modalManager.create('bulk-upload-modal', 'Bulk Upload Students');
        modal.setContent(`
            <div class="space-y-4">
                <div id="csv-drop-zone" class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <i data-lucide="upload" class="h-10 w-10 mx-auto text-muted-foreground"></i>
                    <p class="text-sm mt-2">Drag & drop CSV file or click to browse</p>
                    <p class="text-xs text-muted-foreground mt-1">Format: name, grade, parentEmail, dateOfBirth, gender</p>
                    <input type="file" id="csv-file-input" accept=".csv" class="hidden">
                </div>
                <div id="upload-progress-container" class="mt-3 hidden">
                    <div class="w-full bg-muted rounded-full h-2">
                        <div id="upload-progress" class="bg-primary h-2 rounded-full" style="width: 0%"></div>
                    </div>
                    <p id="upload-progress-text" class="text-xs text-center mt-1">0%</p>
                </div>
                <button onclick="window.dashboard?.downloadTemplate()" class="text-sm text-primary hover:underline flex items-center gap-1">
                    <i data-lucide="download" class="h-4 w-4"></i>
                    Download CSV Template
                </button>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('bulk-upload-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.uploadCSV()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Upload</button>
                </div>
            </div>
        `);
        modal.open();
        
        // Setup file upload
        const dropZone = document.getElementById('csv-drop-zone');
        const fileInput = document.getElementById('csv-file-input');
        
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) window.dashboard?.handleFileSelect(file);
            });
        }
    }
    
    handleFileSelect(file) {
        // Implementation for file upload
        toast.info(`Selected file: ${file.name}`);
    }
    
    downloadTemplate() {
        // Implementation for downloading template
        toast.info('Downloading template...');
    }
    
    uploadCSV() {
        // Implementation for CSV upload
        toast.info('Uploading CSV...');
    }
    
    viewFullSchedule() {
        toast.info('Full schedule feature coming soon');
    }
    
    showSection(section) {
        if (window.router) {
            window.router.navigate(section);
        }
    }
    
    refreshStudents() {
        this.refresh();
    }
    
    setupRealtimeSubscriptions() {
        if (!window.realtime) return;
        
        window.realtime.on('student-added', () => this.refresh());
        window.realtime.on('student-updated', () => this.refresh());
        window.realtime.on('student-deleted', () => this.refresh());
        window.realtime.on('new-message', () => this.loadMessages());
        window.realtime.on('attendance-updated', () => this.refresh());
        window.realtime.on('curriculum-updated', () => this.refresh());
    }
    
    attachEventListeners() {
        // Load messages after render
        setTimeout(() => this.loadMessages(), 500);
    }
}

// Make dashboard globally accessible
window.TeacherDashboard = TeacherDashboard;
