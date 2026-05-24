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
};
