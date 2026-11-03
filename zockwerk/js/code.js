/* Zockwerk – Helfer-Codes (window.ZHC). Ein Code sieht so aus: ZM-ABCD-2345 (8 Zeichen ohne I, O, 0, 1).
   In daten/helfer.js steht NIE der Code selbst, nur seine Prüfsumme (hash). Wer den Code kennt, sieht seine Helfer-Karte. */
(() => {
  'use strict';
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // cyrb53: kleine, schnelle Prüfsumme (53 Bit) – reicht, damit man aus der Prüfsumme den Code nicht ablesen kann
  function cyrb53(s, seed) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  }
  // Eingabe aufräumen: Groß, ohne Striche/Leerzeichen, „ZM“ vorne weg; verwechselbare Zeichen werden passend gemacht
  function norm(s) {
    let c = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (c.length === 10 && c.slice(0, 2) === 'ZM') c = c.slice(2);
    return c.replace(/0/g, 'Q').replace(/O/g, 'Q').replace(/[1I]/g, 'L');
  }
  const ok = c => c.length === 8 && [...c].every(ch => ABC.includes(ch));
  const hash = s => { const c = norm(s); return ok(c) ? cyrb53('zmh1:' + c, 7) : ''; };
  const fmt = s => { const c = norm(s); return ok(c) ? 'ZM-' + c.slice(0, 4) + '-' + c.slice(4) : ''; };
  function make() {
    const r = new Uint32Array(8); crypto.getRandomValues(r);
    let c = ''; for (const x of r) c += ABC[x % ABC.length];
    return fmt(c);
  }
  window.ZHC = { norm, ok: s => ok(norm(s)), hash, fmt, make };
})();
