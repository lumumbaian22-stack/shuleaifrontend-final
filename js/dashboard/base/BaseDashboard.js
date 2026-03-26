// js/dashboard/base/BaseDashboard.js
class BaseDashboard {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        this.data = null;
        this.stats = {};
        this.charts = {};
        this._isMounted = false;
    }

    async init() {
        console.log(`🚀 Initializing ${this.constructor.name}...`);
        this._isMounted = true;
        await this.loadData();
        this.render();
        return this;
    }

    async loadData() {
        // Override in child classes
    }

    render() {
        // Override in child classes
    }

    async refresh() {
        if (!this._isMounted) return;
        await this.loadData();
        this.render();
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    showError(message) {
        console.error(message);
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        }
    }

    destroy() {
        this._isMounted = false;
        if (this.container) this.container.innerHTML = '';
    }
}

window.BaseDashboard = BaseDashboard;
console.log('✅ BaseDashboard loaded');
