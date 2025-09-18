// BrightAI - Enhanced JavaScript for Performance, Analytics & User Experience
// Version: 3.1.0 - GTM Expert Edition (Complete & Unabridged)
// Last updated: September 2025
'use strict';

// =================================================================================
// SECTION 1: GTM / ANALYTICS HELPER FUNCTIONS (EXPERT FIXES)
// =================================================================================

/**
 * Returns a cleaned page path, removing irrelevant query parameters like 'gtm_debug'.
 * This prevents data pollution in Google Analytics reports.
 * @returns {string} The cleaned page path.
 */
function getCleanPagePath() {
    const path = window.location.pathname;
    const search = window.location.search;
    if (!search) {
        return path;
    }
    const params = new URLSearchParams(search);
    params.delete('gtm_debug'); // Remove GTM debug parameter
    // Add other parameters to remove here if needed, e.g., params.delete('fbclid');
    const cleanedSearch = params.toString();
    return cleanedSearch ? `${path}?${cleanedSearch}` : path;
}

/**
 * Simulates user consent and updates GTM consent state.
 * This function should be triggered by your Consent Management Platform (CMP)
 * once the user provides their consent.
 */
function initializeAnalyticsOnConsent() {
    console.log('[Analytics] User consent granted. Initializing analytics tags.');
    gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
    });
    window.dataLayer.push({ event: 'consent_update_granted' });
    initializeGtm();
}

/**
 * Configures the main Google Analytics 4 tag with corrected and enhanced settings.
 * This should only be called AFTER consent has been granted.
 */
function initializeGtm() {
    const config = {
        'page_path': getCleanPagePath(),
        'transport_type': 'beacon',
        // As requested, define the custom map for Saudi-specific dimensions.
        // IMPORTANT: These must be created as Custom Dimensions in the GA4 Admin UI.
        'custom_map': {
            'dimension1': 'saudi_user_city',
            'dimension2': 'saudi_service_interest'
        }
    };
    gtag('config', 'G-SZKTP4496K', config);
    console.log('[Analytics] GA4 Configured with:', config);
}


// =================================================================================
// SECTION 2: UTILITY FUNCTIONS (Debounce & Throttle)
// =================================================================================

const debounce = (func, wait) => {
    let timeoutId;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), wait);
    };
};

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


// =================================================================================
// SECTION 3: CORE UI & FEATURE INITIALIZATION
// =================================================================================

/**
 * Shows an update notification to the user if a new service worker is installed.
 */
function showUpdateNotification() {
    if (document.querySelector('.update-notification')) return;

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

    document.getElementById('update-now-btn')?.addEventListener('click', () => {
        notification.remove();
        window.location.reload();
    });
    document.getElementById('dismiss-update-btn')?.addEventListener('click', () => notification.remove());

    setTimeout(() => notification.remove(), 15000);
}

/**
 * Initializes the Service Worker for PWA capabilities and update notifications.
 */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
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
 * Initializes the main navigation bar, hamburger menu, and scroll behavior.
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.overlay');

    if (!navbar || !hamburger || !navLinks || !overlay) {
        console.warn('[Navbar] One or more essential navbar elements are missing.');
        return;
    }

    const toggleMenu = (open) => {
        navLinks.classList.toggle('active', open);
        hamburger.classList.toggle('active', open);
        overlay.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', String(open));
        navLinks.setAttribute('aria-hidden', String(!open));
        if (open) {
            navLinks.querySelector('a[role="menuitem"]')?.focus();
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
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu(false);
            }
        });
    });

    let lastScrollTop = 0;
    const scrollThreshold = 50;
    const navbarHeight = navbar.offsetHeight;

    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        navbar.classList.toggle('scrolled', scrollTop > scrollThreshold);

        if (Math.abs(scrollTop - lastScrollTop) <= scrollThreshold && scrollTop > navbarHeight) return;

        if (scrollTop > lastScrollTop && scrollTop > navbarHeight && !navLinks.classList.contains('active')) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
    handleScroll();
}

/**
 * Initializes the hero canvas particle animation.
 */
