# Welcome to my blog

This site has an ancestor. My very first task as an apprentice at manroland Goss was to host a personal website internally, so that every apprentice had one. My trainer insisted back then that networking and presenting are as much part of the job as the code itself. At seventeen I found that moderately convincing. These days I see the point, and this is the same idea, just grown up.

## What ends up here

- **Projects:** what I am currently building and what was actually hard about it. Not the polished version, but the part where it got stuck.
- **Thoughts:** on software development, tools, and why some systems feel right and others do not.
- **Photos:** in the `~/photos` tab, for no deeper reason.

Everything exists in German and English. The toggle is in the top right.

## How this is built

No CMS, no build step, no framework. Every post is a Markdown file, fetched on load and rendered in the browser. GitHub Pages serves the whole thing. Publishing means: create two files, add one entry to a JSON file, commit.

That is a deliberate choice, not laziness. A blog that needs `npm install` before you can fix a typo is a blog you eventually stop maintaining. Dependencies rot, build tools change their config, and after a two-year gap you spend an evening repairing your own toolchain instead of writing. Text files do not do that. This should still work in ten years.

> Write, commit, done.

Have a look around.
