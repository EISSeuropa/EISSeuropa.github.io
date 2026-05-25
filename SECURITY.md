# Security Policy

This repository hosts the public website of the **European Initiative
for Security Studies (EISS)**, served at <https://eiss-europa.com>.
It is a static [GitHub Pages](https://pages.github.com/) site built
from Eleventy 3 + Nunjucks templates, with two scheduled Python sync
jobs (board bios from a Google Form, Indico event data from the EISS
Indico instance) and a daily rebuild cron. We take its security
seriously and welcome reports.

## Scope

| In scope                                                              | Out of scope                                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| The current `master` branch of this repository                        | Older branches, tags, or forks                                                            |
| The deployed site at <https://eiss-europa.com> and `*.github.io` URL  | Third-party services we rely on, please report to them directly                           |
| The GitHub Actions workflows in `.github/workflows/`                  | Reports about EISS branding, visual identity, or funding statements                       |
| The Python sync scripts in `scripts/`                                 | Theoretical issues that depend on a compromised contributor account or repo write access  |
| `src/_data/board.json` and any personal data therein                  | Volumetric DoS against GitHub, Google Forms, or the Indico instance                       |

Third-party services in our stack. Report vulnerabilities affecting
them to the relevant vendor rather than to us:

- **GitHub** (hosting, Pages, Actions): <https://github.com/security>
- **Google** (Forms + Sheets used for the board-bios pipeline): <https://www.google.com/about/appsecurity/>
- **Indico** (event metadata API at the EISS conference platform): contact the Indico instance administrator
- **FlagCDN** (passive CDN asset for country flags)

## Reporting a vulnerability

**Please do not open a public GitHub issue or pull request.** Two
private channels are available:

1. **GitHub Security Advisories** (preferred):
   <https://github.com/EISSeuropa/EISSeuropa.github.io/security/advisories/new>.
   This is encrypted, lets us collaborate on a fix in a private fork,
   and gives you a CVE if appropriate.
2. **Email** Dr Arthur Laudrain (site maintainer, board member CH).
   For data-protection matters specifically, contact the Data
   Controller (the European Initiative for Security Studies) at
   <contact@eiss-europa.com>, per §1 of the
   [Privacy Notice](https://eiss-europa.com/policy.html).

When reporting, please include:

- a description of the issue and its impact;
- the URL or file path where you observed it;
- the steps needed to reproduce it (a minimal proof-of-concept is
  ideal, but not required);
- any suggested remediation, if you have one.

## What to expect from us

- **Acknowledgement**: within **5 working days** of your report.
- **Initial assessment**: within **14 working days**. We will tell
  you whether we accept the finding, need more information, or
  consider it out of scope, and we will share an indicative timeline.
- **Resolution**:
  - *Critical* (data exposure, account takeover, XSS with credential
    leakage): patch in days, hotfix deployed via a PR to `master`.
  - *High / Medium*: patch in the next sprint of work, typically two
    to four weeks.
  - *Low / informational*: rolled into routine maintenance.
- **Disclosure**: coordinated. We will not publicly discuss the
  vulnerability until a fix is deployed. We are happy to credit you
  in the resolving PR and in the GitHub Security Advisory unless you
  prefer to remain anonymous.

## Safe harbour

If you make a good-faith effort to comply with this policy when
researching and reporting an issue, we will:

- not pursue or support any legal action against you;
- work with you to understand and resolve the issue quickly;
- recognise your contribution publicly if you wish.

Good-faith research means: only acting against your own data and the
public website, avoiding privacy violations and service disruption,
not retaining personal data of others, and giving us reasonable time
to fix the issue before any public disclosure.

## What we do on our side

A short list of the security hygiene we maintain on this repository:

- **Dependencies**: Python dependencies in `scripts/requirements.txt`
  are pinned with version bounds and monitored by GitHub Dependabot.
  Node dependencies (Eleventy core) are likewise pinned in
  `package.json` and monitored.
- **Secrets**: no production credentials live in the repo. The Google
  Forms / Sheets pipeline uses **public** published-to-web CSV URLs
  and a public Forms URL. The Indico sync uses a Personal Access
  Token stored as a GitHub Actions secret, scoped to read-only access
  on the conference instance.
- **GitHub Actions**: third-party actions are pinned by full commit
  SHA where reasonable, and Action permissions follow the principle
  of least privilege (the default workflow token is read-only; jobs
  that need to commit declare `contents: write` at the job level).
- **Personal data**: handled per the
  [Privacy Notice](https://eiss-europa.com/policy.html). Submitters
  can ask for changes or removal at any time via
  <contact@eiss-europa.com>, and we maintain a soft PR-review
  workflow before any new bio appears on the public site.
- **No tracking, no analytics**: the site loads no inline analytics,
  no advertising, and no third-party tracking pixels. External
  passive assets are limited to FlagCDN; see `policy.html` for the
  full list.

Thank you for helping keep EISS safe.
