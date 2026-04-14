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
        let message = `First page load detected.\nDevice info: ${deviceInfo}`;
        if (contactInfo) {
            message += `\n${contactInfo}`;
        }
        sendTelegramMessage(message);
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
});
