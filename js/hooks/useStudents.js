// js/hooks/useStudents.js
import { useState, useEffect } from '../core/utils.js';
import { studentManager } from '../features/students/StudentManager.js';

export const useStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadStudents();
    }, []);
    
    const loadStudents = async () => {
        setLoading(true);
        const data = await studentManager.loadStudents();
        setStudents(data);
        setLoading(false);
    };
    
    const addStudent = async (studentData) => {
        const result = await studentManager.addStudent(studentData);
        if (result) await loadStudents();
        return result;
    };
    
    const updateStudent = async (studentId, data) => {
        const result = await studentManager.updateStudent(studentId, data);
        if (result) await loadStudents();
        return result;
    };
    
    const deleteStudent = async (studentId, studentName) => {
        const result = await studentManager.deleteStudent(studentId, studentName);
        if (result) await loadStudents();
        return result;
    };
    
    const suspendStudent = async (studentId, studentName, reason) => {
        const result = await studentManager.suspendStudent(studentId, studentName, reason);
        if (result) await loadStudents();
        return result;
    };
    
    const reactivateStudent = async (studentId, studentName) => {
        const result = await studentManager.reactivateStudent(studentId, studentName);
        if (result) await loadStudents();
        return result;
    };
    
    return {
        students,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        suspendStudent,
        reactivateStudent,
        refresh: loadStudents
    };
};

window.useStudents = useStudents;