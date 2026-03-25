// js/features/classes/ClassManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { store } from '../../core/store.js';

export const classManager = {
    classes: [],
    
    async loadClasses() {
        try {
            const response = await apiClient.get('/api/admin/classes');
            this.classes = response.data || [];
            return this.classes;
        } catch (error) {
            console.error('Failed to load classes:', error);
            return [];
        }
    },
    
    async createClass(name, grade, stream = null) {
        if (!name || !grade) {
            toast.error('Class name and grade are required');
            return null;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/admin/classes', {
                name,
                grade,
                stream,
                academicYear: new Date().getFullYear().toString()
            });
            
            if (response.success) {
                toast.success('✅ Class created successfully');
                await this.loadClasses();
                return response.data;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create class');
            return null;
        } finally {
            toast.loading(false);
        }
    },
    
    async updateClass(classId, data) {
        if (!classId) {
            toast.error('Class ID required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.put(`/api/admin/classes/${classId}`, data);
            
            if (response.success) {
                toast.success('✅ Class updated successfully');
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update class');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async deleteClass(classId) {
        if (!classId) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.delete(`/api/admin/classes/${classId}`);
            
            if (response.success) {
                toast.success('✅ Class deleted successfully');
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete class');
            return false;
        } finally {
            toast.loading(false);
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
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showAddClassModal() {
        const modal = modalManager.create('add-class-modal', 'Add New Class');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Class Name *</label>
                    <input type="text" id="class-name" placeholder="e.g., Form 1A, Grade 10 Science" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Grade/Level *</label>
                    <input type="text" id="class-grade" placeholder="e.g., 10, Form 1" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Stream (Optional)</label>
                    <input type="text" id="class-stream" placeholder="e.g., A, B, Science, Arts" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('add-class-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.classManager.handleAddClass()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Create Class</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleAddClass() {
        const name = document.getElementById('class-name')?.value;
        const grade = document.getElementById('class-grade')?.value;
        const stream = document.getElementById('class-stream')?.value;
        
        await this.createClass(name, grade, stream);
        modalManager.close('add-class-modal');
        
        // Refresh UI
        if (window.dashboard && window.dashboard.refreshClasses) {
            window.dashboard.refreshClasses();
        }
    },
    
    showEditClassModal(classData) {
        const modal = modalManager.create('edit-class-modal', 'Edit Class');
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="edit-class-id" value="${classData.id}">
                <div>
                    <label class="block text-sm font-medium mb-1">Class Name</label>
                    <input type="text" id="edit-class-name" value="${classData.name}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Grade/Level</label>
                    <input type="text" id="edit-class-grade" value="${classData.grade}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Stream</label>
                    <input type="text" id="edit-class-stream" value="${classData.stream || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('edit-class-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.classManager.handleEditClass()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Changes</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleEditClass() {
        const classId = document.getElementById('edit-class-id')?.value;
        const name = document.getElementById('edit-class-name')?.value;
        const grade = document.getElementById('edit-class-grade')?.value;
        const stream = document.getElementById('edit-class-stream')?.value;
        
        const success = await this.updateClass(classId, { name, grade, stream });
        
        if (success) {
            modalManager.close('edit-class-modal');
            if (window.dashboard && window.dashboard.refreshClasses) {
                window.dashboard.refreshClasses();
            }
        }
    }
};

window.classManager = classManager;