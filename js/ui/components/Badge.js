// js/ui/components/Badge.js
export const Badge = {
    create(text, variant = 'default', options = {}) {
        const badge = document.createElement('span');
        
        const variants = {
            default: 'bg-primary/10 text-primary border border-primary/20',
            success: 'bg-green-100 text-green-700 border border-green-200',
            warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            error: 'bg-red-100 text-red-700 border border-red-200',
            info: 'bg-blue-100 text-blue-700 border border-blue-200',
            purple: 'bg-purple-100 text-purple-700 border border-purple-200',
            gray: 'bg-gray-100 text-gray-700 border border-gray-200'
        };
        
        const sizes = {
            sm: 'px-1.5 py-0.5 text-xs',
            md: 'px-2 py-1 text-xs',
            lg: 'px-3 py-1.5 text-sm'
        };
        
        badge.className = `inline-flex items-center rounded-full font-medium ${sizes[options.size || 'md']} ${variants[variant] || variants.default} ${options.className || ''}`;
        badge.textContent = text;
        
        if (options.icon) {
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', options.icon);
            icon.className = 'h-3 w-3 mr-1';
            badge.prepend(icon);
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        if (options.dot) {
            const dot = document.createElement('span');
            dot.className = `inline-block h-2 w-2 rounded-full mr-1 ${variants[variant]?.split(' ')[0]}`;
            badge.prepend(dot);
        }
        
        return badge;
    }
};

window.Badge = Badge;