// js/core/router.js
import { eventBus, EVENTS } from './events.js';
import { store } from './store.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentParams = {};
        this.history = [];
        this.useHash = false;
        
        this.handleRouteChange = this.handleRouteChange.bind(this);
    }

    init(useHash = false) {
        this.useHash = useHash;
        
        if (this.useHash) {
            window.addEventListener('hashchange', this.handleRouteChange);
            this.handleRouteChange();
        } else {
            window.addEventListener('popstate', this.handleRouteChange);
            this.handleRouteChange();
        }
    }

    addRoute(path, handler, options = {}) {
        const route = {
            path,
            handler,
            params: [],
            regex: this.compileRoute(path),
            options
        };
        this.routes.set(path, route);
    }

    compileRoute(path) {
        const paramNames = [];
        const regex = path.replace(/:([a-zA-Z0-9_]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });
        
        return {
            regex: new RegExp(`^${regex}$`),
            paramNames
        };
    }

    navigate(path, replace = false, params = {}) {
        // Build URL with params
        let url = path;
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, encodeURIComponent(value));
        });
        
        if (this.useHash) {
            if (replace) {
                window.location.replace(`#${url}`);
            } else {
                window.location.hash = url;
            }
        } else {
            if (replace) {
                window.history.replaceState({}, '', url);
            } else {
                window.history.pushState({}, '', url);
            }
            this.handleRouteChange();
        }
        
        return true;
    }

    goBack() {
        window.history.back();
    }

    goForward() {
        window.history.forward();
    }

    handleRouteChange() {
        let path;
        
        if (this.useHash) {
            path = window.location.hash.slice(1) || '/';
        } else {
            path = window.location.pathname;
        }
        
        this.currentParams = {};
        let matchedRoute = null;
        
        // Find matching route
        for (const [routePath, route] of this.routes) {
            const match = path.match(route.regex.regex);
            if (match) {
                matchedRoute = route;
                // Extract params
                route.regex.paramNames.forEach((name, index) => {
                    this.currentParams[name] = decodeURIComponent(match[index + 1]);
                });
                break;
            }
        }
        
        // Check authentication requirements
        const user = store.getState('user');
        const isAuthenticated = !!user;
        
        if (matchedRoute?.options.requiresAuth && !isAuthenticated) {
            this.navigate('/login');
            return;
        }
        
        if (matchedRoute?.options.requiresGuest && isAuthenticated) {
            this.navigate('/dashboard');
            return;
        }
        
        // Check role requirements
        if (matchedRoute?.options.roles && user) {
            const hasRole = matchedRoute.options.roles.includes(user.role);
            if (!hasRole) {
                this.navigate('/unauthorized');
                return;
            }
        }
        
        // Execute route handler
        if (matchedRoute) {
            this.currentRoute = matchedRoute.path;
            this.history.push({ path, params: this.currentParams, timestamp: Date.now() });
            matchedRoute.handler(this.currentParams);
            eventBus.emit(EVENTS.SECTION_CHANGED, { route: this.currentRoute, params: this.currentParams });
        } else {
            // 404 - route not found
            eventBus.emit(EVENTS.ERROR_OCCURRED, { message: 'Page not found', code: 404 });
            if (typeof window.showToast === 'function') {
                window.showToast('Page not found', 'error');
            }
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getCurrentParams() {
        return { ...this.currentParams };
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
    }
}

export const router = new Router();