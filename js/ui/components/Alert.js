// js/ui/components/Alert.js
export const Alert = {
    create(message, type = 'info', options = {}) {
        const alert = document.createElement('div');
        
        const types = {
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        };
        
        alert.className = `p-4 rounded-lg border flex items-start gap-3 ${types[type] || types.info} ${options.className || ''}`;
        
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        alert.innerHTML = `
            <i data-lucide="${icons[type] || icons.info}" class="h-5 w-5 flex-shrink-0"></i>
            <div class="flex-1">
                <p class="text-sm">${message}</p>
                ${options.details ? `<p class="text-xs mt-1 opacity-75">${options.details}</p>` : ''}
            </div>
            ${options.dismissible ? `
                <button class="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            ` : ''}
        `;
        
        if (options.dismissible) {
            const closeBtn = alert.querySelector('button');
            closeBtn.addEventListener('click', () => alert.remove());
        }
        
        if (options.autoDismiss) {
            setTimeout(() => alert.remove(), options.autoDismiss);
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        return alert;
    }
};

window.Alert = Alert;