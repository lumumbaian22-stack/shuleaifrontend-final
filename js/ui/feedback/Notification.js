// js/ui/feedback/Notification.js
import { timeAgo } from '../../core/utils.js';

export const Notification = {
    create(notification, onDismiss = null) {
        const div = document.createElement('div');
        div.className = `p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5 border-primary' : ''}`;
        
        const icons = {
            system: 'settings',
            alert: 'alert-triangle',
            message: 'message-circle',
            duty: 'clock',
            approval: 'check-circle',
            attendance: 'calendar-check',
            payment: 'credit-card',
            school: 'building-2',
            user: 'user-plus'
        };
        
        const iconColors = {
            system: 'text-gray-600',
            alert: 'text-red-600',
            message: 'text-blue-600',
            duty: 'text-amber-600',
            approval: 'text-green-600',
            attendance: 'text-purple-600',
            payment: 'text-emerald-600',
            school: 'text-blue-600',
            user: 'text-green-600'
        };
        
        const bgColors = {
            system: 'bg-gray-100',
            alert: 'bg-red-100',
            message: 'bg-blue-100',
            duty: 'bg-amber-100',
            approval: 'bg-green-100',
            attendance: 'bg-purple-100',
            payment: 'bg-emerald-100',
            school: 'bg-blue-100',
            user: 'bg-green-100'
        };
        
        div.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="h-10 w-10 rounded-full ${bgColors[notification.type] || 'bg-gray-100'} flex items-center justify-center flex-shrink-0">
                    <i data-lucide="${icons[notification.type] || 'bell'}" class="h-5 w-5 ${iconColors[notification.type] || 'text-gray-600'}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <p class="text-sm font-medium">${notification.title}</p>
                        <span class="text-xs text-muted-foreground flex-shrink-0">${timeAgo(notification.createdAt)}</span>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">${notification.message}</p>
                    ${notification.data && notification.actionUrl ? `
                        <button onclick="window.Notification.handleAction('${notification.id}', '${notification.actionUrl}')" 
                                class="mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20">
                            Take action
                        </button>
                    ` : ''}
                </div>
                ${!notification.read ? '<span class="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2"></span>' : ''}
                <button class="notification-dismiss p-1 hover:bg-accent rounded-lg flex-shrink-0" data-id="${notification.id}">
                    <i data-lucide="x" class="h-4 w-4 text-muted-foreground"></i>
                </button>
            </div>
        `;
        
        const dismissBtn = div.querySelector('.notification-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onDismiss) onDismiss(notification.id);
                div.remove();
            });
        }
        
        if (notification.actionUrl) {
            div.addEventListener('click', () => {
                if (window.router) {
                    window.router.navigate(notification.actionUrl);
                }
            });
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        return div;
    },
    
    handleAction(notificationId, actionUrl) {
        if (window.router) {
            window.router.navigate(actionUrl);
        }
    }
};

window.Notification = Notification;