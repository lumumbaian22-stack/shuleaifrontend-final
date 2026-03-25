// js/features/auth/signup.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { API_ENDPOINTS } from '../../constants/api.js';

export const signup = {
    async verifySchoolCode() {
        const code = document.getElementById('auth-school-code')?.value;
        if (!code) {
            toast.error('Please enter a school code');
            return;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_SCHOOL, { schoolCode: code });
            
            const statusDiv = document.getElementById('school-verify-status');
            if (statusDiv) {
                statusDiv.className = 'text-xs mt-1 p-2 bg-green-100 text-green-700 rounded-lg';
                statusDiv.innerHTML = `<i data-lucide="check-circle" class="h-3 w-3 inline mr-1"></i> Verified: ${response.data.schoolName}`;
                statusDiv.classList.remove('hidden');
                
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
            
            toast.success(`School found: ${response.data.schoolName}`);
        } catch (error) {
            const statusDiv = document.getElementById('school-verify-status');
            if (statusDiv) {
                statusDiv.className = 'text-xs mt-1 p-2 bg-red-100 text-red-700 rounded-lg';
                statusDiv.innerHTML = `<i data-lucide="x-circle" class="h-3 w-3 inline mr-1"></i> ${error.message}`;
                statusDiv.classList.remove('hidden');
                
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
            
            toast.error(error.message || 'Invalid school code');
        } finally {
            toast.loading(false);
        }
    }
};

window.verifySchoolCodeInput = () => signup.verifySchoolCode();