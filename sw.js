var CACHE_NAME = 'zikr-cache-v1';
var urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script-utils.js',
    './script-supabase.js',
    './script-auth.js',
    './script-hadiya.js',
    './script-report.js',
    './script-notify.js',
    './script-main.js',
    './config.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) return response;
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName !== CACHE_NAME;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
