const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = function (eleventyConfig) {
  eleventyConfig.setQuietMode(true);

  eleventyConfig.addFilter("year", () => new Date().getUTCFullYear());

  // {{ '/assets/css/site.css' | bust }} -> '/assets/css/site.css?v=ab12cd34'
  // Cache-busts CSS/JS by appending the first 8 hex of the file's
  // SHA-256, so a returning visitor never renders new HTML against a
  // stale cached asset (GitHub Pages serves assets with max-age=600).
  // Computed from the src/ source at build time, so it can never go
  // stale: change the file, the hash changes, the URL changes. No
  // stamping script or CI gate needed (unlike a no-build site). A
  // missing file falls back to the bare URL rather than breaking.
  // {{ '2026-06-11' | daysUntil }} -> whole days from today (build wall
  // clock, UTC) to the given ISO date. Used by the conference countdown
  // for its no-JS / pre-hydration fallback; the client script recomputes
  // live so the number stays correct between daily rebuilds.
  eleventyConfig.addFilter("daysUntil", (iso) => {
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    const target = new Date(String(iso) + "T00:00:00Z");
    return Math.round((target - today) / 86400000);
  });

  // Format an ISO date (YYYY-MM-DD) as a long localised date for the News
  // surface — "12 June 2026" / "12 juin 2026" / "12. Juni 2026". Falls back
  // to the raw string if the date can't be parsed.
  eleventyConfig.addFilter("newsDate", (iso, lang) => {
    const d = new Date(String(iso).slice(0, 10) + "T00:00:00Z");
    if (isNaN(d.getTime())) return iso;
    const loc = { en: "en-GB", fr: "fr-FR", de: "de-DE" }[lang || "en"] || "en-GB";
    return new Intl.DateTimeFormat(loc, {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    }).format(d);
  });

  eleventyConfig.addFilter("bust", (url) => {
    try {
      const rel = String(url).replace(/^\//, "").split("?")[0];
      const buf = fs.readFileSync(path.join(__dirname, "src", rel));
      const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
      return `${url}?v=${hash}`;
    } catch (_) {
      return url;
    }
  });

  // {% inlineSvg "assets/images/brand/logo-lockup.svg" %} — reads a
  // file from src/ at build time and dumps the bytes verbatim into
  // the template. Used by nav.njk + footer.njk + /initiative to inline
  // the brand-mark SVGs so they pick up cascading `color:` (needed
  // for currentColor recolouring across light/dark/footer surfaces).
  // Path is relative to src/. Errors are intentionally thrown — a
  // missing brand asset should fail the build loudly, not silently
  // emit empty markup that ships to production.
  //
  // The id rewrite: the brand SVGs carry internal ids (<title id="t-…">
  // referenced by aria-labelledby), and the same file is inlined more
  // than once per page (nav + footer + page content), so verbatim bytes
  // produce duplicate ids in the DOM (flagged by scripts/a11y_lint.py).
  // Each inclusion gets a unique "-iN" suffix on every id and on the
  // same-file references to it (aria-labelledby tokens, #fragment hrefs,
  // url(#…) paint refs).
  let inlineSvgCount = 0;
  eleventyConfig.addShortcode("inlineSvg", (relPath) => {
    let svg = fs.readFileSync(path.join("src", relPath), "utf-8");
    const n = ++inlineSvgCount;
    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    for (const id of new Set(ids)) {
      const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      svg = svg.replace(
        new RegExp(`(?<=["#\\s(])${esc}(?=["\\s)])`, "g"),
        `${id}-i${n}`
      );
    }
    return svg;
  });

  // {{ "/2025.html" | localizedHref(lang) }} — given an internal
  // page href + a target locale, return the localised URL if a
  // translated source file actually exists, otherwise return the
  // original (English) href unchanged. Pre-empts the link-rot
  // pattern (#162) where the footer and a few inline links used
  // to unconditionally rewrite `/foo.html` to `/foo.fr.html` on
  // every FR page, producing dead links to pages that have not
  // been translated yet.
  //
  // Resolution: check both `src/<slug>.<lang>.njk` and the legacy
  // `src/<slug>.<lang>.html` for the existence of a localised
  // source. Cheap (one stat) and runs at build time, so the cost
  // is paid once per page-render rather than per visitor.
  //
  // Pass-throughs (returned unchanged):
  //   - lang === "en"        (no swap needed)
  //   - external URLs        (http:// or https:// or //)
  //   - non-html targets     (PDFs, assets, mailto:, tel:)
  //   - anchor-only          (starts with "#")
  //   - missing href         (empty string or null)
  eleventyConfig.addFilter("localizedHref", (href, lang) => {
    if (!href || typeof href !== "string") return href;
    if (lang === "en") return href;
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return href;
    }
    if (!href.endsWith(".html")) return href;
    // Strip query and fragment for the source lookup, but reattach
    // them on the localised return so deep links keep working.
    const [pathPart, ...rest] = href.split(/([?#])/);
    const tail = rest.join("");
    const slug = pathPart.replace(/^\//, "").replace(/\.html$/, "");
    if (!slug) return href; // bare "/" stays as-is
    const localizedSource = path.join("src", `${slug}.${lang}.njk`);
    const localizedHtml = path.join("src", `${slug}.${lang}.html`);
    if (fs.existsSync(localizedSource) || fs.existsSync(localizedHtml)) {
      return `/${slug}.${lang}.html${tail}`;
    }
    return href; // localised version doesn't exist; fall back to EN
  });

  // {{ links.website | extLink }} -> a guaranteed-absolute external URL.
  // Profile links on the board cards render straight into `href`, so a
  // value stored without a scheme (a bare domain like "example.com", or
  // a bare ORCID iD like "0000-0001-9311-6480") would resolve as a path
  // on eiss-europa.com and 404. This filter normalises:
  //   - already-absolute (http://, https://, //) -> unchanged
  //   - bare ORCID iD (NNNN-NNNN-NNNN-NNNC)        -> https://orcid.org/<id>
  //   - anything else                              -> "https://" + value
  // It is a defensive backstop: sync-board.py normalises the same way at
  // the source, and check-build-sanity.mjs fails the build on a
  // scheme-less links value, so in practice this only ever fires on a
  // hand-edit to board.json that slipped past both. Idempotent.
  const ORCID_ID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  eleventyConfig.addFilter("extLink", (value) => {
    if (!value || typeof value !== "string") return value;
    const v = value.trim();
    if (
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("//")
    ) {
      return v;
    }
    if (ORCID_ID_RE.test(v)) return `https://orcid.org/${v}`;
    return `https://${v}`;
  });

  // Deterministic per-paper anchor slug (#676 / #738). The SINGLE source of
  // truth for both the `id="paper-…"` emitted on the /YYYY programme grids
  // (archive-programme.njk) and the `#paper-…` fragment the Anthology by-paper
  // and by-person views append to their conference link. Because both sides run
  // the same filter on the same (original-language) title, the anchor and the
  // deep link always agree, and the slug is locale-stable. Two papers that share
  // a title in one edition collapse to one anchor — acceptable, the link still
  // resolves to that slot. Returns the slug WITHOUT the `paper-` prefix; callers
  // add it. Mirrors corpus.js's kebab so it reads consistently.
  eleventyConfig.addFilter("paperAnchor", (title) =>
    String(title || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/, ""),
  );

  eleventyConfig.addPassthroughCopy("src/assets");
  // Runtime-fetched data files live under src/data/ (NOT src/_data/,
  // which is Eleventy's build-time data cascade and never lands in
  // the build output). The What's New banner JS in theme.js fetches
  // /data/whats-new.json at page load, so the file needs to be copied
  // verbatim to _site/data/.
  eleventyConfig.addPassthroughCopy({ "src/data": "data" });
  eleventyConfig.addPassthroughCopy({ "src/.well-known": "/.well-known" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
