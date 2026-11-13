/* Zockwerk – Offline-Speicher. Immer zuerst aus dem Netz holen (damit neue Beiträge sofort da sind),
   ohne Netz die zuletzt gespeicherte Fassung zeigen. Bei neuen Dateien unten in FILES eintragen und VER hochzählen. */
const VER = 'zmh-6';
const FILES = ['./', 'index.html', 'css/app.css', 'js/icons.js', 'js/code.js', 'js/spiele.js', 'js/app.js', 'daten/beitraege.js', 'daten/fehler.js', 'daten/ideen.js',
  'daten/fragen.js', 'daten/helfer.js', 'daten/artikel.js', 'manifest.webmanifest', 'img/kacheln.webp', 'img/icon-192.png', 'img/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VER).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
