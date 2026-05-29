# Setting up the board-bios Google Form

This guide walks through creating the Google Form, linking it to a Sheet,
and wiring the published Sheet into the manual sync workflow.
**One-time setup, ~30 minutes.** After this, board updates are:

1. A board / support-team member submits or updates their bio via the Form.
2. You go to Actions → *Sync board bios from Google Form* → *Run
   workflow*.
3. A PR appears. You review the diff (one file, `src/_data/board.json`)
   and click Merge.

## How the pipeline works

```
Google Form ──► Google Sheet ──► sync-board.yml (manual) ──► PR ──► review + merge ──► /board.html
```

Two repo-side moving parts:

- **`scripts/board-source.json`**: the Sheet's published-CSV URL, the
  column mapping (which question text maps to which JSON field), and
  the **roles** table (which role labels the Form dropdown offers,
  and where each appears on the page).
- **`scripts/sync-board.py`**: the script. Reads the Sheet, builds
  `src/_data/board.json`, opens a PR. No-ops cleanly while `csv_url`
  is empty.

There is no allowlist. The Form URL is private (shared with board
members directly), and every workflow run produces a PR that you
review before it lands. If something unexpected comes through, you
just don't merge.

## Step 1 · Create the Form

1. Go to <https://forms.google.com> and create a new blank form.
2. Title it **Update your EISS bio**. Suggested description:
   > For EISS board and support-team members. Submit (or re-submit)
   > your bio for the public page at
   > <https://eiss-europa.com/board.html>. Takes ~5 minutes. You can
   > edit your response later via the link in your confirmation email.
3. Add these questions, **in this order, with the exact text below**.
   If you rename a question, mirror the change in
   `scripts/board-source.json` (`columns` map).

| # | Question text | Type | Required? |
|---|---|---|---|
| 1 | **Full name (with title — Dr / Prof / Mr / Ms)** | Short answer | ✅ |
| 2 | **What is your role at EISS?** | Dropdown — see *Q2 options* below | ✅ |
| 3 | **Do you have functional responsibilities?** | Dropdown — see *Q3 options* below | ⬜ |
| 4 | **Position or current role (e.g. PhD candidate, Associate Professor, Policy analyst)** | Short answer | ✅ |
| 5 | **Institution or organisation** | Short answer | ✅ |
| 6 | **Country** | Short answer | ✅ |
| 7 | **Public email (optional)** | Short answer | ⬜ |
| 8 | **Short bio (max. 300 words)** | Paragraph | ✅ |
| 9 | **Research keywords (comma-separated, 3 to 5 suggested)** | Short answer | ⬜ |
| 10 | **Working Group involvement (tick all that apply)** | Checkboxes | ⬜ |
| 11 | **Personal or institutional website (optional)** | Short answer | ⬜ |
| 12 | **ORCID iD (optional)** | Short answer | ⬜ |
| 13 | **LinkedIn URL (optional)** | Short answer | ⬜ |
| 14 | **X / Twitter URL (optional)** | Short answer | ⬜ |
| 15 | **Bluesky URL (optional)** | Short answer | ⬜ |
| 16 | **Mastodon URL (optional)** | Short answer | ⬜ |
| 17 | **Headshot photo (optional)** | File upload — image only — max 5 MB | ⬜ |
| 18 | **Internship end date (optional)** | Date | ⬜ |
| 19 | **I consent to publication of my bio on eiss-europa.com** | Checkboxes — single option | ✅ |

**Q2 options**, which must match exactly the `label` values in
`scripts/board-source.json` → `roles` table:

- *(None — leave blank)* → falls through to *Board Member* (tier 100)
- Founding Director
- Treasurer
- Secretary-General
- Support Staff

**Q3 options**, which must match values in `scripts/board-source.json` →
`functional_responsibilities` list. A member can hold a Functional
Responsibility independently of their formal role (Arthur is both a
Board Member AND the Technology Coordinator):

- *(None — leave blank)*
- Technology Coordinator
- Events Coordinator
- Communications Coordinator

> **Role vs Functional Responsibility.** *Role* drives which section
> the card lands in (Leadership / Board Members / Support Staff) and
> the sort order within it. *Functional Responsibility* is rendered
> as a quiet pill alongside the role on the card. It is purely
> descriptive, not used for sorting or grouping.

In *Settings → Responses*, set:

