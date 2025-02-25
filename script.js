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