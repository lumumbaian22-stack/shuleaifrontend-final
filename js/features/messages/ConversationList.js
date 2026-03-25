// js/features/messages/ConversationList.js
import { chatManager } from './ChatManager.js';
import { formatDate, timeAgo } from '../../core/utils.js';

export const conversationList = {
    render(containerId, conversations, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!conversations || conversations.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center">
                    <i data-lucide="message-circle" class="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50"></i>
                    <p class="text-muted-foreground">No messages yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="divide-y">
                ${conversations.map(conv => `
                    <div class="p-4 hover:bg-accent/50 transition-colors cursor-pointer ${conv.unreadCount > 0 ? 'bg-primary/5' : ''}" 
                         onclick="window.conversationList.select('${conv.userId}', '${conv.userName}', ${!!onSelect})">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <p class="font-medium">${conv.userName || 'User'}</p>
                                    <p class="text-xs text-muted-foreground">${conv.userRole === 'teacher' ? 'Teacher' : 'Parent'}</p>
                                    ${conv.studentName ? `<p class="text-xs text-muted-foreground">• ${conv.studentName}</p>` : ''}
                                </div>
                                <p class="text-sm text-muted-foreground mt-1 truncate">${conv.lastMessage || ''}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-muted-foreground">${timeAgo(conv.lastMessageTime)}</p>
                                ${conv.unreadCount > 0 ? 
                                    `<span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">${conv.unreadCount}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },
    
    select(userId, userName, hasCallback) {
        if (hasCallback && typeof window.conversationSelectCallback === 'function') {
            window.conversationSelectCallback(userId, userName);
        } else {
            chatManager.renderChatModal(userId, userName);
        }
    }
};

window.conversationList = conversationList;