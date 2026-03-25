// js/hooks/useStore.js
import { store } from '../core/store.js';
import { useState, useEffect } from '../core/utils.js';

export const useStore = (selector) => {
    const [state, setState] = useState(selector ? selector(store.getState()) : store.getState());
    
    useEffect(() => {
        const unsubscribe = store.subscribe((newState) => {
            const newValue = selector ? selector(newState) : newState;
            setState(newValue);
        });
        return unsubscribe;
    }, [selector]);
    
    return state;
};

window.useStore = useStore;