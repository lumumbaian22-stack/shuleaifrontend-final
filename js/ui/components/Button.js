// js/ui/components/Button.js
export const Button = {
    create(text, type = 'primary', onClick = null, options = {}) {
        const button = document.createElement('button');
        
        const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
        const typeClasses = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary',
            outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-accent',
            ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-accent',
            danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
            success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
        };
        
        button.className = `${baseClasses} ${typeClasses[type] || typeClasses.primary} ${options.className || ''}`;
        button.textContent = text;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        if (options.disabled) {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        if (options.icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'inline-block mr-2';
            iconSpan.innerHTML = `<i data-lucide="${options.icon}" class="h-4 w-4"></i>`;
            button.prepend(iconSpan);
        }
        
        return button;
    }
};

window.Button = Button;