// js/hooks/useCurriculum.js
import { store } from '../core/store.js';
import { useState, useEffect } from '../core/utils.js';
import { getGradeFromScore, CURRICULUM_CONFIG } from '../constants/curriculum.js';

export const useCurriculum = () => {
    const [curriculum, setCurriculum] = useState(store.getState('curriculum'));
    const [schoolLevel, setSchoolLevel] = useState(store.getState('schoolSettings')?.schoolLevel);
    
    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            setCurriculum(state.curriculum);
            setSchoolLevel(state.schoolSettings?.schoolLevel);
        });
        return unsubscribe;
    }, []);
    
    const calculateGrade = (score) => {
        return getGradeFromScore(score, curriculum, schoolLevel);
    };
    
    const getSubjects = () => {
        const config = CURRICULUM_CONFIG[curriculum];
        if (!config) return [];
        return config.subjects[schoolLevel] || config.subjects.secondary || [];
    };
    
    const getGradeColor = (grade) => {
        const colors = {
            'A': 'bg-green-100 text-green-700',
            'A-': 'bg-green-100 text-green-700',
            'B+': 'bg-blue-100 text-blue-700',
            'B': 'bg-blue-100 text-blue-700',
            'B-': 'bg-blue-100 text-blue-700',
            'C+': 'bg-yellow-100 text-yellow-700',
            'C': 'bg-yellow-100 text-yellow-700',
            'C-': 'bg-yellow-100 text-yellow-700',
            'D+': 'bg-orange-100 text-orange-700',
            'D': 'bg-orange-100 text-orange-700',
            'D-': 'bg-orange-100 text-orange-700',
            'E': 'bg-red-100 text-red-700',
            'EE': 'bg-green-100 text-green-700',
            'ME': 'bg-blue-100 text-blue-700',
            'AE': 'bg-yellow-100 text-yellow-700',
            'BE': 'bg-red-100 text-red-700'
        };
        return colors[grade] || 'bg-gray-100 text-gray-700';
    };
    
    return { curriculum, schoolLevel, calculateGrade, getSubjects, getGradeColor };
};

window.useCurriculum = useCurriculum;