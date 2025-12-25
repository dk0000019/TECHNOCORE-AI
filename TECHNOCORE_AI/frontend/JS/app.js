// Main application initialization

document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips if needed
    if (typeof tippy !== 'undefined') {
        tippy('[title]', {
            content(reference) {
                const title = reference.getAttribute('title');
                reference.removeAttribute('title');
                return title;
            },
            placement: 'bottom',
            animation: 'shift-away',
            theme: 'light'
        });
    }
    
    // Initialize service worker for PWA capabilities
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
    
    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
    
    // Listen for dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        showNotification('You are back online', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('You are offline. Some features may not be available.', 'error');
    });
    
    // Initialize notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateY(-100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification.success {
            background-color: #4caf50;
        }
        
        .notification.error {
            background-color: #f44336;
        }
        
        .notification.info {
            background-color: #2196f3;
        }
        
        .notification.warning {
            background-color: #ff9800;
        }
        
        .empty-state {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
        }
        
        .attached-files-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .dark-mode {
            --background-color: #1a1d29;
            --text-color: #fff;
            --sidebar-bg: #121420;
            --card-bg: #252836;
            --input-bg: #2d2f3d;
            --border-color: #3a3d4e;
        }
        
        .dark-mode body {
            background-color: var(--background-color);
            color: var(--text-color);
        }
        
        .dark-mode .main-content {
            background-color: var(--background-color);
        }
        
        .dark-mode .chat-header {
            background-color: var(--card-bg);
            border-color: var(--border-color);
        }
        
        .dark-mode .chat-container {
            background-color: var(--background-color);
        }
        
        .dark-mode .message.assistant .message-content {
            background-color: var(--card-bg);
            color: var(--text-color);
        }
        
        .dark-mode .chat-input-container {
            background-color: var(--card-bg);
            border-color: var(--border-color);
        }
        
        .dark-mode .input-wrapper {
            background-color: var(--input-bg);
        }
        
        .dark-mode .chat-input {
            color: var(--text-color);
        }
        
        .dark-mode .modal-content {
            background-color: var(--card-bg);
            color: var(--text-color);
        }
        
        .dark-mode .modal-header {
            border-color: var(--border-color);
        }
        
        .dark-mode .library-search input {
            background-color: var(--input-bg);
            border-color: var(--border-color);
            color: var(--text-color);
        }
        
        .dark-mode .conversation-item {
            border-color: var(--border-color);
        }
        
        .dark-mode .notification-item {
            background-color: var(--input-bg);
        }
    `;
    document.head.appendChild(style);
    
    // Check if user is on a mobile device
    if (isMobile()) {
        document.body.classList.add('mobile-device');
    }
    
    // Add loading animation
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    
    const loadingStyles = document.createElement('style');
    loadingStyles.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .loading-spinner {
            text-align: center;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(67, 97, 238, 0.2);
            border-top: 4px solid #4361ee;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .dark-mode .loading-overlay {
            background-color: rgba(26, 29, 41, 0.9);
        }
        
        .dark-mode .loading-spinner p {
            color: #fff;
        }
    `;
    document.head.appendChild(loadingStyles);
    
    // Show loading overlay initially
    document.body.appendChild(loadingOverlay);
    
    // Remove loading overlay when everything is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }, 500);
    });
});