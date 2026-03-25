// js/pages/HelpPage.js
import { store } from '../core/store.js';
import { toast } from '../ui/feedback/Toast.js';
import { modalManager } from '../ui/components/Modal.js';

export const HelpPage = {
    articles: {
        superadmin: [
            { title: 'How to approve a new school', content: 'Go to School Approvals, review school details, click Approve. The school will be activated immediately.', keywords: ['approve', 'school', 'activate'] },
            { title: 'How to suspend a school', content: 'Find the school in Schools list, click the suspend button, enter reason. All users will be locked out.', keywords: ['suspend', 'block', 'deactivate'] },
            { title: 'How to change platform name', content: 'Go to Platform Settings, enter new name, click Save. Changes appear in emails and headers.', keywords: ['name', 'platform', 'rename'] },
            { title: 'How to view platform health', content: 'Go to Platform Health to see system status, CPU usage, memory usage, and recent events.', keywords: ['health', 'status', 'monitor'] }
        ],
        admin: [
            { title: 'How to add a student', content: 'Go to Students, click Add Student, fill in details. The student receives an ELIMUID automatically.', keywords: ['add', 'student', 'create'] },
            { title: 'How to approve a teacher', content: 'Go to Teacher Approvals, review teacher details, click Approve or Reject.', keywords: ['teacher', 'approve', 'hire'] },
            { title: 'How to generate duty roster', content: 'Go to Duty Management, select dates, click Generate Roster. The system assigns duties based on fairness.', keywords: ['duty', 'roster', 'schedule'] },
            { title: 'How to change curriculum', content: 'Go to Settings, select new curriculum, click Save. All users will see updated grading.', keywords: ['curriculum', 'cbc', '844', 'change'] }
        ],
        teacher: [
            { title: 'How to take attendance', content: 'Go to Attendance, mark each student as Present/Absent/Late, add notes, click Save Attendance.', keywords: ['attendance', 'present', 'absent'] },
            { title: 'How to enter grades', content: 'Go to Grades, select subject and assessment type, enter scores, click Save.', keywords: ['grade', 'mark', 'score'] },
            { title: 'How to check in for duty', content: 'Go to Dashboard, find Duty Card, click Check In when on duty.', keywords: ['duty', 'checkin', 'responsibility'] }
        ],
        parent: [
            { title: 'How to view child progress', content: 'Select your child from the top, view grades, attendance, and teacher comments.', keywords: ['progress', 'grades', 'attendance'] },
            { title: 'How to report absence', content: 'Click Report Absence, select date, enter reason, submit. Teacher will be notified.', keywords: ['absence', 'absent', 'report'] },
            { title: 'How to make payment', content: 'Go to Payments, select child, choose plan, enter amount, complete payment.', keywords: ['payment', 'pay', 'fee'] }
        ],
        student: [
            { title: 'How to view my grades', content: 'Go to My Grades to see all your scores and performance.', keywords: ['grade', 'score', 'result'] },
            { title: 'How to use AI Tutor', content: 'Type your question in AI Tutor chat, get instant help with any subject.', keywords: ['ai', 'tutor', 'help'] },
            { title: 'How to join study groups', content: 'Go to Study Chat to connect with other students and study together.', keywords: ['study', 'chat', 'group'] }
        ]
    },
    
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const user = store.getState('user');
        const role = user?.role || 'admin';
        const articles = this.articles[role] || this.articles.admin;
        
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in max-w-5xl mx-auto">
                <div class="text-center">
                    <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Help Center</h2>
                    <p class="text-muted-foreground mt-2">Find answers to common questions and learn how to use the platform</p>
                </div>
                
                <div class="relative">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"></i>
                    <input type="text" id="help-search" placeholder="Search help articles..." onkeyup="window.HelpPage.search()" class="w-full pl-10 pr-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary transition-all">
                </div>
                
                <div id="help-articles" class="grid gap-4">
                    ${articles.map(article => `
                        <div class="help-article rounded-xl border bg-card p-6 hover:shadow-md transition-all cursor-pointer" data-title="${article.title.toLowerCase()}" data-content="${article.content.toLowerCase()}" data-keywords="${article.keywords.join(' ').toLowerCase()}" onclick="window.HelpPage.showArticle('${article.title.replace(/'/g, "\\'")}', '${article.content.replace(/'/g, "\\'")}')">
                            <h3 class="font-semibold text-lg mb-2">📚 ${article.title}</h3>
                            <p class="text-muted-foreground">${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 text-center">
                    <h3 class="font-semibold text-lg mb-2">💬 Still Need Help?</h3>
                    <p class="text-muted-foreground mb-4">Contact our support team for assistance</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="window.HelpPage.showSupportChat()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><i data-lucide="message-circle" class="h-4 w-4 inline mr-2"></i>Live Chat</button>
                        <button onclick="window.location.href='mailto:support@shuleai.com'" class="px-4 py-2 border rounded-lg hover:bg-accent"><i data-lucide="mail" class="h-4 w-4 inline mr-2"></i>Email Support</button>
                    </div>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    search() {
        const searchTerm = document.getElementById('help-search')?.value.toLowerCase().trim();
        const articles = document.querySelectorAll('.help-article');
        
        if (!searchTerm) {
            articles.forEach(article => article.style.display = 'block');
            return;
        }
        
        let found = 0;
        articles.forEach(article => {
            const title = article.dataset.title || '';
            const content = article.dataset.content || '';
            const keywords = article.dataset.keywords || '';
            
            if (title.includes(searchTerm) || content.includes(searchTerm) || keywords.includes(searchTerm)) {
                article.style.display = 'block';
                found++;
            } else {
                article.style.display = 'none';
            }
        });
        
        const noResultsMsg = document.getElementById('no-results-message');
        if (found === 0) {
            if (!noResultsMsg) {
                const container = document.getElementById('help-articles');
                const msg = document.createElement('div');
                msg.id = 'no-results-message';
                msg.className = 'text-center py-12';
                msg.innerHTML = `<i data-lucide="search-x" class="h-12 w-12 mx-auto text-muted-foreground mb-3"></i><p class="text-muted-foreground">No results found for "${searchTerm}"</p><p class="text-sm text-muted-foreground mt-1">Try different keywords or contact support</p>`;
                container.appendChild(msg);
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },
    
    showArticle(title, content) {
        const modal = modalManager.create('help-article-modal', title);
        modal.setContent(`
            <div class="space-y-4">
                <div class="border-b pb-3"><h3 class="text-xl font-semibold">${title}</h3></div>
                <div class="prose prose-sm max-w-none"><p class="text-muted-foreground">${content}</p></div>
                <div class="flex justify-end gap-2 pt-4 border-t"><button onclick="window.modalManager?.close('help-article-modal')" class="px-4 py-2 border rounded-lg hover:bg-accent">Close</button><button onclick="window.HelpPage.showSupportChat()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Contact Support</button></div>
            </div>
        `);
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    showSupportChat() {
        toast.info('Opening support chat...');
    }
};

window.HelpPage = HelpPage;