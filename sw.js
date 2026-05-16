const CACHE = 'tamil-dict-v1';
const ASSETS = [
  'tamil-dictionary',
  'tamil-dictionary/index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&family=Baloo+2:wght@400;600;700;800&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // For MyMemory API calls — network only (don't cache translations in SW)
  if (e.request.url.includes('mymemory.translated.net')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }
  // For everything else — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
