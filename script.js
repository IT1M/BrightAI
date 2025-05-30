// BrightAI - Enhanced JavaScript for Performance & User Experience
// Version: 2.0.1
// Last updated: 2024-12-16 (Current Date for example)

// Performance optimization: Use passive listeners and debouncing
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js') // Ensure service-worker.js exists at root
            .then(registration => {
                console.log('[SW] Service Worker registered successfully:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Show update notification
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('[SW] Service Worker registration failed:', error);
            });
    });
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="update-content">
            <span>تحديث جديد متاح للموقع</span>
            <button onclick="window.location.reload()" class="update-btn">تحديث الآن</button>
            <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn" aria-label="إغلاق الإشعار">×</button>
        </div>
    `;
    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Performance monitoring
    if (performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`[Performance] Page load time: ${loadTime}ms`);

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                'name': 'load',
                'value': loadTime,
                'event_category': 'Performance'
            });
        }
    }

    // Enhanced Navbar functionality
    const initNavbar = () => {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.overlay');
        const navLinkItems = document.querySelectorAll('.nav-links li a');
        const navbar = document.querySelector('.navbar');

        if (!hamburger || !navLinks || !overlay || !navbar) {
            console.warn('[Navbar] One or more navbar elements not found.');
            return;
        }
        
        navbar.style.transform = 'translateY(0)'; // Ensure navbar is visible on load

        // Mobile menu toggle
        hamburger.addEventListener('click', () => {
            const isActive = navLinks.classList.contains('active');

            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            overlay.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? '' : 'hidden';

            // Update ARIA attributes
            hamburger.setAttribute('aria-expanded', String(!isActive));
            navLinks.setAttribute('aria-hidden', String(isActive));
        });

        const closeMenu = () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
            navLinks.setAttribute('aria-hidden', 'true');
        };

        // Close menu on overlay click
        overlay.addEventListener('click', closeMenu);

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        // Handle navigation link clicks
        navLinkItems.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (navLinks.classList.contains('active')) {
                     // Close menu if it's an internal link or same page link
                    if (href.startsWith('#') || (href.startsWith(window.location.pathname + '#') && href.length > window.location.pathname.length + 1) || href === window.location.pathname) {
                       closeMenu();
                    }
                }

                // Track navigation clicks
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'navigation_click', {
                        'event_category': 'Navigation',
                        'event_label': href
                    });
                }
            });
        });

        // Enhanced navbar scroll behavior
        let lastScrollTop = 0;
        let ticking = false;

        const updateNavbar = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDelta = scrollTop - lastScrollTop;

            if (navbar) {
                if (scrollTop > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                // Hide navbar on scroll down, show on scroll up - but only if menu is not active
                if (!navLinks.classList.contains('active')) {
                    if (scrollDelta > 5 && scrollTop > navbar.offsetHeight * 2) {
                        navbar.style.transform = 'translateY(-100%)';
                    } else if (scrollDelta < -5 || scrollTop < navbar.offsetHeight) { // Show if scrolling up or near top
                        navbar.style.transform = 'translateY(0)';
                    }
                } else {
                     navbar.style.transform = 'translateY(0)'; // Keep navbar visible if menu is open
                }
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateNavbar(); // Initial call
    };

    // Enhanced Hero Canvas Animation
    const initHeroCanvas = () => {
        const heroCanvas = document.getElementById('heroCanvas');
        if (!heroCanvas) return;

        const ctx = heroCanvas.getContext('2d');
        let particlesArray = [];
        let animationFrameId;
        let isVisible = true; // Assume visible initially

        // Optimize canvas for high DPI displays
        const setCanvasSize = () => {
            const heroSection = heroCanvas.closest('.hero');
            if (!heroSection) return;
            const rect = heroSection.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            heroCanvas.width = rect.width * dpr;
            heroCanvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);
            heroCanvas.style.width = rect.width + 'px';
            heroCanvas.style.height = rect.height + 'px';
        };

        // Enhanced Particle class with better performance
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.opacityDirection = Math.random() > 0.5 ? 1 : -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color.replace('0.25', this.opacity.toFixed(2)); // Ensure opacity is a string
                ctx.fill();
            }

            update() {
                const canvasWidth = heroCanvas.width / (window.devicePixelRatio || 1);
                const canvasHeight = heroCanvas.height / (window.devicePixelRatio || 1);
                // Bounce off walls
                if (this.x + this.size > canvasWidth || this.x - this.size < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y + this.size > canvasHeight || this.y - this.size < 0) {
                    this.directionY = -this.directionY;
                }

                // Update position
                this.x += this.directionX;
                this.y += this.directionY;

                // Update opacity for twinkling effect
                this.opacity += this.opacityDirection * 0.005;
                if (this.opacity <= 0.1 || this.opacity >= 0.6) {
                    this.opacityDirection = -this.opacityDirection;
                    // Clamp opacity to prevent issues
                    this.opacity = Math.max(0.1, Math.min(0.6, this.opacity));
                }

                this.draw();
            }
        }

        // Create optimized particle array
        const initParticles = () => {
            particlesArray = [];
            const dpr = window.devicePixelRatio || 1;
            const area = (heroCanvas.width / dpr) * (heroCanvas.height / dpr);
            let numberOfParticles = Math.floor(area / 12000);

            // Responsive particle count
            if (window.innerWidth < 768) {
                numberOfParticles = Math.floor(numberOfParticles * 0.5);
            }

            numberOfParticles = Math.max(20, Math.min(100, numberOfParticles)); // Cap particles

            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 0.5;
                const x = Math.random() * (heroCanvas.width / dpr - size * 2) + size;
                const y = Math.random() * (heroCanvas.height / dpr - size * 2) + size;
                const directionX = (Math.random() * 0.4) - 0.2;
                const directionY = (Math.random() * 0.4) - 0.2;
                const color = 'rgba(100, 255, 218, 0.25)';

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        };

        // Optimized animation loop
        const animateParticles = () => {
            if (!isVisible) return;

            animationFrameId = requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height); // Clear scaled canvas

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        };

        const setupCanvas = () => {
            setCanvasSize();
            initParticles();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            // Only start animation if canvas is visible
            if(isVisible) animateParticles();
        };

        // Intersection Observer to pause animation when not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    if (!animationFrameId) { // Only start if not already running
                         // Re-initialize particles if canvas size might have changed while hidden
                        setupCanvas();
                    }
                } else if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
        }, { threshold: 0.01 }); // Trigger even if 1% is visible

        observer.observe(heroCanvas);

        // Initial setup. The observer will handle starting the animation.
        setCanvasSize();
        initParticles();
        // If initially visible, start animation (observer might take a moment)
        if (isVisible && !animationFrameId) {
            animateParticles();
        }

        window.addEventListener('resize', debounce(setupCanvas, 250));
    };

    // Enhanced FAQ functionality
    const initFAQ = () => {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!question || !answer) return;

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close other open FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                        otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });

                // Toggle current FAQ
                if (isActive) {
                    item.classList.remove('active');
                    question.setAttribute('aria-expanded', 'false');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + 'px';

                    // Track FAQ interactions
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'faq_interaction', {
                            'event_category': 'FAQ',
                            'event_label': question.textContent.trim()
                        });
                    }
                }
            });
        });
    };


    // Enhanced form validation and submission logic
    const initForms = () => {
        const validators = {
            email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase()),
            phone: (phone) => /^(05\d{8}|5\d{8}|\+9665\d{8}|009665\d{8})$/.test(String(phone).replace(/[\s-]/g, '')),
            name: (name) => String(name).trim().length >= 2,
            message: (message) => String(message).trim().length >= 10,
            consultation_time: (value) => String(value).trim() !== ''
        };

        function getErrorMessage(field, value = '') {
            const messages = {
                name: 'الاسم الكامل مطلوب (حد أدنى حرفان).',
                email: 'الرجاء إدخال بريد إلكتروني صحيح.',
                phone: 'الرجاء إدخال رقم هاتف سعودي صحيح (مثال: 05xxxxxxxx أو +9665xxxxxxxx).',
                message: 'الرسالة مطلوبة (حد أدنى 10 أحرف).',
                'consultation-time': 'الرجاء اختيار وقت مفضل للاستشارة.',
                generic: 'هذا الحقل مطلوب.'
            };
            // Special handling for consultation-time which uses id 'consultation-time'
            return messages[field] || messages.generic;
        }
        
        function showError(element, message) {
            if (!element) return;
            element.classList.add('error');
            element.setAttribute('aria-invalid', 'true');
            
            // Remove existing error message if any
            const existingError = element.parentNode.querySelector('.error-message');
            if (existingError) existingError.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }

        function clearError(element) {
            if (!element) return;
            element.classList.remove('error');
            element.removeAttribute('aria-invalid');
            const errorDiv = element.parentNode.querySelector('.error-message');
            if (errorDiv) errorDiv.remove();
        }


        function showSuccess(message, formElement) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = message;
            successDiv.setAttribute('role', 'status');

            if (formElement && formElement.parentNode) {
                 formElement.parentNode.insertBefore(successDiv, formElement);
            } else {
                document.body.appendChild(successDiv);
            }
            
            setTimeout(() => {
                if (successDiv && successDiv.parentElement) {
                    successDiv.remove();
                }
            }, 5000);
        }
        
        function showFormError(formElement, message) {
            // Remove existing general form error
            const existingError = formElement.querySelector('.form-general-error');
            if(existingError) existingError.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message form-general-error'; // Added form-general-error
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');
            errorDiv.style.textAlign = 'center'; // Center the general form error
            errorDiv.style.marginTop = '1rem';
            formElement.appendChild(errorDiv); // Append to form or insert before submit button
        }


        // Consultation form
        const consultationForm = document.getElementById('consultationForm');
        if (consultationForm) {
            consultationForm.setAttribute('novalidate', true); // Disable browser native validation

            consultationForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                let isValid = true;

                // Clear previous general form errors
                const generalError = this.querySelector('.form-general-error');
                if(generalError) generalError.remove();

                // Validate fields
                const fieldsToValidate = ['name', 'email', 'phone', 'consultation-time', 'message'];
                fieldsToValidate.forEach(fieldId => {
                    const input = document.getElementById(fieldId);
                    if (input) {
                        clearError(input); // Clear previous error for this field
                        const validatorKey = fieldId.replace(/-/g, '_'); // e.g., consultation-time to consultation_time
                        if (validators[validatorKey] && !validators[validatorKey](input.value)) {
                            isValid = false;
                            showError(input, getErrorMessage(fieldId, input.value));
                        } else if (!input.value && input.hasAttribute('required')) { // General required check
                            isValid = false;
                            showError(input, getErrorMessage(fieldId, input.value));
                        }
                    }
                });


                if (isValid) {
                    const submitButton = this.querySelector('button[type="submit"]');
                    const originalButtonText = submitButton.textContent;
                    submitButton.disabled = true;
                    submitButton.textContent = 'جار الإرسال...';

                    const formData = new FormData(this);
                    const data = Object.fromEntries(formData.entries());

                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
                        
                        // Example: Replace with actual fetch call
                        // const response = await fetch('/api/submit-consultation', {
                        //     method: 'POST',
                        //     headers: { 'Content-Type': 'application/json' },
                        //     body: JSON.stringify(data)
                        // });
                        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        // const result = await response.json();
                        
                        showSuccess('شكراً لك! تم إرسال طلب الاستشارة بنجاح. سنتواصل معك قريباً.', this);
                        this.reset();
                        fieldsToValidate.forEach(fieldId => clearError(document.getElementById(fieldId))); // Clear all errors on success

                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'form_submit', {
                                'event_category': 'Form',
                                'event_label': 'consultation'
                            });
                        }
                    } catch (error) {
                        console.error('Form submission error:', error);
                        showFormError(this, 'حدث خطأ أثناء إرسال النموذج. الرجاء المحاولة مرة أخرى لاحقاً.');
                    } finally {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                } else {
                    // Focus the first invalid field
                    const firstInvalidField = this.querySelector('.form-control.error');
                    if (firstInvalidField) firstInvalidField.focus();
                }
            });
        }

        // Newsletter forms
        const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-large');
        newsletterForms.forEach(form => {
            form.setAttribute('novalidate', true);
            form.addEventListener('submit', async function(event) {
                event.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                clearError(emailInput);

                if (emailInput && validators.email(emailInput.value.trim())) {
                    const submitButton = this.querySelector('button[type="submit"]');
                    const originalButtonText = submitButton.textContent;
                    const originalButtonHTML = submitButton.innerHTML; // If it contains an icon
                    submitButton.disabled = true;
                    submitButton.innerHTML = 'جار الاشتراك...';


                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        showSuccess('شكراً لاشتراكك في النشرة البريدية!', this);
                        this.reset();
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'newsletter_signup', {
                                'event_category': 'Newsletter',
                                'event_label': this.classList.contains('newsletter-form-large') ? 'main_newsletter' : 'footer_newsletter'
                            });
                        }
                    } catch (error) {
                        console.error('Newsletter submission error:', error);
                        showError(emailInput, 'حدث خطأ. حاول مرة أخرى.');
                    } finally {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonHTML; // Restore original content (e.g. icon)
                    }

                } else if (emailInput) {
                    showError(emailInput, getErrorMessage('email', emailInput.value));
                    emailInput.focus();
                }
            });
        });
    };

    // Enhanced scroll animations
    const initScrollAnimations = () => {
        const animatedElements = document.querySelectorAll(
            '.service-card, .tourism-feature-card, .case-card, .feature-item, .team-member, .tech-card, .faq-item, .demo-intro-card, .demo-feature' // Added new demo elements
        );

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // Trigger when 50px from bottom of viewport
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => { // Renamed observer to obs to avoid conflict
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible', 'fade-in');
                        obs.unobserve(entry.target); // Unobserve after animation
                    }
                });
            }, observerOptions);
            animatedElements.forEach(el => observer.observe(el));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            animatedElements.forEach(el => el.classList.add('visible', 'fade-in'));
        }
    };

    // Back to top button
    const initBackToTop = () => {
        const backToTopButton = document.querySelector('.back-to-top');
        if (!backToTopButton) return;

        const toggleButton = throttle(() => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
                backToTopButton.setAttribute('aria-hidden', 'false');
            } else {
                backToTopButton.classList.remove('visible');
                backToTopButton.setAttribute('aria-hidden', 'true');
            }
        }, 100);

        window.addEventListener('scroll', toggleButton, { passive: true });
        toggleButton(); // Initial check

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (typeof gtag !== 'undefined') {
                gtag('event', 'back_to_top', {
                    'event_category': 'Navigation'
                });
            }
        });
    };

    // Smooth scroll for anchor links
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href.length > 1 && href.startsWith('#')) { // Ensure it's a valid hash link
                    try {
                        const targetElement = document.querySelector(href);
                        if (targetElement) {
                            e.preventDefault();
                            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                            const offsetPosition = elementPosition - navbarHeight - 20; // 20px additional offset

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                            // Optionally, update URL hash without triggering jump
                            if (history.pushState) {
                                history.pushState(null, null, href);
                            } else {
                                window.location.hash = href;
                            }
                        }
                    } catch (error) {
                        console.warn('Smooth scroll target not found or invalid selector:', href, error);
                    }
                }
            });
        });
    };


    // Initialize all components
    initNavbar();
    initHeroCanvas();
    initFAQ();
    initForms();
    initScrollAnimations();
    initBackToTop();
    initSmoothScroll();

    // Lazy load external scripts
    const loadExternalScripts = () => {
        // LinkedIn badge (if needed)
        if (document.querySelector('.linkedin-badge')) {
            const linkedInScript = document.createElement('script');
            linkedInScript.src = 'https://platform.linkedin.com/badges/js/profile.js';
            linkedInScript.async = true;
            linkedInScript.defer = true;
            document.head.appendChild(linkedInScript);
        }
    };

    // Load external scripts after page load and some delay
    window.addEventListener('load', () => {
        setTimeout(loadExternalScripts, 2000); // Delay to prioritize main content
    });

    console.log('[BrightAI] JavaScript initialized successfully');
});

// Add CSS for notifications and form messages
const style = document.createElement('style');
style.textContent = `
    .update-notification {
        position: fixed;
        top: 20px;
        right: 20px; /* Adjusted for RTL */
        left: auto;
        background: var(--primary-color, #64FFDA);
        color: var(--secondary-color, #0A192F);
        padding: 1rem;
        border-radius: var(--border-radius, 8px);
        box-shadow: var(--shadow, 0 4px 20px rgba(0,0,0,0.3));
        z-index: 10000;
        font-family: 'Tajawal', Arial, sans-serif;
        direction: rtl;
        max-width: 90%;
    }
    .update-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .update-btn, .dismiss-btn {
        background: var(--secondary-color, #0A192F);
        color: var(--primary-color, #64FFDA);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
    }
    .dismiss-btn {
        background: transparent;
        color: var(--secondary-color, #0A192F);
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        font-size: 1.2rem;
        line-height: 1;
    }
    .success-message, .error-message.form-general-error {
        position: relative; /* Changed from fixed for better form context */
        background: #4CAF50; /* Green for success */
        color: white;
        padding: 1rem;
        border-radius: var(--border-radius, 8px);
        z-index: 10000;
        font-family: 'Tajawal', Arial, sans-serif;
        margin-top: 1rem;
        margin-bottom: 1rem;
        text-align: center;
    }
    .error-message.form-general-error {
        background: #f44336; /* Red for general form error */
    }
    .error-message { /* Field specific error */
        color: #f44336;
        font-size: 0.9rem;
        margin-top: 0.25rem;
        font-family: 'Tajawal', Arial, sans-serif;
        display: block; /* Ensure it takes its own line */
    }
    .form-control.error {
        border-color: #f44336 !important;
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2) !important;
    }
`;
document.head.appendChild(style);