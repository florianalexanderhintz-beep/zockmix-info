/* Ideen und Pläne. Felder: id (I-001 …), s Stand (idee | geplant | arbeit | fertig | nein), a Bereich (wie bei fehler.js),
   d eingeschickt/notiert am, u zuletzt geändert (freiwillig), v wie viele sich das wünschen (freiwillig),
   by Helfer-ids (wer die Idee hatte – gibt Punkte), de/en { t Titel, x Text, r Antwort/Grund vom Entwickler }. */
window.ZH = window.ZH || {};
ZH.ideas = [
  { id: 'I-001', s: 'arbeit', a: 'app', d: '2026-10-28', by: [],
    de: { t: 'Zockmix im Google Play Store', x: 'Zockmix soll ganz normal im Play Store zu finden sein.', r: 'Wir bereiten gerade alles vor – zuerst kommt ein Test mit Testern.' },
    en: { t: 'Zockmix on Google Play', x: 'Zockmix should be easy to find in the Play Store.', r: 'We’re getting everything ready – a test with testers comes first.' } },
  { id: 'I-002', s: 'idee', a: 'sim', d: '2026-10-20', by: [],
    de: { t: 'PC-Simulator: Start-Jahr selbst wählen', x: 'Zum Beispiel schon 1993 mit dem allerersten PC anfangen.', r: 'Gute Idee! Dafür brauchen wir noch Bauteile und 3D-Modelle aus der alten Zeit.' },
    en: { t: 'PC simulator: choose your start year', x: 'For example, start as early as 1993 with the very first PC.', r: 'Great idea! For that we still need parts and 3D models from the old days.' } },
  { id: 'I-003', s: 'fertig', a: 'app', d: '2026-10-28', u: '2026-10-31', by: [],
    de: { t: 'Zockmix auf Englisch', x: 'Alle Spiele und Bereiche auch auf Englisch.', r: 'Fertig! Einstellungen → ganz oben „Sprache · Language“.' },
    en: { t: 'Zockmix in English', x: 'All games and areas in English too.', r: 'Done! Settings → “Sprache · Language” at the very top.' } },
  { id: 'I-004', s: 'fertig', a: 'app', d: '2026-10-27', u: '2026-10-28', by: [],
    de: { t: 'Verschiedene Designs für die Startseite', x: 'Die Startseite soll man umgestalten können.', r: 'Fertig! Es gibt jetzt Standard, Hell, Dunkel und Neon.' },
    en: { t: 'Different designs for the home screen', x: 'You should be able to change the look of the home screen.', r: 'Done! There’s now Standard, Light, Dark and Neon.' } },
  { id: 'I-005', s: 'nein', a: 'lernmix', d: '2026-10-31', by: [],
    de: { t: 'Lernmix auf Englisch', x: 'Lernmix auch auf Englisch anbieten.', r: 'Lernmix ist genau für deutsche Schulen gemacht (Klassen, Fächer, Noten 1–6). Darum bleibt es auf Deutsch.' },
    en: { t: 'Lernmix in English', x: 'Offer Lernmix in English too.', r: 'Lernmix is made for German schools (grades, subjects, German report-card marks). So it stays in German.' } },
];
