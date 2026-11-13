/* Zockwerk – die Zockmix-Werkstatt (früher „Zockmix-Hilfe“). Die ganze Oberfläche: eine Seite, fünf Reiter
   (Start, Fehler, Melden, Ideen, Helfer). Daten: daten/*.js → window.ZH { posts, bugs, ideas, faq, helpers } – nur der Entwickler trägt dort ein.
   Bildchen: js/icons.js (window.ZHI, selbst gezeichnete Linien statt Emojis). Animationen nur über transform/opacity,
   alles aus bei „weniger Bewegung“ (prefers-reduced-motion).
   Nichts wird verschickt: „Melden“ baut nur eine fertige E-Mail, die man selbst im E-Mail-Programm abschickt.
   Auf dem Handy gemerkt (localStorage, nur Bequemlichkeit, darf fehlen): Sprache, Entwurf, Helfer-Code, letzter Besuch. */
(() => {
  'use strict';
  const ZH = window.ZH || {}, C = window.ZHC, Z = window.ZHI, I = (k, c) => Z.i(k, c);
  const MAIL = 'zockmix.games@gmail.com';
  const INFO = 'https://florianalexanderhintz-beep.github.io/zockmix-info/';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('zmh-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('zmh-' + k, JSON.stringify(v)); } catch (e) { /* privat/voll – egal */ } },
    del(k) { try { localStorage.removeItem('zmh-' + k); } catch (e) { /* egal */ } }
  };
  const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- Sprache ----------
  let EN = (() => { const l = LS.get('lang', ''); return l ? l === 'en' : !/^de/i.test(navigator.language || 'de'); })();
  const T = (de, en) => (EN ? en : de);
  const F = (o, k) => (o && ((EN && o.en && o.en[k]) || (o.de && o.de[k]))) || '';
  const fmtDate = d => {
    if (!d) return '';
    const [y, m, t] = String(d).split('-').map(Number);
    return new Date(y, m - 1, t).toLocaleDateString(EN ? 'en-US' : 'de-DE', { day: 'numeric', month: EN ? 'short' : 'long', year: 'numeric' });
  };
  const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');

  // ---------- Tabellen ----------
  // Bereiche: [Schlüssel, Deutsch, Englisch, Farbe]
  const AREAS = [
    ['spiele', 'Spiele', 'Games', '#ff8a4d'], ['zocki', 'Zocki', 'Zocki', '#ff9fd0'], ['chillmix', 'Chillmix', 'Chillmix', '#5fe0a0'],
    ['spukmix', 'Spukmix', 'Spukmix', '#b894ff'], ['baumix', 'Baumix', 'Baumix', '#ffc24d'], ['burg', 'Burg-Wächter', 'Castle Guard', '#d8ad72'],
    ['beatmix', 'Beatmix', 'Beatmix', '#ff6fae'], ['malmix', 'Malmix', 'Malmix', '#ffe066'], ['quizmix', 'Quizmix', 'Quizmix', '#5fd8ff'],
    ['lernmix', 'Lernmix', 'Lernmix', '#4fe3c1'], ['sim', 'Simulatoren', 'Simulators', '#86a8ff'],
    ['app', 'Startseite & Einstellungen', 'Home & settings', '#b7c2e8'], ['sonst', 'Etwas anderes', 'Something else', '#a3adcc']
  ];
  const area = k => AREAS.find(a => a[0] === k) || AREAS[AREAS.length - 1];
  const areaName = k => { const a = area(k); return T(a[1], a[2]); };
  const areaTag = k => '<span class="area" style="--a:' + area(k)[3] + '">' + esc(areaName(k)) + '</span>';
  // Kachel-Bilder aus Zockmix (js/spiele.js + img/kacheln.webp, gemacht mit tools/kacheln.js): alle Spiele, Bereiche und Simulatoren
  const G = window.ZHG || { cols: 1, rows: 1, games: [], apps: [] };
  const GAMES = G.games.map(g => ({ id: g[0], de: g[1], en: g[2], cat: g[3], n: g[4] })), GAPPS = G.apps.map(g => ({ id: g[0], de: g[1], en: g[2], n: g[3] }));
  const tileOf = id => GAMES.find(g => g.id === id) || GAPPS.find(g => g.id === id);
  const tName = t => (t ? T(t.de, t.en) : '');
  const SIMS = ['handysim', 'pcsim', 'konsolensim'];
  const CATS = [['action', 'Renn- & Action-Spiele', 'Racing & Action Games'], ['knobel', 'Knobel-Spiele', 'Puzzle Games'], ['strat', 'Strategie & Geschick', 'Strategy & Skill']];
  // Auswahl „Welches Spiel?“ gibt es bei Spiele und Simulatoren
  const pickList = a => (a === 'spiele' ? GAMES : a === 'sim' ? GAPPS.filter(t => SIMS.includes(t.id)) : []);
  function art(id, cls) {
    const t = tileOf(id); if (!t) return '';
    const x = (t.n % G.cols) * 100 / Math.max(1, G.cols - 1), y = Math.floor(t.n / G.cols) * 100 / Math.max(1, G.rows - 1);
    return '<span class="art' + (cls ? ' ' + cls : '') + '" style="background-position:' + x.toFixed(3) + '% ' + y.toFixed(3) + '%;background-size:' + G.cols * 100 + '% ' + G.rows * 100 + '%" aria-hidden="true"></span>';
  }
  // Bild eines Bereichs: die Zockmix-Kachel (Bereiche unter „Mehr Spaß“) oder ein eigenes Bildchen auf seiner Farbe (Spiele, Startseite, Sonstiges)
  const AART = { zocki: 'zocki', chillmix: 'chillmix', spukmix: 'spukmix', baumix: 'baumix', burg: 'burg', beatmix: 'beatmix', malmix: 'malmix', quizmix: 'quizmix', lernmix: 'lernmix', sim: 'pcsim' };
  const AICON = { spiele: 'gamepad', app: 'home', sonst: 'help' }, ACOL = { spiele: '#ff7a3a', app: '#4f7dff', sonst: '#8a6cff' };
  const areaArt = (k, cls, ic) => (!ic && AART[k] && tileOf(AART[k]) ? art(AART[k], cls)
    : '<span class="art ico' + (cls ? ' ' + cls : '') + '" style="--a:' + (ACOL[k] || area(k)[3]) + '" aria-hidden="true">' + I(ic || AICON[k] || 'help') + '</span>');
  // Spiel zu einem Fehler/einer Idee: Feld g oder der Name in „wo“ (z. B. „Rohr-Meister“) – nur passend zum Bereich
  function gameOf(x) {
    if (!x) return '';
    const l = pickList(x.a); if (x.g && l.some(t => t.id === x.g)) return x.g;
    const w = fold((x.de && x.de.w) || '') + ' ' + fold((x.en && x.en.w) || ''); if (!w.trim()) return '';
    const t = l.find(t => w.includes(fold(t.de)) || w.includes(fold(t.en)));
    return t ? t.id : '';
  }
  const thumb = x => { const g = gameOf(x); return g ? art(g, 'th') : areaArt(x.a, 'th'); };
  // Stand: [Bildchen, Deutsch, Englisch, Farbe, läuft gerade (pulsiert)]
  const BS = { offen: ['flag', 'Gemeldet', 'Reported', '#ff6b7a', 0], pruef: ['search', 'Wird geprüft', 'Checking', '#ffb84d', 1],
    arbeit: ['cog', 'Wird repariert', 'Being fixed', '#5aa8ff', 1], fertig: ['check', 'Behoben', 'Fixed', '#3ddc78', 0], kein: ['info', 'Kein Fehler', 'Not a bug', '#a3adcc', 0] };
  const IS = { idee: ['bulb', 'Idee', 'Idea', '#b894ff', 0], geplant: ['calendar', 'Geplant', 'Planned', '#ffb84d', 0], arbeit: ['cog', 'In Arbeit', 'In progress', '#5aa8ff', 1],
    fertig: ['check', 'Fertig', 'Done', '#3ddc78', 0], nein: ['x', 'Passt nicht', 'Not planned', '#a3adcc', 0] };
  const PK = { neu: ['sparkle', 'Neu', 'New', '#3ddc78'], update: ['refresh', 'Update', 'Update', '#5aa8ff'], tipp: ['bulb', 'Tipp', 'Tip', '#ffb84d'],
    test: ['flask', 'Test', 'Test', '#b894ff'], info: ['info', 'Info', 'Info', '#5fd8ff'] };
  const KINDS = { fehler: ['bug', 'Fehler', 'Bug', '#ff6b7a'], idee: ['bulb', 'Idee', 'Idea', '#ffc93d'], frage: ['help', 'Frage', 'Question', '#5aa8ff'], lob: ['heart', 'Lob', 'Praise', '#ff6fae'] };
  // Ränge: [ab Punkten, Bildchen, Deutsch, Englisch, Farbe]
  const RANKS = [[0, 'sprout', 'Neuling', 'Rookie', '#6fd36f'], [10, 'thumb', 'Helfer', 'Helper', '#4fd0ff'], [30, 'compass', 'Entdecker', 'Explorer', '#6a8cff'],
    [60, 'star', 'Profi', 'Pro', '#ffc93d'], [100, 'medal', 'Meister', 'Master', '#ff9440'], [200, 'crown', 'Legende', 'Legend', '#ff5fae']];
  const rankOf = p => { let i = 0; RANKS.forEach((r, j) => { if (p >= r[0]) i = j; }); return i; };
  const PTS = { bugFirst: 10, bugToo: 5, bugNo: 2, idea: { idee: 3, geplant: 8, arbeit: 8, fertig: 15, nein: 2 } };
  const POINTS = [
    ['bug', PTS.bugFirst, 'Einen echten Fehler als Erstes gemeldet', 'Reported a real bug first'],
    ['users', PTS.bugToo, 'Den gleichen Fehler auch gemeldet', 'Reported the same bug too'],
    ['info', PTS.bugNo, 'War doch kein Fehler – trotzdem danke!', 'Turned out not to be a bug – thanks anyway!'],
    ['bulb', PTS.idea.idee, 'Eine Idee eingeschickt', 'Sent in an idea'],
    ['calendar', PTS.idea.geplant, 'Deine Idee kommt auf den Plan', 'Your idea goes on the plan'],
    ['sparkle', PTS.idea.fertig, 'Deine Idee ist fertig in Zockmix', 'Your idea is in Zockmix'],
    ['flask', 20, 'Beim Testen einer neuen Version geholfen', 'Helped test a new version'],
    ['map', 5, 'Ein hilfreicher Tipp', 'A helpful tip']
  ];
  // Abzeichen: [id, Bildchen, Name de, Name en, Text de, Text en, Bedingung (null = nur von Hand), Farbe]
  const BADGES = [
    ['kaefer1', 'bug', 'Erster Käfer', 'First bug', 'Einen echten Fehler als Erstes gemeldet', 'Reported a real bug first', s => s.firsts >= 1, '#ff6b7a'],
    ['jaeger', 'search', 'Bug-Jäger', 'Bug hunter', '5 Fehler als Erstes gemeldet', 'Reported 5 bugs first', s => s.firsts >= 5, '#ff8a4d'],
    ['idee1', 'bulb', 'Ideengeber', 'Idea maker', 'Eine Idee kam auf den Plan', 'An idea made it onto the plan', s => s.acc >= 1, '#ffc93d'],
    ['blitz', 'bolt', 'Ideen-Blitz', 'Idea storm', '3 Ideen kamen auf den Plan', '3 ideas made it onto the plan', s => s.acc >= 3, '#ffe066'],
    ['bau', 'cog', 'Umgesetzt!', 'Built it!', 'Eine deiner Ideen ist fertig', 'One of your ideas is done', s => s.done >= 1, '#3ddc78'],
    ['tester', 'flask', 'Tester', 'Tester', 'Beim Testen geholfen', 'Helped with testing', s => s.test >= 1, '#b894ff'],
    ['tipp', 'map', 'Tipp-Geber', 'Tip giver', '3 hilfreiche Tipps', '3 helpful tips', s => s.tipp >= 3, '#5fd8ff'],
    ['ersttester', 'medal', 'Erste Tester', 'First testers', 'Beim allerersten Test vor dem Start dabei', 'Part of the very first test before launch', null, '#ffb84d'],
    ['dank', 'heart', 'Großes Danke', 'Big thanks', 'Hat Zockmix ganz besonders geholfen', 'Helped Zockmix in a special way', null, '#ff6fae']
  ];
  const EXK = { test: 'flask', tipp: 'map', hilfe: 'heart' };

  const posts = (ZH.posts || []).slice().sort((a, b) => String(b.d).localeCompare(String(a.d)));
  const bugs = ZH.bugs || [], ideas = ZH.ideas || [], faq = ZH.faq || [], helpers = ZH.helpers || [], guides = ZH.guides || [];
  const ACT = b => b.s === 'offen' || b.s === 'pruef' || b.s === 'arbeit';   // Fehler, die es gerade noch gibt
  const byId = id => helpers.find(h => h.id === id);
  const findAny = id => bugs.find(x => x.id === id) || ideas.find(x => x.id === id) || posts.find(x => x.id === id) || guides.find(x => x.id === id);

  // ---------- Likes/Stimmen ohne Server: gemerkt auf dem Handy (zmh-likes { id: { b: Zahl beim Liken, s: 1 = verschickt } }),
  // gezählt werden sie erst, wenn man sie per E-Mail schickt (Leiste #vbar). Angezeigt: offizielle Zahl (Beitrag l, Idee v, Fehler n),
  // mit eigenem Like mindestens eins mehr als beim Liken – zählt der Entwickler die Stimme dazu, gibt es nichts doppelt.
  let likes = LS.get('likes', {}) || {};
  const baseOf = id => { const o = findAny(id); return o ? (o.l || o.v || o.n || 0) | 0 : 0; };
  const likeCount = id => { const n = baseOf(id), L = likes[id]; return L ? Math.max(n, (L.b | 0) + 1) : n; };
  const unsent = () => Object.keys(likes).filter(id => !likes[id].s && findAny(id));
  const LK = { heart: ['Gefällt mir', 'Like', '#ff6fae'], thumb: ['Will ich auch', 'Want it too', '#5aa8ff'], users: ['Hab ich auch', 'Me too', '#ffb84d'] };
  function likeBtn(id, kind) {
    const on = !!likes[id], n = likeCount(id), k = LK[kind];
    return '<button class="like' + (on ? ' on' : '') + '" data-like="' + esc(id) + '" data-kind="' + kind + '" aria-pressed="' + on + '" style="--c:' + k[2] + '">' +
      I(kind) + '<span>' + T(k[0], k[1]) + '</span>' + (n ? '<b>' + n + '</b>' : '') + '</button>';
  }

  function score(h) {
    const it = [], s = { firsts: 0, acc: 0, done: 0, test: 0, tipp: 0 };
    bugs.forEach(b => {
      const i = (b.by || []).indexOf(h.id); if (i < 0) return;
      const no = b.s === 'kein', p = no ? PTS.bugNo : i === 0 ? PTS.bugFirst : PTS.bugToo;
      if (i === 0 && !no) s.firsts++;
      it.push({ d: b.f || b.d, e: no ? 'info' : i === 0 ? 'bug' : 'users', p, t: F(b, 't'), ref: '#fehler/' + b.id, id: b.id });
    });
    ideas.forEach(x => {
      if (!(x.by || []).includes(h.id)) return;
      const p = PTS.idea[x.s] || PTS.idea.idee;
      if (x.s === 'geplant' || x.s === 'arbeit' || x.s === 'fertig') s.acc++;
      if (x.s === 'fertig') s.done++;
      it.push({ d: x.u || x.d, e: IS[x.s] ? IS[x.s][0] : 'bulb', p, t: F(x, 't'), ref: '#ideen/' + x.id, id: x.id });
    });
    (h.extra || []).forEach(e => {
      if (e.k === 'test') s.test++;
      if (e.k === 'tipp') s.tipp++;
      it.push({ d: e.d, e: EXK[e.k] || 'heart', p: e.p | 0, t: (EN && e.en) || e.de || '' });
    });
    it.sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
    const pts = it.reduce((n, x) => n + x.p, 0);
    const got = BADGES.filter(b => (b[6] ? b[6](s) : (h.badges || []).includes(b[0])));
    return { it, pts, s, got };
  }

  // ---------- kleine Helfer ----------
  function inl(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((#[a-z0-9/_-]+|https:\/\/[^)\s]+)\)/gi, (m, t, u) => '<a href="' + u + '"' + (u[0] === '#' ? '' : ' target="_blank" rel="noopener"') + '>' + t + '</a>');
  }
  function md(s) {
    return String(s || '').trim().split(/\n\s*\n/).map(p => {
      const ls = p.split('\n');
      if (ls.every(l => /^\s*[-•]\s/.test(l))) return '<ul>' + ls.map(l => '<li>' + inl(l.replace(/^\s*[-•]\s/, '')) + '</li>').join('') + '</ul>';
      return '<p>' + ls.map(inl).join('<br>') + '</p>';
    }).join('');
  }
  // Rund-Bildchen in Farbe (Ränge, Abzeichen, Beiträge)
  const emb = (icon, col, cls) => '<span class="emb' + (cls ? ' ' + cls : '') + '" style="--c:' + col + '">' + I(icon) + '</span>';
  // Helfer-Bild: eigenes Emoji (falls eingetragen) oder Anfangsbuchstabe auf einer Farbe aus dem Namen
  const HUES = ['#ff6b7a', '#ff9440', '#ffc93d', '#3ddc78', '#4fd0ff', '#6a8cff', '#b894ff', '#ff6fae'];
  function av(h, cls) {
    const n = String(h.n || '?'); let k = 0; for (const ch of n) k = (k * 31 + ch.charCodeAt(0)) >>> 0;
    return '<span class="av' + (cls ? ' ' + cls : '') + '" style="--c:' + HUES[k % HUES.length] + '">' + esc(h.av || n.trim().charAt(0).toUpperCase()) + '</span>';
  }
  const pill = (s, live) => '<span class="pill' + (s[4] || live ? ' live' : '') + '" style="--c:' + s[3] + '">' + I(s[0]) + T(s[1], s[2]) + '</span>';
  const head = (icon, col, title, sub) => '<header class="vhead rv">' + emb(icon, col, 'big') + '<div><h1 class="vh">' + title + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div></header>';

  let toastT = 0;
  function toast(t, icon) {
    const el = $('#toast'); el.innerHTML = (icon ? I(icon) : '') + '<span>' + esc(t) + '</span>'; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600);
  }
  async function copy(text, okMsg) {
    let ok = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } } catch (e) { /* weiter unten */ }
    if (!ok) {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
    }
    if (ok) toast(okMsg || T('Kopiert!', 'Copied!'), 'check');
    else toast(T('Kopieren ging nicht – bitte von Hand markieren.', 'Couldn’t copy – please select it by hand.'), 'info');
  }

  // ---------- NEU seit dem letzten Besuch ----------
  const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  const prevSeen = LS.get('seen', '');
  LS.set('seen', today);
  const isNew = (...ds) => !!prevSeen && ds.some(d => d && d > prevSeen);
  const newBadge = (...ds) => (isNew(...ds) ? ' <span class="new">' + T('NEU', 'NEW') + '</span>' : '');
  const dots = { start: posts.some(p => isNew(p.d)) || guides.some(a => isNew(a.d)), fehler: bugs.some(b => ACT(b) && isNew(b.d, b.u)), ideen: ideas.some(x => isNew(x.d, x.u)) };

  // ---------- Zustand ----------
  const TABS = ['start', 'fehler', 'melden', 'ideen', 'helfer'];
  const TL = { start: ['home', 'Start', 'Home'], fehler: ['bug', 'Fehler', 'Bugs'], melden: ['send', 'Melden', 'Report'], ideen: ['bulb', 'Ideen', 'Ideas'], helfer: ['trophy', 'Helfer', 'Helpers'] };
  // Unterseiten ohne eigenen Reiter (unten leuchtet dann der Reiter daneben): #artikel, #artikel/a3
  const PAGES = { artikel: 'start' };
  const tabOf = v => PAGES[v] || v, posOf = v => (PAGES[v] ? TABS.indexOf(PAGES[v]) + 0.5 : TABS.indexOf(v));
  let cur = '', focusId = '', introDone = false;
  const st = { bf: 'alle', ba: '', bq: '', idf: 'alle', thx: false, burst: false, gq: '', allPosts: false };
  const D0 = () => ({ k: 'fehler', ref: '', a: '', g: '', w: '', x: '', st: '', oft: '', dev: '', ver: '', log: '', nick: '', pub: false });
  let draft = Object.assign(D0(), LS.get('draft', {}) || {});
  let saveT = 0;
  const saveDraft = () => { clearTimeout(saveT); saveT = setTimeout(() => LS.set('draft', draft), 300); };

  // ---------- Kopf und Leiste ----------
  function paintChrome() {
    document.documentElement.lang = EN ? 'en' : 'de';
    document.title = 'Zockwerk';
    $$('.langsw button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.l === 'en') === EN)));
    const tb = $('#tabs');
    if (!tb.dataset.ok) {
      tb.innerHTML = '<b class="ind" aria-hidden="true"></b>' + TABS.map(t => '<a href="#' + t + '" data-tab="' + t + '"' + (t === 'melden' ? ' class="mid"' : '') + '>' +
        '<i>' + I(TL[t][0]) + '</i><span></span><b class="dot" hidden></b></a>').join('');
      tb.dataset.ok = '1';
    }
    const ct = tabOf(cur);
    $$('#tabs a').forEach(a => {
      const t = a.dataset.tab, on = t === ct;
      a.querySelector('span').textContent = T(TL[t][1], TL[t][2]);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      a.querySelector('.dot').hidden = !(dots[t] && !on);
    });
    tb.style.setProperty('--i', TABS.indexOf(ct));
    tb.classList.toggle('onmid', ct === 'melden');
  }

  // ---------- Reiter: Start ----------
  function vStart() {
    const fixed = bugs.filter(b => b.s === 'fertig').length, work = bugs.filter(b => b.s === 'arbeit' || b.s === 'pruef').length + ideas.filter(x => x.s === 'arbeit').length,
      done = ideas.filter(x => x.s === 'fertig').length;
    const letters = (w, o) => [...w].map((c, i) => '<i style="--i:' + (i + o) + '">' + c + '</i>').join('');
    const g = Z.gear;
    const intro = !introDone && !RM; introDone = true;
    // Werkstatt: was gerade läuft und was zuletzt fertig wurde (jeder sieht hier, was aus den Meldungen geworden ist)
    const nowL = bugs.filter(b => b.s === 'arbeit' || b.s === 'pruef').map(b => ({ x: b, k: 'b', s: BS[b.s], d: b.u || b.d }))
      .concat(ideas.filter(x => x.s === 'arbeit' || x.s === 'geplant').map(x => ({ x, k: 'i', s: IS[x.s], d: x.u || x.d })))
      .sort((a, b) => (b.s[4] - a.s[4]) || String(b.d).localeCompare(String(a.d))).slice(0, 4);
    const doneL = bugs.filter(b => b.s === 'fertig').map(b => ({ x: b, k: 'b', d: b.f || b.d }))
      .concat(ideas.filter(x => x.s === 'fertig').map(x => ({ x, k: 'i', d: x.u || x.d })))
      .sort((a, b) => String(b.d).localeCompare(String(a.d))).slice(0, 4);
    const row = e => '<a class="wrow rv" href="#' + (e.k === 'b' ? 'fehler' : 'ideen') + '/' + esc(e.x.id) + '">' +
      (e.s ? pill(e.s) : '<span class="tick">' + I('check') + '</span>') + '<span class="wt">' + esc(F(e.x, 't')) + '<small>' + areaName(e.x.a) + (e.s ? '' : ' · ' + fmtDate(e.d)) + '</small></span>' + I('arrow', 'go') + '</a>';
    return '<section class="hero' + (intro ? ' intro' : '') + '">' +
      '<div class="gears" aria-hidden="true"><svg class="g1" viewBox="0 0 100 100"><path d="' + g(12, 40, 48) + '"/></svg>' +
      '<svg class="g2" viewBox="0 0 100 100"><path d="' + g(9, 38, 48) + '"/></svg><svg class="g3" viewBox="0 0 100 100"><path d="' + g(8, 37, 48) + '"/></svg></div>' +
      '<div class="glow" aria-hidden="true"></div>' +
      '<h1 class="logo" aria-label="Zockwerk"><span class="l1">' + letters('ZOCK', 0) + '</span><span class="l2">' + letters('WERK', 4) + '</span></h1>' +
      '<div class="hl">' + T('Die Zockmix-Werkstatt', 'The Zockmix workshop') + '</div>' +
      '<div class="balls" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<p class="lead">' + T('Neuigkeiten, bekannte Fehler und Ideen rund um Zockmix – und hier kannst du uns schreiben.', 'News, known bugs and ideas all about Zockmix – and you can write to us here.') + '</p>' +
      '<div class="qbtns"><a class="btn" href="#melden" data-k="fehler">' + I('bug') + T('Fehler melden', 'Report a bug') + '</a>' +
      '<a class="btn b2" href="#melden" data-k="idee">' + I('bulb') + T('Idee schicken', 'Send an idea') + '</a></div>' +
      '<button class="btn ghost sm" id="instBtn"' + (instEv ? '' : ' hidden') + '>' + I('download') + T('Als App aufs Handy', 'Add to your phone') + '</button>' +
      '</section>' +
      '<div class="stats">' +
      '<a href="#fehler/behoben" class="stat rv" style="--c:#3ddc78">' + I('check') + '<b data-count="' + fixed + '">' + fixed + '</b><span>' + T('Fehler behoben', 'bugs fixed') + '</span></a>' +
      '<a href="#fehler" data-bf="arbeit" class="stat rv" style="--c:#5aa8ff">' + I('cog', 'spin') + '<b data-count="' + work + '">' + work + '</b><span>' + T('in Arbeit', 'in progress') + '</span></a>' +
      '<a href="#ideen" data-if="fertig" class="stat rv" style="--c:#ffc93d">' + I('sparkle') + '<b data-count="' + done + '">' + done + '</b><span>' + T('Ideen fertig', 'ideas done') + '</span></a></div>' +
      (nowL.length || doneL.length ? '<h2 class="rv">' + I('cog') + T('Aus der Werkstatt', 'From the workshop') + '</h2><div class="card work rv">' +
        (nowL.length ? '<h3>' + T('Gerade dran', 'Working on it') + '</h3>' + nowL.map(row).join('') : '') +
        (doneL.length ? '<h3>' + T('Zuletzt fertig', 'Recently done') + '</h3>' + doneL.map(row).join('') : '') + '</div>' : '') +
      (guides.length ? '<h2 class="rv">' + I('map') + T('Zockwerk-Artikel', 'Zockwerk articles') + '<a class="h2more" href="#artikel">' + T('Alle', 'All') + I('arrow') + '</a></h2>' +
        '<div class="hrow rv">' + guides.map(gCard).join('') + '<a class="acard all" href="#artikel">' + I('arrow') + '<b>' + T('Alle Artikel', 'All articles') + '</b></a></div>' : '') +
      '<h2 class="rv">' + I('news') + T('Neuigkeiten', 'News') + '</h2>' +
      (posts.length ? posts.slice(0, st.allPosts ? posts.length : PN).map(post).join('') +
        (!st.allPosts && posts.length > PN ? '<button class="btn ghost wide rv" id="pmore">' + I('chev') + T('Ältere Neuigkeiten zeigen', 'Show older news') + ' (' + (posts.length - PN) + ')</button>' : '')
        : '<p class="empty">' + T('Noch keine Beiträge.', 'No posts yet.') + '</p>') +
      '<h2 class="rv">' + I('help') + T('Häufige Fragen', 'Questions') + '</h2><div class="faq">' +
      faq.map(f => '<details class="rv"><summary>' + esc(F(f, 'q')) + I('chev', 'chev') + '</summary><div class="tx">' + md(F(f, 'a')) + '</div></details>').join('') + '</div>' +
      about();
  }
  function post(p) {
    const k = PK[p.k] || PK.info, x = F(p, 'x'), long = x.length > 320, ic = p.ic && Z.has(p.ic) ? p.ic : k[0];
    return '<article class="card post rv" id="p-' + esc(p.id) + '">' +
      '<div class="ph">' + emb(ic, k[3], 'pem') + '<div>' +
      '<div class="meta"><span class="tag" style="--c:' + k[3] + '">' + T(k[1], k[2]) + '</span>' + fmtDate(p.d) + newBadge(p.d) + '</div>' +
      '<h3>' + esc(F(p, 't')) + '</h3></div></div>' +
      '<div class="tx' + (long ? ' clamp' : '') + '">' + md(x) + '</div>' +
      (long ? '<button class="more" data-more>' + T('Weiterlesen', 'Read more') + I('chev') + '</button>' : '') +
      '<div class="pfoot">' + likeBtn(p.id, 'heart') + '</div></article>';
  }
  const PN = 4;   // so viele Neuigkeiten zeigt der Start zuerst, der Rest kommt mit „Ältere Neuigkeiten zeigen“

  // ---------- Zockwerk-Artikel (Startseite + Seite #artikel, Daten: daten/artikel.js) ----------
  const gArt = (a, cls) => (a.g && tileOf(a.g) ? art(a.g, cls) : areaArt(a.a, cls, a.ic));
  const kTag = k => '<span class="tag" style="--c:' + k[3] + '">' + T(k[1], k[2]) + '</span>';
  function gCard(a) {
    return '<a class="acard" href="#artikel/' + esc(a.id) + '">' + gArt(a) + '<span class="at"><span class="am">' + kTag(PK[a.k] || PK.info) + newBadge(a.d) + '</span><b>' + esc(F(a, 't')) + '</b></span></a>';
  }
  function vArticles() {
    const a = guides.find(x => x.id === focusId);
    if (!a) {
      return head('map', '#5fd8ff', T('Zockwerk-Artikel', 'Zockwerk articles'), T('Anleitungen und Tipps rund um Zockmix – damit du noch mehr Spaß hast.', 'Guides and tips all about Zockmix – so you have even more fun.')) +
        guides.map(x => '<a class="card arow rv" href="#artikel/' + esc(x.id) + '">' + gArt(x) + '<span class="wt"><span class="am">' + kTag(PK[x.k] || PK.info) + newBadge(x.d) + '</span><b>' + esc(F(x, 't')) + '</b><small>' + esc(F(x, 's')) + '</small></span>' + I('arrow', 'go') + '</a>').join('') +
        '<div class="card cta rv"><p>' + T('Wünschst du dir einen Artikel zu einem Thema?', 'Want an article about a topic?') + '</p><a class="btn" href="#melden" data-k="idee">' + I('bulb') + T('Schreib es uns', 'Tell us') + '</a></div>';
    }
    const more = guides.filter(x => x !== a);
    return '<a class="back rv" href="#artikel">' + I('arrow', 'flip') + T('Alle Artikel', 'All articles') + '</a>' +
      '<article class="card read rv">' + gArt(a, 'hero') + '<div class="meta">' + kTag(PK[a.k] || PK.info) + areaTag(a.a) + newBadge(a.d) + '</div>' +
      '<h1 class="vh">' + esc(F(a, 't')) + '</h1><p class="lead2">' + esc(F(a, 's')) + '</p><div class="tx">' + md(F(a, 'x')) + '</div>' +
      '<div class="pfoot">' + likeBtn(a.id, 'heart') + '</div></article>' +
      '<div class="card cta rv"><p>' + T('Noch eine Frage dazu?', 'Still have a question?') + '</p><a class="btn" href="#melden" data-k="frage" data-a="' + esc(a.a) + '">' + I('help') + T('Frage stellen', 'Ask a question') + '</a></div>' +
      (more.length ? '<h2 class="rv">' + I('map') + T('Mehr Artikel', 'More articles') + '</h2><div class="hrow rv">' + more.map(gCard).join('') + '</div>' : '');
  }
  function about() {
    return '<details class="card about rv"><summary>' + I('lock') + T('Über diese Seite', 'About this page') + I('chev', 'chev') + '</summary><div class="tx">' +
      md(T('Das Zockwerk **sammelt keine Daten**: keine Anmeldung, keine Cookies, keine Werbung, keine Statistik. Nur auf deinem Handy merkt es sich deine Sprache, deinen Entwurf beim Melden, deine Likes und deinen Helfer-Code – das kannst du jederzeit löschen.\n\nWenn du etwas meldest, öffnet sich dein E-Mail-Programm mit dem fertigen Text. Du siehst genau, was drinsteht, und schickst es selbst ab. Wir nutzen deine E-Mail nur, um dir zu antworten.',
        'Zockwerk **collects no data**: no sign-up, no cookies, no ads, no statistics. Only on your phone it remembers your language, your report draft, your likes and your helper code – you can delete that at any time.\n\nWhen you report something, your e-mail app opens with the finished text. You see exactly what’s in it and send it yourself. We only use your e-mail to answer you.')) +
      '<p class="links"><a href="' + INFO + 'datenschutz.html#' + (EN ? 'en' : 'de') + '" target="_blank" rel="noopener">' + T('Datenschutz', 'Privacy policy') + '</a>' +
      '<a href="' + INFO + 'impressum.html#' + (EN ? 'en' : 'de') + '" target="_blank" rel="noopener">' + T('Impressum', 'Legal notice') + '</a>' +
      '<a href="' + INFO + '#' + (EN ? 'en' : 'de') + '" target="_blank" rel="noopener">' + T('Über Zockmix', 'About Zockmix') + '</a></p>' +
      '<button class="btn ghost sm" id="wipe">' + I('trash') + T('Auf diesem Handy Gemerktes löschen', 'Delete what this phone remembers') + '</button></div></details>';
  }

  // ---------- Reiter: Fehler ----------
  // Die Liste zeigt nur Fehler, die es gerade noch gibt. Behobene (und „kein Fehler“) verschwinden von dort und stehen nur noch
  // zugeklappt unter „Schon behoben“ (Direkt-Links wie #fehler/F-003 zeigen sie oben; #fehler/behoben klappt die Liste auf).
  const BGRP = { alle: null, offen: ['offen', 'pruef'], arbeit: ['arbeit'] };
  const BORD = { arbeit: 0, pruef: 1, offen: 2, fertig: 3, kein: 4 };
  function vBugs() {
    if (!(st.bf in BGRP)) st.bf = 'alle';
    const act = bugs.filter(ACT), gone = bugs.filter(b => !ACT(b)).sort((a, b) => String(b.f || b.u || b.d).localeCompare(String(a.f || a.u || a.d)));
    const cnt = g => act.filter(b => !BGRP[g] || BGRP[g].includes(b.s)).length;
    const used = AREAS.filter(a => act.some(b => b.a === a[0]));
    if (st.ba && !used.some(a => a[0] === st.ba)) st.ba = '';
    const hit = focusId && gone.find(b => b.id === focusId);
    return head('bug', '#ff6b7a', T('Bekannte Fehler', 'Known bugs'), T('Diese Fehler gibt es gerade noch – wir kümmern uns darum. Ist einer behoben, verschwindet er von hier.',
      'These bugs still exist right now – we’re on it. Once a bug is fixed, it disappears from here.')) +
      (hit ? '<p class="fhint rv">' + I('check') + T('Dieser Fehler ist schon behoben:', 'This bug is already fixed:') + '</p>' + bug(hit) : '') +
      (act.length ? (act.length > 4 ? '<div class="tools rv"><label class="sbox">' + I('search') + '<input type="search" id="bq" value="' + esc(st.bq) + '" placeholder="' + T('Suchen …', 'Search …') + '" aria-label="' + T('Fehler suchen', 'Search bugs') + '"></label></div>' : '') +
        (used.length > 1 ? '<div class="chips achips rv" role="group" aria-label="' + T('Bereich', 'Area') + '"><button data-ba="" aria-pressed="' + !st.ba + '">' + T('Alle Bereiche', 'All areas') + '</button>' +
          used.map(a => '<button data-ba="' + a[0] + '" aria-pressed="' + (st.ba === a[0]) + '">' + areaArt(a[0], 'xs') + esc(areaName(a[0])) + '</button>').join('') + '</div>' : '') +
        '<div class="chips rv" role="group">' + [['alle', 'Alle', 'All'], ['offen', 'Gemeldet', 'Reported'], ['arbeit', 'Wird repariert', 'Being fixed']]
          .map(c => '<button data-bf="' + c[0] + '" aria-pressed="' + (st.bf === c[0]) + '">' + T(c[1], c[2]) + ' <small>' + cnt(c[0]) + '</small></button>').join('') + '</div>' +
        '<div id="blist">' + bugList() + '</div>'
        : '<div class="card allgood rv">' + emb('check', '#3ddc78', 'big') + '<h3>' + T('Gerade ist kein Fehler bekannt!', 'No known bugs right now!') + '</h3><p>' +
          T('Alles, was ihr gemeldet habt, ist repariert. Danke fürs Melden!', 'Everything you reported has been fixed. Thanks for reporting!') + '</p></div>') +
      (gone.length ? fixedBox(gone) : '') +
      '<div class="card cta rv"><p>' + T('Dein Fehler ist nicht dabei?', 'Your bug isn’t listed?') + '</p><a class="btn" href="#melden" data-k="fehler">' + I('bug') + T('Fehler melden', 'Report a bug') + '</a></div>';
  }
  function fixedBox(l) {
    return '<details class="card fixed rv" id="i-behoben"' + (focusId === 'behoben' ? ' open' : '') + '><summary>' + emb('check', '#3ddc78') +
      '<span class="wt">' + T('Schon behoben', 'Already fixed') + ' <b class="cnt">' + l.length + '</b><small>' + T('Diese Fehler sind weg – bitte Zockmix aktualisieren.', 'These bugs are gone – please update Zockmix.') + '</small></span>' + I('chev', 'chev') + '</summary>' +
      '<div class="flist">' + l.map(b => '<a class="wrow" href="#fehler/' + esc(b.id) + '">' + thumb(b) + '<span class="wt">' + esc(F(b, 't')) + '<small>' + areaName(b.a) + ' · ' +
        (b.s === 'kein' ? T('Kein Fehler', 'Not a bug') : T('behoben', 'fixed') + ' ' + fmtDate(b.f || b.d)) + '</small></span>' + I('arrow', 'go') + '</a>').join('') + '</div></details>';
  }
  function bugList() {
    const q = fold(st.bq).trim();
    const l = bugs.filter(b => ACT(b) && (!BGRP[st.bf] || BGRP[st.bf].includes(b.s)) && (!st.ba || b.a === st.ba) &&
      (!q || fold([b.id, F(b, 't'), F(b, 'w'), F(b, 'x'), F(b, 'h'), areaName(b.a)].join(' ')).includes(q)))
      .sort((a, b) => (BORD[a.s] - BORD[b.s]) || String(b.f || b.u || b.d).localeCompare(String(a.f || a.u || a.d)));
    return l.length ? l.map(bug).join('') : '<div class="empty rv">' + I('search', 'big') + '<p>' + T('Nichts gefunden.', 'Nothing found.') + '</p></div>';
  }
  function credit(by) {
    const pub = (by || []).map(byId).filter(h => h && h.pub);
    if (!pub.length) return '';
    const rest = (by || []).length - Math.min(3, pub.length);
    return '<span class="credit"><span class="avs">' + pub.slice(0, 3).map(h => av(h, 'sm')).join('') + '</span>' + T('Danke an', 'Thanks to') + ' ' +
      pub.slice(0, 2).map(h => esc(h.n)).join(', ') + (rest > 0 || pub.length > 2 ? ' +' + Math.max(rest, pub.length - 2) : '') + '</span>';
  }
  function bug(b) {
    const s = BS[b.s] || BS.offen, h = F(b, 'h'), w = F(b, 'w'), done = b.s === 'fertig' || b.s === 'kein';
    return '<article class="card item rv' + (focusId === b.id ? ' hit' : '') + '" id="i-' + esc(b.id) + '" style="--c:' + s[3] + '">' +
      '<div class="ih">' + pill(s) + '<a class="iid" href="#fehler/' + esc(b.id) + '">' + esc(b.id) + '</a>' + newBadge(b.d, b.f, b.u) + '</div>' +
      '<div class="ttl">' + thumb(b) + '<h3>' + esc(F(b, 't')) + '</h3></div>' +
      '<div class="meta">' + areaTag(b.a) + (w ? '<span class="where">' + esc(w) + '</span>' : '') + '</div>' +
      (F(b, 'x') ? '<div class="tx">' + md(F(b, 'x')) + '</div>' : '') +
      (h ? '<div class="note tip">' + I('bulb') + '<span><b>' + T('Tipp', 'Tip') + ':</b> ' + inl(h) + '</span></div>' : '') +
      (b.s === 'fertig' && b.f ? '<div class="note ok">' + I('check') + '<span>' + T('Behoben am', 'Fixed on') + ' ' + fmtDate(b.f) + ' – ' + T('bitte Zockmix aktualisieren.', 'please update Zockmix.') + '</span></div>' : '') +
      '<div class="ifoot">' + credit(b.by) + '<span class="acts2">' + (done ? '<button class="btn sm ghost" data-me="' + esc(b.id) + '">' + I('refresh') + T('Immer noch da?', 'Still there?') + '</button>'
        : '<button class="link sm" data-me="' + esc(b.id) + '">' + I('pencil') + T('Mehr erzählen', 'Tell us more') + '</button>' + likeBtn(b.id, 'users')) + '</span></div>' +
      '</article>';
  }

  // ---------- Reiter: Ideen ----------
  const IGRP = { alle: null, plan: ['geplant', 'arbeit'], fertig: ['fertig'], idee: ['idee'], nein: ['nein'] };
  const IORD = { arbeit: 0, geplant: 1, idee: 2, fertig: 3, nein: 4 };
  function vIdeas() {
    const cnt = g => ideas.filter(x => !IGRP[g] || IGRP[g].includes(x.s)).length;
    return head('bulb', '#ffc93d', T('Ideen & Pläne', 'Ideas & plans'), T('Was ist geplant, was bauen wir gerade, was ist schon fertig?', 'What’s planned, what are we building, what’s done?')) +
      '<div class="chips rv" role="group">' + [['alle', 'Alle', 'All'], ['plan', 'Geplant', 'Planned'], ['fertig', 'Fertig', 'Done'], ['idee', 'Ideen', 'Ideas'], ['nein', 'Passt nicht', 'Not planned']]
        .map(c => '<button data-if="' + c[0] + '" aria-pressed="' + (st.idf === c[0]) + '">' + T(c[1], c[2]) + ' <small>' + cnt(c[0]) + '</small></button>').join('') + '</div>' +
      '<div id="ilist">' + ideaList() + '</div>' +
      '<div class="card cta rv"><p>' + T('Du hast eine Idee für Zockmix?', 'Got an idea for Zockmix?') + '</p><a class="btn" href="#melden" data-k="idee">' + I('bulb') + T('Idee schicken', 'Send an idea') + '</a></div>';
  }
  function ideaList() {
    const l = ideas.filter(x => !IGRP[st.idf] || IGRP[st.idf].includes(x.s))
      .sort((a, b) => (IORD[a.s] - IORD[b.s]) || String(b.u || b.d).localeCompare(String(a.u || a.d)));
    return l.length ? l.map(idea).join('') : '<div class="empty rv">' + I('bulb', 'big') + '<p>' + T('Hier ist gerade nichts.', 'Nothing here right now.') + '</p></div>';
  }
  function idea(x) {
    const s = IS[x.s] || IS.idee, r = F(x, 'r'), open = x.s !== 'fertig' && x.s !== 'nein';
    return '<article class="card item rv' + (focusId === x.id ? ' hit' : '') + '" id="i-' + esc(x.id) + '" style="--c:' + s[3] + '">' +
      '<div class="ih">' + pill(s) + '<a class="iid" href="#ideen/' + esc(x.id) + '">' + esc(x.id) + '</a>' + newBadge(x.d, x.u) + '</div>' +
      '<div class="ttl">' + thumb(x) + '<h3>' + esc(F(x, 't')) + '</h3></div><div class="meta">' + areaTag(x.a) + '</div>' +
      (F(x, 'x') ? '<div class="tx">' + md(F(x, 'x')) + '</div>' : '') +
      (r ? '<div class="note dev">' + I('chat') + '<span>' + inl(r) + '</span></div>' : '') +
      '<div class="ifoot">' + credit(x.by) + '<span class="acts2">' + (open ? '<button class="link sm" data-me="' + esc(x.id) + '">' + I('pencil') + T('Mehr dazu schreiben', 'Add your thoughts') + '</button>' + likeBtn(x.id, 'thumb')
        : x.s === 'fertig' ? likeBtn(x.id, 'heart') : '') + '</span></div></article>';
  }

  // ---------- Reiter: Melden ----------
  const findRef = id => bugs.find(b => b.id === id) || ideas.find(x => x.id === id);
  const QL = { fehler: ['Was ist passiert?', 'What happened?', 'Erzähl genau, was du gesehen hast. Was hast du erwartet?', 'Tell us exactly what you saw. What did you expect?'],
    idee: ['Was ist deine Idee?', 'What’s your idea?', 'Was soll es geben? Warum wäre das toll?', 'What should be added? Why would it be great?'],
    frage: ['Deine Frage', 'Your question', 'Was möchtest du wissen?', 'What would you like to know?'],
    lob: ['Was gefällt dir?', 'What do you like?', 'Was macht dir am meisten Spaß?', 'What’s the most fun for you?'] };
  function vReport() {
    if (st.thx) return thanks();
    const d = draft, k = KINDS[d.k] ? d.k : 'fehler', ref = d.ref && findRef(d.ref);
    const steps = [['send', 'Du schickst die E-Mail', 'You send the e-mail'], ['search', 'Wir lesen und prüfen sie', 'We read and check it'],
      ['globe', 'Sie kommt in die Liste – jeder sieht den Stand', 'It goes on the list – everyone sees its status'], ['trophy', 'Hilft sie: Punkte für dich', 'If it helps: points for you']];
    return head('send', '#ff6fae', T('Melden', 'Report'), T('Erzähl uns, was los ist. Am Ende öffnet sich dein E-Mail-Programm mit dem fertigen Text – du schickst ihn selbst ab.',
      'Tell us what’s going on. At the end your e-mail app opens with the finished text – you send it yourself.')) +
      '<ol class="flow rv">' + steps.map((s, i) => '<li style="--i:' + i + '"><span>' + I(s[0]) + '</span><b>' + T(s[1], s[2]) + '</b></li>').join('') + '</ol>' +
      '<div class="card safe rv">' + I('shield') + '<span>' + T('<b>Wichtig:</b> Schreib keinen echten Namen, keine Adresse und keine Telefonnummer. Bist du unter 16? Dann frag einen Erwachsenen, bevor du die E-Mail abschickst.',
        '<b>Important:</b> Don’t write your real name, address or phone number. Are you under 16? Then ask an adult before you send the e-mail.') + '</span></div>' +
      '<form id="mf" class="form rv" novalidate>' +
      '<fieldset class="kinds"><legend>' + T('Was möchtest du schicken?', 'What would you like to send?') + '</legend>' +
      Object.keys(KINDS).map(key => '<label class="kind' + (key === k ? ' on' : '') + '" style="--c:' + KINDS[key][3] + '"><input type="radio" name="k" value="' + key + '"' + (key === k ? ' checked' : '') + '>' +
        I(KINDS[key][0]) + '<span>' + T(KINDS[key][1], KINDS[key][2]) + '</span></label>').join('') + '</fieldset>' +
      (ref ? '<div class="refchip">' + I('link') + '<span>' + T('Gehört zu', 'About') + ' <b>' + esc(d.ref) + '</b>: ' + esc(F(ref, 't')) + '</span>' +
        '<button type="button" data-unref aria-label="' + T('Verbindung lösen', 'Remove link') + '">' + I('x') + '</button></div>' : '') +
      '<fieldset class="apick"><legend>' + T('Bereich', 'Area') + ' <em>*</em> <small>' + T('(antippen – wischen für mehr)', '(tap one – swipe for more)') + '</small></legend>' +
      '<div class="hscroll" id="arow">' + AREAS.map(a => '<button type="button" class="atile' + (d.a === a[0] ? ' on' : '') + '" data-area="' + a[0] + '" aria-pressed="' + (d.a === a[0]) + '">' +
        areaArt(a[0]) + '<span>' + esc(areaName(a[0])) + '</span></button>').join('') + '</div></fieldset>' +
      '<div id="gpick">' + gPick() + '</div>' +
      '<label class="fl">' + T('Wo genau?', 'Where exactly?') + ' <small>' + T('(wenn du es weißt)', '(if you know)') + '</small>' +
      '<input data-f="w" maxlength="80" value="' + esc(d.w) + '" placeholder="' + T('z. B. Level 7, im Pause-Menü', 'e.g. level 7, in the pause menu') + '"></label>' +
      '<div id="kpart">' + kindPart() + '</div>' +
      '<div class="row2"><label class="fl">' + T('Handy-Modell', 'Phone model') + '<input data-f="dev" maxlength="60" value="' + esc(d.dev) + '" placeholder="' + T('steht in den Handy-Einstellungen', 'see your phone’s settings') + '"></label>' +
      '<label class="fl">' + T('Zockmix-Version', 'Zockmix version') + '<input data-f="ver" maxlength="20" inputmode="decimal" value="' + esc(d.ver) + '" placeholder="' + T('z. B. 2.900', 'e.g. 2.900') + '"></label></div>' +
      '<p class="hint">' + T('Die Version steht ganz unten auf der Zockmix-Startseite.', 'The version is at the very bottom of the Zockmix home screen.') + '</p>' +
      '<label class="fl">' + T('Spitzname', 'Nickname') + ' <small>' + T('(freiwillig – nie dein echter Name)', '(optional – never your real name)') + '</small>' +
      '<input data-f="nick" maxlength="20" value="' + esc(d.nick) + '" placeholder="' + T('z. B. Blitzfuchs', 'e.g. Thunderfox') + '"></label>' +
      '<label class="check fancy"><input type="checkbox" data-f="pub"' + (d.pub ? ' checked' : '') + '><i>' + I('check') + '</i><span>' +
      T('Wenn ich Punkte bekomme, darf mein Spitzname auf die Ehrenliste.', 'If I earn points, my nickname may appear on the hall of fame.') + '</span></label>' +
      '<div class="err" id="merr" role="alert" hidden></div>' +
      '<div class="acts"><button type="submit" class="btn big">' + I('mail') + T('E-Mail öffnen', 'Open e-mail') + '</button>' +
      '<button type="button" class="btn ghost" id="mcopy">' + I('copy') + T('Text kopieren', 'Copy text') + '</button></div>' +
      '<details class="prev"><summary>' + I('search') + '<span>' + T('So sieht deine Nachricht aus', 'Preview your message') + '</span>' + I('chev', 'chev') + '</summary><pre id="mprev">' + esc(mailBody()) + '</pre></details>' +
      '<p class="hint">' + T('Kein E-Mail-Programm? Kopiere den Text und schick ihn an', 'No e-mail app? Copy the text and send it to') + ' <b>' + MAIL + '</b> ' +
      '<button type="button" class="link" id="mcaddr">' + T('Adresse kopieren', 'Copy address') + '</button></p>' +
      '<button type="button" class="link" id="mclear">' + I('trash') + T('Formular leeren', 'Clear form') + '</button>' +
      '</form>';
  }
  // Felder, die von der Art abhängen (Frage-Text, bei Fehlern Schritte, Wie oft, Fehler-Liste) – beim Wechsel der Art wird nur das neu gemalt
  function kindPart() {
    const d = draft, k = KINDS[d.k] ? d.k : 'fehler', q = QL[k], bugK = k === 'fehler';
    return '<label class="fl">' + T(q[0], q[1]) + ' <em>*</em><textarea data-f="x" rows="5" maxlength="3000" placeholder="' + T(q[2], q[3]) + '">' + esc(d.x) + '</textarea></label>' +
    (bugK ? '<label class="fl">' + T('Wie kann man den Fehler auslösen?', 'How can we make the bug happen?') + ' <small>' + T('(Schritt für Schritt)', '(step by step)') + '</small>' +
      '<textarea data-f="st" rows="3" maxlength="1500" placeholder="' + T('1. Zockmix öffnen&#10;2. …', '1. Open Zockmix&#10;2. …') + '">' + esc(d.st) + '</textarea></label>' +
      '<fieldset class="seg"><legend>' + T('Wie oft passiert das?', 'How often does it happen?') + '</legend>' +
      [['immer', 'Immer', 'Always'], ['manchmal', 'Manchmal', 'Sometimes'], ['einmal', 'Nur einmal', 'Just once']].map(o =>
        '<label' + (d.oft === o[0] ? ' class="on"' : '') + '><input type="radio" name="oft" value="' + o[0] + '"' + (d.oft === o[0] ? ' checked' : '') + '>' + T(o[1], o[2]) + '</label>').join('') + '</fieldset>' +
      '<details class="opt"' + (d.log ? ' open' : '') + '><summary>' + I('copy') + '<span>' + T('Fehler-Liste aus Zockmix einfügen', 'Paste the error list from Zockmix') + ' <small>' + T('(hilft uns sehr)', '(helps a lot)') + '</small></span>' + I('chev', 'chev') + '</summary>' +
      '<p class="hint">' + T('In Zockmix: Einstellungen → „Hilfe für Tester“ → „Fehler-Liste“ → „Kopieren“. Dann hier lange drücken und „Einfügen“ wählen.',
        'In Zockmix: Settings → “Help for testers” → “Error list” → “Copy”. Then long-press here and choose “Paste”.') + '</p>' +
      '<textarea data-f="log" rows="4" maxlength="20000" aria-label="' + T('Fehler-Liste', 'Error list') + '">' + esc(d.log) + '</textarea></details>' : '');
  }
  // Hintergrund leuchtet in der Farbe der gewählten Art (nur auf „Melden“), weich überblendet über die Farbe --kc von #tint
  const KTINT = { fehler: 'rgba(255, 120, 40, .58)', idee: 'rgba(255, 172, 28, .55)', frage: 'rgba(56, 132, 255, .6)', lob: 'rgba(255, 30, 60, .72)' };
  function tint() {
    const el = $('#tint'); if (!el) return;
    const k = st.thx && st.sentK ? st.sentK : draft.k;
    el.style.setProperty('--kc', cur === 'melden' ? KTINT[k] || KTINT.fehler : 'rgba(11, 22, 54, 0)');
  }
  // „Welches Spiel?“ / „Welcher Simulator?“: Kacheln mit den Zockmix-Bildern; nach dem Antippen nur noch die Wahl mit „Ändern“
  const gSel = () => (draft.g && pickList(draft.a).find(t => t.id === draft.g)) || null;
  function gPick() {
    const l = pickList(draft.a); if (!l.length) return '';
    const sim = draft.a === 'sim', sel = gSel(), lab = sim ? T('Welcher Simulator?', 'Which simulator?') : T('Welches Spiel?', 'Which game?');
    if (sel) return '<div class="fl">' + lab + '<div class="gsel">' + art(sel.id) + '<b>' + esc(tName(sel)) + '</b><button type="button" class="btn ghost sm" data-gchange>' + I('refresh') + T('Ändern', 'Change') + '</button></div></div>';
    return '<div class="fl">' + lab + ' <small>' + T('(antippen, wenn du es weißt)', '(tap it if you know)') + '</small>' +
      (sim ? '' : '<label class="sbox gq">' + I('search') + '<input type="search" id="gq" value="' + esc(st.gq) + '" placeholder="' + T('Spiel suchen …', 'Search for a game …') + '" aria-label="' + T('Spiel suchen', 'Search for a game') + '"></label>') +
      '<div class="gbox' + (sim ? ' sims' : '') + '" id="gbox">' + gList() + '</div></div>';
  }
  function gList() {
    const l = pickList(draft.a), q = fold(st.gq).trim();
    const tile = t => '<button type="button" class="gtile" data-game="' + t.id + '">' + art(t.id) + '<span>' + esc(tName(t)) + '</span></button>';
    if (draft.a === 'sim') return '<div class="ggrid">' + l.map(tile).join('') + '</div>';
    const f = l.filter(t => !q || fold(t.de + ' ' + t.en).includes(q)), other = f.filter(t => !CATS.some(c => c[0] === t.cat));
    if (!f.length) return '<p class="empty">' + T('Kein Spiel gefunden.', 'No game found.') + '</p>';
    return CATS.map(c => { const cl = f.filter(t => t.cat === c[0]); return cl.length ? '<h4>' + T(c[1], c[2]) + '</h4><div class="ggrid">' + cl.map(tile).join('') + '</div>' : ''; }).join('') +
      (other.length ? '<h4>' + T('Weitere', 'More') + '</h4><div class="ggrid">' + other.map(tile).join('') + '</div>' : '');
  }
  function formChanged() {
    const p = $('#mprev'); if (p) p.textContent = mailBody();
    const er = $('#merr'); if (er && !er.hidden && draft.a && String(draft.x).trim().length >= 8) er.hidden = true;
  }
  function thanks() {
    const burst = st.burst && !RM; st.burst = false;
    const cols = ['#ffd23d', '#ff6fae', '#5aa8ff', '#3ddc78', '#b894ff', '#ff8a4d'];
    let conf = '';
    if (burst) for (let i = 0; i < 26; i++) conf += '<i style="--x:' + (Math.random() * 2 - 1).toFixed(2) + ';--r:' + Math.round(Math.random() * 720 - 360) + 'deg;--d:' + Math.round(Math.random() * 160) + 'ms;--c:' + cols[i % cols.length] + '"></i>';
    return '<div class="card thanks' + (burst ? ' burst' : '') + '"><div class="conf" aria-hidden="true">' + conf + '</div>' +
      '<svg class="okring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34"/><path d="M25 41l10 10 20-22"/></svg>' +
      '<h2>' + T('Danke!', 'Thank you!') + '</h2>' +
      '<p>' + T('Hat sich dein E-Mail-Programm geöffnet? Dann tippe dort auf <b>Senden</b>. Wir lesen jede Nachricht – eine Antwort kann ein paar Tage dauern.',
        'Did your e-mail app open? Then tap <b>Send</b> there. We read every message – an answer can take a few days.') + '</p>' +
      '<p class="hint">' + T('Wenn wir deine Meldung aufnehmen, siehst du sie bald unter „Fehler“ oder „Ideen“. Und wenn sie uns hilft, bekommst du vielleicht einen Helfer-Code.',
        'If we add your report, you’ll soon see it under “Bugs” or “Ideas”. And if it helps us, you might get a helper code.') + '</p>' +
      '<p class="hint">' + T('Das Formular ist jetzt leer für deine nächste Meldung. Hat sich kein E-Mail-Programm geöffnet? Dann tippe auf „Zurück zum Text“.',
        'The form is now empty for your next report. Didn’t your e-mail app open? Then tap “Back to the text”.') + '</p>' +
      '<div class="acts"><button class="btn" id="tnew">' + I('plus') + T('Neue Meldung', 'New report') + '</button><button class="btn ghost" id="tback">' + I('pencil') + T('Zurück zum Text', 'Back to the text') + '</button></div></div>';
  }
  function mailSubject() {
    const k = KINDS[draft.k] || KINDS.fehler, a = draft.a ? area(draft.a) : null;
    const first = String(draft.x || '').trim().replace(/\s+/g, ' ');
    const g = gSel();
    return '[Zockmix ' + T(k[1], k[2]) + (draft.ref ? ' ' + draft.ref : '') + '] ' + (a ? (g ? tName(g) : T(a[1], a[2])) + ': ' : '') + (first.length > 50 ? first.slice(0, 48) + '…' : first);
  }
  function mailBody(cut) {
    const d = draft, k = KINDS[d.k] || KINDS.fehler, q = QL[d.k] || QL.fehler, L = [];
    L.push(T('Art', 'Type') + ': ' + T(k[1], k[2]));
    if (d.ref) { const r = findRef(d.ref); L.push(T('Gehört zu', 'About') + ': ' + d.ref + (r ? ' – ' + F(r, 't') : '')); }
    const g = gSel();
    L.push(T('Bereich', 'Area') + ': ' + (d.a ? areaName(d.a) : '–') + (g ? ' – ' + tName(g) : '') + (String(d.w || '').trim() ? ' – ' + d.w.trim() : ''));
    L.push('', T(q[0], q[1]), d.x.trim() || '…');
    if (d.k === 'fehler') {
      if (d.st.trim()) L.push('', T('So kann man ihn auslösen', 'How to make it happen') + ':', d.st.trim());
      if (d.oft) L.push('', T('Wie oft', 'How often') + ': ' + ({ immer: T('immer', 'always'), manchmal: T('manchmal', 'sometimes'), einmal: T('nur einmal', 'just once') }[d.oft] || d.oft));
    }
    if (d.dev.trim() || d.ver.trim()) L.push('');
    if (d.dev.trim()) L.push(T('Handy', 'Phone') + ': ' + d.dev.trim());
    if (d.ver.trim()) L.push(T('Zockmix-Version', 'Zockmix version') + ': ' + d.ver.trim());
    if (d.nick.trim()) L.push('', T('Spitzname', 'Nickname') + ': ' + d.nick.trim() + ' (' + T('Ehrenliste', 'hall of fame') + ': ' + (d.pub ? T('ja', 'yes') : T('nein', 'no')) + ')');
    if (d.k === 'fehler' && d.log.trim()) {
      let log = d.log.trim();
      if (cut && log.length > cut) log = log.slice(0, cut) + '\n[… ' + T('gekürzt – den Rest bitte mit „Text kopieren“ schicken', 'shortened – please send the rest with “Copy text”') + ']';
      L.push('', T('Fehler-Liste aus Zockmix', 'Error list from Zockmix') + ':', log);
    }
    L.push('', '— ' + T('geschrieben im Zockwerk', 'written in Zockwerk'));
    return L.join('\n');
  }
  function check() {
    const e = [];
    if (!draft.a) e.push(T('Bitte wähle einen Bereich.', 'Please choose an area.'));
    if (String(draft.x).trim().length < 8) e.push(T('Schreib bitte ein bisschen mehr, damit wir es verstehen.', 'Please write a little more so we understand.'));
    const el = $('#merr');
    if (el) { el.hidden = !e.length; el.innerHTML = I('info') + '<span>' + e.map(esc).join('<br>') + '</span>'; }
    if (e.length && el) { el.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    return !e.length;
  }
  function sendMail() {
    if (!check()) return;
    LS.set('draft', draft);
    const full = mailBody(), body = full.length > 3500 ? mailBody(Math.max(300, 3500 - (full.length - draft.log.trim().length))) : full;
    const a = document.createElement('a');
    a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(mailSubject()) + '&body=' + encodeURIComponent(body);
    document.body.appendChild(a); a.click(); a.remove();
    if (body !== full) toast(T('Die Fehler-Liste war sehr lang und wurde gekürzt.', 'The error list was very long and got shortened.'), 'info');
    // Formular für die nächste Meldung leeren – Handy-Modell, Version und Spitzname bleiben. „Zurück zum Text“ holt alles zurück (zmh-sent),
    // falls sich kein E-Mail-Programm geöffnet hat.
    LS.set('sent', draft); st.sentK = draft.k;
    clearTimeout(saveT); draft = Object.assign(D0(), { dev: draft.dev, ver: draft.ver, nick: draft.nick, pub: draft.pub }); st.gq = ''; LS.set('draft', draft);
    st.thx = true; st.burst = true; setTimeout(() => { render(); window.scrollTo(0, 0); }, 400);
  }
  function setDraftK(k, ref, a) {
    draft.k = KINDS[k] ? k : 'fehler';
    draft.ref = ref || '';
    if (a && a !== draft.a) { draft.a = a; draft.g = ''; }
    const g = ref && gameOf(findRef(ref)); if (g) draft.g = g;
    st.thx = false; LS.set('draft', draft);
  }

  // ---------- Reiter: Helfer ----------
  function myHelper() { const c = LS.get('code', ''); if (!c) return null; const h = C.hash(c); return h ? helpers.find(x => x.h === h) || null : null; }
  function vHelp() {
    const me = myHelper(), msc = me && score(me);
    const board = helpers.filter(h => h.pub).map(h => ({ h, sc: score(h) })).sort((a, b) => (b.sc.pts - a.sc.pts) || String(a.h.seit || '').localeCompare(String(b.h.seit || '')));
    return head('trophy', '#ffc93d', T('Helfer', 'Helpers'), T('Wer hilft, Zockmix besser zu machen, sammelt Punkte, steigt im Rang auf und bekommt Abzeichen.', 'Everyone who helps make Zockmix better earns points, climbs the ranks and collects badges.')) +
      (me ? card(me) : codeBox()) +
      '<h2 class="rv">' + I('star') + T('Die Ränge', 'The ranks') + '</h2><ol class="ranks">' +
      RANKS.map((r, i) => '<li class="rv' + (msc && rankOf(msc.pts) === i ? ' me' : '') + '" style="--c:' + r[4] + '">' + emb(r[1], r[4]) + '<b>' + T(r[2], r[3]) + '</b><span>' + (i ? T('ab ', 'from ') + r[0] + ' ' + T('Punkten', 'points') : T('zum Start', 'to start')) + '</span></li>').join('') + '</ol>' +
      '<h2 class="rv">' + I('sparkle') + T('So bekommst du Punkte', 'How to earn points') + '</h2><ul class="pts card rv">' +
      POINTS.map(p => '<li>' + I(p[0]) + '<span>' + T(p[2], p[3]) + '</span><b>+' + p[1] + '</b></li>').join('') + '</ul>' +
      '<h2 class="rv">' + I('medal') + T('Abzeichen', 'Badges') + '</h2><div class="badges">' +
      BADGES.map(b => { const got = msc && msc.got.includes(b); return '<div class="bdg rv' + (got ? ' got' : '') + '">' + emb(b[1], b[7]) + '<b>' + T(b[2], b[3]) + '</b><span>' + T(b[4], b[5]) + '</span></div>'; }).join('') + '</div>' +
      '<h2 class="rv">' + I('crown') + T('Ehrenliste', 'Hall of fame') + '</h2>' + (board.length ? fame(board, me) :
        '<div class="card empty2 rv">' + emb('trophy', '#ffc93d', 'big') + '<p>' + T('Noch ist die Ehrenliste leer. Melde einen Fehler oder schick eine Idee – vielleicht stehst du bald hier ganz oben!',
          'The hall of fame is still empty. Report a bug or send an idea – maybe you’ll soon be right at the top!') + '</p><a class="btn" href="#melden" data-k="fehler">' + I('send') + T('Jetzt melden', 'Report now') + '</a></div>');
  }
  function codeBox() {
    return '<div class="card codebox rv"><h3>' + I('key') + T('Hast du einen Helfer-Code?', 'Do you have a helper code?') + '</h3>' +
      '<p>' + T('Wenn deine Meldung uns hilft, schicken wir dir einen Helfer-Code. Damit siehst du hier deine eigene Helfer-Karte.', 'If your report helps us, we’ll send you a helper code. With it you can see your own helper card here.') + '</p>' +
      '<form id="cf" class="cf"><input id="cin" maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ZM-XXXX-XXXX" aria-label="' + T('Helfer-Code', 'Helper code') + '">' +
      '<button class="btn">' + T('Los', 'Go') + I('arrow') + '</button></form><div class="err" id="cerr" role="alert" hidden></div></div>';
  }
  function card(h) {
    const sc = score(h), ri = rankOf(sc.pts), r = RANKS[ri], nx = RANKS[ri + 1];
    const pct = nx ? Math.round(100 * (sc.pts - r[0]) / (nx[0] - r[0])) : 100;
    return '<div class="hcard rv" style="--c:' + r[4] + '"><div class="shine" aria-hidden="true"></div>' + av(h, 'big') +
      '<div class="hn">' + esc(h.n) + '</div><div class="hr">' + emb(r[1], r[4], 'xs') + T(r[2], r[3]) + ' · <b data-count="' + sc.pts + '">' + sc.pts + '</b> ' + T('Punkte', 'points') + '</div>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i data-w="' + pct + '"></i></div>' +
      '<div class="bn">' + (nx ? T('Noch', 'Only') + ' ' + (nx[0] - sc.pts) + ' ' + T('Punkte bis', 'points to') + ' ' + T(nx[2], nx[3]) : T('Höchster Rang erreicht – wow!', 'Highest rank reached – wow!')) + '</div>' +
      (sc.got.length ? '<div class="hb">' + sc.got.map(b => '<span title="' + esc(T(b[4], b[5])) + '" style="--c:' + b[7] + '">' + I(b[1]) + T(b[2], b[3]) + '</span>').join('') + '</div>' : '') +
      '<details class="hist"' + (sc.it.length ? '' : ' hidden') + '><summary>' + T('Deine Beiträge', 'Your contributions') + ' (' + sc.it.length + ')' + I('chev', 'chev') + '</summary><ul>' +
      sc.it.map(x => '<li>' + I(x.e) + '<span>' + (x.ref ? '<a href="' + x.ref + '">' + esc(x.id) + '</a> ' : '') + esc(x.t) + '<small>' + fmtDate(x.d) + '</small></span><b>+' + x.p + '</b></li>').join('') + '</ul></details>' +
      '<p class="hpub">' + (h.pub ? I('globe') + T('Du stehst auf der Ehrenliste.', 'You’re on the hall of fame.') : I('eyeoff') + T('Du stehst nicht auf der Ehrenliste (nur du siehst diese Karte).', 'You’re not on the hall of fame (only you see this card).')) + '</p>' +
      '<button class="link" id="cout">' + T('Code auf diesem Handy vergessen', 'Forget code on this phone') + '</button></div>';
  }
  function fame(board, me) {
    const row = (x, i) => { const r = RANKS[rankOf(x.sc.pts)]; return '<li class="rv' + (me && me.id === x.h.id ? ' me' : '') + '"><em>' + (i + 1) + '</em>' + av(x.h) +
      '<span><b>' + esc(x.h.n) + (me && me.id === x.h.id ? ' <small>(' + T('du', 'you') + ')</small>' : '') + '</b><small>' + T(r[2], r[3]) + '</small></span><strong>' + x.sc.pts + '</strong></li>'; };
    const top = board.slice(0, 3), order = [1, 0, 2].filter(i => top[i]);
    return '<div class="podium rv">' + order.map(i => '<div class="pd p' + (i + 1) + '">' + av(top[i].h) + '<b>' + esc(top[i].h.n) + '</b><span>' + top[i].sc.pts + ' ' + T('Pkt.', 'pts') + '</span><div>' + (i + 1) + '</div></div>').join('') + '</div>' +
      (board.length > 3 ? '<ol class="fame card rv">' + board.slice(3).map((x, i) => row(x, i + 3)).join('') + '</ol>' : '');
  }

  // ---------- Animationen: Einblenden, Zählen, Balken ----------
  const IO = 'IntersectionObserver' in window && !RM ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    IO.unobserve(e.target); show(e.target);
  }), { rootMargin: '0px 0px -6% 0px' }) : null;
  function countUp(el) {
    const n = +el.dataset.count; if (!n || RM) return;
    const t0 = performance.now(), dur = 700 + Math.min(600, n * 20);
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(n * e); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  }
  function show(el) {
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
    $$('.bar i[data-w]', el).forEach(b => requestAnimationFrame(() => { b.style.width = b.dataset.w + '%'; }));
  }
  function reveal(root, now) {
    const els = $$('.rv:not(.in)', root);
    els.forEach((el, i) => {
      if (now || !IO) { el.classList.add('in'); $$('.bar i[data-w]', el).forEach(b => { b.style.width = b.dataset.w + '%'; }); return; }
      el.style.setProperty('--d', Math.min(i, 7) * 55 + 'ms'); IO.observe(el);
    });
  }

  // ---------- Anzeigen ----------
  const VIEWS = { start: vStart, fehler: vBugs, melden: vReport, ideen: vIdeas, helfer: vHelp, artikel: vArticles };
  // mode: 1/-1 = Reiter-Wechsel (gleitet rein), 'keep' = gleiche Seite neu (Sprache, Filter, Auswahl) – sofort sichtbar, ohne Flackern
  function render(mode) {
    const v = $('#view');
    v.innerHTML = VIEWS[cur]();
    v.className = 'view v-' + cur;
    tint();
    if (mode === 'keep') { reveal(v, true); return; }
    if (typeof mode === 'number' && mode && !RM) { void v.offsetWidth; v.classList.add(mode > 0 ? 'enter-r' : 'enter-l'); }
    reveal(v);
  }
  function route() {
    const h = decodeURIComponent((location.hash || '').slice(1)).split('/');
    const tab = TABS.includes(h[0]) || PAGES[h[0]] ? h[0] : 'start', same = tab === cur && (!PAGES[tab] || (h[1] || '') === focusId);
    const dir = cur ? Math.sign(posOf(tab) - posOf(cur)) || (tab === cur ? 1 : 0) : 0;
    focusId = h[1] || '';
    if (tab === 'melden' && cur && cur !== 'melden') st.thx = false;
    cur = tab; dots[tabOf(tab)] = false;
    if (focusId && tab === 'fehler') { st.bf = 'alle'; st.ba = ''; st.bq = ''; }
    if (focusId && tab === 'ideen') st.idf = 'alle';
    paintChrome(); render(same ? 'keep' : dir || 0); voteBar();
    if (focusId && !PAGES[tab]) { const el = document.getElementById('i-' + focusId); if (el) { reveal(document, true); setTimeout(() => el.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }), 80); } }
    else if (!same) window.scrollTo(0, 0);
  }

  // ---------- Bedienung ----------
  // Tipp-Welle auf Knöpfen
  document.addEventListener('pointerdown', e => {
    if (RM) return;
    const b = e.target.closest('.btn, .chips button, .kind, .stat, .wrow, .atile, .gtile, .acard, .arow'); if (!b) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, w = document.createElement('span');
    w.className = 'rip'; w.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(w); setTimeout(() => w.remove(), 600);
  }, { passive: true });
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a, [data-more]');
    if (!t) return;
    if (t.dataset.k) setDraftK(t.dataset.k, '', t.dataset.a || '');
    if (t.dataset.bf) { st.bf = t.dataset.bf; if (cur === 'fehler') { e.preventDefault(); $$('.chips button').forEach(c => c.setAttribute('aria-pressed', String(c === t))); $('#blist').innerHTML = bugList(); reveal($('#blist')); } return; }
    if (t.dataset.if) { st.idf = t.dataset.if; if (cur === 'ideen') { e.preventDefault(); $$('.chips button').forEach(c => c.setAttribute('aria-pressed', String(c === t))); $('#ilist').innerHTML = ideaList(); reveal($('#ilist')); } return; }
    if (t.dataset.ba != null && cur === 'fehler') { e.preventDefault(); st.ba = t.dataset.ba; $$('.achips button').forEach(c => c.setAttribute('aria-pressed', String(c === t))); $('#blist').innerHTML = bugList(); reveal($('#blist')); return; }
    if (t.dataset.area) {
      const a = t.dataset.area; if (a !== draft.a) { draft.a = a; draft.g = ''; st.gq = ''; }
      $$('#arow .atile').forEach(b => { const on = b === t; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      $('#gpick').innerHTML = gPick(); reveal($('#gpick'), true); saveDraft(); formChanged(); return;
    }
    if (t.dataset.game) { draft.g = t.dataset.game; st.gq = ''; $('#gpick').innerHTML = gPick(); saveDraft(); formChanged(); const gp = $('#gpick'); if (gp.getBoundingClientRect().top < 70) gp.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }); return; }
    if (t.hasAttribute('data-gchange')) { draft.g = ''; st.gq = ''; $('#gpick').innerHTML = gPick(); saveDraft(); formChanged(); return; }
    if (t.dataset.l) { EN = t.dataset.l === 'en'; LS.set('lang', EN ? 'en' : 'de'); paintChrome(); render('keep'); voteBar(); return; }
    if (t.dataset.like) { toggleLike(t.dataset.like, t); return; }
    if (t.hasAttribute('data-more')) { const tx = t.previousElementSibling; tx.classList.remove('clamp'); tx.classList.add('open'); t.remove(); return; }
    if (t.dataset.me) {
      const r = findRef(t.dataset.me);
      setDraftK(t.dataset.me[0] === 'I' ? 'idee' : 'fehler', t.dataset.me, r && r.a);
      location.hash = '#melden'; return;
    }
    if (t.hasAttribute('data-unref')) { draft.ref = ''; saveDraft(); render('keep'); return; }
    switch (t.id) {
      case 'mcopy': if (check()) copy(mailSubject() + '\n\n' + mailBody(), T('Text kopiert!', 'Text copied!')); break;
      case 'mcaddr': copy(MAIL, T('Adresse kopiert!', 'Address copied!')); break;
      case 'mclear': if (confirm(T('Alles im Formular löschen?', 'Clear everything in the form?'))) { draft = D0(); LS.del('draft'); render(); } break;
      case 'tnew': st.thx = false; render(); break;
      case 'tback': { const sv = LS.get('sent', null); if (sv) { draft = Object.assign(D0(), sv); LS.set('draft', draft); } st.thx = false; render(); break; }
      case 'vsend': sendVotes(); break;
      case 'pmore': {
        st.allPosts = true; const w = document.createElement('div'); w.innerHTML = posts.slice(PN).map(post).join('');
        t.replaceWith(...w.childNodes); reveal($('#view')); break;
      }
      case 'vhide': st.vbHide = unsent().length; voteBar(); break;
      case 'cout': LS.del('code'); render('keep'); toast(T('Code vergessen.', 'Code forgotten.'), 'check'); break;
      case 'instBtn': if (instEv) { instEv.prompt(); instEv.userChoice.finally(() => { instEv = null; const b = $('#instBtn'); if (b) b.hidden = true; }); } break;
      case 'wipe':
        if (confirm(T('Sprache, Entwurf und Helfer-Code auf diesem Handy löschen?', 'Delete language, draft and helper code on this phone?'))) {
          ['lang', 'draft', 'sent', 'code', 'seen', 'likes'].forEach(LS.del); draft = D0(); likes = {}; toast(T('Gelöscht.', 'Deleted.'), 'check'); render('keep'); voteBar();
        }
        break;
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'bq') { st.bq = t.value; $('#blist').innerHTML = bugList(); reveal($('#blist'), true); return; }
    if (t.id === 'gq') { st.gq = t.value; const gb = $('#gbox'); if (gb) { gb.innerHTML = gList(); gb.scrollTop = 0; } return; }
    if (t.dataset.f) setField(t);
  });
  function setField(t) {
    {
      draft[t.dataset.f] = t.type === 'checkbox' ? t.checked : t.value; saveDraft(); formChanged();
    }
  }
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.f) { setField(t); return; }
    if (t.name === 'k') {
      draft.k = t.value; saveDraft();
      $$('.kinds .kind').forEach(l => l.classList.toggle('on', l.contains(t)));
      const kp = $('#kpart'); if (kp) kp.innerHTML = kindPart(); else render('keep');
      formChanged(); tint(); return;
    }
    if (t.name === 'oft') { draft.oft = t.value; saveDraft(); t.closest('fieldset').querySelectorAll('label').forEach(l => l.classList.toggle('on', l.contains(t))); const p = $('#mprev'); if (p) p.textContent = mailBody(); }
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'mf') { const ae = document.activeElement; if (ae && ae.id === 'gq') { ae.blur(); return; } return sendMail(); }   // Enter in „Spiel suchen“ schickt nichts ab
    if (e.target.id === 'cf') {
      const v = $('#cin').value, er = $('#cerr');
      const bad = msg => { er.hidden = false; er.innerHTML = I('info') + '<span>' + esc(msg) + '</span>'; er.classList.remove('shake'); void er.offsetWidth; er.classList.add('shake'); };
      if (!C.ok(v)) { bad(T('So sieht ein Helfer-Code aus: ZM-ABCD-2345', 'A helper code looks like this: ZM-ABCD-2345')); return; }
      const h = helpers.find(x => x.h === C.hash(v));
      if (!h) { bad(T('Diesen Code kennen wir (noch) nicht. Neue Codes stehen manchmal erst nach ein paar Tagen hier.', 'We don’t know this code (yet). New codes sometimes only show up after a few days.')); return; }
      LS.set('code', C.fmt(v)); render(); toast(T('Hallo ', 'Hi ') + h.n + '!', 'sparkle');
    }
  });

  function toggleLike(id, btn) {
    if (likes[id]) delete likes[id]; else likes[id] = { b: baseOf(id), s: 0, d: today };
    LS.set('likes', likes);
    const w = document.createElement('div'); w.innerHTML = likeBtn(id, btn.dataset.kind); const nb = w.firstChild;
    btn.replaceWith(nb);
    if (likes[id] && !RM) {
      nb.classList.add('pop');
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = document.createElement('i'); s.className = 'lk';
        s.style.cssText = '--x:' + Math.round(Math.cos(a) * 26) + 'px;--y:' + Math.round(Math.sin(a) * 22) + 'px'; nb.appendChild(s); }
      setTimeout(() => nb.querySelectorAll('.lk').forEach(s => s.remove()), 700);
    }
    if (likes[id] && unsent().length === 1) toast(T('Gemerkt! Unten kannst du deine Stimmen abschicken.', 'Saved! You can send your votes below.'), 'heart');
    voteBar();
  }
  // Leiste über den Reitern: „x Stimmen noch nicht geschickt – Senden“
  function voteBar() {
    const n = unsent().length, bar = $('#vbar'), show = n > 0 && n > (st.vbHide || 0) && cur !== 'melden';
    document.body.classList.toggle('vb', show);
    if (!show) { bar.hidden = true; return; }
    bar.innerHTML = I('send') + '<span>' + (n === 1 ? T('1 Stimme', '1 vote') : n + ' ' + T('Stimmen', 'votes')) + ' ' + T('noch nicht geschickt', 'not sent yet') +
      '<small>' + T('Sie zählen, wenn du sie uns schickst.', 'They count once you send them to us.') + '</small></span>' +
      '<button class="btn sm" id="vsend">' + T('Senden', 'Send') + '</button><button class="x" id="vhide" aria-label="' + T('Später', 'Later') + '">' + I('x') + '</button>';
    bar.hidden = false;
  }
  function sendVotes() {
    const ids = unsent(); if (!ids.length) return;
    const KN = { b: ['Beitrag', 'Post'], a: ['Artikel', 'Article'], F: ['Fehler – hab ich auch', 'Bug – me too'], I: ['Idee – will ich auch', 'Idea – want it too'] };
    const L = [T('Meine Stimmen aus dem Zockwerk:', 'My votes from Zockwerk:'), ''];
    ids.forEach(id => { const o = findAny(id), k = KN[id[0]] || KN.b; L.push('+1 ' + id + ' (' + T(k[0], k[1]) + '): ' + F(o, 't')); });
    L.push('', '— ' + T('geschrieben im Zockwerk', 'written in Zockwerk'));
    const a = document.createElement('a');
    a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('[Zockmix ' + T('Stimmen', 'Votes') + '] ' + ids.join(', ')) + '&body=' + encodeURIComponent(L.join('\n'));
    document.body.appendChild(a); a.click(); a.remove();
    ids.forEach(id => { likes[id].s = 1; }); LS.set('likes', likes); st.vbHide = 0; voteBar();
    toast(T('Danke! Tippe im E-Mail-Programm auf Senden.', 'Thanks! Tap Send in your e-mail app.'), 'check');
  }

  // ---------- Als App installieren ----------
  let instEv = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); instEv = e; const b = $('#instBtn'); if (b) b.hidden = false; });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    // Neue Fassung online? Die als App installierte Seite fragt beim Start und beim Zurückkommen nach. Kommt die neue Fassung gleich beim
    // Start (erste 5 s), lädt die Seite einmal neu; sonst erst beim nächsten Zurückkommen (der Entwurf beim Melden ist dann schon gemerkt).
    const hadCtl = !!navigator.serviceWorker.controller;
    let swReg = null, updReady = false, reloaded = false;
    const reload = () => { if (!reloaded) { reloaded = true; location.reload(); } };
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadCtl || reloaded) return;
      if (performance.now() < 5000) reload();
      else { updReady = true; toast(T('Neue Zockwerk-Fassung da – kommt beim nächsten Öffnen.', 'New Zockwerk version ready – it loads next time you open it.'), 'sparkle'); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      if (updReady) { LS.set('draft', draft); reload(); } else if (swReg) swReg.update().catch(() => { /* ohne Netz egal */ });
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(r => { swReg = r; }).catch(() => { /* ohne Offline-Speicher geht es auch */ }));
  }

  // Aus Zockmix geöffnet: #lang=de|en&v=<Version> – Sprache übernehmen, Version ins Formular, dann zur Startseite
  function fromApp() {
    const h = (location.hash || '').slice(1); if (!/^lang=/.test(h)) return;
    const p = new URLSearchParams(h), l = p.get('lang'), v = p.get('v') || '';
    if (l === 'de' || l === 'en') { EN = l === 'en'; LS.set('lang', l); }
    if (/^\d+(\.\d+)*$/.test(v) && !draft.ver) { draft.ver = v; LS.set('draft', draft); }
    try { history.replaceState(null, '', location.pathname + location.search + '#start'); } catch (e) { location.hash = '#start'; }
  }
  window.addEventListener('hashchange', () => { fromApp(); route(); });
  fromApp();
  route();
  // Test-Hilfe (für Prüf-Skripte)
  window.__zh = { likes: () => likes, unsent: () => unsent(), score: h => score(h), draft: () => draft, body: () => mailBody(), subject: () => mailSubject(), st, render, go: h => { location.hash = h; } };
})();
