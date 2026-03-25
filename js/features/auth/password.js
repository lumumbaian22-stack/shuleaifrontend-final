// js/features/auth/password.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { API_ENDPOINTS } from '../../constants/api.js';

export const password = {
    async changePassword(currentPassword, newPassword, confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all password fields');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return false;
        }
        
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                currentPassword,
                newPassword
            });
            
            if (response.success) {
                toast.success('Password changed successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async setFirstPassword(elimuid, newPassword, confirmPassword) {
        if (!newPassword || !confirmPassword) {
            toast.error('Please enter and confirm your new password');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/student/set-first-password', {
                elimuid,
                newPassword
            });
            
            if (response.success) {
                toast.success('Password set successfully! Please login with your new password.');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to set password');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showFirstTimePasswordModal(elimuid) {
        const modal = modalManager.create('first-password-modal', 'Set Your Password');
        modal.setContent(`
            <div class="space-y-4">
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p class="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                        <i data-lucide="alert-circle" class="h-5 w-5 flex-shrink-0"></i>
                        <span>This is your first login. Please set a new password to continue.</span>
                    </p>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">New Password</label>
                    <input type="password" id="new-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Enter new password" required>
                    <p class="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input type="password" id="confirm-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Confirm new password" required>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('first-password-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.password.handleFirstPasswordChange('${elimuid}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Set Password</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleFirstPasswordChange(elimuid) {
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;
        
        const success = await this.setFirstPassword(elimuid, newPassword, confirmPassword);
        
        if (success) {
            modalManager.close('first-password-modal');
            // Show login form again
            if (typeof window.openStudentLoginModal === 'function') {
                window.openStudentLoginModal();
            }
        }
    }
};

window.password = password;