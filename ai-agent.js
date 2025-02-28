document.addEventListener('DOMContentLoaded', () => {
    // Set RTL direction
    document.body.style.direction = 'rtl';

    // Load Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Load Tajawal font
    const tajawalFont = document.createElement('link');
    tajawalFont.rel = 'stylesheet';
    tajawalFont.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
    document.head.appendChild(tajawalFont);

    // Lazy loading images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Scroll animations for sections
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Add icons to agent cards that don't have them
    const agentCards = document.querySelectorAll('.agent-card');
    const iconClasses = [
        'fa-search', 'fa-file-alt', 'fa-users', 'fa-chart-line', 
        'fa-lightbulb', 'fa-project-diagram', 'fa-tasks', 'fa-brain'
    ];
    
    agentCards.forEach((card, index) => {
        const iconElement = card.querySelector('.agent-icon');
        if (iconElement && !iconElement.classList.contains('fas')) {
            // If icon element exists but doesn't have an icon class
            const iconClass = iconClasses[index % iconClasses.length];
            iconElement.classList.add('fas', iconClass);
        }
    });

    // Enhanced hover effects for cards
    const allCards = document.querySelectorAll('.agent-card, .feature, .testimonial, .faq-item, .type-card, .business-agent, .technology');
    
    allCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 12px 24px rgba(56, 189, 248, 0.2)';
            card.style.borderColor = 'var(--accent-color)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.borderColor = '';
        });
    });

    // Hero section parallax effect
    const heroSection = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-content');

    if (heroSection && heroContent) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const offsetX = (x - centerX) / 50;
            const offsetY = (y - centerY) / 50;

            heroContent.style.transform = `translateZ(50px) rotateX(${-offsetY * 0.5}deg) rotateY(${offsetX * 0.5}deg)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            heroContent.style.transform = 'translateZ(50px) rotateX(0deg) rotateY(0deg)';
        });
    }

    // Modal functionality
    const modalTriggers = document.querySelectorAll('.more-details');
    const closeButtons = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.modal');

    // Open modal
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            }
        });
    });

    // Close modal with close button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    modal.classList.remove('show');
                    document.body.style.overflow = ''; // Restore scrolling
                }
            });
        }
    });

    // CTA buttons WhatsApp link
    const ctaButtons = document.querySelectorAll('.cta-button, .final-cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://wa.me/966501120781?text=اكتب%20لنا%20بيانات%20الوكيل%20اللذي%20تريده', '_blank');
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for fixed header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add animation to technology icons
    const techIcons = document.querySelectorAll('.technology img');
    techIcons.forEach(icon => {
        icon.style.animation = 'float 6s ease-in-out infinite';
    });

    // Add pulse animation to CTA buttons
    const finalCtaButton = document.querySelector('.final-cta-button');
    if (finalCtaButton) {
        finalCtaButton.style.animation = 'pulse 2s infinite';
    }

    // Add active class to current page in navbar
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.style.color = 'var(--accent-color)';
            link.style.fontWeight = 'bold';
        }
    });

    // Add features to agent cards
    const agentFeaturesList = {
        'custom-agent': [
            'تصميم مخصص حسب احتياجاتك',
            'تكامل مع الأنظمة الحالية',
            'دعم فني على مدار الساعة'
        ],
        'data-analyst-agent': [
            'تحليل البيانات بدقة عالية',
            'استخراج الأنماط والاتجاهات',
            'تقارير تحليلية متكاملة'
        ],
        'marketing-agent': [
            'استراتيجيات تسويقية فعالة',
            'تحليل سلوك المستخدم',
            'زيادة معدلات التحويل'
        ],
        'seo-agent': [
            'تحسين ترتيب موقعك',
            'تحليل الكلمات المفتاحية',
            'تقارير أداء شهرية'
        ],
        'content-agent': [
            'محتوى عالي الجودة',
            'تحسين لمحركات البحث',
            'زيادة التفاعل مع المحتوى'
        ],
        'customer-discovery-agent': [
            'اكتشاف عملاء محتملين',
            'تحليل احتياجات السوق',
            'استراتيجيات تواصل فعالة'
        ],
        'competitor-analysis-agent': [
            'تحليل شامل للمنافسين',
            'تحديد نقاط القوة والضعف',
            'استراتيجيات تنافسية'
        ],
        'project-analysis-agent': [
            'تحليل شامل للمشروع',
            'تحديد فرص التحسين',
            'خطط تنفيذية واضحة'
        ]
    };

    // Add features to agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        const detailsLink = card.querySelector('.more-details');
        if (detailsLink) {
            const modalId = detailsLink.getAttribute('data-modal');
            const featuresList = card.querySelector('.agent-features');
            
            if (featuresList && agentFeaturesList[modalId]) {
                // Clear existing features
                featuresList.innerHTML = '';
                
                // Add new features
                agentFeaturesList[modalId].forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = feature;
                    featuresList.appendChild(li);
                });
            }
        }
    });
});
