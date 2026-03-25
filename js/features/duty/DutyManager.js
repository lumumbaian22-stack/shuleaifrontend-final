// js/features/duty/DutyManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate } from '../../core/utils.js';

export const dutyManager = {
    todayDuty: null,
    weeklyDuty: [],
    
    async loadTodayDuty() {
        try {
            const response = await apiClient.get('/api/duty/today');
            this.todayDuty = response.data;
            return this.todayDuty;
        } catch (error) {
            console.error('Failed to load today duty:', error);
            return null;
        }
    },
    
    async loadWeeklyDuty() {
        try {
            const response = await apiClient.get('/api/duty/week');
            this.weeklyDuty = response.data || [];
            return this.weeklyDuty;
        } catch (error) {
            console.error('Failed to load weekly duty:', error);
            return [];
        }
    },
    
    async checkIn(location = 'School Gate', notes = '') {
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/duty/check-in', { location, notes });
            
            if (response.success) {
                toast.success('✅ Checked in successfully');
                await this.loadTodayDuty();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to check in');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async checkOut(location = 'School Gate', notes = '') {
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/duty/check-out', { location, notes });
            
            if (response.success) {
                toast.success('✅ Checked out successfully');
                await this.loadTodayDuty();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to check out');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async requestSwap(dutyDate, reason, targetTeacherId = null) {
        if (!dutyDate || !reason) {
            toast.error('Please select date and enter reason');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/duty/request-swap', { dutyDate, reason, targetTeacherId });
            
            if (response.success) {
                toast.success('✅ Swap request sent to admin');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to request swap');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async updatePreferences(preferences) {
        toast.loading(true);
        
        try {
            const response = await apiClient.put('/api/duty/preferences', preferences);
            
            if (response.success) {
                toast.success('✅ Preferences updated');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update preferences');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showDutyCard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.loadTodayDuty().then(() => {
            const user = window.store?.getState('user');
            const duty = this.todayDuty?.duties?.find(d => d.teacherId === user?.id);
            const hasDuty = duty !== undefined;
            const dutyArea = duty?.area || 'No duty today';
            const dutyStatus = duty?.checkedIn ? 'Checked In' : duty?.checkedOut ? 'Checked Out' : 'Not Checked In';
            const statusClass = duty?.checkedIn ? 'bg-green-100 text-green-700' : 
                               duty?.checkedOut ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700';
            
            container.innerHTML = `
                <div class="rounded-xl border bg-card p-6" id="duty-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold">Today's Duty</h3>
                            <p class="text-sm text-muted-foreground" id="duty-location">${dutyArea}</p>
                            ${duty?.timeSlot ? `<p class="text-xs text-muted-foreground mt-1">${duty.timeSlot.start} - ${duty.timeSlot.end}</p>` : ''}
                        </div>
                        <span class="duty-status px-2 py-1 ${statusClass} text-xs rounded-full" id="duty-status">${dutyStatus}</span>
                    </div>
                    <div class="mt-4 flex gap-3">
                        <button onclick="window.dutyManager.handleCheckIn()" class="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 ${hasDuty && !duty?.checkedIn && !duty?.checkedOut ? '' : 'opacity-50 cursor-not-allowed'}" 
                                id="check-in-btn" ${hasDuty && !duty?.checkedIn && !duty?.checkedOut ? '' : 'disabled'}>
                            <i data-lucide="log-in" class="inline h-4 w-4 mr-2"></i>
                            Check In
                        </button>
                        <button onclick="window.dutyManager.handleCheckOut()" class="flex-1 border border-input bg-background py-2 rounded-lg hover:bg-accent ${hasDuty && duty?.checkedIn && !duty?.checkedOut ? '' : 'opacity-50 cursor-not-allowed'}" 
                                id="check-out-btn" ${hasDuty && duty?.checkedIn && !duty?.checkedOut ? '' : 'disabled'}>
                            <i data-lucide="log-out" class="inline h-4 w-4 mr-2"></i>
                            Check Out
                        </button>
                    </div>
                    ${hasDuty ? `
                        <div class="mt-3 flex justify-between">
                            <span class="text-xs text-muted-foreground" id="duty-rating">Last rating: <span id="last-rating">4.5</span>/5</span>
                            <button onclick="window.dutyManager.showSwapModal()" class="text-xs text-primary hover:underline">Request Swap</button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    },
    
    async handleCheckIn() {
        await this.checkIn();
        this.showDutyCard('duty-card-container');
    },
    
    async handleCheckOut() {
        await this.checkOut();
        this.showDutyCard('duty-card-container');
    },
    
    showSwapModal() {
        const modal = modalManager.create('duty-swap-modal', 'Request Duty Swap');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Date</label>
                    <input type="date" id="swap-date" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Reason</label>
                    <textarea id="swap-reason" rows="3" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('duty-swap-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dutyManager.handleSwapRequest()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Submit Request</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleSwapRequest() {
        const date = document.getElementById('swap-date')?.value;
        const reason = document.getElementById('swap-reason')?.value;
        
        const success = await this.requestSwap(date, reason);
        
        if (success) {
            modalManager.close('duty-swap-modal');
        }
    },
    
    showPreferencesForm(containerId, preferences = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Preferred Days</label>
                    <div class="flex flex-wrap gap-3">
                        ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => `
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="preferredDays" value="${day.toLowerCase()}" 
                                    ${preferences.preferredDays?.includes(day.toLowerCase()) ? 'checked' : ''}
                                    class="rounded border-input">
                                <span class="text-sm">${day}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Preferred Duty Areas</label>
                    <div class="flex flex-wrap gap-3">
                        ${[
                            { value: 'morning', label: 'Morning (7:30-8:30)' },
                            { value: 'lunch', label: 'Lunch (12:30-14:00)' },
                            { value: 'afternoon', label: 'Afternoon (15:30-16:30)' },
                            { value: 'whole_day', label: 'Whole Day' }
                        ].map(area => `
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="preferredAreas" value="${area.value}" 
                                    ${preferences.preferredAreas?.includes(area.value) ? 'checked' : ''}
                                    class="rounded border-input">
                                <span class="text-sm">${area.label}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Max Duties Per Week</label>
                    <input type="number" id="max-duties" value="${preferences.maxDutiesPerWeek || 3}" 
                        min="1" max="5" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Blackout Dates</label>
                    <div class="flex gap-2">
                        <input type="date" id="blackout-date" class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <button type="button" onclick="window.dutyManager.addBlackoutDate()" class="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Add</button>
                    </div>
                    <div id="blackout-dates-list" class="mt-2 space-y-1">
                        ${(preferences.blackoutDates || []).map(date => `
                            <div class="flex justify-between items-center p-2 bg-muted/30 rounded">
                                <span class="text-sm">${new Date(date).toLocaleDateString()}</span>
                                <button type="button" onclick="window.dutyManager.removeBlackoutDate('${date}')" class="text-red-600">
                                    <i data-lucide="x" class="h-4 w-4"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button type="button" onclick="window.dutyManager.savePreferences()" class="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
                    Save Preferences
                </button>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    addBlackoutDate() {
        const dateInput = document.getElementById('blackout-date');
        const date = dateInput?.value;
        if (!date) {
            toast.error('Please select a date');
            return;
        }
        
        const listContainer = document.getElementById('blackout-dates-list');
        if (listContainer) {
            if (listContainer.innerHTML.includes(date)) {
                toast.warning('Date already added');
                return;
            }
            
            listContainer.innerHTML += `
                <div class="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span class="text-sm">${new Date(date).toLocaleDateString()}</span>
                    <button onclick="window.dutyManager.removeBlackoutDate('${date}')" class="text-red-600">
                        <i data-lucide="x" class="h-4 w-4"></i>
                    </button>
                </div>
            `;
            dateInput.value = '';
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },
    
    removeBlackoutDate(date) {
        const listContainer = document.getElementById('blackout-dates-list');
        if (listContainer) {
            const item = Array.from(listContainer.children).find(
                div => div.textContent.includes(new Date(date).toLocaleDateString())
            );
            if (item) item.remove();
        }
    },
    
    async savePreferences() {
        const preferredDays = Array.from(document.querySelectorAll('input[name="preferredDays"]:checked'))
            .map(cb => cb.value);
        
        const preferredAreas = Array.from(document.querySelectorAll('input[name="preferredAreas"]:checked'))
            .map(cb => cb.value);
        
        const maxDutiesPerWeek = parseInt(document.getElementById('max-duties')?.value) || 3;
        
        const blackoutDates = [];
        document.querySelectorAll('#blackout-dates-list .flex.justify-between').forEach(div => {
            const dateSpan = div.querySelector('span');
            if (dateSpan && dateSpan.textContent) {
                const date = new Date(dateSpan.textContent);
                if (!isNaN(date.getTime())) {
                    blackoutDates.push(date.toISOString().split('T')[0]);
                }
            }
        });
        
        await this.updatePreferences({ preferredDays, preferredAreas, maxDutiesPerWeek, blackoutDates });
    }
};

window.dutyManager = dutyManager;