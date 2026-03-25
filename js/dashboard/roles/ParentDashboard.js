// js/dashboard/roles/ParentDashboard.js

import BaseDashboard from '../BaseDashboard.js';

import { BaseDashboard } from '../base/BaseDashboard.js';
import { parentAPI } from '../../api/parent.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { ChartRenderer } from '../base/ChartRenderer.js';
import { StatsRenderer } from '../base/StatsRenderer.js';
import { TableRenderer } from '../base/TableRenderer.js';
import { formatDate, timeAgo, getInitials, formatCurrency } from '../../core/utils.js';

class ParentDashboard extends BaseDashboard {
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
            
            // Select first child if none selected
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
            
            // Update stats with new child data
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
        
        // Render stats
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            StatsRenderer.render(statsContainer, this.stats, 'parent');
        }
        
        // Render chart
        if (this.selectedChild) {
            this.renderGradeChart();
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    renderChildSelector() {
        if (!this.children || this.children.length === 0) {
            return '';
        }
        
        return `
            <div class="flex gap-2 border-b pb-4 overflow-x-auto" id="child-selector">
                ${this.children.map(child => `
                    <button onclick="window.dashboard?.selectChild('${child.id}')" 
                            class="child-selector-btn px-4 py-2 rounded-lg transition-all ${child.id === this.selectedChildId ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}">
                        ${child.User?.name || 'Unknown'} (Grade ${child.grade || 'N/A'})
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    renderGradesTable() {
        const records = this.selectedChild?.recentRecords || [];
        
        if (records.length === 0) {
            return `
                <div class="rounded-xl border bg-card p-8 text-center">
                    <i data-lucide="trending-up" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground">No grade records available</p>
                </div>
            `;
        }
        
        const config = {
            columns: [
                { key: 'subject', label: 'Subject', align: 'left', dataLabel: 'Subject' },
                { key: 'assessmentName', label: 'Assessment', align: 'left', dataLabel: 'Assessment', render: (val) => val || '-' },
                { key: 'score', label: 'Score', align: 'center', dataLabel: 'Score', render: (val) => `${val || 0}%` },
                { key: 'grade', label: 'Grade', align: 'center', dataLabel: 'Grade', render: (val) => {
                    const gradeClass = val === 'A' || val === 'A-' ? 'bg-green-100 text-green-700' :
                                       val === 'B+' || val === 'B' || val === 'B-' ? 'bg-blue-100 text-blue-700' :
                                       val === 'C+' || val === 'C' || val === 'C-' ? 'bg-yellow-100 text-yellow-700' :
                                       'bg-red-100 text-red-700';
                    return `<span class="px-2 py-1 ${gradeClass} text-xs rounded-full">${val || 'N/A'}</span>`;
                } },
                { key: 'date', label: 'Date', align: 'left', dataLabel: 'Date', render: (val) => formatDate(val) }
            ],
            data: records.slice(0, 10),
            emptyMessage: 'No grades available'
        };
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-semibold">Recent Grades</h3>
                </div>
                <div id="grades-table-container"></div>
            </div>
        `;
    }
    
    renderAttendanceHistory() {
        const attendance = this.selectedChild?.recentAttendance || [];
        
        if (attendance.length === 0) {
            return '';
        }
        
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const absentCount = attendance.filter(a => a.status === 'absent').length;
        const lateCount = attendance.filter(a => a.status === 'late').length;
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-semibold">Attendance History</h3>
                </div>
                <div class="p-4">
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p class="text-2xl font-bold text-green-600">${presentCount}</p>
                            <p class="text-xs text-muted-foreground">Present</p>
                        </div>
                        <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p class="text-2xl font-bold text-red-600">${absentCount}</p>
                            <p class="text-xs text-muted-foreground">Absent</p>
                        </div>
                        <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p class="text-2xl font-bold text-yellow-600">${lateCount}</p>
                            <p class="text-xs text-muted-foreground">Late</p>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-2 text-left">Date</th>
                                    <th class="px-4 py-2 text-left">Status</th>
                                    <th class="px-4 py-2 text-left">Reason</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                ${attendance.slice(0, 10).map(record => `
                                    <tr class="hover:bg-accent/50">
                                        <td class="px-4 py-2">${formatDate(record.date)}</td>
                                        <td class="px-4 py-2">
                                            <span class="px-2 py-1 ${record.status === 'present' ? 'bg-green-100 text-green-700' : record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} text-xs rounded-full">
                                                ${record.status}
                                            </span>
                                        </td>
                                        <td class="px-4 py-2">${record.reason || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPaymentsSection() {
        const balance = this.selectedChild?.outstandingFees?.balance || 0;
        
        return `
            <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4 flex items-center gap-2">
                        <i data-lucide="credit-card" class="h-5 w-5 text-primary"></i>
                        Fee Balance
                    </h3>
                    <p class="text-3xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}">${formatCurrency(balance)}</p>
                    <button onclick="window.dashboard?.showMakePayment()" class="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
                        Make Payment
                    </button>
                </div>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4 flex items-center gap-2">
                        <i data-lucide="calendar" class="h-5 w-5 text-primary"></i>
                        Subscription Plan
                    </h3>
                    <p class="text-lg font-medium">${this.selectedChild?.subscriptionPlan || 'Basic'}</p>
                    <p class="text-sm text-muted-foreground mt-1">${this.selectedChild?.subscriptionStatus === 'active' ? 'Active until ' + formatDate(this.selectedChild?.subscriptionExpiry) : 'No active subscription'}</p>
                    <button onclick="window.dashboard?.showUpgradePlan()" class="mt-4 w-full border rounded-lg py-2 hover:bg-accent">
                        Upgrade Plan
                    </button>
                </div>
            </div>
        `;
    }
    
    renderMessageSection() {
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold flex items-center gap-2">
                        <i data-lucide="message-circle" class="h-5 w-5 text-primary"></i>
                        Messages
                    </h3>
                    <button onclick="window.dashboard?.showMessageTeacher()" class="text-sm text-primary hover:underline">New Message</button>
                </div>
                <div id="messages-container" class="divide-y">
                    <div class="p-8 text-center text-muted-foreground">
                        <i data-lucide="message-circle" class="h-12 w-12 mx-auto mb-3 opacity-50"></i>
                        <p>No messages yet</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderGradeChart() {
        const container = document.getElementById('grade-chart-container');
        if (!container) return;
        
        const records = this.selectedChild?.recentRecords || [];
        const term = document.getElementById('term-select')?.value || 'term1';
        
        // Filter records by term (simplified - would come from API)
        const chartData = {
            labels: records.map(r => r.subject),
            values: records.map(r => r.score || 0)
        };
        
        if (this.charts.grade) {
            ChartRenderer.destroy(this.charts.grade);
        }
        
        this.charts.grade = ChartRenderer.render(container, chartData, 'bar');
    }
    
    // ============ Action Methods ============
    
    async selectChild(childId) {
        if (this.selectedChildId === childId) return;
        
        this.selectedChildId = childId;
        await this.loadChildSummary();
        
        // Update UI
        document.querySelectorAll('.child-selector-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-primary-foreground');
            btn.classList.add('bg-muted');
        });
        
        const selectedBtn = Array.from(document.querySelectorAll('.child-selector-btn'))
            .find(btn => btn.getAttribute('onclick')?.includes(childId));
        
        if (selectedBtn) {
            selectedBtn.classList.remove('bg-muted');
            selectedBtn.classList.add('bg-primary', 'text-primary-foreground');
        }
        
        await this.refresh();
    }
    
    showReportAbsence() {
        const modal = modalManager.create('report-absence-modal', 'Report Absence');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Date</label>
                    <input type="date" id="absence-date" value="${new Date().toISOString().split('T')[0]}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Reason</label>
                    <textarea id="absence-reason" rows="3" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Why will your child be absent?"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('report-absence-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.submitAbsenceReport()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Submit Report</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async submitAbsenceReport() {
        const date = document.getElementById('absence-date')?.value;
        const reason = document.getElementById('absence-reason')?.value;
        
        if (!date || !reason) {
            toast.error('Please select date and enter reason');
            return;
        }
        
        toast.loading(true);
        try {
            await parentAPI.reportAbsence({
                studentId: parseInt(this.selectedChildId),
                date: date,
                reason: reason
            });
            toast.success('✅ Absence reported and class teacher notified');
            modalManager.close('report-absence-modal');
        } catch (error) {
            toast.error(error.message || 'Failed to report absence');
        } finally {
            toast.loading(false);
        }
    }
    
    showMakePayment() {
        const modal = modalManager.create('make-payment-modal', 'Make Payment');
        modal.setContent(`
            <div class="space-y-4">
                <div class="bg-muted/30 p-3 rounded-lg">
                    <p class="text-xs text-muted-foreground">School Account</p>
                    <p class="font-medium">${this.school?.name || 'Your School'}</p>
                    ${this.school?.bankDetails ? `
                        <p class="text-xs mt-2">Bank: ${this.school.bankDetails.bankName || 'N/A'}</p>
                        <p class="text-xs">Account: ${this.school.bankDetails.accountNumber || 'N/A'}</p>
                    ` : ''}
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Select Plan</label>
                    <select id="payment-plan" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select Plan</option>
                        ${this.plans.map(plan => `
                            <option value="${plan.id}">${plan.name} - ${formatCurrency(plan.price)}/mo</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Amount</label>
                    <input type="number" id="payment-amount" placeholder="Amount" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Payment Method</label>
                    <select id="payment-method" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Credit Card</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('make-payment-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.processPayment()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Pay Now</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async processPayment() {
        const plan = document.getElementById('payment-plan')?.value;
        const amount = document.getElementById('payment-amount')?.value;
        const method = document.getElementById('payment-method')?.value;
        
        if (!plan || !amount || !method) {
            toast.error('Please fill all fields');
            return;
        }
        
        toast.loading(true);
        try {
            const response = await parentAPI.makePayment({
                studentId: parseInt(this.selectedChildId),
                amount: parseFloat(amount),
                method: method,
                plan: plan,
                reference: `PAY-${Date.now()}`
            });
            
            toast.success('✅ Payment initiated');
            modalManager.close('make-payment-modal');
            
            // Show payment instructions
            if (response.data?.school) {
                alert(`Payment Instructions:
School: ${response.data.school.name}
Bank: ${response.data.school.bankDetails?.bankName || 'N/A'}
Account: ${response.data.school.bankDetails?.accountNumber || 'N/A'}
Amount: ${formatCurrency(amount)}
                
Please complete the payment and the school will confirm.`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to process payment');
        } finally {
            toast.loading(false);
        }
    }
    
    showUpgradePlan() {
        const modal = modalManager.create('upgrade-plan-modal', 'Upgrade Plan');
        modal.setContent(`
            <div class="space-y-4">
                <p class="text-sm text-muted-foreground">Select a plan to upgrade your child's access</p>
                ${this.plans.map(plan => `
                    <div class="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer" onclick="window.dashboard?.selectPlan('${plan.id}')">
                        <div class="flex justify-between items-center mb-2">
                            <p class="font-semibold">${plan.name}</p>
                            <p class="text-lg font-bold text-primary">${formatCurrency(plan.price)}<span class="text-xs font-normal text-muted-foreground">/mo</span></p>
                        </div>
                        <ul class="space-y-1">
                            ${plan.features.map(feature => `
                                <li class="text-xs flex items-center gap-1">
                                    <i data-lucide="check" class="h-3 w-3 text-green-600"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('upgrade-plan-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async selectPlan(planId) {
        toast.loading(true);
        try {
            await parentAPI.upgradePlan({
                studentId: parseInt(this.selectedChildId),
                newPlan: planId
            });
            toast.success(`✅ Upgrade to ${planId} plan initiated`);
            modalManager.close('upgrade-plan-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to upgrade plan');
        } finally {
            toast.loading(false);
        }
    }
    
    showMessageTeacher() {
        const modal = modalManager.create('message-teacher-modal', 'Message Teacher');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Recipient</label>
                    <select id="message-recipient" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="teacher">Class Teacher: ${this.selectedChild?.classTeacher?.name || 'Not Assigned'}</option>
                        <option value="admin">School Administrator</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Message</label>
                    <textarea id="message-content" rows="5" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Type your message..."></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('message-teacher-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.sendMessage()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Send Message</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async sendMessage() {
        const recipientType = document.getElementById('message-recipient')?.value;
        const message = document.getElementById('message-content')?.value.trim();
        
        if (!message) {
            toast.error('Please enter a message');
            return;
        }
        
        toast.loading(true);
        try {
            await parentAPI.sendMessage({
                studentId: parseInt(this.selectedChildId),
                message: message,
                recipientType: recipientType
            });
            toast.success('✅ Message sent to class teacher');
            modalManager.close('message-teacher-modal');
        } catch (error) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            toast.loading(false);
        }
    }
    
    messageTeacher() {
        this.showMessageTeacher();
    }
    
    async loadMessages() {
        try {
            const response = await parentAPI.getConversations();
            const messages = response.data || [];
            const container = document.getElementById('messages-container');
            
            if (!container) return;
            
            if (messages.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center text-muted-foreground">
                        <i data-lucide="message-circle" class="h-12 w-12 mx-auto mb-3 opacity-50"></i>
                        <p>No messages yet</p>
                    </div>
                `;
            } else {
                container.innerHTML = messages.map(msg => `
                    <div class="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onclick="window.dashboard?.openConversation('${msg.userId}')">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-medium">${msg.userName || 'Teacher'}</p>
                                <p class="text-xs text-muted-foreground">${msg.userRole === 'teacher' ? 'Class Teacher' : 'Admin'}</p>
                                <p class="text-sm mt-1 text-muted-foreground truncate">${msg.lastMessage || ''}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-muted-foreground">${timeAgo(msg.lastMessageTime)}</p>
                                ${msg.unreadCount > 0 ? 
                                    `<span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">${msg.unreadCount}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }
    
    openConversation(userId) {
        toast.info('Opening conversation...');
    }
    
    refreshChart() {
        this.renderGradeChart();
    }
    
    setupRealtimeSubscriptions() {
        if (!window.realtime) return;
        
        window.realtime.on('attendance-updated', () => this.refresh());
        window.realtime.on('grades-updated', () => this.refresh());
        window.realtime.on('new-message', () => this.loadMessages());
    }
    
    attachEventListeners() {
        const termSelect = document.getElementById('term-select');
        if (termSelect) {
            termSelect.addEventListener('change', () => this.refreshChart());
        }
        
        // Load messages after render
        setTimeout(() => this.loadMessages(), 500);
    }
}

window.ParentDashboard = ParentDashboard;
