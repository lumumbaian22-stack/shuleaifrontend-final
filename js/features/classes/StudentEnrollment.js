// js/features/classes/StudentEnrollment.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';

export const studentEnrollment = {
    async enrollStudent(studentId, classId) {
        if (!studentId || !classId) {
            toast.error('Student and class are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/teacher/students/${studentId}/enroll`, { classId });
            
            if (response.success) {
                toast.success('✅ Student enrolled successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to enroll student');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async removeStudent(studentId, classId) {
        if (!studentId) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.delete(`/api/teacher/students/${studentId}`);
            
            if (response.success) {
                toast.success('✅ Student removed from class');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to remove student');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async getClassStudents(classId) {
        try {
            const response = await apiClient.get(`/api/admin/classes/${classId}/students`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load class students:', error);
            return [];
        }
    },
    
    showEnrollStudentModal(classId, className) {
        const modal = modalManager.create('enroll-student-modal', `Enroll Student - ${className}`);
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Student ELIMUID</label>
                    <input type="text" id="student-elimuid" placeholder="e.g., ELI-2024-001" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('enroll-student-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.studentEnrollment.handleEnroll('${classId}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Enroll</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleEnroll(classId) {
        const elimuid = document.getElementById('student-elimuid')?.value;
        
        if (!elimuid) {
            toast.error('Please enter student ELIMUID');
            return;
        }
        
        // First find student by ELIMUID
        try {
            const studentsResponse = await apiClient.get('/api/admin/students');
            const student = (studentsResponse.data || []).find(s => s.elimuid === elimuid);
            
            if (!student) {
                toast.error('Student not found');
                return;
            }
            
            const success = await this.enrollStudent(student.id, classId);
            
            if (success) {
                modalManager.close('enroll-student-modal');
                if (window.dashboard && window.dashboard.refreshClasses) {
                    window.dashboard.refreshClasses();
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to find student');
        }
    }
};

window.studentEnrollment = studentEnrollment;