// js/base/BaseDashboard.js

// Base class for all dashboards
export default class BaseDashboard {
    constructor(role) {
        this.role = role;
        this.sidebar = document.getElementById('sidebar-nav');
        this.settingsNav = document.getElementById('settings-nav');
    }

    init() {
        console.log(`Initializing ${this.role} dashboard`);
        this.renderSidebar();
        this.renderSettings();
    }

    renderSidebar() {
        if (!this.sidebar) return;

        const links = this.getSidebarLinks();
        this.sidebar.innerHTML = links.map(link => `
            <a href="${link.href}" class="block px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors">
                ${link.label}
            </a>
        `).join('');
    }

    renderSettings() {
        if (!this.settingsNav) return;

        const settings = this.getSettingsLinks();
        this.settingsNav.innerHTML = settings.map(link => `
            <a href="${link.href}" class="block px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors">
                ${link.label}
            </a>
        `).join('');
    }

    getSidebarLinks() {
        // Override in subclasses
        return [];
    }

    getSettingsLinks() {
        return [
            { label: 'Profile', href: '#' },
            { label: 'Change Password', href: '#' },
        ];
    }
}
