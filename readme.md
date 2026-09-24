# Kavya Shree G N — Portfolio

A dark, cinematic, scroll-driven developer portfolio built with plain HTML, CSS and JavaScript — no build step, no dependencies. Open `index.html` in a browser or publish it with GitHub Pages.

## Animations

- **Preloader** — letters rise in with a 0 → 100 loading counter, then a curtain wipe reveals the page
- **Scroll-scrubbed hero** — the hero stays pinned while you scroll through four headlines (letter-by-letter 3D flip), with a camera move on the portrait, light flashes between states, a mouse-following spotlight, scrambled mono captions and a segmented "scroll to scrub" timeline
- **3D profile card** — rotates flat as the About section scrolls in and tilts toward the mouse, with a glossy highlight
- **Skills marquee** — three rows of pills on a tilted plane scroll in alternating directions and speed up as you scroll
- **Root map cards** — staggered rise-in, 3D mouse tilt, glow halos and a cursor spotlight
- **Horizontal projects** — scrolling down moves the project cards sideways, with a progress bar and counter
- **Section titles** — word-by-word masked reveal; blur/fade-in reveals throughout
- **Contact** — a huge outlined "CONTACT" word slides past in parallax, with a live JSON payload preview and floating-label form (sends via `mailto:`)
- **Footer** — a giant "KAVYA" wordmark rises in letter by letter
- **Extras** — custom cursor, magnetic buttons, sliding nav indicator, scroll progress bar, film grain, and a nav that hides on scroll down
- Respects `prefers-reduced-motion`; responsive down to phone widths

## Structure

```
├── index.html          # Page structure and content
├── style.css           # Styling, animations, responsive rules
├── script.js           # Scroll/animation engine and contact form
└── assets/
    ├── kavya.jpg            # Hero portrait (optimised)
    ├── kavya-card.jpg       # Profile card photo (optimised)
    ├── kavya-original.png   # Original photo
    └── Kavya-Resume.pdf     # Downloadable CV
```
