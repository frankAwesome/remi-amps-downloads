# REMI Amps — landing site

A single-page, framework-free marketing site for **REMI Amps — Over the Edge**.
Pure HTML + CSS + vanilla JS, leaning hard into scroll-driven motion.

## Run locally

It's static — open `index.html`, or serve the folder:

```bash
npx serve website -l 4321
# → http://localhost:4321
```

## Structure

```
website/
├─ index.html          # all markup, one page
├─ css/style.css       # design system + every animation
├─ js/main.js          # one rAF scroll loop drives all scroll motion
├─ assets/
│  ├─ fonts/           # the EXACT app fonts (Yellowtail + Oswald + DSEG7)
│  └─ img/             # app icon + the 6 real plugin screenshots
└─ downloads/          # drop release binaries here (see downloads/README.txt)
```

## Brand

The logo lockup is rebuilt in live text using the app's own fonts:
chrome-gradient **Remi** (Yellowtail) over an amber SVG swash, with letter-spaced
**DE KLERK** (Oswald) beneath — identical to the in-app wordmark.

## Notable interactions

- Scroll-progress bar + condensing glass nav
- Mouse-following cursor glow, magnetic buttons, 3D tilt on screenshots
- Reveal-on-scroll with stagger (IntersectionObserver)
- Pinned **amp** section whose MODE chips advance with scroll
- Pinned **pedalboard** that pans horizontally as you scroll vertically
- Count-up stats, animated aurora background + film grain

All motion is disabled under `prefers-reduced-motion`.

## Going live

Update the download `href`s in `index.html` (or fill `downloads/`), then deploy
the `website/` folder to any static host (GitHub Pages, Netlify, Cloudflare Pages…).
