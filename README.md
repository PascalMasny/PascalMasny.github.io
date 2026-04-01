# Pascal Masny — Portfolio

Personal portfolio & professional landing page, live at **[pascalmasny.github.io](https://pascalmasny.github.io)**.

---

## About

Static single-page portfolio for Pascal Masny — Systems Engineer, Python Veteran and IT Consultant from Augsburg, Germany. The site doubles as a digital business card and document hub.

---

## Features

| Feature | Details |
|---|---|
| **Bilingual** | German / English toggle with localStorage persistence |
| **Dark / Light theme** | Full theme switch via CSS custom properties |
| **Dynamic stats** | Age and years of experience auto-calculated from birth date & work start date |
| **Particle canvas** | Animated background in the hero section |
| **Typewriter effect** | Rotating role titles, language-aware |
| **Scroll animations** | Fade-in via Intersection Observer |
| **Skill bars** | Animate on scroll |
| **ZIP download** | Client-side bundling of all PDFs via JSZip |
| **Easter egg** | Konami Code (↑↑↓↓←→←→BA) reveals a classified terminal |
| **SEO** | JSON-LD Person schema, Open Graph, Twitter Card, canonical URL |
| **Digital business card** | Standalone page at `/pages/business_card.html` with vCard download |

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript — no framework, no build step
- [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- [JSZip](https://stuk.github.io/jszip/) for client-side ZIP generation
- [Devicons](https://devicon.dev/) + [Simple Icons](https://simpleicons.org/) CDN for skill icons
- [Clearbit Logo API](https://clearbit.com/logo) for company logos (with fallback initials)

---

## Project Structure

```
PascalMasny.github.io/
├── index.html              # Main single-page portfolio
├── css/
│   ├── styles.css          # Main stylesheet (dark/light theme, all components)
│   └── ebiz-styles.css     # Business card page styles
├── js/
│   └── main.js             # All interactivity (translations, animations, stats)
├── pages/
│   └── business_card.html  # Standalone digital business card
├── data/
│   └── Pascal_Masny.vcf    # Downloadable vCard contact file
├── img/                    # Profile photo & project screenshots
└── pdfs/                   # CV and project documentation PDFs
```

---

## Dynamic Calculations

Age and years of experience are computed at runtime in `js/main.js`:

```js
const birth    = new Date(2004, 4, 28);  // 28 May 2004
const workStart = new Date(2020, 8, 1); // September 2020 (apprenticeship)
const codeStart = new Date(2015, 0, 1); // Age 11 ≈ 2015
```

Stats update automatically every year — no manual edits needed.

---

## SEO

- `<title>` and `<meta name="description">` with targeted keywords
- JSON-LD `Person` schema for rich results
- Open Graph tags for social sharing previews
- Twitter Card support
- `<link rel="canonical">` pointing to `https://pascalmasny.github.io/`

---

## Sections

1. **Hero** — name, animated role typewriter, summary, stats, CTA buttons
2. **About** — personal story, tech stack tags, personal interest tags
3. **Services** — Python/Data, CRM/ERP, Engineering & Making
4. **Experience** — timeline with company logos (masyscon, manroland Goss)
5. **Projects** — CleverRefill, IHK Graduation Project, REST API
6. **Skills** — categorised skill bars (programming, data science, tools, enterprise, engineering, OS)
7. **Education** — THA, BOS, IHK, Berufsschule, Realschule
8. **Certifications & Awards** — Salesforce Admin, Cisco CCNA, Celonis; robotics champion, ShipIt winner
9. **Personal** — hobbies: dancing, 3D printing, botany, cooking, hobby hacking
10. **Contact** — email, LinkedIn, digital business card
11. **Downloads** — CV and all project PDFs (individual + ZIP bundle)

---

## Local Development

No build step required — open `index.html` directly in a browser, or serve it:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

---

## License

Private project. Content and design © Pascal Masny. No cookies, no tracking.
