# Kavya Shree G N — Portfolio

A dark, scroll-driven developer portfolio inspired by a scroll-scrubbed hero animation, built with plain HTML, CSS, and JavaScript (no build step required).

## Folder structure

```
kavya-portfolio/
├── index.html        # Page structure and content
├── css/
│   └── style.css      # All styling, layout, and responsive rules
├── js/
│   └── script.js       # Scroll-scrub hero, scroll reveals, live contact preview
├── assets/            # Put any images (e.g. a headshot) here
└── README.md
```

## Running it

No build tools needed — just open `index.html` in a browser, or serve it locally:

```bash
# Option 1: just double-click index.html

# Option 2: serve it (recommended, avoids any local file restrictions)
npx serve .
# or
python3 -m http.server 5500
```

Then visit `http://localhost:5500` (or whichever port is printed).

## Editing content

- **Text & sections** — edit directly in `index.html`.
- **Colors, fonts, spacing** — all defined as CSS variables at the top of `css/style.css` (the `:root` block).
- **Hero cycling text** — edit the `states` array at the top of `js/script.js`.
- **Photo** — drop an image into `assets/` and swap the `<img src="...">` in the About section of `index.html`.

## Deploying

This is fully static, so it deploys as-is to:
- **GitHub Pages** — push this folder to a repo, enable Pages on the `main` branch.
- **Netlify / Vercel** — drag-and-drop the folder or connect the repo.
