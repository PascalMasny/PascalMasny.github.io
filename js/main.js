// ─── Dynamic stats calculation ────────────────────────────────────────────────
function calcStats() {
  const now      = new Date();
  const birth    = new Date(2004, 4, 28);   // 28 May 2004
  const workStart = new Date(2020, 8, 1);   // Sep 2020
  const codeStart = new Date(2015, 0, 1);   // age 11 ≈ 2015

  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;

  let yearsWork = now.getFullYear() - workStart.getFullYear();
  if (now.getMonth() < workStart.getMonth() || (now.getMonth() === workStart.getMonth() && now.getDate() < workStart.getDate())) yearsWork--;

  const yearsCode = now.getFullYear() - codeStart.getFullYear();

  return { age, yearsWork, yearsCode };
}

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  de: {
    'nav.about': '~/about', 'nav.projects': '~/projects',
    'nav.skills': '~/skills', 'nav.services': '~/services',
    'nav.personal': '~/personal', 'nav.contact': '~/contact', 'nav.cv': 'cv.html',

    'hero.greeting': '$ whoami',
    'hero.badge':    '5+ Jahre Berufserfahrung \u2014 angefangen mit 16',
    'hero.summary':  'Python-Veteran; IT Consultant; Systemdenker. Seit 16 in der Industrie; seit 11 am Programmieren. Keine KI, keine Shortcuts.',
    'hero.ctaContact': './hire_me.sh',
    'hero.ctaPitch':   './pitch.sh',
    'hero.statIndustry': 'Jahre Berufserfahrung', 'hero.statIndustrySub': 'Industrie &amp; Beratung ab 16',
    'hero.statCoding': 'Jahre Programmieren', 'hero.statAge': 'Jahre alt',

    'about.title': 'cat README.md',
    'about.p1': 'Mit 11 Jahren habe ich den IT-Raum meiner Realschule gesehen und seitdem nie wieder aufgehört zu programmieren. Keine KI, keine Shortcuts: Ich habe Programmieren mit Büchern gelernt; Zeile für Zeile; Fehler für Fehler. Mit 13 meinen ersten Roboter gebaut und die Schwäbische Robotik-Meisterschaft gewonnen. Mit 14 kamen Arduinos und Lötkolben; inklusive verbrannter Finger. Mit 15 habe ich das Schulnetzwerk lahmgelegt; nicht aus böser Absicht; aus Neugier.',
    'about.p2': 'Mit 16 bin ich als Azubi ins Arbeitsleben eingestiegen und konnte vom ersten Tag an in echten Projekten mitarbeiten. Was für andere der Einstieg war, war für mich schon Routine. In der Ausbildung habe ich Sicherheitslücken im SAP-System aufgedeckt und mit Raspberry Pi und WiFi-Antenne Daten ausgelesen; der Hobby-Hacker lässt sich nicht abstellen.',
    'about.p3': 'Abitur neben der Arbeit; jetzt Systems Engineering (B.Sc.) an der THA; 20+ Stunden Studium und 20 Stunden Arbeit als IT-Berater. Seit ich 16 bin, sind meine 3D-Drucker ständige Begleiter; heute Uni-Projekte und Kohlefaserdrucke, die meinen Oldtimer zusammenhalten. Mit {age}: Python-Veteran; {yearsCode} Jahre Erfahrung; davon {yearsWork} Jahre in der Industrie.',
    'about.quote': 'Programmieren kann heute jeder; Software zu entwickeln und Prozesse wirklich zu verstehen, das können wenige. Ich produziere keinen AI Slop.',
    'about.tagInterests': '// stack', 'about.tagPersonal': '// personal',

    'about.tag.dataanalysis': '📊 Datenanalyse',
    'about.tag.automation': '🔧 Automatisierung',
    'about.tag.networks': '🌐 Netzwerke',
    'about.tag.databases': '🗄️ Datenbanken',
    'about.tag.dance': '💃 Paartanz',
    'about.tag.print': '🖨️ 3D-Druck',
    'about.tag.botany': '🌿 Botanik',
    'about.tag.cooking': '👨‍🍳 Kochen',
    'about.tag.oldtimer': '🚗 Oldtimer',
    'about.tag.hacking': '🔓 Hobby-Hacking',

    'skill.sql': 'SQL Familie',
    'skill.stats': 'Statistik',
    'skill.projectmgmt': 'Projektmanagement',
    'skill.cnc': 'CNC & Fertigung',
    'downloads.cleverrefill': 'CleverRefill_Präsentation.pdf',
    'downloads.rest': 'REST_Projektdokumentation.pdf',

    'srv.title': 'cat services.txt',
    'srv.intro': 'Was ich anbiete; was ich kann; was ich mache.',
    'srv.python.title': 'Python; Data Science & Prozesse',
    'srv.python.desc': 'Automatisierung, Datenanalyse, Custom Tools und Scripts. Statistik und Mathematik. Ich baue Dinge, die funktionieren und nicht kaputt gehen.',
    'srv.enterprise.title': 'CRM; ERP & Enterprise Systeme',
    'srv.enterprise.desc': 'Salesforce, SAP, Celonis mit Data Mining. Consulting bedeutet für mich: Problem verstehen, nicht Code-Monkey spielen. Moderne Beratung ist Kommunikation und Systemverständnis.',
    'srv.engineering.title': 'Engineering & Making',
    'srv.engineering.desc': '3D-Druck FDM/SLA mit CF/GF/PEEK; Fusion 360 und Solidworks; Elektronik bis 230V; CNC, Drehen und Schweißen. Ich baue Dinge, die real existieren.',
    'srv.cta': '$ mail --to pascal --subject "hire"',

    'proj.title': 'ls -la projects/',
    'proj.cleverRefill.desc': 'Python-Web-App zur Echtzeit-Visualisierung lokaler Kraftstoffpreise; günstigste Tankstelle finden und Navigation dorthin. English-Talk-Präsentation an der BS VII. Amortisationszeit: 16 Monate.',
    'proj.cleverRefill.at': '@ manroland Goss / BS VII · 2022',
    'proj.cleverRefill.cost': 'Projektkosten: 162,53 EUR',
    'proj.cleverRefill.read': 'Präsentation lesen',
    'proj.ihk.title': 'Druckmaschinen-Analyse',
    'proj.ihk.desc': 'IHK-Abschlussprojekt: Python-Analyse und Graphviz-Tree-Visualisierung von Druckmaschinen-Strukturstücklisten mit bis zu 190.000 Einzelteilen; PyCelonis- und SAP-S/4HANA-Integration. 6 Einkäufer sparen je 1,5 h/Woche; Amortisation nach 9,32 Wochen.',
    'proj.ihk.at': '@ manroland Goss · 2023 · IHK 1,9',
    'proj.ihk.cost': 'Projektkosten: 6.767,80 EUR',
    'proj.ihk.read': 'Dokumentation lesen',
    'proj.rest.desc': 'Schulprojekt (BS VII): Node.js/ExpressJS-REST-API für Kundenverwaltung eines fiktiven Online-Shops (WarpShop); MySQL-Backend; vollständige MVC-Architektur mit Route-, Model- und Datenbank-Schicht. 10-Stunden-Projekt; alle Anforderungen erfüllt.',
    'proj.rest.at': '@ BS VII · 2023 · Schulprojekt',
    'proj.rest.hours': 'Aufwand: 10 Stunden',
    'proj.rest.read': 'Dokumentation lesen',
    'proj.minti.title': 'MINTi-Würfel',
    'proj.minti.desc': 'Interaktives Lernspielzeug für Kinder von 2-6 Jahren; bestehend aus Theremin, Zahnradgetriebe, Farbmischer, Kugellabyrinth und Audio-Märchen. Solarbetrieben; vollständig mit FDM-3D-Druck gefertigt. ESP32-C6 Mikrocontroller.',
    'proj.minti.price': 'Stückpreis: 373,86 EUR (Material 75,73 EUR + Arbeit 111,20 EUR + 100% Marge)',
    'proj.minti.at': '@ THA; WS 2025/2026',
    'proj.minti.read': 'Dokumentation lesen',

    'skills.title': 'pip list && uname -a',
    'skills.cat.languages': '# programmierung', 'skills.cat.tools': '# tools',
    'skills.cat.data': '# data science', 'skills.cat.enterprise': '# enterprise',
    'skills.cat.engineering': '# engineering', 'skills.cat.os': '# betriebssysteme',
    'lang.de': 'Deutsch', 'lang.de.level': 'Muttersprache', 'lang.en': 'Englisch', 'lang.en.level': 'Verhandlungssicher',

    'certs.title': 'ls ~/certs/', 'certs.cisco.desc': 'Networking & Security', 'certs.celonis.desc': 'Process Mining',
    'certs.sf.desc': 'CRM Administration',
    'awards.title': 'cat awards.txt', 'awards.robot.title': 'Schwäbischer Robotik Meister', 'awards.shipit.title': 'ShipIt Gewinner',
    'awards.minti.title': 'MINTi Cube', 'awards.minti.desc': 'THA & Funkenwerk · Lernwürfel für Kinder 3–6',

    'nav.journey': '~/journey',

    'personal.title': 'cat hobbies.txt',
    'hobby.dance.title': 'Paartanz', 'hobby.dance.desc': 'Klassisch, Latein & Ballett; Tanz als Gegenpol zur Bildschirmzeit.',
    'hobby.print.title': '3D-Druck', 'hobby.print.desc': 'Seit 16; von Fidget Toys zu Kohlefaserdrucken, die meinen Oldtimer zusammenhalten.',
    'hobby.botany.title': 'Botanik', 'hobby.botany.desc': 'Pflanzenvielfalt erforschen und kultivieren; systematisches Denken außerhalb des Terminals.',
    'hobby.cooking.title': 'Kochen', 'hobby.cooking.desc': 'Kochen als Wissenschaft; Experimentieren mit Rezepten und Techniken aus aller Welt.',
    'hobby.hacking.title': 'Hobby-Hacking', 'hobby.hacking.desc': 'Raspberry Pi, WiFi-Antennen, SAP-Sicherheitslücken; der Hacker in mir lässt sich nicht abstellen.',

    'contact.title': 'ping pascal.masny', 'contact.card': 'vcard.vcf',
    'downloads.title': 'ls ~/docs/', 'downloads.allBtn': 'zip -r ./complete_profile.zip *',
    'downloads.hint': 'Alle Projektdokumentationen',
    'downloads.cv': 'CV_Pascal_Masny', 'downloads.cv.sub': 'Live · DE & EN · Drucken → PDF',
    'downloads.cl': 'Anschreiben / Cover Letter', 'downloads.cl.sub': 'Live · DE & EN · Drucken → PDF',
    'downloads.ihk': 'IHK_Projektdokumentation.pdf',
    'downloads.minti': 'MINTi_Würfel_Projektdokumentation.pdf',
    'footer.legal': '# Privates Projekt; nicht kommerziell; gemäß § 5 TMG von der Impressumspflicht befreit.',
    'footer.privacy': '# Keine Cookies; kein Tracking; kein externes Analytics. Datenschutz liegt mir am Herzen.',
  },
  en: {
    'nav.about': '~/about', 'nav.projects': '~/projects',
    'nav.skills': '~/skills', 'nav.services': '~/services',
    'nav.personal': '~/personal', 'nav.contact': '~/contact', 'nav.cv': 'cv.html',

    'hero.greeting': '$ whoami',
    'hero.badge':    '5+ years industry experience \u2014 started at 16',
    'hero.summary':  'Python veteran; IT consultant; systems thinker. In industry since 16; coding since 11. No AI, no shortcuts.',
    'hero.ctaContact': './hire_me.sh',
    'hero.ctaPitch':   './pitch.sh',
    'hero.statIndustry': 'Years experience', 'hero.statIndustrySub': 'industry &amp; consulting since 16',
    'hero.statCoding': 'Years coding', 'hero.statAge': 'Years old',

    'about.title': 'cat README.md',
    'about.p1': 'At 11, I walked into my school\'s IT room and never stopped coding. No AI, no shortcuts: I learned to code from books; line by line; error by error. At 13 I built my first robot and won the Swabian Robotics Championship. At 14 came Arduinos and soldering irons; including burned fingers. At 15 I took down the school network; not maliciously; out of curiosity.',
    'about.p2': 'At 16 I started my apprenticeship and contributed to real projects from day one. What was the entry point for others was already routine for me. During training I found security vulnerabilities in the SAP system and read data with a Raspberry Pi and WiFi antenna; the hobby hacker never turned off.',
    'about.p3': 'Abitur alongside work; now Systems Engineering (B.Sc.) at THA; 20+ hours studying and 20 hours working as an IT consultant. Since 16, my 3D printers have been constant companions; now university projects and carbon fiber prints holding my vintage car together. At {age}: Python veteran; {yearsCode} years experience; {yearsWork} of them in industry.',
    'about.quote': 'Anyone can write code today; building software and truly understanding processes is a different skill entirely. I don\'t produce AI slop.',
    'about.tagInterests': '// stack', 'about.tagPersonal': '// personal',

    'about.tag.dataanalysis': '📊 Data Analysis',
    'about.tag.automation': '🔧 Automation',
    'about.tag.networks': '🌐 Networks',
    'about.tag.databases': '🗄️ Databases',
    'about.tag.dance': '💃 Ballroom Dancing',
    'about.tag.print': '🖨️ 3D Printing',
    'about.tag.botany': '🌿 Botany',
    'about.tag.cooking': '👨‍🍳 Cooking',
    'about.tag.oldtimer': '🚗 Vintage Car',
    'about.tag.hacking': '🔓 Hobby Hacking',

    'skill.sql': 'SQL Family',
    'skill.stats': 'Statistics',
    'skill.projectmgmt': 'Project Management',
    'skill.cnc': 'CNC & Manufacturing',
    'downloads.cleverrefill': 'CleverRefill_Presentation.pdf',
    'downloads.rest': 'REST_Documentation.pdf',

    'srv.title': 'cat services.txt',
    'srv.intro': 'What I offer; what I do; what I build.',
    'srv.python.title': 'Python; Data Science & Processes',
    'srv.python.desc': 'Automation, data analysis, custom tools and scripts. Statistics and math. I build things that work and don\'t break.',
    'srv.enterprise.title': 'CRM; ERP & Enterprise Systems',
    'srv.enterprise.desc': 'Salesforce, SAP, Celonis with data mining. Modern consulting is less about code-monkey work; more about understanding the problem. Communication and system thinking.',
    'srv.engineering.title': 'Engineering & Making',
    'srv.engineering.desc': '3D printing FDM/SLA with CF/GF/PEEK; Fusion 360 and Solidworks; electronics up to 230V; CNC, lathe and welding. I build things that physically exist.',
    'srv.cta': '$ mail --to pascal --subject "hire"',

    'proj.title': 'ls -la projects/',
    'proj.cleverRefill.desc': 'Python web app for real-time visualisation of local fuel prices; finds cheapest station and provides navigation. English Talk presentation at BS VII. Payback period: 16 months.',
    'proj.cleverRefill.at': '@ manroland Goss / BS VII · 2022',
    'proj.cleverRefill.cost': 'Project cost: 162.53 EUR',
    'proj.cleverRefill.read': 'Read presentation',
    'proj.ihk.title': 'Printing Press Analysis',
    'proj.ihk.desc': 'IHK final exam project: Python analysis and Graphviz tree visualisation of printing press bills of materials with up to 190,000 parts; PyCelonis and SAP S/4HANA integration. Saves 6 buyers 1.5 h/week each; amortised in 9.32 weeks.',
    'proj.ihk.at': '@ manroland Goss · 2023 · IHK 1.9',
    'proj.ihk.cost': 'Project cost: 6,767.80 EUR',
    'proj.ihk.read': 'Read documentation',
    'proj.rest.desc': 'School project (BS VII): Node.js/ExpressJS REST API for customer management of a fictional online shop (WarpShop); MySQL backend; full MVC architecture with route, model and database layer. 10-hour project; all requirements met.',
    'proj.rest.at': '@ BS VII · 2023 · School project',
    'proj.rest.hours': 'Effort: 10 hours',
    'proj.rest.read': 'Read documentation',
    'proj.minti.title': 'MINTi Cube',
    'proj.minti.desc': 'Interactive STEM learning toy for children aged 2-6; featuring a Theremin, gear mechanism, colour mixer, ball labyrinth and audio stories. Solar-powered; fully manufactured with FDM 3D printing. ESP32-C6 microcontroller.',
    'proj.minti.price': 'Unit price: 373.86 EUR (materials 75.73 EUR + labour 111.20 EUR + 100% margin)',
    'proj.minti.at': '@ THA; WS 2025/2026',
    'proj.minti.read': 'Read documentation',

    'skills.title': 'pip list && uname -a',
    'skills.cat.languages': '# programming', 'skills.cat.tools': '# tools',
    'skills.cat.data': '# data science', 'skills.cat.enterprise': '# enterprise',
    'skills.cat.engineering': '# engineering', 'skills.cat.os': '# operating systems',
    'lang.de': 'German', 'lang.de.level': 'Native', 'lang.en': 'English', 'lang.en.level': 'Business fluent',

    'certs.title': 'ls ~/certs/', 'certs.cisco.desc': 'Networking & Security', 'certs.celonis.desc': 'Process Mining',
    'certs.sf.desc': 'CRM Administration',
    'awards.title': 'cat awards.txt', 'awards.robot.title': 'Swabian Robotics Champion', 'awards.shipit.title': 'ShipIt Winner',
    'awards.minti.title': 'MINTi Cube', 'awards.minti.desc': 'THA & Funkenwerk · Learning Cube for Children 3–6',

    'nav.journey': '~/journey',

    'personal.title': 'cat hobbies.txt',
    'hobby.dance.title': 'Ballroom Dancing', 'hobby.dance.desc': 'Classical, Latin & Ballet; the counterbalance to screen time.',
    'hobby.print.title': '3D Printing', 'hobby.print.desc': 'Since 16; from fidget toys to carbon fiber prints holding my vintage car together.',
    'hobby.botany.title': 'Botany', 'hobby.botany.desc': 'Exploring and cultivating plants; systematic thinking outside the terminal.',
    'hobby.cooking.title': 'Cooking', 'hobby.cooking.desc': 'Cooking as science; experimenting with recipes and techniques from around the world.',
    'hobby.hacking.title': 'Hobby Hacking', 'hobby.hacking.desc': 'Raspberry Pi, WiFi antennas, SAP vulnerabilities; the hacker never turns off.',

    'contact.title': 'ping pascal.masny', 'contact.card': 'vcard.vcf',
    'downloads.title': 'ls ~/docs/', 'downloads.allBtn': 'zip -r ./complete_profile.zip *',
    'downloads.hint': 'All project documentation',
    'downloads.cv': 'CV_Pascal_Masny', 'downloads.cv.sub': 'Live · DE & EN · Print → PDF',
    'downloads.cl': 'Cover Letter / Anschreiben', 'downloads.cl.sub': 'Live · DE & EN · Print → PDF',
    'downloads.ihk': 'IHK_Projektdokumentation.pdf',
    'downloads.minti': 'MINTi_Cube_Documentation.pdf',
    'footer.legal': '# Personal website; non-commercial; disclosed under § 5 TMG (German Telemedia Act).',
    'footer.privacy': '# No cookies; no tracking; no external analytics. I value your privacy.',
  }
};

