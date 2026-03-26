// js/dashboard/roles/StudentDashboard.js
class StudentDashboard extends window.BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.grades = [];
        this.attendance = [];
    }

    async loadData() {
        console.log('📊 Loading student dashboard data...');
        const token = localStorage.getItem('authToken');
        
        if (!token) return;

        try {
            const [gradesRes, attendanceRes] = await Promise.all([
                fetch('https://shuleaibackend-32h1.onrender.com/api/student/grades', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shuleaibackend-32h1.onrender.com/api/student/attendance', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            if (gradesRes.ok) {
                const data = await gradesRes.json();
                this.grades = data.data || [];
            }
            if (attendanceRes.ok) {
                const data = await attendanceRes.json();
                this.attendance = data.data || [];
            }
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    }

    render() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const avgScore = this.grades.length > 0 ? Math.round(this.grades.reduce((s, g) => s + (g.score || 0), 0) / this.grades.length) : 0;
        const attendanceRate = this.attendance.length > 0 ? Math.round((this.attendance.filter(a => a.status === 'present').length / this.attendance.length) * 100) : 95;
        
        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="rounded-xl border bg-card p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h2 class="text-2xl font-bold">Student Dashboard</h2>
                    <p class="text-muted-foreground mt-2">Welcome, ${this.escapeHtml(user.name) || 'Student'}!</p>
                </div>
                
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My ELIMUID</p><h3 class="text-lg font-mono font-bold">${user.elimuid || 'ELI-****'}</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My Average</p><h3 class="text-2xl font-bold">${avgScore}%</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">My Attendance</p><h3 class="text-2xl font-bold">${attendanceRate}%</h3></div></div>
                    <div class="rounded-xl border bg-card p-6"><div><p class="text-sm text-muted-foreground">Study Groups</p><h3 class="text-2xl font-bold">3</h3></div></div>
                </div>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4">Recent Grades</h3>
                    <div class="space-y-3">
                        ${this.grades.slice(0, 5).map(g => `
                            <div><div class="flex justify-between"><span>${g.subject || 'Subject'}</span><span class="font-semibold">${g.score || 0}%</span></div><div class="w-full h-2 bg-muted rounded-full overflow-hidden mt-1"><div class="h-full bg-green-500 rounded-full" style="width: ${g.score || 0}%"></div></div></div>
                        `).join('')}
                        ${this.grades.length === 0 ? '<p class="text-center text-muted-foreground py-4">No grades available yet</p>' : ''}
                    </div>
                </div>
                
                <div class="grid gap-4 md:grid-cols-2">
                    <button onclick="window.router.navigate('grades')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="trending-up" class="h-8 w-8 mx-auto mb-3 text-green-600"></i><h4 class="font-semibold text-center">My Grades</h4></button>
                    <button onclick="window.router.navigate('attendance')" class="p-6 border rounded-lg hover:bg-accent"><i data-lucide="calendar-check" class="h-8 w-8 mx-auto mb-3 text-blue-600"></i><h4 class="font-semibold text-center">Attendance</h4></button>
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

window.StudentDashboard = StudentDashboard;
console.log('✅ StudentDashboard loaded');
