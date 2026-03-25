// js/dashboard/base/StatsRenderer.js
export const StatsRenderer = {
    render(container, stats, role = 'admin') {
        if (!container || !stats) return [];
        
        const cards = this.generateCards(stats, role);
        container.innerHTML = `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                ${cards.join('')}
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        return container.querySelectorAll('.stats-card');
    },

    generateCards(stats, role) {
        const cardConfigs = this.getCardConfigs(role);
        const cards = [];
        
        for (const config of cardConfigs) {
            const value = stats[config.key];
            if (value === undefined && !config.optional) continue;
            
            cards.push(`
                <div class="rounded-xl border bg-card p-6 card-hover stats-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-muted-foreground">${config.label}</p>
                            <h3 class="text-2xl font-bold mt-1">${this.formatValue(value ?? config.defaultValue ?? 0, config.format)}</h3>
                            ${config.change !== undefined ? `
                                <p class="text-xs ${config.change >= 0 ? 'text-green-600' : 'text-red-600'} mt-1 flex items-center gap-1">
                                    <i data-lucide="${config.change >= 0 ? 'trending-up' : 'trending-down'}" class="h-3 w-3"></i>
                                    ${Math.abs(config.change)}% ${config.change >= 0 ? 'increase' : 'decrease'}
                                </p>
                            ` : ''}
                        </div>
                        <div class="h-12 w-12 rounded-lg ${config.bgColor} flex items-center justify-center">
                            <i data-lucide="${config.icon}" class="h-6 w-6 ${config.iconColor}"></i>
                        </div>
                    </div>
                </div>
            `);
        }
        
        return cards;
    },

    getCardConfigs(role) {
        const configs = {
            admin: [
                { key: 'totalStudents', label: 'Total Students', icon: 'users', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', format: 'number' },
                { key: 'totalTeachers', label: 'Teachers', icon: 'user-plus', bgColor: 'bg-violet-100', iconColor: 'text-violet-600', format: 'number' },
                { key: 'totalClasses', label: 'Classes', icon: 'book-open', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', format: 'number' },
                { key: 'attendanceRate', label: 'Attendance Rate', icon: 'calendar-check', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', format: 'percentage', defaultValue: 94 }
            ],
            superadmin: [
                { key: 'totalSchools', label: 'Total Schools', icon: 'building-2', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', format: 'number' },
                { key: 'activeSchools', label: 'Active Schools', icon: 'check-circle', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', format: 'number' },
                { key: 'pendingApprovals', label: 'Pending Approvals', icon: 'alert-circle', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', format: 'number' },
                { key: 'revenue', label: 'Revenue (MTD)', icon: 'dollar-sign', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', format: 'currency', defaultValue: 0 }
            ],
            teacher: [
                { key: 'myStudents', label: 'My Students', icon: 'users', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', format: 'number' },
                { key: 'classAverage', label: 'Class Average', icon: 'trending-up', bgColor: 'bg-violet-100', iconColor: 'text-violet-600', format: 'percentage', defaultValue: 0 },
                { key: 'attendanceToday', label: 'Attendance Today', icon: 'calendar-check', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', format: 'fraction', defaultValue: '0/0' },
                { key: 'pendingTasks', label: 'Pending Tasks', icon: 'check-square', bgColor: 'bg-red-100', iconColor: 'text-red-600', format: 'number', defaultValue: 0 }
            ],
            parent: [
                { key: 'attendanceRate', label: 'Attendance', icon: 'calendar-check', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', format: 'percentage', defaultValue: 0 },
                { key: 'averageScore', label: 'Class Average', icon: 'trending-up', bgColor: 'bg-violet-100', iconColor: 'text-violet-600', format: 'percentage', defaultValue: 0 },
                { key: 'homeworkCount', label: 'Homework', icon: 'book-open', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', format: 'number', defaultValue: 0 },
                { key: 'feeBalance', label: 'Fee Balance', icon: 'credit-card', bgColor: 'bg-red-100', iconColor: 'text-red-600', format: 'currency', defaultValue: 0 }
            ],
            student: [
                { key: 'elimuid', label: 'My ELIMUID', icon: 'id-card', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', format: 'text' },
                { key: 'averageScore', label: 'Class Average', icon: 'trending-up', bgColor: 'bg-green-100', iconColor: 'text-green-600', format: 'percentage', defaultValue: 0 },
                { key: 'attendanceRate', label: 'My Attendance', icon: 'calendar-check', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', format: 'percentage', defaultValue: 0 },
                { key: 'studyGroups', label: 'Study Groups', icon: 'message-circle', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', format: 'number', defaultValue: 0 }
            ]
        };
        
        return configs[role] || configs.admin;
    },

    formatValue(value, format) {
        if (value === null || value === undefined) return '0';
        
        switch (format) {
            case 'percentage':
                return `${Math.round(value)}%`;
            case 'currency':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            case 'fraction':
                return value;
            case 'text':
                return value;
            case 'number':
            default:
                return value.toLocaleString();
        }
    },

    update(container, key, value) {
        const statCard = container.querySelector(`.stats-card`);
        if (statCard) {
            const valueSpan = statCard.querySelector('h3');
            if (valueSpan) {
                const format = statCard.dataset.format || 'number';
                valueSpan.textContent = this.formatValue(value, format);
            }
        }
    }
};

window.StatsRenderer = StatsRenderer;
