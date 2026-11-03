/* Zockwerk – eigene Bildchen statt Emojis (window.ZHI). Alle Linien selbst gezeichnet (24 × 24, runde Enden), keine fremden Symbole.
   ZHI.i(name, klasse) gibt ein <svg> zurück, das das Bildchen aus dem Sprite holt. ZHI.gear(n, r1, r2) malt ein Zahnrad (viewBox 100). */
(() => {
  'use strict';
  const P = {
    home: '<path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1V9.5"/>',
    bug: '<rect x="7" y="8" width="10" height="12" rx="5"/><path d="M9.2 8.2a2.8 2.8 0 0 1 5.6 0M12 12v8M3.5 13H7M17 13h3.5M5 7.5l2.6 2.2M19 7.5l-2.6 2.2M5 19.5l2.6-2.2M19 19.5l-2.6-2.2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
    send: '<path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.4 1.1 2.2h5c0-.8.3-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.5 4M16 6h2.5a2.5 2.5 0 0 1-2.5 4M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    news: '<rect x="3" y="4" width="14.5" height="16" rx="2"/><path d="M17.5 8H21v10a2 2 0 0 1-2 2H6M6.5 8h7.5M6.5 12h7.5M6.5 16H11"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6M12 17.4v.01"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cog: '<circle cx="12" cy="12" r="2.8"/><circle cx="12" cy="12" r="6.4"/><path d="M12 2.5v3.1M12 18.4v3.1M2.5 12h3.1M18.4 12h3.1M5.3 5.3l2.2 2.2M16.5 16.5l2.2 2.2M18.7 5.3l-2.2 2.2M7.5 16.5l-2.2 2.2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    chev: '<path d="M6 9.5l6 6 6-6"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16 7l2.5 2.5M13.5 9.5L16 12"/>',
    sparkle: '<path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7zM19 16c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16.2 14.1A5 5 0 0 1 21.5 19"/>',
    thumb: '<path d="M7 10.5V20H4v-9.5zM7 10.5L11 3a2 2 0 0 1 2.3 2.4L12.6 9h5.6a2 2 0 0 1 2 2.4l-1.3 6.8a2.2 2.2 0 0 1-2.2 1.8H7"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
    map: '<path d="M9 4L3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 3h2.8l2 5.2M15.5 3h-2.8l-.9 2.4"/><path d="M12 12.6l.8 1.5 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3z"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5.5 16h13"/>',
    sprout: '<path d="M12 21v-8M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 15.5c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/>',
    bolt: '<path d="M13 2.5L4.5 14h7l-1 7.5L19 10h-7z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    flag: '<path d="M5.5 21V4M5.5 4H17l-2.2 4L17 12H5.5"/>',
    refresh: '<path d="M19.5 11A7.5 7.5 0 0 0 6.2 6.6L4.5 8.5M4.5 4.5v4h4M4.5 13a7.5 7.5 0 0 0 13.3 4.4l1.7-1.9M19.5 19.5v-4h-4"/>',
    castle: '<path d="M4 21V8h3v2h2V8h2v2h2V8h2v2h2V8h3v13z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    chat: '<path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"/><path d="M8 10.8h.01M12 10.8h.01M16 10.8h.01"/>',
    pencil: '<path d="M4 20l1-4.2L15.8 5l3.2 3.2L8.2 19z"/><path d="M13.6 7.2l3.2 3.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 6.2c.5-.1.9-.2 1.4-.2 5 0 8.5 4 9.5 6-.4.9-1.3 2.2-2.6 3.4M6.2 7.6C4.4 8.8 3.1 10.5 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.3 4-.9"/>',
    gamepad: '<path d="M7 8h10a4 4 0 0 1 3.9 4.9l-1 4.2a2.4 2.4 0 0 1-4.2.9L14 16h-4l-1.7 2a2.4 2.4 0 0 1-4.2-.9l-1-4.2A4 4 0 0 1 7 8z"/><path d="M8 10.8v3M6.5 12.3h3M15.5 11.5h.01M17.5 13.5h.01"/>'
  };
  /** Zahnrad als Pfad in einer viewBox von 100 × 100 (Mitte 50/50), mit Loch in der Mitte */
  function gear(n, r1, r2) {
    const st = Math.PI * 2 / n, pts = [];
    for (let i = 0; i < n; i++) {
      const a = i * st;
      pts.push([r1, a - st * 0.28], [r2, a - st * 0.13], [r2, a + st * 0.13], [r1, a + st * 0.28]);
    }
    const h = r1 * 0.42, f = v => v.toFixed(1);
    return 'M' + pts.map(([r, a]) => f(50 + r * Math.cos(a)) + ' ' + f(50 + r * Math.sin(a))).join('L') + 'Z' +
      'M' + f(50 + h) + ' 50a' + f(h) + ' ' + f(h) + ' 0 1 0 ' + f(-2 * h) + ' 0a' + f(h) + ' ' + f(h) + ' 0 1 0 ' + f(2 * h) + ' 0Z';
  }
  let s = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">';
  for (const k in P) s += '<symbol id="zi-' + k + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + P[k] + '</symbol>';
  document.body.insertAdjacentHTML('afterbegin', s + '</svg>');
  window.ZHI = { i: (k, c) => '<svg class="ic' + (c ? ' ' + c : '') + '" aria-hidden="true"><use href="#zi-' + k + '"/></svg>', gear, has: k => !!P[k] };
})();