// ─── State ────────────────────────────────────────────────────────────────────
// Language: use stored preference, otherwise detect from browser Accept-Language.
// navigator.language is already sent as an HTTP header on every request — no cookies needed.
function detectLang() {
  const stored = localStorage.getItem('lang');
  if (stored) return stored;
  return (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
}
let currentLang  = detectLang();
let currentTheme = localStorage.getItem('theme') || 'dark';

// ─── Apply language ───────────────────────────────────────────────────────────
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  const { age, yearsWork, yearsCode } = calcStats();
  document.querySelectorAll('[data-key]').forEach(el => {
    let v = T[lang][el.dataset.key];
    if (v !== undefined) {
      v = v.replace(/\{age\}/g, age)
           .replace(/\{yearsWork\}/g, yearsWork)
           .replace(/\{yearsCode\}/g, yearsCode);
      el.textContent = v;
    }
  });
  // Update hero stat numbers dynamically
  const statAge  = document.getElementById('stat-age');
  const statWork = document.getElementById('stat-industry');
  const statCode = document.getElementById('stat-coding');
  if (statAge)  statAge.textContent  = age;
  if (statWork) statWork.textContent = yearsWork + '+';
  if (statCode) statCode.textContent = yearsCode + '+';
  // Update footer year
  const fyEl = document.getElementById('footer-year');
  if (fyEl) fyEl.textContent = new Date().getFullYear();
  document.getElementById('lang-toggle').textContent = lang === 'de' ? 'EN' : 'DE';
  renderJourney();
  startTypewriter();
}

