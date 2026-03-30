// js/hooks/useClasses.js
import { useState, useEffect } from '../core/utils.js';
import { classManager } from '../features/classes/ClassManager.js';
import { teacherAssignment } from '../features/classes/TeacherAssignment.js';
import { subjectAssignment } from '../features/classes/SubjectAssignment.js'; // New import

export const useClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        loadClasses();
    }, []);
    
    const loadClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await classManager.loadClasses();
            // Ensure subjectTeachers is always an array
            const classesWithSubjects = (data || []).map(cls => ({
                ...cls,
                subjectTeachers: cls.subjectTeachers || []
            }));
            setClasses(classesWithSubjects);
        } catch (err) {
            setError(err.message);
            console.error('Error loading classes:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const createClass = async (name, grade, stream = null) => {
        const result = await classManager.createClass(name, grade, stream);
        if (result) await loadClasses();
        return result;
    };
    
    const updateClass = async (classId, data) => {
        const result = await classManager.updateClass(classId, data);
        if (result) await loadClasses();
        return result;
    };
    
    const deleteClass = async (classId) => {
        const result = await classManager.deleteClass(classId);
        if (result) await loadClasses();
        return result;
    };
    
    const assignTeacher = async (classId, teacherId) => {
        const result = await teacherAssignment.assignTeacher(classId, teacherId);
        if (result) await loadClasses();
        return result;
    };
    
    const removeTeacher = async (classId) => {
        const result = await teacherAssignment.removeTeacher(classId);
        if (result) await loadClasses();
        return result;
    };
    
    // NEW: Subject Teacher Functions
    const assignSubjectTeacher = async (classId, teacherId, subject) => {
        try {
            const result = await subjectAssignment.assignTeacher(classId, teacherId, subject);
            if (result) await loadClasses();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };
    
    const removeSubjectTeacher = async (assignmentId, classId) => {
        try {
            const result = await subjectAssignment.removeTeacher(assignmentId);
            if (result) await loadClasses();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };
    
    const getSubjectTeachers = async (classId) => {
        try {
            const result = await subjectAssignment.getAssignments(classId);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        }
    };
    
    return {
        classes,
        loading,
        error,
        createClass,
        updateClass,
        deleteClass,
        assignTeacher,
        removeTeacher,
        assignSubjectTeacher,
        removeSubjectTeacher,
        getSubjectTeachers,
        refresh: loadClasses
    };
};

window.useClasses = useClasses;
