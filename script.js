const domCache = {
    canvas: null,
    ctx: null,
    navbar: null,
    hamburger: null,
    navLinks: null,
    overlay: null,
    heroSection: null,
    backToTop: null
};

// تهيئة الكاش عند تحميل الصفحة
function initDOMCache() {
    domCache.canvas = document.getElementById('heroCanvas');
    domCache.ctx = domCache.canvas?.getContext('2d');
    domCache.navbar = document.querySelector('.navbar');
    domCache.hamburger = document.querySelector('.hamburger');
    domCache.navLinks = document.querySelector('.nav-links');
    domCache.overlay = document.querySelector('.overlay');
    domCache.heroSection = document.getElementById('home');
    domCache.backToTop = document.querySelector('.back-to-top');
}

// تحسين أداء الرسم على canvas
function optimizeCanvasForMobile() {
    if (!domCache.canvas) return;
    
    const isMobile = window.innerWidth <= 768;
    const dpr = window.devicePixelRatio || 1;
    
    // تعيين حجم Canvas مع مراعاة كثافة البكسل
    domCache.canvas.width = domCache.heroSection.offsetWidth * dpr;
    domCache.canvas.height = domCache.heroSection.offsetHeight * dpr;
    domCache.canvas.style.width = `${domCache.heroSection.offsetWidth}px`;
    domCache.canvas.style.height = `${domCache.heroSection.offsetHeight}px`;
    
    // تحسين السياق
    if (domCache.ctx) { // إضافة تحقق إضافي
        domCache.ctx.scale(dpr, dpr);
        domCache.ctx.imageSmoothingEnabled = false;
    }
    
    return {
        particleCount: isMobile ? 30 : 100,
        connectionDistance: isMobile ? 80 : 150,
        particleSize: isMobile ? 1.5 : 2,
        frameSkip: isMobile ? 2 : 1
    };
}

// تحسين معالج التمرير مع throttling
let scrollTimeout;
function throttleScroll(callback, limit = 150) {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            callback();
            scrollTimeout = null;
        }, limit);
    }
}

// معالج التمرير المحسن
function handleScroll() {
    throttleScroll(() => {
        const scrollY = window.scrollY;
        
        // تحديث شريط التنقل
        if (domCache.navbar) {
            domCache.navbar.classList.toggle('scrolled', scrollY > 100);
        }
        
        // تحديث زر العودة للأعلى
        if (domCache.backToTop) {
            domCache.backToTop.classList.toggle('visible', scrollY > 500);
        }
        
        // تنفيذ animateOnScroll إذا كان موجوداً
        if (typeof animateOnScroll === 'function') {
            animateOnScroll();
        }
    });
}

// تحسين معالجة القائمة المتنقلة
function setupMobileMenu() {
    if (!domCache.hamburger || !domCache.navLinks || !domCache.overlay) return;
    
    let isAnimating = false;
    
    domCache.hamburger.addEventListener('click', (e) => {
        e.preventDefault(); // منع أي سلوك افتراضي غير مرغوب فيه
        if (isAnimating) return;
        isAnimating = true;
        
        requestAnimationFrame(() => {
            domCache.navLinks.classList.toggle('active');
            domCache.overlay.classList.toggle('active');
            const isActive = domCache.navLinks.classList.contains('active'); // تخزين حالة القائمة
            domCache.hamburger.innerHTML = isActive ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            document.body.classList.toggle('menu-open', isActive); // إضافة/إزالة كلاس لـ body
            
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        });
    }, { passive: true });

    // إغلاق القائمة عند النقر على أي رابط داخل القائمة
    domCache.navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && domCache.navLinks.classList.contains('active')) {
            closeMobileMenu(); // استدعاء دالة مخصصة للإغلاق
        }
    });
    
    // دالة مخصصة لإغلاق القائمة
    function closeMobileMenu() {
        domCache.navLinks.classList.remove('active');
        domCache.overlay.classList.remove('active');
        domCache.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.classList.remove('menu-open');
    }
    
    // إغلاق القائمة عند النقر على الـ overlay
    domCache.overlay.addEventListener('click', closeMobileMenu);
}

