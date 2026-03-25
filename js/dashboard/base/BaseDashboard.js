// js/dashboard/base/BaseDashboard.js

import { toast } from '../../ui/feedback/Toast.js';
import { eventBus, EVENTS } from '../../core/events.js';

export class BaseDashboard {
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

        try {
            this.renderLayout();
            await this.loadData();
            this.render();
            this.attachEventListeners();
            this.setupRealtimeSubscriptions();
        } catch (error) {
            console.error(`${this.constructor.name} init failed:`, error);
            this.showError(error.message);
        }

        return this;
    }

    // 🔴 MUST be implemented in child classes
    async loadData() {
        throw new Error('loadData() must be implemented by child class');
    }

    render() {
        throw new Error('render() must be implemented by child class');
    }

    // 🟡 Optional overrides
    renderLayout() {}

    attachEventListeners() {}

    setupRealtimeSubscriptions() {}

    async refresh() {
        if (!this._isMounted) return;

        console.log(`🔄 Refreshing ${this.constructor.name}...`);
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

    // 🔧 Helpers
    addListener(element, event, handler) {
        if (!element) return;

        element.addEventListener(event, handler);
        this._listeners.push({ element, event, handler });
    }

    addInterval(callback, delay) {
        const interval = setInterval(callback, delay);
        this._intervals.push(interval);
        return interval;
    }

    showLoading() {
        if (toast?.loading) {
            toast.loading(true);
        }
    }

    hideLoading() {
        if (toast?.loading) {
            toast.loading(false);
        }
    }

    showError(message) {
        console.error(`❌ ${this.constructor.name}:`, message);

        if (toast?.error) {
            toast.error(message);
        }

        if (eventBus && EVENTS?.ERROR_OCCURRED) {
            eventBus.emit(EVENTS.ERROR_OCCURRED, {
                message,
                source: this.constructor.name
            });
        }
    }

    destroy() {
        console.log(`🧹 Destroying ${this.constructor.name}...`);

        // Remove event listeners
        this._listeners.forEach(({ element, event, handler }) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        });
        this._listeners = [];

        // Clear intervals
        this._intervals.forEach(interval => clearInterval(interval));
        this._intervals = [];

        // Destroy charts safely
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};

        // Clear UI
        if (this.container) {
            this.container.innerHTML = '';
        }

        this._isMounted = false;
    }
}
