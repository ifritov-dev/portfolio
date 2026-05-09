# AGENTS.md

## Project Overview

Simple static portfolio website with Three.js animated background. No build system, no package manager, no dependencies to install.

**Stack:** Vanilla HTML/CSS/JS + Three.js (CDN)

## Structure

```
/
├── index.html    # Single-page portfolio
├── style.css     # All styles
├── script.js     # Three.js bubbles + Lanyard API integration
└── .gitignore
```

## Running Locally

Open `index.html` directly in a browser. No dev server required.

For live reload during development:
```bash
python -m http.server 8000
# or
npx serve
```

## Key Implementation Details

### Three.js Background
- Animated deforming bubble spheres (script.js:23-113)
- Uses CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- Canvas ID: `bubbles-canvas`
- 15 bubbles with vertex deformation, point lights, and boundary wrapping

### Discord Integration
- Uses Lanyard API to fetch Discord avatar (script.js:138-195)
- User ID: `940165136440766464`
- 1-minute cache to avoid rate limits
- Fallback: hides avatar on API failure

### Scroll Behavior
- Full-page scroll snapping (`scroll-snap-type: y mandatory`)
- IntersectionObserver tracks active section (script.js:217-253)
- Dot navigation on right side with smooth scroll
- Scroll indicator hides after leaving hero section
- "That's it! :)" message appears on contact section

### Sections
1. `#hero` - Name, title, Discord avatar
2. `#projects` - 3-column grid of project cards
3. `#skills` - 3-column grid of skill categories
4. `#contact` - Social links (GitHub, Discord, Email)

## Styling Notes

- Monospace font: `'Courier Prime'` from Google Fonts
- Gold accent color: `#FFD700`
- Dark theme with radial gradient background
- Glassmorphism cards: `backdrop-filter: blur(20px)`
- Responsive breakpoints: 1024px (2 columns), 768px (1 column)

## Common Tasks

**Update content:** Edit `index.html` directly. All content is inline.

**Change colors:** Search/replace `#FFD700` in `style.css` for accent color.

**Modify bubbles:** Adjust `bubbleCount` (script.js:20) or bubble size range (script.js:26).

**Change Discord user:** Update `DISCORD_USER_ID` (script.js:139).

**Add new section:** 
1. Add section with class `section` and unique ID in `index.html`
2. Add corresponding dot in `.dots-navigation` with matching `data-section`
3. IntersectionObserver will automatically track it

## Constraints

- No build step means no TypeScript, JSX, or preprocessors
- Three.js version locked to r128 (CDN)
- Lanyard API has rate limits (hence 1-minute cache)
- Scroll snap can be janky on some browsers/trackpads
- Avatar loading depends on external API availability

## Deployment

Static site. Deploy anywhere:
- GitHub Pages
- Netlify/Vercel (drag & drop)
- Any static host

No build command needed.
