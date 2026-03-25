// js/hooks/useClasses.js
import { useState, useEffect } from '../core/utils.js';
import { classManager } from '../features/classes/ClassManager.js';
import { teacherAssignment } from '../features/classes/TeacherAssignment.js';

export const useClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadClasses();
    }, []);
    
    const loadClasses = async () => {
        setLoading(true);
        const data = await classManager.loadClasses();
        setClasses(data);
        setLoading(false);
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
    
    return {
        classes,
        loading,
        createClass,
        updateClass,
        deleteClass,
        assignTeacher,
        removeTeacher,
        refresh: loadClasses
    };
};

window.useClasses = useClasses;