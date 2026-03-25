// js/features/teachers/TeacherManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, getInitials } from '../../core/utils.js';

export const teacherManager = {
    teachers: [],
    pendingTeachers: [],
    
    async loadTeachers() {
        try {
            const response = await apiClient.get('/api/admin/teachers');
            this.teachers = response.data || [];
            return this.teachers;
        } catch (error) {
            console.error('Failed to load teachers:', error);
            return [];
        }
    },
    
    async loadPendingTeachers() {
        try {
            const response = await apiClient.get('/api/admin/approvals/pending');
            this.pendingTeachers = response.data?.teachers || [];
            return this.pendingTeachers;
        } catch (error) {
            console.error('Failed to load pending teachers:', error);
            return [];
        }
    },
    
    async approveTeacher(teacherId) {
        if (!confirm('Approve this teacher?')) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/teachers/${teacherId}/approve`, { action: 'approve' });
            
            if (response.success) {
                toast.success('✅ Teacher approved successfully');
                await this.loadTeachers();
                await this.loadPendingTeachers();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to approve teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async rejectTeacher(teacherId) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/teachers/${teacherId}/approve`, { action: 'reject', rejectionReason: reason });
            
            if (response.success) {
                toast.info('Teacher rejected');
                await this.loadPendingTeachers();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reject teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async deactivateTeacher(teacherId, teacherName) {
        const reason = prompt(`Enter reason for deactivating ${teacherName}:`);
        if (!reason) return false;
        
        if (!confirm(`⚠️ Deactivate ${teacherName}?`)) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/teachers/${teacherId}/deactivate`, { reason });
            
            if (response.success) {
                toast.success(`✅ ${teacherName} deactivated`);
                await this.loadTeachers();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to deactivate teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async activateTeacher(teacherId, teacherName) {
        if (!confirm(`Activate ${teacherName}?`)) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/teachers/${teacherId}/activate`);
            
            if (response.success) {
                toast.success(`✅ ${teacherName} activated`);
                await this.loadTeachers();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to activate teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async deleteTeacher(teacherId) {
        if (!confirm('⚠️ PERMANENT DELETE?')) return false;
        
        const confirmText = prompt('Type "DELETE" to confirm:');
        if (confirmText !== 'DELETE') {
            toast.info('Cancelled');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.delete(`/api/admin/teachers/${teacherId}`);
            
            if (response.success) {
                toast.success('✅ Teacher removed');
                await this.loadTeachers();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to remove teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showTeacherDetailsModal(teacher) {
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
    },
    
    showEditTeacherModal(teacher) {
        const user = teacher.User || {};
        
        const modal = modalManager.create('edit-teacher-modal', 'Edit Teacher');
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="edit-teacher-id" value="${teacher.id}">
                <div>
                    <label class="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" id="edit-teacher-name" value="${user.name || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" id="edit-teacher-email" value="${user.email || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
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
                    <input type="text" id="edit-teacher-class" value="${teacher.classTeacher || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Qualification</label>
                    <input type="text" id="edit-teacher-qualification" value="${teacher.qualification || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('edit-teacher-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.teacherManager.handleUpdateTeacher()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Teacher</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
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
            const response = await apiClient.put(`/api/admin/teachers/${teacherId}`, {
                name,
                email,
                subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
                department,
                classTeacher,
                qualification
            });
            
            if (response.success) {
                toast.success('✅ Teacher updated successfully');
                modalManager.close('edit-teacher-modal');
                await this.loadTeachers();
                if (window.dashboard && window.dashboard.refreshTeachers) {
                    window.dashboard.refreshTeachers();
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update teacher');
        } finally {
            toast.loading(false);
        }
    },
    
    editTeacher(teacherId) {
        const teacher = this.teachers.find(t => t.id == teacherId);
        if (!teacher) {
            toast.error('Teacher not found');
            return;
        }
        this.showEditTeacherModal(teacher);
    }
};

window.teacherManager = teacherManager;