- **Collect email addresses → Verified**
  This requires Google sign-in (the verified address auto-fills
  from the signed-in account, and the sync uses it to dedupe).
- ☑ **Allow response editing**: members can tweak non-photo
  fields via the confirmation-email link.
- ☐ **Limit to 1 response**: leave **unchecked**. Multiple
  submissions per signed-in account are intentional: the sync's
  email-based dedup keeps the latest by timestamp, and members
  resubmit the form when they need to replace their photo (see
  the *Photo replacement workflow* note in Step 5 below).

### Disclaimer to add to the Form

Google Forms doesn't let a respondent replace a file upload when
they edit a previous response. They see the old file and have no
way to remove it (see the *Known limitations* in this repo's issue
tracker for the long version). Set the **Form description** (top
of the form) to include:

> *Want to update your photo?* Google Forms does not let you replace
> a file upload when editing an existing response. Submit a fresh
> response (using this same form URL, not the edit link from your
> confirmation email) and the sync will overwrite your old entry
> with the new one. For non-photo updates, the edit link works fine.

And on the **Headshot photo (optional)** question, set its
**Description** to:

> Already submitted once and want to change your photo? Don't edit.
> Submit a fresh response. The file-upload field is locked by
> Google Forms after the first submission.

### End-date question — interns

Q18 (**Internship end date (optional)**, Date) is scoped to interns,
the only category of EISS contributor where automatic time-based
expiry on `/board` makes sense. Board Members and Leadership have
elected terms of ~3 years, but they typically re-up and shouldn't
vanish into the past-members footer during a re-election gap. Their
ins and outs are tracked through election minutes by hand-editing
`board.json` directly. Permanent Support Staff (e.g. the
Communications Coordinator) likewise leave this field blank.

Set the question **Description** to:

> For interns only. Leave blank if your EISS role is open-ended
> (Board Member, Leadership, permanent Support Staff). If you're an
> intern, fill in the date your internship ends. Your card will
> stay on the board for ~1 week after this date, then move to a
> folded *"Past board members and interns"* footer. You remain part
> of the broader European security studies family.

The sync writes whatever the respondent picks straight through to
`board.json` as `roleEndDate` (ISO `YYYY-MM-DD`). The internal field
key stays generic so we can also hand-set it on a former Board
Member's entry when election minutes record a departure.
`src/_data/boardSorted.js` applies a 7-day grace at build time and
moves expired entries into `pastMembers` for the folded footer on
`/board`. The daily-rebuild workflow re-evaluates this with each
build, so the transition is automatic. Empty / unparseable values
leave the entry permanent, with no silent surprises.

## Step 2 · Link the Form to a Sheet

In the Form's *Responses* tab, click the green Sheets icon → *Link to
Sheets* → *Create a new spreadsheet*. Each response will land as a row
in the linked Sheet, with the Form questions as column headers.

## Step 3 · Publish the Sheet as CSV

The workflow reads the Sheet via its *publish to web* CSV URL: no
authentication, just a long unguessable URL.

1. In the Sheet, *File → Share → Publish to web*.
2. **Link** tab:
   - Document picker → *Form Responses 1*.
   - Format → **Comma-separated values (.csv)**.
3. ☑ *Automatically republish when changes are made*.
4. **Publish**, confirm.
5. Copy the URL. It looks like
   `https://docs.google.com/spreadsheets/d/e/<id>/pub?gid=<gid>&single=true&output=csv`.

## Step 4 · Wire the URLs into the repo

Open `scripts/board-source.json` and fill in:

```json
{
  "sheet": {
    "csv_url": "https://docs.google.com/spreadsheets/d/e/.../pub?gid=...&single=true&output=csv"
  },
  "form_url": "https://forms.google.com/...",
  ...
}
```

- `csv_url`: the URL from Step 3 (the script reads this).
- `form_url`: the public Form URL (top right of the Form editor →
  *Send → 🔗 Link*).

If the columns in your Sheet are spelled slightly differently from
the values in `columns` (e.g. your Google account's locale renamed
*Timestamp* to *Horodateur*), update `columns` to match the exact
header text in the Sheet.

Commit. The workflow will pick it up on the next manual run.

## Step 5 · Photo permissions — the one Google quirk

Files uploaded via Google Forms land in a private Drive folder. For
the sync script to download them, they need to be readable without
auth.

