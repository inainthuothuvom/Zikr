var CACHE_NAME = 'sorgathin-pathai-v2';
var urlsToCache = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './script-utils.js',
    './script-supabase.js',
    './script-auth.js',
    './script-hadiya.js',
    './script-report.js',
    './script-notify.js',
    './script-email.js',
    './script-main.js',
    './config.js',
    './secrets.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/thumbnail.jpeg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Skip non-GET and external API calls (Supabase, EmailJS, Groq, etc.)
    if (event.request.method !== 'GET') return;
    var url = event.request.url;
    if (url.includes('supabase.co') || url.includes('emailjs') || url.includes('groq.com') || url.includes('googleapis.com') || url.includes('gstatic.com') || url.includes('jsdelivr.net')) {
        return;
    }
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request).then(function(fetchRes) {
                // Cache new resources dynamically
                if (fetchRes && fetchRes.status === 200 && fetchRes.type === 'basic') {
                    var clone = fetchRes.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return fetchRes;
            }).catch(function() {
                // Offline fallback
                return caches.match('./index.html');
            });
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) { return name !== CACHE_NAME; }).map(function(name) { return caches.delete(name); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});
