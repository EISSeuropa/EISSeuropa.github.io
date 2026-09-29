/**
 * Directory data for the blog (#1259).
 *
 * Everything a post needs beyond its own words lives here, so publishing is
 * one Markdown file in this directory and no other edit. A post's front
 * matter carries only:
 *
 *   title       the headline
 *   date        YYYY-MM-DD, the publication date. Atom reads this rather
 *               than build time, so a scheduled rebuild does not re-notify
 *               every subscriber.
 *   author      the byline, as the person writes their own name
 *   authorNote  one line of affiliation or standing, e.g. "EISS volunteer,
 *               2027". Deliberately not a profile: volunteers and interns
 *               have no board.json entry and do not need a page.
 *   summary     one or two sentences, shown on /blog.html and in the feed
 *
 * ponytail: a directory data file, not a plugin and not a CMS. Eleventy
 * renders Markdown out of the box, so the blog is a folder.
 */
const fs = require("fs");
const path = require("path");

module.exports = {
  layout: "post.njk",
  tags: "blog",
  navKey: "blog",
  metaImage: "/assets/images/blog-meta.jpg",
  permalink: "/blog/{{ page.fileSlug }}.html",
  eleventyComputed: {
    // base.njk reads `description` for <title>'s meta and the share card.
    // A post authors it once, as `summary`.
    description: (data) => data.summary,
    // A translation is a sibling file, `<slug>.fr.md` / `<slug>.de.md` with
    // `lang` set (#1740). Alternates list only the siblings that exist, so
    // the language switcher never points at a missing page.
    alternates: (data) => {
      const base = data.page.fileSlug.replace(/\.(fr|de)$/, "");
      const out = { en: `/blog/${base}.html` };
      for (const l of ["fr", "de"]) {
        if (fs.existsSync(path.join(__dirname, `${base}.${l}.md`))) out[l] = `/blog/${base}.${l}.html`;
      }
      return out;
    },
  },
};
