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
  eleventyConfig.addShortcode("inlineSvg", (relPath) =>
    fs.readFileSync(path.join("src", relPath), "utf-8")
  );

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
