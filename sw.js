// Spazio — service worker: NETWORK-FIRST.
// Prima prova la rete (così hai sempre l'ultima versione), poi ripiega sulla
// cache solo se sei offline. Il vecchio SW era cache-first: ti serviva sempre
// la pagina vecchia e gli aggiornamenti non arrivavano mai.
const C = 'spazio-v9';
const SHELL = ['.', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) { const clone = res.clone(); caches.open(C).then(c => c.put(req, clone)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
