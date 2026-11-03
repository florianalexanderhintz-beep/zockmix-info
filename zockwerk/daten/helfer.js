/* Helfer (Ränge und Ehrenliste). Nur Spitznamen – NIE echte Namen, Adressen oder E-Mail-Adressen eintragen!
   Felder: id (h1, h2 … – nie ändern, steht auch bei Fehlern/Ideen unter „by“), n Spitzname, av Bildchen (ein Emoji, darf fehlen – dann der Anfangsbuchstabe auf einer Farbe),
   pub 1 = darf auf die Ehrenliste (nur wenn der Helfer – bei Kindern die Eltern – ja gesagt hat), 0 = nur eigene Karte,
   h Prüfsumme des Helfer-Codes (macht werkzeug.html – der Code selbst kommt NIE hier rein), seit Datum,
   badges Extra-Abzeichen von Hand (ersttester, dank),
   extra Punkte für Sachen ohne Fehler/Idee: [{ d Datum, k test | tipp | hilfe, p Punkte, de Text, en Text }].
   Punkte für Fehler und Ideen rechnet die Seite selbst aus „by“ in fehler.js/ideen.js aus.
   Beispiel:
   { id: 'h1', n: 'Blitzfuchs', av: '🦊', pub: 1, h: '0a1b2c3d4e5f60', seit: '2026-11-10', badges: ['ersttester'],
     extra: [{ d: '2026-11-20', k: 'test', p: 20, de: 'Beim Test vor dem Start dabei', en: 'Took part in the pre-launch test' }] }, */
window.ZH = window.ZH || {};
ZH.helpers = [
];
