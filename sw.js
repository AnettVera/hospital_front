const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const APP_SHELL = [
    './',
    './img/logo.jpeg',
    './css/styles.css',
    './index.html',
    './js/admin.js',
    './js/app.js',
    './js/beds.js',
    './js/includes.js',
    './js/includes.js',
    './js/rooms.js',
    './modules/admin/admin.html',
    './modules/admin/assignments-content.html',
    './modules/admin/beds-content.html',
    './modules/admin/dashboard-content.html',
    './modules/admin/nourse-content.html',
    './modules/admin/patient-content.html',
    './modules/admin/rooms-content.html',
    './modules/auth/login.html',
    './partials/admin-layout.html',
    './partials/footer.html',
    './partials/head.html',
    './main.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    '',
];

self.addEventListener('install', event => {
    const cacheStatic = caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(APP_SHELL));

    event.waitUntil(cacheStatic);
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(networkResponse => {
                        // Only cache resources from fullCalendar or select2
                        if (event.request.url.includes('fullcalendar') || 
                            event.request.url.includes('select2')) {
                            return caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(event.request, networkResponse.clone());
                                    return networkResponse;
                                });
                        }
                        return networkResponse;
                    });
            })
            .catch(() => {
                return new Response('Offline content not available');
            })
    );
});