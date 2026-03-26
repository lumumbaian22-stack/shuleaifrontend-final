// js/dashboard/roles/StudentDashboard.js
import { BaseDashboard } from '../base/BaseDashboard.js';
import { escapeHtml, formatDate } from '../../core/utils.js';

export class StudentDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.grades = [];
        this.attendance = [];
        this.student = null;
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
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            this.student = user;
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    }

    render() {
        const avgScore = this.grades.length ? Math.round(this.grades.reduce((s, g) => s + (g.score || 0), 0) / this.grades.length) : 0;
        const presentCount = this.attendance.filter(a => a.status === 'present').length;
        const attendanceRate = this.attendance.length ? Math.round((presentCount / this.attendance.length) * 100) : 95;

        this.container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Stats Grid -->
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">My ELIMUID</p>
                                <h3 class="text-lg font-mono font-bold mt-1" id="student-elimuid">${this.student?.elimuid || 'ELI-****'}</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <i data-lucide="id-card" class="h-6 w-6 text-purple-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Class Average</p>
                                <h3 class="text-2xl font-bold mt-1" id="class-average-student">${avgScore}%</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <i data-lucide="trending-up" class="h-6 w-6 text-green-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">My Attendance</p>
                                <h3 class="text-2xl font-bold mt-1" id="student-attendance">${attendanceRate}%</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Study Groups</p>
                                <h3 class="text-2xl font-bold mt-1" id="study-groups-count">3</h3>
                            </div>
                            <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i data-lucide="message-circle" class="h-6 w-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Peer Group Chat & AI Tutor -->
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-card p-4 h-96 flex flex-col">
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center gap-2">
                                <h3 class="font-semibold" id="study-group-name">Study Group - Grade 10 Math</h3>
                                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full" id="online-count">5 online</span>
                            </div>
                            <button class="p-1 hover:bg-accent rounded" onclick="window.showGroupMembers()">
                                <i data-lucide="users" class="h-4 w-4"></i>
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto space-y-3 mb-4" id="chat-messages">
                            <div class="chat-bubble-received">
                                <p class="text-sm">Can anyone help with quadratic equations?</p>
                                <p class="text-xs text-muted-foreground mt-1">Alex • 2 min ago</p>
                            </div>
                            <div class="chat-bubble-sent">
                                <p class="text-sm">Sure! Use the formula x = [-b ± √(b²-4ac)]/2a</p>
                                <p class="text-xs text-muted-foreground mt-1">You • 1 min ago</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <input type="text" id="chat-input" placeholder="Type a message..." class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <button onclick="window.sendChatMessage()" class="p-2 bg-primary text-primary-foreground rounded-lg">
                                <i data-lucide="send" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-4 h-96 flex flex-col">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <i data-lucide="bot" class="h-4 w-4 text-white"></i>
                            </div>
                            <h3 class="font-semibold">AI Tutor</h3>
                            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">Always online</span>
                        </div>
                        <div class="flex-1 overflow-y-auto space-y-3 mb-4" id="ai-chat-messages">
                            <div class="chat-bubble-received">
                                <p class="text-sm">Hi! I'm your AI tutor. Ask me anything about your subjects!</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <input type="text" id="ai-input" placeholder="Ask AI tutor..." class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <button onclick="window.askAI()" class="p-2 bg-primary text-primary-foreground rounded-lg">
                                <i data-lucide="send" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- My Schedule & Progress -->
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Today's Schedule</h3>
                        <div class="space-y-2" id="today-schedule">
                            <div class="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                <span>Mathematics</span>
                                <span>8:00 AM - 9:30 AM</span>
                            </div>
                            <div class="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                <span>English</span>
                                <span>10:00 AM - 11:30 AM</span>
                            </div>
                            <div class="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                <span>Science</span>
                                <span>12:00 PM - 1:30 PM</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">My Grades</h3>
                        <div class="space-y-3" id="my-grades">
                            ${this.grades.slice(0, 3).map(g => `
                                <div>
                                    <div class="flex justify-between items-center">
                                        <span>${escapeHtml(g.subject || 'Subject')}</span>
                                        <span class="font-semibold">${g.score || 0}% (${g.grade || 'N/A'})</span>
                                    </div>
                                    <div class="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                                        <div class="h-full ${g.score >= 80 ? 'bg-green-500' : g.score >= 60 ? 'bg-blue-500' : 'bg-yellow-500'} rounded-full" style="width: ${g.score || 0}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                            ${this.grades.length === 0 ? '<p class="text-center text-muted-foreground py-4">No grades available</p>' : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Upcoming Exams & Homework -->
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-card">
                        <div class="p-4 border-b"><h3 class="font-semibold">Upcoming Exams</h3></div>
                        <div class="divide-y" id="upcoming-exams">
                            <div class="p-4 flex items-center justify-between hover:bg-accent/50">
                                <div><p class="text-sm font-medium">Mathematics - Mid-term</p><p class="text-xs text-muted-foreground">Topics: Algebra, Calculus</p></div>
                                <span class="text-sm font-mono bg-red-100 text-red-700 px-3 py-1 rounded-full">in 3 days</span>
                            </div>
                            <div class="p-4 flex items-center justify-between hover:bg-accent/50">
                                <div><p class="text-sm font-medium">English - Essay</p><p class="text-xs text-muted-foreground">Length: 1000 words</p></div>
                                <span class="text-sm font-mono bg-amber-100 text-amber-700 px-3 py-1 rounded-full">next week</span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border bg-card">
                        <div class="p-4 border-b"><h3 class="font-semibold">Homework</h3></div>
                        <div class="divide-y" id="homework-list">
                            <div class="p-4 flex items-center justify-between hover:bg-accent/50">
                                <div><p class="text-sm font-medium">Mathematics - Problem Set</p><p class="text-xs text-muted-foreground">Questions 1-10 from Chapter 5</p></div>
                                <span class="text-xs text-red-600">Due tomorrow</span>
                            </div>
                            <div class="p-4 flex items-center justify-between hover:bg-accent/50">
                                <div><p class="text-sm font-medium">English - Essay</p><p class="text-xs text-muted-foreground">Write about your hero</p></div>
                                <span class="text-xs text-amber-600">Due Friday</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- School Information -->
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4">School Information</h3>
                    <div class="grid gap-4 md:grid-cols-3">
                        <div>
                            <p class="text-sm text-muted-foreground">Today's Duty Teachers</p>
                            <div class="mt-2 space-y-1" id="school-duty">
                                <p class="text-sm">Main Gate: Mr. Kamau</p>
                                <p class="text-sm">Dining Hall: Ms. Atieno</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Announcements</p>
                            <div class="mt-2 space-y-1" id="announcements">
                                <p class="text-sm">School closes at 3:30 PM today</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Upcoming Events</p>
                            <div class="mt-2 space-y-1" id="school-events">
                                <p class="text-sm">Sports Day: Apr 15, 2024</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // After rendering, populate dynamic data
        this.updateGradesDisplay();
    }

    updateGradesDisplay() {
        const container = document.getElementById('my-grades');
        if (!container) return;
        if (this.grades.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-4">No grades available</p>';
            return;
        }
        let html = '';
        this.grades.slice(0, 3).forEach(g => {
            const score = g.score || 0;
            const colorClass = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : 'bg-yellow-500';
            html += `
                <div>
                    <div class="flex justify-between items-center">
                        <span>${escapeHtml(g.subject || 'Subject')}</span>
                        <span class="font-semibold">${score}% (${g.grade || 'N/A'})</span>
                    </div>
                    <div class="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                        <div class="h-full ${colorClass} rounded-full" style="width: ${score}%"></div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    showSection(section) {
        if (section === 'dashboard') this.refresh();
        else if (section === 'grades') alert('Grades section coming soon');
        else if (section === 'attendance') alert('Attendance section coming soon');
        else if (section === 'chat') alert('Chat section coming soon');
        else if (section === 'ai-tutor') alert('AI Tutor section coming soon');
    }

    async refresh() {
        await this.loadData();
        this.render();
    }
}

// Global functions for student
window.showGroupMembers = () => alert('Group members: Alex, Maria, John, You, Sarah');
window.sendChatMessage = () => {
    const input = document.getElementById('chat-input');
    const message = input?.value.trim();
    if (!message) return;
    const container = document.getElementById('chat-messages');
    if (container) {
        container.innerHTML += `<div class="flex justify-end"><div class="chat-bubble-sent max-w-[70%]"><p class="text-sm font-medium">You</p><p class="text-sm">${escapeHtml(message)}</p><p class="text-xs text-muted-foreground mt-1">just now</p></div></div>`;
        container.scrollTop = container.scrollHeight;
        input.value = '';
        // Simulate reply
        setTimeout(() => {
            container.innerHTML += `<div class="flex justify-start"><div class="chat-bubble-received max-w-[70%]"><p class="text-sm font-medium">Alex</p><p class="text-sm">Thanks! That helps a lot.</p><p class="text-xs text-muted-foreground mt-1">just now</p></div></div>`;
            container.scrollTop = container.scrollHeight;
        }, 1000);
    }
};
window.askAI = () => {
    const input = document.getElementById('ai-input');
    const question = input?.value.trim();
    if (!question) return;
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    container.innerHTML += `<div class="flex justify-end"><div class="chat-bubble-sent max-w-[70%]"><p class="text-sm font-medium">You</p><p class="text-sm">${escapeHtml(question)}</p><p class="text-xs text-muted-foreground mt-1">just now</p></div></div>`;
    input.value = '';
    container.scrollTop = container.scrollHeight;
    // Simulate AI typing
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex justify-start';
    typingDiv.innerHTML = `<div class="chat-bubble-received"><p class="text-sm text-muted-foreground">AI Tutor is typing...</p></div>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    setTimeout(() => {
        typingDiv.remove();
        const responses = ['That\'s an excellent question! Let me explain...', 'Based on the curriculum, here\'s what you need to know...', 'Great question! Here\'s a step-by-step explanation...', 'I\'d be happy to help you with that.'];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        container.innerHTML += `<div class="flex justify-start"><div class="chat-bubble-received max-w-[70%]"><p class="text-sm font-medium">AI Tutor</p><p class="text-sm">${randomResponse} "${escapeHtml(question)}" is an important concept. Would you like me to provide examples?</p><p class="text-xs text-muted-foreground mt-1">just now</p></div></div>`;
        container.scrollTop = container.scrollHeight;
    }, 1500);
};
