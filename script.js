// The contact form posts straight to Web3Forms, which emails Sivan and redirects to thank-you.html
function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('contact-status');
    if (!form || !statusEl) return;

    form.addEventListener('submit', () => {
        statusEl.textContent = 'שולח...';
        statusEl.style.color = 'white';
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
