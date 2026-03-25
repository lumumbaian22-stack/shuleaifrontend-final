// js/ui/feedback/Toast.js
import { utils } from '../../core/utils.js';

class ToastManager {
    constructor() {
        this.container = null;
        this.defaultDuration = 3000;
        this.toasts = [];
        this.init();
    }

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = this.defaultDuration) {
        const id = utils.generateId();
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-amber-500',
            info: 'bg-blue-500'
        };
        
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        toast.id = id;
        toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`;
        toast.innerHTML = `
            <i data-lucide="${icons[type]}" class="h-5 w-5 flex-shrink-0"></i>
            <span>${utils.escapeHtml(message)}</span>
        `;
        
        this.container.appendChild(toast);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        this.toasts.push({ id, timeout: setTimeout(() => this.remove(id), duration) });
        
        return id;
    }

    remove(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.classList.add('animate-fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
        
        const index = this.toasts.findIndex(t => t.id === id);
        if (index !== -1) {
            clearTimeout(this.toasts[index].timeout);
            this.toasts.splice(index, 1);
        }
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    loading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    }

    clear() {
        this.toasts.forEach(toast => {
            clearTimeout(toast.timeout);
            const el = document.getElementById(toast.id);
            if (el) el.remove();
        });
        this.toasts = [];
    }
}

export const toast = new ToastManager();

// Global shortcut
window.showToast = (message, type, duration) => toast.show(message, type, duration);
window.showLoading = () => toast.loading(true);
window.hideLoading = () => toast.loading(false);