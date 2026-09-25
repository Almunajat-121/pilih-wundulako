const CACHE_NAME = 'pilihpilih-v1';
const STATIC_ASSETS = [
    '/',
    '/login',
    '/manifest.json',
    // Karena kita pakai Vite, file CSS dan JS di-hash, 
    // jadi kita akan cache asset tersebut secara dinamis (network first)
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Network-first caching strategy
self.addEventListener('fetch', (event) => {
    // Hanya tangani GET requests
    if (event.request.method !== 'GET') return;

    // Abaikan request dari chrome-extension atau skema non-http
    if (!event.request.url.startsWith('http')) return;

    // Jangan cache request ke Inertia data (yang header X-Inertia = true)
    if (event.request.headers.has('X-Inertia')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Jika response sukses, simpan di cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Jika offline, kembalikan dari cache, atau kembalikan response error jika tidak ada di cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Jika tidak ada di cache sama sekali, kita harus mengembalikan sebuah Response valid
                    return new Response('Network error happened', {
                        status: 408,
                        headers: { 'Content-Type': 'text/plain' },
                    });
                });
            })
    );
});