// ─── Journey (Git Graph) ──────────────────────────────────────────────────────
let journeyFilter = 'all';

const JOURNEY_BTN_LABELS = {
  de: { all: '* alle Zweige', work: '* Beruf', edu: '* Ausbildung', social: '* Soziales' },
  en: { all: '* all branches', work: '* work', edu: '* edu', social: '* social' },
};

function renderJourney() {
  if (typeof CV === 'undefined') return;
  const lang = currentLang;
  const t    = CV.T[lang];
  const lbls = JOURNEY_BTN_LABELS[lang];

  // filter button labels
  ['all', 'work', 'edu', 'social'].forEach(f => {
    const btn = document.querySelector(`.j-btn[data-jfilter="${f}"]`);
    if (btn) btn.textContent = lbls[f];
  });

  // branch headers
  const hdrMap = { work: t.branchWork, edu: t.branchEdu, social: t.branchSocial };
  ['work', 'edu', 'social'].forEach(b => {
    const el = document.getElementById(`j-header-${b}`);
    if (el) el.textContent = hdrMap[b];
  });

  // events
  const byBranch = { work: [], edu: [], social: [] };
  CV.gitEvents.forEach(e => byBranch[e.branch].push(e));

  ['work', 'edu', 'social'].forEach(branch => {
    const el = document.getElementById(`j-events-${branch}`);
    if (!el) return;
    el.innerHTML = byBranch[branch].map(e => {
      const dateStr  = e.dateStart + (e.dateEnd ? ' → ' + e.dateEnd : ' → ' + t.ongoing);
      const tagsHtml = e.tags && e.tags.length
        ? `<div class="j-event-tags">${e.tags.map(tag => `<span class="j-event-tag">${tag}</span>`).join('')}</div>` : '';
      const descHtml = e.desc[lang] ? `<div class="j-event-desc">${e.desc[lang]}</div>` : '';
      return `<div class="j-event">
        <div class="j-event-date">${dateStr}</div>
        <div class="j-event-role">${e.role[lang]}</div>
        <div class="j-event-org">${e.org[lang]}</div>
        ${descHtml}${tagsHtml}
      </div>`;
    }).join('');
  });
}

