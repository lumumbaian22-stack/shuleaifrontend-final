// js/dashboard/roles/TeacherDashboard.js
class TeacherDashboard extends window.BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.students = [];
    }

    async loadData() {
        console.log('📊 Loading teacher dashboard data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            const studentsRes = await fetch('https://shuleaibackend-32h1.onrender.com/api/teacher/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (studentsRes.ok) {
                const data = await studentsRes.json();
                this.students = data.data || [];
            }
        } catch (error) {
            console.error('Error loading teacher data:', error);
        }
    }

    render() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h2 class="text-2xl font-bold">Teacher Dashboard</h2>
                    <p class="text-muted-foreground mt-2">Welcome back, ${this.escapeHtml(user.name) || 'Teacher'}!</p>
                </div>
                
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My Students</p><h3 class="text-2xl font-bold">${this.students.length}</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Class Average</p><h3 class="text-2xl font-bold">0%</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Attendance Today</p><h3 class="text-2xl font-bold">0/0</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Pending Tasks</p><h3 class="text-2xl font-bold">0</h3></div></div>
                </div>
                
                <div class="rounded-xl border bg-card overflow-hidden">
                    <div class="p-4 border-b"><h3 class="font-semibold">My Students</h3></div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50"><tr><th class="px-4 py-3 text-left">Student</th><th class="px-4 py-3 text-left">ELIMUID</th><th class="px-4 py-3 text-left">Grade</th><th class="px-4 py-3 text-left">Attendance</th></tr></thead>
                            <tbody class="divide-y">
                                ${this.students.slice(0, 10).map(s => {
                                    const name = s.User?.name || 'Unknown';
                                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                    return `<tr><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="h-8 w-8 rounded-full bg-blue-100"><span class="text-blue-700 text-sm font-medium block text-center leading-8">${initials}</span></div><span>${this.escapeHtml(name)}</span></div></td><td class="px-4 py-3"><span class="font-mono text-xs bg-muted px-2 py-1 rounded">${s.elimuid || 'N/A'}</span></td><td class="px-4 py-3">${s.grade || 'N/A'}</td><td class="px-4 py-3"><div class="flex items-center gap-2"><div class="h-2 w-16 rounded-full bg-muted overflow-hidden"><div class="h-full w-[${s.attendance || 95}%] bg-green-500 rounded-full"></div></div><span>${s.attendance || 95}%</span></div></td></tr>`;
                                }).join('')}
                                ${this.students.length === 0 ? '<tr><td colspan="4" class="px-4 py-8 text-center">No students in your class</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="grid gap-4 md:grid-cols-4">
                    <button onclick="window.router.navigate('students')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="users" class="h-6 w-6 mx-auto mb-2 text-blue-600"></i><p class="text-center">My Students</p></button>
                    <button onclick="window.router.navigate('attendance')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="calendar-check" class="h-6 w-6 mx-auto mb-2 text-green-600"></i><p class="text-center">Attendance</p></button>
                    <button onclick="window.router.navigate('grades')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="trending-up" class="h-6 w-6 mx-auto mb-2 text-purple-600"></i><p class="text-center">Grades</p></button>
                    <button onclick="window.router.navigate('duty')" class="p-4 border rounded-lg hover:bg-accent"><i data-lucide="clock" class="h-6 w-6 mx-auto mb-2 text-amber-600"></i><p class="text-center">My Duty</p></button>
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

window.TeacherDashboard = TeacherDashboard;
console.log('✅ TeacherDashboard loaded');
