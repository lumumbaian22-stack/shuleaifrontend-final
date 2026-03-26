// js/dashboard/roles/TeacherDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, getInitials, timeAgo } from '../../core/utils.js';

export class TeacherDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.students = [];
        this.todayDuty = null;
        this.teacherId = null;
    }

    async loadData() {
        console.log('📊 Loading teacher dashboard data...');
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            // Get teacher's students
            const studentsRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/teacher/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (studentsRes.ok) {
                const data = await studentsRes.json();
                this.students = data.data || [];
            }

            // Get today's duty
            const dutyRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/today', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (dutyRes.ok) {
                const data = await dutyRes.json();
                this.todayDuty = data.data;
            }

            // Get teacher ID from user object
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            this.teacherId = user.id;
        } catch (error) {
            console.error('Error loading teacher data:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in" id="teacher-dashboard-content">
                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">My Students</p>
                                <h3 class="text-2xl font-bold mt-1" id="my-students-count">0</h3>
                                <p class="text-xs text-muted-foreground mt-1">Across <span id="my-classes-count">0</span> classes</p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i data-lucide="users" class="h-6 w-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Class Average</p>
                                <h3 class="text-2xl font-bold mt-1" id="class-average">0%</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <i data-lucide="trending-up" class="h-6 w-6 text-violet-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Attendance Today</p>
                                <h3 class="text-2xl font-bold mt-1" id="attendance-today">0/0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                                <h3 class="text-2xl font-bold mt-1" id="pending-tasks">0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <i data-lucide="check-square" class="h-6 w-6 text-red-600"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="grid gap-4 md:grid-cols-4">
                    <button onclick="window.showDashboardSection('students')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="users" class="h-6 w-6 text-blue-600 mb-2"></i>
                        <p class="font-medium">My Students</p>
                    </button>
                    <button onclick="window.showDashboardSection('attendance')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="calendar-check" class="h-6 w-6 text-green-600 mb-2"></i>
                        <p class="font-medium">Attendance</p>
                    </button>
                    <button onclick="window.showDashboardSection('grades')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="trending-up" class="h-6 w-6 text-purple-600 mb-2"></i>
                        <p class="font-medium">Grades</p>
                    </button>
                    <button onclick="window.showDashboardSection('tasks')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                        <i data-lucide="check-square" class="h-6 w-6 text-amber-600 mb-2"></i>
                        <p class="font-medium">Tasks</p>
                    </button>
                </div>

                <!-- Students Table -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="font-semibold">My Students</h3>
                        <button onclick="window.showAddStudentModal()" class="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg">+ Add Student</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-3 text-left">Student</th>
                                    <th class="px-4 py-3 text-left">Class</th>
                                    <th class="px-4 py-3 text-left">ELIMUID</th>
                                    <th class="px-4 py-3 text-left">Attendance</th>
                                    <th class="px-4 py-3 text-left">Average</th>
                                    <th class="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y" id="teacher-students-table-body">
                                <tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">Loading students...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- CSV Bulk Upload Section -->
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4">CSV Bulk Upload</h3>
                    <div id="csv-drop-zone" class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <i data-lucide="upload" class="h-10 w-10 mx-auto text-muted-foreground"></i>
                        <p class="text-sm mt-2">Drag & drop CSV file or click to browse</p>
                        <p class="text-xs text-muted-foreground mt-1">Analytics engine will process automatically</p>
                        <input type="file" id="csv-file-input" accept=".csv" class="hidden">
                    </div>
                    <div id="upload-progress-container" class="mt-3 hidden">
                        <div class="w-full bg-muted rounded-full h-2">
                            <div id="upload-progress" class="bg-primary h-2 rounded-full" style="width: 0%"></div>
                        </div>
                        <p id="upload-progress-text" class="text-xs text-center mt-1">0%</p>
                    </div>
                    <button onclick="window.downloadTemplate('students')" class="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
                        <i data-lucide="download" class="h-4 w-4"></i>
                        Download CSV Template
                    </button>
                </div>

                <!-- Duty Card -->
                <div class="rounded-xl border bg-card p-6" id="duty-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold">Today's Duty</h3>
                            <p class="text-sm text-muted-foreground" id="duty-location">Loading...</p>
                        </div>
                        <span class="duty-status px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full" id="duty-status">Not Checked In</span>
                    </div>
                    <div class="mt-4 flex gap-3">
                        <button onclick="window.handleCheckIn()" class="flex-1 bg-primary text-primary-foreground py-2 rounded-lg" id="check-in-btn">Check In</button>
                        <button onclick="window.handleCheckOut()" class="flex-1 border border-input bg-background py-2 rounded-lg" id="check-out-btn" disabled>Check Out</button>
                    </div>
                    <div class="mt-3 flex justify-between">
                        <span class="text-xs text-muted-foreground" id="duty-rating">Last rating: <span id="last-rating">4.5</span>/5</span>
                        <button onclick="window.showDutySwapModal()" class="text-xs text-primary hover:underline">Request Swap</button>
                    </div>
                </div>
            </div>

            <!-- Add Student Modal -->
            <div id="add-student-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeAddStudentModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Add New Student</h3>
                            <button onclick="window.closeAddStudentModal()" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="x" class="h-5 w-5"></i></button>
                        </div>
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Full Name *</label><input type="text" id="modal-student-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required></div>
                            <div><label class="block text-sm font-medium mb-1">Grade/Class *</label><input type="text" id="modal-student-grade" placeholder="e.g., 10A, Form 2" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required></div>
                            <div><label class="block text-sm font-medium mb-1">Parent Email</label><input type="email" id="modal-parent-email" placeholder="parent@example.com" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Date of Birth</label><input type="date" id="modal-student-dob" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Gender</label><select id="modal-student-gender" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button onclick="window.closeAddStudentModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                            <button onclick="window.handleAddStudentModal()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add Student</button>
                        </div>
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
                            <button onclick="window.closeStudentDetailsModal()" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="x" class="h-5 w-5"></i></button>
                        </div>
                        <div class="modal-content space-y-4"></div>
                        <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <button onclick="window.closeStudentDetailsModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Task Modal -->
            <div id="add-task-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeAddTaskModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <h3 class="text-lg font-semibold mb-4">Add New Task</h3>
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Task Title</label><input type="text" id="task-title" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Due Date</label><input type="date" id="task-due" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Priority</label><select id="task-priority" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button onclick="window.closeAddTaskModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                            <button onclick="window.saveTask()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Task</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Duty Swap Modal -->
            <div id="duty-swap-modal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50" onclick="window.closeDutySwapModal()"></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card p-6 shadow-xl animate-fade-in">
                        <h3 class="text-lg font-semibold mb-4">Request Duty Swap</h3>
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Date</label><input type="date" id="swap-date" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Reason</label><textarea id="swap-reason" rows="3" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea></div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button onclick="window.closeDutySwapModal()" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                            <button onclick="window.submitSwapRequest()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Submit Request</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // After inserting HTML, populate data
        this.updateStats();
        this.renderStudentsTable();
        this.updateDutyCard();
    }

    updateStats() {
        const studentCount = this.students.length;
        const uniqueClasses = new Set(this.students.map(s => s.grade).filter(Boolean));
        const classCount = uniqueClasses.size;
        const totalScores = this.students.reduce((sum, s) => sum + (s.average || 0), 0);
        const classAverage = studentCount ? Math.round(totalScores / studentCount) : 0;

        document.getElementById('my-students-count').textContent = studentCount;
        document.getElementById('my-classes-count').textContent = classCount;
        document.getElementById('class-average').textContent = classAverage + '%';
    }

    renderStudentsTable() {
        const container = document.getElementById('teacher-students-table-body');
        if (!container) return;

        if (this.students.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">No students in your class</td></tr>';
            return;
        }

        let html = '';
        this.students.forEach(student => {
            const user = student.User || {};
            const name = user.name || 'Unknown';
            const grade = student.grade || 'N/A';
            const elimuid = student.elimuid || 'N/A';
            const attendance = student.attendance || 95;
            const average = student.average || 0;
            const avgClass = average > 80 ? 'text-green-600' : average > 60 ? 'text-yellow-600' : 'text-red-600';
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
                    <td class="px-4 py-3">${grade}</td>
                    <td class="px-4 py-3"><span class="font-mono text-xs bg-muted px-2 py-1 rounded">${elimuid}</span></td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                            <div class="h-2 w-16 rounded-full bg-muted overflow-hidden">
                                <div class="h-full w-[${attendance}%] bg-green-500 rounded-full"></div>
                            </div>
                            <span class="text-xs">${attendance}%</span>
                        </div>
                    </td>
                    <td class="px-4 py-3"><span class="font-semibold ${avgClass}">${average}%</span></td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.viewStudentDetails('${student.id}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="eye" class="h-4 w-4"></i></button>
                        <button onclick="window.copyElimuid('${elimuid}')" class="p-2 hover:bg-accent rounded-lg"><i data-lucide="copy" class="h-4 w-4"></i></button>
                    </td>
                </tr>
            `;
        });
        container.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    updateDutyCard() {
        const duty = this.todayDuty?.duties?.find(d => d.teacherId === this.teacherId);
        const hasDuty = !!duty;
        const dutyLocation = duty?.area || 'No duty today';
        const dutyStatus = duty?.checkedIn ? 'Checked In' : (duty?.checkedOut ? 'Checked Out' : 'Not Checked In');
        const statusClass = duty?.checkedIn ? 'bg-green-100 text-green-700' : (duty?.checkedOut ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700');

        const dutyLocationEl = document.getElementById('duty-location');
        const dutyStatusEl = document.getElementById('duty-status');
        const checkInBtn = document.getElementById('check-in-btn');
        const checkOutBtn = document.getElementById('check-out-btn');

        if (dutyLocationEl) dutyLocationEl.textContent = dutyLocation;
        if (dutyStatusEl) {
            dutyStatusEl.textContent = dutyStatus;
            dutyStatusEl.className = `duty-status px-2 py-1 ${statusClass} text-xs rounded-full`;
        }
        if (checkInBtn) checkInBtn.disabled = !hasDuty || duty?.checkedIn || duty?.checkedOut;
        if (checkOutBtn) checkOutBtn.disabled = !hasDuty || !duty?.checkedIn || duty?.checkedOut;
    }

    refreshStudents() {
        this.loadData().then(() => {
            this.updateStats();
            this.renderStudentsTable();
        });
    }

    showSection(section) {
        if (section === 'students') this.refreshStudents();
        else if (section === 'attendance') alert('Attendance section coming soon');
        else if (section === 'grades') alert('Grades section coming soon');
        else if (section === 'tasks') alert('Tasks section coming soon');
        else if (section === 'dashboard') this.refresh();
    }

    async refresh() {
        await this.loadData();
        this.updateStats();
        this.renderStudentsTable();
        this.updateDutyCard();
    }
}

// Global functions for teacher dashboard
window.refreshTeacherStudentList = () => {
    if (window.dashboard) window.dashboard.refreshStudents();
};
window.showAddStudentModal = () => {
    document.getElementById('add-student-modal')?.classList.remove('hidden');
};
window.closeAddStudentModal = () => {
    document.getElementById('add-student-modal')?.classList.add('hidden');
};
window.handleAddStudentModal = async () => {
    const name = document.getElementById('modal-student-name')?.value;
    const grade = document.getElementById('modal-student-grade')?.value;
    const parentEmail = document.getElementById('modal-parent-email')?.value;
    const dob = document.getElementById('modal-student-dob')?.value;
    const gender = document.getElementById('modal-student-gender')?.value;
    if (!name || !grade) {
        alert('Name and grade are required');
        return;
    }
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/teacher/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, grade, parentEmail, dateOfBirth: dob, gender })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Student added! ELIMUID: ${data.data.elimuid}`);
            window.closeAddStudentModal();
            if (window.dashboard) window.dashboard.refreshStudents();
        } else {
            alert(data.message || 'Failed to add student');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
window.handleCheckIn = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ location: 'School Gate' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Checked in successfully');
            if (window.dashboard) window.dashboard.refresh();
        } else {
            alert(data.message || 'Check-in failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
window.handleCheckOut = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/check-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ location: 'School Gate' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Checked out successfully');
            if (window.dashboard) window.dashboard.refresh();
        } else {
            alert(data.message || 'Check-out failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
window.showDutySwapModal = () => {
    document.getElementById('duty-swap-modal')?.classList.remove('hidden');
};
window.closeDutySwapModal = () => {
    document.getElementById('duty-swap-modal')?.classList.add('hidden');
};
window.submitSwapRequest = async () => {
    const date = document.getElementById('swap-date')?.value;
    const reason = document.getElementById('swap-reason')?.value;
    if (!date || !reason) {
        alert('Please fill in all fields');
        return;
    }
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/duty/request-swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ dutyDate: date, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Swap request sent to admin');
            window.closeDutySwapModal();
        } else {
            alert(data.message || 'Failed to request swap');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
window.closeAddTaskModal = () => document.getElementById('add-task-modal')?.classList.add('hidden');
window.saveTask = () => {
    const title = document.getElementById('task-title')?.value;
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    alert('Task added successfully');
    window.closeAddTaskModal();
};
window.closeStudentDetailsModal = () => document.getElementById('student-details-modal')?.classList.add('hidden');
window.viewStudentDetails = (id) => alert('View student details: ' + id);
window.copyElimuid = (elimuid) => { navigator.clipboard.writeText(elimuid); alert('Copied: ' + elimuid); };
window.downloadTemplate = (type) => alert('Download template: ' + type);
window.setupFileUpload = () => {}; // Placeholder