// تحسين أداء الجزيئات
function initParticles(config = {}) {
    if (!domCache.canvas || !domCache.ctx) return;
    
    const mobileConfig = optimizeCanvasForMobile();
    const finalConfig = { ...mobileConfig, ...config };
    
    particles = [];
    const particleCount = finalConfig.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * domCache.canvas.width,
            y: Math.random() * domCache.canvas.height,
            radius: Math.random() * finalConfig.particleSize + 1,
            color: `rgba(100, 255, 218, ${Math.random() * 0.5 + 0.1})`,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            connections: []
        });
    }
    
    // تحسين حركة الجزيئات للأجهزة المحمولة
    if (window.innerWidth <= 768) {
        particles.forEach(p => {
            p.speedX *= 0.7;
            p.speedY *= 0.7;
        });
    }
}

// تحسين drawParticles
function drawParticles() {
    if (!domCache.canvas || !domCache.ctx) return;
    
    const ctx = domCache.ctx;
    const frameSkip = window.innerWidth <= 768 ? 2 : 1;
    let frameCount = 0;
    
    function animate() {
        frameCount++;
        if (frameCount % frameSkip !== 0) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }
        
        ctx.clearRect(0, 0, domCache.canvas.width, domCache.canvas.height);
        
        // تحسين الرسم للأجهزة المحمولة
        if (window.innerWidth <= 768) {
            ctx.globalCompositeOperation = 'lighter';
        }
        
        // تحديث وربط الجزيئات
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.connections = [];
            
            // تحريك الجزيئات
            p.x += p.speedX;
            p.y += p.speedY;
            
            // ارتداد الجزيئات عند وصولها للحدود
            if (p.x < 0 || p.x > domCache.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > domCache.canvas.height) p.speedY *= -1;
            
            // رسم الجزيئة
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // البحث عن الجزيئات القريبة لرسم خطوط بينها
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // رسم خط إذا كانت المسافة أقل من 100
                const maxDistance = window.innerWidth < 768 ? 80 : 150;
                if (distance < maxDistance) {
                    p.connections.push(j);
                    const opacity = 1 - (distance / maxDistance);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
}

// تهيئة التطبيق
// Defer non-critical operations
document.addEventListener('DOMContentLoaded', () => {
    // Critical operations first
    initDOMCache();
    setupMobileMenu();
    
    // Defer canvas initialization
    if (domCache.canvas) {
        requestIdleCallback(() => {
            const config = optimizeCanvasForMobile();
            initParticles(config);
            drawParticles();
        });
    }
    
    // Add event handlers with passive flag and debouncing
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', debounce(() => {
        cancelAnimationFrame(animationFrameId);
        optimizeCanvasForMobile();
        initParticles();
        drawParticles();
    }, 150), { passive: true });

    // Defer non-critical initializations
    requestIdleCallback(() => {
        initFAQ();
        lazyLoadImages();
        optimizeFontLoading();
    });
}, { passive: true });

// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// تحسين lazy loading للصور
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        const imageObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        observer.unobserve(img);
                    }
                });
            },
            { rootMargin: '50px 0px' }
        );
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// تحسين تحميل الخطوط
function optimizeFontLoading() {
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('700 1em Tajawal'),
            document.fonts.load('400 1em Tajawal')
        ]).then(() => {
            document.documentElement.classList.add('fonts-loaded');
        });
    }
}

// تحسين وظيفة الأسئلة الشائعة
function initFAQ() {
    const faqButtons = document.querySelectorAll('.faq-question');
    
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            
            // إغلاق جميع الأسئلة المفتوحة الأخرى
            faqButtons.forEach(otherButton => {
                if (otherButton !== button) {
                    otherButton.setAttribute('aria-expanded', 'false');
                    otherButton.parentElement.classList.remove('active');
                }
            });
            
            // تبديل حالة السؤال الحالي
            button.setAttribute('aria-expanded', !isExpanded);
            faqItem.classList.toggle('active');
        });
    });
}

