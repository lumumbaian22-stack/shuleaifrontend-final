

// js/features/attendance/AttendanceEntry.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate } from '../../core/utils.js';

export const attendanceEntry = {
    async markAttendance(studentId, date, status, reason = '') {
        if (!studentId || !date || !status) {
            toast.error('Student, date, and status are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/teacher/attendance', {
                studentId,
                date,
                status,
                reason
            });
            
            if (response.success) {
                toast.success('✅ Attendance recorded');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to record attendance');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async markBulkAttendance(attendanceRecords) {
        if (!attendanceRecords || attendanceRecords.length === 0) {
            toast.error('No attendance records to save');
            return false;
        }
        
        toast.loading(true);
        
        let success = 0;
        let failed = 0;
        
        for (const record of attendanceRecords) {
            try {
                await this.markAttendance(record.studentId, record.date, record.status, record.reason);
                success++;
            } catch (error) {
                failed++;
            }
        }
        
        toast.success(`✅ Saved ${success} attendance records, ${failed} failed`);
        
        toast.loading(false);
        return { success, failed };
    },
    
    showAttendanceModal(students, date = null) {
        const modal = modalManager.create('attendance-modal', `Take Attendance - ${formatDate(date || new Date())}`);
        
        if (!students || students.length === 0) {
            modal.setContent(`
                <div class="p-8 text-center">
                    <i data-lucide="users" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground">No students found</p>
                </div>
            `);
            modal.open();
            return;
        }
        
        modal.setContent(`
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <span class="flex items-center gap-2"><span class="h-3 w-3 bg-green-500 rounded-full"></span> Present</span>
                        <span class="flex items-center gap-2"><span class="h-3 w-3 bg-red-500 rounded-full"></span> Absent</span>
                        <span class="flex items-center gap-2"><span class="h-3 w-3 bg-yellow-500 rounded-full"></span> Late</span>
                        <span class="flex items-center gap-2"><span class="h-3 w-3 bg-blue-500 rounded-full"></span> Sick</span>
                        <span class="flex items-center gap-2"><span class="h-3 w-3 bg-gray-500 rounded-full"></span> Holiday</span>
                    </div>
                    <button onclick="window.attendanceEntry.saveBulk()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Save All</button>
                </div>
                <div class="overflow-x-auto max-h-96 overflow-y-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-muted/50 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-left">Student</th>
                                <th class="px-4 py-2 text-left">ELIMUID</th>
                                <th class="px-4 py-2 text-center">Status</th>
                                <th class="px-4 py-2 text-left">Notes</th>
                            </thead>
                            <tbody class="divide-y">
                                ${students.map(student => `
                                    <tr data-student-id="${student.id}" data-student-name="${student.User?.name || 'Unknown'}">
                                        <td class="px-4 py-2">
                                            <div class="flex items-center gap-2">
                                                <div class="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span class="text-xs font-medium text-blue-700">${getInitials(student.User?.name)}</span>
                                                </div>
                                                <span>${student.User?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-2 font-mono text-xs">${student.elimuid || 'N/A'}</td>
                                        <td class="px-4 py-2 text-center">
                                            <select class="attendance-status rounded border border-input bg-background px-2 py-1 text-sm">
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="late">Late</option>
                                                <option value="sick">Sick</option>
                                                <option value="holiday">Holiday</option>
                                            </select>
                                        </td>
                                        <td class="px-4 py-2">
                                            <input type="text" class="attendance-note w-full rounded border-0 bg-transparent text-sm" placeholder="Add note...">
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `);
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    async saveBulk() {
        const rows = document.querySelectorAll('#attendance-modal tr[data-student-id]');
        const date = new Date().toISOString().split('T')[0];
        const records = [];
        
        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const status = row.querySelector('.attendance-status')?.value;
            const note = row.querySelector('.attendance-note')?.value;
            
            if (status) {
                records.push({
                    studentId: parseInt(studentId),
                    date,
                    status,
                    reason: note
                });
            }
        });
        
        if (records.length === 0) {
            toast.error('No attendance data to save');
            return;
        }
        
        const result = await this.markBulkAttendance(records);
        
        if (result && result.success > 0) {
            modalManager.close('attendance-modal');
            if (window.dashboard && window.dashboard.refreshAttendance) {
                window.dashboard.refreshAttendance();
            }
        }
    }
};

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

window.attendanceEntry = attendanceEntry;
