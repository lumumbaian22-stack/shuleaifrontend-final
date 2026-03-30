// js/features/classes/SubjectAssignment.js

import { api } from '../../api/client.js';

export const subjectAssignment = {
    // Get all subject teachers for a class
    getAssignments: async (classId) => {
        try {
            const response = await api.admin.getClassSubjectAssignments(classId);
            return response.data || [];
        } catch (error) {
            console.error('Error getting subject assignments:', error);
            return [];
        }
    },
    
    // Assign a teacher to a subject in a class
    assignTeacher: async (classId, teacherId, subject, isClassTeacher = false) => {
        try {
            const response = await api.admin.assignTeacherToSubject({
                classId: parseInt(classId),
                teacherId: parseInt(teacherId),
                subject: subject,
                isClassTeacher: isClassTeacher
            });
            return response;
        } catch (error) {
            console.error('Error assigning subject teacher:', error);
            throw error;
        }
    },
    
    // Remove a teacher from a subject assignment
    removeTeacher: async (assignmentId) => {
        try {
            const response = await api.admin.removeSubjectAssignment(assignmentId);
            return response;
        } catch (error) {
            console.error('Error removing subject teacher:', error);
            throw error;
        }
    }
};

window.subjectAssignment = subjectAssignment;
