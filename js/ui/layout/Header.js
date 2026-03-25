// js/ui/layout/Header.js
import { store } from '../../core/store.js';
import { getInitials } from '../../core/utils.js';

export const Header = {
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const user = store.getState('user');
        const initials = getInitials(user?.name);
        
        container.innerHTML = `
            <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
                <button onclick="window.sidebar?.toggle()" class="lg:hidden p-2 hover:bg-accent rounded-lg touch-target">
                    <i data-lucide="menu" class="h-5 w-5"></i>
                </button>
                
                <div class="flex-1">
                    <h1 id="page-title" class="text-xl font-semibold">Dashboard</h1>
                </div>
                
                <div class="flex items-center gap-4">
                    <div class="hidden md:flex relative">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"></i>
                        <input type="text" placeholder="Search..." class="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    </div>
                    
                    <button onclick="window.notifications?.toggle()" class="relative p-2 hover:bg-accent rounded-lg touch-target" id="notification-btn">
                        <i data-lucide="bell" class="h-5 w-5"></i>
                        <span id="notification-badge" class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 hidden"></span>
                    </button>
                    
                    <button onclick="window.theme.toggle()" class="p-2 hover:bg-accent rounded-lg touch-target">
                        <i data-lucide="sun" class="h-5 w-5 hidden dark:block"></i>
                        <i data-lucide="moon" class="h-5 w-5 block dark:hidden"></i>
                    </button>
                    
                    <div class="relative">
                        <button onclick="window.userMenu?.toggle()" class="flex items-center gap-2 p-2 hover:bg-accent rounded-lg">
                            <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm">
                                <span id="user-initials">${initials}</span>
                            </div>
                            <span class="hidden md:block text-sm font-medium" id="user-name">${user?.name || 'User'}</span>
                            <i data-lucide="chevron-down" class="h-4 w-4 hidden md:block"></i>
                        </button>
                        
                        <div id="user-menu" class="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg hidden animate-fade-in">
                            <div class="px-3 py-2 border-b">
                                <p class="text-sm font-medium" id="dropdown-user-name">${user?.name || 'User'}</p>
                                <p class="text-xs text-muted-foreground" id="dropdown-user-email">${user?.email || ''}</p>
                            </div>
                            <a href="#" onclick="window.router.navigate('profile')" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md">
                                <i data-lucide="user" class="h-4 w-4"></i> Profile
                            </a>
                            <a href="#" onclick="window.router.navigate('settings')" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md">
                                <i data-lucide="settings" class="h-4 w-4"></i> Settings
                            </a>
                            <div class="border-t mt-2 pt-2">
                                <button onclick="window.auth.logout()" class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                    <i data-lucide="log-out" class="h-4 w-4"></i> Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    updateUserInfo() {
        const user = store.getState('user');
        const initials = getInitials(user?.name);
        
        const userInitials = document.getElementById('user-initials');
        const userName = document.getElementById('user-name');
        const dropdownName = document.getElementById('dropdown-user-name');
        const dropdownEmail = document.getElementById('dropdown-user-email');
        
        if (userInitials) userInitials.textContent = initials;
        if (userName) userName.textContent = user?.name || 'User';
        if (dropdownName) dropdownName.textContent = user?.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = user?.email || '';
    },
    
    setTitle(title) {
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = title;
    }
};

window.Header = Header;