// BrightAI - Enhanced JavaScript for Performance & User Experience
// Version: 2.0.2
// Last updated: (Current Date - e.g., 2024-07-27)
'use strict';

// Performance optimization: Use passive listeners and debouncing
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const context = this; // Capture context
        const later = () => {
            clearTimeout(timeout);
            func.apply(context, args); // Apply with correct context
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
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Show update notification
                                showUpdateNotification();
                            }
                        });
                    }
                });
            })
            .catch(error => {
                console.error('[SW] Service Worker registration failed:', error);
            });
    });
}

// Show update notification
function showUpdateNotification() {
    const existingNotification = document.querySelector('.update-notification');
    if (existingNotification) return; // Prevent multiple notifications

    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="update-content">
            <span>تحديث جديد متاح للموقع</span>
            <button id="update-now-btn" class="update-btn">تحديث الآن</button>
            <button id="dismiss-update-btn" class="dismiss-btn" aria-label="إغلاق الإشعار">×</button>
        </div>
    `;
    document.body.appendChild(notification);

    const updateBtn = document.getElementById('update-now-btn');
    const dismissBtn = document.getElementById('dismiss-update-btn');

    if (updateBtn) {
        updateBtn.addEventListener('click', () => window.location.reload());
    }
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => notification.remove());
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Performance monitoring
    if (window.performance && typeof window.performance.timing !== 'undefined') {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`[Performance] Page load time: ${loadTime}ms`);

        // Send to analytics if available
        if (typeof gtag === 'function') {
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
        const navLinks = document.querySelector('.nav-links'); // Should be ul#nav-links-list
        const overlay = document.querySelector('.overlay');
        const navLinkItems = document.querySelectorAll('.nav-links li a'); // Correct selector based on HTML
        const navbar = document.querySelector('.navbar');

        if (!hamburger || !navLinks || !overlay || !navbar) {
            console.warn('[Navbar] Crucial navbar elements not found. Navbar functionality may be impaired.');
            return;
        }
        
        navbar.style.transform = 'translateY(0)';

        const toggleMenu = (open) => {
            navLinks.classList.toggle('active', open);
            hamburger.classList.toggle('active', open);
            overlay.classList.toggle('active', open);
            document.body.style.overflow = open ? 'hidden' : '';
            hamburger.setAttribute('aria-expanded', String(open));
            navLinks.setAttribute('aria-hidden', String(!open));
        };

        hamburger.addEventListener('click', () => {
            const isActive = navLinks.classList.contains('active');
            toggleMenu(!isActive);
        });

        const closeMenu = () => toggleMenu(false);

        overlay.addEventListener('click', closeMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        navLinkItems.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href) return;

                if (navLinks.classList.contains('active')) {
                    if (href.startsWith('#') || href.startsWith(window.location.pathname + '#') || href === window.location.pathname || href === 'index.html' + window.location.hash) {
                       closeMenu();
                    }
                }

                if (typeof gtag === 'function') {
                    gtag('event', 'navigation_click', {
                        'event_category': 'Navigation',
                        'event_label': href
                    });
                }
            });
        });

        let lastScrollTop = 0;
        let ticking = false;

        const updateNavbarOnScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDelta = scrollTop - lastScrollTop;

            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            if (!navLinks.classList.contains('active')) {
                if (scrollDelta > 10 && scrollTop > navbar.offsetHeight * 2) { // Increased threshold
                    navbar.style.transform = 'translateY(-100%)';
                } else if (scrollDelta < -5 || scrollTop < navbar.offsetHeight) {
                    navbar.style.transform = 'translateY(0)';
                }
            } else {
                 navbar.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNavbarOnScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateNavbarOnScroll(); // Initial call
    };

    // Enhanced Hero Canvas Animation
    const initHeroCanvas = () => {
        const heroCanvas = document.getElementById('heroCanvas');
        if (!heroCanvas) {
            console.warn('[HeroCanvas] Canvas element not found.');
            return;
        }

        const ctx = heroCanvas.getContext('2d');
        if (!ctx) {
            console.error('[HeroCanvas] Failed to get 2D context.');
            return;
        }

        let particlesArray = [];
        let animationFrameId = null; // Initialize to null
        let isVisible = true; 

        const setCanvasSize = () => {
            const heroSection = heroCanvas.closest('.hero');
            if (!heroSection) return;
            const rect = heroSection.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            heroCanvas.width = rect.width * dpr;
            heroCanvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr); // Scale context once after setting size
            heroCanvas.style.width = rect.width + 'px';
            heroCanvas.style.height = rect.height + 'px';
        };

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                this.opacity = Math.random() * 0.4 + 0.1; // Adjusted opacity range
                this.opacityDirection = (Math.random() > 0.5 ? 1 : -1) * 0.005; // Slower opacity change
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                // Ensure opacity is correctly applied to rgba string
                const baseColor = this.color.substring(0, this.color.lastIndexOf(','));
                ctx.fillStyle = `${baseColor}, ${this.opacity.toFixed(3)})`;
                ctx.fill();
            }

            update() {
                const canvasWidth = heroCanvas.width / (window.devicePixelRatio || 1);
                const canvasHeight = heroCanvas.height / (window.devicePixelRatio || 1);

                if (this.x + this.size > canvasWidth || this.x - this.size < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y + this.size > canvasHeight || this.y - this.size < 0) {
                    this.directionY = -this.directionY;
                }

                this.x += this.directionX;
                this.y += this.directionY;

                this.opacity += this.opacityDirection;
                if (this.opacity <= 0.1 || this.opacity >= 0.5) {
                    this.opacityDirection *= -1;
                    this.opacity = Math.max(0.1, Math.min(0.5, this.opacity));
                }
                this.draw();
            }
        }

        const initParticles = () => {
            particlesArray = [];
            const dpr = window.devicePixelRatio || 1;
            const canvasWidth = heroCanvas.width / dpr;
            const canvasHeight = heroCanvas.height / dpr;
            const area = canvasWidth * canvasHeight;
            let numberOfParticles = Math.floor(area / 15000); // Adjusted density

            if (window.innerWidth < 768) {
                numberOfParticles = Math.floor(numberOfParticles * 0.6); // Fewer on mobile
            }
            numberOfParticles = Math.max(15, Math.min(80, numberOfParticles));

            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 1.5 + 0.5; // Slightly smaller max size
                const x = Math.random() * (canvasWidth - size * 2) + size;
                const y = Math.random() * (canvasHeight - size * 2) + size;
                const directionX = (Math.random() * 0.3) - 0.15; // Slower movement
                const directionY = (Math.random() * 0.3) - 0.15;
                const color = 'rgba(100, 255, 218, 0.25)'; // Base color with initial alpha (will be overridden by particle opacity)
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        };

        const animateParticles = () => {
            if (!isVisible || !ctx) return; // Added ctx check

            animationFrameId = requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        };

        const setupCanvas = () => {
            if (!ctx) return; // Ensure context exists
            setCanvasSize();
            initParticles();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null; // Reset ID
            }
            if (isVisible) animateParticles();
        };
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        if (!animationFrameId) { 
                            setupCanvas(); // Re-init if became visible
                        }
                    } else if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                });
            }, { threshold: 0.01 });
            observer.observe(heroCanvas);
        } else {
            // Fallback for no IntersectionObserver: always animate
            setupCanvas();
        }
        
        // Initial setup if visible from the start (observer might be slow)
        // The observer's initial check should handle this, but a direct call can ensure it starts if needed
        // setTimeout(setupCanvas, 100); // Small delay to ensure layout is stable

        window.addEventListener('resize', debounce(setupCanvas, 250));
    };

    // Enhanced FAQ functionality
    const initFAQ = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        if (faqItems.length === 0) {
            console.warn('[FAQ] No FAQ items found.');
            return;
        }

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!question || !answer) {
                console.warn('[FAQ] FAQ item missing question or answer element.');
                return;
            }
            // Ensure answer has an ID for aria-controls (should be in HTML but as a fallback)
            if (!answer.id) {
                answer.id = `faq-answer-${Math.random().toString(36).substr(2, 9)}`;
                question.setAttribute('aria-controls', answer.id);
            }


            question.addEventListener('click', () => {
                const isCurrentlyActive = item.classList.contains('active');

                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                    }
                });

                // Toggle current FAQ
                if (isCurrentlyActive) {
                    item.classList.remove('active');
                    question.setAttribute('aria-expanded', 'false');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + 'px';

                    if (typeof gtag === 'function') {
                        gtag('event', 'faq_interaction', {
                            'event_category': 'FAQ',
                            'event_label': question.textContent?.trim() || 'FAQ Question'
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

        function getErrorMessage(fieldId, value = '') {
            const messages = {
                name: 'الاسم الكامل مطلوب (حد أدنى حرفان).',
                email: 'الرجاء إدخال بريد إلكتروني صحيح.',
                phone: 'الرجاء إدخال رقم هاتف سعودي صحيح (مثال: 05xxxxxxxx أو +9665xxxxxxxx).',
                message: 'الرسالة مطلوبة (حد أدنى 10 أحرف).',
                'consultation-time': 'الرجاء اختيار وقت مفضل للاستشارة.', // Uses ID
                generic: 'هذا الحقل مطلوب.'
            };
            return messages[fieldId] || messages.generic;
        }
        
        function showError(element, message) {
            if (!element || !element.parentNode) return;
            element.classList.add('error');
            element.setAttribute('aria-invalid', 'true');
            
            let errorDiv = element.parentNode.querySelector(`.error-message[data-for="${element.id}"]`);
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.dataset.for = element.id; // Link error to input
                errorDiv.setAttribute('role', 'alert');
                // Insert after the element
                element.parentNode.insertBefore(errorDiv, element.nextSibling);
            }
            errorDiv.textContent = message;
            element.setAttribute('aria-describedby', errorDiv.id || (errorDiv.id = `err-${element.id}`)); // Link for screen readers
        }

        function clearError(element) {
            if (!element || !element.parentNode) return;
            element.classList.remove('error');
            element.removeAttribute('aria-invalid');
            element.removeAttribute('aria-describedby');
            const errorDiv = element.parentNode.querySelector(`.error-message[data-for="${element.id}"]`);
            if (errorDiv) errorDiv.remove();
        }

        function showFormStatusMessage(formElement, message, type = 'success') {
            if(!formElement) return;
            // Remove existing status message
            const existingStatus = formElement.querySelector('.form-status-message');
            if (existingStatus) existingStatus.remove();

            const statusDiv = document.createElement('div');
            statusDiv.className = `form-status-message ${type}-message`; // e.g., success-message or error-message
            statusDiv.textContent = message;
            statusDiv.setAttribute('role', type === 'success' ? 'status' : 'alert');
            
            // Insert before the form or as the first child of the form's parent
            formElement.parentNode.insertBefore(statusDiv, formElement);
            
            setTimeout(() => {
                if (statusDiv && statusDiv.parentElement) {
                    statusDiv.remove();
                }
            }, 5000);
        }
        
        // Consultation form
        const consultationForm = document.getElementById('consultationForm');
        if (consultationForm) {
            consultationForm.setAttribute('novalidate', 'true');

            consultationForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                let isValid = true;

                // Clear previous general form errors
                const existingStatus = this.parentNode.querySelector('.form-status-message');
                if(existingStatus) existingStatus.remove();


                const fieldsToValidate = ['name', 'email', 'phone', 'consultation-time', 'message'];
                fieldsToValidate.forEach(fieldId => {
                    const input = document.getElementById(fieldId);
                    if (input) {
                        clearError(input);
                        const validatorKey = fieldId.replace(/-/g, '_');
                        const validatorFn = validators[validatorKey] || (() => input.value.trim() !== ''); // Default check for required
                        
                        if (!validatorFn(input.value)) {
                            isValid = false;
                            showError(input, getErrorMessage(fieldId, input.value));
                        }
                    }
                });

                if (isValid) {
                    const submitButton = this.querySelector('button[type="submit"]');
                    if (!submitButton) return;
                    const originalButtonText = submitButton.textContent;
                    submitButton.disabled = true;
                    submitButton.textContent = 'جار الإرسال...';

                    const formData = new FormData(this);
                    // const data = Object.fromEntries(formData.entries()); // For JSON submission

                    try {
                        // Simulate API call - replace with actual fetch
                        // For a real endpoint, you might use:
                        // const response = await fetch(this.action, { method: 'POST', body: formData });
                        // if (!response.ok) throw new Error(`Server error: ${response.status}`);
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate success
                        
                        showFormStatusMessage(this, 'شكراً لك! تم إرسال طلب الاستشارة بنجاح. سنتواصل معك قريباً.', 'success');
                        this.reset();
                        fieldsToValidate.forEach(fieldId => {
                            const el = document.getElementById(fieldId);
                            if(el) clearError(el);
                        });

                        if (typeof gtag === 'function') {
                            gtag('event', 'form_submit', {
                                'event_category': 'Form',
                                'event_label': 'consultation'
                            });
                        }
                    } catch (error) {
                        console.error('Consultation form submission error:', error);
                        showFormStatusMessage(this, 'حدث خطأ أثناء إرسال النموذج. الرجاء المحاولة مرة أخرى لاحقاً.', 'error');
                    } finally {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                } else {
                    const firstInvalidField = this.querySelector('.form-control.error');
                    if (firstInvalidField) firstInvalidField.focus();
                }
            });
        }

        // Newsletter forms
        const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-large');
        newsletterForms.forEach(form => {
            form.setAttribute('novalidate', 'true');
            form.addEventListener('submit', async function(event) {
                event.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                if (!emailInput) return;
                clearError(emailInput);

                if (validators.email(emailInput.value.trim())) {
                    const submitButton = this.querySelector('button[type="submit"]');
                    if(!submitButton) return;
                    const originalButtonHTML = submitButton.innerHTML;
                    submitButton.disabled = true;
                    submitButton.innerHTML = 'جار الاشتراك...';

                    try {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
                        showFormStatusMessage(this, 'شكراً لاشتراكك في النشرة البريدية!', 'success');
                        this.reset();
                        
                        if (typeof gtag === 'function') {
                            gtag('event', 'newsletter_signup', {
                                'event_category': 'Newsletter',
                                'event_label': this.classList.contains('newsletter-form-large') ? 'main_newsletter' : 'footer_newsletter'
                            });
                        }
                    } catch (error) {
                        console.error('Newsletter submission error:', error);
                        showFormStatusMessage(this, 'حدث خطأ. حاول مرة أخرى.', 'error');
                    } finally {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonHTML;
                    }
                } else {
                    showError(emailInput, getErrorMessage('email', emailInput.value));
                    emailInput.focus();
                }
            });
        });
    };

    // Enhanced scroll animations
    const initScrollAnimations = () => {
        const animatedElements = document.querySelectorAll(
            '.service-card, .tourism-feature-card, .case-card, .feature-item, .team-member, .tech-card, .faq-item, .demo-intro-card, .demo-feature, .case-study-card, .tech-detail-card'
        );
        if (animatedElements.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible', 'fade-in');
                        obs.unobserve(entry.target);
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

        const toggleButtonVisibility = throttle(() => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
                backToTopButton.setAttribute('aria-hidden', 'false');
            } else {
                backToTopButton.classList.remove('visible');
                backToTopButton.setAttribute('aria-hidden', 'true');
            }
        }, 150); // Adjusted throttle limit

        window.addEventListener('scroll', toggleButtonVisibility, { passive: true });
        toggleButtonVisibility(); // Initial check

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (typeof gtag === 'function') {
                gtag('event', 'back_to_top_click', { 'event_category': 'Navigation' });
            }
        });
    };

    // Smooth scroll for anchor links
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.length > 1 && href.startsWith('#')) {
                    try {
                        const targetElement = document.querySelector(href);
                        if (targetElement) {
                            e.preventDefault();
                            const navbar = document.querySelector('.navbar');
                            const navbarHeight = navbar ? navbar.offsetHeight : 0;
                            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                            const offsetPosition = elementPosition - navbarHeight - 20;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                            
                            // Update URL hash carefully
                            if (history.pushState) {
                                history.pushState(null, '', href);
                            } else {
                                // Fallback for older browsers, might cause a jump
                                // window.location.hash = href; 
                                // Or, to avoid jump, update hash after scroll, but this is tricky
                                // setTimeout(() => { window.location.hash = href; }, 1000); // Example
                            }
                        }
                    } catch (error) {
                        // Catch invalid selectors, but don't break execution
                        console.warn('Smooth scroll target not found or invalid selector:', href, error);
                    }
                }
            });
        });
    };

    // Initialize all components
    try {
        initNavbar();
        initHeroCanvas();
        initFAQ();
        initForms();
        initScrollAnimations();
        initBackToTop();
        initSmoothScroll();
    } catch (error) {
        console.error("Error during component initialization:", error);
    }


    // Lazy load external scripts (if any, example was LinkedIn)
    const loadExternalScripts = () => {
        // Example:
        // if (document.querySelector('.some-widget-requiring-external-js')) {
        //     const script = document.createElement('script');
        //     script.src = 'https://example.com/widget.js';
        //     script.async = true;
        //     script.defer = true;
        //     document.head.appendChild(script);
        // }
    };

    window.addEventListener('load', () => {
        setTimeout(loadExternalScripts, 2500); // Delay further if not critical
    });

    console.log('[BrightAI] Enhanced JavaScript initialized successfully.');
});

// Add CSS for notifications and form messages dynamically
// Note: It's generally better to include this in your main CSS file for performance and maintainability.
// However, keeping it here as per the original structure.
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
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
        animation: fadeInNotification 0.5s ease-out;
    }
    @keyframes fadeInNotification {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
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
        transition: background-color 0.2s ease;
    }
    .update-btn:hover, .dismiss-btn:hover {
        background-color: #123458; /* Darker shade of secondary */
    }
    .dismiss-btn {
        background: transparent;
        color: var(--secondary-color, #0A192F);
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        font-size: 1.2rem;
        line-height: 1;
    }
    .dismiss-btn:hover {
        color: #000;
        background-color: rgba(0,0,0,0.1);
    }

    /* Form status messages */
    .form-status-message {
        padding: 1rem;
        border-radius: var(--border-radius, 8px);
        margin-bottom: 1rem; /* Space below message before form */
        text-align: center;
        font-family: 'Tajawal', Arial, sans-serif;
    }
    .form-status-message.success-message {
        background-color: #4CAF50; /* Green */
        color: white;
    }
    .form-status-message.error-message { /* For general form errors */
        background-color: #f44336; /* Red */
        color: white;
    }

    /* Field specific error messages */
    .error-message[data-for] { 
        color: #f44336;
        font-size: 0.85rem; /* Slightly smaller */
        margin-top: 0.3rem;
        font-family: 'Tajawal', Arial, sans-serif;
        display: block;
    }
    .form-control.error {
        border-color: #f44336 !important;
        box-shadow: 0 0 0 1px rgba(244, 67, 54, 0.5) !important; /* Thinner shadow */
    }
`;
document.head.appendChild(dynamicStyles);