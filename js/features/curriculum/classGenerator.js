// js/features/curriculum/classGenerator.js
import { CURRICULUM_CONFIG, CURRICULUM } from '../../constants/curriculum.js';
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';

export const classGenerator = {
    async generateClasses(schoolId, curriculum, schoolLevel, streamCount = 1, streamNames = []) {
        const config = CURRICULUM_CONFIG[curriculum];
        if (!config) {
            throw new Error('Invalid curriculum');
        }
        
        // Determine which levels to generate based on school level
        let levelsToGenerate = [];
        
        if (curriculum === CURRICULUM.CBC) {
            if (schoolLevel === 'primary') {
                levelsToGenerate = ['pre_primary', 'lower_primary', 'upper_primary', 'junior_secondary'];
            } else if (schoolLevel === 'secondary') {
                levelsToGenerate = ['senior_secondary'];
            } else {
                levelsToGenerate = ['pre_primary', 'lower_primary', 'upper_primary', 'junior_secondary', 'senior_secondary'];
            }
        } else if (curriculum === CURRICULUM.EIGHT_FOUR_FOUR) {
            if (schoolLevel === 'primary') {
                levelsToGenerate = ['primary'];
            } else if (schoolLevel === 'secondary') {
                levelsToGenerate = ['secondary'];
            } else {
                levelsToGenerate = ['primary', 'secondary'];
            }
        } else if (curriculum === CURRICULUM.BRITISH) {
            if (schoolLevel === 'primary') {
                levelsToGenerate = ['primary'];
            } else if (schoolLevel === 'secondary') {
                levelsToGenerate = ['lower_secondary', 'upper_secondary'];
            } else {
                levelsToGenerate = ['primary', 'lower_secondary', 'upper_secondary'];
            }
        } else if (curriculum === CURRICULUM.AMERICAN) {
            if (schoolLevel === 'primary') {
                levelsToGenerate = ['elementary'];
            } else if (schoolLevel === 'secondary') {
                levelsToGenerate = ['middle', 'high'];
            } else {
                levelsToGenerate = ['elementary', 'middle', 'high'];
            }
        }
        
        const classes = [];
        
        for (const levelKey of levelsToGenerate) {
            const level = config.levels[levelKey];
            if (level && level.classes) {
                for (const className of level.classes) {
                    for (let s = 0; s < streamCount; s++) {
                        const suffix = streamCount > 1 ? ` ${streamNames[s] || String.fromCharCode(65 + s)}` : '';
                        classes.push({
                            name: `${className}${suffix}`,
                            grade: className,
                            stream: streamCount > 1 ? (streamNames[s] || String.fromCharCode(65 + s)) : null,
                            academicYear: new Date().getFullYear().toString()
                        });
                    }
                }
            }
        }
        
        return classes;
    },
    
    async createClasses(schoolId, classes) {
        const results = {
            created: 0,
            failed: 0,
            errors: []
        };
        
        for (const classData of classes) {
            try {
                await apiClient.post('/api/admin/classes', classData);
                results.created++;
            } catch (error) {
                results.failed++;
                results.errors.push({ class: classData.name, error: error.message });
            }
        }
        
        return results;
    },
    
    showClassGenerationModal() {
        const modal = modalManager.create('generate-classes-modal', 'Generate Classes');
        modal.setContent(`
            <div class="space-y-4">
                <p class="text-sm text-muted-foreground">Generate classes based on your curriculum and school level.</p>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Number of Streams</label>
                    <select id="stream-count" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onchange="window.classGenerator.updateStreamInputs()">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                
                <div id="stream-names-container" class="hidden">
                    <label class="block text-sm font-medium mb-1">Stream Names</label>
                    <div id="stream-names-inputs" class="space-y-2"></div>
                </div>
                
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p class="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
                        <i data-lucide="alert-triangle" class="h-4 w-4 flex-shrink-0 mt-0.5"></i>
                        <span>This will create multiple classes. Existing classes will not be duplicated.</span>
                    </p>
                </div>
                
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('generate-classes-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.classGenerator.handleGenerate()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Generate Classes</button>
                </div>
            </div>
        `);
        modal.open();
        
        // Initialize stream inputs
        this.updateStreamInputs();
    },
    
    updateStreamInputs() {
        const streamCount = parseInt(document.getElementById('stream-count')?.value || 1);
        const container = document.getElementById('stream-names-container');
        const inputsContainer = document.getElementById('stream-names-inputs');
        
        if (streamCount > 1) {
            container.classList.remove('hidden');
            inputsContainer.innerHTML = '';
            
            for (let i = 0; i < streamCount; i++) {
                const defaultName = String.fromCharCode(65 + i);
                inputsContainer.innerHTML += `
                    <div>
                        <input type="text" class="stream-name w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" 
                               placeholder="Stream ${i+1} Name" value="${defaultName}">
                    </div>
                `;
            }
        } else {
            container.classList.add('hidden');
        }
    },
    
    async handleGenerate() {
        const streamCount = parseInt(document.getElementById('stream-count')?.value || 1);
        const streamNames = [];
        
        if (streamCount > 1) {
            const nameInputs = document.querySelectorAll('.stream-name');
            nameInputs.forEach(input => {
                if (input.value.trim()) {
                    streamNames.push(input.value.trim());
                }
            });
        }
        
        // Get school settings from store
        const school = window.store?.getState('school') || {};
        const curriculum = school.system || 'cbc';
        const schoolLevel = school.settings?.schoolLevel || 'both';
        
        toast.loading(true);
        
        try {
            const classes = await this.generateClasses(school.id, curriculum, schoolLevel, streamCount, streamNames);
            
            // Check existing classes
            const existingResponse = await apiClient.get('/api/admin/classes');
            const existingNames = new Set((existingResponse.data || []).map(c => c.name));
            const newClasses = classes.filter(c => !existingNames.has(c.name));
            
            if (newClasses.length === 0) {
                toast.info('All classes already exist');
                modalManager.close('generate-classes-modal');
                return;
            }
            
            const confirmMessage = `Generate ${newClasses.length} new classes?\n\nProceed?`;
            if (!confirm(confirmMessage)) {
                return;
            }
            
            const results = await this.createClasses(school.id, newClasses);
            
            toast.success(`✅ Created ${results.created} classes${results.failed > 0 ? `, ${results.failed} failed` : ''}`);
            modalManager.close('generate-classes-modal');
            
            // Refresh classes list
            if (window.dashboard && window.dashboard.refreshClasses) {
                window.dashboard.refreshClasses();
            }
            
        } catch (error) {
            toast.error(error.message || 'Failed to generate classes');
        } finally {
            toast.loading(false);
        }
    }
};

window.classGenerator = classGenerator;