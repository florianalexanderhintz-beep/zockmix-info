/* Zockwerk – Offline-Speicher. Immer zuerst aus dem Netz holen (damit neue Beiträge sofort da sind),
   ohne Netz die zuletzt gespeicherte Fassung zeigen. Bei neuen Dateien unten in FILES eintragen und VER hochzählen.
   Wichtig (13.11.2026): Das Netz wird mit cache: 'no-cache' gefragt – sonst liefert der Browser bis zu 10 Minuten lang die alte Datei
   aus seinem eigenen Zwischenspeicher (GitHub Pages erlaubt 10 Minuten), und die als App installierte Seite zeigt noch die alte Fassung.
   Der Server antwortet bei unveränderten Dateien nur kurz „unverändert“ (304), das kostet kaum Daten. */
const VER = 'zmh-7';
const FILES = ['./', 'index.html', 'css/app.css', 'js/icons.js', 'js/code.js', 'js/spiele.js', 'js/app.js', 'daten/beitraege.js', 'daten/fehler.js', 'daten/ideen.js',
  'daten/fragen.js', 'daten/helfer.js', 'daten/artikel.js', 'manifest.webmanifest', 'img/kacheln.webp', 'img/icon-192.png', 'img/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VER).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
