# personalwebsite

Sayon Ramanan's personal site, built with [Astro](https://astro.build).

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs static files to dist/
```

## Where things live

| To change…                                  | Edit                                   |
| ------------------------------------------- | -------------------------------------- |
| Roles, projects, links, listening section   | `src/data/site.ts`                     |
| Blog posts                                  | `src/content/blog/*.md`                |
| Colors, fonts, spacing (whole site)         | `src/styles/global.css` (`:root`)      |
| Nav, footer, board edge                     | `src/components/`                      |
| Home / experience / projects / blog layout  | `src/pages/`                           |
| Résumé PDF, album covers, images            | `public/` (e.g. `public/resume.pdf`)   |

Anything in `[BRACKETS]` is a placeholder.

### Writing a post

Add a Markdown file to `src/content/blog/`:

```md
---
title: "What tiling actually buys you in Flash Attention"
summary: "One line shown on the blog list."
date: 2026-11-10
draft: false
---

Post body in Markdown…
```

It appears at `/blog/<file-name>`. Posts with `draft: true` are hidden.

## Deploy

Easiest: import the repo on [Vercel](https://vercel.com/new). It detects Astro automatically,
with no config needed, and redeploys on every push. Once you have a domain, set `site` in
`astro.config.mjs`.
