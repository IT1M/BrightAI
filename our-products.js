document.addEventListener('DOMContentLoaded', function() {
    // تعريف المتغيرات الأساسية
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const cartItemsContainer = document.querySelector('.cart-items'); // Renamed for clarity
    const cartCount = document.querySelector('.cart-count');
    const cartTotalElement = document.querySelector('.cart-total'); // Renamed for clarity
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const copyIbanBtn = document.getElementById('copyIban');
    const paymentTotalElement = document.querySelector('.payment-total'); // Renamed for clarity
    const products = document.querySelectorAll('.product');
    const productImagesContainers = document.querySelectorAll('.product-images'); // Renamed for clarity
    
    let cart = [];

    // دالة لتحديث عرض السلة
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = ''; // Clear previous items
        let total = 0;
        let totalQuantity = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-cart" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <i class="fas fa-shopping-bag" style="font-size: 3em; color: var(--accent-color); margin-bottom: 15px;"></i>
                <p style="font-size: 1.1em;">سلة المشتريات فارغة حالياً.</p>
                <p>تصفح منتجاتنا وأضف ما يعجبك!</p>
            </div>`;
        } else {
            cart.forEach(item => {
                const priceNumeric = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                if (isNaN(priceNumeric)) {
                    console.error(`Invalid price for item: ${item.name}`, item.price);
                    return; // Skip this item if price is invalid
                }
                total += priceNumeric * item.quantity;
                totalQuantity += item.quantity;

                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>السعر: ${item.price}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-product-id="${item.id}" data-change="-1" aria-label="تقليل الكمية لـ ${item.name}">-</button>
                            <span aria-live="polite">${item.quantity}</span>
                            <button class="quantity-btn" data-product-id="${item.id}" data-change="1" aria-label="زيادة الكمية لـ ${item.name}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-product-id="${item.id}" aria-label="إزالة ${item.name} من السلة">×</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        cartTotalElement.textContent = total.toFixed(2);
        cartCount.textContent = totalQuantity;
        
        // تخزين السلة في localStorage
        localStorage.setItem('brightAICart', JSON.stringify(cart)); // Use a more specific key
        
        // تحديث عرض عدد العناصر في السلة
        cartCount.style.display = totalQuantity > 0 ? 'block' : 'none';
    }
    
    // Event delegation for dynamic elements inside cart
    cartItemsContainer.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('quantity-btn')) {
            const productId = target.dataset.productId;
            const change = parseInt(target.dataset.change);
            updateQuantity(productId, change);
        } else if (target.classList.contains('remove-item')) {
            const productId = target.dataset.productId;
            removeFromCart(productId);
        }
    });


    // دالة لإضافة منتج إلى السلة
    function addToCart(productId, productName, productPrice) {
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
        showNotification(`تمت إضافة "${productName}" إلى السلة بنجاح!`);
    };
    
    // دالة لعرض تنبيه
    function showNotification(message) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Force reflow to enable animation
        void notification.offsetWidth; 

        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400); // Matches CSS transition duration
        }, 3000);
    }

    // دالة لتحديث كمية المنتج
    function updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove item if quantity is 0 or less
                showNotification(`تمت إزالة المنتج من السلة.`);
            }
            updateCartDisplay();
        }
    }

    // دالة لإزالة منتج من السلة
    function removeFromCart(productId) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const itemName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            updateCartDisplay();
            showNotification(`تمت إزالة "${itemName}" من السلة.`);
        }
    }

    // إضافة معالجات الأحداث
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore background scrolling
        });
    }

    // معالج زر الشراء
    products.forEach(product => {
        const buyButton = product.querySelector('.buy-button');
        if (buyButton) {
            buyButton.addEventListener('click', function(event) {
                event.preventDefault();
                const productId = product.dataset.productId;
                const productNameElement = product.querySelector('h3');
                const productPriceElement = product.querySelector('.price');

                if (!productId || !productNameElement || !productPriceElement) {
                    console.error('Product missing ID, name, or price element.');
                    showNotification('عفواً، حدث خطأ ما. يرجى المحاولة لاحقاً.');
                    return;
                }
                const productName = productNameElement.textContent.trim();
                const productPrice = productPriceElement.textContent.trim();
                
                this.classList.add('button-click');
                setTimeout(() => {
                    this.classList.remove('button-click');
                }, 200);
                
                addToCart(productId, productName, productPrice);
            });
        }
    });
    
    // إضافة تأثير النقر للأزرار الأخرى
    document.querySelectorAll('.details-button, .checkout-button, .paypal-checkout-button, .send-receipt-button, .copy-button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('button-click');
            setTimeout(() => {
                this.classList.remove('button-click');
            }, 200);
        });
    });
    
    // معالج زر إتمام الشراء تحويل بنكي (البنك)
    const bankCheckoutButton = document.querySelector('.checkout-button');
    if (bankCheckoutButton) {
        bankCheckoutButton.addEventListener('click', () => {
            if (cart.length > 0) {
                const total = cart.reduce((sum, item) => {
                    const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
                    return sum + price * item.quantity;
                }, 0);
                paymentTotalElement.textContent = total.toFixed(2);
                cartModal.classList.remove('active'); // Hide cart modal
                paymentModal.classList.add('active'); // Show payment modal
                document.body.style.overflow = 'hidden'; 
            } else {
                showNotification('سلة المشتريات فارغة. يرجى إضافة منتجات أولاً.');
            }
        });
    }

    // مستمع زر الدفع عن طريق paypal
    const paypalCheckoutButton = document.querySelector('.paypal-checkout-button');
    if (paypalCheckoutButton) {
        paypalCheckoutButton.addEventListener('click', () => {
            if (cart.length > 0) {
                 // Basic PayPal integration - more complex logic would be needed for a full checkout
                // This example just redirects. For a real app, you'd send cart data to PayPal.
                showNotification('جاري تحويلك إلى PayPal لإتمام الدفع...');
                // Example: window.location.href = 'https://www.paypal.com/cgi-bin/webscr?cmd=_cart&business=YOUR_PAYPAL_EMAIL&...';
                // For now, a placeholder:
                alert('سيتم تحويلك إلى PayPal. هذه مجرد محاكاة.');
                // Potentially clear cart or mark as pending payment here
            } else {
                showNotification('سلة المشتريات فارغة. يرجى إضافة منتجات أولاً.');
            }
        });
    }


    // نسخ رقم الآيبان
    if (copyIbanBtn) {
        copyIbanBtn.addEventListener('click', () => {
            const ibanNumberElement = document.getElementById('ibanNumber');
            if (ibanNumberElement) {
                const ibanNumber = ibanNumberElement.textContent.trim();
                navigator.clipboard.writeText(ibanNumber).then(() => {
                    const originalIcon = copyIbanBtn.innerHTML;
                    copyIbanBtn.innerHTML = '<i class="fas fa-check" style="color: var(--accent-color);"></i> تم النسخ';
                    setTimeout(() => {
                        copyIbanBtn.innerHTML = originalIcon;
                    }, 2500);
                    showNotification('تم نسخ رقم الآيبان بنجاح.');
                }).catch(err => {
                    console.error('Failed to copy IBAN: ', err);
                    showNotification('فشل نسخ رقم الآيبان. يرجى نسخه يدوياً.');
                });
            }
        });
    }

    // إغلاق نافذة الدفع
    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            paymentModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // إغلاق النوافذ عند النقر خارجها
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        if (event.target === paymentModal) {
            paymentModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // استعادة السلة من localStorage عند تحميل الصفحة
    const savedCart = localStorage.getItem('brightAICart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            if (!Array.isArray(cart)) cart = []; // Ensure cart is an array
        } catch (e) {
            console.error("Error parsing saved cart:", e);
            cart = []; // Reset cart if parsing fails
            localStorage.removeItem('brightAICart'); // Clear corrupted data
        }
        updateCartDisplay();
    }
    
    // إضافة وظائف التنقل بين الصور للمنتجات
    productImagesContainers.forEach(container => {
        const prevButton = container.querySelector('.prev-button');
        const nextButton = container.querySelector('.next-button');
        const imagesScroller = container.querySelector('.images-container'); // Renamed for clarity
        
        if (prevButton && nextButton && imagesScroller) {
            const scrollAmount = imagesScroller.offsetWidth * 0.8; // Scroll 80% of visible width

            nextButton.addEventListener('click', () => {
                imagesScroller.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
            
            prevButton.addEventListener('click', () => {
                imagesScroller.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });

            // Optional: Disable buttons at ends of scroll
            imagesScroller.addEventListener('scroll', () => {
                prevButton.disabled = imagesScroller.scrollLeft < 10; // Small tolerance
                nextButton.disabled = imagesScroller.scrollWidth - imagesScroller.scrollLeft - imagesScroller.clientWidth < 10;
            });
             // Initial check
            prevButton.disabled = imagesScroller.scrollLeft < 10;
            nextButton.disabled = imagesScroller.scrollWidth - imagesScroller.scrollLeft - imagesScroller.clientWidth < 10;
        }
    });

    // معالجة أزرار تفاصيل المنتج (لإظهار المودال الخاص بها)
    const detailButtons = document.querySelectorAll('.details-button[data-target]');
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active'); // Use class for display
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // معالجة أزرار الإغلاق لجميع المودالات التي تحتوي على product-details-modal
    const productDetailModals = document.querySelectorAll('.product-details-modal');
    productDetailModals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button[data-close-target]');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                modal.classList.remove('active');
                // Check if any other modal is active before restoring scroll
                const anyModalActive = Array.from(document.querySelectorAll('.cart-modal.active, .payment-modal.active, .product-details-modal.active')).length > 0;
                if (!anyModalActive) {
                    document.body.style.overflow = 'auto';
                }
            });
        }

        // إغلاق المودال عند النقر خارجه
        modal.addEventListener('click', function(event) {
            if (event.target === modal) { // Clicked on the backdrop itself
                modal.classList.remove('active');
                const anyModalActive = Array.from(document.querySelectorAll('.cart-modal.active, .payment-modal.active, .product-details-modal.active')).length > 0;
                if (!anyModalActive) {
                    document.body.style.overflow = 'auto';
                }
            }
        });
    });

    // Keyboard accessibility for modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.cart-modal.active, .payment-modal.active, .product-details-modal.active');
            activeModals.forEach(modal => {
                modal.classList.remove('active');
            });
            if (activeModals.length > 0) {
                 document.body.style.overflow = 'auto';
            }
        }
    });
});