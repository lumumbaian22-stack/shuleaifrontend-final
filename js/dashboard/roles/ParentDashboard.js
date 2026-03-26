// js/dashboard/roles/ParentDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml } from '../../core/utils.js';

export class ParentDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.children = [];
        this.childSummary = null;
    }

    async loadData() {
        console.log('📊 Loading parent dashboard data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            const childrenRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/parent/children', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (childrenRes.ok) {
                const data = await childrenRes.json();
                this.children = data.data || [];
                
                if (this.children.length > 0) {
                    const summaryRes = await fetch(`https://shuleaibackend-32h1.onrender.com/api/parent/child/${this.children[0].id}/summary`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (summaryRes.ok) {
                        const summaryData = await summaryRes.json();
                        this.childSummary = summaryData.data;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading parent data:', error);
        }
    }

    render() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const avgScore = this.childSummary?.averageScore || 0;
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h2 class="text-2xl font-bold">Parent Dashboard</h2>
                    <p class="text-muted-foreground mt-2">Welcome, ${escapeHtml(user.name) || 'Parent'}!</p>
                </div>
                
                ${this.children.length > 0 ? `
                <div class="flex gap-2 border-b pb-4 overflow-x-auto">
                    ${this.children.map(child => `<button class="px-4 py-2 bg-muted rounded-lg">${escapeHtml(child.User?.name) || 'Child'} (Grade ${child.grade})</button>`).join('')}
                </div>
                ` : '<div class="text-center text-muted-foreground py-4">No children linked to your account</div>'}
                
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Attendance</p><h3 class="text-2xl font-bold">95%</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Class Average</p><h3 class="text-2xl font-bold">${avgScore}%</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Homework</p><h3 class="text-2xl font-bold">3</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Fee Balance</p><h3 class="text-2xl font-bold">$250</h3></div></div>
                </div>
                
                <div class="grid gap-4 md:grid-cols-3">
                    <button onclick="window.router?.navigate('progress')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="trending-up" class="h-8 w-8 mx-auto mb-3 text-green-600"></i><h4 class="font-semibold text-center">Academic Progress</h4></button>
                    <button onclick="window.router?.navigate('payments')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="credit-card" class="h-8 w-8 mx-auto mb-3 text-blue-600"></i><h4 class="font-semibold text-center">Payments</h4></button>
                    <button onclick="window.router?.navigate('chat')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="message-circle" class="h-8 w-8 mx-auto mb-3 text-purple-600"></i><h4 class="font-semibold text-center">Message Teacher</h4></button>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    showSection(section) {
        console.log('Showing section:', section);
        this.refresh();
    }
}
