// Utility functions for the application

// Format timestamp to readable time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Format timestamp to readable date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file icon based on file type
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
        return 'fa-image';
    } else if (fileType.startsWith('video/')) {
        return 'fa-video';
    } else if (fileType.startsWith('audio/')) {
        return 'fa-music';
    } else if (fileType.includes('pdf')) {
        return 'fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
        return 'fa-file-word';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        return 'fa-file-excel';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        return 'fa-file-powerpoint';
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
        return 'fa-file-archive';
    } else if (fileType.includes('text')) {
        return 'fa-file-alt';
    } else {
        return 'fa-file';
    }
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Check if device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

// Get data from localStorage
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error getting from localStorage:', e);
        return null;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard', 'success');
        }).catch(err => {
            console.error('Error copying text: ', err);
            showNotification('Failed to copy text', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification('Copied to clipboard', 'success');
        } catch (err) {
            console.error('Error copying text: ', err);
            showNotification('Failed to copy text', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}