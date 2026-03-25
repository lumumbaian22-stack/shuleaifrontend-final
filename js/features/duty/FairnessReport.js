// js/features/duty/FairnessReport.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';

export const fairnessReport = {
    async load() {
        try {
            const response = await apiClient.get('/api/admin/duty/fairness-report');
            return response.data;
        } catch (error) {
            console.error('Failed to load fairness report:', error);
            toast.error('Failed to load fairness report');
            return null;
        }
    },
    
    async loadTeacherWorkload() {
        try {
            const response = await apiClient.get('/api/admin/duty/teacher-workload');
            return response.data || [];
        } catch (error) {
            console.error('Failed to load teacher workload:', error);
            return [];
        }
    },
    
    async loadUnderstaffedAreas() {
        try {
            const response = await apiClient.get('/api/admin/duty/understaffed');
            return response.data || [];
        } catch (error) {
            console.error('Failed to load understaffed areas:', error);
            return [];
        }
    },
    
    showReport(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        Promise.all([this.load(), this.loadTeacherWorkload(), this.loadUnderstaffedAreas()])
            .then(([report, workload, understaffed]) => {
                container.innerHTML = `
                    <div class="space-y-6">
                        ${understaffed && understaffed.length > 0 ? `
                            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div class="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                                    <i data-lucide="alert-triangle" class="h-5 w-5"></i>
                                    <h3 class="font-semibold">Understaffed Areas Detected</h3>
                                </div>
                                <div class="space-y-2">
                                    ${understaffed.map(area => `
                                        <div class="text-sm text-red-600 dark:text-red-400">
                                            ${area.date}: ${area.areas.map(a => `${a.area} (need ${a.required}, have ${a.current})`).join(', ')}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="grid gap-4 md:grid-cols-3">
                            <div class="rounded-xl border bg-card p-6">
                                <p class="text-sm text-muted-foreground">Fairness Score</p>
                                <div class="flex items-end gap-2">
                                    <h3 class="text-3xl font-bold">${report?.summary?.fairnessScore || 0}%</h3>
                                    <span class="text-sm text-muted-foreground mb-1">/ 100</span>
                                </div>
                            </div>
                            <div class="rounded-xl border bg-card p-6">
                                <p class="text-sm text-muted-foreground">Total Duties</p>
                                <h3 class="text-3xl font-bold">${report?.summary?.totalDuties || 0}</h3>
                            </div>
                            <div class="rounded-xl border bg-card p-6">
                                <p class="text-sm text-muted-foreground">Teachers</p>
                                <h3 class="text-3xl font-bold">${report?.teacherStats?.length || 0}</h3>
                            </div>
                        </div>
                        
                        <div class="rounded-xl border bg-card overflow-hidden">
                            <div class="p-4 border-b">
                                <h3 class="font-semibold">Teacher Workload Distribution</h3>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-muted/50">
                                        <tr>
                                            <th class="px-4 py-3 text-left">Teacher</th>
                                            <th class="px-4 py-3 text-left">Department</th>
                                            <th class="px-4 py-3 text-center">Scheduled</th>
                                            <th class="px-4 py-3 text-center">Completed</th>
                                            <th class="px-4 py-3 text-center">Completion Rate</th>
                                            <th class="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y">
                                        ${(workload || []).map(t => `
                                            <tr class="hover:bg-accent/50">
                                                <td class="px-4 py-3 font-medium">${t.teacherName}</td>
                                                <td class="px-4 py-3">${t.department}</td>
                                                <td class="px-4 py-3 text-center">${t.monthlyDutyCount || 0}</td>
                                                <td class="px-4 py-3 text-center">${t.completed || 0}</td>
                                                <td class="px-4 py-3 text-center">
                                                    <span class="px-2 py-1 rounded-full text-xs ${t.completionRate >= 80 ? 'bg-green-100 text-green-700' : t.completionRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
                                                        ${t.completionRate || 0}%
                                                    </span>
                                                </td>
                                                <td class="px-4 py-3 text-center">
                                                    <span class="px-2 py-1 rounded-full text-xs ${t.status === 'overworked' ? 'bg-red-100 text-red-700' : t.status === 'underworked' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
                                                        ${t.status || 'balanced'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                        ${(!workload || workload.length === 0) ? '<tr><td colspan="6" class="text-center py-8 text-muted-foreground">No data available</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        ${report?.recommendations?.length > 0 ? `
                            <div class="rounded-xl border bg-card p-6">
                                <h3 class="font-semibold mb-4">Recommendations</h3>
                                <div class="space-y-3">
                                    ${report.recommendations.map(rec => `
                                        <div class="p-3 bg-${rec.type === 'workload_balance' ? 'blue' : 'amber'}-50 dark:bg-${rec.type === 'workload_balance' ? 'blue' : 'amber'}-900/20 rounded-lg">
                                            <p class="text-sm font-medium">${rec.message}</p>
                                            ${rec.teachers ? `<p class="text-xs text-muted-foreground mt-1">Teachers: ${rec.teachers.join(', ')}</p>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
    }
};

window.fairnessReport = fairnessReport;