// js/features/classes/TeacherAssignment.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';

export const teacherAssignment = {
    teachers: [],
    
    async loadAvailableTeachers() {
        try {
            const response = await apiClient.get('/api/admin/available-teachers');
            this.teachers = response.data || [];
            return this.teachers;
        } catch (error) {
            console.error('Failed to load teachers:', error);
            return [];
        }
    },
    
    async assignTeacher(classId, teacherId) {
        if (!classId || !teacherId) {
            toast.error('Class and teacher are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/classes/${classId}/assign-teacher`, { teacherId });
            
            if (response.success) {
                toast.success('✅ Teacher assigned successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async removeTeacher(classId) {
        if (!classId) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/classes/${classId}/remove-teacher`);
            
            if (response.success) {
                toast.success('✅ Teacher removed from class');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to remove teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showAssignTeacherModal(classId, className, currentTeacherId = null) {
        this.loadAvailableTeachers().then(() => {
            const modal = modalManager.create('assign-teacher-modal', 'Assign Class Teacher');
            modal.setContent(`
                <div class="space-y-4">
                    <p class="text-sm mb-4">Class: <span class="font-medium">${className}</span></p>
                    <div>
                        <label class="block text-sm font-medium mb-1">Select Teacher</label>
                        <select id="assign-teacher-select" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <option value="">-- Select Teacher --</option>
                            ${this.teachers.map(t => `
                                <option value="${t.id}" ${currentTeacherId == t.id ? 'selected' : ''}>
                                    ${t.User?.name || 'Unknown'} (${t.subjects?.join(', ') || 'No subjects'})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 pt-4 border-t">
                        <button onclick="window.modalManager?.close('assign-teacher-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                        <button onclick="window.teacherAssignment.handleAssign('${classId}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Assign</button>
                    </div>
                </div>
            `);
            modal.open();
        });
    },
    
    async handleAssign(classId) {
        const teacherId = document.getElementById('assign-teacher-select')?.value;
        
        if (!teacherId) {
            toast.error('Please select a teacher');
            return;
        }
        
        const success = await this.assignTeacher(classId, teacherId);
        
        if (success) {
            modalManager.close('assign-teacher-modal');
            if (window.dashboard && window.dashboard.refreshClasses) {
                window.dashboard.refreshClasses();
            }
        }
    }
};

window.teacherAssignment = teacherAssignment;