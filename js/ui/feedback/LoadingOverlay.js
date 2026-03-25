// js/ui/feedback/LoadingOverlay.js
export const LoadingOverlay = {
    overlay: null,
    
    show(message = 'Loading...') {
        if (this.overlay) this.hide();
        
        this.overlay = document.createElement('div');
        this.overlay.id = 'loading-overlay';
        this.overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
        this.overlay.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p class="text-center text-sm text-muted-foreground">${message}</p>
            </div>
        `;
        document.body.appendChild(this.overlay);
    },
    
    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    },
    
    updateMessage(message) {
        if (this.overlay) {
            const messageEl = this.overlay.querySelector('p');
            if (messageEl) messageEl.textContent = message;
        }
    }
};

window.LoadingOverlay = LoadingOverlay;