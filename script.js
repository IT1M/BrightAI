        // إعداد الكانفاس المتحرك
        const canvas = document.getElementById('heroCanvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        
        // تعيين حجم الكانفاس ليناسب الشاشة
        function resizeCanvas() {
            const heroSection = document.getElementById('home');
            canvas.width = heroSection.offsetWidth;
            canvas.height = heroSection.offsetHeight;
            
            // إعادة إنشاء الجزيئات عند تغيير حجم الشاشة
            initParticles();
        }
        
        // إنشاء الجزيئات
        function initParticles() {
            particles = [];
            const particleCount = window.innerWidth < 768 ? 50 : 100; // عدد أقل للأجهزة المحمولة
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    color: `rgba(100, 255, 218, ${Math.random() * 0.5 + 0.1})`,
                    speedX: Math.random() * 1 - 0.5,
                    speedY: Math.random() * 1 - 0.5,
                    connections: []
                });
            }
        }
        
        // رسم الجزيئات والخطوط
        function drawParticles() {
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
            drawParticles();
        });
        
        // إعادة تعيين حجم الكانفاس عند تغيير حجم النافذة
        window.addEventListener('resize', () => {
            cancelAnimationFrame(animationFrameId);
            resizeCanvas();
            drawParticles();
        });

        // فتح/إغلاق القائمة في الأجهزة المحمولة
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.overlay');

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            overlay.classList.toggle('active');
            hamburger.innerHTML = navLinks.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        overlay.addEventListener('click', () => {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });

        // إغلاق القائمة عند النقر على أي رابط
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });

        // تصغير القائمة عند التمرير
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // ظهور زر العودة لأعلى الصفحة
            const backToTop = document.querySelector('.back-to-top');
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // التعامل مع النقر على زر العودة لأعلى الصفحة
        document.querySelector('.back-to-top').addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // فتح/إغلاق الأسئلة الشائعة
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });

        // منع إعادة تحميل الصفحة عند إرسال النموذج
        document.getElementById('consultationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('تم إرسال طلب الاستشارة بنجاح! سنتواصل معك قريباً.');
            this.reset();
        });

        // منع إعادة تحميل الصفحة عند إرسال نموذج النشرة البريدية
        document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('تم الاشتراك في النشرة البريدية بنجاح!');
            this.reset();
        });

        document.querySelector('.newsletter-form-large').addEventListener('submit', function(e) {
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
            return (window.innerWidth <= 768);
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
