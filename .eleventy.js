const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.setQuietMode(true);

  eleventyConfig.addFilter("year", () => new Date().getUTCFullYear());

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

  eleventyConfig.addPassthroughCopy("src/assets");
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
