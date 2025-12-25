// Chat functionality

class ChatManager {
    constructor() {
        this.currentConversation = null;
        this.conversations = [];
        this.currentCategory = 'general';
        this.deepThinkMode = false;
        this.attachedFiles = [];
        
        this.init();
    }
    
    init() {
        // Load conversations from localStorage
        this.loadConversations();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load current conversation or create a new one
        this.loadOrCreateConversation();
    }
    
    setupEventListeners() {
        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send message
        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.createNewConversation();
        });
        
        // Category navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.getAttribute('data-category');
                this.switchCategory(category);
            });
        });
        
        // Library button
        document.getElementById('libraryBtn').addEventListener('click', () => {
            this.openLibrary();
        });
        
        // Close library button
        document.getElementById('closeLibraryBtn').addEventListener('click', () => {
            this.closeLibrary();
        });
        
        // Library search
        document.getElementById('librarySearch').addEventListener('input', (e) => {
            this.searchConversations(e.target.value);
        });
        
        // Notifications button
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.openNotifications();
        });
        
        // Close notifications button
        document.getElementById('closeNotificationsBtn').addEventListener('click', () => {
            this.closeNotifications();
        });
        
        // Attachment button
        document.getElementById('attachmentBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileAttachment(e.target.files);
        });
        
        // Dictation button
        document.getElementById('dictationBtn').addEventListener('click', () => {
            this.toggleDictation();
        });
        
        // Voice mode button
        document.getElementById('voiceModeBtn').addEventListener('click', () => {
            this.toggleVoiceMode();
        });
        
        // Deep think button
        document.getElementById('deepThinkBtn').addEventListener('click', () => {
            this.toggleDeepThinkMode();
        });
        
        // Deep think toggle
        document.getElementById('deepThinkToggle').addEventListener('click', () => {
            this.toggleDeepThinkMode();
        });
        
        // Menu toggle for mobile
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
        
        // Setup voice recognition
        if (voiceManager.isSupported()) {
            voiceManager.onResult = (result) => {
                const input = document.getElementById('chatInput');
                if (result.isFinal) {
                    input.value = result.transcript;
                    this.sendMessage();
                } else {
                    input.value = result.interimTranscript;
                }
            };
            
            voiceManager.onStart = () => {
                document.getElementById('dictationBtn').classList.add('active');
                this.showVoiceRecordingIndicator();
            };
            
            voiceManager.onEnd = () => {
                document.getElementById('dictationBtn').classList.remove('active');
                this.hideVoiceRecordingIndicator();
            };
            
            voiceManager.onError = (error) => {
                console.error('Voice recognition error:', error);
                showNotification('Voice recognition error: ' + error, 'error');
                document.getElementById('dictationBtn').classList.remove('active');
                this.hideVoiceRecordingIndicator();
            };
        }
    }
    
    loadConversations() {
        const savedConversations = getFromLocalStorage('conversations');
        if (savedConversations) {
            this.conversations = savedConversations;
        }
    }
    
    saveConversations() {
        saveToLocalStorage('conversations', this.conversations);
    }
    
    loadOrCreateConversation() {
        // Check if there's an active conversation in localStorage
        const activeConversationId = getFromLocalStorage('activeConversationId');
        
        if (activeConversationId) {
            this.currentConversation = this.conversations.find(c => c.id === activeConversationId);
        }
        
        if (!this.currentConversation) {
            this.createNewConversation();
        } else {
            this.renderConversation();
        }
    }
    
    createNewConversation() {
        const newConversation = {
            id: generateId(),
            title: 'New Conversation',
            category: this.currentCategory,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.conversations.unshift(newConversation);
        this.currentConversation = newConversation;
        
        saveToLocalStorage('activeConversationId', newConversation.id);
        this.saveConversations();
        this.renderConversation();
    }
    
    switchCategory(category) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-category="${category}"]`).classList.add('active');
        
        // Update current category
        this.currentCategory = category;
        
        // Update chat title
        const categoryTitles = {
            'general': 'General Knowledge',
            'academic': 'Academic Assistance',
            'finance': 'Financial Guidance',
            'travel': 'Travel Information',
            'sports': 'Sports & Recreation'
        };
        
        document.getElementById('currentCategory').textContent = categoryTitles[category] || 'General Knowledge';
        
        // Create new conversation for this category
        this.createNewConversation();
        
        // Close sidebar on mobile
        if (isMobile()) {
            document.getElementById('sidebar').classList.remove('active');
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const messageText = input.value.trim();
        
        if (!messageText && this.attachedFiles.length === 0) return;
        
        // Create user message
        const userMessage = {
            id: generateId(),
            role: 'user',
            content: messageText,
            files: [...this.attachedFiles],
            timestamp: Date.now()
        };
        
        // Add message to current conversation
        this.currentConversation.messages.push(userMessage);
        
        // Update conversation title if it's the first message
        if (this.currentConversation.messages.length === 1) {
            this.currentConversation.title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
        }
        
        // Update conversation timestamp
        this.currentConversation.updatedAt = Date.now();
        
        // Clear input and attachments
        input.value = '';
        this.clearAttachedFiles();
        
        // Save conversations
        this.saveConversations();
        
        // Render messages
        this.renderMessages();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send message to backend and get response
        this.sendToBackend(userMessage)
            .then(response => {
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Create assistant message
                const assistantMessage = {
                    id: generateId(),
                    role: 'assistant',
                    content: response.content,
                    timestamp: Date.now()
                };
                
                // Add message to current conversation
                this.currentConversation.messages.push(assistantMessage);
                
                // Update conversation timestamp
                this.currentConversation.updatedAt = Date.now();
                
                // Save conversations
                this.saveConversations();
                
                // Render messages
                this.renderMessages();
                
                // Speak response if voice mode is active
                if (document.getElementById('voiceModeBtn').classList.contains('active')) {
                    voiceManager.speak(response.content);
                }
            })
            .catch(error => {
                // Hide typing indicator
                this.hideTypingIndicator();
                
                console.error('Error sending message:', error);
                showNotification('Error sending message. Please try again.', 'error');
                
                // Create error message
                const errorMessage = {
                    id: generateId(),
                    role: 'assistant',
                    content: 'Sorry, I encountered an error while processing your request. Please try again.',
                    timestamp: Date.now(),
                    isError: true
                };
                
                // Add message to current conversation
                this.currentConversation.messages.push(errorMessage);
                
                // Update conversation timestamp
                this.currentConversation.updatedAt = Date.now();
                
                // Save conversations
                this.saveConversations();
                
                // Render messages
                this.renderMessages();
            });
    }
    
    async sendToBackend(message) {
        // Prepare request data
        const requestData = {
            conversationId: this.currentConversation.id,
            category: this.currentCategory,
            message: message.content,
            files: message.files,
            deepThinkMode: this.deepThinkMode
        };
        
        // Send request to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    }
    
    renderConversation() {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-category="${this.currentConversation.category}"]`).classList.add('active');
        
        // Update current category
        this.currentCategory = this.currentConversation.category;
        
        // Update chat title
        const categoryTitles = {
            'general': 'General Knowledge',
            'academic': 'Academic Assistance',
            'finance': 'Financial Guidance',
            'travel': 'Travel Information',
            'sports': 'Sports & Recreation'
        };
        
        document.getElementById('currentCategory').textContent = categoryTitles[this.currentCategory] || 'General Knowledge';
        
        // Render messages
        this.renderMessages();
        
        // Save active conversation ID
        saveToLocalStorage('activeConversationId', this.currentConversation.id);
    }
    
    renderMessages() {
        const chatContainer = document.getElementById('chatContainer');
        
        // Clear container
        chatContainer.innerHTML = '';
        
        // If no messages, show welcome message
        if (this.currentConversation.messages.length === 0) {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'welcome-message';
            welcomeMessage.innerHTML = `
                <img src="assets/images/logo.png" alt="AI Assistant" class="welcome-logo">
                <h3>Welcome to AI Knowledge Assistant</h3>
                <p>How can I help you today? You can ask me questions, upload files, or use voice input.</p>
            `;
            chatContainer.appendChild(welcomeMessage);
            return;
        }
        
        // Show deep think indicator if enabled
        if (this.deepThinkMode) {
            const deepThinkIndicator = document.createElement('div');
            deepThinkIndicator.className = 'deep-think-indicator active';
            deepThinkIndicator.innerHTML = `
                <i class="fas fa-brain deep-think-icon"></i>
                <span class="deep-think-text">Deep Think Mode Enabled</span>
            `;
            chatContainer.appendChild(deepThinkIndicator);
        }
        
        // Render messages
        this.currentConversation.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    createMessageElement(message) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message ${message.role}`;
        
        // Create avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (message.role === 'user') {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
        }
        
        // Create content
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Add files if any
        if (message.files && message.files.length > 0) {
            const filesContainer = document.createElement('div');
            filesContainer.className = 'message-files';
            
            message.files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-attachment';
                fileElement.innerHTML = `
                    <div class="file-icon">
                        <i class="fas ${getFileIcon(file.type)}"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                `;
                filesContainer.appendChild(fileElement);
            });
            
            content.appendChild(filesContainer);
        }
        
        // Add text content
        const textElement = document.createElement('div');
        textElement.textContent = message.content;
        content.appendChild(textElement);
        
        // Add timestamp
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = formatTime(message.timestamp);
        
        // Assemble message
        messageContainer.appendChild(avatar);
        messageContainer.appendChild(content);
        messageContainer.appendChild(timeElement);
        
        return messageContainer;
    }
    
    showTypingIndicator() {
        const chatContainer = document.getElementById('chatContainer');
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        chatContainer.appendChild(typingIndicator);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    showVoiceRecordingIndicator() {
        const chatContainer = document.getElementById('chatContainer');
        
        const voiceRecording = document.createElement('div');
        voiceRecording.className = 'voice-recording active';
        voiceRecording.id = 'voiceRecording';
        voiceRecording.innerHTML = `
            <div class="recording-icon">
                <i class="fas fa-microphone"></i>
            </div>
            <div class="recording-text">Listening...</div>
            <div class="recording-time">00:00</div>
        `;
        
        chatContainer.appendChild(voiceRecording);
        
        // Start timer
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            document.querySelector('.recording-time').textContent = `${minutes}:${secs}`;
        }, 1000);
        
        // Store interval ID to clear later
        voiceRecording.dataset.timerId = timerInterval;
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    hideVoiceRecordingIndicator() {
        const voiceRecording = document.getElementById('voiceRecording');
        if (voiceRecording) {
            // Clear timer
            if (voiceRecording.dataset.timerId) {
                clearInterval(voiceRecording.dataset.timerId);
            }
            
            voiceRecording.remove();
        }
    }
    
    toggleDictation() {
        if (!voiceManager.isSupported()) {
            showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }
        
        if (voiceManager.isListening) {
            voiceManager.stopListening();
        } else {
            voiceManager.startListening();
        }
    }
    
    toggleVoiceMode() {
        const voiceModeBtn = document.getElementById('voiceModeBtn');
        voiceModeBtn.classList.toggle('active');
        
        if (voiceModeBtn.classList.contains('active')) {
            showNotification('Voice mode enabled. Responses will be spoken aloud.', 'success');
        } else {
            voiceManager.stopSpeaking();
            showNotification('Voice mode disabled.', 'info');
        }
    }
    
    toggleDeepThinkMode() {
        this.deepThinkMode = !this.deepThinkMode;
        
        const deepThinkBtn = document.getElementById('deepThinkBtn');
        const deepThinkToggle = document.getElementById('deepThinkToggle');
        
        if (this.deepThinkMode) {
            deepThinkBtn.classList.add('active');
            deepThinkToggle.classList.add('active');
            showNotification('Deep Think mode enabled. Responses will be more thoughtful and comprehensive.', 'success');
        } else {
            deepThinkBtn.classList.remove('active');
            deepThinkToggle.classList.remove('active');
            showNotification('Deep Think mode disabled.', 'info');
        }
        
        // Re-render messages to show/hide deep think indicator
        this.renderMessages();
    }
    
    handleFileAttachment(files) {
        if (!files || files.length === 0) return;
        
        const chatInputContainer = document.querySelector('.chat-input-container');
        
        // Check if files container already exists
        let filesContainer = document.querySelector('.attached-files-container');
        if (!filesContainer) {
            filesContainer = document.createElement('div');
            filesContainer.className = 'attached-files-container';
            chatInputContainer.insertBefore(filesContainer, chatInputContainer.firstChild);
        }
        
        // Process each file
        Array.from(files).forEach(file => {
            // Add to attached files array
            this.attachedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                data: null // Will be populated when actually sending
            });
            
            // Create file preview element
            const fileElement = document.createElement('div');
            fileElement.className = 'file-attachment';
            fileElement.dataset.fileName = file.name;
            fileElement.innerHTML = `
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <button class="file-remove">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add remove event listener
            fileElement.querySelector('.file-remove').addEventListener('click', () => {
                this.removeAttachedFile(file.name);
                fileElement.remove();
                
                // Remove files container if no files left
                if (filesContainer.children.length === 0) {
                    filesContainer.remove();
                }
            });
            
            filesContainer.appendChild(fileElement);
        });
        
        // Reset file input
        document.getElementById('fileInput').value = '';
    }
    
    removeAttachedFile(fileName) {
        this.attachedFiles = this.attachedFiles.filter(file => file.name !== fileName);
    }
    
    clearAttachedFiles() {
        this.attachedFiles = [];
        
        const filesContainer = document.querySelector('.attached-files-container');
        if (filesContainer) {
            filesContainer.remove();
        }
    }
    
    openLibrary() {
        const libraryModal = document.getElementById('libraryModal');
        libraryModal.classList.add('active');
        
        this.renderConversationList();
    }
    
    closeLibrary() {
        const libraryModal = document.getElementById('libraryModal');
        libraryModal.classList.remove('active');
    }
    
    renderConversationList() {
        const conversationList = document.getElementById('conversationList');
        conversationList.innerHTML = '';
        
        if (this.conversations.length === 0) {
            conversationList.innerHTML = '<p class="empty-state">No conversations yet.</p>';
            return;
        }
        
        // Sort conversations by updated date (most recent first)
        const sortedConversations = [...this.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
        
        sortedConversations.forEach(conversation => {
            const conversationElement = document.createElement('div');
            conversationElement.className = 'conversation-item';
            if (conversation.id === this.currentConversation.id) {
                conversationElement.classList.add('active');
            }
            
            // Get preview of last message
            let preview = 'No messages';
            if (conversation.messages.length > 0) {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                preview = lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '');
            }
            
            conversationElement.innerHTML = `
                <div class="conversation-title">${conversation.title}</div>
                <div class="conversation-preview">${preview}</div>
                <div class="conversation-date">${formatDate(conversation.updatedAt)}</div>
            `;
            
            // Add click event
            conversationElement.addEventListener('click', () => {
                this.currentConversation = conversation;
                this.renderConversation();
                this.closeLibrary();
            });
            
            conversationList.appendChild(conversationElement);
        });
    }
    
    searchConversations(query) {
        if (!query) {
            this.renderConversationList();
            return;
        }
        
        const conversationList = document.getElementById('conversationList');
        conversationList.innerHTML = '';
        
        // Filter conversations based on query
        const filteredConversations = this.conversations.filter(conversation => {
            return conversation.title.toLowerCase().includes(query.toLowerCase()) ||
                   conversation.messages.some(message => 
                       message.content.toLowerCase().includes(query.toLowerCase())
                   );
        });
        
        if (filteredConversations.length === 0) {
            conversationList.innerHTML = '<p class="empty-state">No conversations found.</p>';
            return;
        }
        
        // Sort filtered conversations by updated date (most recent first)
        const sortedConversations = [...filteredConversations].sort((a, b) => b.updatedAt - a.updatedAt);
        
        sortedConversations.forEach(conversation => {
            const conversationElement = document.createElement('div');
            conversationElement.className = 'conversation-item';
            if (conversation.id === this.currentConversation.id) {
                conversationElement.classList.add('active');
            }
            
            // Get preview of last message
            let preview = 'No messages';
            if (conversation.messages.length > 0) {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                preview = lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '');
            }
            
            conversationElement.innerHTML = `
                <div class="conversation-title">${conversation.title}</div>
                <div class="conversation-preview">${preview}</div>
                <div class="conversation-date">${formatDate(conversation.updatedAt)}</div>
            `;
            
            // Add click event
            conversationElement.addEventListener('click', () => {
                this.currentConversation = conversation;
                this.renderConversation();
                this.closeLibrary();
            });
            
            conversationList.appendChild(conversationElement);
        });
    }
    
    openNotifications() {
        const notificationsModal = document.getElementById('notificationsModal');
        notificationsModal.classList.add('active');
        
        this.renderNotifications();
    }
    
    closeNotifications() {
        const notificationsModal = document.getElementById('notificationsModal');
        notificationsModal.classList.remove('active');
    }
    
    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';
        
        // Sample notifications (in a real app, these would come from the backend)
        const notifications = [
            {
                id: 1,
                title: 'New feature available',
                message: 'Try our new Deep Think mode for more thoughtful responses.',
                time: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
                read: false
            },
            {
                id: 2,
                title: 'Conversation limit reached',
                message: 'You have reached your free conversation limit for this month.',
                time: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
                read: false
            },
            {
                id: 3,
                title: 'System maintenance',
                message: 'We will be performing maintenance on our servers this weekend.',
                time: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
                read: true
            }
        ];
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<p class="empty-state">No notifications.</p>';
            return;
        }
        
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-item';
            if (!notification.read) {
                notificationElement.classList.add('unread');
            }
            
            notificationElement.innerHTML = `
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${formatDate(notification.time)}</div>
            `;
            
            notificationsList.appendChild(notificationElement);
        });
        
        // Update notification badge
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Initialize chat manager
const chatManager = new ChatManager();