// js/ui/components/Dropdown.js
export const Dropdown = {
    create(triggerButton, items, options = {}) {
        const container = document.createElement('div');
        container.className = 'relative inline-block';
        
        const button = triggerButton.cloneNode(true);
        button.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
        container.appendChild(button);
        
        const menu = document.createElement('div');
        menu.className = `absolute right-0 mt-2 w-56 rounded-lg border bg-popover shadow-lg z-50 hidden ${options.className || ''}`;
        
        items.forEach(item => {
            const menuItem = document.createElement('button');
            menuItem.className = 'flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-left';
            menuItem.textContent = item.label;
            
            if (item.icon) {
                const icon = document.createElement('i');
                icon.setAttribute('data-lucide', item.icon);
                icon.className = 'h-4 w-4';
                menuItem.prepend(icon);
            }
            
            if (item.onClick) {
                menuItem.addEventListener('click', (e) => {
                    menu.classList.add('hidden');
                    item.onClick(e);
                });
            }
            
            menu.appendChild(menuItem);
        });
        
        container.appendChild(menu);
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        return container;
    }
};

window.Dropdown = Dropdown;