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

// Network-first caching strategy: coba ambil dari server dulu, jika gagal (offline/lemot), ambil dari cache
self.addEventListener('fetch', (event) => {
    // Hanya tangani GET requests
    if (event.request.method !== 'GET') return;

    // Jangan cache request ke Inertia data (yang header X-Inertia = true)
    if (event.request.headers.has('X-Inertia')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Jika response sukses, simpan di cache
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Jika offline, kembalikan dari cache
                return caches.match(event.request);
            })
    );
});
