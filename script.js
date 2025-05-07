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
            // If links are for sections on the same page, this would be useful.
            // For now, it just closes if it's a different page navigation.
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    // Check if it's an internal link (starts with #)
                    if (link.getAttribute('href').startsWith('#') || link.getAttribute('href').startsWith(window.location.pathname + '#')) {
                         // It's an internal link, smooth scroll will handle, then close.
                         // For now, just close immediately for simplicity as most are page links
                        closeMenu();
                    } else {
                        // It's a link to another page, allow default behavior, menu will close on page load.
                        // To be safe, ensure menu closes if user navigates away
                        // No need to explicitly close here as page will reload.
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
        });
    }

    // Hero Canvas Animation (Simple Particles)
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let particlesArray;

        const setCanvasSize = () => {
            heroCanvas.width = heroCanvas.offsetWidth;
            heroCanvas.height = heroCanvas.offsetHeight;
        };
        setCanvasSize(); // Initial size
        window.addEventListener('resize', setCanvasSize); // Adjust on resize

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
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 0.5;
                let x = (Math.random() * ((heroCanvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((heroCanvas.height - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * .4) - .2;
                let directionY = (Math.random() * .4) - .2;
                let color = 'rgba(100, 255, 218, 0.3)'; // --primary-color with alpha
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation loop
        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }
        
        initParticles();
        animateParticles();
        window.addEventListener('resize', () => {
            setCanvasSize();
            initParticles(); // Re-initialize particles for new canvas size
        });
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');

            // Optional: Close other open FAQs
            // faqQuestions.forEach(q => {
            //     q.classList.remove('active');
            //     q.setAttribute('aria-expanded', 'false');
            //     q.nextElementSibling.style.maxHeight = null;
            //     q.nextElementSibling.classList.remove('active');
            // });

            if (isActive) {
                question.classList.remove('active');
                question.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = null;
                answer.classList.remove('active');
            } else {
                question.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.classList.add('active');
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
        });
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Smooth scroll for all anchor links starting with #
    // Note: Native smooth scroll is good, but this ensures broader compatibility or finer control if needed.
    // However, current nav links are full page loads, so this is mainly for the back-to-top.
    // If you add internal page links (e.g. <a href="#services">), this will handle them:
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Make sure it's not just a hash for JS functionality or an empty hash
            if (href.length > 1 && document.querySelector(href)) { 
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });


    // Consultation Form Validation
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
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
                showError(name, 'الاسم مطلوب.');
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
                showError(phone, 'رقم الهاتف مطلوب.');
            } else if (!isValidPhone(phone.value.trim())) {
                isValid = false;
                showError(phone, 'الرجاء إدخال رقم هاتف صحيح.');
            }
            if (consultationTime.value === '') {
                isValid = false;
                showError(consultationTime, 'الرجاء اختيار وقت مفضل.');
            }
            if (message.value.trim() === '') {
                isValid = false;
                showError(message, 'الرسالة مطلوبة.');
            }

            if (isValid) {
                // Form is valid, you can submit it via AJAX or other method
                alert('شكراً لك! تم إرسال طلب الاستشارة بنجاح.');
                this.reset(); // Clear the form
            }
        });

        function showError(inputElement, message) {
            inputElement.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            inputElement.parentNode.appendChild(errorDiv);
        }

        function isValidEmail(email) {
            // Basic email validation regex
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        function isValidPhone(phone) {
            // Basic phone validation (e.g., at least 7 digits, allows +, spaces, dashes)
            return /^[+]?[\d\s-]{7,}$/.test(phone);
        }
    }

    // Newsletter Form Submission (Placeholder)
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-large');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim() !== '' && isValidEmail(emailInput.value.trim())) {
                alert('شكراً لاشتراكك في النشرة البريدية!');
                this.reset();
            } else if (emailInput) {
                alert('الرجاء إدخال بريد إلكتروني صحيح.');
                emailInput.focus();
            }
        });
    });
    
    function isValidEmail(email) { // Re-declare or scope if needed
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Intersection Observer for animations (simple fade-in)
    const animatedElements = document.querySelectorAll('.service-card, .tourism-feature-card, .case-card, .ai-reshape .service-card, .about-features .feature-item, .team-member, .metrics, .tech-card, .faq-item, .consultation-content, .consultation-form');

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible', 'fade-in'); // Add fade-in class for CSS animation
                observer.unobserve(entry.target); // Optional: stop observing once animated
            }
        });
    };

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of item visible
    };

    if (animatedElements.length > 0) {
        const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    }

});
