// Service worker della versione web: l'app si apre anche senza connessione.
// Le pagine e i file dell'app (stessa origine) si servono dalla cache e si aggiornano
// in background; mappe, meteo e API esterne non passano di qui (le mappe hanno la loro cache).
// Generato alla compilazione (vite.config.js): versione e file dell'app da tenere offline.
const CACHE = 'mare-monti-app-0.11.0-mvzaq9c7';
const PRECACHE = ["./assets/index-BiYGMsxm.js","./assets/error-BTdmRKoB.js","./assets/index-BQOYusft.css","./data/land-it.json","./icon.svg","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./manifest.webmanifest"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...PRECACHE])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // ignoreVary: i file salvati all'installazione non hanno l'intestazione Origin delle richieste dei moduli
      const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate', ignoreVary: true });
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      // pagina: prima la rete (per avere subito gli aggiornamenti), poi la cache
      if (req.mode === 'navigate') return (await network) || cached || cache.match('./', { ignoreVary: true });
      // file con nome versionato (assets): prima la cache
      return cached || (await network) || Response.error();
    }),
  );
});
