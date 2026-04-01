// ─── Single source of truth for CV & Cover Letter ────────────────────────────
// Edit this file → cv.html and cover_letter.html update automatically.

const CV = {

  // ── Personal ───────────────────────────────────────────────────────────────
  name:     "Pascal Masny",
  birth:    "28.05.2004",
  location: "Augsburg, Deutschland",
  email:    "pascalmasny@pascalmasny.de",
  linkedin: "linkedin.com/in/pascalmasny",
  github:   "github.com/PascalMasny",
  website:  "pascalmasny.github.io",
  phone:    "",

  // ── Dynamic stats ──────────────────────────────────────────────────────────
  get age() {
    const now = new Date(), b = new Date(2004, 4, 28);
    let a = now.getFullYear() - b.getFullYear();
    if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) a--;
    return a;
  },
  get yearsWork() {
    const now = new Date(), s = new Date(2020, 8, 1);
    let y = now.getFullYear() - s.getFullYear();
    if (now < new Date(now.getFullYear(), s.getMonth(), s.getDate())) y--;
    return y;
  },
  get yearsCode() { return new Date().getFullYear() - 2015; },

  // ── Skills ────────────────────────────────────────────────────────────────
  // group: 'prog' | 'data' | 'enterprise'
  skills: [
    // Programmierung
    { de: "Python",          en: "Python",          pct: 82, group: 'prog' },
    { de: "Linux",           en: "Linux",           pct: 95, group: 'prog' },
    { de: "SQL Familie",     en: "SQL Family",      pct: 55, group: 'prog' },
    { de: "C / C++",         en: "C / C++",         pct: 35, group: 'prog' },
    { de: "Web Dev",         en: "Web Dev",         pct: 40, group: 'prog' },
    // Daten & Analyse
    { de: "Pandas & NumPy",  en: "Pandas & NumPy",  pct: 76, group: 'data' },
    { de: "Streamlit",       en: "Streamlit",       pct: 90, group: 'data' },
    { de: "Machine Learning",en: "Machine Learning",pct: 55, group: 'data' },
    { de: "Statistik",       en: "Statistics",      pct: 72, group: 'data' },
    // Enterprise
    { de: "Salesforce",      en: "Salesforce",      pct: 50, group: 'enterprise' },
    { de: "Celonis",         en: "Celonis",         pct: 70, group: 'enterprise' },
    { de: "SAP",             en: "SAP",             pct: 40, group: 'enterprise' },
  ],

  // ── Certifications ────────────────────────────────────────────────────────
  certs: [
    "Salesforce Certified Admin",
    "Cisco CCNA",
    "Celonis Data Scientist",
  ],

  // ── Awards ────────────────────────────────────────────────────────────────
  awards: {
    de: [
      "Schwäbischer Robotik Meister (2018)",
      "ShipIt Gewinner (2021 / 2022)",
      "MINTi Cube; THA & Funkenwerk (2026)",
    ],
    en: [
      "Swabian Robotics Champion (2018)",
      "ShipIt Winner (2021 / 2022)",
      "MINTi Cube; THA & Funkenwerk (2026)",
    ],
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  languages: {
    de: [
      { lang: "Deutsch",  level: "Muttersprache"     },
      { lang: "Englisch", level: "Verhandlungssicher" },
    ],
    en: [
      { lang: "German",  level: "Native"          },
      { lang: "English", level: "Business fluent" },
    ],
  },

  // ── Git-graph timeline events ─────────────────────────────────────────────
  // dateStart / dateEnd: English month abbreviations for JS Date parsing.
  // null dateEnd = ongoing.
  // branch: 'work' | 'edu' | 'social'
  gitEvents: [

    // ── Arbeit ──────────────────────────────────────────────────────────────
    {
      id: 'masyscon',
      branch: 'work',
      dateStart: 'Aug 2025', dateEnd: null,
      role: { de: 'IT-Datenanalyse- & Prozessberater', en: 'IT Data Analysis & Process Consultant' },
      org:  { de: 'masyscon GmbH',                     en: 'masyscon GmbH' },
      desc: { de: 'Salesforce CRM; Python-Tools (Briefr); Prozessoptimierung in schnell skalierendem Unternehmen.',
              en: 'Salesforce CRM; Python tools (Briefr); process optimisation in a fast-scaling company.' },
      tags: ['Salesforce', 'Python', 'Process Consulting'],
    },
    {
      id: 'manroland-ws',
      branch: 'work',
      dateStart: 'Jun 2023', dateEnd: 'Aug 2025',
      role: { de: 'Datenanalyst & Werksstudent',   en: 'Data Analyst & Working Student' },
      org:  { de: 'manroland Goss web systems GmbH', en: 'manroland Goss web systems GmbH' },
      desc: { de: 'Celonis-Prozessanalysen; LLM-Tooling; Einsparungen im sechsstelligen Bereich.',
              en: 'Celonis process analyses; LLM tooling; six-figure cost savings.' },
      tags: ['Python', 'Celonis', 'SAP', 'Process Mining'],
    },
    {
      id: 'manroland-azubi',
      branch: 'work',
      dateStart: 'Sep 2020', dateEnd: 'Jun 2023',
      role: { de: 'Fachinformatiker AE (Azubi)',        en: 'IT Specialist App Dev (Apprentice)' },
      org:  { de: 'manroland Goss web systems GmbH',    en: 'manroland Goss web systems GmbH' },
      desc: { de: 'Python-Datenanalyse, Celonis/SAP-Integration. IHK 1,9 ; Berufsschule 2,1.',
              en: 'Python data analysis, Celonis/SAP integration. IHK grade 1.9 ; vocational 2.1.' },
      tags: ['Python', 'Celonis', 'SAP', 'SQL'],
    },
    {
      id: 'mt-aerospace',
      branch: 'work',
      dateStart: 'Jul 2019', dateEnd: 'Jul 2019',
      role: { de: 'Schülerpraktikum; Zerspanungsmechaniker', en: 'School Internship; Machining' },
      org:  { de: 'MT Aerospace AG',                         en: 'MT Aerospace AG' },
      desc: { de: '', en: '' },
      tags: [],
    },
    {
      id: 'kuka',
      branch: 'work',
      dateStart: 'Jun 2019', dateEnd: 'Jun 2019',
      role: { de: 'Schülerpraktikum; Mechatroniker', en: 'School Internship; Mechatronics' },
      org:  { de: 'KUKA',                            en: 'KUKA' },
      desc: { de: '', en: '' },
      tags: [],
    },

    // ── Ausbildung ───────────────────────────────────────────────────────────
    {
      id: 'tha',
      branch: 'edu',
      dateStart: 'Oct 2025', dateEnd: null,
      role: { de: 'B.Sc. Systems Engineering',    en: 'B.Sc. Systems Engineering' },
      org:  { de: 'Technische Hochschule Augsburg', en: 'Technische Hochschule Augsburg' },
      desc: { de: 'Teilzeitstudium neben Berufstätigkeit.',
              en: 'Part-time alongside full-time employment.' },
      tags: [],
    },
    {
      id: 'bos',
      branch: 'edu',
      dateStart: 'Sep 2023', dateEnd: 'Jun 2025',
      role: { de: 'Fachhochschulreife', en: 'University Entrance Qualification' },
      org:  { de: 'Berufsoberschule Augsburg', en: 'Berufsoberschule Augsburg' },
      desc: { de: 'Abischnitt 2,4; parallel zu Werkstudentenstelle.',
              en: 'Grade 2.4; concurrent with working-student role.' },
      tags: [],
    },
    {
      id: 'ihk-bs7',
      branch: 'edu',
      dateStart: 'Sep 2020', dateEnd: 'Jun 2023',
      role: { de: 'Fachinformatiker Anwendungsentwicklung', en: 'IT Specialist Application Development' },
      org:  { de: 'IHK Akademie Schwaben / BS7', en: 'IHK Akademie Schwaben / BS7' },
      desc: { de: 'IHK 1,9; Berufsschule 2,1; parallel zur Ausbildung.',
              en: 'IHK grade 1.9; vocational 2.1; concurrent with apprenticeship.' },
      tags: [],
    },
    {
      id: 'realschule',
      branch: 'edu',
      dateStart: 'Sep 2014', dateEnd: 'Aug 2020',
      role: { de: 'Mittlerer Schulabschluss',        en: 'Secondary School Certificate' },
      org:  { de: 'Maria-Ward-Realschule Augsburg',  en: 'Maria-Ward-Realschule Augsburg' },
      desc: { de: 'Naturwissenschaftlicher Zweig.', en: 'Science stream.' },
      tags: [],
    },

    // ── Soziales ────────────────────────────────────────────────────────────
    {
      id: 'ehren-hiwi',
      branch: 'social',
      dateStart: 'Oct 2025', dateEnd: null,
      role: { de: 'Ehren HiWi', en: 'Volunteer Student Assistant' },
      org:  { de: 'Technische Hochschule Augsburg', en: 'Technische Hochschule Augsburg' },
      desc: { de: 'Ehrenamtliche Hilfskraft in Lehrveranstaltungen; Betreuung und Unterstützung von Kommilitonen.',
              en: 'Volunteer teaching assistant; mentoring and supporting fellow students.' },
      tags: [],
    },
    {
      id: 'fablab',
      branch: 'social',
      dateStart: 'Oct 2025', dateEnd: null,
      role: { de: 'FabLab Freiwilliger; 3D-Druck', en: 'FabLab Volunteer; 3D Printing' },
      org:  { de: 'THA FabLab (Fabrication Laboratory)', en: 'THA FabLab (Fabrication Laboratory)' },
      desc: { de: 'Betrieb und Wartung der 3D-Drucker; Einführung und Support für Studierende; Weiterentwicklung des Labor-Betriebs.',
              en: 'Operating and maintaining 3D printers; onboarding and supporting students; developing lab operations.' },
      tags: ['FDM', 'SLA', '3D-Druck'],
    },
    {
      id: 'schuelersp',
      branch: 'social',
      dateStart: 'Sep 2023', dateEnd: 'Jun 2025',
      role: { de: 'Schülersprecher', en: 'Student Body President' },
      org:  { de: 'Berufsoberschule Augsburg', en: 'Berufsoberschule Augsburg' },
      desc: { de: 'Gewählter Schülersprecher; Schulveranstaltungen und Feiern organisiert; Schüler mit Problemen aktiv unterstützt; Kaffeemaschine in jedem Klassenzimmer durchgesetzt.',
              en: 'Elected student representative; organised school events and parties; actively supported students with personal and academic issues; successfully campaigned for a coffee machine in every classroom.' },
      tags: [],
    },
    {
      id: 'church',
      branch: 'social',
      dateStart: 'Jan 2018', dateEnd: 'Dec 2022',
      role: { de: 'Kirchliches Engagement', en: 'Community & Church Activities' },
      org:  { de: 'Augsburg', en: 'Augsburg' },
      desc: { de: 'Über 10 Jahre aktives Mitglied; zunächst Ministrant, später Oberministrant. Jugendbildungsarbeit zu Moral, Ethik und einem modernen Kirchenverständnis; aktiv für mehr Offenheit gegenüber LGBTQ und anderen Religionen eingesetzt.',
              en: 'Over 10 years as an active member; starting as altar server, later head altar server. Youth education on morality, ethics and a modern understanding of faith; actively advocated for greater openness towards LGBTQ people and other religions.' },
      tags: [],
    },
  ],

  // ── Connections between concurrent events ─────────────────────────────────
  // These draw Bézier curves in the SVG overlay.
  gitConnections: [
    { from: 'manroland-azubi', to: 'ihk-bs7'   },  // Ausbildung + Berufsschule Sep 2020
    { from: 'manroland-ws',    to: 'bos'        },  // Werkstudent + BOS Sep 2023
    { from: 'bos',             to: 'schuelersp' },  // BOS + Schülersprecher Sep 2023
    { from: 'masyscon',        to: 'tha'        },  // masyscon Aug 2025 + THA Oct 2025
    { from: 'tha',             to: 'ehren-hiwi' },  // THA + HiWi Oct 2025
    { from: 'tha',             to: 'fablab'     },  // THA + FabLab Oct 2025
  ],

  // ── UI Translations ───────────────────────────────────────────────────────
  T: {
    de: {
      cvTitle:     "Angehender Systems Engineer",
      subtitle:    "IT-Berater; Python-Veteran; Datenanalyst",
      profile:     (d) => `Mit ${d.yearsCode} Jahren Programmiererfahrung und ${d.yearsWork} Jahren Industrie-Praxis bringe ich echtes, selbst erarbeitetes Wissen mit; kein AI-Slop. Python-Veteran, Systemdenker und Hobby-Hacker aus Augsburg. Aktuell studiere ich Systems Engineering (B.Sc.) an der THA; parallel zu meiner Tätigkeit als IT-Berater, dem Ehrenamt als HiWi und meinem Engagement im FabLab.`,
      contact:     "Kontakt",
      skills:      "Fähigkeiten",
      languages:   "Sprachen",
      certs:       "Zertifikate",
      profile_h:   "Profil",
      gitTitle:    "Werdegang",
      awards:      "Auszeichnungen",
      born:        "Geb.",
      filterAll:   "Alle",
      filterWork:  "Beruf",
      filterEdu:   "Ausbildung",
      filterSocial:"Soziales",
      branchWork:   "Beruf",
      branchEdu:    "Ausbildung",
      branchSocial: "Soziales",
      ongoing:     "heute",
      printBtn:    "Drucken / Als PDF speichern",
      langBtn:     "English",
      backLink:    "<- Portfolio",
      skillGroups: { prog: 'Programmierung', data: 'Daten & Analyse', enterprise: 'Enterprise' },
    },
    en: {
      cvTitle:     "Future Systems Engineer",
      subtitle:    "IT Consultant; Python Veteran; Data Analyst",
      profile:     (d) => `With ${d.yearsCode} years of programming experience and ${d.yearsWork} years in industry, I bring genuine self-built expertise; no AI slop. Python veteran, systems thinker and hobby hacker from Augsburg. Currently studying B.Sc. Systems Engineering at THA alongside my role as IT Consultant, volunteering as a student assistant, and supporting the FabLab.`,
      contact:     "Contact",
      skills:      "Skills",
      languages:   "Languages",
      certs:       "Certifications",
      profile_h:   "Profile",
      gitTitle:    "Career",
      awards:      "Awards",
      born:        "Born",
      filterAll:   "All",
      filterWork:  "Work",
      filterEdu:   "Education",
      filterSocial:"Social",
      branchWork:   "Work",
      branchEdu:    "Education",
      branchSocial: "Social",
      ongoing:     "present",
      printBtn:    "Print / Save as PDF",
      langBtn:     "Deutsch",
      backLink:    "<- Portfolio",
      skillGroups: { prog: 'Programming', data: 'Data & Analytics', enterprise: 'Enterprise' },
    },
  },
};
