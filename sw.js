const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const APP_SHELL = [
    './',
    './index.html',
    './img/logo.jpeg',
    './css/styles.css',
    './css/patient.css',
    './css/bootstrap.min.css',
    './js/bootstrap.min.js',
    './js/bootstrap.bundle.min.js',
    './js/app.js',
    './js/config.js',
    './js/jsQR.js',
    './js/admin/adminDashboard.js',
    './js/admin/admintk.js',
    './js/admin/beds.js',
    './js/admin/nourse.js',
    './js/admin/patient.js',
    './js/admin/rooms.js',
    './js/logAuth/auth.js',
    './js/login/login.js',
    './js/nourse/nourse.js',
    './js/patient/patient.js',
    './modules/admin/dashboard.html',
    './modules/admin/patient.html',
    './modules/admin/nourse.html',
    './modules/admin/assignments.html',
    './modules/admin/rooms.html',
    './modules/admin/beds.html',
    './modules/auth/login.html',
    './modules/patient/patient.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const results = await Promise.allSettled(
      APP_SHELL.map((url) => cache.add(url))
    );
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length) {
      console.warn('[SW] Algunos recursos no se precachearon (continuando):', failed.length);
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; 

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const respClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            // Evita cachear respuestas no válidas
            if (request.url.startsWith(self.location.origin) && response.ok) {
              cache.put(request, respClone);
            }
          });
          return response;
        })
        .catch(() => {
          return caches.match('./index.html');
        });
    })
  );
});
