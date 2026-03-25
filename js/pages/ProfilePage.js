// js/pages/ProfilePage.js
import { store } from '../core/store.js';
import { apiClient } from '../api/client.js';
import { toast } from '../ui/feedback/Toast.js';
import { getInitials, formatDate } from '../core/utils.js';

export const ProfilePage = {
    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const user = store.getState('user');
        const stats = await this.loadUserStats();
        
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <div class="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10"></div>
                    <div class="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-black/10"></div>
                    <div class="relative z-10 flex items-center gap-6">
                        <div class="h-24 w-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold border-4 border-white shadow-xl">
                            ${getInitials(user?.name)}
                        </div>
                        <div>
                            <h2 class="text-3xl font-bold">${user?.name || 'User'}</h2>
                            <p class="text-white/80 capitalize">${user?.role} • ${user?.email || ''}</p>
                            <div class="flex gap-2 mt-2">
                                <span class="px-2 py-1 bg-white/20 rounded-full text-xs">ID: ${user?.id}</span>
                                <span class="px-2 py-1 bg-white/20 rounded-full text-xs">Status: ${user?.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid gap-4 md:grid-cols-3">
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Member Since</p><p class="text-lg font-semibold">${formatDate(user?.createdAt)}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Last Login</p><p class="text-lg font-semibold">${user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}</p></div>
                    <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">Phone</p><p class="text-lg font-semibold">${user?.phone || 'Not provided'}</p></div>
                </div>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold text-lg mb-4">Profile Information</h3>
                    <form id="profile-form" class="space-y-4" onsubmit="window.ProfilePage.updateProfile(event)">
                        <div class="grid gap-4 md:grid-cols-2">
                            <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" name="name" value="${user?.name || ''}" class="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"></div>
                            <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" name="email" value="${user?.email || ''}" class="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"></div>
                        </div>
                        <div class="grid gap-4 md:grid-cols-2">
                            <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" name="phone" value="${user?.phone || ''}" class="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"></div>
                            <div><label class="block text-sm font-medium mb-1">Role</label><input type="text" value="${user?.role}" disabled class="w-full rounded-lg border border-input bg-muted px-4 py-2 text-sm text-muted-foreground"></div>
                        </div>
                        <div class="flex justify-end"><button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Profile</button></div>
                    </form>
                </div>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold text-lg mb-4">Change Password</h3>
                    <form id="password-form" class="space-y-4" onsubmit="window.ProfilePage.updatePassword(event)">
                        <div><label class="block text-sm font-medium mb-1">Current Password</label><input type="password" id="current-password" required class="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"></div>
                        <div class="grid gap-4 md:grid-cols-2">
                            <div><label class="block text-sm font-medium mb-1">New Password</label><input type="password" id="new-password" required minlength="8" class="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"></div>
                            <div><label class="block text-sm font-medium mb-1">Confirm New Password</label><input type="password" id="confirm-password" required class="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"></div>
                        </div>
                        <div class="flex justify-end"><button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update Password</button></div>
                    </form>
                </div>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold text-lg mb-4">Preferences</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between"><div><p class="font-medium">Email Notifications</p><p class="text-sm text-muted-foreground">Receive email updates about important events</p></div><button onclick="window.ProfilePage.togglePreference('email')" id="pref-email" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user?.preferences?.email !== false ? 'bg-primary' : 'bg-muted'}"><span class="translate-x-${user?.preferences?.email !== false ? '6' : '1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span></button></div>
                        <div class="flex items-center justify-between"><div><p class="font-medium">Push Notifications</p><p class="text-sm text-muted-foreground">Show desktop notifications</p></div><button onclick="window.ProfilePage.togglePreference('push')" id="pref-push" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user?.preferences?.push !== false ? 'bg-primary' : 'bg-muted'}"><span class="translate-x-${user?.preferences?.push !== false ? '6' : '1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span></button></div>
                        <div class="flex items-center justify-between"><div><p class="font-medium">Dark Mode</p><p class="text-sm text-muted-foreground">Use dark theme</p></div><button onclick="window.ProfilePage.togglePreference('darkMode')" id="pref-darkmode" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${document.documentElement.classList.contains('dark') ? 'bg-primary' : 'bg-muted'}"><span class="translate-x-${document.documentElement.classList.contains('dark') ? '6' : '1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span></button></div>
                    </div>
                </div>
                
                <div class="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-6">
                    <h3 class="font-semibold text-lg mb-4 text-red-700 dark:text-red-400">Account Actions</h3>
                    <div class="flex gap-3"><button onclick="window.ProfilePage.downloadData()" class="px-4 py-2 border rounded-lg hover:bg-red-100 transition-colors"><i data-lucide="download" class="h-4 w-4 inline mr-2"></i>Download My Data</button><button onclick="window.ProfilePage.deactivateAccount()" class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><i data-lucide="user-x" class="h-4 w-4 inline mr-2"></i>Deactivate Account</button></div>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    async loadUserStats() {
        try {
            const response = await apiClient.get('/api/user/stats');
            return response.data || {};
        } catch (error) {
            console.error('Failed to load user stats:', error);
            return {};
        }
    },
    
    async updateProfile(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const profileData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };
        
        toast.loading(true);
        try {
            const response = await apiClient.put('/api/user/profile', profileData);
            if (response.success) {
                toast.success('✅ Profile updated successfully');
                const user = store.getState('user');
                Object.assign(user, profileData);
                store.dispatch({ type: 'USER_UPDATED', payload: { user } });
                window.Header?.updateUserInfo();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            toast.loading(false);
        }
    },
    
    async updatePassword(event) {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all password fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        
        toast.loading(true);
        try {
            const response = await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
            if (response.success) {
                toast.success('✅ Password changed successfully');
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            toast.loading(false);
        }
    },
    
    async togglePreference(prefKey) {
        const user = store.getState('user');
        const preferences = user?.preferences || {};
        preferences[prefKey] = !preferences[prefKey];
        
        if (prefKey === 'darkMode') {
            window.theme?.toggle();
        }
        
        toast.loading(true);
        try {
            const response = await apiClient.put('/api/user/preferences', preferences);
            if (response.success) {
                store.dispatch({ type: 'USER_UPDATED', payload: { user: { ...user, preferences } } });
                toast.success('Preferences updated');
            }
        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            toast.loading(false);
        }
    },
    
    async downloadData() {
        toast.loading(true);
        try {
            const response = await apiClient.get('/api/user/export');
            const data = response.data;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shuleai_my_data_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('✅ Data exported successfully');
        } catch (error) {
            toast.error('Failed to export data');
        } finally {
            toast.loading(false);
        }
    },
    
    async deactivateAccount() {
        if (!confirm('⚠️ Are you sure you want to deactivate your account? You can reactivate later by contacting support.')) return;
        
        const reason = prompt('Please tell us why you are deactivating (optional):');
        
        toast.loading(true);
        try {
            const response = await apiClient.post('/api/user/deactivate', { reason });
            if (response.success) {
                toast.success('Account deactivated. Logging out...');
                setTimeout(() => window.auth?.logout(), 2000);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to deactivate account');
        } finally {
            toast.loading(false);
        }
    }
};

window.ProfilePage = ProfilePage;