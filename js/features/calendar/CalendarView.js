// js/features/calendar/CalendarView.js
import { modalManager } from '../../ui/components/Modal.js';
import { toast } from '../../ui/feedback/Toast.js';
import { formatDate } from '../../core/utils.js';

export const calendarView = {
    currentDate: new Date(),
    events: [],
    calendarState: {
        currentDate: new Date(),
        viewMode: 'month'
    },
    
    loadEvents() {
        try {
            const stored = localStorage.getItem('calendarEvents');
            this.events = stored ? JSON.parse(stored) : [];
            return this.events;
        } catch (error) {
            console.error('Error loading calendar events:', error);
            return [];
        }
    },
    
    saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    },
    
    addEvent(event) {
        if (!event.title || !event.date) {
            toast.error('Title and date are required');
            return false;
        }
        
        const newEvent = {
            id: Date.now().toString(),
            ...event,
            createdAt: new Date().toISOString()
        };
        
        this.events.push(newEvent);
        this.saveEvents();
        toast.success('Event added successfully');
        return true;
    },
    
    deleteEvent(eventId) {
        if (!confirm('Delete this event?')) return false;
        
        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        toast.success('Event deleted');
        return true;
    },
    
    getEventsForDate(date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        return this.events.filter(e => e.date === dateStr);
    },
    
    renderMonth(containerId, year, month) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.loadEvents();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        let calendarHtml = `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="grid grid-cols-7 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
                        <div class="py-3 text-center font-semibold text-sm">${day}</div>
                    `).join('')}
                </div>
                <div class="grid grid-cols-7 divide-x divide-y">
        `;
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const date = new Date(year, month - 1, day);
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.getEventsForDate(dateStr);
            const hasEvents = dayEvents.length > 0;
            
            calendarHtml += `
                <div class="aspect-square p-2 bg-muted/30 hover:bg-accent/50 transition-colors cursor-pointer relative group"
                     onclick="window.calendarView.showDayDetails('${dateStr}')">
                    <span class="text-sm text-muted-foreground">${day}</span>
                    ${hasEvents ? `
                        <div class="absolute bottom-1 right-1">
                            <div class="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const date = new Date(year, month, day);
            const dayEvents = this.getEventsForDate(dateStr);
            const hasEvents = dayEvents.length > 0;
            const isToday = date.toDateString() === new Date().toDateString();
            
            calendarHtml += `
                <div class="aspect-square p-2 hover:bg-accent/50 transition-colors cursor-pointer relative group ${isToday ? 'bg-primary/10' : ''}"
                     onclick="window.calendarView.showDayDetails('${dateStr}')">
                    <span class="text-sm font-medium ${isToday ? 'text-primary font-bold' : ''}">${day}</span>
                    ${hasEvents ? `
                        <div class="absolute bottom-1 right-1">
                            <div class="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                    ` : ''}
                    ${dayEvents.length > 0 ? `
                        <div class="absolute bottom-6 left-1 text-[10px] truncate w-full opacity-0 group-hover:opacity-100 transition-opacity">
                            ${dayEvents[0].title.substring(0, 15)}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Next month days (to fill grid)
        const totalCells = calendarHtml.match(/<div class="aspect-square/g)?.length || 0;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.getEventsForDate(dateStr);
            const hasEvents = dayEvents.length > 0;
            
            calendarHtml += `
                <div class="aspect-square p-2 bg-muted/30 hover:bg-accent/50 transition-colors cursor-pointer relative group"
                     onclick="window.calendarView.showDayDetails('${dateStr}')">
                    <span class="text-sm text-muted-foreground">${day}</span>
                    ${hasEvents ? `
                        <div class="absolute bottom-1 right-1">
                            <div class="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        calendarHtml += `
                </div>
            </div>
        `;
        
        container.innerHTML = calendarHtml;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    showDayDetails(dateStr) {
        const date = new Date(dateStr);
        const events = this.getEventsForDate(dateStr);
        
        const modal = modalManager.create('day-details-modal', formatDate(dateStr));
        
        if (events.length === 0) {
            modal.setContent(`
                <div class="text-center py-8">
                    <i data-lucide="calendar" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground mb-4">No events for this day</p>
                    <button onclick="window.calendarView.showAddEventModal('${dateStr}')" 
                            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                        Add Event
                    </button>
                </div>
            `);
        } else {
            modal.setContent(`
                <div class="space-y-4">
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${events.map(event => `
                            <div class="p-3 border rounded-lg">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-medium">${event.title}</p>
                                        ${event.time ? `<p class="text-sm text-muted-foreground">🕐 ${event.time}</p>` : ''}
                                        ${event.location ? `<p class="text-sm text-muted-foreground">📍 ${event.location}</p>` : ''}
                                        ${event.description ? `<p class="text-sm mt-2">${event.description}</p>` : ''}
                                    </div>
                                    <button onclick="window.calendarView.deleteEvent('${event.id}')" 
                                            class="text-red-500 hover:text-red-700 p-1">
                                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-end gap-2 pt-4 border-t">
                        <button onclick="window.calendarView.showAddEventModal('${dateStr}')" 
                                class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                            Add Event
                        </button>
                        <button onclick="window.modalManager?.close('day-details-modal')" 
                                class="px-4 py-2 border rounded-lg hover:bg-accent">
                            Close
                        </button>
                    </div>
                </div>
            `);
        }
        
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    showAddEventModal(prefillDate = null) {
        const modal = modalManager.create('add-event-modal', 'Add Calendar Event');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Event Title *</label>
                    <input type="text" id="event-title" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Date *</label>
                    <input type="date" id="event-date" value="${prefillDate || new Date().toISOString().split('T')[0]}" 
                           class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Time</label>
                    <input type="time" id="event-time" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Location</label>
                    <input type="text" id="event-location" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Description</label>
                    <textarea id="event-description" rows="3" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('add-event-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.calendarView.saveEvent()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Event</button>
                </div>
            </div>
        `);
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    saveEvent() {
        const title = document.getElementById('event-title')?.value;
        const date = document.getElementById('event-date')?.value;
        const time = document.getElementById('event-time')?.value;
        const location = document.getElementById('event-location')?.value;
        const description = document.getElementById('event-description')?.value;
        
        if (!title || !date) {
            toast.error('Title and date are required');
            return;
        }
        
        const success = this.addEvent({ title, date, time, location, description });
        
        if (success) {
            modalManager.close('add-event-modal');
            this.renderMonth('calendar-container', this.calendarState.currentDate.getFullYear(), this.calendarState.currentDate.getMonth());
        }
    },
    
    deleteEvent(eventId) {
        const success = this.deleteEvent(eventId);
        
        if (success) {
            modalManager.close('day-details-modal');
            this.renderMonth('calendar-container', this.calendarState.currentDate.getFullYear(), this.calendarState.currentDate.getMonth());
        }
    },
    
    changeMonth(direction) {
        this.calendarState.currentDate.setMonth(this.calendarState.currentDate.getMonth() + direction);
        this.renderMonth('calendar-container', this.calendarState.currentDate.getFullYear(), this.calendarState.currentDate.getMonth());
    },
    
    goToToday() {
        this.calendarState.currentDate = new Date();
        this.renderMonth('calendar-container', this.calendarState.currentDate.getFullYear(), this.calendarState.currentDate.getMonth());
    },
    
    init(containerId) {
        this.renderMonth(containerId, this.calendarState.currentDate.getFullYear(), this.calendarState.currentDate.getMonth());
        
        // Add navigation controls
        const navHtml = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <button onclick="window.calendarView.changeMonth(-1)" class="p-2 hover:bg-accent rounded-lg">
                        <i data-lucide="chevron-left" class="h-5 w-5"></i>
                    </button>
                    <button onclick="window.calendarView.goToToday()" class="px-3 py-1 border rounded-lg hover:bg-accent text-sm">Today</button>
                    <button onclick="window.calendarView.changeMonth(1)" class="p-2 hover:bg-accent rounded-lg">
                        <i data-lucide="chevron-right" class="h-5 w-5"></i>
                    </button>
                    <h2 class="text-xl font-semibold ml-2">${this.calendarState.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                </div>
                <button onclick="window.calendarView.showAddEventModal()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                    Add Event
                </button>
            </div>
        `;
        
        const container = document.getElementById(containerId);
        if (container) {
            container.insertAdjacentHTML('afterbegin', navHtml);
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

window.calendarView = calendarView;