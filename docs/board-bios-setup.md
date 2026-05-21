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

- **`scripts/board-source.json`** — the Sheet's published-CSV URL, the
  column mapping (which question text maps to which JSON field), and
  the **roles** table (which role labels the Form dropdown offers,
  and where each appears on the page).
- **`scripts/sync-board.py`** — the script. Reads the Sheet, builds
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
| 2 | **Your role** | Dropdown — see roles table below | ✅ |
| 3 | **Year you joined the EISS board / support team (optional)** | Short answer | ⬜ |
| 4 | **Position and institution (e.g. 'Associate Professor — Leiden University')** | Short answer | ✅ |
| 5 | **Research themes (3–5 short phrases, comma-separated)** | Short answer | ⬜ |
| 6 | **Long bio (optional — used for the support-team display style)** | Paragraph | ⬜ |
| 7 | **Headshot photo (optional)** | File upload — image only — max 5 MB | ⬜ |
| 8 | **I consent to publication of my bio on eiss-europa.com** | Checkboxes — single option | ✅ |

**Dropdown options for "Your role"** — must match exactly the `label`
values in `scripts/board-source.json` → `roles` table. Current list:

- Founding Director
- Treasurer
- Secretary-General
- Board Member
- Technology Coordinator
- Events Coordinator
- Communications Coordinator

> **Themes vs long bio.** Board roles get the "Research themes" line
> styled separately from their affiliation. Support-team roles
> (Coordinator titles) get a flowing bio paragraph instead. The script
> picks the right shape from `kind` in the roles table, looked up by
> the role label the member chose.

> **Year joined.** Used only for sort order within the "Board Member"
> tier (longest tenured appears first; missing years sort to the end
> alphabetically). Founding Director / Treasurer / Secretary-General
> are unique titles, so year doesn't affect their position.

In *Settings → Responses*, **enable**:

- ☑ Collect email addresses
- ☑ Allow response editing
- ☑ Limit to 1 response (require Google sign-in — recommended; the
  script uses email to dedupe re-submissions).

## Step 2 · Link the Form to a Sheet

In the Form's *Responses* tab, click the green Sheets icon → *Link to
Sheets* → *Create a new spreadsheet*. Each response will land as a row
in the linked Sheet, with the Form questions as column headers.

## Step 3 · Publish the Sheet as CSV

The workflow reads the Sheet via its *publish to web* CSV URL — no
authentication, just a long unguessable URL.

1. In the Sheet, *File → Share → Publish to web*.
2. **Link** tab:
   - Document picker → *Form Responses 1*.
   - Format → **Comma-separated values (.csv)**.
3. ☑ *Automatically republish when changes are made*.
4. **Publish**, confirm.
5. Copy the URL — it looks like
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

- `csv_url` — the URL from Step 3 (the script reads this).
- `form_url` — the public Form URL (top right of the Form editor →
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
work — fine for ~20 board members.)

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
> The Form URL is shared only with current EISS members — please do
> not forward it without checking with us first.

## Adding or changing a role

The Form dropdown and the script must agree on role labels. To add a
new role (e.g. "Liaison Officer"):

1. Edit the Form's "Your role" dropdown — add the new option.
2. Edit `scripts/board-source.json` → `roles` table — append:
   ```json
   { "label": "Liaison Officer", "kind": "board", "tier": 50 }
   ```
   `tier` controls where on the page the new role appears (lower =
   higher up; 1–3 are the existing leadership tiers, 100 is the
   default for Board Member).
3. Commit, merge, run the workflow.

If a submitter picks a role label that isn't in the table (e.g. you
forgot Step 2), the script falls back to "Board Member" and logs a
warning visible in the PR body.

## Editing or removing a bio

- **Edit the Sheet directly.** The response sheet is just data —
  correct typos, fix affiliations, etc. The next sync picks up your
  edits.
- **Remove a member.** Two steps:
  1. Delete their row in the Sheet (otherwise the next sync will
     re-add them).
  2. Edit `src/_data/board.json` to remove their entry. Open a small
     PR. The sync script never deletes entries by itself — removal is
     always a deliberate, human-reviewed action.

Their old photo file stays in `src/assets/images/board/` until you
delete it manually.

## Exporting / archiving the data

`src/_data/board.json` is the canonical export, version-controlled in
this repo. The Sheet itself is also exportable via *File → Download →
CSV / XLSX*.
