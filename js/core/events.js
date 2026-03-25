// js/core/events.js
import { EVENTS } from '../constants/events.js';

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }
        this.onceListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
            if (callbacks.length === 0) {
                this.listeners.delete(event);
            } else {
                this.listeners.set(event, callbacks);
            }
        }
        
        if (this.onceListeners.has(event)) {
            const onceCallbacks = this.onceListeners.get(event).filter(cb => cb !== callback);
            if (onceCallbacks.length === 0) {
                this.onceListeners.delete(event);
            } else {
                this.onceListeners.set(event, onceCallbacks);
            }
        }
    }

    emit(event, data) {
        // Regular listeners
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
        
        // Once listeners
        if (this.onceListeners.has(event)) {
            const callbacks = [...this.onceListeners.get(event)];
            this.onceListeners.delete(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in once event listener for ${event}:`, error);
                }
            });
        }
    }

    removeAllListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    listenerCount(event) {
        const regular = this.listeners.get(event)?.length || 0;
        const once = this.onceListeners.get(event)?.length || 0;
        return regular + once;
    }

    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }
}

export const eventBus = new EventBus();

// Export events for convenience
export { EVENTS };