function filterJourney(filter) {
  // Clicking the already-active branch collapses back to overview
  if (filter !== 'all' && journeyFilter === filter) filter = 'all';
  journeyFilter = filter;
  const grid = document.getElementById('j-grid');
  if (!grid) return;
  grid.className = 'j-grid' + (filter !== 'all' ? ` focus-${filter}` : '');
  document.querySelectorAll('.j-btn').forEach(btn =>
    btn.classList.toggle('j-active', btn.dataset.jfilter === filter)
  );
}

// ─── Apply theme ──────────────────────────────────────────────────────────────
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  btn.innerHTML = theme === 'dark'
    ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
const roles = {
  de: ['Systems Engineer', 'Python Veteran', 'Datenanalyst', 'CRM Consultant', 'Hobby-Hacker', 'Prozessoptimierer'],
  en: ['Systems Engineer', 'Python Veteran', 'Data Analyst',  'CRM Consultant', 'Hobby Hacker',  'Process Optimizer'],
};
let twTimeout = null;
function startTypewriter() {
  if (twTimeout) clearTimeout(twTimeout);
  const el = document.getElementById('typewriter');
  if (!el) return;
  let ri = 0, ci = 0, deleting = false;
  const list = roles[currentLang];
  function tick() {
    const word = list[ri];
    if (!deleting) {
      el.textContent = word.slice(0, ci + 1); ci++;
      if (ci === word.length) { deleting = true; twTimeout = setTimeout(tick, 2200); return; }
    } else {
      el.textContent = word.slice(0, ci - 1); ci--;
      if (ci === 0) { deleting = false; ri = (ri + 1) % list.length; }
    }
    twTimeout = setTimeout(tick, deleting ? 55 : 95);
  }
  el.textContent = ''; tick();
}

