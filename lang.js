/* Sprachwahl der Zockmix-Infoseite: steht nur in der Adresse (#de / #en) – keine Cookies, nichts wird gespeichert.
   Ohne Angabe: Sprache des Browsers. Links zu den anderen Seiten nehmen die Sprache mit. */
(function () {
  var D = document.documentElement;
  function pick() { var h = (location.hash || '').slice(1); return h === 'de' || h === 'en' ? h : /^de/i.test(navigator.language || '') ? 'de' : 'en'; }
  function set(l, push) {
    D.lang = l;
    document.title = D.getAttribute('data-t-' + l) || document.title;
    var b = document.querySelectorAll('.langsw button');
    for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', b[i].getAttribute('data-l') === l ? 'true' : 'false');
    var a = document.querySelectorAll('a[data-keep]');
    for (var j = 0; j < a.length; j++) a[j].setAttribute('href', a[j].getAttribute('data-keep') + '#' + l);
    if (push && location.hash !== '#' + l) history.replaceState(null, '', '#' + l);
  }
  D.lang = pick();
  document.addEventListener('DOMContentLoaded', function () {
    set(D.lang, false);
    var b = document.querySelectorAll('.langsw button');
    for (var i = 0; i < b.length; i++) b[i].addEventListener('click', function () { set(this.getAttribute('data-l'), true); });
  });
  window.addEventListener('hashchange', function () { set(pick(), false); });
})();
