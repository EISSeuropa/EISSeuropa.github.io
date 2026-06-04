# EISS brand assets

Web-ready logo variants for use across the site chrome. Derived from
the canonical brand bundle (`logo-EISS-base/` — kept off-repo because
it ships large AI / TIF / PDF files; the operator holds the source).

Re-run `scripts/derive-logo-variants.py` to regenerate these files
from the source PDF if the brand kit changes (the script needs only
`pip install pymupdf` — no system dependencies).

## Variants

| File | Use | Size |
|---|---|---|
| `logo-mark.svg` | Constellation only — mobile header, favicon source | ~2 KB |
| `logo-lockup.svg` | Constellation + EiSS wordmark, no tagline — desktop site header | ~4 KB |
| `logo-full.svg` | Constellation + EiSS + tagline — `/initiative` page hero, press kit, OG card watermark | ~19 KB |
| `logo-full-1024.png` | High-res raster — Schema.org `logo` URL (Google Knowledge Panel), OG card overlays | ~63 KB |
| `logo-lockup-512.png` | Header raster fallback for any context that can't use SVG | ~17 KB |

## Colours

Sampled from the source PDF:

- **`#73caff`** — network blue (the constellation dots + connecting lines)
- **`#007bc6`** — brand blue (EiSS wordmark + tagline)

The site's `--accent` design token is the brand blue: light mode is
`hsl(203 100% 39%)` (= `#007bc6`, hue 203), so the logo and the UI
accents read as one blue. Dark mode lifts the lightness to
`hsl(203 100% 66%)` for contrast on the dark canvas, and the print
stylesheet darkens it to `hsl(203 100% 38%)` for ink, both keeping the
brand hue. The whole blue family in `site.css` sits on hue 203; the
non-accent blue-greys (borders, tinted surfaces) share the hue at lower
saturation. This alignment landed via
[#512](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/512);
the earlier indigo `hsl(216 88% 50%)` is gone.

**Semantic / status colours** sit outside this two-blue identity palette
on purpose: amber warnings and the "deferred" / "under watch" pill, a
broadcast-red "live" dot, a "shipped" green, the categorical room-pill
hues on the programme grid, and the EU-flag gold (`#f5b800`) in the 404
illustration. These are functional signal colours, not brand colours,
and are expected to differ from `#007bc6` / `#73caff`.

## Recolouring via CSS

The SVG files use:
- `fill="currentColor"` + `class="logo-text"` on the wordmark/tagline paths
- `fill="#73caff"` + `class="logo-network"` on the constellation paths

So the parent stylesheet can recolour each surface without forking the
asset:

```css
/* default — brand blue on light backgrounds */
.brand-logo { color: var(--brand-blue, #007bc6); }

/* footer — illustrative only. The current footer sits on a light
   surface and keeps the default brand blue. If the footer ever moves to
   a dark background, invert like this: */
.site-footer .brand-logo { color: white; }
.site-footer .brand-logo .logo-network { fill: rgba(255, 255, 255, 0.7); }
```

`currentColor` is universally supported (every SVG renderer; doesn't
require CSS-variable-in-attribute support, which some image
optimisers strip).

## Typography

**Inter** is the sole brand typeface, self-hosted from
`src/assets/fonts/inter/` (variable `woff2`, Latin + Latin-Extended).
It is applied through the `--font-sans` / `--font-display` and `--fs-*`
CSS tokens, with the system sans-serif stack as the fallback. No other
display or body font is used, and no web font is loaded from a third
party. The public press kit (`/press-kit`) names Inter as a brand
element, so the two stay in step.

## Accessibility

Each SVG carries `<title>` + `<desc>` and a `role="img"`, so when used
standalone (no link wrapping it) screen readers announce the brand
name. When used inside an `<a>` that already carries the brand name
in `aria-label`, add `aria-hidden="true"` on the SVG to avoid double
announcement (the convention used by the existing `nav.njk` markup).

## What's NOT in this directory

- The original AI / PDF / TIF source files (large, off-repo)
- Favicon / PWA icons (live at `src/assets/{favicon,apple-touch-icon,
  android-chrome-*,manifest.webmanifest}`) — a purpose-built, hand-
  maintained small-size simplification of the constellation, not
  auto-derived from `logo-mark.svg`
- The grey / black / negative-white print variants (CMYK / single-ink
  versions for partner kits; live in the source bundle, not needed
  for web)