// ─── Hero Canvas ──────────────────────────────────────────────────────────────
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  // Skip on touch/mobile - purely decorative, saves battery
  if (window.matchMedia('(pointer: coarse)').matches) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  let particles = [];
  const N = 60, D = 130;

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.2 + 0.4;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }
  }

  function init() { particles = Array.from({ length: N }, () => new P()); }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = currentTheme === 'dark';
    const pc = isDark ? '0,212,110' : '0,107,53';
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pc},0.6)`;
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < D) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${pc},${(1 - dist / D) * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => { resize(); init(); });
  init(); draw();
}

// ─── Scroll animations ────────────────────────────────────────────────────────
function initScrollAnim() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ─── Sticky navbar ────────────────────────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); });

  const ham  = document.getElementById('nav-hamburger');
  const menu = document.getElementById('nav-menu');
  ham.addEventListener('click', () => { ham.classList.toggle('open'); menu.classList.toggle('open'); });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => { ham.classList.remove('open'); menu.classList.remove('open'); });
  });

  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.35 }).forEach ? null : undefined;

  const sObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => sObs.observe(s));
}

// ─── Skill bars ───────────────────────────────────────────────────────────────
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = getComputedStyle(bar).getPropertyValue('--pct').trim() || '0%';
        });
      }
    });
  }, { threshold: 0.2 });
  const s = document.getElementById('skills');
  if (s) obs.observe(s);
}

// ─── Download All ─────────────────────────────────────────────────────────────
function downloadAll() {
  const files = [
    { url: 'pdfs/IHK_Projektdokumentation_Pascal_Masny.pdf',  name: 'IHK_Projektdokumentation.pdf' },
    { url: 'pdfs/Clever_Refill_Präsentatio_Pascal_Masny.pdf', name: 'CleverRefill_Presentation.pdf' },
    { url: 'pdfs/REST_Projektdokumentation_Pasca_Masny.pdf',  name: 'REST_Projektdokumentation.pdf' },
    { url: 'pdfs/4CoreDynamics.pdf',                          name: 'MINTi_Cube_Documentation.pdf' },
  ];
  files.forEach((f, i) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = f.url; a.download = f.name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }, i * 400);
  });
}

// ─── Easter Egg (Konami Code) ─────────────────────────────────────────────────
function initEasterEgg() {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    idx = (e.key === seq[idx]) ? idx + 1 : (e.key === seq[0] ? 1 : 0);
    if (idx === seq.length) { idx = 0; showEasterEgg(); }
  });
}

function showEasterEgg() {
  if (document.getElementById('easter-egg')) return;
  const modal = document.createElement('div');
  modal.id    = 'easter-egg';
  modal.innerHTML = `
    <div class="ee-window">
      <div class="ee-titlebar">
        <span class="ee-dot ee-dot-red"></span>
        <span class="ee-dot ee-dot-yellow"></span>
        <span class="ee-dot ee-dot-green"></span>
        <span class="ee-title">root@pascal:~# cat /etc/classified</span>
      </div>
      <div class="ee-body">
        <p><span class="ee-prompt">root@pascal:~#</span> cat /etc/classified</p><br>
        <p class="ee-comment"># ── STRENG VERTRAULICH ─────────────────────────</p><br>
        <p><span class="ee-key">NAME            </span><span class="ee-val">Pascal Masny</span></p>
        <p><span class="ee-key">ROLE            </span><span class="ee-val">Systems Engineer</span></p>
        <p><span class="ee-key">CLEARANCE       </span><span class="ee-val">HOBBY-HACKER</span></p>
        <p><span class="ee-key">COFFEE_LEVEL    </span><span class="ee-val">████████████ [REDACTED]</span></p>
        <p><span class="ee-key">HIDDEN_TALENT   </span><span class="ee-warn">Certified Arbeitszeitbetrüger™</span></p>
        <p><span class="ee-key">WORK_HOURS      </span><span class="ee-val">42h/week ± 0 <span class="ee-comment"># natürlich</span></span></p>
        <p><span class="ee-key">CURRENT_STATUS  </span><span class="ee-val">"in einem sehr wichtigen Meeting"</span></p>
        <p><span class="ee-key">LAST_SEEN       </span><span class="ee-val">tanzkurs.exe running in bg</span></p>
        <p><span class="ee-key">3D_PRINTER      </span><span class="ee-val">always printing, never asking why</span></p><br>
        <p class="ee-comment"># Disclaimer: Das ist ein Witz. Wahrscheinlich.</p><br>
        <p><span class="ee-prompt">root@pascal:~#</span> <span class="ee-cursor">█</span></p>
      </div>
      <button class="ee-close" onclick="document.getElementById('easter-egg').remove()">[ESC] schließen</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
  }, { once: true });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  applyLang(currentLang);

  document.getElementById('lang-toggle').addEventListener('click',  () => applyLang(currentLang   === 'de' ? 'en' : 'de'));
  document.getElementById('theme-toggle').addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));

  initNavbar();
  initCanvas();
  initScrollAnim();
  initSkillBars();
  startTypewriter();
  initEasterEgg();

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
});
