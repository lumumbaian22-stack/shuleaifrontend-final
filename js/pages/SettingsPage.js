// js/pages/SettingsPage.js
import { store } from '../core/store.js';
import { apiClient } from '../api/client.js';
import { toast } from '../ui/feedback/Toast.js';
import { CURRICULUM_CONFIG, CURRICULUM } from '../constants/curriculum.js';

export const SettingsPage = {
    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const user = store.getState('user');
        const school = store.getState('school');
        const role = user?.role;
        
        if (role === 'super_admin') {
            await this.renderSuperAdminSettings(container);
        } else if (role === 'admin') {
            await this.renderAdminSettings(container);
        } else {
            container.innerHTML = '<div class="text-center py-12 text-muted-foreground">You do not have permission to view settings</div>';
        }
    },
    
    async renderSuperAdminSettings(container) {
        const settings = await this.loadPlatformSettings();
        
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">Platform Settings</h2>
                <p class="text-sm text-muted-foreground">Configure global platform settings. Changes affect all schools.</p>
                
                <div class="grid gap-6">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">General Settings</h3>
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Platform Name</label><input type="text" id="platform-name" value="${settings.platformName || 'ShuleAI'}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">Default Curriculum for New Schools</label><select id="default-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="cbc" ${settings.defaultCurriculum === 'cbc' ? 'selected' : ''}>CBC</option><option value="844" ${settings.defaultCurriculum === '844' ? 'selected' : ''}>8-4-4</option><option value="british" ${settings.defaultCurriculum === 'british' ? 'selected' : ''}>British</option><option value="american" ${settings.defaultCurriculum === 'american' ? 'selected' : ''}>American</option></select></div>
                            <div><label class="block text-sm font-medium mb-1">Name Change Fee ($)</label><input type="number" id="name-change-fee" value="${settings.nameChangeFee || 50}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Platform Controls</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-muted/30 rounded-lg"><div><p class="font-medium">Maintenance Mode</p><p class="text-sm text-muted-foreground">When enabled, only super admins can access the platform</p></div><button id="maintenance-mode" onclick="window.SettingsPage.toggleMaintenanceMode()" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-primary' : 'bg-muted'}"><span class="translate-x-${settings.maintenanceMode ? '6' : '1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span></button></div>
                            <div class="flex items-center justify-between p-3 bg-muted/30 rounded-lg"><div><p class="font-medium">Allow New Registrations</p><p class="text-sm text-muted-foreground">Allow new schools to sign up</p></div><button id="allow-registrations" onclick="window.SettingsPage.toggleNewRegistrations()" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowNewRegistrations ? 'bg-primary' : 'bg-muted'}"><span class="translate-x-${settings.allowNewRegistrations ? '6' : '1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span></button></div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3"><button onclick="window.SettingsPage.resetPlatformSettings()" class="px-6 py-3 border rounded-lg hover:bg-accent">Reset to Default</button><button onclick="window.SettingsPage.savePlatformSettings()" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Settings</button></div>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    async renderAdminSettings(container) {
        const school = store.getState('school');
        const curriculum = school?.system || 'cbc';
        const schoolLevel = school?.settings?.schoolLevel || 'secondary';
        const customSubjects = school?.settings?.customSubjects || [];
        const curriculumInfo = CURRICULUM_CONFIG[curriculum];
        
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-2xl font-bold">School Settings</h2>
                <p class="text-sm text-muted-foreground">Changes made here will reflect across all dashboards for this school.</p>
                
                <div class="grid gap-6">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">School Information</h3>
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">School Name</label><input type="text" id="school-name" value="${school?.name || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                            <div><label class="block text-sm font-medium mb-1">School Level</label><select id="school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="primary" ${schoolLevel === 'primary' ? 'selected' : ''}>Primary</option><option value="secondary" ${schoolLevel === 'secondary' ? 'selected' : ''}>Secondary</option><option value="both" ${schoolLevel === 'both' ? 'selected' : ''}>Both</option></select></div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Curriculum Settings</h3>
                        <div class="space-y-4">
                            <div><label class="block text-sm font-medium mb-1">Select Curriculum</label><select id="curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="cbc" ${curriculum === 'cbc' ? 'selected' : ''}>CBC</option><option value="844" ${curriculum === '844' ? 'selected' : ''}>8-4-4</option><option value="british" ${curriculum === 'british' ? 'selected' : ''}>British</option><option value="american" ${curriculum === 'american' ? 'selected' : ''}>American</option></select></div>
                            <div class="p-4 bg-muted/30 rounded-lg"><h4 class="font-sm font-medium mb-2">Curriculum Information</h4><p class="text-sm text-muted-foreground"><span class="font-medium">Name:</span> ${curriculumInfo?.name || 'N/A'}</p><p class="text-sm text-muted-foreground mt-1"><span class="font-medium">Grade Levels:</span> ${Object.values(curriculumInfo?.levels || {}).flatMap(l => l.classes).join(', ')}</p><p class="text-sm text-muted-foreground mt-1"><span class="font-medium">Core Subjects:</span> ${curriculumInfo?.subjects[schoolLevel]?.join(', ') || 'N/A'}</p></div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Custom Subjects</h3>
                        <div class="space-y-4">
                            <div class="flex gap-2"><input type="text" id="new-subject" placeholder="e.g., French, Computer Science" class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"><button onclick="window.SettingsPage.addCustomSubject()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Add</button></div>
                            <div id="custom-subjects-list" class="flex flex-wrap gap-2">${customSubjects.map(s => `<span class="inline-flex items-center gap-1 px-3 py-1 bg-secondary/30 rounded-full text-sm"><span>${s}</span><button onclick="window.SettingsPage.removeCustomSubject('${s}')" class="text-red-500 hover:text-red-700"><i data-lucide="x" class="h-3 w-3"></i></button></span>`).join('')}</div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end"><button onclick="window.SettingsPage.saveSchoolSettings()" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Settings</button></div>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    async loadPlatformSettings() {
        try {
            const response = await apiClient.get('/api/super-admin/settings');
            return response.data || {};
        } catch (error) {
            console.error('Failed to load platform settings:', error);
            return {};
        }
    },
    
    async savePlatformSettings() {
        const platformName = document.getElementById('platform-name')?.value;
        const defaultCurriculum = document.getElementById('default-curriculum')?.value;
        const nameChangeFee = document.getElementById('name-change-fee')?.value;
        const maintenanceMode = document.getElementById('maintenance-mode')?.classList.contains('bg-primary');
        const allowNewRegistrations = document.getElementById('allow-registrations')?.classList.contains('bg-primary');
        
        toast.loading(true);
        try {
            const response = await apiClient.put('/api/super-admin/settings', {
                platformName,
                defaultCurriculum,
                nameChangeFee: parseInt(nameChangeFee),
                maintenanceMode,
                allowNewRegistrations
            });
            if (response.success) {
                toast.success('✅ Platform settings saved');
                await this.renderSuperAdminSettings(document.getElementById('settings-content'));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            toast.loading(false);
        }
    },
    
    async saveSchoolSettings() {
        const schoolName = document.getElementById('school-name')?.value;
        const schoolLevel = document.getElementById('school-level')?.value;
        const curriculum = document.getElementById('curriculum')?.value;
        
        toast.loading(true);
        try {
            const response = await apiClient.put('/api/admin/settings', {
                schoolName,
                schoolLevel,
                curriculum,
                customSubjects: window.customSubjects || []
            });
            if (response.success) {
                toast.success('✅ School settings saved');
                store.dispatch({ type: 'SCHOOL_UPDATED', payload: { school: response.data } });
                store.dispatch({ type: 'CURRICULUM_UPDATED', payload: { curriculum } });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            toast.loading(false);
        }
    },
    
    addCustomSubject() {
        const subject = document.getElementById('new-subject')?.value.trim();
        if (!subject) {
            toast.error('Please enter a subject name');
            return;
        }
        
        if (!window.customSubjects) window.customSubjects = [];
        if (window.customSubjects.includes(subject)) {
            toast.warning('Subject already exists');
            return;
        }
        
        window.customSubjects.push(subject);
        
        const container = document.getElementById('custom-subjects-list');
        if (container) {
            container.innerHTML += `<span class="inline-flex items-center gap-1 px-3 py-1 bg-secondary/30 rounded-full text-sm"><span>${subject}</span><button onclick="window.SettingsPage.removeCustomSubject('${subject}')" class="text-red-500 hover:text-red-700"><i data-lucide="x" class="h-3 w-3"></i></button></span>`;
            document.getElementById('new-subject').value = '';
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },
    
    removeCustomSubject(subject) {
        if (!confirm(`Remove "${subject}" from custom subjects?`)) return;
        
        window.customSubjects = window.customSubjects.filter(s => s !== subject);
        
        const container = document.getElementById('custom-subjects-list');
        if (container) {
            const item = Array.from(container.children).find(el => el.textContent.includes(subject));
            if (item) item.remove();
        }
    },
    
    toggleMaintenanceMode() {
        const btn = document.getElementById('maintenance-mode');
        const isEnabled = btn.classList.contains('bg-primary');
        if (isEnabled) {
            btn.classList.remove('bg-primary');
            btn.classList.add('bg-muted');
            btn.querySelector('span').classList.remove('translate-x-6');
            btn.querySelector('span').classList.add('translate-x-1');
        } else {
            btn.classList.remove('bg-muted');
            btn.classList.add('bg-primary');
            btn.querySelector('span').classList.remove('translate-x-1');
            btn.querySelector('span').classList.add('translate-x-6');
        }
    },
    
    toggleNewRegistrations() {
        const btn = document.getElementById('allow-registrations');
        const isEnabled = btn.classList.contains('bg-primary');
        if (isEnabled) {
            btn.classList.remove('bg-primary');
            btn.classList.add('bg-muted');
            btn.querySelector('span').classList.remove('translate-x-6');
            btn.querySelector('span').classList.add('translate-x-1');
        } else {
            btn.classList.remove('bg-muted');
            btn.classList.add('bg-primary');
            btn.querySelector('span').classList.remove('translate-x-1');
            btn.querySelector('span').classList.add('translate-x-6');
        }
    },
    
    resetPlatformSettings() {
        if (!confirm('⚠️ Reset all platform settings to default? This cannot be undone.')) return;
        document.getElementById('platform-name').value = 'ShuleAI';
        document.getElementById('default-curriculum').value = 'cbc';
        document.getElementById('name-change-fee').value = '50';
        this.toggleMaintenanceMode();
        this.toggleNewRegistrations();
        toast.info('Settings reset to default');
    }
};

window.SettingsPage = SettingsPage;