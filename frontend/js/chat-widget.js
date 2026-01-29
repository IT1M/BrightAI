document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');
    const chatOverlay = document.getElementById('chatOverlay');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const micButton = document.getElementById('micButton');
    const minimizeChat = document.getElementById('minimizeChat');
    const soundToggle = document.getElementById('soundToggle');
    const quickActions = document.getElementById('quickActions');

    // === State ===
    let isOpen = false;
    let isSoundEnabled = true;
    let isFirstOpen = true;

    // === API Configuration ===
    const API_KEY = 'AIzaSyDO81uH5hysYX4daaK2bmcRxbz8IPFgwfg';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    // === Chat Toggle Functions ===
    function toggleChat() {
        isOpen = !isOpen;
        chatWidget.classList.toggle('open', isOpen);
        chatToggle.classList.toggle('active', isOpen);
        chatOverlay.classList.toggle('show', isOpen && window.innerWidth <= 480);

        if (isOpen) {
            // Remove notification badge
            const badge = chatToggle.querySelector('.badge');
            if (badge) badge.style.display = 'none';

            // Focus input
            setTimeout(() => userInput.focus(), 300);

            // Add welcome AI message on first open
            if (isFirstOpen) {
                isFirstOpen = false;
            }
        }

        // Prevent body scroll on mobile when chat is open
        if (window.innerWidth <= 480) {
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
    }

    function closeChat() {
        isOpen = false;
        chatWidget.classList.remove('open');
        chatToggle.classList.remove('active');
        chatOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    // === Event Listeners ===
    if (chatToggle) chatToggle.addEventListener('click', toggleChat);
    if (chatOverlay) chatOverlay.addEventListener('click', closeChat);
    if (minimizeChat) minimizeChat.addEventListener('click', closeChat);

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeChat();
        }
    });

    // Sound toggle
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;

            // Stop current speech instantly if muted
            if (!isSoundEnabled) {
                window.speechSynthesis.cancel();
            }

            soundToggle.querySelector('svg').innerHTML = isSoundEnabled
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />';
        });
    }

    // Enable/disable send button based on input
    if (userInput) {
        userInput.addEventListener('input', () => {
            sendButton.disabled = userInput.value.trim() === '';
        });

        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Send message events
    if (sendButton) sendButton.addEventListener('click', sendMessage);

    // Quick action buttons
    if (quickActions) {
        quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const message = e.target.dataset.message;
                userInput.value = message;
                sendButton.disabled = false;
                sendMessage();
            }
        });
    }

    // === Speech Recognition ===
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition && micButton) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            micButton.classList.add('recording');
            userInput.placeholder = 'جاري الاستماع...';
        };

        recognition.onend = () => {
            micButton.classList.remove('recording');
            userInput.placeholder = 'اكتب رسالتك هنا...';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            micButton.classList.remove('recording');
            userInput.placeholder = 'حدث خطأ، حاول مجدداً';
            setTimeout(() => {
                userInput.placeholder = 'اكتب رسالتك هنا...';
            }, 2000);
        };

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            if (speechResult) {
                userInput.value = speechResult;
                sendButton.disabled = false;
                sendMessage();
            }
        };

        micButton.addEventListener('click', () => {
            try {
                if (micButton.classList.contains('recording')) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            } catch (e) {
                console.error("Recognition error:", e);
            }
        });
    } else if (micButton) {
        micButton.style.display = 'none';
    }

    // === Message Functions ===
    function getCurrentTime() {
        return new Date().toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function parseMarkdown(text) {
        if (!text) return '';

        // 1. Basic HTML Escape (safety)
        let tempDiv = document.createElement("div");
        tempDiv.innerText = text;
        let cleanText = tempDiv.innerHTML;

        // 2. Formatting
        // Headers (## Header)
        cleanText = cleanText.replace(/^## (.*$)/gim, '<h3>$1</h3>');

        // Bold (**text**)
        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic (*text*)
        cleanText = cleanText.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links [text](url)
        cleanText = cleanText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="chat-link">$1</a>');

        // Bullet points
        cleanText = cleanText.replace(/^\- (.*$)/gim, '• $1');

        // Newlines to break
        cleanText = cleanText.replace(/\n/g, '<br>');

        return cleanText;
    }

    // === Typing Effect ===
    async function typeMessage(element, htmlContent) {
        // Match HTML tags or single characters
        const regex = /(<[^>]+>|[^<])/g;
        const matches = htmlContent.match(regex) || [];

        element.innerHTML = '';

        for (const match of matches) {
            element.innerHTML += match;
            // Scroll to bottom continuously
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Delay only for text characters, not HTML tags
            if (!match.startsWith('<')) {
                await new Promise(resolve => setTimeout(resolve, 15));
            }
        }
    }

    function appendMessage(text, sender, isStreaming = false) {
        // Hide welcome message and quick actions after first user message
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg && sender === 'user') {
            welcomeMsg.style.display = 'none';
        }
        if (sender === 'user') {
            quickActions.style.display = 'none';
        }

        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);

        const avatarIcon = sender === 'ai'
            ? '<img src="frontend/assets/images/Gemini.webp" alt="AI" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />';

        // Parse the message text
        const formattedText = parseMarkdown(text);

        wrapper.innerHTML = `
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    ${avatarIcon}
                </svg>
            </div>
            <div class="message-content">
                <div class="message-bubble">${isStreaming ? '' : formattedText}</div>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        `;

        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Return the bubble element if we want to stream into it
        if (isStreaming) {
            return { wrapper, bubble: wrapper.querySelector('.message-bubble'), formattedText };
        }
    }

    function updateQuickActions(suggestions) {
        if (!quickActions) return;

        quickActions.innerHTML = '';
        quickActions.style.display = 'flex'; // Show if it was hidden

        suggestions.forEach(suggestion => {
            if (!suggestion.trim()) return;
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.dataset.message = suggestion.trim();
            btn.textContent = suggestion.trim();

            // Add subtle animation
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(10px)';
            quickActions.appendChild(btn);

            // Trigger animation
            requestAnimationFrame(() => {
                btn.style.transition = 'all 0.3s ease';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            });
        });

        // Scroll to bottom to show suggestions
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', 'ai');
        wrapper.id = 'typingIndicator';

        wrapper.innerHTML = `
            <div class="message-avatar">
                <img src="frontend/assets/images/Gemini.webp" alt="AI" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    // === Send Message ===
    async function sendMessage() {
        if (!userInput) return;
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        userInput.value = '';
        sendButton.disabled = true;
        showTypingIndicator();

        try {
            const fullResponse = await callGeminiAPI(text);
            removeTypingIndicator();

            // Split response and suggestions
            const parts = fullResponse.split('---SUGGESTIONS---');
            const mainAnswer = parts[0].trim();
            const suggestionsRaw = parts[1] ? parts[1].trim() : '';

            // Stream the main answer
            const { bubble, formattedText } = appendMessage(mainAnswer, 'ai', true);
            await typeMessage(bubble, formattedText);

            if (isSoundEnabled) {
                speakText(mainAnswer);
            }

            // Process and show suggestions
            if (suggestionsRaw) {
                const suggestions = suggestionsRaw.split('\n').filter(s => s.trim().length > 0).slice(0, 3);
                updateQuickActions(suggestions);
            }

        } catch (error) {
            removeTypingIndicator();
            appendMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'ai');
            console.error('API Error:', error);
        }
    }

    // === Gemini API Call ===
    async function callGeminiAPI(text) {
        const systemPrompt = `أنت Yazeed AI، المساعد الذكي الرسمي للدعم الفني من شركة Bright AI السعودية - الشركة الرائدة في حلول الذكاء الاصطناعي بالمملكة العربية السعودية.

## من نحن - Bright AI
منصة سعودية رائدة متخصصة في تقديم حلول الذكاء الاصطناعي المبتكرة لدعم التحول الرقمي في المؤسسات والمنشآت. نهدف إلى تمكين الشركات السعودية من تبني أحدث تقنيات AI لتحسين الكفاءة وزيادة الإنتاجية وتعزيز القدرة التنافسية.

## خدماتنا الرئيسية:

### 1. الذكاء الاصطناعي كخدمة (AIaaS) للمنشآت
- حلول "المصنع الذكي" و"المتجر المتصل" للمنشآت الصغيرة والمتوسطة
- تحديثات مستمرة للخوارزميات بناءً على البيانات المحلية
- التعلم المستمر لتحسين الأداء
🔗 [التفاصيل الكاملة](https://brightai.site/frontend/pages/ai-agent)

### 2. سير عمل الذكاء الاصطناعي (AI Workflows)
- تنظيم ذكي للمهام وتنفيذ تلقائي
- تحقيق نتائج أسرع بتكلفة أقل

### 3. الأتمتة الذكية (RPA)
- تحويل المهام اليدوية المتكررة إلى عمليات آلية دقيقة
🔗 [تفاصيل الأتمتة](https://brightai.site/frontend/pages/smart-automation)

### 4. تحليل البيانات الضخمة (Big Data)
- استخراج رؤى استراتيجية من البيانات
- دعم اتخاذ القرار بناءً على البيانات
🔗 [خدمات التحليل](https://brightai.site/frontend/pages/data-analysis)

### 5. الذكاء الاصطناعي التوليدي (Generative AI)
- إنشاء محتوى ذكي وحلول مبتكرة
- نماذج ذكية مخصصة

### 6. معالجة اللغة الطبيعية (NLP)
- فهم اللهجات المحلية السعودية
- تفاعل نصي دقيق باللغة العربية

### 7. شات بوت عربي ذكي
- دعم اللغة العربية واللهجات السعودية
- تفاعل تلقائي مع العملاء على مدار الساعة

### 8. الاستشارات التقنية
- استراتيجيات مخصصة للتحول الرقمي
- خبراء متخصصون في AI
🔗 [احجز استشارة](https://brightai.site/frontend/pages/consultation)

### 9. الحلول الطبية
- تحليل الصور الطبية
- المراقبة الصحية عن بُعد
- دعم المستشفيات الذكية 

### 10. التكامل مع الأنظمة المؤسسية
- التكامل مع ERP و CRM
- تسهيل تطبيق الحلول ضمن البنى التحتية القائمة

### 11. مكتبة ذكية ومحتوى تدريبي
- موارد تعليمية بالعربية
- بناء الكفاءات المحلية في AI

## مهامك كـ Yazeed AI:
✅ الإجابة على الاستفسارات التقنية والدعم الفني
✅ تقديم معلومات مفصلة عن خدمات Bright AI
✅ المساعدة في اختيار الحل المناسب للعميل
✅ حل المشكلات التقنية وتقديم الدعم
✅ توجيه العملاء للصفحات والموارد المناسبة

## أسلوب التواصل:
- احترافي وودود ومرحب
- إجابات واضحة ومختصرة ومفيدة
- استخدام العربية الفصحى مع مراعاة البساطة
- تقديم روابط مباشرة للصفحات ذات الصلة
- عدم الخروج عن دورك كمساعد تقني

## روابط هامة:
📍 الصفحة الرئيسية: https://brightai.site/
📧 التواصل: yazeed1job@gmail.com
📱 واتساب: https://wa.me/966538229013
📞 هاتف: +966 53 822 9013
📍 الموقع: الرياض، المملكة العربية السعودية

## صفحات الخدمات:
- الأتمتة الذكية: /frontend/pages/smart-automation.html
- AIaaS للمنشآت: /frontend/pages/ai-agent.html
- تحليل البيانات: /frontend/pages/data-analysis.html
- الاستشارات: /frontend/pages/consultation.html
- المدونة: /blog
- الوثائق: /Docs
- من نحن: /about-us
- تواصل معنا: /contact

## ملاحظات مهمة:
⚡ عند الإجابة، قدّم رابط الصفحة المناسبة للحصول على تفاصيل أكثر
⚡ شجّع العملاء على حجز استشارة مجانية للحصول على حل مخصص
⚡ أكّد على التزامنا بالأمان والخصوصية والامتثال للمعايير السعودية
⚡ ركّز على قيمة التحول الرقمي ودوره في تحقيق رؤية 2030

في نهاية إجابتك، اقترح دائماً 3 أسئلة قصيرة يمكن للمستخدم طرحها تالياً لمتابعة المحادثة.
افصل بين الإجابة والاقتراحات بهذا الفاصل بالضبط:
---SUGGESTIONS---
ثم ضع كل اقتراح في سطر جديد. لا تضع أي ترقيم أو رموز إضافية أمام الاقتراحات، فقط نص السؤال.

تذكر: أنت ممثل Bright AI الرقمي، كن مفيداً ومحترفاً دائماً! 🚀`;



        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: text }
                    ]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} `);
        }

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return "لم أتمكن من معالجة طلبك. هل يمكنك إعادة صياغة السؤال؟";
    }

    // === Speech Synthesis ===
    function speakText(text) {
        if (!('speechSynthesis' in window) || !isSoundEnabled) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Find Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));

        if (arabicVoice) {
            utterance.voice = arabicVoice;
        }
        utterance.lang = 'ar-SA';
        utterance.rate = 1;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }

    // Load voices
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }

    // === Handle window resize ===
    window.addEventListener('resize', () => {
        if (window.innerWidth > 480) {
            chatOverlay.classList.remove('show');
            document.body.style.overflow = '';
        } else if (isOpen) {
            chatOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    });
});