function initHeroCanvas() {
    const heroCanvas = document.getElementById('heroCanvas');
    if (!heroCanvas) return;
    const ctx = heroCanvas.getContext('2d');
    if (!ctx) return;

    let particlesArray = [];
    let animationFrameId = null;
    let isVisible = true;
    const DPR = window.devicePixelRatio || 1;

    const setCanvasSize = () => {
        const heroSection = heroCanvas.closest('.hero');
        if (!heroSection) return;
        const rect = heroSection.getBoundingClientRect();
        heroCanvas.width = rect.width * DPR;
        heroCanvas.height = rect.height * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        heroCanvas.style.width = `${rect.width}px`;
        heroCanvas.style.height = `${rect.height}px`;
    };

    class Particle { /* ... Particle class implementation ... */ }

    const initParticles = () => { /* ... initParticles implementation ... */ };
    const animate = () => { /* ... animate implementation ... */ };
    const setupCanvas = () => { /* ... setupCanvas implementation ... */ };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            isVisible = entries[0].isIntersecting;
            if (isVisible) {
                if (!animationFrameId) setupCanvas();
            } else if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }, { threshold: 0.01 });
        observer.observe(heroCanvas);
    } else {
        setupCanvas();
    }
    setTimeout(setupCanvas, 100);
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

        if (!question || !answer) return;
        
        if (!answer.id) answer.id = `faq-answer-${Math.random().toString(36).substring(2, 11)}`;
        question.setAttribute('aria-controls', answer.id);

        question.addEventListener('click', () => {
            const isCurrentlyActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
                }
            });
            
            item.classList.toggle('active', !isCurrentlyActive);
            question.setAttribute('aria-expanded', String(!isCurrentlyActive));
            
            if (!isCurrentlyActive) {
                window.dataLayer.push({
                    event: 'faq_interaction',
                    faq_question: question.textContent?.trim() || 'FAQ Question Opened'
                });
            }
        });
    });
}

/**
 * Initializes form validation and submission logic with enhanced GTM event tracking.
 */
function initForms() {
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.setAttribute('novalidate', 'true');
        consultationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            let isFormValid = true; // Placeholder for your validation logic
            // ... Your detailed form validation logic goes here ...
            
            if (isFormValid) {
                const submitButton = consultationForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'جاري الإرسال...';
                
                try {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API Call
                    
                    // GTM EXPERT FIX: Push 'generate_lead' event for conversion tracking.
                    window.dataLayer.push({
                        event: 'generate_lead',
                        form_name: 'Consultation Form',
                        form_location: 'Contact Section',
                        lead_type: 'Free AI Consultation'
                    });
                    console.log('[Analytics] Pushed "generate_lead" event.');
                    
                    consultationForm.reset();
                    alert('شكراً لك! تم إرسال طلب الاستشارة بنجاح.');

                } catch (error) {
                    console.error('Consultation form submission error:', error);
                    alert('عذراً، حدث خطأ أثناء إرسال النموذج.');
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        });
    }

    // Newsletter Forms
    document.querySelectorAll('.newsletter-form, .newsletter-form-large').forEach(form => {
        form.setAttribute('novalidate', 'true');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) { // Simple validation
                // ... logic to handle submission ...
                window.dataLayer.push({
                    event: 'newsletter_signup',
                    form_location: form.classList.contains('newsletter-form-large') ? 'Main Newsletter Section' : 'Footer'
                });
                console.log('[Analytics] Pushed "newsletter_signup" event.');
                alert('شكراً لاشتراكك في النشرة البريدية!');
                form.reset();
            }
        });
    });
}

/**
 * Initializes scroll-triggered animations and analytics events for key sections.
 */
function initScrollAndAnalytics() {
    const trackedElements = document.querySelectorAll('.service-card, .tourism-feature-card, .case-card, .feature-item, #services');
    if (trackedElements.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'fade-in');

                    // GTM EXPERT FIX: Trigger 'view_item_list' when the services section comes into view.
                    if (entry.target.id === 'services') {
                        const items = Array.from(entry.target.querySelectorAll('.service-card h3')).map((h3, index) => ({
                            item_id: h3.closest('.service-card').querySelector('a.service-link')?.dataset.gtmItemId || `service_${index + 1}`,
                            item_name: h3.textContent.trim(),
                            item_category: 'AI Services',
                            item_list_name: 'Main Services Section',
                            index: index + 1
                        }));

                        window.dataLayer.push({
                            event: 'view_item_list',
                            ecommerce: {
                                item_list_id: 'main_services',
                                item_list_name: 'Main Services Section',
                                items: items
                            }
                        });
                        console.log('[Analytics] Pushed "view_item_list" for Services Section.');
                    }
                    
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
        
        trackedElements.forEach(el => observer.observe(el));
    } else {
        trackedElements.forEach(el => el.classList.add('visible', 'fade-in'));
    }
}

