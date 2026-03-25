// js/pages/LandingPage.js
import { toast } from '../ui/feedback/Toast.js';
import { apiClient } from '../api/client.js';

export const LandingPage = {
    container: null,
    
    async render(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        const stats = await this.loadStats();
        
        this.container.innerHTML = `
            <div class="min-h-screen bg-background">
                <!-- Hero Section -->
                <section class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 lg:py-32">
                    <div class="container mx-auto px-4">
                        <div class="flex flex-col items-center text-center">
                            <div class="flex items-center gap-3 mb-6 cursor-pointer" id="secret-logo-trigger">
                                <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
                                    <i data-lucide="graduation-cap" class="h-8 w-8 text-white"></i>
                                </div>
                                <span class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">ShuleAI</span>
                            </div>
                            <h1 class="max-w-3xl text-4xl font-extrabold tracking-tight lg:text-5xl xl:text-6xl">School Intelligence System</h1>
                            <p class="mt-6 max-w-2xl text-lg text-muted-foreground">Empowering educators, students, and parents with data-driven insights. Streamline administration, track performance, and foster collaboration.</p>
                            <div class="mt-10 flex flex-wrap gap-4 justify-center">
                                <a href="#role-cards" class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">Get Started</a>
                                <a href="#stats" class="rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors">Learn More</a>
                            </div>
                        </div>
                    </div>
                    <div class="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-30"></div>
                </section>
                
                <!-- Stats Section -->
                <section id="stats" class="py-16 lg:py-24 container mx-auto px-4">
                    <div class="text-center mb-12">
                        <h2 class="text-3xl font-bold">Trusted by schools across the country</h2>
                        <p class="text-muted-foreground mt-2">Real-time data at your fingertips</p>
                    </div>
                    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4" id="landing-stats">
                        ${this.renderStats(stats)}
                    </div>
                </section>
                
                <!-- Role Cards Section -->
                <section id="role-cards" class="py-16 lg:py-24 bg-muted/30">
                    <div class="container mx-auto px-4">
                        <div class="text-center mb-12">
                            <h2 class="text-3xl font-bold">One platform for every role</h2>
                            <p class="text-muted-foreground mt-2">Select your role to sign in or create an account</p>
                        </div>
                        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-5" id="role-cards-container">
                            ${this.renderRoleCards()}
                        </div>
                    </div>
                </section>
                
                <!-- Footer -->
                ${this.renderFooter()}
            </div>
        `;
        
        this.setupEventListeners();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    renderStats(stats) {
        return `
            <div class="rounded-xl border bg-card p-6 card-hover text-center">
                <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="users" class="h-6 w-6 text-blue-600"></i>
                </div>
                <p class="text-3xl font-bold">${stats.totalStudents?.toLocaleString() || '2,543+'}</p>
                <p class="text-sm text-muted-foreground">Active Students</p>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover text-center">
                <div class="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="users" class="h-6 w-6 text-violet-600"></i>
                </div>
                <p class="text-3xl font-bold">${stats.totalTeachers?.toLocaleString() || '128+'}</p>
                <p class="text-sm text-muted-foreground">Expert Teachers</p>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover text-center">
                <div class="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="book-open" class="h-6 w-6 text-emerald-600"></i>
                </div>
                <p class="text-3xl font-bold">${stats.totalClasses?.toLocaleString() || '64'}</p>
                <p class="text-sm text-muted-foreground">Interactive Classes</p>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover text-center">
                <div class="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="calendar-check" class="h-6 w-6 text-amber-600"></i>
                </div>
                <p class="text-3xl font-bold">${stats.attendanceRate || '94.2'}%</p>
                <p class="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
        `;
    },
    
    renderRoleCards() {
        return `
            <div id="superadmin-role-card" class="rounded-xl border bg-card p-6 card-hover flex flex-col items-center text-center hidden">
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-4 shadow-md">
                    <i data-lucide="shield" class="h-8 w-8 text-white"></i>
                </div>
                <h3 class="font-semibold text-lg">Super Admin</h3>
                <p class="text-xs text-muted-foreground mt-1 mb-4">Platform oversight</p>
                <div class="flex gap-2 w-full">
                    <button onclick="window.LandingPage.openAuthModal('superadmin', 'signin')" class="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Sign In</button>
                </div>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover flex flex-col items-center text-center">
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-md">
                    <i data-lucide="building-2" class="h-8 w-8 text-white"></i>
                </div>
                <h3 class="font-semibold text-lg">Admin</h3>
                <p class="text-xs text-muted-foreground mt-1 mb-4">School management</p>
                <div class="flex gap-2 w-full">
                    <button onclick="window.LandingPage.openAuthModal('admin', 'signin')" class="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Sign In</button>
                    <button onclick="window.LandingPage.openAuthModal('admin', 'signup')" class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent">Sign Up</button>
                </div>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover flex flex-col items-center text-center">
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-md">
                    <i data-lucide="presentation" class="h-8 w-8 text-white"></i>
                </div>
                <h3 class="font-semibold text-lg">Teacher</h3>
                <p class="text-xs text-muted-foreground mt-1 mb-4">Classroom management</p>
                <div class="flex gap-2 w-full">
                    <button onclick="window.LandingPage.openAuthModal('teacher', 'signin')" class="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Sign In</button>
                    <button onclick="window.LandingPage.openAuthModal('teacher', 'signup')" class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent">Sign Up</button>
                </div>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover flex flex-col items-center text-center">
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-md">
                    <i data-lucide="heart" class="h-8 w-8 text-white"></i>
                </div>
                <h3 class="font-semibold text-lg">Parent</h3>
                <p class="text-xs text-muted-foreground mt-1 mb-4">Track your child</p>
                <div class="flex gap-2 w-full">
                    <button onclick="window.LandingPage.openAuthModal('parent', 'signin')" class="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Sign In</button>
                    <button onclick="window.LandingPage.openAuthModal('parent', 'signup')" class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent">Sign Up</button>
                </div>
            </div>
            <div class="rounded-xl border bg-card p-6 card-hover flex flex-col items-center text-center">
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-md">
                    <i data-lucide="graduation-cap" class="h-8 w-8 text-white"></i>
                </div>
                <h3 class="font-semibold text-lg">Student</h3>
                <p class="text-xs text-muted-foreground mt-1 mb-4">Access your learning portal</p>
                <div class="flex gap-2 w-full">
                    <button onclick="window.LandingPage.openStudentLoginModal()" class="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Login</button>
                </div>
                <p class="text-xs text-muted-foreground mt-3">New students: Get ELIMUID from your teacher</p>
            </div>
        `;
    },
    
    renderFooter() {
        const year = new Date().getFullYear();
        return `
            <footer class="bg-card border-t border-border py-12">
                <div class="container mx-auto px-4">
                    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div class="flex items-center gap-2 mb-4">
                                <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                    <i data-lucide="graduation-cap" class="h-4 w-4 text-white"></i>
                                </div>
                                <span class="text-lg font-bold">ShuleAI</span>
                            </div>
                            <p class="text-sm text-muted-foreground">Modern school management for the digital age. Empowering education through intelligence.</p>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-4">Quick Links</h4>
                            <ul class="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" class="hover:text-foreground transition-colors">About Us</a></li>
                                <li><a href="#" class="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#" class="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#" class="hover:text-foreground transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-4">Support</h4>
                            <ul class="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" class="hover:text-foreground transition-colors">Help Center</a></li>
                                <li><a href="#" class="hover:text-foreground transition-colors">Documentation</a></li>
                                <li><a href="#" class="hover:text-foreground transition-colors">Contact Us</a></li>
                                <li><a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-4">Connect</h4>
                            <div class="flex gap-3">
                                <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="twitter" class="h-4 w-4"></i></a>
                                <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="linkedin" class="h-4 w-4"></i></a>
                                <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="github" class="h-4 w-4"></i></a>
                                <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors"><i data-lucide="mail" class="h-4 w-4"></i></a>
                            </div>
                            <p class="text-sm text-muted-foreground mt-4">© ${year} ShuleAI. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    },
    
    async loadStats() {
        try {
            const response = await apiClient.get('/api/public/stats');
            return response.data || {};
        } catch (error) {
            console.error('Failed to load stats:', error);
            return {};
        }
    },
    
    setupEventListeners() {
        let clickCount = 0;
        const secretTrigger = document.getElementById('secret-logo-trigger');
        if (secretTrigger) {
            secretTrigger.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 3) {
                    const superAdminCard = document.getElementById('superadmin-role-card');
                    if (superAdminCard) {
                        superAdminCard.classList.remove('hidden');
                        toast.show('Super Admin access granted', 'info');
                    }
                    clickCount = 0;
                }
                setTimeout(() => clickCount = 0, 2000);
            });
        }
    },
    
    openAuthModal(role, mode) {
        window.currentRole = role;
        const modal = window.modalManager?.get('auth-modal');
        const titleEl = document.getElementById('auth-modal-title');
        const contentEl = document.getElementById('auth-modal-content');
        
        if (!modal || !titleEl || !contentEl) return;
        
        titleEl.textContent = mode === 'signin' ? `Sign In as ${role}` : `Sign Up as ${role}`;
        contentEl.innerHTML = this.getAuthForm(role, mode);
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    getAuthForm(role, mode) {
        if (role === 'superadmin') {
            return `
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="super@shuleai.com">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Password</label>
                    <input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Secret Key</label>
                    <input type="password" id="auth-secret-key" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Enter super admin key">
                    <p class="text-xs text-muted-foreground mt-1">Contact system administrator for the key</p>
                </div>
            `;
        }
        
        if (mode === 'signin') {
            return `
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Password</label>
                    <input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                </div>
            `;
        } else {
            if (role === 'admin') {
                return `
                    <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="auth-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">School Name</label><input type="text" id="auth-school-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">School Level</label><select id="auth-school-level" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="both">Both Primary & Secondary</option></select></div>
                    <div><label class="block text-sm font-medium mb-1">Curriculum</label><select id="auth-curriculum" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="cbc">CBC (Competency Based Curriculum)</option><option value="844">8-4-4 System</option><option value="british">British Curriculum</option><option value="american">American Curriculum</option></select></div>
                    <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" id="auth-phone" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"><p class="text-xs text-blue-600 dark:text-blue-400"><i data-lucide="info" class="h-3 w-3 inline mr-1"></i>Your school will be pending approval. You'll receive a short code (e.g., SHL-A7K29) for teachers to use.</p></div>
                `;
            } else if (role === 'teacher') {
                return `
                    <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="auth-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div class="flex gap-2"><div class="flex-1"><label class="block text-sm font-medium mb-1">School Code</label><input type="text" id="auth-school-code" placeholder="e.g., SHL-A7K29" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div><div class="flex items-end"><button type="button" onclick="window.LandingPage.verifySchoolCode()" class="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm mb-[1px]">Verify</button></div></div>
                    <div id="school-verify-status" class="text-xs hidden"></div>
                    <div><label class="block text-sm font-medium mb-1">Subjects (comma separated)</label><input type="text" id="auth-subjects" placeholder="Mathematics, Science, English" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Qualification</label><input type="text" id="auth-qualification" placeholder="e.g., B.Ed Mathematics" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" id="auth-phone" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                `;
            } else if (role === 'parent') {
                return `
                    <div><label class="block text-sm font-medium mb-1">Full Name</label><input type="text" id="auth-name" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Student's ELIMUID</label><input type="text" id="auth-student-elimuid" placeholder="e.g., ELI-2024-001" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Phone</label><input type="tel" id="auth-phone" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
                `;
            }
        }
        return '';
    },
    
    openStudentLoginModal() {
        window.currentRole = 'student';
        const modal = window.modalManager?.get('auth-modal');
        const titleEl = document.getElementById('auth-modal-title');
        const contentEl = document.getElementById('auth-modal-content');
        
        if (!modal || !titleEl || !contentEl) return;
        
        titleEl.textContent = 'Student Login';
        contentEl.innerHTML = `
            <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                    <p class="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                        <i data-lucide="info" class="h-4 w-4 flex-shrink-0 mt-0.5"></i>
                        <span>Welcome! Use your ELIMUID and the default password: <strong>Student123!</strong></span>
                    </p>
                </div>
                <div><label class="block text-sm font-medium mb-1">ELIMUID</label><input type="text" id="auth-elimuid" placeholder="e.g., ELI-2024-001" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required></div>
                <div><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="auth-password" placeholder="Enter your password" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required></div>
                <div class="flex justify-end gap-2 mt-6"><button onclick="window.modalManager?.close('auth-modal')" class="px-4 py-2 text-sm border rounded-lg hover:bg-accent">Cancel</button><button onclick="window.LandingPage.handleStudentLogin()" class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Login</button></div>
                <div class="text-center mt-4 pt-4 border-t"><p class="text-xs text-muted-foreground">First time? Use default password: <strong>Student123!</strong><br>You'll be asked to change it after logging in.</p></div>
            </div>
        `;
        modal.open();
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    async handleStudentLogin() {
        const elimuid = document.getElementById('auth-elimuid')?.value;
        const password = document.getElementById('auth-password')?.value;
        
        if (!elimuid || !password) {
            toast.error('ELIMUID and password required');
            return;
        }
        
        toast.loading(true);
        try {
            const response = await apiClient.post('/api/auth/student/login', { elimuid, password });
            
            if (response.success) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userRole', 'student');
                
                if (response.data.user.firstLogin) {
                    window.modalManager?.close('auth-modal');
                    window.password?.showFirstTimePasswordModal(elimuid);
                } else {
                    toast.success('Login successful!');
                    window.location.reload();
                }
            }
        } catch (error) {
            toast.error(error.message || 'Invalid ELIMUID or password');
        } finally {
            toast.loading(false);
        }
    },
    
    async verifySchoolCode() {
        const code = document.getElementById('auth-school-code')?.value;
        if (!code) {
            toast.error('Please enter a school code');
            return;
        }
        
        toast.loading(true);
        try {
            const response = await apiClient.post('/api/auth/verify-school', { schoolCode: code });
            const statusDiv = document.getElementById('school-verify-status');
            statusDiv.className = 'text-xs mt-1 p-2 bg-green-100 text-green-700 rounded-lg';
            statusDiv.innerHTML = `<i data-lucide="check-circle" class="h-3 w-3 inline mr-1"></i> Verified: ${response.data.schoolName}`;
            statusDiv.classList.remove('hidden');
            toast.success(`School found: ${response.data.schoolName}`);
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            const statusDiv = document.getElementById('school-verify-status');
            statusDiv.className = 'text-xs mt-1 p-2 bg-red-100 text-red-700 rounded-lg';
            statusDiv.innerHTML = `<i data-lucide="x-circle" class="h-3 w-3 inline mr-1"></i> ${error.message}`;
            statusDiv.classList.remove('hidden');
            toast.error(error.message || 'Invalid school code');
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } finally {
            toast.loading(false);
        }
    }
};

window.LandingPage = LandingPage;