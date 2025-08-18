// BrightAI - Enhanced JavaScript for Performance & User Experience & Saudi SEO
// Version: 2.2.0 - Optimized for Saudi Search Engines
// Last updated: January 2025
'use strict';

// Saudi SEO Enhancements
const saudiSEOConfig = {
    keywords: [
        'شركة مُشرقة AI السعودية',
        'الذكاء الاصطناعي الرياض',
        'شركة ذكاء اصطناعي سعودية',
        'AI السعودية',
        'رؤية 2030 الذكاء الاصطناعي',
        'التحول الرقمي السعودي'
    ],
    cities: ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة', 'المدينة المنورة'],
    services: [
        'حلول الذكاء الاصطناعي',
        'تطوير تطبيقات AI',
        'شات بوت عربي',
        'أتمتة العمليات',
        'تحليل البيانات'
    ]
};

/**
 * Debounces a function, delaying its execution until after a specified wait time
 * has elapsed since the last time it was invoked.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The wait time in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, wait) => {
    let timeoutId;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), wait);
    };
};

/**
 * Throttles a function, ensuring it's called at most once within a specified limit.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The throttle limit in milliseconds.
 * @returns {Function} The throttled function.
 */
const throttle = (func, limit) => {
    let inThrottle = false;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Shows an update notification to the user.
 */
function showUpdateNotification() {
    if (document.querySelector('.update-notification')) return; // Prevent multiple notifications

    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
        <div class="update-content">
            <span>تحديث جديد متاح للموقع! نوصي بالتحديث للاستمتاع بأحدث الميزات والتحسينات.</span>
            <button id="update-now-btn" class="update-btn">تحديث الآن</button>
            <button id="dismiss-update-btn" class="dismiss-btn" aria-label="إغلاق إشعار التحديث">×</button>
        </div>
    `;
    document.body.appendChild(notification);

    const updateBtn = document.getElementById('update-now-btn');
    const dismissBtn = document.getElementById('dismiss-update-btn');

    updateBtn?.addEventListener('click', () => {
        notification.remove(); // Remove notification before reload
        window.location.reload();
    });
    dismissBtn?.addEventListener('click', () => notification.remove());

    setTimeout(() => notification.remove(), 15000); // Auto-hide after 15 seconds
}

/**
 * Initializes the Service Worker.
 */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js') // Ensure this path is correct
                .then(registration => {
                    console.log('[SW] Service Worker registered successfully:', registration.scope);
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker?.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => console.error('[SW] Service Worker registration failed:', error));
        });
    } else {
        console.log('[SW] Service Workers not supported by this browser.');
    }
}

/**
 * Initializes the navigation bar functionality.
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links'); // Assuming ul#nav-links-list
    const overlay = document.querySelector('.overlay');

    if (!navbar || !hamburger || !navLinks || !overlay) {
        console.warn('[Navbar] One or more essential navbar elements are missing. Functionality might be impaired.');
        return;
    }

    const toggleMenu = (open) => {
        navLinks.classList.toggle('active', open);
        hamburger.classList.toggle('active', open);
        overlay.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', String(open));
        navLinks.setAttribute('aria-hidden', String(!open));
        // Focus management: when opening, focus first link; when closing, focus hamburger
        if (open) {
            const firstLink = navLinks.querySelector('a[role="menuitem"]');
            firstLink?.focus();
        } else {
            hamburger.focus();
        }
    };

    hamburger.addEventListener('click', () => toggleMenu(!navLinks.classList.contains('active')));
    overlay.addEventListener('click', () => toggleMenu(false));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    navLinks.querySelectorAll('a[role="menuitem"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // If the link is for the current page and menu is open, close menu
            if (navLinks.classList.contains('active')) {
                 // Check if it's an internal anchor link or points to the current page
                const href = link.getAttribute('href');
                if (href && (href.startsWith('#') || href === window.location.pathname || href === 'index.html' + window.location.hash)) {
                    // For anchor links, smooth scrolling is handled by initSmoothScroll,
                    // so we just need to close the menu.
                    // For same-page links (not anchors), the browser handles navigation.
                    toggleMenu(false);
                }
                // If it's a link to another page, browser will navigate, menu closing not strictly needed here
                // but can be added if desired.
            }
            if (typeof gtag === 'function') {
                gtag('event', 'navigation_click', {
                    'event_category': 'Navigation',
                    'event_label': link.getAttribute('href') || 'Unknown Link',
                    'value': 1 // Example value
                });
            }
        });
    });

    // Navbar scroll behavior
    let lastScrollTop = 0;
    const scrollThreshold = 50; // Pixels to scroll before reacting
    const navbarHeight = navbar.offsetHeight;

    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        navbar.classList.toggle('scrolled', scrollTop > scrollThreshold);

        if (Math.abs(scrollTop - lastScrollTop) <= scrollThreshold && scrollTop > navbarHeight) {
            // If scrolling slowly or within threshold and not at top, do nothing
            return;
        }

        if (scrollTop > lastScrollTop && scrollTop > navbarHeight && !navLinks.classList.contains('active')) {
            // Scroll Down (and not at top, and menu not open)
            navbar.classList.add('hidden'); // Uses CSS transform: translateY(-100%)
        } else {
            // Scroll Up or at top or menu is open
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
    handleScroll(); // Initial check
}


/**
 * Initializes the hero canvas animation.
 */
function initHeroCanvas() {
    const heroCanvas = document.getElementById('heroCanvas');
    if (!heroCanvas) {
        console.warn('[HeroCanvas] Canvas element #heroCanvas not found.');
        return;
    }

    const ctx = heroCanvas.getContext('2d');
    if (!ctx) {
        console.error('[HeroCanvas] Failed to get 2D context for #heroCanvas.');
        return;
    }

    let particlesArray = [];
    let animationFrameId = null;
    let isVisible = true; // Assume visible initially until observer confirms

    const DPR = window.devicePixelRatio || 1;

    const setCanvasSize = () => {
        const heroSection = heroCanvas.closest('.hero');
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        heroCanvas.width = rect.width * DPR;
        heroCanvas.height = rect.height * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // Apply scaling for Retina displays
        heroCanvas.style.width = `${rect.width}px`;
        heroCanvas.style.height = `${rect.height}px`;
    };

    class Particle {
        constructor(x, y, dirX, dirY, size, color) {
            this.x = x;
            this.y = y;
            this.dirX = dirX;
            this.dirY = dirY;
            this.size = size;
            this.baseColor = color.slice(0, color.lastIndexOf(',')) + ','; // "rgba(r,g,b,"
            this.opacity = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
            this.opacityDir = (Math.random() > 0.5 ? 1 : -1) * 0.003; // Slower fade
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.baseColor + `${this.opacity.toFixed(3)})`;
            ctx.fill();
        }

        update(canvasWidth, canvasHeight) {
            if (this.x + this.size > canvasWidth || this.x - this.size < 0) this.dirX *= -1;
            if (this.y + this.size > canvasHeight || this.y - this.size < 0) this.dirY *= -1;

            this.x += this.dirX;
            this.y += this.dirY;

            this.opacity += this.opacityDir;
            if (this.opacity <= 0.1 || this.opacity >= 0.4) {
                this.opacityDir *= -1;
                this.opacity = Math.max(0.1, Math.min(0.4, this.opacity)); // Clamp
            }
            this.draw();
        }
    }

    const initParticles = () => {
        particlesArray = [];
        const canvasWidth = heroCanvas.width / DPR;
        const canvasHeight = heroCanvas.height / DPR;
        const area = canvasWidth * canvasHeight;
        let numParticles = Math.floor(area / 18000); // Adjusted density for performance
        numParticles = window.innerWidth < 768 ? Math.max(10, Math.floor(numParticles * 0.5)) : Math.max(20, Math.min(60, numParticles));

        for (let i = 0; i < numParticles; i++) {
            const size = Math.random() * 1.2 + 0.3; // Smaller, subtle particles
            const x = Math.random() * (canvasWidth - size * 2) + size;
            const y = Math.random() * (canvasHeight - size * 2) + size;
            const dirX = (Math.random() - 0.5) * 0.25; // Slower, more varied movement
            const dirY = (Math.random() - 0.5) * 0.25;
            const color = 'rgba(100, 255, 218, 0.2)'; // Base color, opacity handled by particle
            particlesArray.push(new Particle(x, y, dirX, dirY, size, color));
        }
    };

    const animate = () => {
        if (!isVisible || !ctx) return;
        animationFrameId = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height); // Clear considering DPR

        const canvasWidth = heroCanvas.width / DPR;
        const canvasHeight = heroCanvas.height / DPR;
        particlesArray.forEach(particle => particle.update(canvasWidth, canvasHeight));
    };

    const setupCanvas = () => {
        if (!ctx) return;
        setCanvasSize();
        initParticles();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (isVisible) animate();
    };

    // Intersection Observer to pause animation when not visible
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            isVisible = entries[0].isIntersecting;
            if (isVisible) {
                if (!animationFrameId) setupCanvas(); // Re-setup if became visible
            } else if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }, { threshold: 0.01 }); // Trigger when 1% is visible
        observer.observe(heroCanvas);
    } else {
        // Fallback for browsers without IntersectionObserver
        setupCanvas();
    }
    // Initial setup, observer will refine
    setTimeout(setupCanvas, 100); // Slight delay for layout stability

    window.addEventListener('resize', debounce(setupCanvas, 200));
}

/**
 * Initializes the FAQ accordion functionality.
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!question || !answer) {
            console.warn('[FAQ] FAQ item is missing a .faq-question or .faq-answer element.');
            return;
        }

        // Ensure answer has an ID for aria-controls and question has it
        if (!answer.id) answer.id = `faq-answer-${Math.random().toString(36).substring(2, 11)}`;
        question.setAttribute('aria-controls', answer.id);

        question.addEventListener('click', () => {
            const isCurrentlyActive = item.classList.contains('active');

            // Close all other open FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                    // CSS handles max-height removal for .faq-answer when .active is removed from .faq-item
                }
            });

            // Toggle the clicked item
            item.classList.toggle('active', !isCurrentlyActive);
            question.setAttribute('aria-expanded', String(!isCurrentlyActive));
            
            if (!isCurrentlyActive && typeof gtag === 'function') {
                gtag('event', 'faq_interaction', {
                    'event_category': 'FAQ',
                    'event_label': question.textContent?.trim() || 'FAQ Question Opened',
                    'value': 1
                });
            }
        });
    });
}

/**
 * Initializes form validation and submission logic.
 */
function initForms() {
    const fieldValidators = {
        name: (value) => String(value).trim().length >= 2,
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase()),
        phone: (value) => /^(05\d{8}|5\d{8}|\+9665\d{8}|009665\d{8})$/.test(String(value).replace(/[\s-]/g, '')),
        'consultation-time': (value) => String(value).trim() !== '',
        message: (value) => String(value).trim().length >= 10,
    };

    const errorMessages = {
        name: 'الاسم الكامل مطلوب (حد أدنى حرفان).',
        email: 'الرجاء إدخال بريد إلكتروني صحيح.',
        phone: 'الرجاء إدخال رقم هاتف سعودي صحيح (مثال: 05xxxxxxxx).',
        'consultation-time': 'الرجاء اختيار وقت مفضل للاستشارة.',
        message: 'الرسالة مطلوبة (حد أدنى 10 أحرف).',
        generic: 'هذا الحقل مطلوب.'
    };

    function displayFieldError(inputElement, message) {
        const errorContainerId = inputElement.getAttribute('aria-describedby');
        let errorContainer = errorContainerId ? document.getElementById(errorContainerId) : null;

        if (!errorContainer) {
            // Create if doesn't exist (as per HTML structure which already has them)
            // This part can be a fallback if HTML structure is inconsistent
            console.warn(`Error container for ${inputElement.id} not found via aria-describedby.`);
            // Fallback: try to find a sibling with .error-message
            errorContainer = inputElement.parentNode.querySelector(`.error-message[data-for="${inputElement.id}"]`);
            if(!errorContainer) { // If still not found, create one (though HTML has it)
                errorContainer = document.createElement('div');
                errorContainer.className = 'error-message';
                errorContainer.id = `err-${inputElement.id}`; // Generate an ID
                inputElement.setAttribute('aria-describedby', errorContainer.id);
                inputElement.parentNode.insertBefore(errorContainer, inputElement.nextSibling);
            }
        }
        
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block'; // Ensure visible
        }
        inputElement.classList.add('error'); // Visual cue on input
        inputElement.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError(inputElement) {
        const errorContainerId = inputElement.getAttribute('aria-describedby');
        const errorContainer = errorContainerId ? document.getElementById(errorContainerId) : null;

        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none'; // Hide
        }
        inputElement.classList.remove('error');
        inputElement.removeAttribute('aria-invalid');
    }
    
    function displayFormStatus(formElement, message, type = 'success') {
        const statusContainerId = 'form-status'; // As per HTML
        let statusContainer = document.getElementById(statusContainerId);

        if(!statusContainer && formElement){ // Fallback if not found, create near form
            statusContainer = document.createElement('div');
            statusContainer.id = statusContainerId;
            statusContainer.className = 'form-status-message';
            formElement.parentNode.insertBefore(statusContainer, formElement);
        }
        
        if (statusContainer) {
            statusContainer.textContent = message;
            statusContainer.className = `form-status-message ${type}-message`; // success-message or error-message
            statusContainer.setAttribute('role', type === 'success' ? 'status' : 'alert');
            statusContainer.style.display = 'block';

            setTimeout(() => {
                statusContainer.textContent = '';
                statusContainer.style.display = 'none';
            }, 7000); // Display for 7 seconds
        }
    }


    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.setAttribute('novalidate', 'true'); // Disable browser validation

        consultationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let isFormValid = true;

            // Clear previous general form errors
            const generalStatusContainer = document.getElementById('form-status');
            if(generalStatusContainer) {
                generalStatusContainer.textContent = '';
                generalStatusContainer.style.display = 'none';
            }


            const fieldsToValidate = ['name', 'email', 'phone', 'consultation-time', 'message'];
            for (const fieldId of fieldsToValidate) {
                const input = document.getElementById(fieldId);
                if (input) {
                    clearFieldError(input);
                    const validator = fieldValidators[fieldId] || ((val) => String(val).trim() !== '');
                    if (!validator(input.value)) {
                        isFormValid = false;
                        displayFieldError(input, errorMessages[fieldId] || errorMessages.generic);
                    }
                }
            }

            if (isFormValid) {
                const submitButton = consultationForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'جاري الإرسال...';

                try {
                    // Simulate API Call (replace with actual fetch in production)
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    displayFormStatus(consultationForm, 'شكراً لك! تم إرسال طلب الاستشارة بنجاح. سنتواصل معك قريباً.', 'success');
                    consultationForm.reset();
                    fieldsToValidate.forEach(id => clearFieldError(document.getElementById(id))); // Clear all errors on success

                    if (typeof gtag === 'function') {
                        gtag('event', 'form_submission', {
                            'event_category': 'Engagement',
                            'event_label': 'Consultation Form Success',
                            'value': 10 // Example value for successful submission
                        });
                    }
                } catch (error) {
                    console.error('Consultation form submission error:', error);
                    displayFormStatus(consultationForm, 'عذراً، حدث خطأ أثناء إرسال النموذج. الرجاء المحاولة مرة أخرى لاحقاً.', 'error');
                     if (typeof gtag === 'function') {
                        gtag('event', 'form_submission_error', {
                            'event_category': 'Error',
                            'event_label': 'Consultation Form Fail'
                        });
                    }
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            } else {
                const firstInvalidField = consultationForm.querySelector('[aria-invalid="true"]');
                firstInvalidField?.focus();
                 displayFormStatus(consultationForm, 'الرجاء تصحيح الأخطاء المميزة في النموذج.', 'error');
            }
        });
    }

    // Newsletter Forms (main and footer)
    document.querySelectorAll('.newsletter-form, .newsletter-form-large').forEach(form => {
        form.setAttribute('novalidate', 'true');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;

            clearFieldError(emailInput); // Assuming a similar error display structure if needed

            if (fieldValidators.email(emailInput.value)) {
                const submitButton = form.querySelector('button[type="submit"]');
                const originalButtonHTML = submitButton.innerHTML; // Store HTML if it contains icons
                submitButton.disabled = true;
                submitButton.innerHTML = 'جار الاشتراك...';

                try {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
                    // For newsletter, status might be simpler or integrated differently
                    // Using console for now, or adapt displayFormStatus
                    console.log(`Newsletter signup success for ${form.className}: ${emailInput.value}`);
                    alert('شكراً لاشتراكك في النشرة البريدية!'); // Simple alert for newsletter
                    form.reset();
                     if (typeof gtag === 'function') {
                        gtag('event', 'newsletter_signup', {
                            'event_category': 'Engagement',
                            'event_label': form.classList.contains('newsletter-form-large') ? 'Main Newsletter' : 'Footer Newsletter'
                        });
                    }
                } catch (error) {
                    console.error('Newsletter submission error:', error);
                    alert('حدث خطأ أثناء الاشتراك. الرجاء المحاولة مرة أخرى.');
                } finally {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            } else {
                // For newsletter, often a simpler error indication is fine
                emailInput.classList.add('error');
                emailInput.focus();
                alert(errorMessages.email); // Simple alert
            }
        });
    });
}

/**
 * Initializes scroll-triggered animations for elements.
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.service-card, .tourism-feature-card, .case-card, .feature-item, .team-member, .tech-card, .faq-item, .demo-intro-card, .demo-feature, .case-study-card, .tech-detail-card'
    );
    if (animatedElements.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'fade-in');
                    obs.unobserve(entry.target); // Animate only once
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers: show all elements immediately
        animatedElements.forEach(el => el.classList.add('visible', 'fade-in'));
    }
}

/**
 * Initializes the "Back to Top" button functionality.
 */
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    if (!backToTopButton) return;

    const toggleVisibility = () => {
        const 보인다 = window.pageYOffset > 300; // Korean for "is visible" :) -> isVisible
        backToTopButton.classList.toggle('visible', 보인다);
        backToTopButton.setAttribute('aria-hidden', String(!보인다));
    };

    window.addEventListener('scroll', throttle(toggleVisibility, 150), { passive: true });
    toggleVisibility(); // Initial check

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof gtag === 'function') {
            gtag('event', 'interaction', {
                'event_category': 'Navigation',
                'event_label': 'Back to Top Click'
            });
        }
    });
}

/**
 * Initializes smooth scrolling for on-page anchor links.
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            if (href && href.length > 1 && href.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        event.preventDefault();
                        const navbar = document.querySelector('.navbar');
                        const navbarHeight = navbar ? navbar.offsetHeight : 0;
                        // Calculate position considering navbar height and a small offset for spacing
                        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - navbarHeight - 20; // 20px additional offset

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Update URL hash without causing page jump, if supported
                        if (history.pushState) {
                            history.pushState(null, '', href);
                        } else {
                            // Fallback for older browsers (might cause a jump)
                            // window.location.hash = href; // Or simply let default behavior occur
                        }
                         // Optionally, set focus to the target element for accessibility
                        // setTimeout(() => targetElement.focus(), 1000); // Delay to allow scroll to finish
                    }
                } catch (error) {
                    console.warn('Smooth scroll: Invalid selector or target not found.', href, error);
                }
            }
        });
    });
}

/**
 * Saudi SEO Enhancement Functions
 */
function initSaudiSEO() {
    // Add structured data for Saudi search engines
    const saudiStructuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "شركة مُشرقة AI",
        "alternateName": "Bright AI Saudi Arabia",
        "description": "مُشرقة AI الشركة السعودية الرائدة في الذكاء الاصطناعي بالرياض",
        "url": "https://www.brightaii.com/",
        "telephone": "+966-53-822-9013",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "الرياض",
            "addressRegion": "منطقة الرياض",
            "addressCountry": "SA"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 24.7136,
            "longitude": 46.6753
        },
        "areaServed": ["الرياض", "جدة", "الدمام", "الخبر", "مكة", "المدينة المنورة"],
        "serviceArea": {
            "@type": "Country",
            "name": "المملكة العربية السعودية"
        }
    };

    // Inject structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(saudiStructuredData);
    document.head.appendChild(script);

    // === BEGIN: Additional SEO Injections ===
    // Additional Meta Tags
    const additionalMetaTags = [
        { name: 'keywords', content: 'شركة مُشرقة AI الرياض, الذكاء الاصطناعي السعودية, شات بوت عربي سعودي, أتمتة العمليات RPA الرياض, تحليل البيانات الضخمة جدة, خدمات AI الدمام, رؤية 2030 الذكاء الاصطناعي, تعلم الآلي السعودية, روبوتات ذكية سعودية, استشارات الذكاء الاصطناعي المملكة' },
        { name: 'news_keywords', content: 'الذكاء الاصطناعي, الرياض, جدة, الدمام, مُشرقة AI' },
        { name: 'article:tag', content: 'شركة ذكاء اصطناعي سعودية, حلول AI الرياض, أتمتة سعودية, شات بوت سعودي' }
    ];
    
    additionalMetaTags.forEach(meta => {
        if (!document.querySelector(`meta[name="${meta.name}"]`)) {
            const metaTag = document.createElement('meta');
            metaTag.name = meta.name;
            metaTag.content = meta.content;
            document.head.appendChild(metaTag);
        }
    });

    // Structured Data (ksaSchema)
    const ksaSchema = {
        "@context": "https://schema.org",
        "@type": ["Corporation", "LocalBusiness"],
        "name": "شركة مُشرقة AI",
        "alternateName": "Bright AI KSA",
        "description": "أول شركة سعودية متخصصة في الذكاء الاصطناعي والروبوتات - نخدم الرياض، جدة، الدمام وكل مناطق المملكة.",
        "url": "https://www.brightaii.com",
        "logo": "https://www.brightaii.com/mushrqah-ai-logo.png",
        "image": "https://www.brightaii.com/og-image-ksa.jpg",
        "telephone": "+966-53-822-9013",
        "email": "info@brightaii.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "طريق الملك فهد",
            "addressLocality": "الرياض",
            "addressRegion": "منطقة الرياض",
            "postalCode": "11564",
            "addressCountry": "SA"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 24.7136,
            "longitude": 46.6753
        },
        "areaServed": [
            { "@type": "City", "name": "الرياض" },
            { "@type": "City", "name": "جدة" },
            { "@type": "City", "name": "الدمام" },
            { "@type": "State", "name": "المملكة العربية السعودية" }
        ],
        "offers": [{
            "@type": "Offer",
            "name": "استشارة الذكاء الاصطناعي المجانية",
            "price": "0",
            "priceCurrency": "SAR",
            "availability": "https://schema.org/InStock",
            "url": "https://www.brightaii.com/consultation.html"
        }],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "خدمات الذكاء الاصطناعي في السعودية",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "name": "أتمتة العمليات بالذكاء الاصطناعي",
                    "description": "RPA حديث للشركات في الرياض وجدة والدمام"
                },
                {
                    "@type": "Offer",
                    "name": "شات بوت عربي ذكي",
                    "description": "بوت محادثة يفهم اللهجات السعودية"
                },
                {
                    "@type": "Offer",
                    "name": "تحليل البيانات الضخمة",
                    "description": "تعلم الآلي لتحليل البيانات في السوق السعودي"
                }
            ]
        },
        "sameAs": [
            "https://wa.me/966538229013",
            "https://www.tiktok.com/@bright1ai",
            "https://www.instagram.com/iililil44",
            "https://www.youtube.com/@TeechLab"
        ]
    };
    
    const ksaScript = document.createElement('script');
    ksaScript.type = 'application/ld+json';
    ksaScript.textContent = JSON.stringify(ksaSchema);
    document.head.appendChild(ksaScript);

    // Geo-Modified H1-H3 Tags
    document.querySelectorAll('.service-card h3, .tourism-feature-card h3, .case-card h3').forEach(title => {
        if (!title.textContent.includes('الرياض')) {
            title.textContent += ' - الرياض جدة الدمام';
        }
    });
    // === END: Additional SEO Injections ===

    // Existing Saudi-specific meta tags
    const saudiMeta = [
        { name: 'geo.region', content: 'SA' },
        { name: 'geo.placename', content: 'الرياض, جدة, الدمام, المملكة العربية السعودية' },
        { name: 'ICBM', content: '24.7136, 46.6753' },
        { name: 'DC.title', content: 'شركة مُشرقة AI | الذكاء الاصطناعي السعودية' },
        { name: 'DC.creator', content: 'مُشرقة AI' },
        { name: 'DC.subject', content: 'الذكاء الاصطناعي, التعلم الآلي, أتمتة العمليات, السعودية' },
        { name: 'DC.description', content: 'مُشرقة AI الشركة السعودية الرائدة في الذكاء الاصطناعي' }
    ];

    saudiMeta.forEach(meta => {
        if (!document.querySelector(`meta[name="${meta.name}"]`)) {
            const metaTag = document.createElement('meta');
            metaTag.name = meta.name;
            metaTag.content = meta.content;
            document.head.appendChild(metaTag);
        }
    });

    // Track Saudi-specific user interactions
    if (typeof gtag === 'function') {
        gtag('config', 'G-SZKTP4496K', {
            'custom_map': {
                'saudi_city': 'saudi_user_city',
                'saudi_service': 'saudi_service_interest'
            }
        });
    }
}

/**
 * Track Saudi user behavior for SEO insights
 */
function trackSaudiUserBehavior() {
    // Track scroll depth for Saudi content
    let maxScroll = 0;
    const trackScrollDepth = throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            if (typeof gtag === 'function') {
                gtag('event', 'scroll_depth', {
                    'event_category': 'Saudi User Engagement',
                    'event_label': `${scrollPercent}% Scroll Depth`,
                    'value': scrollPercent
                });
            }
        }
    }, 1000);

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Track time spent on Saudi-specific sections
    const saudiSections = document.querySelectorAll('[id*="saudi"], [class*="saudi"], .services, .ai-demos-section, .tourism-heritage');
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.id || entry.target.className.split(' ')[0];
                    if (typeof gtag === 'function') {
                        gtag('event', 'section_view', {
                            'event_category': 'Saudi Content Engagement',
                            'event_label': sectionName,
                            'value': 1
                        });
                    }
                }
            });
        }, { threshold: 0.5 });

        saudiSections.forEach(section => sectionObserver.observe(section));
    }
}

/**
 * Main DOMContentLoaded event listener to initialize all components.
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initServiceWorker(); // Initialize Service Worker first
        initNavbar();
        initHeroCanvas();
        initFAQ();
        initForms();
        initScrollAnimations();
        initBackToTop();
        initSmoothScroll();
        initSaudiSEO(); // Initialize Saudi SEO enhancements
        trackSaudiUserBehavior(); // Track Saudi user behavior

        // Performance monitoring after DOM is ready and scripts potentially run
        if (window.performance && typeof window.performance.now === 'function') {
            console.log(`[Perf] DOMContentLoaded to end of main script: ${Math.round(performance.now())}ms`);
        }

        console.log('[BrightAI] All components initialized successfully with Saudi SEO enhancements.');

    } catch (error) {
        console.error("Error during main script initialization:", error);
    }
});

/**
 * Handles lazy loading of external scripts after page load.
 */
window.addEventListener('load', () => {
    // Example for a hypothetical external script
    // setTimeout(() => {
    //     if (document.querySelector('.some-widget-class')) {
    //         const script = document.createElement('script');
    //         script.src = 'https://example.com/widget.js';
    //         script.async = true;
    //         script.defer = true; // Defer ensures it executes after DOM parsing
    //         document.head.appendChild(script);
    //         console.log('[LazyLoad] Example widget script initiated.');
    //     }
    // }, 2500); // Delay to ensure critical rendering path is clear

    if (window.performance && typeof window.performance.timing !== 'undefined') {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`[Perf] Full page load time: ${loadTime}ms`);
        if (typeof gtag === 'function') {
            gtag('event', 'timing_complete', {
                'name': 'full_page_load',
                'value': loadTime,
                'event_category': 'Performance Details'
            });
        }
    }
});


// Support Popup Functions (from HTML, integrated here for completeness)
function openSupportPopup() {
    const overlay = document.getElementById('supportPopupOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        const iframe = overlay.querySelector('iframe');
        iframe?.focus(); // Focus iframe for accessibility
    }
}

function closeSupportPopup() {
    const overlay = document.getElementById('supportPopupOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        const fabButton = document.querySelector('.support-fab');
        fabButton?.focus(); // Return focus to FAB button
    }
}

// Attach listeners for support popup (if FAB is always present)
document.addEventListener('DOMContentLoaded', () => {
    const supportFab = document.querySelector('.support-fab');
    const supportPopupOverlay = document.getElementById('supportPopupOverlay');
    const closePopupButton = document.querySelector('.support-popup-close');

    supportFab?.addEventListener('click', openSupportPopup);
    closePopupButton?.addEventListener('click', closeSupportPopup);

    supportPopupOverlay?.addEventListener('click', function(e) {
        if (e.target === this) closeSupportPopup(); // Close if clicking on overlay itself
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && supportPopupOverlay?.classList.contains('active')) {
            closeSupportPopup();
        }
    });
});

// Dynamic Styles for notifications and form messages (moved from end of original to ensure availability)
// It's generally better to include these in your main CSS file.
// However, to match the original structure, it's placed here.
(function appendDynamicStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .update-notification {
            position: fixed; top: 20px; right: 20px; left: auto;
            background: var(--primary-color, #64FFDA); color: var(--secondary-color, #0A192F);
            padding: 1rem 1.5rem; border-radius: var(--border-radius-md, 8px);
            box-shadow: var(--shadow-lg, 0 4px 20px rgba(0,0,0,0.3));
            z-index: 10000; font-family: 'Tajawal', Arial, sans-serif;
            direction: rtl; max-width: 90vw; /* Responsive max width */
            animation: fadeInNotification 0.5s ease-out forwards;
        }
        @keyframes fadeInNotification {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .update-content { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .update-content span { font-weight: 500; }
        .update-btn, .dismiss-btn {
            background: var(--secondary-color, #0A192F); color: var(--primary-color, #64FFDA);
            border: 1px solid var(--primary-color, #64FFDA); padding: 0.5rem 1rem;
            border-radius: var(--border-radius-sm, 4px); cursor: pointer; font-size: 0.9rem;
            font-family: inherit; transition: background-color 0.2s ease, color 0.2s ease;
        }
        .update-btn:hover, .update-btn:focus-visible,
        .dismiss-btn:hover, .dismiss-btn:focus-visible {
            background-color: var(--accent-color, #1D2B3A); color: var(--white, #FFFFFF);
        }
        .dismiss-btn {
            background: transparent; color: var(--secondary-color, #0A192F);
            padding: 0.25rem 0.5rem; font-weight: bold; font-size: 1.2rem;
            line-height: 1; border: none;
        }
        .dismiss-btn:hover, .dismiss-btn:focus-visible {
            color: var(--error-color, #f44336); background-color: rgba(0,0,0,0.05);
        }

        /* Form status and error messages */
        .error-message, /* For individual field errors */
        .form-status-message { /* For general form status */
            font-size: 0.9rem; padding: 0.75rem 1rem; /* Balanced padding */
            border-radius: var(--border-radius-sm, 4px);
            margin-block-start: 0.5rem;
            font-family: 'Tajawal', Arial, sans-serif;
            text-align: right; /* RTL text */
            display: none; /* Hidden by default, shown by JS */
        }
        .error-message { /* Individual field errors from JS */
            color: var(--error-color, #f44336);
            background-color: rgba(244, 67, 54, 0.08); /* Softer background */
            border: 1px solid var(--error-color, #f44336);
        }
        .form-control.error { /* Class added by JS to input with error */
            border-color: var(--error-color, #f44336) !important;
            box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.25) !important; /* Softer shadow */
        }
        .form-status-message.success-message {
            background-color: var(--success-color, #4CAF50); color: white;
            border: 1px solid #388E3C; /* Darker green border */
        }
        .form-status-message.error-message { /* General form errors from JS */
            background-color: var(--error-color, #f44336); color: white;
            border: 1px solid #D32F2F; /* Darker red border */
        }
    `;
    document.head.appendChild(styleSheet);
})();
