 // js/features/teachers/TeacherDetails.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, getInitials } from '../../core/utils.js';

export const teacherDetails = {
    currentTeacher: null,
    
    async loadTeacherDetails(teacherId) {
        try {
            const response = await apiClient.get(`/api/admin/teachers/${teacherId}`);
            this.currentTeacher = response.data;
            return this.currentTeacher;
        } catch (error) {
            console.error('Failed to load teacher details:', error);
            toast.error('Failed to load teacher details');
            return null;
        }
    },
    
    showTeacherDetailsModal(teacherId) {
        this.loadTeacherDetails(teacherId).then(teacher => {
            if (!teacher) return;
            
            const user = teacher.User || {};
            const stats = teacher.statistics || {};
            
            const modal = modalManager.create('teacher-details-modal', 'Teacher Details');
            modal.setContent(`
                <div class="space-y-4 max-h-[70vh] overflow-y-auto">
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
                        <h4 class="font-medium mb-2">Performance Metrics</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 bg-muted/30 rounded-lg text-center">
                                <p class="text-2xl font-bold text-primary">${stats.dutiesCompleted || 0}</p>
                                <p class="text-xs text-muted-foreground">Duties Completed</p>
                            </div>
                            <div class="p-3 bg-muted/30 rounded-lg text-center">
                                <p class="text-2xl font-bold text-primary">${stats.reliabilityScore || 100}%</p>
                                <p class="text-xs text-muted-foreground">Reliability</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <h4 class="font-medium mb-2">Additional Information</h4>
                        <p class="text-sm"><span class="font-medium">Class Teacher:</span> ${teacher.classTeacher || 'Not assigned'}</p>
                        <p class="text-sm"><span class="font-medium">Qualification:</span> ${teacher.qualification || 'N/A'}</p>
                        <p class="text-sm"><span class="font-medium">Status:</span> ${teacher.approvalStatus || 'pending'}</p>
                        <p class="text-sm"><span class="font-medium">Joined:</span> ${formatDate(teacher.dateJoined) || 'N/A'}</p>
                    </div>
                    
                    <div class="flex justify-end gap-2 pt-4 border-t">
                        <button onclick="window.modalManager?.close('teacher-details-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                        <button onclick="window.teacherManager.editTeacher('${teacher.id}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Edit Teacher</button>
                    </div>
                </div>
            `);
            modal.open();
        });
    }
};

window.teacherDetails = teacherDetails;