/* Zockwerk (die Zockmix-Werkstatt, früher „Zockmix-Hilfe“) – die ganze Oberfläche (eine Seite, fünf Reiter: Start, Fehler, Melden, Ideen, Helfer).
   Daten: daten/*.js → window.ZH { posts, bugs, ideas, faq, helpers }. Nur der Entwickler trägt dort etwas ein.
   Nichts wird verschickt: „Melden“ baut nur eine fertige E-Mail, die man selbst im E-Mail-Programm abschickt.
   Auf dem Handy gemerkt (localStorage, nur Bequemlichkeit, darf fehlen): Sprache, Entwurf, Helfer-Code, letzter Besuch. */
(() => {
  'use strict';
  const ZH = window.ZH || {}, C = window.ZHC;
  const MAIL = 'zockmix.games@gmail.com';
  const INFO = 'https://florianalexanderhintz-beep.github.io/zockmix-info/';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('zmh-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('zmh-' + k, JSON.stringify(v)); } catch (e) { /* privat/voll – egal */ } },
    del(k) { try { localStorage.removeItem('zmh-' + k); } catch (e) { /* egal */ } }
  };

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
  const AREAS = [
    ['spiele', '🎮', 'Spiele', 'Games'], ['zocki', '🐾', 'Zocki', 'Zocki'], ['chillmix', '🌿', 'Chillmix', 'Chillmix'],
    ['spukmix', '👻', 'Spukmix', 'Spukmix'], ['baumix', '🏠', 'Baumix', 'Baumix'], ['burg', '🏰', 'Burg-Wächter', 'Castle Guard'],
    ['beatmix', '🎵', 'Beatmix', 'Beatmix'], ['malmix', '🎨', 'Malmix', 'Malmix'], ['quizmix', '❓', 'Quizmix', 'Quizmix'],
    ['lernmix', '📚', 'Lernmix', 'Lernmix'], ['sim', '💼', 'Simulatoren', 'Simulators'],
    ['app', '⚙️', 'Startseite & Einstellungen', 'Home & settings'], ['sonst', '✨', 'Etwas anderes', 'Something else']
  ];
  const area = k => AREAS.find(a => a[0] === k) || AREAS[AREAS.length - 1];
  const areaName = k => { const a = area(k); return a[1] + ' ' + T(a[2], a[3]); };
  // Stand: [Bildchen, Deutsch, Englisch, Farbe]
  const BS = { offen: ['🔴', 'Gemeldet', 'Reported', '#ff5d6c'], pruef: ['🔎', 'Wird geprüft', 'Checking', '#ffb84d'],
    arbeit: ['🔧', 'Wird repariert', 'Being fixed', '#4fa3ff'], fertig: ['✅', 'Behoben', 'Fixed', '#35cf66'], kein: ['💬', 'Kein Fehler', 'Not a bug', '#9aa6c8'] };
  const IS = { idee: ['💭', 'Idee', 'Idea', '#b36bff'], geplant: ['📅', 'Geplant', 'Planned', '#ffb84d'], arbeit: ['🔧', 'In Arbeit', 'In progress', '#4fa3ff'],
    fertig: ['🎉', 'Fertig', 'Done', '#35cf66'], nein: ['🙅', 'Passt nicht', 'Not planned', '#9aa6c8'] };
  const PK = { neu: ['Neu', 'New', '#35cf66'], update: ['Update', 'Update', '#4fa3ff'], tipp: ['Tipp', 'Tip', '#ffb84d'], test: ['Test', 'Test', '#b36bff'], info: ['Info', 'Info', '#5fd0ff'] };
  const KINDS = { fehler: ['🐞', 'Fehler', 'Bug'], idee: ['💡', 'Idee', 'Idea'], frage: ['❓', 'Frage', 'Question'], lob: ['💖', 'Lob', 'Praise'] };
  // Ränge: [ab Punkten, Bildchen, Deutsch, Englisch, Farbe]
  const RANKS = [[0, '🌱', 'Neuling', 'Rookie', '#6fd36f'], [10, '🙌', 'Helfer', 'Helper', '#4fd0ff'], [30, '🔍', 'Entdecker', 'Explorer', '#5b8cff'],
    [60, '⭐', 'Profi', 'Pro', '#ffc93d'], [100, '🏅', 'Meister', 'Master', '#ff9440'], [200, '👑', 'Legende', 'Legend', '#ff5fae']];
  const rankOf = p => { let i = 0; RANKS.forEach((r, j) => { if (p >= r[0]) i = j; }); return i; };
  // Punkte (Erklärung im Reiter Helfer; die Rechnung steht in score())
  const PTS = { bugFirst: 10, bugToo: 5, bugNo: 2, idea: { idee: 3, geplant: 8, arbeit: 8, fertig: 15, nein: 2 } };
  const POINTS = [
    ['🐞', PTS.bugFirst, 'Einen echten Fehler als Erstes gemeldet', 'Reported a real bug first'],
    ['🙋', PTS.bugToo, 'Den gleichen Fehler auch gemeldet', 'Reported the same bug too'],
    ['💬', PTS.bugNo, 'War doch kein Fehler – trotzdem danke!', 'Turned out not to be a bug – thanks anyway!'],
    ['💭', PTS.idea.idee, 'Eine Idee eingeschickt', 'Sent in an idea'],
    ['📅', PTS.idea.geplant, 'Deine Idee kommt auf den Plan', 'Your idea goes on the plan'],
    ['🎉', PTS.idea.fertig, 'Deine Idee ist fertig in Zockmix', 'Your idea is in Zockmix'],
    ['🧪', 20, 'Beim Testen einer neuen Version geholfen', 'Helped test a new version'],
    ['🗺️', 5, 'Ein hilfreicher Tipp', 'A helpful tip']
  ];
  // Abzeichen: [id, Bildchen, Name de, Name en, Text de, Text en, Bedingung (null = nur von Hand)]
  const BADGES = [
    ['kaefer1', '🐞', 'Erster Käfer', 'First bug', 'Einen echten Fehler als Erstes gemeldet', 'Reported a real bug first', s => s.firsts >= 1],
    ['jaeger', '🕵️', 'Bug-Jäger', 'Bug hunter', '5 Fehler als Erstes gemeldet', 'Reported 5 bugs first', s => s.firsts >= 5],
    ['idee1', '💡', 'Ideengeber', 'Idea maker', 'Eine Idee kam auf den Plan', 'An idea made it onto the plan', s => s.acc >= 1],
    ['blitz', '⚡', 'Ideen-Blitz', 'Idea storm', '3 Ideen kamen auf den Plan', '3 ideas made it onto the plan', s => s.acc >= 3],
    ['bau', '🛠️', 'Umgesetzt!', 'Built it!', 'Eine deiner Ideen ist fertig', 'One of your ideas is done', s => s.done >= 1],
    ['tester', '🧪', 'Tester', 'Tester', 'Beim Testen geholfen', 'Helped with testing', s => s.test >= 1],
    ['tipp', '🗺️', 'Tipp-Geber', 'Tip giver', '3 hilfreiche Tipps', '3 helpful tips', s => s.tipp >= 3],
    ['ersttester', '🥇', 'Erste Tester', 'First testers', 'Beim allerersten Test vor dem Start dabei', 'Part of the very first test before launch', null],
    ['dank', '💖', 'Großes Danke', 'Big thanks', 'Hat Zockmix ganz besonders geholfen', 'Helped Zockmix in a special way', null]
  ];
  const EXK = { test: '🧪', tipp: '🗺️', hilfe: '🤝' };

  const posts = (ZH.posts || []).slice().sort((a, b) => String(b.d).localeCompare(String(a.d)));
  const bugs = ZH.bugs || [], ideas = ZH.ideas || [], faq = ZH.faq || [], helpers = ZH.helpers || [];
  const byId = id => helpers.find(h => h.id === id);

  function score(h) {
    const it = [], s = { firsts: 0, acc: 0, done: 0, test: 0, tipp: 0 };
    bugs.forEach(b => {
      const i = (b.by || []).indexOf(h.id); if (i < 0) return;
      const no = b.s === 'kein', p = no ? PTS.bugNo : i === 0 ? PTS.bugFirst : PTS.bugToo;
      if (i === 0 && !no) s.firsts++;
      it.push({ d: b.f || b.d, e: no ? '💬' : i === 0 ? '🐞' : '🙋', p, t: F(b, 't'), ref: '#fehler/' + b.id, id: b.id });
    });
    ideas.forEach(x => {
      if (!(x.by || []).includes(h.id)) return;
      const p = PTS.idea[x.s] || PTS.idea.idee;
      if (x.s === 'geplant' || x.s === 'arbeit' || x.s === 'fertig') s.acc++;
      if (x.s === 'fertig') s.done++;
      it.push({ d: x.u || x.d, e: IS[x.s] ? IS[x.s][0] : '💭', p, t: F(x, 't'), ref: '#ideen/' + x.id, id: x.id });
    });
    (h.extra || []).forEach(e => {
      if (e.k === 'test') s.test++;
      if (e.k === 'tipp') s.tipp++;
      it.push({ d: e.d, e: EXK[e.k] || '🤝', p: e.p | 0, t: (EN && e.en) || e.de || '' });
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
  let toastT = 0;
  function toast(t) {
    const el = $('#toast'); el.textContent = t; el.classList.add('on');
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
    toast(ok ? okMsg || T('Kopiert!', 'Copied!') : T('Kopieren ging nicht – bitte von Hand markieren.', 'Couldn’t copy – please select it by hand.'));
  }

  // ---------- NEU seit dem letzten Besuch ----------
  const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  const prevSeen = LS.get('seen', '');
  LS.set('seen', today);
  const isNew = (...ds) => !!prevSeen && ds.some(d => d && d > prevSeen);
  const newBadge = (...ds) => (isNew(...ds) ? ' <span class="new">' + T('NEU', 'NEW') + '</span>' : '');
  const dots = { start: posts.some(p => isNew(p.d)), fehler: bugs.some(b => isNew(b.d, b.f, b.u)), ideen: ideas.some(x => isNew(x.d, x.u)) };

  // ---------- Zustand ----------
  const TABS = ['start', 'fehler', 'melden', 'ideen', 'helfer'];
  let cur = '', focusId = '';
  const st = { bf: 'alle', ba: '', bq: '', idf: 'alle', thx: false };
  const D0 = () => ({ k: 'fehler', ref: '', a: '', w: '', x: '', st: '', oft: '', dev: '', ver: '', log: '', nick: '', pub: false });
  let draft = Object.assign(D0(), LS.get('draft', {}) || {});
  let saveT = 0;
  const saveDraft = () => { clearTimeout(saveT); saveT = setTimeout(() => LS.set('draft', draft), 300); };

  // ---------- Kopf und Leiste ----------
  function paintChrome() {
    document.documentElement.lang = EN ? 'en' : 'de';
    document.title = 'Zockwerk';
    document.querySelectorAll('.langsw button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.l === 'en') === EN)));
    const L = { start: ['🏠', 'Start', 'Home'], fehler: ['🐞', 'Fehler', 'Bugs'], melden: ['✉️', 'Melden', 'Report'], ideen: ['💡', 'Ideen', 'Ideas'], helfer: ['🏆', 'Helfer', 'Helpers'] };
    $('#tabs').innerHTML = TABS.map(t => '<a href="#' + t + '" data-tab="' + t + '"' + (t === cur ? ' aria-current="page"' : '') + (t === 'melden' ? ' class="mid"' : '') + '>' +
      '<i aria-hidden="true">' + L[t][0] + '</i><span>' + T(L[t][1], L[t][2]) + '</span>' + (dots[t] && t !== cur ? '<b class="dot" aria-label="' + T('Neues', 'New') + '"></b>' : '') + '</a>').join('');
  }

  // ---------- Reiter: Start ----------
  function vStart() {
    const fixed = bugs.filter(b => b.s === 'fertig').length, work = bugs.filter(b => b.s === 'arbeit' || b.s === 'pruef').length, done = ideas.filter(x => x.s === 'fertig').length;
    return '<section class="hero">' +
      '<div class="logo" aria-label="Zockwerk">ZOCK<span>WERK</span></div><div class="hl">' + T('Die Zockmix-Werkstatt', 'The Zockmix workshop') + '</div>' +
      '<div class="balls" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<p class="lead">' + T('Neuigkeiten, bekannte Fehler und Ideen rund um Zockmix – und hier kannst du uns schreiben.', 'News, known bugs and ideas all about Zockmix – and you can write to us here.') + '</p>' +
      '<div class="qbtns"><a class="btn" href="#melden" data-k="fehler">🐞 ' + T('Fehler melden', 'Report a bug') + '</a>' +
      '<a class="btn b2" href="#melden" data-k="idee">💡 ' + T('Idee schicken', 'Send an idea') + '</a></div>' +
      '<button class="btn ghost sm" id="instBtn"' + (instEv ? '' : ' hidden') + '>📲 ' + T('Als App aufs Handy', 'Add to your phone') + '</button>' +
      '</section>' +
      '<div class="stats">' +
      '<a href="#fehler" data-bf="fertig" class="stat" style="--c:#35cf66"><b>' + fixed + '</b><span>' + T('Fehler behoben', 'bugs fixed') + '</span></a>' +
      '<a href="#fehler" data-bf="arbeit" class="stat" style="--c:#4fa3ff"><b>' + work + '</b><span>' + T('in Arbeit', 'being fixed') + '</span></a>' +
      '<a href="#ideen" data-if="fertig" class="stat" style="--c:#ffc93d"><b>' + done + '</b><span>' + T('Ideen fertig', 'ideas done') + '</span></a></div>' +
      '<h2>📰 ' + T('Neuigkeiten', 'News') + '</h2>' +
      (posts.length ? posts.map(post).join('') : '<p class="empty">' + T('Noch keine Beiträge.', 'No posts yet.') + '</p>') +
      '<h2>🙋 ' + T('Häufige Fragen', 'Questions') + '</h2><div class="faq">' +
      faq.map(f => '<details><summary>' + esc(F(f, 'q')) + '</summary><div class="tx">' + md(F(f, 'a')) + '</div></details>').join('') + '</div>' +
      about();
  }
  function post(p) {
    const k = PK[p.k] || PK.info, x = F(p, 'x'), long = x.length > 320;
    return '<article class="card post" id="p-' + esc(p.id) + '">' +
      '<div class="ph"><span class="pem" aria-hidden="true">' + esc(p.em || '📣') + '</span><div>' +
      '<div class="meta"><span class="tag" style="--c:' + k[2] + '">' + T(k[0], k[1]) + '</span>' + fmtDate(p.d) + newBadge(p.d) + '</div>' +
      '<h3>' + esc(F(p, 't')) + '</h3></div></div>' +
      '<div class="tx' + (long ? ' clamp' : '') + '">' + md(x) + '</div>' +
      (long ? '<button class="more" data-more>' + T('Weiterlesen', 'Read more') + ' ▾</button>' : '') + '</article>';
  }
  function about() {
    return '<details class="card about"><summary>🔒 ' + T('Über diese Seite', 'About this page') + '</summary><div class="tx">' +
      md(T('Das Zockwerk **sammelt keine Daten**: keine Anmeldung, keine Cookies, keine Werbung, keine Statistik. Nur auf deinem Handy merkt sie sich deine Sprache, deinen Entwurf beim Melden und deinen Helfer-Code – das kannst du jederzeit löschen.\n\nWenn du etwas meldest, öffnet sich dein E-Mail-Programm mit dem fertigen Text. Du siehst genau, was drinsteht, und schickst es selbst ab. Wir nutzen deine E-Mail nur, um dir zu antworten.',
        'Zockwerk **collects no data**: no sign-up, no cookies, no ads, no statistics. Only on your phone it remembers your language, your report draft and your helper code – you can delete that at any time.\n\nWhen you report something, your e-mail app opens with the finished text. You see exactly what’s in it and send it yourself. We only use your e-mail to answer you.')) +
      '<p class="links"><a href="' + INFO + 'datenschutz.html#' + (EN ? 'en' : 'de') + '" target="_blank" rel="noopener">' + T('Datenschutz', 'Privacy policy') + '</a>' +
      '<a href="' + INFO + 'impressum.html#' + (EN ? 'en' : 'de') + '" target="_blank" rel="noopener">' + T('Impressum', 'Legal notice') + '</a>' +
      '<a href="' + INFO + '#' + (EN ? 'en' : 'de') + '" target="_blank" rel="noopener">' + T('Über Zockmix', 'About Zockmix') + '</a></p>' +
      '<button class="btn ghost sm" id="wipe">🧹 ' + T('Auf diesem Handy gemerkte Sachen löschen', 'Delete what this phone remembers') + '</button></div></details>';
  }

  // ---------- Reiter: Fehler ----------
  const BGRP = { alle: null, offen: ['offen', 'pruef'], arbeit: ['arbeit'], fertig: ['fertig', 'kein'] };
  const BORD = { arbeit: 0, pruef: 1, offen: 2, fertig: 3, kein: 4 };
  function vBugs() {
    const cnt = g => bugs.filter(b => !BGRP[g] || BGRP[g].includes(b.s)).length;
    const used = AREAS.filter(a => bugs.some(b => b.a === a[0]));
    return '<h1 class="vh">🐞 ' + T('Bekannte Fehler', 'Known bugs') + '</h1>' +
      '<p class="sub">' + T('Diese Fehler kennen wir schon. Hier siehst du, was gerade repariert wird.', 'We already know about these bugs. Here you can see what’s being fixed right now.') + '</p>' +
      '<div class="tools"><input type="search" id="bq" value="' + esc(st.bq) + '" placeholder="🔎 ' + T('Suchen …', 'Search …') + '" aria-label="' + T('Fehler suchen', 'Search bugs') + '">' +
      '<select id="ba" aria-label="' + T('Bereich', 'Area') + '"><option value="">' + T('Alle Bereiche', 'All areas') + '</option>' +
      used.map(a => '<option value="' + a[0] + '"' + (st.ba === a[0] ? ' selected' : '') + '>' + areaName(a[0]) + '</option>').join('') + '</select></div>' +
      '<div class="chips" role="group">' + [['alle', 'Alle', 'All'], ['offen', 'Offen', 'Open'], ['arbeit', 'In Arbeit', 'Being fixed'], ['fertig', 'Erledigt', 'Done']]
        .map(c => '<button data-bf="' + c[0] + '" aria-pressed="' + (st.bf === c[0]) + '">' + T(c[1], c[2]) + ' <small>' + cnt(c[0]) + '</small></button>').join('') + '</div>' +
      '<div id="blist">' + bugList() + '</div>' +
      '<div class="card cta"><p>' + T('Dein Fehler ist nicht dabei?', 'Your bug isn’t listed?') + '</p><a class="btn" href="#melden" data-k="fehler">🐞 ' + T('Fehler melden', 'Report a bug') + '</a></div>';
  }
  function bugList() {
    const q = fold(st.bq).trim();
    const l = bugs.filter(b => (!BGRP[st.bf] || BGRP[st.bf].includes(b.s)) && (!st.ba || b.a === st.ba) &&
      (!q || fold([b.id, F(b, 't'), F(b, 'w'), F(b, 'x'), F(b, 'h'), areaName(b.a)].join(' ')).includes(q)))
      .sort((a, b) => (BORD[a.s] - BORD[b.s]) || String(b.f || b.u || b.d).localeCompare(String(a.f || a.u || a.d)));
    return l.length ? l.map(bug).join('') : '<p class="empty">🤷 ' + T('Nichts gefunden.', 'Nothing found.') + '</p>';
  }
  function credit(by) {
    const pub = (by || []).map(byId).filter(h => h && h.pub);
    if (!pub.length) return '';
    const names = pub.slice(0, 2).map(h => esc(h.av || '🙂') + ' ' + esc(h.n)).join(', ');
    const rest = (by || []).length - Math.min(2, pub.length);
    return '<span class="credit">🙏 ' + T('Danke an', 'Thanks to') + ' ' + names + (rest > 0 ? ' +' + rest : '') + '</span>';
  }
  function bug(b) {
    const s = BS[b.s] || BS.offen, h = F(b, 'h'), w = F(b, 'w'), done = b.s === 'fertig' || b.s === 'kein';
    return '<article class="card item' + (focusId === b.id ? ' hit' : '') + '" id="i-' + esc(b.id) + '" style="--c:' + s[3] + '">' +
      '<div class="ih"><span class="pill">' + s[0] + ' ' + T(s[1], s[2]) + '</span><a class="iid" href="#fehler/' + esc(b.id) + '">' + esc(b.id) + '</a>' + newBadge(b.d, b.f, b.u) + '</div>' +
      '<h3>' + esc(F(b, 't')) + '</h3>' +
      '<div class="meta">' + areaName(b.a) + (w ? ' · ' + esc(w) : '') + '</div>' +
      (F(b, 'x') ? '<div class="tx">' + md(F(b, 'x')) + '</div>' : '') +
      (h ? '<div class="tip">💡 <b>' + T('Tipp', 'Tip') + ':</b> ' + inl(h) + '</div>' : '') +
      (b.s === 'fertig' && b.f ? '<div class="fix">✅ ' + T('Behoben am', 'Fixed on') + ' ' + fmtDate(b.f) + ' – ' + T('bitte Zockmix aktualisieren.', 'please update Zockmix.') + '</div>' : '') +
      '<div class="ifoot">' + credit(b.by) + (b.n > 1 ? '<span class="cnt">👥 ' + b.n + ' ' + T('Meldungen', 'reports') + '</span>' : '') +
      '<button class="btn sm ' + (done ? 'ghost' : 'b2') + '" data-me="' + esc(b.id) + '">' + (done ? '🔁 ' + T('Immer noch da?', 'Still there?') : '🙋 ' + T('Hab ich auch', 'Me too')) + '</button></div>' +
      '</article>';
  }

  // ---------- Reiter: Ideen ----------
  const IGRP = { alle: null, plan: ['geplant', 'arbeit'], fertig: ['fertig'], idee: ['idee'], nein: ['nein'] };
  const IORD = { arbeit: 0, geplant: 1, idee: 2, fertig: 3, nein: 4 };
  function vIdeas() {
    const cnt = g => ideas.filter(x => !IGRP[g] || IGRP[g].includes(x.s)).length;
    const l = ideas.filter(x => !IGRP[st.idf] || IGRP[st.idf].includes(x.s))
      .sort((a, b) => (IORD[a.s] - IORD[b.s]) || String(b.u || b.d).localeCompare(String(a.u || a.d)));
    return '<h1 class="vh">💡 ' + T('Ideen & Pläne', 'Ideas & plans') + '</h1>' +
      '<p class="sub">' + T('Was ist geplant, was bauen wir gerade, was ist schon fertig?', 'What’s planned, what are we building, what’s done?') + '</p>' +
      '<div class="chips" role="group">' + [['alle', 'Alle', 'All'], ['plan', 'Geplant', 'Planned'], ['fertig', 'Fertig', 'Done'], ['idee', 'Ideen', 'Ideas'], ['nein', 'Passt nicht', 'Not planned']]
        .map(c => '<button data-if="' + c[0] + '" aria-pressed="' + (st.idf === c[0]) + '">' + T(c[1], c[2]) + ' <small>' + cnt(c[0]) + '</small></button>').join('') + '</div>' +
      (l.length ? l.map(idea).join('') : '<p class="empty">🤷 ' + T('Hier ist gerade nichts.', 'Nothing here right now.') + '</p>') +
      '<div class="card cta"><p>' + T('Du hast eine Idee für Zockmix?', 'Got an idea for Zockmix?') + '</p><a class="btn" href="#melden" data-k="idee">💡 ' + T('Idee schicken', 'Send an idea') + '</a></div>';
  }
  function idea(x) {
    const s = IS[x.s] || IS.idee, r = F(x, 'r'), open = x.s !== 'fertig' && x.s !== 'nein';
    return '<article class="card item' + (focusId === x.id ? ' hit' : '') + '" id="i-' + esc(x.id) + '" style="--c:' + s[3] + '">' +
      '<div class="ih"><span class="pill">' + s[0] + ' ' + T(s[1], s[2]) + '</span><a class="iid" href="#ideen/' + esc(x.id) + '">' + esc(x.id) + '</a>' + newBadge(x.d, x.u) + '</div>' +
      '<h3>' + esc(F(x, 't')) + '</h3><div class="meta">' + areaName(x.a) + '</div>' +
      (F(x, 'x') ? '<div class="tx">' + md(F(x, 'x')) + '</div>' : '') +
      (r ? '<div class="tip dev">🧑‍💻 ' + inl(r) + '</div>' : '') +
      '<div class="ifoot">' + credit(x.by) + (x.v > 1 ? '<span class="cnt">👍 ' + x.v + '</span>' : '') +
      (open ? '<button class="btn sm b2" data-me="' + esc(x.id) + '">👍 ' + T('Will ich auch', 'Me too') + '</button>' : '') + '</div></article>';
  }

  // ---------- Reiter: Melden ----------
  const findRef = id => bugs.find(b => b.id === id) || ideas.find(x => x.id === id);
  const QL = { fehler: ['Was ist passiert?', 'What happened?', 'Erzähl genau, was du gesehen hast. Was hast du erwartet?', 'Tell us exactly what you saw. What did you expect?'],
    idee: ['Was ist deine Idee?', 'What’s your idea?', 'Was soll es geben? Warum wäre das toll?', 'What should be added? Why would it be great?'],
    frage: ['Deine Frage', 'Your question', 'Was möchtest du wissen?', 'What would you like to know?'],
    lob: ['Was gefällt dir?', 'What do you like?', 'Was macht dir am meisten Spaß?', 'What’s the most fun for you?'] };
  function vReport() {
    if (st.thx) return thanks();
    const d = draft, k = KINDS[d.k] ? d.k : 'fehler', q = QL[k], ref = d.ref && findRef(d.ref);
    const bugK = k === 'fehler';
    return '<h1 class="vh">✉️ ' + T('Melden', 'Report') + '</h1>' +
      '<p class="sub">' + T('Erzähl uns, was los ist. Am Ende öffnet sich dein E-Mail-Programm mit dem fertigen Text – du schickst ihn selbst ab.',
        'Tell us what’s going on. At the end your e-mail app opens with the finished text – you send it yourself.') + '</p>' +
      '<div class="card safe">🛡️ ' + T('<b>Wichtig:</b> Schreib keinen echten Namen, keine Adresse und keine Telefonnummer. Bist du unter 16? Dann frag einen Erwachsenen, bevor du die E-Mail abschickst.',
        '<b>Important:</b> Don’t write your real name, address or phone number. Are you under 16? Then ask an adult before you send the e-mail.') + '</div>' +
      '<form id="mf" class="form" novalidate>' +
      '<fieldset class="kinds"><legend>' + T('Was möchtest du schicken?', 'What would you like to send?') + '</legend>' +
      Object.keys(KINDS).map(key => '<label class="kind' + (key === k ? ' on' : '') + '"><input type="radio" name="k" value="' + key + '"' + (key === k ? ' checked' : '') + '>' +
        '<i aria-hidden="true">' + KINDS[key][0] + '</i><span>' + T(KINDS[key][1], KINDS[key][2]) + '</span></label>').join('') + '</fieldset>' +
      (ref ? '<div class="refchip">🔗 ' + T('Gehört zu', 'About') + ' <b>' + esc(d.ref) + '</b>: ' + esc(F(ref, 't')) +
        ' <button type="button" data-unref aria-label="' + T('Verbindung lösen', 'Remove link') + '">✕</button></div>' : '') +
      '<label class="fl">' + T('Bereich', 'Area') + ' <em>*</em><select data-f="a"><option value="">' + T('– bitte wählen –', '– please choose –') + '</option>' +
      AREAS.map(a => '<option value="' + a[0] + '"' + (d.a === a[0] ? ' selected' : '') + '>' + areaName(a[0]) + '</option>').join('') + '</select></label>' +
      '<label class="fl">' + T('Welches Spiel oder welche Stelle?', 'Which game or which place?') + ' <small>' + T('(wenn du es weißt)', '(if you know)') + '</small>' +
      '<input data-f="w" maxlength="80" value="' + esc(d.w) + '" placeholder="' + T('z. B. Zombie-Abwehr, Level 7', 'e.g. Zombie Defense, level 7') + '"></label>' +
      '<label class="fl">' + T(q[0], q[1]) + ' <em>*</em><textarea data-f="x" rows="5" maxlength="3000" placeholder="' + T(q[2], q[3]) + '">' + esc(d.x) + '</textarea></label>' +
      (bugK ? '<label class="fl">' + T('Wie kann man den Fehler auslösen?', 'How can we make the bug happen?') + ' <small>' + T('(Schritt für Schritt)', '(step by step)') + '</small>' +
        '<textarea data-f="st" rows="3" maxlength="1500" placeholder="' + T('1. Zockmix öffnen&#10;2. …', '1. Open Zockmix&#10;2. …') + '">' + esc(d.st) + '</textarea></label>' +
        '<fieldset class="seg"><legend>' + T('Wie oft passiert das?', 'How often does it happen?') + '</legend>' +
        [['immer', 'Immer', 'Always'], ['manchmal', 'Manchmal', 'Sometimes'], ['einmal', 'Nur einmal', 'Just once']].map(o =>
          '<label' + (d.oft === o[0] ? ' class="on"' : '') + '><input type="radio" name="oft" value="' + o[0] + '"' + (d.oft === o[0] ? ' checked' : '') + '>' + T(o[1], o[2]) + '</label>').join('') + '</fieldset>' +
        '<details class="opt"' + (d.log ? ' open' : '') + '><summary>📋 ' + T('Fehler-Liste aus Zockmix einfügen', 'Paste the error list from Zockmix') + ' <small>' + T('(hilft uns sehr)', '(helps a lot)') + '</small></summary>' +
        '<p class="hint">' + T('In Zockmix: Einstellungen → „Hilfe für Tester“ → „Fehler-Liste“ → „Kopieren“. Dann hier lange drücken und „Einfügen“ wählen.',
          'In Zockmix: Settings → “Help for testers” → “Error list” → “Copy”. Then long-press here and choose “Paste”.') + '</p>' +
        '<textarea data-f="log" rows="4" maxlength="20000" aria-label="' + T('Fehler-Liste', 'Error list') + '">' + esc(d.log) + '</textarea></details>' : '') +
      '<div class="row2"><label class="fl">' + T('Handy-Modell', 'Phone model') + '<input data-f="dev" maxlength="60" value="' + esc(d.dev) + '" placeholder="' + T('steht in den Handy-Einstellungen', 'see your phone’s settings') + '"></label>' +
      '<label class="fl">' + T('Zockmix-Version', 'Zockmix version') + '<input data-f="ver" maxlength="20" inputmode="decimal" value="' + esc(d.ver) + '" placeholder="' + T('z. B. 2.900', 'e.g. 2.900') + '"></label></div>' +
      '<p class="hint">' + T('Die Version steht ganz unten auf der Zockmix-Startseite.', 'The version is at the very bottom of the Zockmix home screen.') + '</p>' +
      '<label class="fl">' + T('Spitzname', 'Nickname') + ' <small>' + T('(freiwillig – nie dein echter Name)', '(optional – never your real name)') + '</small>' +
      '<input data-f="nick" maxlength="20" value="' + esc(d.nick) + '" placeholder="' + T('z. B. Blitzfuchs', 'e.g. Thunderfox') + '"></label>' +
      '<label class="check"><input type="checkbox" data-f="pub"' + (d.pub ? ' checked' : '') + '><span>' +
      T('Wenn ich Punkte bekomme, darf mein Spitzname auf die Ehrenliste.', 'If I earn points, my nickname may appear on the hall of fame.') + '</span></label>' +
      '<div class="err" id="merr" role="alert" hidden></div>' +
      '<div class="acts"><button type="submit" class="btn big">✉️ ' + T('E-Mail öffnen', 'Open e-mail') + '</button>' +
      '<button type="button" class="btn ghost" id="mcopy">📋 ' + T('Text kopieren', 'Copy text') + '</button></div>' +
      '<details class="prev"><summary>👀 ' + T('So sieht deine Nachricht aus', 'Preview your message') + '</summary><pre id="mprev">' + esc(mailBody()) + '</pre></details>' +
      '<p class="hint">' + T('Kein E-Mail-Programm? Kopiere den Text und schick ihn an', 'No e-mail app? Copy the text and send it to') + ' <b>' + MAIL + '</b> ' +
      '<button type="button" class="link" id="mcaddr">' + T('Adresse kopieren', 'Copy address') + '</button></p>' +
      '<button type="button" class="link" id="mclear">🗑️ ' + T('Formular leeren', 'Clear form') + '</button>' +
      '</form>';
  }
  function thanks() {
    return '<div class="card thanks"><div class="big">💖</div><h2>' + T('Danke!', 'Thank you!') + '</h2>' +
      '<p>' + T('Hat sich dein E-Mail-Programm geöffnet? Dann tippe dort auf <b>Senden</b>. Wir lesen jede Nachricht – eine Antwort kann ein paar Tage dauern.',
        'Did your e-mail app open? Then tap <b>Send</b> there. We read every message – an answer can take a few days.') + '</p>' +
      '<p class="hint">' + T('Wenn deine Meldung uns hilft, bekommst du vielleicht einen Helfer-Code für die Ehrenliste.', 'If your report helps us, you might get a helper code for the hall of fame.') + '</p>' +
      '<div class="acts"><button class="btn" id="tnew">✨ ' + T('Neue Meldung', 'New report') + '</button><button class="btn ghost" id="tback">✏️ ' + T('Zurück zum Text', 'Back to the text') + '</button></div></div>';
  }
  function mailSubject() {
    const k = KINDS[draft.k] || KINDS.fehler, a = draft.a ? area(draft.a) : null;
    const first = String(draft.x || '').trim().replace(/\s+/g, ' ');
    return '[Zockmix ' + T(k[1], k[2]) + (draft.ref ? ' ' + draft.ref : '') + '] ' + (a ? T(a[2], a[3]) + ': ' : '') + (first.length > 50 ? first.slice(0, 48) + '…' : first);
  }
  function mailBody(cut) {
    const d = draft, k = KINDS[d.k] || KINDS.fehler, q = QL[d.k] || QL.fehler, L = [];
    L.push(T('Art', 'Type') + ': ' + k[0] + ' ' + T(k[1], k[2]));
    if (d.ref) { const r = findRef(d.ref); L.push(T('Gehört zu', 'About') + ': ' + d.ref + (r ? ' – ' + F(r, 't') : '')); }
    L.push(T('Bereich', 'Area') + ': ' + (d.a ? T(area(d.a)[2], area(d.a)[3]) : '–') + (d.w.trim() ? ' – ' + d.w.trim() : ''));
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
    if (el) { el.hidden = !e.length; el.innerHTML = e.map(esc).join('<br>'); }
    if (e.length && el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    return !e.length;
  }
  function sendMail() {
    if (!check()) return;
    LS.set('draft', draft);
    const full = mailBody(), body = full.length > 3500 ? mailBody(Math.max(300, 3500 - (full.length - draft.log.trim().length))) : full;
    const a = document.createElement('a');
    a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(mailSubject()) + '&body=' + encodeURIComponent(body);
    document.body.appendChild(a); a.click(); a.remove();
    if (body !== full) toast(T('Die Fehler-Liste war sehr lang und wurde gekürzt.', 'The error list was very long and got shortened.'));
    st.thx = true; setTimeout(() => { render(); window.scrollTo(0, 0); }, 400);
  }
  function setDraftK(k, ref, a) {
    draft.k = KINDS[k] ? k : 'fehler';
    draft.ref = ref || '';
    if (a) draft.a = a;
    st.thx = false; LS.set('draft', draft);
  }

  // ---------- Reiter: Helfer ----------
  function myHelper() { const c = LS.get('code', ''); if (!c) return null; const h = C.hash(c); return h ? helpers.find(x => x.h === h) || null : null; }
  function vHelp() {
    const me = myHelper();
    const board = helpers.filter(h => h.pub).map(h => ({ h, sc: score(h) })).sort((a, b) => (b.sc.pts - a.sc.pts) || String(a.h.seit || '').localeCompare(String(b.h.seit || '')));
    return '<h1 class="vh">🏆 ' + T('Helfer', 'Helpers') + '</h1>' +
      '<p class="sub">' + T('Wer hilft, Zockmix besser zu machen, sammelt Punkte, steigt im Rang auf und bekommt Abzeichen.', 'Everyone who helps make Zockmix better earns points, climbs the ranks and collects badges.') + '</p>' +
      (me ? card(me) : codeBox()) +
      '<h2>🪜 ' + T('Die Ränge', 'The ranks') + '</h2><ol class="ranks">' +
      RANKS.map((r, i) => '<li style="--c:' + r[4] + '"' + (me && rankOf(score(me).pts) === i ? ' class="me"' : '') + '><i>' + r[1] + '</i><b>' + T(r[2], r[3]) + '</b><span>' + (i ? T('ab ', 'from ') + r[0] + ' ' + T('Punkten', 'points') : T('zum Start', 'to start')) + '</span></li>').join('') + '</ol>' +
      '<h2>⭐ ' + T('So bekommst du Punkte', 'How to earn points') + '</h2><ul class="pts card">' +
      POINTS.map(p => '<li><i>' + p[0] + '</i><span>' + T(p[2], p[3]) + '</span><b>+' + p[1] + '</b></li>').join('') + '</ul>' +
      '<h2>🎖️ ' + T('Abzeichen', 'Badges') + '</h2><div class="badges">' +
      BADGES.map(b => { const got = me && score(me).got.includes(b); return '<div class="bdg' + (got ? ' got' : '') + '"><i>' + b[1] + '</i><b>' + T(b[2], b[3]) + '</b><span>' + T(b[4], b[5]) + '</span></div>'; }).join('') + '</div>' +
      '<h2>🌟 ' + T('Ehrenliste', 'Hall of fame') + '</h2>' + (board.length ? fame(board, me) :
        '<div class="card empty2"><div class="big">🏅</div><p>' + T('Noch ist die Ehrenliste leer. Melde einen Fehler oder schick eine Idee – vielleicht stehst du bald hier ganz oben!',
          'The hall of fame is still empty. Report a bug or send an idea – maybe you’ll soon be right at the top!') + '</p><a class="btn" href="#melden" data-k="fehler">✉️ ' + T('Jetzt melden', 'Report now') + '</a></div>');
  }
  function codeBox() {
    return '<div class="card codebox"><h3>🔑 ' + T('Hast du einen Helfer-Code?', 'Do you have a helper code?') + '</h3>' +
      '<p>' + T('Wenn deine Meldung uns hilft, schicken wir dir einen Helfer-Code. Damit siehst du hier deine eigene Helfer-Karte.', 'If your report helps us, we’ll send you a helper code. With it you can see your own helper card here.') + '</p>' +
      '<form id="cf" class="cf"><input id="cin" maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ZM-XXXX-XXXX" aria-label="' + T('Helfer-Code', 'Helper code') + '">' +
      '<button class="btn">' + T('Los', 'Go') + '</button></form><div class="err" id="cerr" role="alert" hidden></div></div>';
  }
  function card(h) {
    const sc = score(h), ri = rankOf(sc.pts), r = RANKS[ri], nx = RANKS[ri + 1];
    const pct = nx ? Math.round(100 * (sc.pts - r[0]) / (nx[0] - r[0])) : 100;
    return '<div class="hcard" style="--c:' + r[4] + '"><div class="hav" aria-hidden="true">' + esc(h.av || '🙂') + '</div>' +
      '<div class="hn">' + esc(h.n) + '</div><div class="hr">' + r[1] + ' ' + T(r[2], r[3]) + ' · <b>' + sc.pts + '</b> ' + T('Punkte', 'points') + '</div>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="bn">' + (nx ? T('Noch', 'Only') + ' ' + (nx[0] - sc.pts) + ' ' + T('Punkte bis', 'points to') + ' ' + nx[1] + ' ' + T(nx[2], nx[3]) : T('Höchster Rang erreicht – wow!', 'Highest rank reached – wow!')) + '</div>' +
      (sc.got.length ? '<div class="hb">' + sc.got.map(b => '<span title="' + esc(T(b[4], b[5])) + '">' + b[1] + ' ' + T(b[2], b[3]) + '</span>').join('') + '</div>' : '') +
      '<details class="hist"' + (sc.it.length ? '' : ' hidden') + '><summary>' + T('Deine Beiträge', 'Your contributions') + ' (' + sc.it.length + ')</summary><ul>' +
      sc.it.map(x => '<li><i>' + x.e + '</i><span>' + (x.ref ? '<a href="' + x.ref + '">' + esc(x.id) + '</a> ' : '') + esc(x.t) + '<small>' + fmtDate(x.d) + '</small></span><b>+' + x.p + '</b></li>').join('') + '</ul></details>' +
      '<p class="hpub">' + (h.pub ? '🌟 ' + T('Du stehst auf der Ehrenliste.', 'You’re on the hall of fame.') : '🙈 ' + T('Du stehst nicht auf der Ehrenliste (nur du siehst diese Karte).', 'You’re not on the hall of fame (only you see this card).')) + '</p>' +
      '<button class="link" id="cout">' + T('Code auf diesem Handy vergessen', 'Forget code on this phone') + '</button></div>';
  }
  function fame(board, me) {
    const row = (x, i) => { const r = RANKS[rankOf(x.sc.pts)]; return '<li' + (me && me.id === x.h.id ? ' class="me"' : '') + '><em>' + (i + 1) + '</em><i>' + esc(x.h.av || '🙂') + '</i>' +
      '<span><b>' + esc(x.h.n) + (me && me.id === x.h.id ? ' <small>(' + T('du', 'you') + ')</small>' : '') + '</b><small>' + r[1] + ' ' + T(r[2], r[3]) + '</small></span><strong>' + x.sc.pts + '</strong></li>'; };
    const top = board.slice(0, 3), order = [1, 0, 2].filter(i => top[i]);
    return '<div class="podium">' + order.map(i => '<div class="pd p' + (i + 1) + '"><i>' + esc(top[i].h.av || '🙂') + '</i><b>' + esc(top[i].h.n) + '</b><span>' + top[i].sc.pts + ' ' + T('Pkt.', 'pts') + '</span><div>' + (i + 1) + '</div></div>').join('') + '</div>' +
      (board.length > 3 ? '<ol class="fame card">' + board.slice(3).map((x, i) => row(x, i + 3)).join('') + '</ol>' : '');
  }

  // ---------- Anzeigen ----------
  const VIEWS = { start: vStart, fehler: vBugs, melden: vReport, ideen: vIdeas, helfer: vHelp };
  function render() {
    const v = $('#view');
    v.innerHTML = VIEWS[cur]();
    v.className = 'view v-' + cur;
  }
  function route() {
    const h = decodeURIComponent((location.hash || '').slice(1)).split('/');
    const tab = TABS.includes(h[0]) ? h[0] : 'start', same = tab === cur;
    focusId = h[1] || '';
    cur = tab; dots[tab] = false;
    if (focusId && tab === 'fehler') { st.bf = 'alle'; st.ba = ''; st.bq = ''; }
    if (focusId && tab === 'ideen') st.idf = 'alle';
    paintChrome(); render();
    if (focusId) { const el = document.getElementById('i-' + focusId); if (el) setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60); }
    else if (!same) window.scrollTo(0, 0);
  }

  // ---------- Bedienung ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a, [data-more]');
    if (!t) return;
    if (t.dataset.k) setDraftK(t.dataset.k, '', '');
    if (t.dataset.bf) { st.bf = t.dataset.bf; if (cur === 'fehler') { e.preventDefault(); render(); } return; }
    if (t.dataset.if) { st.idf = t.dataset.if; if (cur === 'ideen') { e.preventDefault(); render(); } return; }
    if (t.dataset.l) { EN = t.dataset.l === 'en'; LS.set('lang', EN ? 'en' : 'de'); paintChrome(); render(); return; }
    if (t.hasAttribute('data-more')) { const tx = t.previousElementSibling; tx.classList.remove('clamp'); t.remove(); return; }
    if (t.dataset.me) {
      const r = findRef(t.dataset.me);
      setDraftK(t.dataset.me[0] === 'I' ? 'idee' : 'fehler', t.dataset.me, r && r.a);
      location.hash = '#melden'; return;
    }
    if (t.hasAttribute('data-unref')) { draft.ref = ''; saveDraft(); render(); return; }
    switch (t.id) {
      case 'mcopy': if (check()) copy(mailSubject() + '\n\n' + mailBody(), T('Text kopiert!', 'Text copied!')); break;
      case 'mcaddr': copy(MAIL, T('Adresse kopiert!', 'Address copied!')); break;
      case 'mclear': if (confirm(T('Alles im Formular löschen?', 'Clear everything in the form?'))) { draft = D0(); LS.del('draft'); render(); } break;
      case 'tnew': draft = D0(); LS.del('draft'); st.thx = false; render(); break;
      case 'tback': st.thx = false; render(); break;
      case 'cout': LS.del('code'); render(); toast(T('Code vergessen.', 'Code forgotten.')); break;
      case 'instBtn': if (instEv) { instEv.prompt(); instEv.userChoice.finally(() => { instEv = null; const b = $('#instBtn'); if (b) b.hidden = true; }); } break;
      case 'wipe':
        if (confirm(T('Sprache, Entwurf und Helfer-Code auf diesem Handy löschen?', 'Delete language, draft and helper code on this phone?'))) {
          ['lang', 'draft', 'code', 'seen'].forEach(LS.del); draft = D0(); toast(T('Gelöscht.', 'Deleted.')); render();
        }
        break;
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'bq') { st.bq = t.value; $('#blist').innerHTML = bugList(); return; }
    if (t.dataset.f) {
      draft[t.dataset.f] = t.type === 'checkbox' ? t.checked : t.value; saveDraft();
      const p = $('#mprev'); if (p) p.textContent = mailBody();
      const er = $('#merr'); if (er && !er.hidden && draft.a && String(draft.x).trim().length >= 8) er.hidden = true;
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'ba') { st.ba = t.value; $('#blist').innerHTML = bugList(); return; }
    if (t.name === 'k') { draft.k = t.value; saveDraft(); render(); return; }
    if (t.name === 'oft') { draft.oft = t.value; saveDraft(); t.closest('fieldset').querySelectorAll('label').forEach(l => l.classList.toggle('on', l.contains(t))); const p = $('#mprev'); if (p) p.textContent = mailBody(); }
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'mf') return sendMail();
    if (e.target.id === 'cf') {
      const v = $('#cin').value, er = $('#cerr');
      if (!C.ok(v)) { er.hidden = false; er.textContent = T('So sieht ein Helfer-Code aus: ZM-ABCD-2345', 'A helper code looks like this: ZM-ABCD-2345'); return; }
      const h = helpers.find(x => x.h === C.hash(v));
      if (!h) { er.hidden = false; er.textContent = T('Diesen Code kennen wir (noch) nicht. Neue Codes stehen manchmal erst nach ein paar Tagen hier.', 'We don’t know this code (yet). New codes sometimes only show up after a few days.'); return; }
      LS.set('code', C.fmt(v)); render(); toast(T('Hallo ', 'Hi ') + h.n + '! 👋');
    }
  });

  // ---------- Als App installieren ----------
  let instEv = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); instEv = e; const b = $('#instBtn'); if (b) b.hidden = false; });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Speicher geht es auch */ }));
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
  window.__zh = { score: h => score(h), draft: () => draft, body: () => mailBody(), subject: () => mailSubject(), st, render, go: h => { location.hash = h; } };
})();