const canvas = document.getElementById('heroCanvas');
const ctx = canvas?.getContext('2d'); // تم إضافة علامة "?"
let particles = [];
let animationFrameId;

// تعيين حجم الكانفاس ليناسب الشاشة
function resizeCanvas() {
    const heroSection = document.getElementById('home');
    if (heroSection && canvas) { // إضافة تحقق إضافي
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
        
        // إعادة إنشاء الجزيئات عند تغيير حجم الشاشة
        initParticles();
    }
}

// إنشاء الجزيئات
function initParticles(config) {
    if (!canvas) return; // إضافة تحقق إضافي
    
    particles = [];
    const particleCount = config ? config.particleCount : (window.innerWidth < 768 ? 50 : 100); // عدد أقل للأجهزة المحمولة
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * (config ? config.particleSize : 2) + 1,
            color: `rgba(100, 255, 218, ${Math.random() * 0.5 + 0.1})`,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            connections: []
        });
    }
}

// رسم الجزيئات والخطوط
function drawParticles() {
    if (!canvas || !ctx) return; // إضافة تحقق إضافي
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الخلفية
    ctx.fillStyle = 'rgba(10, 25, 47, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // تحديث وربط الجزيئات
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.connections = [];
        
        // تحريك الجزيئات
        p.x += p.speedX;
        p.y += p.speedY;
        
        // ارتداد الجزيئات عند وصولها للحدود
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // رسم الجزيئة
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // البحث عن الجزيئات القريبة لرسم خطوط بينها
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // رسم خط إذا كانت المسافة أقل من 100
            const maxDistance = window.innerWidth < 768 ? 80 : 150;
            if (distance < maxDistance) {
                p.connections.push(j);
                const opacity = 1 - (distance / maxDistance);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    animationFrameId = requestAnimationFrame(drawParticles);
}

// تهيئة الكانفاس عند تحميل الصفحة
window.addEventListener('load', () => {
    resizeCanvas();
    if (canvas) { // إضافة تحقق إضافي
        drawParticles();
    }
});

// إعادة تعيين حجم الكانفاس عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    if (canvas) { // إضافة تحقق إضافي
        drawParticles();
    }
});

// تصغير القائمة عند التمرير
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar?.classList.add('scrolled'); // استخدام optional chaining
    } else {
        navbar?.classList.remove('scrolled'); // استخدام optional chaining
    }

    // ظهور زر العودة لأعلى الصفحة
    const backToTop = document.querySelector('.back-to-top');
    if (window.scrollY > 500) {
        backToTop?.classList.add('visible'); // استخدام optional chaining
    } else {
        backToTop?.classList.remove('visible'); // استخدام optional chaining
    }
});

// التعامل مع النقر على زر العودة لأعلى الصفحة
document.querySelector('.back-to-top')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// منع إعادة تحميل الصفحة عند إرسال النموذج
document.getElementById('consultationForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('تم إرسال طلب الاستشارة بنجاح! سنتواصل معك قريباً.');
    this.reset();
});

// منع إعادة تحميل الصفحة عند إرسال نموذج النشرة البريدية
document.querySelector('.newsletter-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('تم الاشتراك في النشرة البريدية بنجاح!');
    this.reset();
});

document.querySelector('.newsletter-form-large')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('تم الاشتراك في النشرة البريدية بنجاح!');
    this.reset();
});

