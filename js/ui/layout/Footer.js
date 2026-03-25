// js/ui/layout/Footer.js
class FooterManager {
    constructor() {
        this.footer = document.querySelector('footer');
        if (this.footer) {
            this.render();
        }
    }
    
    render() {
        const year = new Date().getFullYear();
        
        this.footer.innerHTML = `
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
                            <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors">
                                <i data-lucide="twitter" class="h-4 w-4"></i>
                            </a>
                            <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors">
                                <i data-lucide="linkedin" class="h-4 w-4"></i>
                            </a>
                            <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors">
                                <i data-lucide="github" class="h-4 w-4"></i>
                            </a>
                            <a href="#" class="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors">
                                <i data-lucide="mail" class="h-4 w-4"></i>
                            </a>
                        </div>
                        <p class="text-sm text-muted-foreground mt-4">© ${year} ShuleAI. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Initialize footer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.footer = new FooterManager();
});