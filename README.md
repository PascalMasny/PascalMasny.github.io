# Pascal Masny: Portfolio & Blog

Personal portfolio, blog, and document hub, live at **[pascalmasny.github.io](https://pascalmasny.github.io)**.

Static site, no framework, no build step. Everything is plain HTML, CSS, and vanilla JavaScript, served straight from GitHub Pages off the `main` branch.

---

## About

Portfolio and landing page for Pascal Masny: Systems Engineer, Python veteran, and IT consultant from Augsburg, Germany. The site is a single-page portfolio plus a `~/blog` section for posts, a photo gallery, and an in-page PDF viewer for project documents. Fully bilingual (German / English) and theme-aware (dark / light).

---

## Features

| Feature | Details |
|---|---|
| **Bilingual** | German / English toggle, persisted in `localStorage`, shared across all pages |
| **Dark / light theme** | Full theme switch via CSS custom properties, persisted in `localStorage` |
| **Blog** | Markdown posts rendered in the browser, one `.de.md` / `.en.md` per post; a post can embed a PDF |
| **Photo gallery** | Grid with click-to-zoom lightbox |
| **PDF viewer** | In-page PDF.js e-reader: one page at a time, prev/next arrows, page counter, keyboard nav, fullscreen (scrollable) and download |
| **Dynamic stats** | Age and years of experience auto-calculated from birth date and work start date |
| **Particle canvas** | Animated hero background |
| **Typewriter effect** | Rotating role titles, language-aware |
| **Scroll animations** | Fade-in via IntersectionObserver |
| **ZIP download** | Client-side bundling of all PDFs via JSZip |
| **Easter egg** | Konami Code (up up down down left right left right B A) reveals a terminal |
| **SEO** | JSON-LD Person schema, Open Graph, Twitter Card, canonical URL |
| **Digital business card** | Standalone page at `/pages/business_card.html` with vCard download |
| **Mobile-ready** | Every page verified at 375px: no horizontal overflow, touch-sized controls |

---

## Tech Stack

Everything runs client-side. No server, no bundler, no package install.

- Vanilla HTML, CSS, JavaScript
- [marked](https://marked.js.org/) for Markdown to HTML (blog posts)
- [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize rendered Markdown
- [PDF.js](https://mozilla.github.io/pdf.js/) for in-page PDF rendering
- [JSZip](https://stuk.github.io/jszip/) for client-side ZIP bundling of PDFs
- [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- [Simple Icons](https://simpleicons.org/) + [Clearbit Logo API](https://clearbit.com/logo) for skill and company icons (with text fallbacks)

Third-party libraries load from the jsDelivr CDN at runtime. There is nothing to `npm install`.

---

## Project Structure

```
PascalMasny.github.io/
├── index.html                # Main single-page portfolio
├── css/
│   ├── styles.css            # Portfolio styles (theme, all components)
│   ├── blog.css              # Blog hub, post view, photo grid, PDF viewer
│   └── ebiz-styles.css       # Business card page styles
├── js/
│   └── main.js               # Portfolio interactivity (translations, animations, stats)
├── pages/
│   ├── blog.html             # Blog hub: ~/posts, ~/photos, ~/pdfs tabs + PDF viewer
│   ├── post.html             # Single post view (renders Markdown)
│   ├── business_card.html    # Standalone digital business card
│   ├── cv.html, cover_letter.html, pitch.html
├── blog/
│   ├── posts.json            # Index of blog posts (title, date, cover, tags, excerpt)
│   ├── photos.json           # Index of gallery photos
│   ├── pdfs.json             # Index of PDFs shown in the ~/pdfs tab
│   ├── posts/                # <slug>.de.md and <slug>.en.md per post
│   ├── img/                  # Post covers, photos
│   │   └── pdf/              # Auto-generated first-page PDF thumbnails
│   └── README.md             # How to publish posts, photos, and PDFs
├── data/                     # Downloadable vCard
├── img/                      # Profile photo & project screenshots
└── pdfs/                     # CV and project documentation PDFs
```

---

## Blog & document hub

The blog is fully static. No CMS, no build step: you add files, commit, and push. The pages fetch the `.json` indexes and Markdown at runtime and render them in the browser.

**Three tabs at `/pages/blog.html`:**

- `~/posts`: cards linking to `post.html?slug=<slug>`, which fetches `blog/posts/<slug>.<lang>.md` and renders it with marked + DOMPurify. Each post can have a German and an English file; if only one exists, the viewer falls back to it.
- `~/photos`: a grid from `blog/photos.json` with a click-to-zoom lightbox.
- `~/pdfs`: cards from `blog/pdfs.json` with first-page thumbnail covers. Clicking one opens the PDF.js e-reader: one page at a time, fit to view, with ‹ / › arrows (and keyboard ← / →), a page counter, and `open in tab` / `download`.

A post can also **embed a PDF**: add a `"pdf": "pdfs/<file>.pdf"` field to its `posts.json` entry and `post.html` renders an inline e-reader below the text, with prev/next paging, a **fullscreen** button (which switches to a full-width scrollable view) and a **download** button.

Full authoring instructions (add a post, add a photo, add a PDF, generate a thumbnail) live in **[`blog/README.md`](blog/README.md)**.

Quick reference:

```bash
# New post: write the Markdown, then add an entry to blog/posts.json
blog/posts/my-slug.de.md
blog/posts/my-slug.en.md

# New PDF: drop the file in pdfs/, make a thumbnail, add an entry to blog/pdfs.json
pdftoppm -png -f 1 -l 1 -scale-to 640 "pdfs/my-doc.pdf" blog/img/pdf/my-doc
mv blog/img/pdf/my-doc-1.png blog/img/pdf/my-doc.png
```

---

## Design & architecture decisions

Why the site is built the way it is:

- **Static, no build step.** The whole site is hand-written HTML/CSS/JS served by GitHub Pages. No framework, no bundler, no CI. Publishing is `git push`. This keeps the site fast, dependency-free, and trivial to host.
- **Content as data (JSON + Markdown).** Posts, photos, and PDFs are described in small JSON index files, with post bodies in Markdown. Adding content never touches HTML or JS. The pages render the data at runtime.
- **Bilingual by convention.** UI strings live in a `STR` (or `T`) object keyed `de` / `en`; posts use `<slug>.de.md` / `<slug>.en.md`. The chosen language is stored in `localStorage` and shared across every page. Single-language content falls back gracefully.
- **PDF.js e-reader instead of an `<iframe>`.** An `<iframe src="*.pdf">` renders blank in some browsers (notably mobile Safari) and gives no page controls. PDF.js renders one page at a time to a canvas, scaled to fit, so the viewer looks and behaves the same everywhere: prev/next arrows, keyboard paging, a page counter, plus fullscreen (a full-width scrollable view) and download. Only the current page renders, and stale renders are cancelled when you page quickly.
- **First-page thumbnails for PDF cards.** Covers are real first-page previews generated once with `pdftoppm` and committed as static PNGs, rather than a generic file icon.
- **Mobile-first verification.** Every page is checked at a 375px viewport for horizontal overflow and touch-target size. The PDF viewer goes full-bleed on small screens and its controls shrink to fit one line.
- **CDN libraries, not vendored.** marked, DOMPurify, PDF.js, and JSZip load from jsDelivr. If a CDN is ever blocked, the PDF viewer degrades to an `open in tab` / `download` link.
- **No cookies, no tracking, no analytics.**

---

## Dynamic calculations

Age and years of experience are computed at runtime in `js/main.js`:

```js
const birth     = new Date(2004, 4, 28);  // 28 May 2004
const workStart = new Date(2020, 8, 1);   // September 2020 (apprenticeship)
const codeStart = new Date(2015, 0, 1);   // Age 11, roughly 2015
```

Stats update automatically every year, no manual edits needed.

---

## SEO

- `<title>` and `<meta name="description">` with targeted keywords
- JSON-LD `Person` schema for rich results
- Open Graph and Twitter Card tags for social previews
- `<link rel="canonical">` pointing to `https://pascalmasny.github.io/`

---

## Portfolio sections (index.html)

1. **Hero**: name, animated role typewriter, summary, stats, CTA buttons
2. **About**: personal story, tech stack tags, personal interest tags
3. **Services**: Python/Data, CRM/ERP, Engineering & Making
4. **Experience**: timeline with company logos
5. **Projects**: CleverRefill, IHK graduation project, REST API, MINTi Cube, Ars Aut Abeat (PLEB Consulting)
6. **Skills**: categorised skill bars
7. **Education**: THA, BOS, IHK, Berufsschule, Realschule
8. **Certifications & Awards**
9. **Personal**: hobbies
10. **Contact**: email, LinkedIn, digital business card, `~/blog`
11. **Downloads**: CV and all project PDFs (individual + ZIP bundle)

---

## Local development

No build step. The portfolio (`index.html`) opens directly in a browser, but the **blog uses `fetch()`**, which browsers block on `file://`. Run a local server:

```bash
python3 -m http.server 8000
# then open:
#   http://localhost:8000/index.html
#   http://localhost:8000/pages/blog.html
```

If you edit a JSON or Markdown file and do not see the change, hard-refresh (Cmd+Shift+R) to bypass the browser cache.

---

## Deployment

GitHub Pages serves this repository as a user site from the root of the `main` branch. There is no build or deploy step: **commit and push to `main`, and the change is live within about a minute.** Because `main` is the deploy branch, work happens directly on it.

---

## License

Private project. Content and design © Pascal Masny. No cookies, no tracking.
