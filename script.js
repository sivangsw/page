// Telegram credentials (hardcoded)
const TELEGRAM_TOKEN = '2070956586:AAH78qAvi0PV0O90_KHIzCtBrvP_CHw5KUk';
const TELEGRAM_CHAT_ID = '740647763';
const TELEGRAM_FIRST_LOAD_SENT_KEY = 'telegram_first_load_sent';

function getDeviceName() {
    const parts = [];
    if (navigator.userAgentData && navigator.userAgentData.brands) {
        parts.push(navigator.userAgentData.brands.map(b => `${b.brand} ${b.version}`).join(', '));
    }
    if (navigator.userAgent) parts.push(navigator.userAgent);
    if (navigator.platform) parts.push(`platform: ${navigator.platform}`);
    if (navigator.vendor) parts.push(`vendor: ${navigator.vendor}`);
    if ('deviceMemory' in navigator) parts.push(`memory: ${navigator.deviceMemory}GB`);
    if ('hardwareConcurrency' in navigator) parts.push(`cores: ${navigator.hardwareConcurrency}`);
    if (navigator.language) parts.push(`language: ${navigator.language}`);
    return parts.filter(Boolean).join(' | ');
}

function getAdditionalDeviceInfo(callback) {
    const info = [];

    // Screen size
    if (screen) {
        info.push(`Screen: ${screen.width}x${screen.height}`);
    }

    // Timezone
    try {
        info.push(`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    } catch (e) {
        // Ignore timezone errors
    }

    // Cookies enabled
    info.push(`Cookies: ${navigator.cookieEnabled ? 'enabled' : 'disabled'}`);

    // LocalStorage available
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        info.push('LocalStorage: available');
    } catch (e) {
        info.push('LocalStorage: disabled');
    }

    // Referrer
    if (document.referrer) {
        info.push(`Referrer: ${document.referrer}`);
    }

    // Connection type (if available)
    if ('connection' in navigator) {
        const conn = navigator.connection;
        if (conn.effectiveType) info.push(`Connection: ${conn.effectiveType}`);
        if (conn.downlink) info.push(`Speed: ${conn.downlink}Mbps`);
    }

    // Battery status (if available) - async
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            info.push(`Battery: ${Math.round(battery.level * 100)}% ${battery.charging ? '(charging)' : ''}`);
            callback(info.filter(Boolean).join(' | '));
        }).catch(() => {
            callback(info.filter(Boolean).join(' | '));
        });
    } else {
        callback(info.filter(Boolean).join(' | '));
    }
}

function getPageContactInfo() {
    const phones = new Set();
    const emails = new Set();
    document.querySelectorAll('a[href]').forEach((link) => {
        const href = (link.getAttribute('href') || '').trim();
        if (!href) return;
        const lowerHref = href.toLowerCase();
        if (lowerHref.startsWith('tel:')) {
            phones.add(href.slice(4));
        } else if (lowerHref.startsWith('mailto:')) {
            emails.add(href.slice(7));
        }
    });
    const values = [];
    if (phones.size) values.push(`Phone: ${Array.from(phones).join(', ')}`);
    if (emails.size) values.push(`Email: ${Array.from(emails).join(', ')}`);
    return values.join(' | ');
}

function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
    fetch(url, { method: 'GET' })
        .then(response => {
            if (response.ok) {
                console.log('Telegram message sent successfully');
            } else {
                console.warn('Failed to send Telegram message:', response.statusText);
            }
        })
        .catch(error => {
            console.warn('Error sending Telegram message:', error);
        });
}

function sendTelegramDeviceInfoIfFirstVisit() {
    try {
        if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
        if (localStorage.getItem(TELEGRAM_FIRST_LOAD_SENT_KEY)) return;

        const deviceInfo = getDeviceName();
        const contactInfo = getPageContactInfo();
        const timestamp = new Date().toISOString();

        getAdditionalDeviceInfo((additionalInfo) => {
            let message = `First page load detected.\nTime: ${timestamp}\nDevice info: ${deviceInfo}`;
            if (additionalInfo) {
                message += `\nAdditional: ${additionalInfo}`;
            }
            if (contactInfo) {
                message += `\n${contactInfo}`;
            }
            sendTelegramMessage(message);
        });

        localStorage.setItem(TELEGRAM_FIRST_LOAD_SENT_KEY, '1');
    } catch (e) {
        console.warn('Unable to store first-load flag', e);
    }
}

function sendTelegramButtonClick(buttonText) {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
    const message = `Button clicked: ${buttonText || 'unknown'}`;
    sendTelegramMessage(message);
}

function attachTelegramButtonListeners() {
    document.querySelectorAll('a.contact-btn').forEach((link) => {
        link.addEventListener('click', () => {
            const text = link.textContent ? link.textContent.trim() : link.innerText.trim();
            sendTelegramButtonClick(text);
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('contact-status');
    if (!form || !statusEl) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('contact-name').value.trim();
        const contact = document.getElementById('contact-phone').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !contact || !message) {
            statusEl.textContent = 'אנא מלא/י את כל השדות כדי לשלוח.';
            statusEl.style.color = '#FFD9B3';
            return;
        }

        statusEl.textContent = 'שולח...';
        statusEl.style.color = 'white';

        const telegramMessage = `בקשת יצירת קשר חדשה:
שם: ${name}
טלפון/דוא"ל: ${contact}
הודעה: ${message}
דף: ${window.location.href}`;
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(telegramMessage)}`;

        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then((data) => {
                if (data.ok) {
                    statusEl.textContent = 'ההודעה נשלחה! נחזור אליכם בקרוב.';
                    statusEl.style.color = '#B3FFD9';
                    form.reset();
                } else {
                    statusEl.textContent = 'אירעה שגיאה בשליחה. נסו שוב תוך כמה דקות.';
                    statusEl.style.color = '#FFD9B3';
                    console.warn('Telegram response error:', data);
                }
            })
            .catch((error) => {
                statusEl.textContent = 'שגיאת רשת. בדקו את החיבור ונסו שוב.';
                statusEl.style.color = '#FFD9B3';
                console.warn('Telegram fetch error:', error);
            });
    });
}

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navUl = document.querySelector('nav ul');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navUl.classList.toggle('active');
});

// Close menu when a link is clicked
navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navUl.classList.remove('active');
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in, .slide-up, .scale-up').forEach(el => {
        observer.observe(el);
    });
    sendTelegramDeviceInfoIfFirstVisit();
    attachTelegramButtonListeners();
    initContactForm();
});