In Google Drive, find the Form's auto-created folder (under
*My Drive → Update your EISS bio (File responses)*). Right-click →
*Share* → set general access to **Anyone with the link → Viewer**.
This inherits to every file uploaded later.

(If you'd rather control sharing per file, do the same right-click →
*Share* dance on each upload as submissions arrive. More secure, more
work, fine for ~20 board members.)

### Photo replacement workflow

Google Forms locks the file-upload field once a response has been
submitted. Editing the response shows the old file but offers no
way to remove it. To replace a photo, the respondent has two paths:

**Standard path: submit a fresh response.** Because we leave
"Limit to 1 response" unchecked (see Step 1), members can submit
the form again with a fresh file upload. The sync's email-based
dedup keeps the most recent submission per email, so the new entry
overwrites the old. The old response stays in the spreadsheet (and
the old file stays in the Drive folder), but the rendered card
reflects the latest submission. Operator action: none. The daily
sync workflow handles it.

**Emergency hatch: `photoOverride`.** For the rare case where a
respondent can't use the form (lost access, technical issue, urgent
swap), the operator can hand-set the photo:

1. The respondent emails you the new photo.
2. You add the file to `src/assets/images/board/`. Any filename works,
   ideally something stable like `firstname-lastname-2026.jpg`.
3. Open `src/_data/board.json`, find the person's entry, and add:
   ```json
   "photoOverride": "/assets/images/board/firstname-lastname-2026.jpg"
   ```
4. Commit + push. The card immediately picks up the new photo.

The sync script preserves `photoOverride` across runs. It's never
overwritten by what's in the Form. To revert to the Form's photo
again, delete the `photoOverride` line.

### Cleaning up old photo files in Drive

Each fresh submission uploads a new file to the Form's response
folder, and the old ones stick around. At ~22 board members with
photo updates every year or two, that's negligible bloat. Purge
manually once a year if it bothers you. Look at the modified date
on each file and delete anything that isn't the latest per
respondent.

## Step 6 · Test the workflow

After Step 4, trigger the workflow manually:

1. *Actions → Sync board bios from Google Form → Run workflow*.
2. Wait ~30 s.
3. If the Sheet has at least one submission, a PR opens on
   `board-sync/auto`. If it doesn't, the run is a clean no-op.

## Step 7 · Share the Form with the board

Send the Form URL to board + support-team members directly. Sample:

> Subject: Update your EISS bio
>
> Dear colleague,
>
> We've automated the maintenance of <https://eiss-europa.com/board.html>.
> If you'd like to update your photo, affiliation, role, or research
> themes, please fill in this short form (~5 minutes):
>
>   <https://forms.google.com/your-form-url>
>
> Submissions go into a private Google Sheet that we sync to the
> website on demand. You can edit your response any time using the
> link in your confirmation email.
>
> The Form URL is shared only with current EISS members. Please do
> not forward it without checking with us first.

## Adding or changing a role

The Form dropdown and the script must agree on role labels. To add a
new role (e.g. "Liaison Officer"):

1. Edit the Form's "Your role" dropdown to add the new option.
2. Edit `scripts/board-source.json` → `roles` table and append:
   ```json
   { "label": "Liaison Officer", "kind": "board", "tier": 50 }
   ```
   `tier` controls where on the page the new role appears (lower =
   higher up). Tiers 1–3 are the existing leadership tiers, 100 is the
   default for Board Member.
3. Commit, merge, run the workflow.

If a submitter picks a role label that isn't in the table (e.g. you
forgot Step 2), the script falls back to "Board Member" and logs a
warning visible in the PR body.

## Editing or removing a bio

- **Edit the Sheet directly.** The response sheet is just data:
  correct typos, fix affiliations, etc. The next sync picks up your
  edits.
- **Remove a member.** Two steps:
  1. Delete their row in the Sheet (otherwise the next sync will
     re-add them).
  2. Edit `src/_data/board.json` to remove their entry. Open a small
     PR. The sync script never deletes entries by itself. Removal is
     always a deliberate, human-reviewed action.

Their old photo file stays in `src/assets/images/board/` until you
delete it manually.

## Exporting / archiving the data

`src/_data/board.json` is the canonical export, version-controlled in
this repo. The Sheet itself is also exportable via *File → Download →
CSV / XLSX*.
