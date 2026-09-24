# Kavya Shree G N — Portfolio

A dark, cinematic, scroll-driven developer portfolio built with plain HTML, CSS and JavaScript — no build step, no dependencies. Open `index.html` in a browser or publish it with GitHub Pages.

## Animations

- **Preloader** — "INITIALIZING SYSTEM" screen with name, role and a 0 → 100% counter, then a warm light flash into the hero
- **Studio-lit hero** — portrait on a bright backdrop with dark vignette; the hero stays pinned while scrolling scrubs a timeline through three headlines that blur in and out, with a scrambled caption, light flashes and a moving studio light
- **Head-turn video (optional)** — add a short clip of yourself turning (e.g. `assets/hero-turn.mp4`) and set `data-turn-video="assets/hero-turn.mp4"` on `#hero` in `index.html`; scrolling will then scrub through the clip frame by frame
- **About** — straight device-style photo card with a soft glowing square rotating behind it
- **Skills** — two rows of glowing pills sliding in opposite directions, faster while scrolling
- **Projects** — vertical scroll moves the cards sideways; the centred card is highlighted with a rotating glow square
- **Contact** — glass "live dispatch" card with a rotating glow square, live JSON preview and a drifting giant CONTACT word
- **Footer** — giant KAVYA wordmark
- Smooth eased scrolling on desktop; respects `prefers-reduced-motion`; responsive down to phone widths

## Structure

```
├── index.html          # Page structure and content
├── style.css           # Styling, animations, responsive rules
├── script.js           # Scroll/animation engine and contact form
└── assets/
    ├── kavya-cutout.webp    # Hero portrait with background removed
    ├── kavya-card.jpg       # Profile card photo (studio backdrop)
    ├── kavya.jpg            # Optimised original photo
    ├── kavya-original.png   # Original photo
    └── Kavya-Resume.pdf     # Downloadable CV
```
