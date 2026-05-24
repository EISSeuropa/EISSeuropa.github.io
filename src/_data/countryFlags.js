// Country name → ISO 3166-1 alpha-2 code (lowercase).
//
// Used by src/_includes/person-card.njk to pick the right flag SVG
// from src/assets/images/flags/<code>.svg for each board member's
// `country` field.
//
// The lookup is case-insensitive: the template normalises the
// person.country string to lowercase before matching against the
// `byName` map below. Multiple aliases per country let the lookup
// survive operator-typed variations ("USA" / "United States" /
// "U.S.A." all → "us").
//
// When a new country appears on a form submission that isn't in
// this map, the template falls back to rendering a map-pin icon
// plus the raw country text — visible but unstyled. Add the
// missing entry here and download the matching SVG to
// src/assets/images/flags/ (source: HatScripts/circle-flags, MIT).

const ALIASES = {
  // English names
  "france": "fr",
  "germany": "de",
  "netherlands": "nl",
  "the netherlands": "nl",
  "holland": "nl",
  "belgium": "be",
  "italy": "it",
  "spain": "es",
  "austria": "at",
  "switzerland": "ch",
  "poland": "pl",
  "czechia": "cz",
  "czech republic": "cz",
  "greece": "gr",
  "denmark": "dk",
  "sweden": "se",
  "norway": "no",
  "finland": "fi",
  "ireland": "ie",
  "united kingdom": "gb",
  "uk": "gb",
  "u.k.": "gb",
  "great britain": "gb",
  "england": "gb",
  "scotland": "gb",
  "wales": "gb",
  "northern ireland": "gb",
  "united states": "us",
  "united states of america": "us",
  "usa": "us",
  "u.s.": "us",
  "u.s.a.": "us",
  "portugal": "pt",
  "hungary": "hu",
  "serbia": "rs",
  "turkey": "tr",
  "türkiye": "tr",
  "turkiye": "tr",
  "romania": "ro",
  "slovakia": "sk",
  "slovenia": "si",
  "croatia": "hr",
  "bosnia and herzegovina": "ba",
  "bosnia": "ba",
  "estonia": "ee",
  "latvia": "lv",
  "lithuania": "lt",
  "bulgaria": "bg",
  "luxembourg": "lu",
  "malta": "mt",
  "cyprus": "cy",
  "iceland": "is",
};

module.exports = {
  byName: ALIASES,
  // Reverse lookup not currently needed, but exposed in case a future
  // template wants to render the canonical country label from a code
  // (e.g. iso "fr" → "France"). Built once at data-load time.
  canonical: Object.entries(ALIASES).reduce((acc, [name, code]) => {
    if (!acc[code]) {
      // First alias wins as the canonical label, capitalised.
      acc[code] = name
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
    }
    return acc;
  }, {}),
};
