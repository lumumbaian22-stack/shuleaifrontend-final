// js/core/store.js
import { EVENTS } from '../constants/events.js';
import { eventBus } from './events.js';

class Store {
    constructor() {
        this.state = {
            user: null,
            school: null,
            schoolSettings: null,
            currentRole: null,
            isLoading: false,
            errors: [],
            dashboard: {},
            curriculum: null,
            notifications: [],
            unreadCount: 0,
            sidebarOpen: false,
            theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        };
        
        this.listeners = [];
        this.reducers = new Map();
        this.setupReducers();
    }

    setupReducers() {
        // User reducers
        this.reducers.set('USER_UPDATED', (state, payload) => ({
            ...state,
            user: payload.user,
            currentRole: payload.user?.role
        }));

        this.reducers.set('USER_LOGOUT', (state) => ({
            ...state,
            user: null,
            school: null,
            schoolSettings: null,
            currentRole: null,
            dashboard: {}
        }));

        // School reducers
        this.reducers.set('SCHOOL_UPDATED', (state, payload) => ({
            ...state,
            school: payload.school,
            schoolSettings: payload.school?.settings
        }));

        this.reducers.set('SCHOOL_NAME_CHANGED', (state, payload) => ({
            ...state,
            school: state.school ? { ...state.school, name: payload.newName } : null,
            schoolSettings: state.schoolSettings ? { ...state.schoolSettings, schoolName: payload.newName } : null
        }));

        // Curriculum reducers
        this.reducers.set('CURRICULUM_UPDATED', (state, payload) => ({
            ...state,
            curriculum: payload.curriculum,
            schoolSettings: state.schoolSettings ? {
                ...state.schoolSettings,
                curriculum: payload.curriculum
            } : null
        }));

        // Loading state
        this.reducers.set('SET_LOADING', (state, payload) => ({
            ...state,
            isLoading: payload.isLoading
        }));

        // Error handling
        this.reducers.set('SET_ERROR', (state, payload) => ({
            ...state,
            errors: [...state.errors, { message: payload.error, timestamp: new Date() }]
        }));

        this.reducers.set('CLEAR_ERRORS', (state) => ({
            ...state,
            errors: []
        }));

        this.reducers.set('CLEAR_ERROR', (state, payload) => ({
            ...state,
            errors: state.errors.filter(e => e.timestamp !== payload.timestamp)
        }));

        // Dashboard data
        this.reducers.set('DASHBOARD_DATA', (state, payload) => ({
            ...state,
            dashboard: {
                ...state.dashboard,
                [payload.role]: payload.data
            }
        }));

        // Notifications
        this.reducers.set('NOTIFICATIONS_UPDATED', (state, payload) => ({
            ...state,
            notifications: payload.notifications,
            unreadCount: payload.notifications?.filter(n => !n.read).length || 0
        }));

        this.reducers.set('NOTIFICATION_READ', (state, payload) => ({
            ...state,
            notifications: state.notifications.map(n =>
                n.id === payload.id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
        }));

        this.reducers.set('NOTIFICATIONS_CLEARED', (state) => ({
            ...state,
            notifications: [],
            unreadCount: 0
        }));

        // UI state
        this.reducers.set('TOGGLE_SIDEBAR', (state) => ({
            ...state,
            sidebarOpen: !state.sidebarOpen
        }));

        this.reducers.set('SET_THEME', (state, payload) => ({
            ...state,
            theme: payload.theme
        }));

        // Real-time updates
        this.reducers.set('REALTIME_CONNECTED', (state) => ({
            ...state,
            realtimeConnected: true
        }));

        this.reducers.set('REALTIME_DISCONNECTED', (state) => ({
            ...state,
            realtimeConnected: false
        }));
    }

    getState(key = null) {
        if (key) return this.state[key];
        return this.state;
    }

    dispatch(action) {
        const reducer = this.reducers.get(action.type);
        if (!reducer) {
            console.warn(`No reducer for action type: ${action.type}`);
            return;
        }

        const newState = reducer(this.state, action.payload);
        this.state = newState;
        this.notifyListeners(action);
        
        // Emit events for certain actions
        this.emitEvents(action);
    }

    emitEvents(action) {
        switch (action.type) {
            case 'USER_UPDATED':
                eventBus.emit(EVENTS.USER_UPDATED, action.payload.user);
                break;
            case 'SCHOOL_NAME_CHANGED':
                eventBus.emit(EVENTS.SCHOOL_NAME_CHANGED, action.payload);
                break;
            case 'CURRICULUM_UPDATED':
                eventBus.emit(EVENTS.CURRICULUM_CHANGED, action.payload);
                break;
            case 'SET_ERROR':
                eventBus.emit(EVENTS.ERROR_OCCURRED, action.payload);
                break;
            case 'NOTIFICATIONS_UPDATED':
                eventBus.emit(EVENTS.NOTIFICATION_RECEIVED, action.payload);
                break;
        }
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners(action) {
        this.listeners.forEach(listener => listener(this.state, action));
    }

    async loadInitialState() {
        try {
            this.dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

            const token = localStorage.getItem('authToken');
            if (!token) {
                this.dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
                return false;
            }

            // Import API dynamically to avoid circular dependency
            const { apiClient } = await import('../api/client.js');
            apiClient.setToken(token);

            const userResponse = await apiClient.get('/api/auth/me');
            const user = userResponse.data.user;

            this.dispatch({ type: 'USER_UPDATED', payload: { user } });

            if (user.schoolCode && user.role !== 'super_admin') {
                try {
                    const schoolResponse = await apiClient.get('/api/admin/settings');
                    this.dispatch({ type: 'SCHOOL_UPDATED', payload: { school: schoolResponse.data } });

                    if (schoolResponse.data.curriculum) {
                        this.dispatch({
                            type: 'CURRICULUM_UPDATED',
                            payload: { curriculum: schoolResponse.data.curriculum }
                        });
                    }
                } catch (error) {
                    console.warn('Failed to load school settings:', error);
                }
            }

            // Load notifications
            try {
                const notificationsResponse = await apiClient.get('/api/notifications');
                this.dispatch({
                    type: 'NOTIFICATIONS_UPDATED',
                    payload: { notifications: notificationsResponse.data || [] }
                });
            } catch (error) {
                console.warn('Failed to load notifications:', error);
            }

            this.dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
            return true;

        } catch (error) {
            console.error('Failed to load initial state:', error);
            this.dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
            this.dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
            
            // Clear invalid token
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
            }
            
            return false;
        }
    }

    reset() {
        this.state = {
            user: null,
            school: null,
            schoolSettings: null,
            currentRole: null,
            isLoading: false,
            errors: [],
            dashboard: {},
            curriculum: null,
            notifications: [],
            unreadCount: 0,
            sidebarOpen: false,
            theme: this.state.theme
        };
        this.notifyListeners();
    }
}

export const store = new Store();