// js/features/messages/ChatManager.js
import { apiClient } from '../../api/client.js';
import { toast } from '../../ui/feedback/Toast.js';
import { modalManager } from '../../ui/components/Modal.js';
import { formatDate, timeAgo } from '../../core/utils.js';

export const chatManager = {
    conversations: [],
    currentChat: null,
    messages: [],
    
    async loadConversations() {
        const user = window.store?.getState('user');
        const role = user?.role;
        
        try {
            let response;
            if (role === 'teacher') {
                response = await apiClient.get('/api/teacher/conversations');
            } else if (role === 'parent') {
                response = await apiClient.get('/api/parent/conversations');
            } else {
                return [];
            }
            
            this.conversations = response.data || [];
            return this.conversations;
        } catch (error) {
            console.error('Failed to load conversations:', error);
            return [];
        }
    },
    
    async loadMessages(otherUserId) {
        const user = window.store?.getState('user');
        const role = user?.role;
        
        try {
            let response;
            if (role === 'teacher') {
                response = await apiClient.get(`/api/teacher/messages/${otherUserId}`);
            } else if (role === 'parent') {
                response = await apiClient.get(`/api/parent/messages/${otherUserId}`);
            } else {
                return [];
            }
            
            this.messages = response.data || [];
            this.currentChat = otherUserId;
            return this.messages;
        } catch (error) {
            console.error('Failed to load messages:', error);
            return [];
        }
    },
    
    async sendMessage(receiverId, content) {
        if (!content) {
            toast.error('Please enter a message');
            return false;
        }
        
        const user = window.store?.getState('user');
        const role = user?.role;
        
        toast.loading(true);
        
        try {
            let response;
            if (role === 'teacher') {
                response = await apiClient.post('/api/teacher/reply', {
                    parentId: receiverId,
                    message: content
                });
            } else if (role === 'parent') {
                response = await apiClient.post('/api/parent/message', {
                    studentId: this.currentStudentId,
                    message: content,
                    recipientType: 'teacher'
                });
            } else {
                return false;
            }
            
            if (response.success) {
                // Add message locally
                this.messages.push({
                    id: Date.now(),
                    senderId: user.id,
                    receiverId: receiverId,
                    content: content,
                    createdAt: new Date().toISOString(),
                    Sender: { name: user.name }
                });
                
                toast.success('✅ Message sent');
                return true;
            }
        } catch (error) {
            toast.error(error.message || 'Failed to send message');
            return false;
        } finally {
            toast.loading(false);
        }
    },
    
    async markAsRead(otherUserId) {
        const user = window.store?.getState('user');
        const role = user?.role;
        
        if (role !== 'teacher') return;
        
        try {
            await apiClient.put(`/api/teacher/messages/read/${otherUserId}`);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    },
    
    renderChatModal(recipientId, recipientName, recipientRole = 'teacher') {
        this.loadMessages(recipientId).then(() => {
            const modal = modalManager.create('chat-modal', `Chat with ${recipientName}`);
            
            const messagesHtml = this.messages.map(msg => {
                const isSent = msg.senderId === window.store?.getState('user')?.id;
                return `
                    <div class="flex ${isSent ? 'justify-end' : 'justify-start'} mb-3">
                        <div class="${isSent ? 'chat-bubble-sent' : 'chat-bubble-received'} max-w-[70%]">
                            ${!isSent ? `<p class="text-sm font-medium mb-1">${msg.Sender?.name || recipientName}</p>` : ''}
                            <p class="text-sm">${msg.content}</p>
                            <p class="text-xs text-muted-foreground mt-1">${timeAgo(msg.createdAt)}</p>
                        </div>
                    </div>
                `;
            }).join('');
            
            modal.setContent(`
                <div class="flex flex-col h-[500px]">
                    <div class="flex-1 overflow-y-auto space-y-3 mb-4 p-2" id="chat-messages-container">
                        ${messagesHtml || '<p class="text-center text-muted-foreground py-8">No messages yet</p>'}
                    </div>
                    <div class="flex gap-2 pt-4 border-t">
                        <input type="text" id="chat-input" placeholder="Type your message..." 
                               class="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <button onclick="window.chatManager.sendMessageFromModal('${recipientId}')" 
                                class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                            <i data-lucide="send" class="h-4 w-4"></i>
                        </button>
                    </div>
                </div>
            `);
            modal.open();
            
            // Scroll to bottom
            setTimeout(() => {
                const container = document.getElementById('chat-messages-container');
                if (container) container.scrollTop = container.scrollHeight;
            }, 100);
            
            // Mark as read
            this.markAsRead(recipientId);
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    },
    
    async sendMessageFromModal(receiverId) {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        
        if (!message) return;
        
        const success = await this.sendMessage(receiverId, message);
        
        if (success) {
            input.value = '';
            
            // Add message to UI
            const container = document.getElementById('chat-messages-container');
            if (container) {
                const user = window.store?.getState('user');
                container.innerHTML += `
                    <div class="flex justify-end mb-3">
                        <div class="chat-bubble-sent max-w-[70%]">
                            <p class="text-sm font-medium">You</p>
                            <p class="text-sm">${escapeHtml(message)}</p>
                            <p class="text-xs text-muted-foreground mt-1">just now</p>
                        </div>
                    </div>
                `;
                container.scrollTop = container.scrollHeight;
            }
        }
    },
    
    renderConversationsList(containerId, onSelectCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.loadConversations().then(() => {
            if (!this.conversations || this.conversations.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center">
                        <i data-lucide="message-circle" class="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50"></i>
                        <p class="text-muted-foreground">No conversations yet</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="divide-y">
                    ${this.conversations.map(conv => `
                        <div class="p-4 hover:bg-accent/50 transition-colors cursor-pointer ${conv.unreadCount > 0 ? 'bg-primary/5' : ''}" 
                             onclick="window.chatManager.selectConversation('${conv.userId}', '${conv.userName}')">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <p class="font-medium">${conv.userName || 'User'}</p>
                                        ${conv.studentName ? `<p class="text-xs text-muted-foreground">about ${conv.studentName}</p>` : ''}
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
        });
    },
    
    selectConversation(userId, userName) {
        this.renderChatModal(userId, userName);
        if (typeof window.markConversationRead === 'function') {
            window.markConversationRead(userId);
        }
    }
};

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.chatManager = chatManager;