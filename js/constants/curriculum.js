// js/constants/curriculum.js
export const CURRICULUM = {
    CBC: 'cbc',
    EIGHT_FOUR_FOUR: '844',
    BRITISH: 'british',
    AMERICAN: 'american'
};

export const CURRICULUM_DISPLAY_NAMES = {
    [CURRICULUM.CBC]: 'CBC (Competency Based Curriculum)',
    [CURRICULUM.EIGHT_FOUR_FOUR]: '8-4-4 System',
    [CURRICULUM.BRITISH]: 'British Curriculum',
    [CURRICULUM.AMERICAN]: 'American Curriculum'
};

export const CURRICULUM_CONFIG = {
    [CURRICULUM.CBC]: {
        levels: {
            pre_primary: { name: 'Pre-Primary', classes: ['PP1', 'PP2'] },
            lower_primary: { name: 'Lower Primary', classes: ['Grade 1', 'Grade 2', 'Grade 3'] },
            upper_primary: { name: 'Upper Primary', classes: ['Grade 4', 'Grade 5', 'Grade 6'] },
            junior_secondary: { name: 'Junior Secondary', classes: ['Grade 7', 'Grade 8', 'Grade 9'] },
            senior_secondary: { name: 'Senior Secondary', classes: ['Grade 10', 'Grade 11', 'Grade 12'] }
        },
        subjects: {
            primary: ['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies', 'CRE/IRE', 'Physical Education', 'Art & Craft', 'Music'],
            secondary: ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'CRE/IRE', 'Business Studies', 'Agriculture', 'Computer Studies']
        },
        grading: {
            primary: [
                { grade: 'EE', min: 80, max: 100, description: 'Exceeding Expectations' },
                { grade: 'ME', min: 60, max: 79, description: 'Meeting Expectations' },
                { grade: 'AE', min: 40, max: 59, description: 'Approaching Expectations' },
                { grade: 'BE', min: 0, max: 39, description: 'Below Expectations' }
            ],
            secondary: [
                { grade: 'A', min: 81, max: 100, description: 'Excellent' },
                { grade: 'A-', min: 75, max: 80, description: 'Very Good' },
                { grade: 'B+', min: 70, max: 74, description: 'Good' },
                { grade: 'B', min: 65, max: 69, description: 'Above Average' },
                { grade: 'B-', min: 60, max: 64, description: 'Average' },
                { grade: 'C+', min: 55, max: 59, description: 'Below Average' },
                { grade: 'C', min: 50, max: 54, description: 'Fair' },
                { grade: 'C-', min: 45, max: 49, description: 'Poor' },
                { grade: 'D+', min: 40, max: 44, description: 'Very Poor' },
                { grade: 'D', min: 35, max: 39, description: 'Weak' },
                { grade: 'D-', min: 30, max: 34, description: 'Very Weak' },
                { grade: 'E', min: 0, max: 29, description: 'Fail' }
            ]
        }
    },
    [CURRICULUM.EIGHT_FOUR_FOUR]: {
        levels: {
            primary: { name: 'Primary', classes: ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8'] },
            secondary: { name: 'Secondary', classes: ['Form 1', 'Form 2', 'Form 3', 'Form 4'] }
        },
        subjects: {
            primary: ['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies', 'CRE/IRE', 'Physical Education'],
            secondary: ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'CRE/IRE', 'Business Studies', 'Agriculture', 'Computer Studies']
        },
        grading: {
            primary: [
                { grade: 'A', min: 81, max: 100, description: 'Excellent' },
                { grade: 'A-', min: 75, max: 80, description: 'Very Good' },
                { grade: 'B+', min: 70, max: 74, description: 'Good' },
                { grade: 'B', min: 65, max: 69, description: 'Above Average' },
                { grade: 'B-', min: 60, max: 64, description: 'Average' },
                { grade: 'C+', min: 55, max: 59, description: 'Below Average' },
                { grade: 'C', min: 50, max: 54, description: 'Fair' },
                { grade: 'C-', min: 45, max: 49, description: 'Poor' },
                { grade: 'D+', min: 40, max: 44, description: 'Very Poor' },
                { grade: 'D', min: 35, max: 39, description: 'Weak' },
                { grade: 'D-', min: 30, max: 34, description: 'Very Weak' },
                { grade: 'E', min: 0, max: 29, description: 'Fail' }
            ],
            secondary: [
                { grade: 'A', min: 81, max: 100, description: 'Excellent' },
                { grade: 'A-', min: 75, max: 80, description: 'Very Good' },
                { grade: 'B+', min: 70, max: 74, description: 'Good' },
                { grade: 'B', min: 65, max: 69, description: 'Above Average' },
                { grade: 'B-', min: 60, max: 64, description: 'Average' },
                { grade: 'C+', min: 55, max: 59, description: 'Below Average' },
                { grade: 'C', min: 50, max: 54, description: 'Fair' },
                { grade: 'C-', min: 45, max: 49, description: 'Poor' },
                { grade: 'D+', min: 40, max: 44, description: 'Very Poor' },
                { grade: 'D', min: 35, max: 39, description: 'Weak' },
                { grade: 'D-', min: 30, max: 34, description: 'Very Weak' },
                { grade: 'E', min: 0, max: 29, description: 'Fail' }
            ]
        }
    },
    [CURRICULUM.BRITISH]: {
        levels: {
            primary: { name: 'Primary', classes: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'] },
            lower_secondary: { name: 'Lower Secondary', classes: ['Year 7', 'Year 8', 'Year 9'] },
            upper_secondary: { name: 'Upper Secondary', classes: ['Year 10', 'Year 11', 'Year 12', 'Year 13'] }
        },
        subjects: {
            primary: ['English', 'Mathematics', 'Science', 'History', 'Geography', 'Art', 'Music', 'Physical Education'],
            secondary: ['English Literature', 'English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'French', 'Spanish', 'Computer Science', 'Business Studies', 'Economics', 'Art & Design', 'Music', 'Physical Education']
        },
        grading: {
            primary: [
                { grade: 'A*', min: 90, max: 100, description: 'Exceptional' },
                { grade: 'A', min: 80, max: 89, description: 'Excellent' },
                { grade: 'B', min: 70, max: 79, description: 'Very Good' },
                { grade: 'C', min: 60, max: 69, description: 'Good' },
                { grade: 'D', min: 50, max: 59, description: 'Satisfactory' },
                { grade: 'E', min: 40, max: 49, description: 'Below Average' },
                { grade: 'F', min: 30, max: 39, description: 'Poor' },
                { grade: 'G', min: 20, max: 29, description: 'Very Poor' },
                { grade: 'U', min: 0, max: 19, description: 'Ungraded' }
            ],
            secondary: [
                { grade: 'A*', min: 90, max: 100, description: 'Exceptional' },
                { grade: 'A', min: 80, max: 89, description: 'Excellent' },
                { grade: 'B', min: 70, max: 79, description: 'Very Good' },
                { grade: 'C', min: 60, max: 69, description: 'Good' },
                { grade: 'D', min: 50, max: 59, description: 'Satisfactory' },
                { grade: 'E', min: 40, max: 49, description: 'Below Average' },
                { grade: 'F', min: 30, max: 39, description: 'Poor' },
                { grade: 'G', min: 20, max: 29, description: 'Very Poor' },
                { grade: 'U', min: 0, max: 19, description: 'Ungraded' }
            ]
        }
    },
    [CURRICULUM.AMERICAN]: {
        levels: {
            elementary: { name: 'Elementary', classes: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'] },
            middle: { name: 'Middle School', classes: ['Grade 6', 'Grade 7', 'Grade 8'] },
            high: { name: 'High School', classes: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] }
        },
        subjects: {
            elementary: ['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education'],
            secondary: ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Spanish', 'French', 'Computer Science', 'Business', 'Economics', 'Art', 'Music', 'Physical Education']
        },
        grading: {
            elementary: [
                { grade: 'A', min: 90, max: 100, description: 'Excellent', gpa: 4.0 },
                { grade: 'B', min: 80, max: 89, description: 'Good', gpa: 3.0 },
                { grade: 'C', min: 70, max: 79, description: 'Average', gpa: 2.0 },
                { grade: 'D', min: 60, max: 69, description: 'Below Average', gpa: 1.0 },
                { grade: 'F', min: 0, max: 59, description: 'Failing', gpa: 0.0 }
            ],
            secondary: [
                { grade: 'A', min: 90, max: 100, description: 'Excellent', gpa: 4.0 },
                { grade: 'B', min: 80, max: 89, description: 'Good', gpa: 3.0 },
                { grade: 'C', min: 70, max: 79, description: 'Average', gpa: 2.0 },
                { grade: 'D', min: 60, max: 69, description: 'Below Average', gpa: 1.0 },
                { grade: 'F', min: 0, max: 59, description: 'Failing', gpa: 0.0 }
            ]
        }
    }
};

export function getGradeFromScore(score, curriculum, level) {
    const config = CURRICULUM_CONFIG[curriculum];
    if (!config) return { grade: 'N/A', description: 'Not available' };
    
    const gradingScale = config.grading[level] || config.grading.primary;
    const scoreNum = parseInt(score);
    
    for (const gradeInfo of gradingScale) {
        if (scoreNum >= gradeInfo.min && scoreNum <= gradeInfo.max) {
            return gradeInfo;
        }
    }
    
    return { grade: 'N/A', description: 'Invalid score' };
}

export function getGradePoints(grade, curriculum, level) {
    const config = CURRICULUM_CONFIG[curriculum];
    if (!config || !config.grading[level]) return 0;
    
    const gradeInfo = config.grading[level].find(g => g.grade === grade);
    return gradeInfo?.points || gradeInfo?.gpa || 0;
}