/* Beiträge (Neuigkeiten) – NEUESTE OBEN. Nur der Entwickler schreibt hier.
   Felder: id (b + Zahl, nie doppelt), d Datum JJJJ-MM-TT, k Art (neu | update | tipp | test | info), ic Bildchen (Name aus js/icons.js, z. B. sparkle, castle, home, phone, cog, bug, star – darf fehlen, dann passend zur Art),
   de/en { t Titel, x Text }, l Zahl der Likes (freiwillig, aus den Stimmen-E-Mails zusammengezählt). Im Text: Leerzeile = neuer Absatz, Zeilen mit „- “ = Liste, **fett**,
   [Link-Text](#fehler/F-003) springt in der Hilfe, [Link-Text](https://…) öffnet eine Webseite. Englisch darf fehlen (dann Deutsch). */
window.ZH = window.ZH || {};
ZH.posts = [
  { id: 'b4', d: '2026-11-03', k: 'info', ic: 'cog',
    de: { t: 'Willkommen im Zockwerk!',
      x: 'Das Zockwerk ist die Werkstatt von Zockmix. Zockmix selbst sammelt **keine Daten** und hat nicht einmal Internet. Darum gibt es diese Seite: Hier erfährst du, was es Neues gibt, welche Fehler wir schon kennen und was wir gerade bauen.\n\n- **Fehler:** bekannte Fehler und ob sie schon repariert sind\n- **Melden:** schreib uns einen Fehler, eine Idee oder eine Frage\n- **Ideen:** was geplant ist und was schon fertig ist\n- **Helfer:** wer hilft, sammelt Punkte und steigt im Rang auf\n\nDeine Meldung schickst du ganz normal als E-Mail – du siehst vorher genau, was drinsteht.' },
    en: { t: 'Welcome to Zockwerk!',
      x: 'Zockwerk is the workshop of Zockmix. Zockmix itself collects **no data** and doesn’t even use the internet. That’s why this page exists: here you can see what’s new, which bugs we already know about and what we’re building right now.\n\n- **Bugs:** known bugs and whether they’re fixed yet\n- **Report:** send us a bug, an idea or a question\n- **Ideas:** what’s planned and what’s done\n- **Helpers:** helpers earn points and climb the ranks\n\nYou send your report as a normal e-mail – and you see exactly what’s in it first.' } },
  { id: 'b3', d: '2026-11-03', k: 'neu', ic: 'castle',
    de: { t: 'Neu: Burg-Wächter',
      x: 'Beschütze deine Burg! Baue Türme an den Weg, schicke Helden los und halte alle Monster-Wellen auf.\n\n- 50 Karten in fünf Ländern\n- Helden mit Superkraft\n- drei Schwierigkeiten: leicht, normal und profi\n- Endlos-Modus, Erfolge und eine Schatzkammer' },
    en: { t: 'New: Castle Guard',
      x: 'Protect your castle! Build towers along the path, send out heroes and stop every wave of monsters.\n\n- 50 maps in five lands\n- heroes with super powers\n- three difficulties: easy, normal and pro\n- endless mode, achievements and a treasure room' } },
  { id: 'b2', d: '2026-11-02', k: 'update', ic: 'home',
    de: { t: 'Baumix ist jetzt ein Haus- und Stadt-Baukasten',
      x: 'Baue Häuser mit Möbeln, ganze Straßen und sogar eine Großstadt – und lauf danach selbst durch deine Welt.\n\n- Stockwerke mit Treppen und ein Glas-Aufzug\n- Autos fahren, Taxi rufen, Wetter und Tageszeit\n- ein Handy und ein Computer im Spiel – mit eigenen Mini-Spielen' },
    en: { t: 'Baumix is now a house and city builder',
      x: 'Build houses with furniture, whole streets and even a big city – then walk through your world yourself.\n\n- floors with stairs and a glass elevator\n- drive cars, call a taxi, weather and time of day\n- a phone and a computer in the game – with their own mini games' } },
  { id: 'b1', d: '2026-11-01', k: 'test', ic: 'phone',
    de: { t: 'Bald im Google Play Store',
      x: 'Zockmix kommt bald in den Google Play Store. Vorher testen wir die App mit einer kleinen Gruppe von Testern.\n\nDu möchtest beim Testen helfen? Dann schreib uns über **Melden** → **Frage**. Zum Testen braucht man ein Google-Konto – bei Kindern bitte nur mit Erlaubnis der Eltern.' },
    en: { t: 'Coming soon to Google Play',
      x: 'Zockmix is coming to the Google Play Store soon. Before that, a small group of testers tries out the app.\n\nWould you like to help test? Write to us via **Report** → **Question**. Testing needs a Google account – kids please only with a parent’s permission.' } },
];
