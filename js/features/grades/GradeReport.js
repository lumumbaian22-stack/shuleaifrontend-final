// js/features/grades/GradeReport.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { ChartRenderer } from '../../dashboard/base/ChartRenderer.js';
import { formatDate } from '../../core/utils.js';
import { getGradeFromScore } from '../../constants/curriculum.js';

export const gradeReport = {
    async loadStudentGrades(studentId) {
        try {
            const response = await apiClient.get(`/api/student/grades?studentId=${studentId}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load grades:', error);
            return [];
        }
    },
    
    async loadClassGrades(classId) {
        try {
            const response = await apiClient.get(`/api/analytics/class/${classId}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load class grades:', error);
            return [];
        }
    },
    
    renderGradeChart(containerId, grades, studentName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!grades || grades.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No grade data available</p>';
            return;
        }
        
        const subjects = [...new Set(grades.map(g => g.subject))];
        const scores = subjects.map(subject => {
            const subjectGrades = grades.filter(g => g.subject === subject);
            const avg = subjectGrades.reduce((sum, g) => sum + (g.score || 0), 0) / subjectGrades.length;
            return Math.round(avg);
        });
        
        const chartData = {
            labels: subjects,
            values: scores,
            label: `${studentName || 'Student'} Grades`
        };
        
        container.innerHTML = '<div class="chart-container h-64" id="grade-chart-canvas"></div>';
        const chartContainer = document.getElementById('grade-chart-canvas');
        
        if (this.chart) {
            ChartRenderer.destroy(this.chart);
        }
        
        this.chart = ChartRenderer.render(chartContainer, chartData, 'bar');
    },
    
    renderGradeTable(containerId, grades) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!grades || grades.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No grade records available</p>';
            return;
        }
        
        const schoolSettings = window.store?.getState('schoolSettings') || {};
        const curriculum = schoolSettings.curriculum || 'cbc';
        const level = schoolSettings.schoolLevel || 'secondary';
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium">Subject</th>
                            <th class="px-4 py-3 text-left font-medium">Assessment</th>
                            <th class="px-4 py-3 text-center font-medium">Score</th>
                            <th class="px-4 py-3 text-center font-medium">Grade</th>
                            <th class="px-4 py-3 text-left font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${grades.map(grade => {
                            const gradeInfo = getGradeFromScore(grade.score || 0, curriculum, level);
                            const gradeClass = gradeInfo.grade === 'A' || gradeInfo.grade === 'A-' ? 'bg-green-100 text-green-700' :
                                              gradeInfo.grade === 'B+' || gradeInfo.grade === 'B' || gradeInfo.grade === 'B-' ? 'bg-blue-100 text-blue-700' :
                                              gradeInfo.grade === 'C+' || gradeInfo.grade === 'C' || gradeInfo.grade === 'C-' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-red-100 text-red-700';
                            return `
                                <tr class="hover:bg-accent/50 transition-colors">
                                    <td class="px-4 py-3 font-medium">${grade.subject || 'N/A'}</td>
                                    <td class="px-4 py-3">${grade.assessmentName || grade.assessmentType || 'N/A'}</td>
                                    <td class="px-4 py-3 text-center">${grade.score || 0}%</td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="px-2 py-1 ${gradeClass} text-xs rounded-full">${gradeInfo.grade}</span>
                                    </td>
                                    <td class="px-4 py-3">${formatDate(grade.date) || 'N/A'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    renderStudentReport(containerId, studentId, studentName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.loadStudentGrades(studentId).then(grades => {
            const avgScore = grades.length > 0 
                ? Math.round(grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length)
                : 0;
            
            container.innerHTML = `
                <div class="space-y-6">
                    <div class="grid gap-4 md:grid-cols-3">
                        <div class="rounded-xl border bg-card p-6 text-center">
                            <p class="text-sm text-muted-foreground">Overall Average</p>
                            <p class="text-3xl font-bold text-primary">${avgScore}%</p>
                        </div>
                        <div class="rounded-xl border bg-card p-6 text-center">
                            <p class="text-sm text-muted-foreground">Total Assessments</p>
                            <p class="text-3xl font-bold text-primary">${grades.length}</p>
                        </div>
                        <div class="rounded-xl border bg-card p-6 text-center">
                            <p class="text-sm text-muted-foreground">Subjects</p>
                            <p class="text-3xl font-bold text-primary">${[...new Set(grades.map(g => g.subject))].length}</p>
                        </div>
                    </div>
                    <div id="grade-chart-container"></div>
                    <div id="grade-table-container"></div>
                </div>
            `;
            
            this.renderGradeChart('grade-chart-container', grades, studentName);
            this.renderGradeTable('grade-table-container', grades);
        });
    }
};

window.gradeReport = gradeReport;