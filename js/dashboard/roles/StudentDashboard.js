// js/dashboard/roles/StudentDashboard.js

import BaseDashboard from '../BaseDashboard.js';

import { BaseDashboard } from '../base/BaseDashboard.js';
import { studentAPI } from '../../api/student.js';
import { dutyAPI } from '../../api/duty.js';
import { store } from '../../core/store.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { ChartRenderer } from '../base/ChartRenderer.js';
import { StatsRenderer } from '../base/StatsRenderer.js';
import { TableRenderer } from '../base/TableRenderer.js';
import { formatDate, timeAgo, getInitials } from '../../core/utils.js';
import { getGradeFromScore } from '../../constants/curriculum.js';

class StudentDashboard extends BaseDashboard {
    constructor(containerId) {
        super(containerId);
        this.grades = [];
        this.attendance = [];
        this.materials = [];
        this.student = null;
        this.todayDuty = [];
    }

    async loadData() {
        console.log('📊 Loading student dashboard data...');
        
        try {
            const [gradesRes, attendanceRes, materialsRes, dashboardRes] = await Promise.all([
                studentAPI.getGrades().catch(() => ({ data: [] })),
                studentAPI.getAttendance().catch(() => ({ data: [] })),
                studentAPI.getMaterials().catch(() => ({ data: [] })),
                studentAPI.getDashboard().catch(() => ({ data: {} }))
            ]);
            
            this.grades = gradesRes.data || [];
            this.attendance = attendanceRes.data || [];
            this.materials = materialsRes.data || [];
            this.student = dashboardRes.data?.student || store.getState('user');
            
            // Calculate stats
            const totalScores = this.grades.reduce((sum, g) => sum + (g.score || 0), 0);
            const averageScore = this.grades.length > 0 ? Math.round(totalScores / this.grades.length) : 0;
            
            const presentCount = this.attendance.filter(a => a.status === 'present').length;
            const attendanceRate = this.attendance.length > 0 ? Math.round((presentCount / this.attendance.length) * 100) : 0;
            
            this.stats = {
                elimuid: this.student?.elimuid || 'N/A',
                averageScore: averageScore,
                attendanceRate: attendanceRate,
                studyGroups: 3
            };
            
            this.data = {
                grades: this.grades,
                attendance: this.attendance,
                materials: this.materials,
                student: this.student
            };
            
        } catch (error) {
            console.error('Failed to load student data:', error);
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
                    <div class="rounded-xl border bg-card p-4 h-96 flex flex-col">
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center gap-2">
                                <h3 class="font-semibold">Study Group - ${this.student?.grade || 'Grade'} Math</h3>
                                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">5 online</span>
                            </div>
                            <button class="p-1 hover:bg-accent rounded" onclick="window.dashboard?.showGroupMembers()">
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
                            <button onclick="window.dashboard?.sendChatMessage()" class="p-2 bg-primary text-primary-foreground rounded-lg">
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
                            <button onclick="window.dashboard?.askAI()" class="p-2 bg-primary text-primary-foreground rounded-lg">
                                <i data-lucide="send" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">Today's Schedule</h3>
                        <div id="today-schedule-container" class="space-y-2"></div>
                    </div>
                    <div class="rounded-xl border bg-card p-6">
                        <h3 class="font-semibold mb-4">My Grades</h3>
                        <div id="grades-container"></div>
                    </div>
                </div>
                
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="rounded-xl border bg-card">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Upcoming Exams</h3>
                        </div>
                        <div id="exams-container" class="divide-y"></div>
                    </div>
                    <div class="rounded-xl border bg-card">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Homework</h3>
                        </div>
                        <div id="homework-container" class="divide-y"></div>
                    </div>
                </div>
                
                <div class="rounded-xl border bg-card p-6">
                    <h3 class="font-semibold mb-4">School Information</h3>
                    <div class="grid gap-4 md:grid-cols-3">
                        <div>
                            <p class="text-sm text-muted-foreground">Today's Duty Teachers</p>
                            <div id="duty-container" class="mt-2 space-y-1"></div>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Announcements</p>
                            <div id="announcements-container" class="mt-2 space-y-1"></div>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Upcoming Events</p>
                            <div id="events-container" class="mt-2 space-y-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Render stats
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            StatsRenderer.render(statsContainer, this.stats, 'student');
        }
        
        // Render schedule
        this.renderSchedule();
        
        // Render grades
        this.renderGrades();
        
        // Render exams and homework
        this.renderExams();
        this.renderHomework();
        
        // Render duty and announcements
        this.renderDuty();
        this.renderAnnouncements();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    renderSchedule() {
        const container = document.getElementById('today-schedule-container');
        if (!container) return;
        
        const schedule = [
            { time: '8:00 - 9:30', subject: 'Mathematics', room: 'Room 101' },
            { time: '10:00 - 11:30', subject: 'English', room: 'Room 203' },
            { time: '12:00 - 1:30', subject: 'Science', room: 'Lab 1' }
        ];
        
        container.innerHTML = schedule.map(item => `
            <div class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div>
                    <p class="font-medium">${item.subject}</p>
                    <p class="text-xs text-muted-foreground">${item.room}</p>
                </div>
                <span class="text-sm">${item.time}</span>
            </div>
        `).join('');
    }
    
    renderGrades() {
        const container = document.getElementById('grades-container');
        if (!container) return;
        
        const schoolSettings = store.getState('schoolSettings') || {};
        const curriculum = schoolSettings.curriculum || 'cbc';
        const level = schoolSettings.schoolLevel || 'secondary';
        
        if (this.grades.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-4">No grades available</p>';
            return;
        }
        
        container.innerHTML = this.grades.slice(0, 5).map(grade => {
            const score = grade.score || 0;
            const gradeInfo = getGradeFromScore(score, curriculum, level);
            const colorClass = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : 'bg-yellow-500';
            
            return `
                <div class="mb-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm">${grade.subject || 'Subject'}</span>
                        <span class="text-sm font-semibold">${score}% (${gradeInfo.grade})</span>
                    </div>
                    <div class="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                        <div class="h-full ${colorClass} rounded-full" style="width: ${score}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderExams() {
        const container = document.getElementById('exams-container');
        if (!container) return;
        
        const exams = [
            { name: 'Mathematics - Mid-term', topics: 'Algebra, Calculus', days: 3 },
            { name: 'English - Essay', topics: 'Creative Writing', days: 7 }
        ];
        
        container.innerHTML = exams.map(exam => `
            <div class="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div>
                    <p class="text-sm font-medium">${exam.name}</p>
                    <p class="text-xs text-muted-foreground">Topics: ${exam.topics}</p>
                </div>
                <span class="text-sm font-mono ${exam.days <= 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} px-3 py-1 rounded-full">
                    in ${exam.days} days
                </span>
            </div>
        `).join('');
    }
    
    renderHomework() {
        const container = document.getElementById('homework-container');
        if (!container) return;
        
        const homework = [
            { name: 'Mathematics - Problem Set', description: 'Questions 1-10 from Chapter 5', due: 'tomorrow' },
            { name: 'English - Essay', description: 'Write about your hero', due: 'Friday' }
        ];
        
        container.innerHTML = homework.map(item => `
            <div class="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div>
                    <p class="text-sm font-medium">${item.name}</p>
                    <p class="text-xs text-muted-foreground">${item.description}</p>
                </div>
                <span class="text-xs ${item.due === 'tomorrow' ? 'text-red-600' : 'text-amber-600'}">Due ${item.due}</span>
            </div>
        `).join('');
    }
    
    renderDuty() {
        const container = document.getElementById('duty-container');
        if (!container) return;
        
        // Sample duty data
        const duties = [
            { area: 'Main Gate', teacher: 'Mr. Kamau' },
            { area: 'Dining Hall', teacher: 'Ms. Atieno' }
        ];
        
        container.innerHTML = duties.map(duty => `
            <p class="text-sm">${duty.area}: ${duty.teacher}</p>
        `).join('');
    }
    
    renderAnnouncements() {
        const container = document.getElementById('announcements-container');
        if (!container) return;
        
        container.innerHTML = '<p class="text-sm">School closes at 3:30 PM today</p>';
    }
    
    // ============ Action Methods ============
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        
        if (!message) return;
        
        const container = document.getElementById('chat-messages');
        if (container) {
            container.innerHTML += `
                <div class="flex justify-end">
                    <div class="chat-bubble-sent max-w-[70%]">
                        <p class="text-sm font-medium">You</p>
                        <p class="text-sm">${message}</p>
                        <p class="text-xs text-muted-foreground mt-1">just now</p>
                    </div>
                </div>
            `;
            container.scrollTop = container.scrollHeight;
        }
        
        input.value = '';
        
        // Simulate response
        setTimeout(() => {
            if (container) {
                container.innerHTML += `
                    <div class="flex justify-start">
                        <div class="chat-bubble-received max-w-[70%]">
                            <p class="text-sm font-medium">Alex</p>
                            <p class="text-sm">Thanks! That helps a lot.</p>
                            <p class="text-xs text-muted-foreground mt-1">just now</p>
                        </div>
                    </div>
                `;
                container.scrollTop = container.scrollHeight;
            }
        }, 1000);
    }
    
    askAI() {
        const input = document.getElementById('ai-input');
        const question = input?.value.trim();
        
        if (!question) return;
        
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;
        
        container.innerHTML += `
            <div class="flex justify-end">
                <div class="chat-bubble-sent max-w-[70%]">
                    <p class="text-sm font-medium">You</p>
                    <p class="text-sm">${question}</p>
                    <p class="text-xs text-muted-foreground mt-1">just now</p>
                </div>
            </div>
        `;
        
        input.value = '';
        container.scrollTop = container.scrollHeight;
        
        // Typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'flex justify-start';
        typingDiv.innerHTML = `
            <div class="chat-bubble-received">
                <p class="text-sm text-muted-foreground">AI Tutor is typing...</p>
            </div>
        `;
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        
        // Simulate AI response
        setTimeout(() => {
            typingDiv.remove();
            
            const responses = [
                `That's an excellent question! Let me explain...`,
                `Based on the curriculum, here's what you need to know...`,
                `Great question! Here's a step-by-step explanation...`,
                `I'd be happy to help you with that. The answer is...`
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            container.innerHTML += `
                <div class="flex justify-start">
                    <div class="chat-bubble-received max-w-[70%]">
                        <p class="text-sm font-medium">AI Tutor</p>
                        <p class="text-sm">${randomResponse} "${question}" is an important concept. Would you like me to provide examples or practice problems?</p>
                        <p class="text-xs text-muted-foreground mt-1">just now</p>
                    </div>
                </div>
            `;
            container.scrollTop = container.scrollHeight;
        }, 1500);
    }
    
    showGroupMembers() {
        toast.info('Group members: Alex, Maria, John, You, Sarah');
    }
    
    setupRealtimeSubscriptions() {
        if (!window.realtime) return;
        
        window.realtime.on('grades-updated', () => this.refresh());
        window.realtime.on('attendance-updated', () => this.refresh());
    }
    
    attachEventListeners() {
        // Add enter key listeners
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }
        
        const aiInput = document.getElementById('ai-input');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.askAI();
            });
        }
    }
}

window.StudentDashboard = StudentDashboard;
