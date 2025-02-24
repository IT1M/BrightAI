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
    const readMoreButtonsAbout = document.querySelectorAll('.read-more-btn');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModalBtn = document.querySelector('#aboutModal .close-modal');

    readMoreButtonsAbout.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);

            if(modal){
                modal.style.display = 'block';

                // حساب موقع الزر
                const rect = this.getBoundingClientRect();
                const buttonTop = rect.top + window.scrollY;
                const buttonLeft = rect.left + window.scrollX;


                // تحديد موقع محتوى النافذة المنبثقة
                const modalContent = modal.querySelector('.modal-content');

                modalContent.style.top = `${buttonTop}px`;
                modalContent.style.left = `${buttonLeft}px`;
            }
        });
    });

    if(closeAboutModalBtn){ // التأكد من وجود الزر قبل إضافة المستمع
      closeAboutModalBtn.addEventListener('click', function () {
          aboutModal.style.display = 'none';
      });
    }


     window.addEventListener('click', function (event) {
        if (event.target ==  aboutModal) {
             aboutModal.style.display = "none";
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

    // Handle all "Read More" button clicks for services section
    const readMoreButtonsServices = document.querySelectorAll('.learn-more-btn');
    readMoreButtonsServices.forEach(button => {
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

    // تحسين مؤشرات الصفحات
    document.addEventListener('DOMContentLoaded', function() {
        // تحديد الصفحة الحالية
        const currentLocation = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar li a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentLocation) {
                link.classList.add('active');
            }
            
            // إضافة مؤشر التحميل عند النقر
            link.addEventListener('click', function(e) {
                // إزالة الفئة النشطة من جميع الروابط
                navLinks.forEach(l => l.classList.remove('active'));
                // إضافة الفئة النشطة للرابط المنقور
                this.classList.add('active');
                
                // إظهار مؤشر التحميل
                const loadingIndicator = document.createElement('span');
                loadingIndicator.className = 'loading-indicator';
                loadingIndicator.style.cssText = `
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    margin-right: 5px;
                    animation: pulse 1s infinite;
                `;
                
                this.prepend(loadingIndicator);
                
                // إزالة مؤشر التحميل بعد انتهاء التحميل
                setTimeout(() => {
                    loadingIndicator.remove();
                }, 500);
            });
        });
        
        // إضافة تأثير التحميل
        const style = document.createElement('style');
        style.text
    });

    // تحسين تحميل الصور
    const serviceImages = document.querySelectorAll('.service-image');
    
    serviceImages.forEach(img => {
        // التأكد من تحميل الصورة
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                img.classList.add('loaded');
            });
        }
        
        // معالجة حالة فشل تحميل الصورة
        img.addEventListener('error', function() {
            img.src = 'fallback-image.jpg'; // صورة احتياطية
            img.classList.add('loaded');
        });
    });
    
    // ...existing code...
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
                let color = '#0A192F'; // Changed color here

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

// ...existing code...

// ...existing code...

// فتح وإغلاق النوافذ المنبثقة
document.addEventListener('DOMContentLoaded', () => {
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');

     // دالة لفتح النافذة المنبثقة
    function openModal(modalId, buttonPosition) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';

            // تحديد موقع النافذة المنبثقة بناءً على موقع الزر
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.position = 'absolute';
            modalContent.style.top = `${buttonPosition.top}px`;
            modalContent.style.left = `${buttonPosition.left}px`;

             // إضافة فئة "active" إلى عنصر القائمة المرتبط
            const serviceItem = document.querySelector(`[data-modal="${modalId}"]`);
            if(serviceItem){
                serviceItem.classList.add('active');
            }
        }
    }

    // دالة لإغلاق النافذة المنبثقة
    function closeModal(modal) {
        modal.style.display = 'none';
          // إزالة الفئة "active"
          const serviceItemId = modal.id;
          const serviceItem = document.querySelector(`[data-modal="${serviceItemId}"]`);
          if(serviceItem){
            serviceItem.classList.remove('active');
          }
    }

    // ربط الأحداث
    learnMoreButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = button.dataset.modal;

        // حساب موقع الزر
        const rect = button.getBoundingClientRect();
        const buttonPosition = {
            top: rect.top + window.scrollY,  // إضافة window.scrollY لحساب الإزاحة
            left: rect.left + window.scrollX, // إضافة window.scrollX
        };


        openModal(modalId, buttonPosition);

    });
});

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target == modal) {
                closeModal(modal);
            }
        });
    });
     // إضافة حدث النقر إلى عناصر القائمة لفتح النوافذ المنبثقة
     const serviceItems = document.querySelectorAll('.service-item');
     serviceItems.forEach(item =>{
        item.addEventListener('click', (e) =>{
            const modalId = item.dataset.service;
            if(modalId){
                 // حساب موقع العنصر
                const rect = item.getBoundingClientRect();
                const itemPosition = {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                };
                openModal(modalId, itemPosition);
            }
        })
     })
});
        // إضافة مراقب للتمرير لتحريك البطاقات
        const cards = document.querySelectorAll('.service-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        cards.forEach(card => {
            observer.observe(card);
        });

        // تحسين تحميل الصور
        document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img[loading="lazy"]');
            if ('loading' in HTMLImageElement.prototype) {
                images.forEach(img => {
                    img.src = img.src;
                });
            } else {
                // Fallback for browsers that don't support lazy loading
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
                document.body.appendChild(script);
            }
        });

