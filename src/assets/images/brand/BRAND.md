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
| `logo-mark.svg` | Constellation only — mobile header, favicon source, Schema.org `logo` URL fallback | ~2 KB |
| `logo-lockup.svg` | Constellation + EiSS wordmark, no tagline — desktop site header | ~4 KB |
| `logo-full.svg` | Constellation + EiSS + tagline — `/initiative` page hero, press kit, OG card watermark | ~19 KB |
| `logo-full-1024.png` | High-res raster — Schema.org `logo` URL (Google Knowledge Panel), OG card overlays | ~63 KB |
| `logo-lockup-512.png` | Header raster fallback for any context that can't use SVG | ~17 KB |

## Colours

Sampled from the source PDF:

- **`#73caff`** — network blue (the constellation dots + connecting lines)
- **`#007bc6`** — brand blue (EiSS wordmark + tagline)

The site's `--accent` design token is currently `hsl(216 88% 40%)`
≈ `#0c70cf` — close to but not identical to the brand `#007bc6`.
PR B (chrome swap) should align the token to the canonical brand
colour so logo + UI accents read as one system.

## Recolouring via CSS

The SVG files use:
- `fill="currentColor"` + `class="logo-text"` on the wordmark/tagline paths
- `fill="#73caff"` + `class="logo-network"` on the constellation paths

So the parent stylesheet can recolour each surface without forking the
asset:

```css
/* default — brand blue on light backgrounds */
.brand-logo { color: var(--brand-blue, #007bc6); }

/* footer — invert against the dark background */
.site-footer .brand-logo { color: white; }
.site-footer .brand-logo .logo-network { fill: rgba(255, 255, 255, 0.7); }
```

`currentColor` is universally supported (every SVG renderer; doesn't
require CSS-variable-in-attribute support, which some image
optimisers strip).

## Accessibility

Each SVG carries `<title>` + `<desc>` and a `role="img"`, so when used
standalone (no link wrapping it) screen readers announce the brand
name. When used inside an `<a>` that already carries the brand name
in `aria-label`, add `aria-hidden="true"` on the SVG to avoid double
announcement (the convention used by the existing `nav.njk` markup).

## What's NOT in this directory

- The original AI / PDF / TIF source files (large, off-repo)
- Favicon / PWA icons (live at `src/assets/{favicon,apple-touch-icon,
  android-chrome-*,manifest.webmanifest}` — regenerated in PR B from
  `logo-mark.svg`)
- The grey / black / negative-white print variants (CMYK / single-ink
  versions for partner kits; live in the source bundle, not needed
  for web)
