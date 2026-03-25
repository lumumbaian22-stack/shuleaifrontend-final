// js/dashboard/roles/SuperAdminDashboard.js
//import { BaseDashboard } from '../base/BaseDashboard.js';
//import { superAdminAPI } from '../../api/superadmin.js';
//import { store } from '../../core/store.js';
//import { toast } from '../../ui/feedback/Toast.js';
//import { modalManager } from '../../ui/components/Modal.js';
//import { ChartRenderer } from '../base/ChartRenderer.js';
//import { StatsRenderer } from '../base/StatsRenderer.js';
//import { TableRenderer } from '../base/TableRenderer.js';
//import { formatDate, timeAgo, getInitials, formatCurrency } from '../../core/utils.js';

class SuperAdminDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.schools = [];
        this.pendingSchools = [];
        this.suspendedSchools = [];
        this.nameChangeRequests = [];
        this.recentActivity = [];
    }

    async loadData() {
        console.log('📊 Loading super admin dashboard data...');
        
        try {
            const [overviewRes, schoolsRes, pendingRes, requestsRes] = await Promise.all([
                superAdminAPI.getOverview().catch(() => ({ data: {} })),
                superAdminAPI.getSchools().catch(() => ({ data: [] })),
                superAdminAPI.getPendingSchools().catch(() => ({ data: [] })),
                superAdminAPI.getPendingRequests().catch(() => ({ data: [] }))
            ]);
            
            const overview = overviewRes.data || {};
            this.schools = schoolsRes.data || [];
            this.pendingSchools = pendingRes.data || [];
            this.nameChangeRequests = requestsRes.data || [];
            
            this.data = {
                overview,
                schools: this.schools,
                pendingSchools: this.pendingSchools,
                nameChangeRequests: this.nameChangeRequests
            };
            
            this.stats = {
                totalSchools: this.schools.length,
                activeSchools: this.schools.filter(s => s.status === 'active').length,
                pendingApprovals: this.pendingSchools.length,
                revenue: overview.revenue || 0,
                totalTeachers: overview.totalTeachers || 0,
                totalStudents: overview.totalStudents || 0
            };
            
        } catch (error) {
            console.error('Failed to load super admin data:', error);
            this.showError('Failed to load dashboard data');
            throw error;
        }
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div id="stats-container" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold">School Growth Trends</h3>
                            <button onclick="window.dashboard?.refreshChart('growth')" class="text-xs text-primary hover:underline">Refresh</button>
                        </div>
                        <div class="chart-container h-64" id="growth-chart-container"></div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold">School Distribution</h3>
                            <select id="distribution-type" class="text-xs border rounded px-2 py-1 bg-background">
                                <option value="level">By Level</option>
                                <option value="status">By Status</option>
                            </select>
                        </div>
                        <div class="chart-container h-64" id="distribution-chart-container"></div>
                    </div>
                </div>
                ${this.renderPendingSchoolsTable()}
                ${this.renderSchoolsTable()}
                ${this.renderNameChangeRequestsTable()}
                ${this.renderQuickActions()}
            </div>
        `;
        
        // Render stats
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            StatsRenderer.render(statsContainer, this.stats, 'superadmin');
        }
        
        // Render charts
        this.renderCharts();
        
        // Set up filter listener
        const distributionFilter = document.getElementById('distribution-type');
        if (distributionFilter) {
            distributionFilter.addEventListener('change', () => this.updateDistributionChart());
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    renderPendingSchoolsTable() {
        if (!this.pendingSchools || this.pendingSchools.length === 0) {
            return '';
        }
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold">Pending School Approvals</h3>
                    <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">${this.pendingSchools.length}</span>
                </div>
                <div id="pending-schools-table-container"></div>
            </div>
        `;
    }
    
    renderSchoolsTable() {
        if (!this.schools || this.schools.length === 0) {
            return `
                <div class="rounded-xl border bg-card p-8 text-center">
                    <i data-lucide="building-2" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i>
                    <p class="text-muted-foreground">No schools found</p>
                    <button onclick="window.dashboard?.showCreateSchoolModal()" class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Create School</button>
                </div>
            `;
        }
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-semibold">School Management</h3>
                    <div class="flex gap-2">
                        <button onclick="window.dashboard?.showCreateSchoolModal()" class="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg">+ Create School</button>
                        <button onclick="window.dashboard?.refreshSchools()" class="px-3 py-1 border rounded-lg text-sm hover:bg-accent">Refresh</button>
                    </div>
                </div>
                <div id="schools-table-container"></div>
            </div>
        `;
    }
    
    renderNameChangeRequestsTable() {
        if (!this.nameChangeRequests || this.nameChangeRequests.length === 0) {
            return '';
        }
        
        return `
            <div class="rounded-xl border bg-card overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-semibold">Name Change Requests</h3>
                </div>
                <div id="name-change-requests-table-container"></div>
            </div>
        `;
    }
    
    renderQuickActions() {
        return `
            <div class="grid gap-4 md:grid-cols-4">
                <button onclick="window.dashboard?.showCreateSchoolModal()" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="plus" class="h-6 w-6 text-blue-600 mb-2"></i>
                    <p class="font-medium">Create School</p>
                    <p class="text-xs text-muted-foreground">Add a new school to the platform</p>
                </button>
                
                <button onclick="window.dashboard?.showSection('platform-health')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="activity" class="h-6 w-6 text-green-600 mb-2"></i>
                    <p class="font-medium">Platform Health</p>
                    <p class="text-xs text-muted-foreground">Monitor system status</p>
                </button>
                
                <button onclick="window.dashboard?.showSection('settings')" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="settings" class="h-6 w-6 text-purple-600 mb-2"></i>
                    <p class="font-medium">Platform Settings</p>
                    <p class="text-xs text-muted-foreground">Configure global settings</p>
                </button>
                
                <button onclick="window.dashboard?.exportData()" class="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
                    <i data-lucide="download" class="h-6 w-6 text-amber-600 mb-2"></i>
                    <p class="font-medium">Export Data</p>
                    <p class="text-xs text-muted-foreground">Download platform data</p>
                </button>
            </div>
        `;
    }
    
    renderCharts() {
        // Growth chart
        const growthContainer = document.getElementById('growth-chart-container');
        if (growthContainer) {
            const growthData = this.generateGrowthData();
            this.charts.growth = ChartRenderer.render(growthContainer, growthData, 'line');
        }
        
        // Distribution chart
        this.renderDistributionChart();
    }
    
    renderDistributionChart() {
        const distributionContainer = document.getElementById('distribution-chart-container');
        if (!distributionContainer) return;
        
        const type = document.getElementById('distribution-type')?.value || 'level';
        const distributionData = type === 'level' 
            ? this.generateLevelDistributionData() 
            : this.generateStatusDistributionData();
        
        if (this.charts.distribution) {
            ChartRenderer.destroy(this.charts.distribution);
        }
        this.charts.distribution = ChartRenderer.render(distributionContainer, distributionData, 'doughnut');
    }
    
    generateGrowthData() {
        // This would come from real API
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [2, 3, 4, 3, 5, 7],
            label: 'New Schools'
        };
    }
    
    generateLevelDistributionData() {
        // Count schools by level
        const levelCounts = {
            primary: 0,
            secondary: 0,
            both: 0
        };
        
        this.schools.forEach(school => {
            const level = school.settings?.schoolLevel || 'secondary';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });
        
        return {
            labels: Object.keys(levelCounts).map(l => l === 'both' ? 'Both' : l.charAt(0).toUpperCase() + l.slice(1)),
            values: Object.values(levelCounts)
        };
    }
    
    generateStatusDistributionData() {
        // Count schools by status
        const statusCounts = {
            active: 0,
            pending: 0,
            suspended: 0,
            rejected: 0
        };
        
        this.schools.forEach(school => {
            const status = school.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        return {
            labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            values: Object.values(statusCounts)
        };
    }
    
    updateDistributionChart() {
        this.renderDistributionChart();
    }
    
    refreshChart(chartType) {
        if (chartType === 'growth') {
            const growthContainer = document.getElementById('growth-chart-container');
            if (growthContainer && this.charts.growth) {
                const newData = this.generateGrowthData();
                this.charts.growth.data.datasets[0].data = newData.values;
                this.charts.growth.data.labels = newData.labels;
                this.charts.growth.update();
            }
        } else if (chartType === 'distribution') {
            this.updateDistributionChart();
        }
    }
    
    renderPendingSchoolsTable() {
        const container = document.getElementById('pending-schools-table-container');
        if (!container) return;
        
        const config = {
            columns: [
                { key: 'name', label: 'School', align: 'left', dataLabel: 'School' },
                { key: 'admins[0].email', label: 'Admin Email', align: 'left', dataLabel: 'Admin Email', render: (val) => val || '-' },
                { key: 'shortCode', label: 'Short Code', align: 'left', dataLabel: 'Short Code', render: (val) => `<span class="font-mono text-xs bg-muted px-2 py-1 rounded">${val || 'N/A'}</span>` },
                { key: 'settings.schoolLevel', label: 'Level', align: 'left', dataLabel: 'Level', render: (val) => val || 'N/A' },
                { key: 'createdAt', label: 'Applied', align: 'left', dataLabel: 'Applied', render: (val) => timeAgo(val) },
                { key: 'id', label: 'Actions', align: 'right', dataLabel: 'Actions', render: (val, row) => `
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="window.dashboard?.approveSchool('${val}')" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors">Approve</button>
                        <button onclick="window.dashboard?.rejectSchool('${val}')" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors">Reject</button>
                        <button onclick="window.dashboard?.viewSchoolDetails('${val}')" class="p-1 hover:bg-accent rounded-lg" title="View Details">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                    </div>
                ` }
            ],
            data: this.pendingSchools,
            emptyMessage: 'No pending school approvals'
        };
        
        TableRenderer.render(container, config);
    }
    
    renderSchoolsTable() {
        const container = document.getElementById('schools-table-container');
        if (!container) return;
        
        const config = {
            columns: [
                { key: 'name', label: 'School', align: 'left', dataLabel: 'School', render: (val, row) => `
                    <div class="font-medium school-name-display">${val || 'Unknown'}</div>
                    <div class="text-xs text-muted-foreground">ID: ${row.schoolId || 'N/A'}</div>
                ` },
                { key: 'shortCode', label: 'Short Code', align: 'left', dataLabel: 'Short Code', render: (val) => `<span class="font-mono text-xs bg-muted px-2 py-1 rounded">${val || 'N/A'}</span>` },
                { key: 'admins[0].name', label: 'Admin', align: 'left', dataLabel: 'Admin', render: (val, row) => `
                    <div>${val || '-'}</div>
                    <div class="text-xs text-muted-foreground">${row.admins?.[0]?.email || ''}</div>
                ` },
                { key: 'settings.schoolLevel', label: 'Level', align: 'left', dataLabel: 'Level', render: (val) => val || 'N/A' },
                { key: 'status', label: 'Status', align: 'left', dataLabel: 'Status', render: (val) => {
                    const statusColors = {
                        active: 'bg-green-100 text-green-700',
                        pending: 'bg-yellow-100 text-yellow-700',
                        suspended: 'bg-red-100 text-red-700',
                        rejected: 'bg-gray-100 text-gray-700'
                    };
                    return `<span class="px-2 py-1 ${statusColors[val] || 'bg-gray-100 text-gray-700'} text-xs rounded-full">${val || 'pending'}</span>`;
                } },
                { key: 'stats.teachers', label: 'Teachers', align: 'center', dataLabel: 'Teachers', render: (val) => val || 0 },
                { key: 'stats.students', label: 'Students', align: 'center', dataLabel: 'Students', render: (val) => val || 0 },
                { key: 'id', label: 'Actions', align: 'right', dataLabel: 'Actions', render: (val, row) => `
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="window.dashboard?.viewSchoolDetails('${val}')" class="p-2 hover:bg-accent rounded-lg" title="View Details">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.dashboard?.editSchool('${val}')" class="p-2 hover:bg-accent rounded-lg" title="Edit">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                        ${row.status === 'active' ? 
                            `<button onclick="window.dashboard?.suspendSchool('${val}')" class="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600" title="Suspend">
                                <i data-lucide="pause-circle" class="h-4 w-4"></i>
                            </button>` : 
                            row.status === 'suspended' ?
                            `<button onclick="window.dashboard?.reactivateSchool('${val}')" class="p-2 hover:bg-green-100 rounded-lg text-green-600" title="Reactivate">
                                <i data-lucide="play-circle" class="h-4 w-4"></i>
                            </button>` : ''
                        }
                        <button onclick="window.dashboard?.deleteSchool('${val}')" class="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </div>
                ` }
            ],
            data: this.schools,
            emptyMessage: 'No schools found'
        };
        
        TableRenderer.render(container, config);
    }
    
    renderNameChangeRequestsTable() {
        const container = document.getElementById('name-change-requests-table-container');
        if (!container) return;
        
        const config = {
            columns: [
                { key: 'School.name', label: 'School', align: 'left', dataLabel: 'School', render: (val) => val || 'N/A' },
                { key: 'currentName', label: 'Current Name', align: 'left', dataLabel: 'Current Name', render: (val) => `<span class="text-muted-foreground">${val || 'N/A'}</span>` },
                { key: 'newName', label: 'New Name', align: 'left', dataLabel: 'New Name', render: (val) => `<span class="font-semibold text-primary">${val || 'N/A'}</span>` },
                { key: 'User.name', label: 'Requested By', align: 'left', dataLabel: 'Requested By', render: (val, row) => `
                    <div>${val || 'N/A'}</div>
                    <div class="text-xs text-muted-foreground">${row.User?.email || ''}</div>
                ` },
                { key: 'createdAt', label: 'Date', align: 'left', dataLabel: 'Date', render: (val) => timeAgo(val) },
                { key: 'id', label: 'Actions', align: 'right', dataLabel: 'Actions', render: (val) => `
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="window.dashboard?.approveNameChange('${val}')" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors">Approve</button>
                        <button onclick="window.dashboard?.rejectNameChange('${val}')" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors">Reject</button>
                    </div>
                ` }
            ],
            data: this.nameChangeRequests,
            emptyMessage: 'No pending name change requests'
        };
        
        TableRenderer.render(container, config);
    }
    
    // ============ Action Methods ============
    
    async approveSchool(schoolId) {
        if (!confirm('Approve this school? The admin will be able to log in.')) return;
        
        toast.loading(true);
        try {
            await superAdminAPI.approveSchool(schoolId);
            toast.success('✅ School approved successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to approve school');
        } finally {
            toast.loading(false);
        }
    }
    
    async rejectSchool(schoolId) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;
        
        toast.loading(true);
        try {
            await superAdminAPI.rejectSchool(schoolId, reason);
            toast.info('School rejected');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to reject school');
        } finally {
            toast.loading(false);
        }
    }
    
    async suspendSchool(schoolId) {
        const reason = prompt('Please enter suspension reason:');
        if (!reason) return;
        
        if (!confirm(`⚠️ Are you sure you want to suspend this school? All users will be locked out.`)) return;
        
        toast.loading(true);
        try {
            await superAdminAPI.suspendSchool(schoolId, reason);
            toast.success('✅ School suspended successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to suspend school');
        } finally {
            toast.loading(false);
        }
    }
    
    async reactivateSchool(schoolId) {
        const reason = prompt('Please enter reactivation reason:');
        if (!reason) return;
        
        toast.loading(true);
        try {
            await superAdminAPI.reactivateSchool(schoolId, reason);
            toast.success('✅ School reactivated successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to reactivate school');
        } finally {
            toast.loading(false);
        }
    }
    
    async deleteSchool(schoolId) {
        const confirmMessage = `⚠️ PERMANENT ACTION: Delete this school?
        
