/**
 * The design tokens, parsed from the stylesheet that defines them (#1269).
 *
 * `site.css`'s `:root` block is the single source of truth for the design
 * language. This reads it at build time and groups the tokens by family, so
 * the documented table and the style guide page both render from the same
 * place the browser does.
 *
 * An Eleventy _data module rather than a committed generated file, on purpose:
 * it runs on every build, so it cannot drift, and there is no artefact anyone
 * can forget to regenerate. Add a token to `site.css` and it appears in both
 * consumers with no other edit.
 *
 * ponytail: a regex over the `:root` block, not a CSS parser. The block is
 * hand-maintained, one declaration per line, and the build would fail loudly
 * if it stopped matching. A real parser would be a dependency (rule §16.3) to
 * handle syntax this file does not contain.
 */

const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const CSS = join(__dirname, "..", "assets", "css", "site.css");

// Families whose values are colours, so consumers know to draw a swatch
// rather than print the value. `--gradient-*` is a colour too, but it renders
// as a band, so it is called out separately.
const COLOUR_FAMILIES = new Set([
  "accent",
  "text",
  "surface",
  "bg",
  "border",
  "brand",
  "warning",
  "success",
  "danger",
]);

// Human labels for the family keys. A family with no entry falls back to its
// own key, which is why an unrecognised new family degrades rather than breaks.
const FAMILY_LABELS = {
  font: "Typefaces",
  fs: "Type scale",
  lh: "Line heights",
  tracking: "Letter spacing",
  space: "Spacing scale",
  radius: "Corner radii",
  shadow: "Shadows",
  accent: "Accent colours",
  text: "Text colours",
  surface: "Surfaces",
  bg: "Backgrounds",
  border: "Borders",
  gradient: "Gradients",
  motion: "Motion",
  ease: "Easing curves",
  nav: "Navigation chrome",
  content: "Layout widths",
  prose: "Layout widths",
  blur: "Backdrop blur",
  saturate: "Backdrop saturation",
  warning: "Status colours",
  hero: "Hero treatment",
};

function parseRoot(css) {
  // The first `:root {` block only. Later `:root[data-theme=…]` overrides are
  // the same token names at different values; documenting them again would
  // just duplicate every row.
  const start = css.indexOf(":root {");
  if (start === -1) throw new Error("designTokens: no `:root {` block in site.css");
  const end = css.indexOf("\n}", start);
  if (end === -1) throw new Error("designTokens: unterminated `:root` block in site.css");
  return css.slice(start, end);
}

module.exports = function designTokens() {
  const block = parseRoot(readFileSync(CSS, "utf8"));
  const lines = block.split("\n");

  const tokens = [];
  let pendingComment = null;

  for (const raw of lines) {
    const line = raw.trim();

    // A comment on its own line documents the declaration(s) that follow.
    const wholeLine = line.match(/^\/\*\s*(.*?)\s*\*\/$/);
    if (wholeLine) {
      pendingComment = wholeLine[1];
      continue;
    }
    if (line.startsWith("/*") || line.startsWith("*")) {
      // Opening or middle of a multi-line comment: keep the first line's text
      // and ignore the rest rather than reflowing prose we did not write.
      if (line.startsWith("/*")) pendingComment = line.replace(/^\/\*+\s*/, "").trim() || null;
      continue;
    }
    if (line === "" ) { pendingComment = null; continue; }

    const decl = line.match(/^(--[a-z0-9-]+)\s*:\s*(.+?);\s*(?:\/\*\s*(.*?)\s*\*\/)?$/i);
    if (!decl) continue;

    const [, name, value, trailingComment] = decl;
    const family = name.slice(2).split("-")[0];

    tokens.push({
      name,
      value: value.trim(),
      family,
      note: trailingComment || pendingComment || null,
      isColour: COLOUR_FAMILIES.has(family) || /^(#|rgb|hsl|color-mix|oklch)/i.test(value),
      isGradient: family === "gradient" || /gradient\(/i.test(value),
    });
    pendingComment = null;
  }

  // Group, preserving the order families first appear in the stylesheet: that
  // order is itself editorial (type before colour before motion) and worth
  // keeping rather than sorting alphabetically.
  const groups = [];
  const byFamily = new Map();
  for (const t of tokens) {
    if (!byFamily.has(t.family)) {
      const group = { family: t.family, label: FAMILY_LABELS[t.family] || t.family, tokens: [] };
      byFamily.set(t.family, group);
      groups.push(group);
    }
    byFamily.get(t.family).tokens.push(t);
  }

  return { tokens, groups, count: tokens.length, familyCount: groups.length, source: "src/assets/css/site.css" };
};
