// js/features/calendar/EventManager.js
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate } from '../../core/utils.js';

export const eventManager = {
    events: [],
    
    load() {
        try {
            const stored = localStorage.getItem('calendarEvents');
            this.events = stored ? JSON.parse(stored) : [];
            return this.events;
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    },
    
    save() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    },
    
    add(event) {
        if (!event.title || !event.date) {
            toast.error('Title and date are required');
            return null;
        }
        
        const newEvent = {
            id: Date.now().toString(),
            ...event,
            createdAt: new Date().toISOString()
        };
        
        this.events.push(newEvent);
        this.save();
        toast.success('Event added successfully');
        return newEvent;
    },
    
    update(eventId, updates) {
        const index = this.events.findIndex(e => e.id === eventId);
        if (index === -1) {
            toast.error('Event not found');
            return false;
        }
        
        this.events[index] = { ...this.events[index], ...updates };
        this.save();
        toast.success('Event updated');
        return true;
    },
    
    delete(eventId) {
        if (!confirm('Delete this event?')) return false;
        
        this.events = this.events.filter(e => e.id !== eventId);
        this.save();
        toast.success('Event deleted');
        return true;
    },
    
    getEventsForDate(date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        return this.events.filter(e => e.date === dateStr);
    },
    
    getUpcomingEvents(limit = 10) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.events
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, limit);
    },
    
    showEventModal(event = null) {
        const isEdit = !!event;
        const modal = modalManager.create('event-modal', isEdit ? 'Edit Event' : 'Add Event');
        
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="event-id" value="${event?.id || ''}">
                <div>
                    <label class="block text-sm font-medium mb-1">Event Title *</label>
                    <input type="text" id="event-title" value="${event?.title || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Date *</label>
                    <input type="date" id="event-date" value="${event?.date || new Date().toISOString().split('T')[0]}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Time</label>
                    <input type="time" id="event-time" value="${event?.time || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Location</label>
                    <input type="text" id="event-location" value="${event?.location || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Description</label>
                    <textarea id="event-description" rows="3" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">${event?.description || ''}</textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('event-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.eventManager.saveEvent()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">${isEdit ? 'Update' : 'Save'}</button>
                </div>
            </div>
        `);
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    saveEvent() {
        const id = document.getElementById('event-id')?.value;
        const title = document.getElementById('event-title')?.value;
        const date = document.getElementById('event-date')?.value;
        const time = document.getElementById('event-time')?.value;
        const location = document.getElementById('event-location')?.value;
        const description = document.getElementById('event-description')?.value;
        
        if (!title || !date) {
            toast.error('Title and date are required');
            return;
        }
        
        if (id) {
            this.update(id, { title, date, time, location, description });
        } else {
            this.add({ title, date, time, location, description });
        }
        
        modalManager.close('event-modal');
        
        // Refresh calendar view if it exists
        if (window.calendarView) {
            window.calendarView.renderMonth('calendar-container', window.calendarView.calendarState.currentDate.getFullYear(), window.calendarView.calendarState.currentDate.getMonth());
        }
    },
    
    renderEventList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.load();
        const upcoming = this.getUpcomingEvents(8);
        
        if (upcoming.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="calendar-x" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground">No upcoming events</p>
                </div>
            `;
            return;
        }
        
        const colors = [
            { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-l-blue-500', text: 'text-blue-700' },
            { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-l-green-500', text: 'text-green-700' },
            { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-l-purple-500', text: 'text-purple-700' },
            { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-l-amber-500', text: 'text-amber-700' }
        ];
        
        container.innerHTML = `
            <div class="space-y-3">
                ${upcoming.map((event, index) => {
                    const color = colors[index % colors.length];
                    const eventDate = new Date(event.date);
                    const isToday = eventDate.toDateString() === new Date().toDateString();
                    const isTomorrow = new Date(eventDate.setDate(eventDate.getDate() - 1)).toDateString() === new Date().toDateString();
                    
                    let dateLabel = formatDate(event.date);
                    if (isToday) dateLabel = 'Today';
                    else if (isTomorrow) dateLabel = 'Tomorrow';
                    
                    return `
                        <div class="rounded-lg border-l-4 ${color.border} ${color.bg} p-3 hover:shadow-md transition-all cursor-pointer" 
                             onclick="window.eventManager.showEventModal(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-semibold text-sm">${event.title}</p>
                                    <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>📅 ${dateLabel}</span>
                                        ${event.time ? `<span>🕐 ${event.time}</span>` : ''}
                                    </div>
                                    ${event.location ? `<p class="text-xs text-muted-foreground mt-1">📍 ${event.location}</p>` : ''}
                                </div>
                                <button onclick="event.stopPropagation(); window.eventManager.delete('${event.id}')" 
                                        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg text-red-600">
                                    <i data-lucide="trash-2" class="h-3 w-3"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    delete(eventId) {
        const success = this.delete(eventId);
        if (success) {
            this.renderEventList('event-list-container');
            if (window.calendarView) {
                window.calendarView.renderMonth('calendar-container', window.calendarView.calendarState.currentDate.getFullYear(), window.calendarView.calendarState.currentDate.getMonth());
            }
        }
    }
};

window.eventManager = eventManager;