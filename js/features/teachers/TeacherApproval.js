// js/features/teachers/TeacherApproval.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, getInitials } from '../../core/utils.js';

export const teacherApproval = {
    pendingTeachers: [],
    
    async loadPending() {
        try {
            const response = await apiClient.get('/api/admin/approvals/pending');
            this.pendingTeachers = response.data?.teachers || [];
            return this.pendingTeachers;
        } catch (error) {
            console.error('Failed to load pending teachers:', error);
            return [];
        }
    },
    
    async approve(teacherId) {
        if (!confirm('Approve this teacher?')) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/teachers/${teacherId}/approve`, { action: 'approve' });
            
            if (response.success) {
                toast.success('✅ Teacher approved successfully');
                await this.loadPending();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to approve teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async reject(teacherId) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/teachers/${teacherId}/approve`, { action: 'reject', rejectionReason: reason });
            
            if (response.success) {
                toast.info('Teacher rejected');
                await this.loadPending();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reject teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showPendingTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.loadPending().then(() => {
            if (this.pendingTeachers.length === 0) {
                container.innerHTML = '<div class="p-8 text-center text-muted-foreground">No pending approvals</div>';
                return;
            }
            
            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-muted/50">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium">Teacher</th>
                                <th class="px-4 py-3 text-left font-medium">Email</th>
                                <th class="px-4 py-3 text-left font-medium">Subjects</th>
                                <th class="px-4 py-3 text-left font-medium">Qualification</th>
                                <th class="px-4 py-3 text-left font-medium">Applied</th>
                                <th class="px-4 py-3 text-right font-medium">Actions</th>
                             </tr>
                        </thead>
                        <tbody class="divide-y">
                            ${this.pendingTeachers.map(teacher => {
                                const user = teacher.User || {};
                                return `
                                    <tr class="hover:bg-accent/50 transition-colors">
                                        <td class="px-4 py-3">
                                            <div class="flex items-center gap-3">
                                                <div class="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                                                    <span class="font-medium text-violet-700 text-sm">${getInitials(user.name)}</span>
                                                </div>
                                                <span class="font-medium">${user.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3">${user.email || 'N/A'}</td>
                                        <td class="px-4 py-3">${(teacher.subjects || []).join(', ')}</td>
                                        <td class="px-4 py-3">${teacher.qualification || 'N/A'}</td>
                                        <td class="px-4 py-3">${formatDate(teacher.createdAt) || 'N/A'}</td>
                                        <td class="px-4 py-3 text-right">
                                            <button onclick="window.teacherApproval.approve('${teacher.id}')" class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 mr-2">Approve</button>
                                            <button onclick="window.teacherApproval.reject('${teacher.id}')" class="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200">Reject</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }
};

window.teacherApproval = teacherApproval;