// التمرير السلس للروابط
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// انيميشن للعناصر عند ظهورها في الشاشة
const animateOnScroll = function() {
    const elements = document.querySelectorAll('.service-card, .case-card, .feature-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// إضافة تأثير انيميشن عند التحميل
window.addEventListener('load', function() {
    document.querySelectorAll('.service-card, .case-card, .feature-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
    
    setTimeout(animateOnScroll, 100);
});

// انيميشن عند التمرير
window.addEventListener('scroll', animateOnScroll);

// تحسين أداء الكانفاس على الأجهزة المحمولة
function isMobileDevice() {
    return (window.innerWidth <= 768) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// تعديل كثافة الجزيئات وسرعة الحركة بناءً على نوع الجهاز
function optimizeCanvasForDevice() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    if (isMobileDevice()) {
        // تقليل عدد الجزيئات وتبسيط الرسومات للأجهزة المحمولة
        particles = particles.slice(0, Math.min(particles.length, 40));
        
        // تقليل سرعة الحركة للأجهزة المحمولة لتحسين الأداء
        particles.forEach(p => {
            p.speedX *= 0.7;
            p.speedY *= 0.7;
        });
    }
}

// استدعاء وظيفة التحسين عند تحميل الصفحة وتغيير حجم النافذة
window.addEventListener('load', optimizeCanvasForDevice);
window.addEventListener('resize', optimizeCanvasForDevice);

// كود الخلفية المتحركة للقسم الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // تعريف الألوان المستخدمة في الخلفية
    const colors = ['#64FFDA', '#0A192F', '#1D2B3A', '#8892B0'];
    
    // إنشاء مصفوفة الجزيئات
    let particles = [];
    const particleCount = Math.min(Math.floor(width * 0.04), 100); // عدد الجزيئات يتناسب مع عرض الشاشة
    
    // إعادة ضبط حجم الكانفاس عند تغيير حجم النافذة
    window.addEventListener('resize', function() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles(); // إعادة تهيئة الجزيئات عند تغيير الحجم
    });
    
    // تهيئة الجزيئات
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.5 + 0.2,
                direction: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    // رسم الجزيئات
    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        
        // رسم الخلفية
        ctx.fillStyle = '#0A192F';
        ctx.fillRect(0, 0, width, height);
        
        // رسم الجزيئات
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.closePath();
            
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
            
            // رسم الخطوط بين الجزيئات القريبة
            particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = particle.color;
                    ctx.globalAlpha = 0.1 * (1 - distance / 100);
                    ctx.stroke();
                }
            });
            
            // تحريك الجزيئات
            particle.x += Math.cos(particle.direction) * particle.speed;
            particle.y += Math.sin(particle.direction) * particle.speed;
            
            // تغيير الاتجاه بشكل عشوائي
            if (Math.random() < 0.01) {
                particle.direction += (Math.random() - 0.5) * 0.2;
            }
            
            // إعادة الجزيئات إلى الشاشة إذا خرجت منها
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
        });
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(drawParticles);
    }
    
    // بدء الرسم
    initParticles();
    drawParticles();
    
    // تفاعل الخلفية مع حركة الماوس
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * 1;
                particle.y -= Math.sin(angle) * 1;
            }
        });
    });
});

// تتبع النقرات على روابط الخدمات
function trackServiceClick(serviceName) {
    // التحقق من وجود الرابط
    const serviceLinks = document.querySelectorAll('.service-link');
    serviceLinks.forEach(link => {
        if (link.getAttribute('href') === '#') {
            // إذا كان الرابط غير متوفر بعد
            event.preventDefault();
            alert('هذه الخدمة ستكون متاحة قريباً');
        }
    });

    // تسجيل النقرة للتحليلات
    if (typeof gtag === 'function') {
        gtag('event', 'service_click', {
            'service_name': serviceName,
            'timestamp': new Date().toISOString()
        });
    }
}

// إضافة تأثيرات حركية لروابط الخدمات
document.querySelectorAll('.service-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(-5px)';
    });

    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.overlay');
    const navItems = document.querySelectorAll('.nav-links li');
    const body = document.body;

    function toggleMenu() {
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        hamburger.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';

        // تأخير ظهور عناصر القائمة
        if (navLinks.classList.contains('active')) {
            navItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, 100 * index);
            });
        }
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // إغلاق القائمة عند النقر على أي رابط
    navItems.forEach(item => {
        item.addEventListener('click', toggleMenu);
    });
}

// تأكد من تنفيذ الكود عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initMobileNav);
