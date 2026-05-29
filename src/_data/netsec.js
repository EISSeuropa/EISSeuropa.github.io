// Lightweight data file for NetSec headline stats displayed on
// /initiative. Source of truth: https://netsec-cost.eu/ — bump these
// numbers when the Management Committee composition changes (typically
// at COST Action review milestones). Keep as a single small file
// rather than scraping the NetSec site, which would add a network
// dependency to the build.
//
// `partnerInstitutions` is the count of formal partner institutions
// stated at Action launch (the "twelve partner institutions" line in
// the page prose). `managementCommittee.members` and `.countries` are
// the live MC headcount + the number of distinct represented
// countries — these grow over the Action's lifetime as more countries
// nominate MC representatives.

module.exports = {
  partnerInstitutions: 12,
  managementCommittee: {
    members: 49,
    countries: 30,
  },
  // Display-only; reminds future maintainers the numbers above are a
  // snapshot, not an automated count.
  asOfDate: "2026-05-25",

  // EISS board / team members who also hold a NetSec leadership role.
  // NetSec is the COST Action EISS co-founded, and nearly all of its
  // leadership sits on the EISS board — the dual-affiliation story the
  // /initiative NetSec section tells. Roles are a snapshot sourced from
  // netsec-cost.eu/about.html (bump alongside the stats above).
  // `name` must match the board.json entry (boardSorted.js joins them to
  // the board photo by an accent- and apostrophe-folded first+last key).
  // Order is leadership-first: Chair, Vice-Chair, WG leads, WG co-leads,
  // then the coordinator roles.
  leadership: [
    { name: "Moritz Weiss", netsecRole: "Action Chair · WG1 Lead" },
    { name: "Marie Robin", netsecRole: "Action Vice-Chair" },
    { name: "John Helferich", netsecRole: "WG2 Lead" },
    { name: "Chiara Ruffa", netsecRole: "WG3 Lead" },
    { name: "Revecca Pedi", netsecRole: "WG4 Lead" },
    { name: "Filip Ejdus", netsecRole: "WG1 Co-lead" },
    { name: "Alisa Kerschbaum", netsecRole: "WG2 Co-lead" },
    { name: "Silvia D'Amato", netsecRole: "WG3 Co-lead" },
    { name: "Šárka Kolmašová", netsecRole: "WG4 Co-lead" },
    { name: "Eliza Gheorghe", netsecRole: "Grant Awarding Coordinator" },
    { name: "Chiara Libiseller", netsecRole: "Grant Awarding Co-lead" },
    { name: "Eugenio Sánchez", netsecRole: "Science Communication Coordinator" },
  ],
};
