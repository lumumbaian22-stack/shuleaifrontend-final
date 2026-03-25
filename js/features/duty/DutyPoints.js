// js/features/duty/DutyPoints.js
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate } from '../../core/utils.js';

export const dutyPoints = {
    points: {
        teachers: {},
        areas: {
            'morning': { basePoints: 10, multiplier: 1 },
            'lunch': { basePoints: 15, multiplier: 1.5 },
            'afternoon': { basePoints: 12, multiplier: 1.2 },
            'whole_day': { basePoints: 25, multiplier: 2.5 }
        }
    },
    
    load() {
        try {
            const saved = localStorage.getItem('dutyPoints');
            if (saved) {
                this.points = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading duty points:', error);
        }
    },
    
    save() {
        localStorage.setItem('dutyPoints', JSON.stringify(this.points));
    },
    
    getTeacherPoints(teacherId) {
        return this.points.teachers[teacherId]?.points || 0;
    },
    
    addPoints(teacherId, points, reason) {
        if (!this.points.teachers[teacherId]) {
            this.points.teachers[teacherId] = {
                points: 0,
                history: [],
                preferences: {},
                rating: 0
            };
        }
        
        this.points.teachers[teacherId].points += points;
        this.points.teachers[teacherId].history.push({
            date: new Date().toISOString(),
            points: points,
            reason: reason,
            total: this.points.teachers[teacherId].points
        });
        
        this.save();
        toast.success(`Added ${points} points to teacher`);
    },
    
    updateAreaPoints(area, basePoints) {
        if (this.points.areas[area]) {
            this.points.areas[area].basePoints = basePoints;
            this.save();
            toast.success(`Updated ${area} duty points to ${basePoints}`);
        }
    },
    
    showLeaderboard(containerId, teachers) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.load();
        
        const teacherData = teachers.map(t => ({
            id: t.id,
            name: t.User?.name || 'Unknown',
            points: this.getTeacherPoints(t.id),
            dutiesCompleted: t.statistics?.dutiesCompleted || 0,
            reliability: t.statistics?.reliabilityScore || 100
        })).sort((a, b) => b.points - a.points);
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium">Teacher</th>
                            <th class="px-4 py-3 text-center font-medium">Points</th>
                            <th class="px-4 py-3 text-center font-medium">Duties Completed</th>
                            <th class="px-4 py-3 text-center font-medium">Reliability</th>
                            <th class="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${teacherData.map(t => `
                            <tr class="hover:bg-accent/50 transition-colors">
                                <td class="px-4 py-3 font-medium">${t.name}</td>
                                <td class="px-4 py-3 text-center">
                                    <span class="font-bold text-lg ${t.points >= 100 ? 'text-green-600' : t.points >= 50 ? 'text-blue-600' : 'text-gray-600'}">
                                        ${t.points}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-center">${t.dutiesCompleted}</td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex items-center justify-center gap-2">
                                        <div class="h-2 w-16 rounded-full bg-muted overflow-hidden">
                                            <div class="h-full w-[${t.reliability}%] bg-green-500 rounded-full"></div>
                                        </div>
                                        <span>${t.reliability}%</span>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <button onclick="window.dutyPoints.showHistory('${t.id}')" class="p-2 hover:bg-accent rounded-lg" title="View History">
                                        <i data-lucide="history" class="h-4 w-4"></i>
                                    </button>
                                    <button onclick="window.dutyPoints.showAddPointsModal('${t.id}', '${t.name}')" class="p-2 hover:bg-accent rounded-lg" title="Add Points">
                                        <i data-lucide="plus-circle" class="h-4 w-4 text-green-600"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    showHistory(teacherId) {
        const teacher = this.points.teachers[teacherId];
        if (!teacher || !teacher.history || teacher.history.length === 0) {
            toast.info('No history available');
            return;
        }
        
        const modal = modalManager.create('points-history-modal', 'Point History');
        modal.setContent(`
            <div class="space-y-2 max-h-96 overflow-y-auto">
                ${teacher.history.slice().reverse().map(record => `
                    <div class="p-3 border-b">
                        <div class="flex justify-between">
                            <span class="font-medium ${record.points > 0 ? 'text-green-600' : 'text-red-600'}">${record.points > 0 ? '+' : ''}${record.points} points</span>
                            <span class="text-xs text-muted-foreground">${formatDate(record.date)}</span>
                        </div>
                        <p class="text-sm text-muted-foreground mt-1">${record.reason}</p>
                        <p class="text-xs text-muted-foreground mt-1">Total: ${record.total} points</p>
                    </div>
                `).join('')}
            </div>
        `);
        modal.open();
    },
    
    showAddPointsModal(teacherId, teacherName) {
        const modal = modalManager.create('add-points-modal', `Add Points - ${teacherName}`);
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Points to Add</label>
                    <input type="number" id="points-amount" placeholder="e.g., 10" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Reason</label>
                    <input type="text" id="points-reason" placeholder="e.g., Completed extra duty" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('add-points-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dutyPoints.handleAddPoints('${teacherId}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add Points</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    handleAddPoints(teacherId) {
        const amount = parseInt(document.getElementById('points-amount')?.value);
        const reason = document.getElementById('points-reason')?.value;
        
        if (isNaN(amount)) {
            toast.error('Please enter a valid number');
            return;
        }
        
        if (!reason) {
            toast.error('Please enter a reason');
            return;
        }
        
        this.addPoints(teacherId, amount, reason);
        modalManager.close('add-points-modal');
    },
    
    showConfiguration(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.load();
        
        container.innerHTML = `
            <div class="space-y-4">
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="p-4 bg-muted/30 rounded-lg">
                        <p class="font-medium">Morning Duty</p>
                        <p class="text-sm text-muted-foreground">Base Points: <span id="morning-points">${this.points.areas.morning.basePoints}</span></p>
                        <div class="flex gap-2 mt-2">
                            <input type="number" id="morning-points-input" value="${this.points.areas.morning.basePoints}" class="flex-1 rounded-lg border border-input bg-background px-3 py-1 text-sm">
                            <button onclick="window.dutyPoints.updateArea('morning')" class="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">Update</button>
                        </div>
                    </div>
                    <div class="p-4 bg-muted/30 rounded-lg">
                        <p class="font-medium">Lunch Duty</p>
                        <p class="text-sm text-muted-foreground">Base Points: <span id="lunch-points">${this.points.areas.lunch.basePoints}</span></p>
                        <div class="flex gap-2 mt-2">
                            <input type="number" id="lunch-points-input" value="${this.points.areas.lunch.basePoints}" class="flex-1 rounded-lg border border-input bg-background px-3 py-1 text-sm">
                            <button onclick="window.dutyPoints.updateArea('lunch')" class="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">Update</button>
                        </div>
                    </div>
                    <div class="p-4 bg-muted/30 rounded-lg">
                        <p class="font-medium">Afternoon Duty</p>
                        <p class="text-sm text-muted-foreground">Base Points: <span id="afternoon-points">${this.points.areas.afternoon.basePoints}</span></p>
                        <div class="flex gap-2 mt-2">
                            <input type="number" id="afternoon-points-input" value="${this.points.areas.afternoon.basePoints}" class="flex-1 rounded-lg border border-input bg-background px-3 py-1 text-sm">
                            <button onclick="window.dutyPoints.updateArea('afternoon')" class="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">Update</button>
                        </div>
                    </div>
                    <div class="p-4 bg-muted/30 rounded-lg">
                        <p class="font-medium">Whole Day Duty</p>
                        <p class="text-sm text-muted-foreground">Base Points: <span id="whole_day-points">${this.points.areas.whole_day.basePoints}</span></p>
                        <div class="flex gap-2 mt-2">
                            <input type="number" id="whole_day-points-input" value="${this.points.areas.whole_day.basePoints}" class="flex-1 rounded-lg border border-input bg-background px-3 py-1 text-sm">
                            <button onclick="window.dutyPoints.updateArea('whole_day')" class="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">Update</button>
                        </div>
                    </div>
                </div>
                <button onclick="window.dutyPoints.resetAll()" class="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Reset All Points</button>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    updateArea(area) {
        const inputId = `${area}-points-input`;
        const newPoints = parseInt(document.getElementById(inputId)?.value);
        
        if (!newPoints || newPoints < 0) {
            toast.error('Please enter valid points');
            return;
        }
        
        this.updateAreaPoints(area, newPoints);
        
        const spanId = `${area}-points`;
        if (document.getElementById(spanId)) {
            document.getElementById(spanId).textContent = newPoints;
        }
    },
    
    resetAll() {
        if (!confirm('⚠️ Are you sure you want to reset ALL duty points for ALL teachers? This action cannot be undone.')) return;
        
        this.points.teachers = {};
        this.save();
        toast.info('All duty points have been reset');
        
        if (window.dashboard && window.dashboard.refreshDutyPoints) {
            window.dashboard.refreshDutyPoints();
        }
    }
};

// Auto-load on page load
document.addEventListener('DOMContentLoaded', () => {
    dutyPoints.load();
});

window.dutyPoints = dutyPoints;