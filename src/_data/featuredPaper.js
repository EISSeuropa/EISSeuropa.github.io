// Homepage "featured paper" slot (#1711): one Anthology paper a day, drawn
// from the papers that have an abstract and a page of their own. The pick
// is made from the build date, so the daily scheduled rebuild turns it over
// with no client-side JS. The pool is in slug order, so year order. The
// stride is the pool size over the golden ratio, nudged until it is coprime
// with the size: that walks every paper before repeating and puts
// consecutive days far apart in the list, so in different editions.
const { papers } = require("./paperIndex.js");

const pool = papers
  .filter((p) => p.hasPage && p.abstract)
  .sort((a, b) => a.slug.localeCompare(b.slug));

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
let stride = Math.max(1, Math.round(pool.length * 0.618));
while (pool.length > 1 && gcd(stride, pool.length) !== 1) stride++;

const day = Math.floor(Date.now() / 86400000);

module.exports = {
  paper: pool.length ? pool[(day * stride) % pool.length] : null,
};

// ponytail: one runnable check. `node src/_data/featuredPaper.js` asserts a
// full cycle visits every paper exactly once.
if (require.main === module) {
  const seen = new Set(pool.map((_, i) => ((day + i) * stride) % pool.length));
  if (seen.size !== pool.length) throw new Error(`cycle covers ${seen.size} of ${pool.length}`);
  console.log(`ok: stride ${stride} covers all ${pool.length} papers; next week:`,
    [...Array(7)].map((_, i) => pool[((day + i) * stride) % pool.length].year).join(" "));
}
