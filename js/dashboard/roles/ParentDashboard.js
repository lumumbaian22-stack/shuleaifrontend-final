// js/dashboard/roles/ParentDashboard.js

// ================= FIXED IMPORT =================
// Remove the duplicate import and use only one (default export assumed)
import BaseDashboard from '../base/BaseDashboard.js'; // ✅ FIXED: single import of BaseDashboard

import { parentAPI } from '../../api/parent.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { ChartRenderer } from '../base/ChartRenderer.js';
import { StatsRenderer } from '../base/StatsRenderer.js';
import { TableRenderer } from '../base/TableRenderer.js';
import { formatDate, timeAgo, getInitials, formatCurrency } from '../../core/utils.js';

export class ParentDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.children = [];
        this.selectedChildId = null;
        this.selectedChild = null;
        this.payments = [];
        this.messages = [];
        this.plans = [];
        this.school = null;
    }

    async loadData() {
        console.log('📊 Loading parent dashboard data...');
        
        try {
            const [childrenRes, paymentsRes, plansRes, schoolRes] = await Promise.all([
                parentAPI.getChildren().catch(() => ({ data: [] })),
                parentAPI.getPayments().catch(() => ({ data: [] })),
                parentAPI.getSubscriptionPlans().catch(() => ({ data: [] })),
                parentAPI.getSchoolInfo().catch(() => ({ data: null }))
            ]);
            
            this.children = childrenRes.data || [];
            this.payments = paymentsRes.data?.payments || [];
            this.plans = plansRes.data || [];
            this.school = schoolRes.data || store.getState('school');
            
            if (this.children.length > 0 && !this.selectedChildId) {
                this.selectedChildId = this.children[0]?.id;
                await this.loadChildSummary();
            }
            
            this.data = {
                children: this.children,
                selectedChild: this.selectedChild,
                payments: this.payments,
                plans: this.plans
            };
            
            this.stats = {
                attendanceRate: this.selectedChild?.recentAttendance?.length > 0 
                    ? Math.round((this.selectedChild.recentAttendance.filter(a => a.status === 'present').length / this.selectedChild.recentAttendance.length) * 100)
                    : 0,
                averageScore: this.selectedChild?.averageScore || 0,
                homeworkCount: this.selectedChild?.pendingHomework || 0,
                feeBalance: this.selectedChild?.outstandingFees?.balance || 0
            };
            
        } catch (error) {
            console.error('Failed to load parent data:', error);
            this.showError('Failed to load dashboard data');
            throw error;
        }
    }
    
    async loadChildSummary() {
        if (!this.selectedChildId) return;
        
        try {
            const summaryRes = await parentAPI.getChildSummary(this.selectedChildId);
            this.selectedChild = summaryRes.data;
            
            this.stats = {
                attendanceRate: this.selectedChild?.recentAttendance?.length > 0 
                    ? Math.round((this.selectedChild.recentAttendance.filter(a => a.status === 'present').length / this.selectedChild.recentAttendance.length) * 100)
                    : 0,
                averageScore: this.selectedChild?.averageScore || 0,
                homeworkCount: this.selectedChild?.pendingHomework || 0,
                feeBalance: this.selectedChild?.outstandingFees?.balance || 0
            };
            
        } catch (error) {
            console.error('Failed to load child summary:', error);
            this.showError('Failed to load child data');
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                ${this.renderChildSelector()}
                <div id="stats-container" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
                
                ${this.selectedChild ? `
                    <div class="grid gap-4 lg:grid-cols-2">
                        <div class="rounded-xl border bg-card p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="font-semibold">Class Teacher</h3>
                                <button onclick="window.dashboard?.messageTeacher()" class="text-xs text-primary hover:underline">Message Teacher</button>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <i data-lucide="user" class="h-6 w-6 text-primary"></i>
                                </div>
                                <div>
                                    <p class="font-medium">${this.selectedChild?.classTeacher?.name || 'Not Assigned'}</p>
                                    <p class="text-xs text-muted-foreground">${this.selectedChild?.classTeacher?.email || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div class="rounded-xl border bg-card p-6">
                            <h3 class="font-semibold mb-4">Quick Actions</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="window.dashboard?.showReportAbsence()" class="p-3 border rounded-lg hover:bg-accent transition-colors text-center">
                                    <i data-lucide="calendar-x" class="h-5 w-5 mx-auto text-red-500 mb-1"></i>
                                    <span class="text-xs">Report Absence</span>
                                </button>
                                <button onclick="window.dashboard?.showMakePayment()" class="p-3 border rounded-lg hover:bg-accent transition-colors text-center">
                                    <i data-lucide="credit-card" class="h-5 w-5 mx-auto text-green-500 mb-1"></i>
                                    <span class="text-xs">Make Payment</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold">Academic Progress</h3>
                            <select id="term-select" class="text-xs border rounded px-2 py-1 bg-background">
                                <option value="term1">Term 1</option>
                                <option value="term2">Term 2</option>
                                <option value="term3">Term 3</option>
                            </select>
                        </div>
                        <div class="chart-container h-64" id="grade-chart-container"></div>
                    </div>

                    ${this.renderGradesTable()}
                    ${this.renderAttendanceHistory()}
                    ${this.renderPaymentsSection()}
                    ${this.renderMessageSection()}
                ` : `
                    <div class="rounded-xl border bg-card p-12 text-center">
                        <i data-lucide="users" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                        <p class="text-muted-foreground">No children linked to your account</p>
                        <p class="text-sm text-muted-foreground mt-1">Please contact the school to link your child</p>
                    </div>
                `}
            </div>
        `;

        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) StatsRenderer.render(statsContainer, this.stats, 'parent');
        
        if (this.selectedChild) this.renderGradeChart();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ====================== Other methods remain unchanged ======================
}

window.ParentDashboard = ParentDashboard;
