// js/ui/components/Modal.js
import { eventBus, EVENTS } from '../../core/events.js';
import { utils } from '../../core/utils.js';

class Modal {
    constructor(id, title, options = {}) {
        this.id = id;
        this.title = title;
        this.options = {
            closeOnOverlayClick: true,
            closeOnEscape: true,
            ...options
        };
        this.element = null;
        this.contentElement = null;
        this.onClose = null;
        this.create();
    }

    create() {
        // Check if modal already exists
        let existing = document.getElementById(this.id);
        if (existing) {
            this.element = existing;
            this.contentElement = existing.querySelector('.modal-content');
            return;
        }

        const modalHTML = `
            <div id="${this.id}" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black/50 modal-overlay" data-modal-overlay></div>
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
                    <div class="rounded-xl border bg-card shadow-2xl animate-fade-in overflow-hidden">
                        <div class="bg-gradient-to-r from-primary/10 to-purple-600/10 px-6 py-4 border-b flex justify-between items-center">
                            <h3 class="text-xl font-semibold modal-title">${utils.escapeHtml(this.title)}</h3>
                            <button class="modal-close p-2 hover:bg-accent rounded-lg transition-colors" data-modal-close>
                                <i data-lucide="x" class="h-5 w-5"></i>
                            </button>
                        </div>
                        <div class="modal-content p-6">
                            <!-- Content will be filled dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.element = document.getElementById(this.id);
        this.contentElement = this.element.querySelector('.modal-content');
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const overlay = this.element.querySelector('[data-modal-overlay]');
        const closeBtn = this.element.querySelector('[data-modal-close]');
        
        if (overlay && this.options.closeOnOverlayClick) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        if (this.options.closeOnEscape) {
            const handleEscape = (e) => {
                if (e.key === 'Escape' && !this.element.classList.contains('hidden')) {
                    this.close();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            this.onOpenListener = () => document.addEventListener('keydown', handleEscape);
            this.onCloseListener = () => document.removeEventListener('keydown', handleEscape);
        }
    }

    setContent(html) {
        if (this.contentElement) {
            this.contentElement.innerHTML = html;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    setTitle(title) {
        const titleEl = this.element?.querySelector('.modal-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
        this.title = title;
    }

    open() {
        if (this.element) {
            this.element.classList.remove('hidden');
            if (this.onOpenListener) this.onOpenListener();
            eventBus.emit(EVENTS.MODAL_OPENED, { id: this.id });
        }
    }

    close() {
        if (this.element) {
            this.element.classList.add('hidden');
            if (this.onCloseListener) this.onCloseListener();
            eventBus.emit(EVENTS.MODAL_CLOSED, { id: this.id });
            if (this.onClose) this.onClose();
        }
    }

    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }

    onClose(callback) {
        this.onClose = callback;
    }
}

class ModalManager {
    constructor() {
        this.modals = new Map();
    }

    create(id, title, options = {}) {
        if (this.modals.has(id)) {
            return this.modals.get(id);
        }
        const modal = new Modal(id, title, options);
        this.modals.set(id, modal);
        return modal;
    }

    get(id) {
        return this.modals.get(id);
    }

    open(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.open();
        }
    }

    close(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.close();
        }
    }

    closeAll() {
        this.modals.forEach(modal => modal.close());
    }

    destroy(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.destroy();
            this.modals.delete(id);
        }
    }
}

export const modalManager = new ModalManager();
window.modalManager = modalManager;