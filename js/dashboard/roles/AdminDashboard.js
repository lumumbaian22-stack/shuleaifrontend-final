// js/dashboard/roles/AdminDashboard.js
class AdminDashboard extends window.BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.students = [];
        this.teachers = [];
        this.pendingTeachers = [];
        this.classes = [];
    }

    async loadData() {
        console.log('📊 Loading admin dashboard data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            const [studentsRes, teachersRes, pendingRes, classesRes] = await Promise.all([
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/students', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/teachers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/approvals/pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/admin/classes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (studentsRes.ok) {
                const data = await studentsRes.json();
                this.students = data.data || [];
            }
            if (teachersRes.ok) {
                const data = await teachersRes.json();
                this.teachers = data.data || [];
            }
            if (pendingRes.ok) {
                const data = await pendingRes.json();
                this.pendingTeachers = data.data?.teachers || [];
            }
            if (classesRes.ok) {
                const data = await classesRes.json();
                this.classes = data.data || [];
            }

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    render() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const school = JSON.parse(localStorage.getItem('school') || '{}');
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- School Profile -->
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 class="text-2xl font-bold">${this.escapeHtml(school.name) || 'Your School'}</h2>
                            <p class="text-sm text-muted-foreground mt-1">Short Code: ${this.escapeHtml(school.shortCode) || 'SHL-XXXXX'}</p>
                        </div>
                        <button onclick="window.showNameChangeModal()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">Change School Name</button>
                    </div>
                </div>
                
                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm text-muted-foreground">Total Students</p><h3 class="text-2xl font-bold">${this.students.length}</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100"><i data-lucide="users" class="h-6 w-6 text-blue-600 m-3"></i></div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm text-muted-foreground">Teachers</p><h3 class="text-2xl font-bold">${this.teachers.length}</h3><p class="text-xs text-green-600 mt-1">${this.pendingTeachers.length} pending</p></div>
                            <div class="h-12 w-12 rounded-lg bg-violet-100"><i data-lucide="user-plus" class="h-6 w-6 text-violet-600 m-3"></i></div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm text-muted-foreground">Classes</p><h3 class="text-2xl font-bold">${this.classes.length}</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-emerald-100"><i data-lucide="book-open" class="h-6 w-6 text-emerald-600 m-3"></i></div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <div class="flex items-center justify-between">
                            <div><p class="text-sm text-muted-foreground">Attendance Rate</p><h3 class="text-2xl font-bold">94%</h3></div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100"><i data-lucide="calendar-check" class="h-6 w-6 text-amber-600 m-3"></i></div>
                        </div>
                    </div>
                </div>
                
                <!-- Students Table -->
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="font-semibold">Recent Students</h3>
                        <button onclick="window.refreshData()" class="px-3 py-1 border rounded-lg text-sm hover:bg-accent">Refresh</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50"><tr><th class="px-4 py-3 text-left">Student</th><th class="px-4 py-3 text-left">ELIMUID</th><th class="px-4 py-3 text-left">Grade</th><th class="px-4 py-3 text-left">Status</th></tr></thead>
                            <tbody class="divide-y">
                                ${this.students.slice(0, 5).map(s => {
                                    const name = s.User?.name || 'Unknown';
                                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                    return `<tr class="hover:bg-accent/50"><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="h-8 w-8 rounded-full bg-blue-100"><span class="text-blue-700 text-sm font-medium block text-center leading-8">${initials}</span></div><span>${this.escapeHtml(name)}</span></div></td><td class="px-4 py-3"><span class="font-mono text-xs bg-muted px-2 py-1 rounded">${s.elimuid || 'N/A'}</span></td><td class="px-4 py-3">${s.grade || 'N/A'}</td><td class="px-4 py-3"><span class="px-2 py-1 ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs rounded-full">${s.status || 'active'}</span></td></tr>`;
                                }).join('')}
                                ${this.students.length === 0 ? '<tr><td colspan="4" class="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="grid gap-4 md:grid-cols-3">
                    <button onclick="window.router.navigate('students')" class="p-6 border rounded-lg hover:bg-accent text-left"><i data-lucide="users" class="h-8 w-8 text-green-600 mb-3"></i><h4 class="font-semibold">Student Management</h4><p class="text-sm text-muted-foreground">View and manage all students</p></button>
                    <button onclick="window.router.navigate('teachers')" class="p-6 border rounded-lg hover:bg-accent text-left"><i data-lucide="user-plus" class="h-8 w-8 text-blue-600 mb-3"></i><h4 class="font-semibold">Teacher Management</h4><p class="text-sm text-muted-foreground">Manage teachers and approvals</p></button>
                    <button onclick="window.router.navigate('settings')" class="p-6 border rounded-lg hover:bg-accent text-left"><i data-lucide="settings" class="h-8 w-8 text-purple-600 mb-3"></i><h4 class="font-semibold">School Settings</h4><p class="text-sm text-muted-foreground">Configure curriculum and subjects</p></button>
                </div>
                
                <div class="rounded-xl border bg-card p-6 text-center">
                    <i data-lucide="check-circle" class="h-12 w-12 mx-auto text-green-500 mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">Welcome back, ${this.escapeHtml(user.name) || 'Admin'}!</h3>
                    <p class="text-muted-foreground">${this.students.length} students, ${this.teachers.length} teachers, ${this.classes.length} classes.</p>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.AdminDashboard = AdminDashboard;
console.log('✅ AdminDashboard loaded');
