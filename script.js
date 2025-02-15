document.addEventListener('DOMContentLoaded', function () {
    // تفعيل الأسئلة الشائعة
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            // Toggle active class on the clicked item
            item.classList.toggle('active');

            // Close other open items if needed.
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle visibility of the clicked item's answer
            if (item.classList.contains('active')) {
                answer.style.display = 'block';
            } else {
                answer.style.display = 'none';
            }
        });
    });

    // Modal functionality for "About Us" section
    const readMoreBtn = document.querySelector('.read-more-btn');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModalBtn = document.querySelector('#aboutModal .close-modal');

    readMoreBtn.addEventListener('click', function () {
        aboutModal.style.display = 'block';
    });

    closeAboutModalBtn.addEventListener('click', function () {
         aboutModal.style.display = 'none';
    });

     window.addEventListener('click', function (event) {
        if (event.target ==  aboutModal) {
             aboutModal.style.display = "none";
        }
    });

    // Service details modal functionality
    const serviceCards = document.querySelectorAll('.service-card');
      serviceCards.forEach(card => {
        const learnMoreBtn = card.querySelector('.learn-more-btn');
          if(learnMoreBtn){
        learnMoreBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const serviceId = card.getAttribute('data-service');
            const serviceModal = document.getElementById(serviceId);
            if (serviceModal) {
              serviceModal.style.display = 'block';
            }
        });
          }
    });

    // Close service modal
      const closeServiceModalButtons = document.querySelectorAll('.service-modal .close-modal');
        closeServiceModalButtons.forEach(closeButton => {
        closeButton.addEventListener('click', (event) => {
            const serviceModal = closeButton.closest('.service-modal');
            if (serviceModal) {
                serviceModal.style.display = 'none';
            }
        });
    });
     window.addEventListener('click', function (event) {
        if (event.target.classList.contains('service-modal')) {
            event.target.style.display = 'none';
        }
    });
      const learnMoreButtons = document.querySelectorAll('.services .learn-more-btn');
        learnMoreButtons.forEach(button => {
        button.addEventListener('click', function (event) {
           event.preventDefault();
             const modalId = this.getAttribute('data-modal');
             const modal = document.getElementById(modalId);
        if (modal) {
               modal.style.display = 'block';
            }
        });
    });

     const closeButtons = document.querySelectorAll('.modal .close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
             const modal = this.closest('.modal');
           if(modal) {
              modal.style.display = 'none';
            }
        });
    });
    
     window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    // consultation form
    const consultationForm = document.getElementById('consultationForm');

    consultationForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent default form submission

      // Collect form data
        const formData = new FormData(consultationForm);
        const name = formData.get('fullName');
         const email = formData.get('email');
         const phone = formData.get('phone');
           const serviceType = formData.get('serviceType');
           const preferredDate = formData.get('preferredDate');
         const message = formData.get('message');

    // Log form data for now (replace with your submit logic)
        console.log('Form Data:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Phone:', phone);
        console.log('Service Type:', serviceType);
         console.log('Preferred Date:', preferredDate);
          console.log('Message:', message);

       alert('تم استلام طلب الاستشارة بنجاح. سيتم التواصل معك قريبًا.');

      consultationForm.reset();
    });

    // Handle all "Read More" button clicks
    const readMoreButtons = document.querySelectorAll('.learn-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal');
            if (modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'block';
                }
            }
        });
    });

    // Initialize animated background for robots section
    const canvas = document.getElementById('animated-bg-robots');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.radius = Math.random() * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();

    // تحسين تحميل الصور
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // تحسين الأداء على الأجهزة المحمولة
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // تعطيل بعض الأنيميشن على الموبايل
        document.querySelectorAll('.animate').forEach(el => {
            el.style.animation = 'none';
        });
        
        // تقليل عدد الجزيئات
        if (typeof particleCount !== 'undefined') {
            particleCount = Math.floor(particleCount / 2);
        }
    }

    // تحسين التفاعل مع القائمة على الموبايل
    const menuBtn = document.querySelector('.menu-btn');
    const navbar = document.querySelector('.navbar');
    
    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !menuBtn.contains(e.target)) {
                navbar.classList.remove('active');
            }
        });
    }

    // Initialize EmailJS
    (function() {
        emailjs.init("6IrzpNLO_7S2dD9sE");
    })();

    // Add 3D effect to newsletter container
    document.addEventListener('mousemove', function(e) {
        const container = document.querySelector('.newsletter-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = -(x - centerX) / 20;
        
        container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Handle form submission
    document.getElementById('subscribeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
        
        emailjs.sendForm('service_9t12lul', 'template_huc2yqy', this)
            .then(function() {
                if (loading) loading.style.display = 'none';
                alert('تم الاشتراك بنجاح!');
                e.target.reset();
            }, function(error) {
                if (loading) loading.style.display = 'none';
                alert('حدث خطأ في الإرسال');
                console.log(error);
            });
    });

});