This will permanently delete:
- All teachers
- All students
- All parents
- All academic records
- All attendance records
- All payment records

This action CANNOT be undone!`;
        
        if (!confirm(confirmMessage)) {
            toast.info('Deletion cancelled');
            return;
        }
        
        const confirmText = prompt('Type "DELETE THIS SCHOOL" to confirm deletion:');
        if (confirmText !== 'DELETE THIS SCHOOL') {
            toast.warning('Deletion cancelled - incorrect confirmation text');
            return;
        }
        
        toast.loading(true);
        try {
            await superAdminAPI.deleteSchool(schoolId);
            toast.success('✅ School deleted successfully');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to delete school');
        } finally {
            toast.loading(false);
        }
    }
    
    async approveNameChange(requestId) {
        toast.loading(true);
        try {
            await superAdminAPI.approveRequest(requestId);
            toast.success('✅ Name change approved');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to approve name change');
        } finally {
            toast.loading(false);
        }
    }
    
    async rejectNameChange(requestId) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;
        
        toast.loading(true);
        try {
            await superAdminAPI.rejectRequest(requestId, reason);
            toast.info('Name change rejected');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to reject name change');
        } finally {
            toast.loading(false);
        }
    }
    
    viewSchoolDetails(schoolId) {
        const school = this.schools.find(s => s.id == schoolId);
        if (!school) {
            toast.error('School not found');
            return;
        }
        
        this.showSchoolDetailsModal(school);
    }
    
    showSchoolDetailsModal(school) {
        const admin = school.admins?.[0] || {};
        
        const modal = modalManager.create('school-details-modal', 'School Details');
        modal.setContent(`
            <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                        <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            ${getInitials(school.name)}
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">${school.name || 'Unknown'}</h2>
                            <div class="flex items-center gap-3 mt-1">
                                <span class="font-mono text-sm bg-muted px-3 py-1 rounded-lg">ID: ${school.schoolId || 'N/A'}</span>
                                <span class="font-mono text-sm bg-muted px-3 py-1 rounded-lg">Code: ${school.shortCode || 'N/A'}</span>
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${this.getStatusColor(school.status)}">${school.status || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                        <i data-lucide="users" class="h-8 w-8 mx-auto text-blue-600 mb-2"></i>
                        <p class="text-2xl font-bold text-blue-600">${school.stats?.teachers || 0}</p>
                        <p class="text-xs text-muted-foreground">Teachers</p>
                    </div>
                    <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <i data-lucide="graduation-cap" class="h-8 w-8 mx-auto text-green-600 mb-2"></i>
                        <p class="text-2xl font-bold text-green-600">${school.stats?.students || 0}</p>
                        <p class="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                        <i data-lucide="heart" class="h-8 w-8 mx-auto text-purple-600 mb-2"></i>
                        <p class="text-2xl font-bold text-purple-600">${school.stats?.parents || 0}</p>
                        <p class="text-xs text-muted-foreground">Parents</p>
                    </div>
                    <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                        <i data-lucide="book-open" class="h-8 w-8 mx-auto text-amber-600 mb-2"></i>
                        <p class="text-2xl font-bold text-amber-600">${school.stats?.classes || 0}</p>
                        <p class="text-xs text-muted-foreground">Classes</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-muted/30 rounded-xl p-4">
                        <h4 class="font-semibold mb-3 flex items-center gap-2">
                            <i data-lucide="building-2" class="h-4 w-4 text-primary"></i>
                            School Information
                        </h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-muted-foreground">School Level</span>
                                <span class="text-sm font-medium">${school.settings?.schoolLevel || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-muted-foreground">Curriculum</span>
                                <span class="text-sm font-medium">${school.system || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-muted-foreground">Created</span>
                                <span class="text-sm font-medium">${formatDate(school.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-muted/30 rounded-xl p-4">
                        <h4 class="font-semibold mb-3 flex items-center gap-2">
                            <i data-lucide="user" class="h-4 w-4 text-primary"></i>
                            Administrator
                        </h4>
                        <div class="space-y-2">
                            <div>
                                <p class="text-xs text-muted-foreground">Name</p>
                                <p class="text-sm font-medium">${admin.name || 'No admin assigned'}</p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">Email</p>
                                <p class="text-sm">${admin.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">Phone</p>
                                <p class="text-sm">${admin.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${school.suspensionReason ? `
                    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <h4 class="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <i data-lucide="alert-triangle" class="h-4 w-4"></i>
                            Suspension Information
                        </h4>
                        <p class="text-sm"><span class="font-medium">Reason:</span> ${school.suspensionReason}</p>
                        <p class="text-sm mt-1"><span class="font-medium">Date:</span> ${formatDate(school.suspendedAt)}</p>
                    </div>
                ` : ''}
                
                <div class="flex justify-end gap-3 pt-4 border-t">
                    <button onclick="window.modalManager?.close('school-details-modal')" class="px-4 py-2 border rounded-lg hover:bg-accent transition-colors">Close</button>
                    <button onclick="window.dashboard?.editSchool('${school.id}')" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <i data-lucide="edit" class="h-4 w-4"></i>
                        Edit School
                    </button>
                    ${school.status === 'active' ? 
                        `<button onclick="window.dashboard?.suspendSchool('${school.id}')" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2">
                            <i data-lucide="pause-circle" class="h-4 w-4"></i>
                            Suspend
                        </button>` : 
                        school.status === 'suspended' ?
                        `<button onclick="window.dashboard?.reactivateSchool('${school.id}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                            <i data-lucide="play-circle" class="h-4 w-4"></i>
                            Reactivate
                        </button>` : ''
                    }
                </div>
            </div>
        `);
        modal.open();
    }
    
    getStatusColor(status) {
        const colors = {
            active: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            suspended: 'bg-red-100 text-red-700 border-red-200',
            rejected: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    }
    
    showCreateSchoolModal() {
        const modal = modalManager.create('create-school-modal', 'Create New School');
        modal.setContent(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">School Name *</label>
                    <input type="text" id="create-school-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">School Level</label>
                    <select id="create-school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="both">Both</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Curriculum</label>
                    <select id="create-school-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="cbc">CBC</option>
                        <option value="844">8-4-4</option>
                        <option value="british">British</option>
                        <option value="american">American</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Admin Name *</label>
                    <input type="text" id="create-school-admin-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Admin Email *</label>
                    <input type="email" id="create-school-admin-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Admin Password</label>
                    <input type="password" id="create-school-admin-password" value="Admin123!" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <p class="text-xs text-muted-foreground mt-1">Default: Admin123!</p>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('create-school-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.handleCreateSchool()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Create School</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async handleCreateSchool() {
        const name = document.getElementById('create-school-name')?.value;
        const level = document.getElementById('create-school-level')?.value;
        const curriculum = document.getElementById('create-school-curriculum')?.value;
        const adminName = document.getElementById('create-school-admin-name')?.value;
        const adminEmail = document.getElementById('create-school-admin-email')?.value;
        const adminPassword = document.getElementById('create-school-admin-password')?.value || 'Admin123!';
        
        if (!name || !adminName || !adminEmail) {
            toast.error('Please fill all required fields');
            return;
        }
        
        toast.loading(true);
        try {
            await superAdminAPI.createSchool({
                name,
                system: curriculum,
                adminName,
                adminEmail,
                adminPassword,
                settings: { schoolLevel: level }
            });
            toast.success('✅ School created successfully');
            modalManager.close('create-school-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to create school');
        } finally {
            toast.loading(false);
        }
    }
    
    editSchool(schoolId) {
        const school = this.schools.find(s => s.id == schoolId);
        if (!school) {
            toast.error('School not found');
            return;
        }
        
        const modal = modalManager.create('edit-school-modal', 'Edit School');
        modal.setContent(`
            <div class="space-y-4">
                <input type="hidden" id="edit-school-id" value="${school.id}">
                <div>
                    <label class="block text-sm font-medium mb-1">School Name *</label>
                    <input type="text" id="edit-school-name" value="${school.name || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">School Level</label>
                    <select id="edit-school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="primary" ${school.settings?.schoolLevel === 'primary' ? 'selected' : ''}>Primary</option>
                        <option value="secondary" ${school.settings?.schoolLevel === 'secondary' ? 'selected' : ''}>Secondary</option>
                        <option value="both" ${school.settings?.schoolLevel === 'both' ? 'selected' : ''}>Both</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Curriculum</label>
                    <select id="edit-school-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="cbc" ${school.system === 'cbc' ? 'selected' : ''}>CBC</option>
                        <option value="844" ${school.system === '844' ? 'selected' : ''}>8-4-4</option>
                        <option value="british" ${school.system === 'british' ? 'selected' : ''}>British</option>
                        <option value="american" ${school.system === 'american' ? 'selected' : ''}>American</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Contact Email</label>
                    <input type="email" id="edit-school-email" value="${school.contact?.email || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Contact Phone</label>
                    <input type="tel" id="edit-school-phone" value="${school.contact?.phone || ''}" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="window.modalManager?.close('edit-school-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button>
                    <button onclick="window.dashboard?.handleUpdateSchool()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Update School</button>
                </div>
            </div>
        `);
        modal.open();
    }
    
    async handleUpdateSchool() {
        const schoolId = document.getElementById('edit-school-id')?.value;
        const name = document.getElementById('edit-school-name')?.value;
        const level = document.getElementById('edit-school-level')?.value;
        const curriculum = document.getElementById('edit-school-curriculum')?.value;
        const email = document.getElementById('edit-school-email')?.value;
        const phone = document.getElementById('edit-school-phone')?.value;
        
        if (!schoolId || !name) {
            toast.error('School name is required');
            return;
        }
        
        toast.loading(true);
        try {
            await superAdminAPI.updateSchool(schoolId, {
                name,
                system: curriculum,
                settings: { schoolLevel: level },
                contact: { email, phone }
            });
            toast.success('✅ School updated successfully');
            modalManager.close('edit-school-modal');
            await this.refresh();
        } catch (error) {
            toast.error(error.message || 'Failed to update school');
        } finally {
            toast.loading(false);
        }
    }
    
    exportData() {
        const data = {
            schools: this.schools,
            stats: this.stats,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shuleai_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Data exported successfully');
    }
    
    refreshSchools() {
        this.refresh();
    }
    
    showSection(section) {
        if (window.router) {
            window.router.navigate(section);
        }
    }
    
    setupRealtimeSubscriptions() {
        if (!window.realtime) return;
        
        window.realtime.on('school-updated', () => this.refresh());
        window.realtime.on('school-approved', () => this.refresh());
        window.realtime.on('school-suspended', () => this.refresh());
        window.realtime.on('school-name-changed', () => this.refresh());
    }
    
    attachEventListeners() {
        // Add any dashboard-specific event listeners
    }
}

// Make dashboard globally accessible
window.SuperAdminDashboard = SuperAdminDashboard;
