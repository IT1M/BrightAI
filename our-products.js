document.addEventListener('DOMContentLoaded', function() {
    // تعريف المتغيرات الأساسية
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const copyIbanBtn = document.getElementById('copyIban');
    const paymentTotal = document.querySelector('.payment-total');
    const products = document.querySelectorAll('.product');
    const productImages = document.querySelectorAll('.product-images');
    let cart = [];

    // دالة لتحديث عرض السلة
    function updateCartDisplay() {
        cartItems.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = `<div class="empty-cart" style="text-align: center; padding: 20px; color: #9CA3AF;">
                <i class="fas fa-shopping-cart" style="font-size: 3em; color: #38BDF8; margin-bottom: 15px;"></i>
                <p>سلة المشتريات فارغة</p>
            </div>`;
        } else {
            cart.forEach(item => {
                const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
                total += price * item.quantity;

                cartItems.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>السعر: ${item.price}</p>
                            <div class="quantity-controls">
                                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
                    </div>
                `;
            });
        }

        cartTotal.textContent = total.toFixed(2);
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // تخزين السلة في localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // تحديث عرض عدد العناصر في السلة
        if (cart.length === 0) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = 'block';
        }
    }

    // دالة لإضافة منتج إلى السلة
    window.addToCart = function(productId, productName, productPrice) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        updateCartDisplay();
        
        // إظهار تنبيه بإضافة المنتج
        showNotification(`تمت إضافة ${productName} إلى السلة`);
    };
    
    // دالة لعرض تنبيه
    function showNotification(message) {
        // إنشاء عنصر التنبيه
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // إضافة التنسيقات
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(30, 58, 138, 0.9)';
        notification.style.color = '#F3F4F6';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        notification.style.zIndex = '9999';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.borderLeft = '4px solid #38BDF8';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.3s ease';
        
        // إضافة التنبيه للصفحة
        document.body.appendChild(notification);
        
        // إظهار التنبيه
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // إخفاء التنبيه بعد 3 ثوان
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            
            // إزالة التنبيه من الصفحة بعد انتهاء التأثير
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // دالة لتحديث كمية المنتج
    window.updateQuantity = function(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCartDisplay();
            }
        }
    };

    // دالة لإزالة منتج من السلة
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartDisplay();
    };

    // إضافة معالجات الأحداث
    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    closeCartModal.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    // معالج زر الشراء
    products.forEach(product => {
        const buyButton = product.querySelector('.buy-button');
        buyButton.addEventListener('click', function(event) {
            event.preventDefault();
            const productId = product.dataset.productId;
            const productName = product.querySelector('h3').textContent;
            const productPrice = product.querySelector('.price').textContent;
            
            // إضافة تأثير نقرة للزر
            this.classList.add('button-click');
            setTimeout(() => {
                this.classList.remove('button-click');
            }, 200);
            
            addToCart(productId, productName, productPrice);
        });
    });
    
    // إضافة تأثير النقر للأزرار
    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('button-click');
            setTimeout(() => {
                this.classList.remove('button-click');
            }, 200);
        });
    });
    
    // إضافة تنسيقات CSS للتأثير
    const style = document.createElement('style');
    style.textContent = `
        .button-click {
            transform: scale(0.95);
        }
        
        .notification i {
            color: #38BDF8;
            font-size: 1.2em;
        }
        
        /* تنسيق للصور المتحركة */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .images-container img {
            animation: fadeIn 0.5s ease;
        }
    `;
    document.head.appendChild(style);

    // معالج زر إتمام الشراء تحويل بنكي (البنك)
    document.querySelector('.checkout-button').addEventListener('click', () => {
        if (cart.length > 0) {
            const total = cart.reduce((sum, item) => {
                const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
                return sum + price * item.quantity;
            }, 0);
            paymentTotal.textContent = total.toFixed(2);
            cartModal.style.display = 'none';
            paymentModal.style.display = 'block';
        }
    });

    // مستمع زر الدفع عن طريق paypal
    document.querySelector('.paypal-checkout-button').addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });

    // نسخ رقم الآيبان
    copyIbanBtn.addEventListener('click', () => {
        const ibanNumber = document.getElementById('ibanNumber').textContent;
        navigator.clipboard.writeText(ibanNumber).then(() => {
            copyIbanBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyIbanBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });

    // إغلاق نافذة الدفع
    closePaymentModal.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    // إغلاق النوافذ عند النقر خارجها
    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    // استعادة السلة من localStorage عند تحميل الصفحة
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // إغلاق المودال عند النقر خارجه
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });
    
    // إضافة وظائف التنقل بين الصور
    productImages.forEach(container => {
        const prevButton = container.querySelector('.prev-button');
        const nextButton = container.querySelector('.next-button');
        const imagesContainer = container.querySelector('.images-container');
        
        if (prevButton && nextButton && imagesContainer) {
            nextButton.addEventListener('click', () => {
                imagesContainer.scrollBy({ left: 300, behavior: 'smooth' });
            });
            
            prevButton.addEventListener('click', () => {
                imagesContainer.scrollBy({ left: -300, behavior: 'smooth' });
            });
        }
    });

    // تحديث معالجة أزرار التفاصيل
    const detailButtons = document.querySelectorAll('.details-button');
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // تحديث معالجة أزرار الإغلاق
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.product-details-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // إغلاق المودال عند النقر خارجه
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.product-details-modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
});