// Use requestIdleCallback for non-critical operations
const deferredInit = () => {
    // Move non-critical initializations here
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initializeAnimations();
            initializeLazyLoading();
        });
    } else {
        setTimeout(() => {
            initializeAnimations();
            initializeLazyLoading();
        }, 1);
    }
};

// Optimize event listeners
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

// Optimize scroll handlers
const optimizedScroll = debounce(() => {
    // Existing scroll handling code
}, 16);

window.addEventListener('scroll', optimizedScroll, { passive: true });

// Optimize animations with requestAnimationFrame
const animate = () => {
    // Existing animation code
    requestAnimationFrame(animate);
};

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Critical initializations
    
    // Defer non-critical operations
    deferredInit();
    
    // Start optimized animations
    requestAnimationFrame(animate);
});

window.addEventListener('load', function () {
    // Array of canvas IDs
    const canvasIds = [
        'animated-bg-hero',
        'animated-bg-services',
        'animated-bg-about',
        'animated-bg-stats',
        'animated-bg-testimonials',
        'animated-bg-faq',
        'animated-bg-partners',
        'animated-bg-newsletter',
        'animated-bg-footer',
        'animated-bg-ai-development',
        'animated-bg-nlp',
        'animated-bg-ml',
        'animated-bg-cv',
        'animated-bg-process-automation',
        'animated-bg-data-analytics',
        'animated-bg-ai-consultations',
         'animated-bg-ar-vr',
          'animated-bg-digital-library',
           'animated-bg-consultation-form',
           'animated-bg-banner'
    ];

    canvasIds.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions to match parent container
         canvas.width = window.innerWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        let particlesArray = [];

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
                if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                   this.directionY = -this.directionY;
                }

                this.x += this.directionX;
                this.y += this.directionY;

                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 3 + 1;
                 let x = Math.random() * (canvas.width - size * 2) + size;
                 let y = Math.random() * (canvas.height - size * 2) + size;
                let directionX = Math.random() * 2 - 1;
                let directionY = Math.random() * 2 - 1;
                let color = '#ffffff';

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            requestAnimationFrame(animate);
        }

        // Resize canvas and redraw particles on window resize
        window.addEventListener('resize', function () {
            canvas.width = window.innerWidth;
           canvas.height = canvas.parentElement.offsetHeight;
            init();
        });

        init();
        animate();
    });

    // Initialize particles for AI Agents section
    const agentsCanvas = document.getElementById('agents-particles');
    const agentsCtx = agentsCanvas.getContext('2d');

    function initAgentsCanvas() {
        agentsCanvas.width = window.innerWidth;
        agentsCanvas.height = document.querySelector('.ai-agents').offsetHeight;
    }

    // Call this function when the page loads and on resize
    window.addEventListener('load', initAgentsCanvas);
    window.addEventListener('resize', initAgentsCanvas);

    // Add particles animation code here similar to the existing banner animation
});
