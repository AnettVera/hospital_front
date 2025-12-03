const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const APP_SHELL = [
    '/',
    '/img/logo.jpeg',
    '/css/styles.css',
    '/css/patient.css',
    '/css/bootstrap.min.css',
    '/js/bootstrap.min.js',
    '/js/bootstrap.bundle.min.js',
    '/js/app.js',
    '/js/admin.js',
    '/js/beds.js',
    '/js/includes.js',
    '/js/rooms.js',
    '/modules/admin/admin.html',
    '/modules/admin/assignments-content.html',
    '/modules/admin/beds-content.html',
    '/modules/admin/dashboard-content.html',
    '/modules/admin/nourse-content.html',
    '/modules/admin/patient-content.html',
    '/modules/admin/rooms-content.html',
    '/modules/auth/login.html',
    '/partials/admin-layout.html',
    '/partials/footer.html',
    '/partials/head.html',
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
    // Activación rápida en primera carga
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
  if (request.method !== 'GET') return; // Solo cacheamos GET

  // Estrategia: Cache falling back to network
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
          // Podrías retornar una página offline personalizada aquí si lo deseas
          return caches.match('/index.html');
        });
    })
  );
});

