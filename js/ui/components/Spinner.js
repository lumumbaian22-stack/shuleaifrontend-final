// js/ui/components/Spinner.js
export const Spinner = {
    create(size = 'md', options = {}) {
        const spinner = document.createElement('div');
        
        const sizes = {
            sm: 'h-4 w-4',
            md: 'h-8 w-8',
            lg: 'h-12 w-12',
            xl: 'h-16 w-16'
        };
        
        spinner.className = `animate-spin rounded-full border-2 border-primary border-t-transparent ${sizes[size] || sizes.md} ${options.className || ''}`;
        
        return spinner;
    },
    
    show(container, size = 'md') {
        const existing = document.getElementById('spinner-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'spinner-overlay';
        overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
        
        const spinner = this.create(size);
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center gap-4';
        spinnerContainer.appendChild(spinner);
        
        if (options.message) {
            const message = document.createElement('p');
            message.className = 'text-center text-sm text-muted-foreground';
            message.textContent = options.message;
            spinnerContainer.appendChild(message);
        }
        
        overlay.appendChild(spinnerContainer);
        
        if (container) {
            container.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
        }
        
        return overlay;
    },
    
    hide() {
        const overlay = document.getElementById('spinner-overlay');
        if (overlay) overlay.remove();
    }
};

window.Spinner = Spinner;