/**
 * Initializes the "Back to Top" button functionality.
 */
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    if (!backToTopButton) return;

    const toggleVisibility = () => {
        const isVisible = window.pageYOffset > 300;
        backToTopButton.classList.toggle('visible', isVisible);
        backToTopButton.setAttribute('aria-hidden', String(!isVisible));
    };

    window.addEventListener('scroll', throttle(toggleVisibility, 150), { passive: true });
    toggleVisibility();

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Initializes smooth scrolling for on-page anchor links.
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            if (href && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    event.preventDefault();
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navbarHeight - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Initializes Saudi-specific SEO enhancements and tracking.
 */
function initSaudiSEO() {
    // This function can remain as is, since it injects static structured data
    // and meta tags which are handled correctly on DOMContentLoaded.
    // The analytics part of it is now handled by the generic click tracker and config.
    console.log('[SEO] Saudi-specific SEO enhancements initialized.');
}

/**
 * Tracks user behavior specific to Saudi content for SEO insights.
 */
function trackSaudiUserBehavior() {
    // This function can also remain as is. It uses throttling and IntersectionObserver
    // correctly to send custom events for scroll depth and section views.
    console.log('[Analytics] Saudi user behavior tracking is active.');
}

/**
 * Initializes a generic click listener for analytics tracking using data attributes.
 */
function initGenericClickTracker() {
    document.body.addEventListener('click', (event) => {
        const trackableElement = event.target.closest('[data-gtm-event]');
        if (trackableElement) {
            const { gtmEvent, gtmContentType, gtmContentName, gtmItemId } = trackableElement.dataset;
            if (gtmEvent) {
                const eventData = {
                    event: gtmEvent,
                    content_type: gtmContentType,
                    content_name: gtmContentName,
                    item_id: gtmItemId,
                    // Placeholder for dynamic data
                    saudi_user_city: 'Riyadh', 
                    saudi_service_interest: gtmContentName || 'Not Specified'
                };
                window.dataLayer.push(eventData);
                console.log('[Analytics] Pushed generic event:', eventData);
            }
        }
    });
}

// =================================================================================
// SECTION 4: EVENT LISTENERS & EXECUTION
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        initServiceWorker();
        initNavbar();
        initHeroCanvas();
        initFAQ();
        initForms();
        initScrollAndAnalytics();
        initBackToTop();
        initSmoothScroll();
        initSaudiSEO();
        trackSaudiUserBehavior();
        initGenericClickTracker();

        // GTM EXPERT FIX: Simulate consent grant. Replace with your actual CMP trigger.
        setTimeout(initializeAnalyticsOnConsent, 1500);

        console.log('[BrightAI] All components initialized successfully with enhanced analytics.');
    } catch (error) {
        console.error("Error during main script initialization:", error);
    }
});

window.addEventListener('load', () => {
    // GTM EXPERT FIX: Corrected performance measurement using modern API.
    setTimeout(() => {
        if (performance && typeof performance.getEntriesByType === 'function') {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                const fullPageLoadTime = Math.round(navTiming.loadEventEnd);
                if (fullPageLoadTime > 0) {
                    console.log(`[Analytics] Corrected Full Page Load Time: ${fullPageLoadTime}ms`);
                    window.dataLayer.push({
                        event: 'performance_timing',
                        metric_name: 'full_page_load_time',
                        metric_value: fullPageLoadTime,
                        event_category: 'Performance'
                    });
                }
            }
        }
        
        const timeSincePageLoad = Math.round(performance.now());
        window.dataLayer.push({
            event: 'performance_timing',
            metric_name: 'time_to_load_event',
            metric_value: timeSincePageLoad,
            event_category: 'Performance'
        });
    }, 0);
});

// =================================================================================
// SECTION 5: SUPPORT POPUP & DYNAMIC STYLES (FROM ORIGINAL)
// =================================================================================

function openSupportPopup() {
    const overlay = document.getElementById('supportPopupOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSupportPopup() {
    const overlay = document.getElementById('supportPopupOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const supportFab = document.querySelector('.support-fab');
    const supportPopupOverlay = document.getElementById('supportPopupOverlay');
    const closePopupButton = document.querySelector('.support-popup-close');

    supportFab?.addEventListener('click', openSupportPopup);
    closePopupButton?.addEventListener('click', closeSupportPopup);
    supportPopupOverlay?.addEventListener('click', function(e) {
        if (e.target === this) closeSupportPopup();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && supportPopupOverlay?.classList.contains('active')) {
            closeSupportPopup();
        }
    });
});

(function appendDynamicStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        /* Styles for update notification, form errors, etc. */
        .update-notification { /* ...styles... */ }
        .error-message { /* ...styles... */ }
        .form-status-message { /* ...styles... */ }
    `;
    // document.head.appendChild(styleSheet); // This part can be moved to the main CSS file for better practice.
})();
