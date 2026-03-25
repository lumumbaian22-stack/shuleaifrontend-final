// js/features/students/BulkUpload.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';

export const bulkUpload = {
    currentFile: null,
    
    setupUploadZone(dropZoneId, fileInputId) {
        const dropZone = document.getElementById(dropZoneId);
        const fileInput = document.getElementById(fileInputId);
        
        if (!dropZone || !fileInput) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('border-primary', 'bg-primary/5');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('border-primary', 'bg-primary/5');
            });
        });
        
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            this.handleFile(dt.files[0]);
        });
        
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
    },
    
    handleFile(file) {
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }
        
        this.currentFile = file;
        toast.info(`Selected file: ${file.name}`);
        
        // Show upload button
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) uploadBtn.disabled = false;
    },
    
    async upload(type, onProgress) {
        if (!this.currentFile) {
            toast.error('Please select a file first');
            return false;
        }
        
        const formData = new FormData();
        formData.append('file', this.currentFile);
        
        toast.loading(true);
        
        try {
            let endpoint;
            if (type === 'students') endpoint = '/api/upload/students';
            else if (type === 'marks') endpoint = '/api/upload/marks';
            else if (type === 'attendance') endpoint = '/api/upload/attendance';
            else throw new Error('Invalid upload type');
            
            const response = await apiClient.upload(endpoint, this.currentFile, onProgress);
            
            const successCount = response.data?.successCount ?? response.data?.stats?.created ?? 0;
            const failedCount = response.data?.failedCount ?? response.data?.stats?.errors ?? 0;
            
            toast.success(`✅ Uploaded: ${successCount} success, ${failedCount} failed`);
            
            // Reset
            this.currentFile = null;
            const fileInput = document.getElementById('csv-file-input');
            if (fileInput) fileInput.value = '';
            
            return true;
        } catch (error) {
            toast.error(error.message || 'Upload failed');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    downloadTemplate(type) {
        const templates = {
            students: `name,grade,parentEmail,dateOfBirth,gender
John Doe,10A,parent@example.com,2010-01-01,male
Jane Smith,10B,jane.parent@example.com,2010-02-15,female`,
            marks: `studentId,elimuid,subject,score,assessmentType,date
,ELI-2024-001,Mathematics,85,exam,2024-03-15
,ELI-2024-002,English,78,test,2024-03-14`,
            attendance: `studentId,elimuid,date,status,reason
,ELI-2024-001,2024-03-15,present,
,ELI-2024-002,2024-03-15,absent,Sick`
        };
        
        const template = templates[type];
        if (!template) {
            toast.error('Invalid template type');
            return;
        }
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_template.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success(`✅ ${type} template downloaded`);
    },
    
    showBulkUploadModal(type) {
        const modal = modalManager.create('bulk-upload-modal', `Bulk Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`);
        modal.setContent(`
            <div class="space-y-4">
                <div id="csv-drop-zone" class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <i data-lucide="upload" class="h-10 w-10 mx-auto text-muted-foreground"></i>
                    <p class="text-sm mt-2">Drag & drop CSV file or click to browse</p>
                    <p class="text-xs text-muted-foreground mt-1">Format: name, grade, parentEmail, dateOfBirth, gender</p>
                    <input type="file" id="csv-file-input" accept=".csv" class="hidden">
                </div>
                <div id="upload-progress-container" class="hidden">
                    <div class="w-full bg-muted rounded-full h-2">
                        <div id="upload-progress" class="bg-primary h-2 rounded-full" style="width: 0%"></div>
                    </div>
                    <p id="upload-progress-text" class="text-xs text-center mt-1">0%</p>
                </div>
                <button onclick="window.bulkUpload.downloadTemplate('${type}')" class="text-sm text-primary hover:underline flex items-center gap-1">
                    <i data-lucide="download" class="h-4 w-4"></i>
                    Download CSV Template
                </button>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('bulk-upload-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button id="upload-btn" onclick="window.bulkUpload.upload('${type}', window.bulkUpload.updateProgress)" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90" disabled>Upload</button>
                </div>
            </div>
        `);
        modal.open();
        
        // Setup upload zone
        this.setupUploadZone('csv-drop-zone', 'csv-file-input');
    },
    
    updateProgress(percent) {
        const container = document.getElementById('upload-progress-container');
        const progressBar = document.getElementById('upload-progress');
        const progressText = document.getElementById('upload-progress-text');
        
        if (container) container.classList.remove('hidden');
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${Math.round(percent)}%`;
    }
};

window.bulkUpload = bulkUpload;