/* Das Zockwerk ist umgezogen nach https://zockwerk.github.io/zockwerk/. Dieser Offline-Speicher räumt auf den Handys auf:
   alten Speicher löschen, sich selbst abmelden und offene Fenster neu laden (dann leitet die Seite weiter). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) { try { c.navigate(c.url); } catch (er) { /* egal */ } }
})()));
