// Voice recognition and synthesis functionality

class VoiceManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.onResult = null;
        this.onStart = null;
        this.onEnd = null;
        this.onError = null;
        
        this.initRecognition();
    }
    
    initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStart) this.onStart();
        };
        
        this.recognition.onresult = (event) => {
            let transcript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    transcript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }
            
            if (this.onResult) {
                this.onResult({
                    transcript,
                    interimTranscript,
                    isFinal: transcript !== ''
                });
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            if (this.onError) this.onError(event.error);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEnd) this.onEnd();
        };
    }
    
    startListening() {
        if (!this.recognition) {
            showNotification('Speech recognition not supported in this browser', 'error');
            return false;
        }
        
        if (this.isListening) {
            this.stopListening();
            return false;
        }
        
        try {
            this.recognition.start();
            return true;
        } catch (e) {
            console.error('Error starting speech recognition:', e);
            return false;
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported in this browser');
            return false;
        }
        
        // Cancel any ongoing speech
        this.stopSpeaking();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set options
        if (options.lang) utterance.lang = options.lang;
        if (options.pitch) utterance.pitch = options.pitch;
        if (options.rate) utterance.rate = options.rate;
        if (options.volume) utterance.volume = options.volume;
        
        // Get voices
        if (options.voice) {
            const voices = this.synthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.name === options.voice);
            if (selectedVoice) utterance.voice = selectedVoice;
        }
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            if (options.onStart) options.onStart();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            if (options.onEnd) options.onEnd();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            if (options.onError) options.onError(event);
        };
        
        this.synthesis.speak(utterance);
        return true;
    }
    
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }
    
    getVoices() {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }
    
    isSupported() {
        return !!(this.recognition || this.synthesis);
    }
}

// Initialize voice manager
const voiceManager = new VoiceManager();