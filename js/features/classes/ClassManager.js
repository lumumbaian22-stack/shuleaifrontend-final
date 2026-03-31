// js/features/classes/ClassManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { store } from '../../core/store.js';

export const classManager = {
    classes: [],
    curriculum: null,
    
    async loadClasses() {
        try {
            const response = await apiClient.get('/api/admin/classes');
            // Ensure subjectTeachers is always an array
            this.classes = (response.data || []).map(cls => ({
                ...cls,
                subjectTeachers: cls.subjectTeachers || []
            }));
            return this.classes;
        } catch (error) {
            console.error('Failed to load classes:', error);
            return [];
        }
    },
    
    async loadCurriculum() {
        try {
            const response = await apiClient.get('/api/admin/settings');
            this.curriculum = response.data?.system || 'cbc';
            return this.curriculum;
        } catch (error) {
            console.error('Failed to load curriculum:', error);
            return 'cbc';
        }
    },
    
    async createClass(name, grade, stream = null) {
        if (!name || !grade) {
            toast.error('Class name and grade are required');
            return null;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/admin/classes', {
                name,
                grade,
                stream,
                academicYear: new Date().getFullYear().toString()
            });
            
            if (response.success) {
                toast.success('✅ Class created successfully');
                await this.loadClasses();
                return response.data;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create class');
            return null;
        } finally {
            toast.loading(false);
        }
    },
    
    async updateClass(classId, data) {
        if (!classId) {
            toast.error('Class ID required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.put(`/api/admin/classes/${classId}`, data);
            
            if (response.success) {
                toast.success('✅ Class updated successfully');
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update class');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async deleteClass(classId) {
        if (!classId) return false;
        
        toast.loading(true);
        
        try {
            const response = await apiClient.delete(`/api/admin/classes/${classId}`);
            
            if (response.success) {
                toast.success('✅ Class deleted successfully');
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete class');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async assignTeacher(classId, teacherId) {
        if (!classId || !teacherId) {
            toast.error('Class and teacher are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post(`/api/admin/classes/${classId}/assign-teacher`, { teacherId });
            
            if (response.success) {
                toast.success('✅ Teacher assigned successfully');
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    // ============ SUBJECT TEACHER FUNCTIONS ============
    
    async assignSubjectTeacher(classId, teacherId, subject) {
        if (!classId || !teacherId || !subject) {
            toast.error('Class, teacher, and subject are required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.post('/api/admin/classes/subject-assign', {
                classId,
                teacherId,
                subject,
                isClassTeacher: false
            });
            
            if (response.success) {
                toast.success(`✅ ${subject} assigned to teacher successfully`);
                await this.loadClasses();
                return true;
            } else {
                throw new Error(response.message || 'Assignment failed');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign subject teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async removeSubjectTeacher(assignmentId, classId) {
        if (!assignmentId) {
            toast.error('Assignment ID required');
            return false;
        }
        
        toast.loading(true);
        
        try {
            const response = await apiClient.delete(`/api/admin/classes/subject-assign/${assignmentId}`);
            
            if (response.success) {
                toast.success('✅ Teacher removed from subject');
                await this.loadClasses();
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to remove teacher');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async getClassSubjectAssignments(classId) {
        try {
            const response = await apiClient.get(`/api/admin/classes/${classId}/subjects`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to get subject assignments:', error);
            return [];
        }
    },
    
    // ============ SUBJECT ASSIGNMENT MODAL ============
    
    async showAssignSubjectModal(classData) {
        if (!classData) return;
        
        // Load teachers
        let teachers = [];
        try {
            const response = await apiClient.get('/api/admin/available-teachers');
            teachers = response.data || [];
        } catch (error) {
            console.error('Failed to load teachers:', error);
        }
        
        // Load subjects based on curriculum
        await this.loadCurriculum();
        const subjects = this.getSubjectsByCurriculum();
        
        // Get existing assignments
        const existingAssignments = await this.getClassSubjectAssignments(classData.id);
        const existingMap = {};
        existingAssignments.forEach(a => {
            existingMap[a.subject] = a;
        });
        
        const modal = modalManager.create('assign-subject-modal', `Assign Subject Teachers - ${classData.name}`);
        modal.setContent(`
            <div class="space-y-4 max-h-[60vh] overflow-y-auto">
                <div class="text-sm text-muted-foreground mb-4">
                    Select a teacher for each subject
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-muted/50 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-left">Subject</th>
                                <th class="px-4 py-2 text-left">Teacher</th>
                                <th class="px-4 py-2 text-center">Action</th>
                            </thead>
                            <tbody class="divide-y">
                                ${subjects.map(subject => {
                                    const existing = existingMap[subject];
                                    return `
                                        <tr>
                                            <td class="px-4 py-2 font-medium">${this.escapeHtml(subject)}</td>
                                            <td class="px-4 py-2">
                                                <select id="subject-teacher-${subject.replace(/\s/g, '_')}" 
                                                        class="w-64 rounded-lg border border-input bg-background px-3 py-1 text-sm">
                                                    <option value="">-- Select Teacher --</option>
                                                    ${teachers.map(t => `
                                                        <option value="${t.id}" ${existing?.teacherId === t.id ? 'selected' : ''}>
                                                            ${this.escapeHtml(t.User?.name || 'Unknown')} 
                                                            ${t.subjects?.length ? `(${t.subjects.join(', ')})` : ''}
                                                        </option>
                                                    `).join('')}
                                                </select>
                                             </td>
                                            <td class="px-4 py-2 text-center">
                                                <button onclick="window.classManager.handleAssignSubject(${classData.id}, '${subject.replace(/'/g, "\\'")}')" 
                                                        class="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
                                                    ${existing ? 'Update' : 'Assign'}
                                                </button>
                                                ${existing ? `
                                                    <button onclick="window.classManager.handleRemoveSubject('${existing.id}', ${classData.id})" 
                                                            class="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                                                        Remove
                                                    </button>
                                                ` : ''}
                                             </td>
                                         </tr>
                                    `;
                                }).join('')}
                            </tbody>
                         </table>
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-4">
                <button onclick="window.modalManager?.close('assign-subject-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Close</button>
            </div>
        `);
        modal.open();
    },
    
    async handleAssignSubject(classId, subject) {
        const selectId = `subject-teacher-${subject.replace(/\s/g, '_')}`;
        const teacherId = document.getElementById(selectId)?.value;
        
        if (!teacherId) {
            toast.error('Please select a teacher');
            return;
        }
        
        const success = await this.assignSubjectTeacher(classId, parseInt(teacherId), subject);
        
        if (success) {
            const classData = this.classes.find(c => c.id === classId);
            modalManager.close('assign-subject-modal');
            setTimeout(() => {
                this.showAssignSubjectModal(classData);
            }, 500);
            
            if (window.dashboard && window.dashboard.refreshClasses) {
                window.dashboard.refreshClasses();
            }
        }
    },
    
    async handleRemoveSubject(assignmentId, classId) {
        if (!confirm('Remove this teacher from this subject?')) return;
        
        const success = await this.removeSubjectTeacher(assignmentId, classId);
        
        if (success) {
            const classData = this.classes.find(c => c.id === classId);
            modalManager.close('assign-subject-modal');
            setTimeout(() => {
                this.showAssignSubjectModal(classData);
            }, 500);
            
            if (window.dashboard && window.dashboard.refreshClasses) {
                window.dashboard.refreshClasses();
            }
        }
    },
    
    // ============ HELPER FUNCTIONS ============
    
    getSubjectsByCurriculum() {
        const curriculum = this.curriculum || 'cbc';
        const schoolLevel = store.get('schoolSettings')?.schoolLevel || 'secondary';
        
        const subjectsByCurriculum = {
            cbc: {
                primary: ['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies', 'CRE/IRE', 'Physical Education', 'Art & Craft', 'Music'],
                secondary: ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'CRE/IRE', 'Business Studies', 'Agriculture', 'Computer Studies']
            },
            '844': {
                primary: ['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies', 'CRE/IRE', 'Physical Education'],
                secondary: ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'CRE/IRE', 'Business Studies', 'Agriculture', 'Computer Studies']
            },
            british: {
                primary: ['English', 'Mathematics', 'Science', 'History', 'Geography', 'Art', 'Music', 'Physical Education'],
                secondary: ['English Literature', 'English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'French', 'Spanish', 'Computer Science', 'Business Studies', 'Economics']
            },
            american: {
                elementary: ['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education'],
                high: ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Government', 'Economics', 'Spanish', 'French', 'Computer Science', 'Business', 'Art', 'Music', 'Physical Education']
            }
        };
        
        const level = schoolLevel === 'primary' ? 'primary' : 
                      schoolLevel === 'secondary' ? 'secondary' : 
                      curriculum === 'american' ? 'high' : 'secondary';
        
        const subjects = subjectsByCurriculum[curriculum]?.[level] || 
                         subjectsByCurriculum.cbc.secondary;
        
        const customSubjects = store.get('schoolSettings')?.customSubjects || [];
        
        return [...subjects, ...customSubjects];
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // ============ RENDER FUNCTIONS ============
    
    renderClassesTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!this.classes || this.classes.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-muted-foreground">No classes found</div>';
            return;
        }
        
        let html = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium">Class</th>
                            <th class="px-4 py-3 text-left font-medium">Grade</th>
                            <th class="px-4 py-3 text-left font-medium">Class Teacher</th>
                            <th class="px-4 py-3 text-left font-medium">Students</th>
                            <th class="px-4 py-3 text-right font-medium">Actions</th>
                        </thead>
                        <tbody class="divide-y">
        `;
        
        for (const cls of this.classes) {
            const currentTeacher = cls.Teacher?.User?.name || 'Not assigned';
            const hasTeacher = cls.Teacher !== null;
            
            html += `
                <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3 font-medium">${this.escapeHtml(cls.name)}</td>
                    <td class="px-4 py-3">${this.escapeHtml(cls.grade)}</td>
                    <td class="px-4 py-3">
                        <select id="teacher-${cls.id}" class="rounded border border-input bg-background px-2 py-1 text-sm">
                            <option value="">-- Select Class Teacher --</option>
                            ${this.teachers?.map(t => `
                                <option value="${t.id}" ${t.id === cls.teacherId ? 'selected' : ''}>
                                    ${this.escapeHtml(t.User?.name || 'Unknown')}
                                </option>
                            `).join('') || '<option disabled>Loading teachers...</option>'}
                        </select>
                        <button onclick="window.classManager.assignTeacherToClass(${cls.id})" class="ml-2 text-primary hover:underline text-sm">Save</button>
                        <span class="ml-2 text-xs ${hasTeacher ? 'text-green-600' : 'text-yellow-600'}">${currentTeacher}</span>
                    </td>
                    <td class="px-4 py-3">${cls.studentCount || 0}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.classManager.toggleExpand(${cls.id})" class="p-1 hover:bg-accent rounded" title="Subject Teachers">
                            <i data-lucide="users" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.classManager.showAssignSubjectModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" class="p-1 hover:bg-accent rounded" title="Assign Subjects">
                            <i data-lucide="book-open" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.classManager.editClass(${cls.id})" class="p-1 hover:bg-accent rounded" title="Edit Class">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.classManager.deleteClass(${cls.id})" class="p-1 hover:bg-red-100 rounded text-red-600" title="Delete Class">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </td>
                </tr>
                <tr id="class-details-${cls.id}" class="hidden bg-muted/20">
                    <td colspan="5" class="px-4 py-3">
                        <div class="p-4">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-medium">Subject Teachers</h4>
                                <button onclick="window.classManager.showAssignSubjectModal(${JSON.stringify(cls).replace(/"/g, '&quot;')})" 
                                        class="text-sm text-primary hover:underline flex items-center gap-1">
                                    <i data-lucide="plus-circle" class="h-4 w-4"></i>
                                    Assign Subjects
                                </button>
                            </div>
                            <div id="subject-assignments-${cls.id}" class="space-y-2">
                                ${this.renderSubjectTeachers(cls)}
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
            `;
        
        container.innerHTML = html;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    renderSubjectTeachers(cls) {
        console.log('renderSubjectTeachers called for class:', cls.id, cls.name);
        console.log('Subject teachers data:', cls.subjectTeachers);
        
        if (!cls.subjectTeachers || cls.subjectTeachers.length === 0) {
            return `
                <div class="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded">
                    <i data-lucide="info" class="h-4 w-4 inline mr-2"></i>
                    No subject teachers assigned yet. Click "Assign Subjects" to add teachers.
                </div>
            `;
        }
        
        // Build HTML for each subject teacher
        let cardsHtml = '';
        for (let i = 0; i < cls.subjectTeachers.length; i++) {
            const st = cls.subjectTeachers[i];
            cardsHtml += `
                <div class="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm">
                    <div>
                        <span class="font-medium text-sm">📚 ${this.escapeHtml(st.subject)}</span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-muted-foreground">Teacher:</span>
                            <span class="text-xs font-medium text-primary">${this.escapeHtml(st.teacherName)}</span>
                        </div>
                    </div>
                    <button onclick="window.classManager.handleRemoveSubject('${st.id}', ${cls.id})" 
                            class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Remove teacher from this subject">
                        <i data-lucide="x" class="h-4 w-4"></i>
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${cardsHtml}
            </div>
        `;
    },
    
    toggleExpand(classId) {
        const row = document.getElementById(`class-details-${classId}`);
        if (row) row.classList.toggle('hidden');
    },
    
    async assignTeacherToClass(classId) {
        const select = document.getElementById(`teacher-${classId}`);
        const teacherId = select?.value;
        
        if (!teacherId) {
            toast.error('Please select a teacher');
            return;
        }
        
        await this.assignTeacher(classId, parseInt(teacherId));
    },
    
    showAddClassModal() {
        const modal = modalManager.create('add-class-modal', 'Add New Class');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Class Name *</label>
                    <input type="text" id="class-name" placeholder="e.g., Form 1A, Grade 10 Science" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Grade/Level *</label>
                    <input type="text" id="class-grade" placeholder="e.g., 10, Form 1" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Stream (Optional)</label>
                    <input type="text" id="class-stream" placeholder="e.g., A, B, Science, Arts" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('add-class-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.classManager.handleAddClass()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Create Class</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleAddClass() {
        const name = document.getElementById('class-name')?.value;
        const grade = document.getElementById('class-grade')?.value;
        const stream = document.getElementById('class-stream')?.value;
        
        await this.createClass(name, grade, stream);
        modalManager.close('add-class-modal');
        
        if (window.dashboard && window.dashboard.refreshClasses) {
            window.dashboard.refreshClasses();
        }
    },
    
    showEditClassModal(classData) {
        const modal = modalManager.create('edit-class-modal', 'Edit Class');
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="edit-class-id" value="${classData.id}">
                <div>
                    <label class="block text-sm font-medium mb-1">Class Name</label>
                    <input type="text" id="edit-class-name" value="${classData.name}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Grade/Level</label>
                    <input type="text" id="edit-class-grade" value="${classData.grade}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Stream</label>
                    <input type="text" id="edit-class-stream" value="${classData.stream || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('edit-class-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.classManager.handleEditClass()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Changes</button>
                </div>
            </div>
        `);
        modal.open();
    },
    
    async handleEditClass() {
        const classId = document.getElementById('edit-class-id')?.value;
        const name = document.getElementById('edit-class-name')?.value;
        const grade = document.getElementById('edit-class-grade')?.value;
        const stream = document.getElementById('edit-class-stream')?.value;
        
        const success = await this.updateClass(classId, { name, grade, stream });
        
        if (success) {
            modalManager.close('edit-class-modal');
            if (window.dashboard && window.dashboard.refreshClasses) {
                window.dashboard.refreshClasses();
            }
        }
    }
};

window.classManager = classManager;
