// js/features/duty/DutyRoster.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate } from '../../core/utils.js';

export const dutyRoster = {
    async generate(startDate, endDate) {
        if (!startDate || !endDate) {
            toast.error('Please select start and end dates');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/admin/duty/generate', { startDate, endDate });
            
            if (response.success) {
                toast.success(`✅ Generated ${response.data.rosters?.length || 0} rosters`);
                
                if (response.data.understaffed?.length > 0) {
                    toast.warning(`⚠️ ${response.data.understaffed.length} understaffed slots detected`);
                }
                
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to generate roster');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async getFairnessReport() {
        try {
            const response = await apiClient.get('/api/admin/duty/fairness-report');
            return response.data;
        } catch (error) {
            console.error('Failed to load fairness report:', error);
            return null;
        }
    },
    
    async getTeacherWorkload() {
        try {
            const response = await apiClient.get('/api/admin/duty/teacher-workload');
            return response.data || [];
        } catch (error) {
            console.error('Failed to load teacher workload:', error);
            return [];
        }
    },
    
    async getUnderstaffedAreas() {
        try {
            const response = await apiClient.get('/api/admin/duty/understaffed');
            return response.data || [];
        } catch (error) {
            console.error('Failed to load understaffed areas:', error);
            return [];
        }
    },
    
    showFairnessReport(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.getFairnessReport().then(report => {
            if (!report) {
                container.innerHTML = '<div class="p-8 text-center text-red-500">Failed to load report</div>';
                return;
            }
            
            container.innerHTML = `
                <div class="space-y-6">
                    <div class="grid gap-4 md:grid-cols-3">
                        <div class="rounded-xl border bg-card p-6">
                            <p class="text-sm text-muted-foreground">Fairness Score</p>
                            <div class="flex items-end gap-2">
                                <h3 class="text-3xl font-bold">${report.summary?.fairnessScore || 0}%</h3>
                                <span class="text-sm text-muted-foreground mb-1">/ 100</span>
                            </div>
                        </div>
                        <div class="rounded-xl border bg-card p-6">
                            <p class="text-sm text-muted-foreground">Total Duties</p>
                            <h3 class="text-3xl font-bold">${report.summary?.totalDuties || 0}</h3>
                        </div>
                        <div class="rounded-xl border bg-card p-6">
                            <p class="text-sm text-muted-foreground">Teachers</p>
                            <h3 class="text-3xl font-bold">${report.teacherStats?.length || 0}</h3>
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
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    ${(report.teacherStats || []).map(t => `
                                        <tr class="hover:bg-accent/50">
                                            <td class="px-4 py-3 font-medium">${t.teacherName}</td>
                                            <td class="px-4 py-3">${t.department}</td>
                                            <td class="px-4 py-3 text-center">${t.scheduled}</td>
                                            <td class="px-4 py-3 text-center">${t.completed}</td>
                                            <td class="px-4 py-3 text-center">
                                                <span class="px-2 py-1 rounded-full text-xs ${t.completionRate >= 80 ? 'bg-green-100 text-green-700' : t.completionRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
                                                    ${t.completionRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${(!report.teacherStats || report.teacherStats.length === 0) ? '<tr><td colspan="5" class="text-center py-8 text-muted-foreground">No data available</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }
};

window.dutyRoster = dutyRoster;