# Author corrections and abstracts

Issue [#1863](https://github.com/EISSeuropa/EISSeuropa.github.io/issues/1863) prepares the author-facing route for the tenth-anniversary campaign. The proposed channel is a prefilled email to `site.contactEmail`. Arthur Laudrain reviews the channel choice and the visible copy before this ships.

## Channel choice for review

| Route | Benefits | Limitations |
|---|---|---|
| Prefilled email | Uses the existing contact workflow, requires no GitHub account, keeps correspondence out of public issues | Requires an email handler. Readers can instead copy the displayed contact address and include the title, year and reference manually. Inbox triage remains manual. |
| GitHub issue form | Structured fields and a visible triage history | Requires a GitHub account. Public submissions can disclose personal details or unpublished text. A form would need explicit guidance about that exposure. |

Email is the proposed default, not an approved campaign policy. The link opens a draft only. It does not send a message, ingest an abstract or publish a correction. No personal contact details are requested in the prefilled body.

## Where the route appears

The shared `paper-feedback.njk` macro appears on every by-paper index record in English, French and German, including the lazy-loaded fragments, and on existing English paper pages. The draft includes the paper title, year, stable corpus slug and a link to the index record. The visible contact address provides a manual fallback. Each link has an accessible name containing the action and paper title.

Title-only records have no landing page unless they already carry an abstract, publication link, DOI or prize. They keep that rule. The correction route does not create thin paper pages.

The invitation to supply an abstract requires both `abstractEligible` and an absent abstract. Eligibility comes from the existing corpus rules, including session subtype, poster detection and editions whose abstracts are unavailable. It is not inferred again in the templates. Ineligible records can still receive corrections, without suggesting that an abstract is missing. Existing abstracts can be corrected through the same route.

## Review and data preservation

Suggestions require human review and verification before a separate data change is proposed. The existing Indico sync and curated data remain unchanged. `scripts/sync-abstracts.mjs` overwrites `paperAbstracts.json`, so accepted manual additions must use the existing curated `paperAbstractsManual.json` path and title/year normalisation after checking the correct record and eligibility. The contact route never writes either file.

## Coverage and campaign boundaries

Run `node scripts/export-corpus-json.mjs` to regenerate the ignored local export and `node scripts/check-abstract-coverage.mjs` to inspect stranded entries. Count abstracts only among records with `abstractEligible`, using the deduplicated paper index. The stranded-entry script measures attachment of stored abstracts, not the proportion of eligible papers with abstracts.

The corpus note records a dated archival snapshot. This implementation does not update its figures, the Zenodo deposit or HAL. Any later public coverage figure needs a fresh export and a denominator check. The March 2027 outreach and the post-campaign newsletter count remain separate work under #1863. No outreach or submission collection runs here.

## Validation

After `npm run build`, run `python3 scripts/test-paper-feedback.py`. It checks every indexed record across the three locales and every existing paper page, plus synthetic encoding and eligibility cases. The Build sanity workflow runs it after the build. Translation key parity, static accessibility, internal links and the browser accessibility pass remain the standard companion checks. Before merging, the maintainer should review the channel choice and the deploy preview at desktop and phone widths. FR/DE copy in this change is machine translated.
