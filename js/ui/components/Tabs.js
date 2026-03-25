// js/ui/components/Tabs.js
export const Tabs = {
    create(tabs, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const tabContainer = document.createElement('div');
        tabContainer.className = `border-b ${options.tabContainerClass || ''}`;
        
        const contentContainer = document.createElement('div');
        contentContainer.className = `p-4 ${options.contentClass || ''}`;
        
        let activeTab = options.defaultTab || 0;
        
        const renderTabs = () => {
            tabContainer.innerHTML = '';
            
            tabs.forEach((tab, index) => {
                const button = document.createElement('button');
                button.className = `px-4 py-2 text-sm font-medium transition-colors ${index === activeTab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`;
                button.textContent = tab.label;
                button.addEventListener('click', () => {
                    activeTab = index;
                    renderTabs();
                    renderContent();
                });
                tabContainer.appendChild(button);
            });
        };
        
        const renderContent = () => {
            const tab = tabs[activeTab];
            if (typeof tab.content === 'function') {
                contentContainer.innerHTML = '';
                const content = tab.content();
                if (typeof content === 'string') {
                    contentContainer.innerHTML = content;
                } else if (content.nodeType === Node.ELEMENT_NODE) {
                    contentContainer.appendChild(content);
                }
            } else {
                contentContainer.innerHTML = tab.content || '';
            }
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };
        
        container.innerHTML = '';
        container.appendChild(tabContainer);
        container.appendChild(contentContainer);
        
        renderTabs();
        renderContent();
        
        return { setActiveTab: (index) => { activeTab = index; renderTabs(); renderContent(); } };
    }
};

window.Tabs = Tabs;