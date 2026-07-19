# Blog — how to publish

The blog is fully static. No build step, no CMS. To publish you add files and
commit. GitHub Pages serves them; the pages fetch the `.json`/`.md` at runtime.

Folder layout:

```
blog/
  posts.json          # index of all posts (newest shown first)
  photos.json         # index of all gallery photos
  posts/              # one .de.md and .en.md per post
  img/                # cover images + photos
```

Image paths in the JSON are written **from the site root** (e.g. `blog/img/x.jpg`
or, for reusing existing site images, `img/x.png`). The pages resolve them.

---

## Add a new post

1. Drop a cover image in `blog/img/`, e.g. `blog/img/my-post.jpg`.
2. Write two Markdown files in `blog/posts/`:
   - `blog/posts/my-slug.de.md`
   - `blog/posts/my-slug.en.md`
   (If you only write one language, the viewer falls back to the other.)
3. Add **one entry** to the top of `blog/posts.json`:

   ```json
   {
     "slug": "my-slug",
     "date": "2026-06-20",
     "cover": "blog/img/my-post.jpg",
     "tags": ["python", "side-project"],
     "title":   { "de": "Mein Titel", "en": "My title" },
     "excerpt": { "de": "Kurzbeschreibung.", "en": "Short summary." }
   }
   ```

   `slug` must match the `.md` filenames. Keep the JSON valid (commas!).
4. Commit + push. Done.

Markdown supports headings, lists, links, images, blockquotes and code blocks.
Inline images: `![alt](../blog/img/screenshot.jpg)` (path is relative to `/pages/`).

---

## Add a photo

1. Drop the image in `blog/img/`.
2. Add **one entry** to `blog/photos.json`:

   ```json
   {
     "src": "blog/img/sunset.jpg",
     "date": "2026-06-18",
     "tags": ["travel"],
     "caption": { "de": "Sonnenuntergang", "en": "Sunset" }
   }
   ```
3. Commit + push.

---

## Test locally

`fetch()` of local files needs a server (not `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000/pages/blog.html
```
