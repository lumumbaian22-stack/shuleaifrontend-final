// js/features/students/StudentManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, getInitials } from '../../core/utils.js';
import { gradeCalculator } from '../curriculum/gradeCalculator.js';

export const studentManager = {
    students: [],
    
    async loadStudents() {
        try {
            const response = await apiClient.get('/api/admin/students');
            this.students = response.data || [];
            return this.students;
        } catch (error) {
            console.error('Failed to load students:', error);
            return [];
        }
    },
    
    async addStudent(studentData) {
        if (!studentData.name || !studentData.grade) {
            toast.error('Name and grade are required');
            return null;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/teacher/students', studentData);
            
            if (response.success) {
                toast.success(`✅ Student added! ELIMUID: ${response.data.elimuid}`);
                await this.loadStudents();
                return response.data;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add student');
            return null;
        } finally {
            toast.loading(false);
        }
    },
    
    async updateStudent(studentId, data) {
        if (!studentId) {
            toast.error('Student ID required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.put(`/api/admin/students/${studentId}`, data);
            
            if (response.success) {
                toast.success('✅ Student updated successfully');
                await this.loadStudents();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update student');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async deleteStudent(studentId, studentName) {
        if (!confirm(`⚠️ Are you sure you want to permanently delete ${studentName}? This action cannot be undone.`)) return false;
        
        const confirmText = prompt('Type "DELETE" to confirm:');
        if (confirmText !== 'DELETE') {
            toast.info('Cancelled');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.delete(`/api/admin/students/${studentId}`);
            
            if (response.success) {
                toast.success(`✅ ${studentName} deleted`);
                await this.loadStudents();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete student');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async suspendStudent(studentId, studentName, reason) {
        if (!reason) {
            reason = prompt(`Enter reason for suspending ${studentName}:`);
            if (!reason) return false;
        }
        
        if (!confirm(`⚠️ Are you sure you want to suspend ${studentName}?`)) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/students/${studentId}/suspend`, { reason });
            
            if (response.success) {
                toast.success(`✅ ${studentName} suspended`);
                await this.loadStudents();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to suspend student');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async reactivateStudent(studentId, studentName) {
        if (!confirm(`Reactivate ${studentName}?`)) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/students/${studentId}/reactivate`);
            
            if (response.success) {
                toast.success(`✅ ${studentName} reactivated`);
                await this.loadStudents();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reactivate student');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showStudentDetailsModal(student) {
        const user = student.User || {};
        const schoolSettings = window.store?.getState('schoolSettings') || {};
        const gradeInfo = gradeCalculator.calculateGrade(student.average || 0, schoolSettings.curriculum, schoolSettings.schoolLevel);
        
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
                    <p class="text-sm"><span class="font-medium">Average:</span> ${student.average || 0}% (${gradeInfo.grade})</p>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('student-details-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                    <button onclick="window.studentManager.copyElimuid('${student.elimuid}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Copy ELIMUID</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    copyElimuid(elimuid) {
        if (!elimuid) {
            toast.error('No ELIMUID to copy');
            return;
        }
        navigator.clipboard.writeText(elimuid)
            .then(() => toast.success('ELIMUID copied to clipboard'))
            .catch(() => toast.error('Failed to copy'));
    },
    
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
                    <button onclick="window.studentManager.handleAddStudent()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add Student</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleAddStudent() {
        const name = document.getElementById('student-name')?.value;
        const grade = document.getElementById('student-grade')?.value;
        const parentEmail = document.getElementById('parent-email')?.value;
        const dob = document.getElementById('student-dob')?.value;
        const gender = document.getElementById('student-gender')?.value;
        
        const result = await this.addStudent({ name, grade, parentEmail, dateOfBirth: dob, gender });
        
        if (result) {
            modalManager.close('add-student-modal');
            if (window.dashboard && window.dashboard.refreshStudents) {
                window.dashboard.refreshStudents();
            }
        }
    }
};

window.studentManager = studentManager;