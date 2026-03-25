// js/features/payments/SubscriptionManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatCurrency } from '../../core/utils.js';

export const subscriptionManager = {
    async getPlans() {
        try {
            const response = await apiClient.get('/api/parent/plans');
            return response.data || [];
        } catch (error) {
            console.error('Failed to load plans:', error);
            return [
                { id: 'basic', name: 'Basic', price: 3, features: ['View attendance', 'Report absence'] },
                { id: 'premium', name: 'Premium', price: 10, features: ['Everything in Basic', 'Grades & progress', 'Teacher comments'] },
                { id: 'ultimate', name: 'Ultimate', price: 20, features: ['Everything in Premium', 'Live chat', 'Priority support'] }
            ];
        }
    },
    
    async upgradePlan(studentId, newPlan) {
        if (!studentId || !newPlan) {
            toast.error('Student and plan are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/parent/upgrade-plan', {
                studentId: parseInt(studentId),
                newPlan
            });
            
            if (response.success) {
                toast.success(`✅ Upgrade to ${newPlan} plan initiated`);
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upgrade plan');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    showPlansModal(studentId, studentName, currentPlan) {
        this.getPlans().then(plans => {
            const modal = modalManager.create('subscription-plans-modal', `Subscription Plans - ${studentName}`);
            modal.setContent(`
                <div class="space-y-4">
                    <p class="text-sm text-muted-foreground">Current Plan: <span class="font-semibold">${currentPlan || 'Basic'}</span></p>
                    <div class="space-y-3">
                        ${plans.map(plan => `
                            <div class="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer" onclick="window.subscriptionManager.selectPlan('${studentId}', '${plan.id}', '${plan.name}')">
                                <div class="flex justify-between items-center mb-2">
                                    <p class="font-semibold">${plan.name}</p>
                                    <p class="text-lg font-bold text-primary">${formatCurrency(plan.price)}<span class="text-xs font-normal text-muted-foreground">/mo</span></p>
                                </div>
                                <ul class="space-y-1">
                                    ${plan.features.map(feature => `
                                        <li class="text-xs flex items-center gap-1">
                                            <i data-lucide="check" class="h-3 w-3 text-green-600"></i>
                                            ${feature}
                                        </li>
                                    `).join('')}
                                </ul>
                                ${plan.id === currentPlan ? 
                                    `<span class="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Current Plan</span>` :
                                    `<button class="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">Upgrade to ${plan.name}</button>`
                                }
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-end gap-2 pt-4 border-t">
                        <button onclick="window.modalManager?.close('subscription-plans-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                    </div>
                </div>
            `);
            modal.open();
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    },
    
    async selectPlan(studentId, planId, planName) {
        const confirmed = confirm(`Upgrade to ${planName} plan?`);
        if (!confirmed) return;
        
        const success = await this.upgradePlan(studentId, planId);
        
        if (success) {
            modalManager.close('subscription-plans-modal');
            if (window.dashboard && window.dashboard.refreshSubscription) {
                window.dashboard.refreshSubscription();
            }
        }
    }
};

window.subscriptionManager = subscriptionManager;