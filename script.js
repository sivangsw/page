// Contact form messages are emailed to Sivan through FormSubmit (no token or server needed)
const CONTACT_FORM_ENDPOINT = 'https://formsubmit.co/ajax/sivangsw@gmail.com';

function sendContactEmail(name, contact, message) {
    return fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            _subject: `פנייה חדשה מהאתר: ${name}`,
            _template: 'table',
            'שם': name,
            'טלפון או דוא"ל': contact,
            'הודעה': message,
            'דף': window.location.href
        })
    }).then(response => response.json());
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

        sendContactEmail(name, contact, message)
            .then((data) => {
                if (String(data.success) === 'true') {
                    statusEl.textContent = 'ההודעה נשלחה! מעביר אותך לעמוד ההצלחה...';
                    statusEl.style.color = '#B3FFD9';
                    setTimeout(() => {
                        window.location.href = 'thank-you.html';
                    }, 1500);
                } else {
                    statusEl.textContent = 'אירעה שגיאה בשליחה. נסו שוב תוך כמה דקות, או פנו בוואטסאפ.';
                    statusEl.style.color = '#FFD9B3';
                    console.warn('Contact form response error:', data);
                }
            })
            .catch((error) => {
                statusEl.textContent = 'שגיאת רשת. בדקו את החיבור ונסו שוב.';
                statusEl.style.color = '#FFD9B3';
                console.warn('Contact form fetch error:', error);
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
    initContactForm();
});
