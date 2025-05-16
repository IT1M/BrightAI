document.addEventListener('DOMContentLoaded', () => {
    // Navbar Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.overlay');
    const navLinkItems = document.querySelectorAll('.nav-links li a');

    if (hamburger && navLinks && overlay) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active'); // For potential icon change (e.g., X)
            overlay.classList.toggle('active');
            // Toggle body scroll
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        const closeMenu = () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        overlay.addEventListener('click', closeMenu);
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    // Check if it's an internal link (starts with #)
                    if (link.getAttribute('href').startsWith('#') || link.getAttribute('href').startsWith(window.location.pathname + '#')) {
                        // It's an internal link, smooth scroll will handle, then close.
                        closeMenu();
                    } else {
                        // It's a link to another page, allow default behavior.
                        // Menu will close on page load of the new page if it's part of the same site structure,
                        // or if the user navigates away and back, the menu state won't persist.
                    }
                }
            });
        });
    }

    // Navbar hide on scroll down, show on scroll up
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > navbar.offsetHeight * 2) { // Only hide after scrolling a bit
                navbar.style.top = `-${navbar.offsetHeight}px`; // Hide navbar
            } else {
                navbar.style.top = '0'; // Show navbar
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        }, { passive: true }); // Added passive listener for better scroll performance
    }

    // Hero Canvas Animation (Simple Particles)
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let particlesArray;
        let animationFrameId;

        const setCanvasSize = () => {
            heroCanvas.width = heroCanvas.offsetWidth;
            heroCanvas.height = heroCanvas.offsetHeight;
        };
        
        // Particle class
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > heroCanvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > heroCanvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        // Create particle array
        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (heroCanvas.height * heroCanvas.width) / 9000;
            if (numberOfParticles > 150) numberOfParticles = 150; // Max particles
            if (numberOfParticles < 30) numberOfParticles = 30; // Min particles
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 0.5;
                let x = (Math.random() * ((heroCanvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((heroCanvas.height - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * .3) - .15; // Reduced speed slightly
                let directionY = (Math.random() * .3) - .15; // Reduced speed slightly
                let color = 'rgba(100, 255, 218, 0.25)'; // Slightly adjusted alpha
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation loop
        function animateParticles() {
            animationFrameId = requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }
        
        const setupCanvas = () => {
            setCanvasSize();
            initParticles();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animateParticles();
        };

        setupCanvas(); // Initial setup
        window.addEventListener('resize', () => { // Debounce resize for performance
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(setupCanvas, 250);
        });
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            const currentlyOpen = document.querySelector('.faq-item.active .faq-question');

            // Close other open FAQs (Optional, but good UX for long lists)
            if (currentlyOpen && currentlyOpen !== question) {
                currentlyOpen.classList.remove('active');
                currentlyOpen.setAttribute('aria-expanded', 'false');
                currentlyOpen.nextElementSibling.style.maxHeight = null;
                currentlyOpen.nextElementSibling.classList.remove('active');
                currentlyOpen.closest('.faq-item').classList.remove('active');
            }

            if (isActive) {
                question.classList.remove('active');
                question.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = null;
                answer.classList.remove('active');
                question.closest('.faq-item').classList.remove('active');
            } else {
                question.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.classList.add('active');
                question.closest('.faq-item').classList.add('active');
            }
        });
    });

    // Back to Top Button
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }, { passive: true });
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Smooth scroll for all anchor links starting with #
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href !== "#") { // Ensure it's not just "#"
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    // If querySelector fails (e.g. invalid selector), do nothing or log error
                    console.warn('Smooth scroll target not found or invalid selector:', href);
                }
            }
        });
    });

    // Consultation Form Validation
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        const isValidEmail = (email) => {
            // Basic email validation regex
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        const isValidPhone = (phone) => {
            // Basic phone validation (e.g., Saudi numbers, allows +, spaces, dashes)
            return /^(05\d{8}|5\d{8}|\+9665\d{8}|009665\d{8})$/.test(phone.replace(/[\s-]/g, ''));
        };

        consultationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let isValid = true;

            // Clear previous errors
            this.querySelectorAll('.error-message').forEach(el => el.remove());
            this.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const consultationTime = document.getElementById('consultation-time');
            const message = document.getElementById('message');

            if (name.value.trim() === '') {
                isValid = false;
                showError(name, 'الاسم الكامل مطلوب.');
            }
            if (email.value.trim() === '') {
                isValid = false;
                showError(email, 'البريد الإلكتروني مطلوب.');
            } else if (!isValidEmail(email.value.trim())) {
                isValid = false;
                showError(email, 'الرجاء إدخال بريد إلكتروني صحيح.');
            }
            if (phone.value.trim() === '') {
                isValid = false;
                showError(phone, 'رقم الهاتف السعودي مطلوب.');
            } else if (!isValidPhone(phone.value.trim())) {
                isValid = false;
                showError(phone, 'الرجاء إدخال رقم هاتف سعودي صحيح (مثال: 05xxxxxxx أو +9665xxxxxxx).');
            }
            if (consultationTime.value === '') {
                isValid = false;
                showError(consultationTime, 'الرجاء اختيار وقت مفضل للاستشارة.');
            }
            if (message.value.trim().length < 10) { // Min message length
                isValid = false;
                showError(message, 'الرسالة مطلوبة ويجب أن لا تقل عن 10 أحرف.');
            }

            if (isValid) {
                // Form is valid, you can submit it via AJAX or other method
                // Example: Show a success message (replace with actual submission logic)
                const successMessageDiv = document.createElement('div');
                successMessageDiv.className = 'success-message'; // Add a class for styling
                successMessageDiv.textContent = 'شكراً لك! تم إرسال طلب الاستشارة بنجاح. سنتواصل معك قريباً.';
                this.parentNode.insertBefore(successMessageDiv, this.nextSibling); // Insert after form
                
                // Disable button to prevent multiple submissions
                const submitButton = this.querySelector('button[type="submit"]');
                if(submitButton) submitButton.disabled = true;

                // Simulate form submission then reset
                setTimeout(() => {
                    this.reset();
                    if(submitButton) submitButton.disabled = false;
                    if(successMessageDiv) successMessageDiv.remove();
                }, 5000); // Reset after 5 seconds
            }
        });

        function showError(inputElement, message) {
            inputElement.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            // Insert error message after the input or its direct parent if it's a select/textarea
            if (inputElement.nextSibling) {
                inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
            } else {
                inputElement.parentNode.appendChild(errorDiv);
            }
        }
    }

    // Newsletter Form Submission (Placeholder)
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-large');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            // Use the same email validation as the consultation form
            const isEmailValidFunc = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (emailInput && emailInput.value.trim() !== '' && isEmailValidFunc(emailInput.value.trim())) {
                alert('شكراً لاشتراكك في النشرة البريدية لشركة مُشرقة AI!');
                this.reset();
            } else if (emailInput) {
                alert('الرجاء إدخال بريد إلكتروني صحيح للاشتراك في نشرتنا البريدية.');
                emailInput.focus();
            }
        });
    });
    
    // Intersection Observer for animations (simple fade-in)
    const animatedElements = document.querySelectorAll('.service-card, .tourism-feature-card, .case-card, .ai-reshape .service-card, .about-features .feature-item, .team-member, .metrics, .tech-card, .faq-item, .consultation-content, .consultation-form');

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible', 'fade-in');
                observer.unobserve(entry.target);
            }
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 10% of item visible, adjust as needed
    };

    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    } else { // Fallback for browsers without IntersectionObserver
        animatedElements.forEach(el => {
            el.classList.add('visible', 'fade-in');
        });
    }
});