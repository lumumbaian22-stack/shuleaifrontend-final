// js/constants/grades.js
export const ASSESSMENT_TYPES = {
    TEST: 'test',
    EXAM: 'exam',
    ASSIGNMENT: 'assignment',
    PROJECT: 'project',
    QUIZ: 'quiz'
};

export const ASSESSMENT_DISPLAY = {
    [ASSESSMENT_TYPES.TEST]: 'Test',
    [ASSESSMENT_TYPES.EXAM]: 'Exam',
    [ASSESSMENT_TYPES.ASSIGNMENT]: 'Assignment',
    [ASSESSMENT_TYPES.PROJECT]: 'Project',
    [ASSESSMENT_TYPES.QUIZ]: 'Quiz'
};

export const GRADE_COLORS = {
    'A': 'text-green-600 bg-green-100',
    'A-': 'text-green-600 bg-green-100',
    'B+': 'text-blue-600 bg-blue-100',
    'B': 'text-blue-600 bg-blue-100',
    'B-': 'text-blue-600 bg-blue-100',
    'C+': 'text-yellow-600 bg-yellow-100',
    'C': 'text-yellow-600 bg-yellow-100',
    'C-': 'text-yellow-600 bg-yellow-100',
    'D+': 'text-orange-600 bg-orange-100',
    'D': 'text-orange-600 bg-orange-100',
    'D-': 'text-orange-600 bg-orange-100',
    'E': 'text-red-600 bg-red-100',
    'EE': 'text-green-600 bg-green-100',
    'ME': 'text-blue-600 bg-blue-100',
    'AE': 'text-yellow-600 bg-yellow-100',
    'BE': 'text-red-600 bg-red-100'
};

export function getGradeColor(grade) {
    return GRADE_COLORS[grade] || 'text-gray-600 bg-gray-100';
}