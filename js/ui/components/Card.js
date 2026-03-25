// js/ui/components/Card.js
export const Card = {
    create(title, content, footer = null, options = {}) {
        const card = document.createElement('div');
        card.className = `rounded-xl border bg-card shadow-sm overflow-hidden ${options.className || ''}`;
        
        let html = '';
        
        if (title) {
            html += `
                <div class="p-4 border-b ${options.headerClass || ''}">
                    <h3 class="font-semibold text-lg">${title}</h3>
                    ${options.subtitle ? `<p class="text-sm text-muted-foreground mt-1">${options.subtitle}</p>` : ''}
                </div>
            `;
        }
        
        html += `
            <div class="p-4 ${options.contentClass || ''}">
                ${typeof content === 'string' ? content : ''}
            </div>
        `;
        
        if (footer) {
            html += `
                <div class="p-4 border-t bg-muted/30 ${options.footerClass || ''}">
                    ${typeof footer === 'string' ? footer : ''}
                </div>
            `;
        }
        
        card.innerHTML = html;
        
        if (typeof content !== 'string') {
            const contentDiv = card.querySelector('.p-4:not(.border-t)');
            if (contentDiv && content.nodeType === Node.ELEMENT_NODE) {
                contentDiv.appendChild(content);
            }
        }
        
        if (footer && typeof footer !== 'string') {
            const footerDiv = card.querySelector('.border-t');
            if (footerDiv && footer.nodeType === Node.ELEMENT_NODE) {
                footerDiv.appendChild(footer);
            }
        }
        
        return card;
    }
};

window.Card = Card;