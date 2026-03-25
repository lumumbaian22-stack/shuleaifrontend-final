// js/features/grades/Analytics.js
import { apiClient } from '../../api/client.js';
import { ChartRenderer } from '../../dashboard/base/ChartRenderer.js';
import { getGradeFromScore } from '../../constants/curriculum.js';

export const gradeAnalytics = {
    async getStudentAnalytics(studentId, period = 'term') {
        try {
            const response = await apiClient.get(`/api/analytics/student/${studentId}?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Failed to load student analytics:', error);
            return null;
        }
    },
    
    async getClassAnalytics(classId, subject) {
        try {
            const url = subject 
                ? `/api/analytics/class/${classId}?subject=${subject}`
                : `/api/analytics/class/${classId}`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Failed to load class analytics:', error);
            return null;
        }
    },
    
    async getSchoolAnalytics() {
        try {
            const response = await apiClient.get('/api/analytics/school');
            return response.data;
        } catch (error) {
            console.error('Failed to load school analytics:', error);
            return null;
        }
    },
    
    renderPerformanceTrend(containerId, data, studentName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!data || !data.records || data.records.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No performance data available</p>';
            return;
        }
        
        const chartData = {
            labels: data.records.map(r => formatDate(r.date)),
            values: data.records.map(r => r.score),
            label: `${studentName || 'Student'} Performance`
        };
        
        container.innerHTML = '<div class="chart-container h-64" id="trend-chart-canvas"></div>';
        const chartContainer = document.getElementById('trend-chart-canvas');
        
        if (this.trendChart) {
            ChartRenderer.destroy(this.trendChart);
        }
        
        this.trendChart = ChartRenderer.render(chartContainer, chartData, 'line');
    },
    
    renderSubjectComparison(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!data || !data.subjectAverages || data.subjectAverages.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No subject data available</p>';
            return;
        }
        
        const chartData = {
            labels: data.subjectAverages.map(s => s.subject),
            values: data.subjectAverages.map(s => s.average),
            label: 'Subject Averages'
        };
        
        container.innerHTML = '<div class="chart-container h-64" id="subject-chart-canvas"></div>';
        const chartContainer = document.getElementById('subject-chart-canvas');
        
        if (this.subjectChart) {
            ChartRenderer.destroy(this.subjectChart);
        }
        
        this.subjectChart = ChartRenderer.render(chartContainer, chartData, 'bar');
    },
    
    renderGradeDistribution(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!data || !data.gradeDistribution) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No grade distribution data available</p>';
            return;
        }
        
        const chartData = {
            labels: Object.keys(data.gradeDistribution),
            values: Object.values(data.gradeDistribution)
        };
        
        container.innerHTML = '<div class="chart-container h-64" id="distribution-chart-canvas"></div>';
        const chartContainer = document.getElementById('distribution-chart-canvas');
        
        if (this.distributionChart) {
            ChartRenderer.destroy(this.distributionChart);
        }
        
        this.distributionChart = ChartRenderer.render(chartContainer, chartData, 'doughnut');
    },
    
    renderPrediction(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!data || !data.predictions) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No prediction data available</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="space-y-4">
                <div class="p-4 bg-primary/10 rounded-lg text-center">
                    <p class="text-sm text-muted-foreground">Predicted Score</p>
                    <p class="text-3xl font-bold text-primary">${data.predictions.predictedScore || 0}%</p>
                </div>
                <div class="p-4 bg-muted/30 rounded-lg">
                    <p class="text-sm font-medium">Trend: ${data.predictions.trend || 'stable'}</p>
                    <p class="text-xs text-muted-foreground mt-1">Based on historical performance</p>
                </div>
                <div class="p-4 bg-muted/30 rounded-lg">
                    <p class="text-sm font-medium">Recommendations</p>
                    <ul class="text-xs text-muted-foreground mt-2 list-disc list-inside">
                        ${(data.predictions.recommendations || ['Focus on consistent study habits']).map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
};

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

window.gradeAnalytics = gradeAnalytics;