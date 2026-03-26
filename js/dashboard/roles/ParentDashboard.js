// js/dashboard/roles/ParentDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, formatDate, timeAgo } from '../../core/utils.js';

export class ParentDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.children = [];
        this.selectedChildId = null;
        this.childSummary = null;
        this.payments = [];
        this.plans = [];
    }

    async loadData() {
        console.log('📊 Loading parent dashboard data...');
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            // Get children
            const childrenRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/children', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (childrenRes.ok) {
                const data = await childrenRes.json();
                this.children = data.data || [];
                if (this.children.length > 0 && !this.selectedChildId) {
                    this.selectedChildId = this.children[0].id;
                }
            }

            // If we have a selected child, get summary
            if (this.selectedChildId) {
                const summaryRes = await fetch(`https://shuleaibackend-32h1.onrender.com/api/parent/child/${this.selectedChildId}/summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (summaryRes.ok) {
                    const summaryData = await summaryRes.json();
                    this.childSummary = summaryData.data;
                }
            }

            // Get payment history
            const paymentsRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (paymentsRes.ok) {
                const data = await paymentsRes.json();
                this.payments = data.data?.payments || [];
            }

            // Get subscription plans
            const plansRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/plans', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (plansRes.ok) {
                const data = await plansRes.json();
                this.plans = data.data || [];
            }
        } catch (error) {
            console.error('Error loading parent data:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Child Selector -->
                <div class="flex gap-2 border-b pb-4 overflow-x-auto" id="child-selector">
                    ${this.children.map(child => `
                        <button onclick="window.selectChild('${child.id}')" class="child-selector-btn px-4 py-2 ${child.id === this.selectedChildId ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg">
                            ${escapeHtml(child.User?.name) || 'Child'} (Grade ${child.grade})
                        </button>
                    `).join('')}
                    ${this.children.length === 0 ? '<p class="text-muted-foreground">No children linked to your account</p>' : ''}
                </div>
                
                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Attendance</p>
                                <h3 class="text-2xl font-bold mt-1" id="attendance-percentage">95%</h3>
                                <p class="text-xs text-green-600 mt-1">This term</p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i data-lucide="calendar-check" class="h-6 w-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Class Average</p>
                                <h3 class="text-2xl font-bold mt-1" id="child-average">0%</h3>
                                <p class="text-xs text-green-600 mt-1" id="average-comparison">Above average</p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <i data-lucide="trending-up" class="h-6 w-6 text-violet-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Homework</p>
                                <h3 class="text-2xl font-bold mt-1" id="homework-count">0</h3>
                                <p class="text-xs text-yellow-600 mt-1" id="homework-status">Pending</p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <i data-lucide="book-open" class="h-6 w-6 text-amber-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Fee Balance</p>
                                <h3 class="text-2xl font-bold mt-1" id="fee-balance">$0</h3>
                                <p class="text-xs text-red-600 mt-1" id="fee-due">Due in 5 days</p>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <i data-lucide="credit-card" class="h-6 w-6 text-red-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Live Attendance & Payment Plans -->
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold">Live Attendance</h3>
                            <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full" id="today-status">Present Today</span>
                        </div>
                        <div id="live-attendance">
                            <p class="text-3xl font-bold">Checked in at 7:45 AM</p>
                            <p class="text-sm text-muted-foreground mt-1" id="checkin-gate">Gate: Main Entrance</p>
                        </div>
                        <div class="mt-6">
                            <h4 class="text-sm font-medium mb-2">This Week</h4>
                            <div class="flex gap-1" id="weekly-attendance">
                                <div class="flex-1 h-2 bg-green-500 rounded"></div>
                                <div class="flex-1 h-2 bg-green-500 rounded"></div>
                                <div class="flex-1 h-2 bg-green-500 rounded"></div>
                                <div class="flex-1 h-2 bg-green-500 rounded"></div>
                                <div class="flex-1 h-2 bg-gray-300 rounded"></div>
                            </div>
                            <div class="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Subscription Plans</h3>
                        <div class="space-y-3" id="subscription-plans">
                            ${this.plans.map(plan => `
                                <div class="p-3 border rounded-lg flex justify-between items-center hover:bg-accent/50 transition-colors">
                                    <div>
                                        <p class="font-medium">${plan.name}</p>
                                        <p class="text-xs text-muted-foreground">${plan.features?.slice(0,1)[0] || ''}</p>
                                    </div>
                                    <button onclick="window.upgradePlan('${plan.id}')" class="upgrade-btn px-3 py-1 bg-primary text-primary-foreground text-xs rounded-lg">Upgrade</button>
                                </div>
                            `).join('')}
                            ${this.plans.length === 0 ? '<p class="text-center text-muted-foreground">No plans available</p>' : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Grade Chart -->
                <div class="rounded-xl border bg-card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold">Academic Progress</h3>
                        <select class="text-sm border rounded-md px-2 py-1 bg-background" onchange="window.updateParentChart(this.value)" id="term-select">
                            <option value="term1">Term 1</option>
                            <option value="term2">Term 2</option>
                            <option value="term3">Term 3</option>
                        </select>
                    </div>
                    <div class="chart-container h-64">
                        <canvas id="parent-gradeChart"></canvas>
                    </div>
                </div>
                
                <!-- Recent Grades Table -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b">
                        <h3 class="font-semibold">Recent Grades</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr><th class="px-4 py-3 text-left font-medium">Subject</th><th class="px-4 py-3 text-left font-medium">Score</th><th class="px-4 py-3 text-left font-medium">Grade</th><th class="px-4 py-3 text-left font-medium">Teacher</th><th class="px-4 py-3 text-left font-medium">Date</th></tr>
                            </thead>
                            <tbody class="divide-y" id="grades-table-body">
                                <tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No grades available</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Communication -->
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Message Teachers</h3>
                        <select id="teacher-select" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mb-3">
                            <option value="">Select Teacher</option>
                            <option value="1">Mr. Kamau (Mathematics)</option>
                            <option value="2">Ms. Atieno (English)</option>
                        </select>
                        <textarea id="message-content" rows="3" placeholder="Type your message..." class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
                        <button onclick="window.sendMessageToTeacher()" class="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-lg">Send Message</button>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Recent Messages</h3>
                        <div class="space-y-3" id="recent-messages">
                            <div class="p-2 bg-muted/30 rounded">
                                <p class="text-xs font-medium">Mr. Kamau</p>
                                <p class="text-xs text-muted-foreground truncate">Sarah is doing well in...</p>
                                <p class="text-xs text-muted-foreground">2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Duty Roster (Public View) -->
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4">Today's Duty Teachers</h3>
                    <div class="grid gap-3 md:grid-cols-3" id="public-duty-roster">
                        <div class="p-3 bg-muted/30 rounded text-center"><p class="font-medium">Main Gate</p><p class="text-sm">Mr. Kamau</p><p class="text-xs text-muted-foreground">7:30-10:30</p></div>
                        <div class="p-3 bg-muted/30 rounded text-center"><p class="font-medium">Dining Hall</p><p class="text-sm">Ms. Atieno</p><p class="text-xs text-muted-foreground">10:30-13:30</p></div>
                        <div class="p-3 bg-muted/30 rounded text-center"><p class="font-medium">Library</p><p class="text-sm">Mr. Omondi</p><p class="text-xs text-muted-foreground">13:30-16:30</p></div>
                    </div>
                </div>
            </div>
        `;

        // After rendering, populate data
        this.updateStats();
        this.updateGradesTable();
        this.renderChart();
    }

    updateStats() {
        if (!this.childSummary) return;
        const attendanceRate = this.childSummary.recentAttendance?.length
            ? Math.round((this.childSummary.recentAttendance.filter(a => a.status === 'present').length / this.childSummary.recentAttendance.length) * 100)
            : 0;
        const avgScore = this.childSummary.averageScore || 0;
        const homeworkCount = this.childSummary.pendingHomework || 0;
        const feeBalance = this.childSummary.outstandingFees?.balance || 0;

        document.getElementById('attendance-percentage').textContent = attendanceRate + '%';
        document.getElementById('child-average').textContent = avgScore + '%';
        document.getElementById('homework-count').textContent = homeworkCount;
        document.getElementById('fee-balance').textContent = '$' + feeBalance;
    }

    updateGradesTable() {
        const records = this.childSummary?.recentRecords || [];
        const tbody = document.getElementById('grades-table-body');
        if (!tbody) return;
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No grades available</td></tr>';
            return;
        }
        let html = '';
        records.forEach(record => {
            const gradeClass = record.score >= 80 ? 'bg-green-100 text-green-700' :
                              record.score >= 60 ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700';
            html += `
                <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3">${escapeHtml(record.subject || 'N/A')}</td>
                    <td class="px-4 py-3">${record.score || 0}%</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 ${gradeClass} text-xs rounded-full">${record.grade || 'N/A'}</span></td>
                    <td class="px-4 py-3">${escapeHtml(record.teacherName || 'N/A')}</td>
                    <td class="px-4 py-3">${formatDate(record.date)}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    renderChart() {
        const records = this.childSummary?.recentRecords || [];
        const ctx = document.getElementById('parent-gradeChart');
        if (!ctx) return;
        if (window.parentChart) window.parentChart.destroy();
        if (!records.length) return;
        window.parentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: records.map(r => formatDate(r.date)),
                datasets: [{
                    label: 'Performance',
                    data: records.map(r => r.score || 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    showSection(section) {
        if (section === 'dashboard') this.refresh();
        else if (section === 'progress') alert('Progress section coming soon');
        else if (section === 'payments') alert('Payments section coming soon');
        else if (section === 'chat') alert('Chat section coming soon');
    }

    async refresh() {
        await this.loadData();
        this.render();
    }
}

// Global functions for parent
window.selectChild = async (childId) => {
    if (window.dashboard && window.dashboard.selectedChildId !== childId) {
        window.dashboard.selectedChildId = childId;
        await window.dashboard.loadData();
        window.dashboard.render();
    }
};
window.upgradePlan = async (planId) => {
    const token = localStorage.getItem('authToken');
    if (!window.dashboard || !window.dashboard.selectedChildId) {
        alert('Please select a child first');
        return;
    }
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/upgrade-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ studentId: window.dashboard.selectedChildId, newPlan: planId })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Upgrade to ${planId} plan initiated`);
            if (window.dashboard) window.dashboard.refresh();
        } else {
            alert(data.message || 'Upgrade failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
window.updateParentChart = (value) => {
    if (window.dashboard) window.dashboard.renderChart();
};
window.sendMessageToTeacher = async () => {
    const teacherId = document.getElementById('teacher-select')?.value;
    const message = document.getElementById('message-content')?.value;
    if (!teacherId || !message) {
        alert('Please select a teacher and enter a message');
        return;
    }
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ studentId: window.dashboard?.selectedChildId, message, recipientType: 'teacher' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Message sent successfully');
            document.getElementById('message-content').value = '';
        } else {
            alert(data.message || 'Failed to send message');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
