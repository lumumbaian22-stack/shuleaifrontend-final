// js/dashboard/roles/AdminDashboard.js

import BaseDashboard from '../BaseDashboard.js';

import { BaseDashboard } from '../base/BaseDashboard.js';
import { adminAPI } from '../../api/admin.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { ChartRenderer } from '../base/ChartRenderer.js';
import { StatsRenderer } from '../base/StatsRenderer.js';
import { TableRenderer } from '../base/TableRenderer.js';
import { formatDate, timeAgo, getInitials } from '../../core/utils.js';

export class AdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.pendingTeachers = [];
        this.students = [];
        this.teachers = [];
        this.classes = [];
        this.school = {};
    }

    async loadData() {
        console.log('📊 Loading admin dashboard data...');

        try {
            const [teachersRes, studentsRes, pendingRes, classesRes] = await Promise.all([
                adminAPI.getTeachers().catch(() => ({ data: [] })),
                adminAPI.getStudents().catch(() => ({ data: [] })),
                adminAPI.getPendingApprovals().catch(() => ({ data: { teachers: [] } })),
                adminAPI.getClasses().catch(() => ({ data: [] }))
            ]);

            this.students = studentsRes.data || [];
            this.teachers = teachersRes.data || [];
            this.pendingTeachers = pendingRes.data?.teachers || [];
            this.classes = classesRes.data || [];
            this.school = store.getState('school') || {};

            this.stats = {
                totalStudents: this.students.length,
                totalTeachers: this.teachers.length,
                totalClasses: this.classes.length,
                pendingApprovals: this.pendingTeachers.length
            };

        } catch (error) {
            console.error(error);
            this.showError('Failed to load dashboard data');
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="space-y-6">
                ${this.renderSchoolProfile()}
                <div id="stats-container" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
                ${this.renderPendingTeachersSection()}
                ${this.renderStudentsSection()}
            </div>
        `;

        // Stats
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            StatsRenderer.render(statsContainer, this.stats, 'admin');
        }

        // Tables
        this.renderPendingTeachersTable();
        this.renderStudentsTable();

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ================= UI SECTIONS =================

    renderSchoolProfile() {
        return `
            <div class="p-6 border rounded-xl">
                <h2 class="text-xl font-bold">${this.school?.name || 'Your School'}</h2>
                <p class="text-sm text-muted-foreground">
                    Code: ${this.school?.shortCode || 'N/A'}
                </p>
            </div>
        `;
    }

    renderPendingTeachersSection() {
        if (!this.pendingTeachers.length) return '';

        return `
            <div class="border rounded-xl">
                <div class="p-4 border-b font-semibold">
                    Pending Teacher Approvals (${this.pendingTeachers.length})
                </div>
                <div id="pending-teachers-table-container"></div>
            </div>
        `;
    }

    renderStudentsSection() {
        return `
            <div class="border rounded-xl">
                <div class="p-4 border-b flex justify-between">
                    <h3 class="font-semibold">Students</h3>
                    <button onclick="window.dashboard?.showAddStudentModal()" 
                        class="px-3 py-1 bg-primary text-white rounded">
                        + Add
                    </button>
                </div>
                <div id="students-table-container"></div>
            </div>
        `;
    }

    // ================= TABLES =================

    renderPendingTeachersTable() {
        const container = document.getElementById('pending-teachers-table-container');
        if (!container) return;

        TableRenderer.render(container, {
            columns: [
                { key: 'User.name', label: 'Name' },
                { key: 'User.email', label: 'Email' },
                {
                    key: 'id',
                    label: 'Actions',
                    render: (val) => `
                        <button onclick="window.dashboard?.approveTeacher('${val}')">Approve</button>
                        <button onclick="window.dashboard?.rejectTeacher('${val}')">Reject</button>
                    `
                }
            ],
            data: this.pendingTeachers,
            emptyMessage: 'No pending teachers'
        });
    }

    renderStudentsTable() {
        const container = document.getElementById('students-table-container');
        if (!container) return;

        TableRenderer.render(container, {
            columns: [
                {
                    key: 'User.name',
                    label: 'Name',
                    render: (val) => val || 'N/A'
                },
                { key: 'grade', label: 'Grade' },
                {
                    key: 'id',
                    label: 'Actions',
                    render: (val) => `
                        <button onclick="window.dashboard?.deleteStudent('${val}')">
                            Delete
                        </button>
                    `
                }
            ],
            data: this.students,
            emptyMessage: 'No students'
        });
    }

    // ================= ACTIONS =================

    async approveTeacher(id) {
        try {
            await adminAPI.approveTeacher(id, 'approve');
            toast.success('Teacher approved');
            this.refresh();
        } catch (e) {
            toast.error('Failed');
        }
    }

    async rejectTeacher(id) {
        try {
            await adminAPI.approveTeacher(id, 'reject');
            toast.info('Rejected');
            this.refresh();
        } catch {
            toast.error('Failed');
        }
    }

    async deleteStudent(id) {
        if (!confirm('Delete student?')) return;

        try {
            await adminAPI.deleteStudent(id);
            toast.success('Deleted');
            this.refresh();
        } catch {
            toast.error('Failed');
        }
    }

    showAddStudentModal() {
        const modal = modalManager.create('add', 'Add Student');
        modal.setContent(`
            <input id="name" placeholder="Name" class="border p-2 w-full"/>
            <input id="grade" placeholder="Grade" class="border p-2 w-full mt-2"/>
            <button onclick="window.dashboard?.handleAddStudent()" class="mt-3 bg-primary text-white px-3 py-2 rounded">
                Save
            </button>
        `);
        modal.open();
    }

    async handleAddStudent() {
        const name = document.getElementById('name').value;
        const grade = document.getElementById('grade').value;

        if (!name || !grade) return toast.error('Missing fields');

        try {
            await adminAPI.addStudent({ name, grade });
            toast.success('Added');
            this.refresh();
        } catch {
            toast.error('Failed');
        }
    }
}
