// js/features/curriculum/gradeCalculator.js
import { CURRICULUM_CONFIG, getGradeFromScore } from '../../constants/curriculum.js';

export const gradeCalculator = {
    calculateGrade(score, curriculum, level) {
        return getGradeFromScore(score, curriculum, level);
    },
    
    calculateAverage(scores) {
        if (!scores || scores.length === 0) return 0;
        const sum = scores.reduce((a, b) => a + b, 0);
        return Math.round(sum / scores.length);
    },
    
    calculateWeightedAverage(grades, weights) {
        if (!grades || grades.length === 0) return 0;
        let totalWeight = 0;
        let weightedSum = 0;
        
        grades.forEach((grade, index) => {
            const weight = weights[index] || 1;
            weightedSum += grade * weight;
            totalWeight += weight;
        });
        
        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    },
    
    getGradeColor(grade) {
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
    },
    
    getGradePoints(grade, curriculum, level) {
        const config = CURRICULUM_CONFIG[curriculum];
        if (!config || !config.grading[level]) return 0;
        
        const gradeInfo = config.grading[level].find(g => g.grade === grade);
        return gradeInfo?.points || gradeInfo?.gpa || 0;
    },
    
    getGradeDescription(grade, curriculum, level) {
        const config = CURRICULUM_CONFIG[curriculum];
        if (!config || !config.grading[level]) return '';
        
        const gradeInfo = config.grading[level].find(g => g.grade === grade);
        return gradeInfo?.description || '';
    },
    
    getGradeRange(grade, curriculum, level) {
        const config = CURRICULUM_CONFIG[curriculum];
        if (!config || !config.grading[level]) return null;
        
        const gradeInfo = config.grading[level].find(g => g.grade === grade);
        if (gradeInfo) {
            return { min: gradeInfo.min, max: gradeInfo.max };
        }
        return null;
    },
    
    getPerformanceLabel(score) {
        if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
        if (score >= 70) return { label: 'Very Good', color: 'text-blue-600' };
        if (score >= 60) return { label: 'Good', color: 'text-cyan-600' };
        if (score >= 50) return { label: 'Average', color: 'text-yellow-600' };
        if (score >= 40) return { label: 'Below Average', color: 'text-orange-600' };
        return { label: 'Needs Improvement', color: 'text-red-600' };
    }
};

window.gradeCalculator = gradeCalculator;