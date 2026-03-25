// js/features/grades/GradeEntry.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { getGradeFromScore } from '../../constants/curriculum.js';

export const gradeEntry = {
    async enterGrade(studentId, subject, score, assessmentType, assessmentName, date, comment) {
        if (!studentId || !subject || !score) {
            toast.error('Student, subject, and score are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/teacher/marks', {
                studentId,
                subject,
                score: parseInt(score),
                assessmentType: assessmentType || 'test',
                assessmentName: assessmentName || `${subject} ${assessmentType || 'test'}`,
                date: date || new Date().toISOString().split('T')[0],
                comment
            });
            
            if (response.success) {
                toast.success('✅ Grade saved successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save grade');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async enterGradesBulk(grades) {
        if (!grades || grades.length === 0) {
            toast.error('No grades to save');
            return false;
        }
        
        toast.loading(true);
        
        let success = 0;
        let failed = 0;
        
        for (const grade of grades) {
            try {
                await this.enterGrade(grade.studentId, grade.subject, grade.score, grade.assessmentType, grade.assessmentName, grade.date, grade.comment);
                success++;
            } catch (error) {
                failed++;
            }
        }
        
        toast.success(`✅ Saved ${success} grades, ${failed} failed`);
        
        toast.loading(false);
        return { success, failed };
    },
    
    showGradeEntryModal(studentId, studentName) {
        const schoolSettings = window.store?.getState('schoolSettings') || {};
        const curriculum = schoolSettings.curriculum || 'cbc';
        const level = schoolSettings.schoolLevel || 'secondary';
        
        const modal = modalManager.create('grade-entry-modal', `Enter Grade - ${studentName}`);
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Subject</label>
                    <input type="text" id="grade-subject" placeholder="e.g., Mathematics" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Score (0-100)</label>
                    <input type="number" id="grade-score" min="0" max="100" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <div id="grade-preview" class="mt-1 text-sm"></div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Assessment Type</label>
                    <select id="grade-type" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="test">Test</option>
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="project">Project</option>
                        <option value="quiz">Quiz</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Date</label>
                    <input type="date" id="grade-date" value="${new Date().toISOString().split('T')[0]}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Comment (Optional)</label>
                    <textarea id="grade-comment" rows="2" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('grade-entry-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.gradeEntry.handleSave('${studentId}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Grade</button>
                </div>
            </div>
        `);
        modal.open();
        
        // Add score preview listener
        const scoreInput = document.getElementById('grade-score');
        if (scoreInput) {
            scoreInput.addEventListener('input', () => {
                const score = parseInt(scoreInput.value);
                if (!isNaN(score) && score >= 0 && score <= 100) {
                    const gradeInfo = getGradeFromScore(score, curriculum, level);
                    const preview = document.getElementById('grade-preview');
                    if (preview) {
                        preview.innerHTML = `<span class="px-2 py-1 ${gradeInfo.grade === 'A' || gradeInfo.grade === 'A-' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} rounded-full text-xs">Grade: ${gradeInfo.grade} - ${gradeInfo.description}</span>`;
                    }
                } else {
                    const preview = document.getElementById('grade-preview');
                    if (preview) preview.innerHTML = '';
                }
            });
        }
    },
    
    async handleSave(studentId) {
        const subject = document.getElementById('grade-subject')?.value;
        const score = document.getElementById('grade-score')?.value;
        const assessmentType = document.getElementById('grade-type')?.value;
        const date = document.getElementById('grade-date')?.value;
        const comment = document.getElementById('grade-comment')?.value;
        
        if (!subject || !score) {
            toast.error('Please enter subject and score');
            return;
        }
        
        const success = await this.enterGrade(studentId, subject, score, assessmentType, null, date, comment);
        
        if (success) {
            modalManager.close('grade-entry-modal');
            if (window.dashboard && window.dashboard.refreshGrades) {
                window.dashboard.refreshGrades();
            }
        }
    }
};

window.gradeEntry = gradeEntry;