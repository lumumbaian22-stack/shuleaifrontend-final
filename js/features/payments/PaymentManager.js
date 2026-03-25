// js/features/payments/PaymentManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, formatCurrency } from '../../core/utils.js';

export const paymentManager = {
    async makePayment(studentId, amount, method, plan, reference = null) {
        if (!studentId || !amount || !method || !plan) {
            toast.error('Please fill all required fields');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/parent/pay', {
                studentId: parseInt(studentId),
                amount: parseFloat(amount),
                method,
                plan,
                reference: reference || `PAY-${Date.now()}`
            });
            
            if (response.success) {
                toast.success('✅ Payment initiated');
                return response.data;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to process payment');
            return null;
        } finally {
            toast.loading(false);
        }
    },
    
    async getPaymentHistory() {
        try {
            const response = await apiClient.get('/api/parent/payments');
            return response.data?.payments || [];
        } catch (error) {
            console.error('Failed to load payments:', error);
            return [];
        }
    },
    
    async confirmPayment(paymentId, transactionId) {
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/parent/payment-confirm', {
                paymentId,
                transactionId
            });
            
            if (response.success) {
                toast.success('✅ Payment confirmed');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to confirm payment');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    renderPaymentHistory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.getPaymentHistory().then(payments => {
            if (!payments || payments.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center">
                        <i data-lucide="credit-card" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                        <p class="text-muted-foreground">No payment history</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="space-y-2">
                    ${payments.map(payment => `
                        <div class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div>
                                <p class="text-sm font-medium">${payment.Student?.User?.name || 'Payment'}</p>
                                <p class="text-xs text-muted-foreground">${formatDate(payment.createdAt)}</p>
                                <p class="text-xs text-muted-foreground">Ref: ${payment.reference || 'N/A'}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold">${formatCurrency(payment.amount)}</p>
                                <span class="text-xs ${payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}">
                                    ${payment.status}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    },
    
    showPaymentModal(studentId, studentName, plans) {
        const modal = modalManager.create('payment-modal', `Make Payment - ${studentName}`);
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Select Plan</label>
                    <select id="payment-plan" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select Plan</option>
                        ${plans.map(plan => `
                            <option value="${plan.id}" data-price="${plan.price}">${plan.name} - ${formatCurrency(plan.price)}/mo</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Amount</label>
                    <input type="number" id="payment-amount" placeholder="Amount" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Payment Method</label>
                    <select id="payment-method" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Credit Card</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('payment-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.paymentManager.handlePayment('${studentId}')" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Pay Now</button>
                </div>
            </div>
        `);
        modal.open();
        
        // Auto-fill amount when plan is selected
        const planSelect = document.getElementById('payment-plan');
        const amountInput = document.getElementById('payment-amount');
        if (planSelect && amountInput) {
            planSelect.addEventListener('change', () => {
                const selectedOption = planSelect.options[planSelect.selectedIndex];
                const price = selectedOption?.dataset?.price;
                if (price) {
                    amountInput.value = price;
                }
            });
        }
    },
    
    async handlePayment(studentId) {
        const plan = document.getElementById('payment-plan')?.value;
        const amount = document.getElementById('payment-amount')?.value;
        const method = document.getElementById('payment-method')?.value;
        
        if (!plan || !amount || !method) {
            toast.error('Please fill all fields');
            return;
        }
        
        const result = await this.makePayment(studentId, amount, method, plan);
        
        if (result) {
            modalManager.close('payment-modal');
            
            // Show school payment details
            if (result.school) {
                alert(`Payment Instructions:
School: ${result.school.name}
Bank: ${result.school.bankDetails?.bankName || 'N/A'}
Account: ${result.school.bankDetails?.accountNumber || 'N/A'}
Amount: ${formatCurrency(amount)}
                
Please complete the payment and the school will confirm.`);
            }
        }
    }
};

window.paymentManager = paymentManager;