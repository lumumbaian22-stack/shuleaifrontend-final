// js/ui/layout/Container.js
export const Container = {
    create(children, options = {}) {
        const container = document.createElement('div');
        container.className = `container mx-auto px-4 ${options.className || ''}`;
        
        if (options.maxWidth) {
            const maxWidths = {
                sm: 'max-w-screen-sm',
                md: 'max-w-screen-md',
                lg: 'max-w-screen-lg',
                xl: 'max-w-screen-xl',
                full: 'max-w-full'
            };
            container.classList.add(maxWidths[options.maxWidth] || 'max-w-7xl');
        }
        
        if (typeof children === 'string') {
            container.innerHTML = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    container.appendChild(child);
                } else if (typeof child === 'string') {
                    container.insertAdjacentHTML('beforeend', child);
                }
            });
        } else if (children.nodeType === Node.ELEMENT_NODE) {
            container.appendChild(children);
        }
        
        return container;
    },
    
    fluid(children, options = {}) {
        const container = document.createElement('div');
        container.className = `w-full px-4 ${options.className || ''}`;
        
        if (typeof children === 'string') {
            container.innerHTML = children;
        } else if (children.nodeType === Node.ELEMENT_NODE) {
            container.appendChild(children);
        }
        
        return container;
    }
};

window.Container = Container;