// js/features/students/StudentDetails.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, getInitials } from '../../core/utils.js';
import { gradeCalculator } from '../curriculum/gradeCalculator.js';

export const studentDetails = {
    currentStudent: null,
    
    async loadStudentDetails(studentId) {
        try {
            const response = await apiClient.get(`/api/admin/students/${studentId}`);
            this.currentStudent = response.data;
            return this.currentStudent;
        } catch (error) {
            console.error('Failed to load student details:', error);
            toast.error('Failed to load student details');
            return null;
        }
    },
    
    async loadStudentGrades(studentId) {
        try {
            const response = await apiClient.get(`/api/student/grades?studentId=${studentId}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load student grades:', error);
            return [];
        }
    },
    
    async loadStudentAttendance(studentId) {
        try {
            const response = await apiClient.get(`/api/student/attendance?studentId=${studentId}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load student attendance:', error);
            return [];
        }
    },
    
    showStudentDetailsModal(studentId) {
        this.loadStudentDetails(studentId).then(student => {
            if (!student) return;
            
            const user = student.User || {};
            const schoolSettings = window.store?.getState('schoolSettings') || {};
            const gradeInfo = gradeCalculator.calculateGrade(student.average || 0, schoolSettings.curriculum, schoolSettings.schoolLevel);
            
            const modal = modalManager.create('student-details-modal', 'Student Details');
            modal.setContent(`
                <div class="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div class="flex items-center gap-4">
                        <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <span class="font-medium text-green-700 text-xl">${getInitials(user.name)}</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-lg">${user.name || 'N/A'}</h4>
                            <p class="text-sm text-muted-foreground">${user.email || 'No email'}</p>
                            <p class="text-xs text-muted-foreground">ELIMUID: ${student.elimuid || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-3 bg-muted/30 rounded-lg">
                            <p class="text-xs text-muted-foreground">Grade</p>
                            <p class="font-medium">${student.grade || 'N/A'}</p>
                        </div>
                        <div class="p-3 bg-muted/30 rounded-lg">
                            <p class="text-xs text-muted-foreground">Status</p>
                            <p class="font-medium">${student.status || 'active'}</p>
                        </div>
                        <div class="p-3 bg-muted/30 rounded-lg">
                            <p class="text-xs text-muted-foreground">Gender</p>
                            <p class="font-medium">${student.gender || 'Not specified'}</p>
                        </div>
                        <div class="p-3 bg-muted/30 rounded-lg">
                            <p class="text-xs text-muted-foreground">DOB</p>
                            <p class="font-medium">${formatDate(student.dateOfBirth) || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <h4 class="font-medium mb-2">Academic Summary</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 bg-muted/30 rounded-lg text-center">
                                <p class="text-2xl font-bold text-primary">${student.average || 0}%</p>
                                <p class="text-xs text-muted-foreground">Average Score</p>
                            </div>
                            <div class="p-3 bg-muted/30 rounded-lg text-center">
                                <p class="text-2xl font-bold text-primary">${gradeInfo.grade}</p>
                                <p class="text-xs text-muted-foreground">Grade</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <h4 class="font-medium mb-2">Parent Information</h4>
                        <p class="text-sm">${student.parentEmail || 'No parent email provided'}</p>
                    </div>
                    
                    <div class="flex justify-end gap-2 pt-4 border-t">
                        <button onclick="window.modalManager?.close('student-details-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                        <button onclick="window.studentManager.copyElimuid('${student.elimuid}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Copy ELIMUID</button>
                        <button onclick="window.studentManager.editStudent('${student.id}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Edit Student</button>
                    </div>
                </div>
            `);
            modal.open();
        });
    }
};

window.studentDetails = studentDetails;