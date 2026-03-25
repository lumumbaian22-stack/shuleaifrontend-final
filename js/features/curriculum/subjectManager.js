// js/features/curriculum/subjectManager.js
import { CURRICULUM_CONFIG } from '../../constants/curriculum.js';
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { store } from '../../core/store.js';

export const subjectManager = {
    customSubjects: [],
    
    loadCustomSubjects() {
        const schoolSettings = store.getState('schoolSettings');
        this.customSubjects = schoolSettings?.customSubjects || [];
        return this.customSubjects;
    },
    
    getAllSubjects(curriculum, level) {
        const config = CURRICULUM_CONFIG[curriculum];
        if (!config) return [];
        
        const subjects = config.subjects[level] || config.subjects.secondary || [];
        return [...subjects, ...this.customSubjects];
    },
    
    async addCustomSubject(subjectName) {
        if (!subjectName) {
            toast.error('Please enter a subject name');
            return false;
        }
        
        if (this.customSubjects.includes(subjectName)) {
            toast.warning('Subject already exists');
            return false;
        }
        
        this.customSubjects.push(subjectName);
        
        try {
            const schoolSettings = store.getState('schoolSettings');
            const response = await apiClient.put('/api/admin/settings', {
                ...schoolSettings,
                customSubjects: this.customSubjects
            });
            
            if (response.success) {
                store.dispatch({
                    type: 'SCHOOL_UPDATED',
                    payload: { school: response.data }
                });
                toast.success(`Subject "${subjectName}" added`);
                return true;
            }
        } catch (error) {
            // Rollback
            this.customSubjects = this.customSubjects.filter(s => s !== subjectName);
            toast.error(error.message || 'Failed to add subject');
            return false;
        }
    },
    
    async removeCustomSubject(subjectName) {
        if (!confirm(`Remove "${subjectName}" from custom subjects?`)) return false;
        
        this.customSubjects = this.customSubjects.filter(s => s !== subjectName);
        
        try {
            const schoolSettings = store.getState('schoolSettings');
            const response = await apiClient.put('/api/admin/settings', {
                ...schoolSettings,
                customSubjects: this.customSubjects
            });
            
            if (response.success) {
                store.dispatch({
                    type: 'SCHOOL_UPDATED',
                    payload: { school: response.data }
                });
                toast.info(`Subject "${subjectName}" removed`);
                return true;
            }
        } catch (error) {
            // Rollback
            this.customSubjects.push(subjectName);
            toast.error(error.message || 'Failed to remove subject');
            return false;
        }
    },
    
    showSubjectManagerModal() {
        const schoolSettings = store.getState('schoolSettings');
        const curriculum = schoolSettings?.curriculum || 'cbc';
        const schoolLevel = schoolSettings?.schoolLevel || 'secondary';
        const coreSubjects = this.getAllSubjects(curriculum, schoolLevel);
        
        const modal = modalManager.create('subject-manager-modal', 'Manage Subjects');
        modal.setContent(`
            <div class="space-y-6">
                <div>
                    <h4 class="text-sm font-medium mb-3">Core Subjects</h4>
                    <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        ${coreSubjects.filter(s => !this.customSubjects.includes(s)).map(subject => `
                            <div class="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <span class="text-sm">${subject}</span>
                                <span class="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">core</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 class="text-sm font-medium mb-3">Custom Subjects</h4>
                    <div class="flex gap-2 mb-3">
                        <input type="text" id="new-subject-name" placeholder="e.g., French, Computer Science" class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <button onclick="window.subjectManager.addSubject()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add</button>
                    </div>
                    <div id="custom-subjects-list" class="space-y-2 max-h-48 overflow-y-auto">
                        ${this.customSubjects.map(subject => `
                            <div class="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                                <span class="text-sm">${subject}</span>
                                <button onclick="window.subjectManager.removeSubject('${subject}')" class="text-red-500 hover:text-red-700">
                                    <i data-lucide="x" class="h-4 w-4"></i>
                                </button>
                            </div>
                        `).join('')}
                        ${this.customSubjects.length === 0 ? '<p class="text-sm text-muted-foreground text-center py-4">No custom subjects added yet</p>' : ''}
                    </div>
                </div>
                
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('subject-manager-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
                </div>
            </div>
        `);
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    async addSubject() {
        const subjectName = document.getElementById('new-subject-name')?.value.trim();
        if (!subjectName) {
            toast.error('Please enter a subject name');
            return;
        }
        
        const success = await this.addCustomSubject(subjectName);
        
        if (success) {
            document.getElementById('new-subject-name').value = '';
            this.refreshCustomSubjectsList();
        }
    },
    
    async removeSubject(subjectName) {
        const success = await this.removeCustomSubject(subjectName);
        if (success) {
            this.refreshCustomSubjectsList();
        }
    },
    
    refreshCustomSubjectsList() {
        const container = document.getElementById('custom-subjects-list');
        if (container) {
            if (this.customSubjects.length === 0) {
                container.innerHTML = '<p class="text-sm text-muted-foreground text-center py-4">No custom subjects added yet</p>';
            } else {
                container.innerHTML = this.customSubjects.map(subject => `
                    <div class="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                        <span class="text-sm">${subject}</span>
                        <button onclick="window.subjectManager.removeSubject('${subject}')" class="text-red-500 hover:text-red-700">
                            <i data-lucide="x" class="h-4 w-4"></i>
                        </button>
                    </div>
                `).join('');
            }
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
};

window.subjectManager = subjectManager;