// إضافة الرسم المتحرك للتقنية
function initTechCanvas() {
    const canvas = document.getElementById('techCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;

    // تعيين حجم Canvas
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    // إنشاء جزيئة
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.radius = Math.random() * 2 + 1;
            this.originalRadius = this.radius;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#64FFDA';
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // ارتداد من الحدود
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // رسم خطوط للجزيئات القريبة
            particles.forEach(particle => {
                const dx = this.x - particle.x;
                const dy = this.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 255, 218, ${0.2 * (1 - distance/100)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(particle.x, particle.y);
                    ctx.stroke();
                }
            });

            this.draw();
        }
    }

    // تهيئة الجزيئات
    function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // تحريك الرسم
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => particle.update());
        requestAnimationFrame(animate);
    }

    // تحديث الحجم عند تغيير حجم النافذة
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    init();
    animate();
}

// تشغيل الرسم المتحرك عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initTechCanvas();
});

// تحسين تفاعلات شريط التنقل
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navLinks = document.querySelectorAll('.navbar li a');
    let lastScrollTop = 0;

    // التعامل مع زر القائمة
    navbarToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        navbarToggle.classList.toggle('open');
        navbar.classList.toggle('active');
        
        // منع التمرير عندما تكون القائمة مفتوحة
        document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (navbar.classList.contains('active') && 
            !navbar.contains(e.target) && 
            !navbarToggle.contains(e.target)) {
            navbar.classList.remove('active');
            navbarToggle.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // إغلاق القائمة عند النقر على الروابط
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            navbarToggle.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // إخفاء/إظهار شريط التنقل عند التمرير
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const nav = document.querySelector('nav');
        
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // التمرير للأسفل
            nav.style.transform = 'translateY(-100%)';
        } else {
            // التمرير للأعلى
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScroll;
    });
}

// إضافة الفئة النشطة للرابط الحالي
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar li a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// تهيئة التنقل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    setActiveNavLink();
});

// Enhanced Navbar Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navbarContainer = document.querySelector('.navbar-container');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle mobile menu
    mobileMenuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Add scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbarContainer.classList.add('scrolled');
        } else {
            navbarContainer.classList.remove('scrolled');
        }
    });

    // Add active state to current page link
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
});

// Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle?.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Handle navbar scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.main-navbar');
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 25, 47, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#0A192F';
            navbar.style.backdropFilter = 'none';
        }

        lastScroll = currentScroll;
    });
});

// تحسين أداء Navbar
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.main-navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const searchInput = document.querySelector('.nav-search input');

    // تفعيل/تعطيل القائمة في الشاشات الصغيرة
    menuToggle?.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // إضافة تأثير الشفافية عند التمرير
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 25, 47, 0.95)';
        } else {
            navbar.style.background = '#0A192F';
        }
        
        lastScroll = currentScroll;
    });

    // تفعيل البحث
    searchInput?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            // يمكن إضافة وظيفة البحث هنا
            console.log('Searching for:', searchInput.value);
        }
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
});

// تحسين وظيفة التنقل للموبايل
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // منع التمرير عند فتح القائمة
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // إغلاق القائمة عند النقر على أي رابط
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});

// تحسين التفاعل مع قائمة الموبايل
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // منع التمرير عند فتح القائمة
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // تحسين تحميل الصور
    const lazyImages = document.querySelectorAll('.lazy-image');
    
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
});

// FAQ Functionality
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const title = item.querySelector('h3');
        
        title.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// ...existing code...