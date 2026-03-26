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
                    <h2 class="text-2xl font-bold">Parent Dashboard</h
