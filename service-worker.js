// BrightAI Service Worker - Optimized for Saudi SEO & Performance
// Version: 2.2.0 - Saudi Search Engine Optimization
// Last updated: January 2025

const CACHE_NAME = 'brightai-saudi-v2.2.0';
const STATIC_CACHE = 'brightai-static-v2.2.0';
const DYNAMIC_CACHE = 'brightai-dynamic-v2.2.0';

// Saudi-specific resources to cache
const SAUDI_RESOURCES = [
    '/',
    '/index.html',
    '/our-products.html',
    '/ai-bots.html',
    '/consultation.html',
    '/data-analysis.html',
    '/smart-automation.html',
    '/contact.html',
    '/about-us.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/sitemap.xml',
    '/robots.txt',
    '/schema-saudi-seo.json',
    'https://www2.0zz0.com/2025/06/23/22/317775783.png', // Logo
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap'
];

// Saudi cities and keywords for enhanced caching
const SAUDI_KEYWORDS = [
    'الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة', 'المدينة المنورة',
    'الذكاء الاصطناعي', 'شركة مُشرقة AI', 'AI السعودية', 'رؤية 2030'
];

// Install event - Cache Saudi-specific resources
self.addEventListener('install', event => {
    console.log('[SW] Installing Saudi-optimized service worker...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching Saudi static resources...');
                return cache.addAll(SAUDI_RESOURCES);
            }),
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('[SW] Dynamic cache initialized for Saudi content...');
                return Promise.resolve();
            })
        ]).then(() => {
            console.log('[SW] Saudi-optimized service worker installed successfully');
            return self.skipWaiting();
        }).catch(error => {
            console.error('[SW] Installation failed:', error);
        })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Saudi-optimized service worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Saudi-optimized service worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - Serve cached content with Saudi SEO optimization
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests except for fonts and images
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.googleapis.com') && 
        !url.hostname.includes('fonts.gstatic.com') &&
        !url.hostname.includes('0zz0.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                // Serve from cache with Saudi SEO headers
                const response = cachedResponse.clone();
                
                // Add Saudi-specific headers for SEO
                if (request.url.includes('.html') || request.url.endsWith('/')) {
                    const headers = new Headers(response.headers);
                    headers.set('X-Saudi-SEO', 'Optimized');
                    headers.set('X-Content-Region', 'Saudi Arabia');
                    headers.set('X-Service-Cities', SAUDI_KEYWORDS.slice(0, 6).join(', '));
                    
                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: headers
                    });
                }
                
                return cachedResponse;
            }
            
            // Fetch from network and cache Saudi-relevant content
            return fetch(request).then(networkResponse => {
                // Only cache successful responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                
                // Determine cache strategy based on content type
                const responseClone = networkResponse.clone();
                const contentType = networkResponse.headers.get('content-type') || '';
                
                if (shouldCacheResource(request.url, contentType)) {
                    const cacheToUse = isStaticResource(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
                    
                    caches.open(cacheToUse).then(cache => {
                        cache.put(request, responseClone);
                        console.log(`[SW] Cached Saudi resource: ${request.url}`);
                    });
                }
                
                return networkResponse;
            }).catch(error => {
                console.error('[SW] Fetch failed:', error);
                
                // Return offline fallback for HTML pages
                if (request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
                
                throw error;
            });
        })
    );
});

// Helper function to determine if resource should be cached
function shouldCacheResource(url, contentType) {
    // Cache Saudi-specific content
    const saudiKeywordMatch = SAUDI_KEYWORDS.some(keyword => 
        url.includes(encodeURIComponent(keyword)) || 
        url.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (saudiKeywordMatch) return true;
    
    // Cache static resources
    if (isStaticResource(url)) return true;
    
    // Cache HTML, CSS, JS, images, fonts
    const cacheableTypes = [
        'text/html',
        'text/css', 
        'application/javascript',
        'text/javascript',
        'image/',
        'font/',
        'application/font'
    ];
    
    return cacheableTypes.some(type => contentType.includes(type));
}

// Helper function to identify static resources
function isStaticResource(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => url.includes(ext));
}

// Background sync for Saudi user analytics
self.addEventListener('sync', event => {
    if (event.tag === 'saudi-analytics-sync') {
        event.waitUntil(syncSaudiAnalytics());
    }
});

// Sync Saudi-specific analytics data
async function syncSaudiAnalytics() {
    try {
        // Get stored analytics data
        const cache = await caches.open(DYNAMIC_CACHE);
        const analyticsData = await cache.match('/saudi-analytics-data');
        
        if (analyticsData) {
            const data = await analyticsData.json();
            
            // Send to analytics endpoint (replace with actual endpoint)
            await fetch('/api/saudi-analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    region: 'Saudi Arabia',
                    cities: SAUDI_KEYWORDS.slice(0, 6),
                    timestamp: Date.now()
                })
            });
            
            // Clear cached analytics data after successful sync
            await cache.delete('/saudi-analytics-data');
            console.log('[SW] Saudi analytics data synced successfully');
        }
    } catch (error) {
        console.error('[SW] Saudi analytics sync failed:', error);
    }
}

// Push notification handler for Saudi users
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'إشعار جديد من مُشرقة AI',
        icon: 'https://www2.0zz0.com/2025/06/23/22/317775783.png',
        badge: 'https://www2.0zz0.com/2025/06/23/22/317775783.png',
        dir: 'rtl',
        lang: 'ar-SA',
        tag: 'saudi-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'عرض',
                icon: 'https://www2.0zz0.com/2025/06/23/22/317775783.png'
            },
            {
                action: 'dismiss',
                title: 'إغلاق'
            }
        ],
        data: {
            url: data.url || '/',
            region: 'Saudi Arabia'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || 'مُشرقة AI - الذكاء الاصطناعي السعودية',
            options
        )
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        const url = event.notification.data?.url || '/';
        
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window/tab
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    }
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_SAUDI_CONTENT') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then(cache => {
                return cache.addAll(event.data.urls || []);
            })
        );
    }
});

// Periodic background sync for Saudi content updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'saudi-content-update') {
        event.waitUntil(updateSaudiContent());
    }
});

// Update Saudi-specific content in background
async function updateSaudiContent() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        
        // Update sitemap and robots.txt for Saudi SEO
        const saudiSEOFiles = ['/sitemap.xml', '/robots.txt', '/schema-saudi-seo.json'];
        
        for (const file of saudiSEOFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    await cache.put(file, response);
                    console.log(`[SW] Updated Saudi SEO file: ${file}`);
                }
            } catch (error) {
                console.warn(`[SW] Failed to update ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('[SW] Saudi content update failed:', error);
    }
}

console.log('[SW] BrightAI Saudi-optimized Service Worker loaded successfully');