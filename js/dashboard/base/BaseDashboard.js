// js/dashboard/base/BaseDashboard.js
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { eventBus, EVENTS } from '../../core/events.js';

class BaseDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }
        
        this.data = null;
        this.stats = {};
        this.charts = {};
        this._listeners = [];
        this._intervals = [];
        this._isMounted = false;
    }

    async init() {
        console.log(`🚀 Initializing ${this.constructor.name}...`);
        this._isMounted = true;
        this.renderLayout();
        await this.loadData();
        this.render();
        this.attachEventListeners();
        this.setupRealtimeSubscriptions();
        return this;
    }

    async loadData() {
        throw new Error('loadData() must be implemented by child class');
    }

    render() {
        throw new Error('render() must be implemented by child class');
    }

    renderLayout() {
        // Optional: Override for custom layout
    }

    attachEventListeners() {
        // Optional: Override for custom event listeners
    }

    setupRealtimeSubscriptions() {
        // Optional: Override for real-time subscriptions
    }

    async refresh() {
        if (!this._isMounted) return;
        
        console.log('🔄 Refreshing dashboard...');
        this.showLoading();
        
        try {
            await this.loadData();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    addListener(element, event, handler) {
        element.addEventListener(event, handler);
        this._listeners.push({ element, event, handler });
    }

    addInterval(callback, delay) {
        const interval = setInterval(callback, delay);
        this._intervals.push(interval);
        return interval;
    }

    showLoading() {
        toast.loading(true);
    }

    hideLoading() {
        toast.loading(false);
    }

    showError(message) {
        toast.error(message);
        eventBus.emit(EVENTS.ERROR_OCCURRED, { message, source: this.constructor.name });
    }

    destroy() {
        console.log(`🧹 Destroying ${this.constructor.name}...`);
        
        this._listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this._listeners = [];
        
        this._intervals.forEach(interval => clearInterval(interval));
        this._intervals = [];
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) chart.destroy();
        });
        this.charts = {};
        
        this.container.innerHTML = '';
        this._isMounted = false;
    }
}

window.BaseDashboard = BaseDashboard;