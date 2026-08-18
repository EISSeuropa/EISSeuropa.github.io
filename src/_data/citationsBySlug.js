// Global data alias so `citations` is available to Nunjucks templates (#1254).
// citations.js exports builder functions rather than data, because paperPages.js
// needs the functions; Eleventy's data cascade wants a value. This thin file is
// the bridge.
const { bySlug } = require("./citations.js");

module.exports = bySlug();
