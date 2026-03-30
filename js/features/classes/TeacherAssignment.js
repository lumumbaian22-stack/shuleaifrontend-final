// js/features/classes/TeacherAssignment.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';

export const teacherAssignment = {
    // Assign class teacher to a class
    async assignClassTeacher(classId, teacherId) {
        if (!classId || !teacherId) {
            toast.error('Class and teacher are required');
            return false;
        }
        
        toast.loading(true);
        try {
            const response = await apiClient.post(`/api/admin/classes/${classId}/assign-teacher`, { teacherId });
            if (response.success) {
                toast.success('✅ Class teacher assigned successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    // Remove class teacher from a class
    async removeClassTeacher(classId) {
        if (!classId) {
            toast.error('Class ID required');
            return false;
        }
        
        toast.loading(true);
        try {
            const response = await apiClient.post(`/api/admin/classes/${classId}/remove-teacher`);
            if (response.success) {
                toast.success('✅ Class teacher removed');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to remove teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    // Get all teachers available for assignment
    async getAvailableTeachers() {
        try {
            const response = await apiClient.get('/api/admin/available-teachers');
            return response.data || [];
        } catch (error) {
            console.error('Failed to load available teachers:', error);
            return [];
        }
    },
    
    // Get class teacher for a specific class
    async getClassTeacher(classId) {
        try {
            const classes = await apiClient.get('/api/admin/classes');
            const classData = classes.data?.find(c => c.id === classId);
            return classData?.Teacher || null;
        } catch (error) {
            console.error('Failed to get class teacher:', error);
            return null;
        }
    }
};

window.teacherAssignment = teacherAssignment;
