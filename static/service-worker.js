const CACHE_NAME = 'wizard-companion-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/sitemap.xml',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-180.png',
  'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.violet.min.css',
]

// Install event - cache basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
})

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})
