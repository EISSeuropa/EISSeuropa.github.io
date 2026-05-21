# Setting up the board-bios Google Form

This guide walks through creating the Google Form, linking it to a Sheet,
and wiring the published Sheet into the manual sync workflow.
**One-time setup, ~30 minutes.** After this, board updates are:

1. A board member submits or updates their bio via the Form.
2. You go to Actions → *Sync board bios from Google Form* → *Run
   workflow*.
3. A PR appears. You review it (one diff, your board.json) and click
   Merge.

## How the pipeline works

```
Google Form ──► Google Sheet ──► sync-board.yml (manual) ──► PR ──► merge ──► /board.html
```

Three repo-side moving parts:

- **`scripts/board-source.json`** — the Sheet's published-CSV URL +
  column mapping (which question text maps to which JSON field).
- **`scripts/board-roles.json`** — the **roster**: who is on the board,
  their organisational role (`Founding Director`, `Treasurer`, …), and
  their position in the display order. *You* maintain this — members
  cannot change their own title via the Form.
- **`scripts/sync-board.py`** — the script that ties them together.
  No-ops cleanly while `csv_url` is empty.

The Form is **invitation-only**: any submission whose email isn't in
`board-roles.json` is dropped with a log line. So even if the Form URL
leaks, random Google users can't add themselves to the board page.

## Step 0 · Fill in the roster

Before doing any of the Google steps, edit `scripts/board-roles.json`
and replace each placeholder `FILL_IN@invalid.eiss-europa.com` with the
real Google-account email of that board / support-team member. The
script gates every submission on this list.

Roster entries are **independent** of submissions: an entry whose
member hasn't yet submitted via the Form keeps their existing
`src/_data/board.json` content (matched by name slug) and just inherits
the latest `role` from the roster. So you can fill in real emails and
merge to `master` before sending the Form — nothing will break.

## Step 1 · Create the Form

1. Go to <https://forms.google.com> and create a new blank form.
2. Title it **Update your EISS bio**. Suggested description:
   > For listed EISS board and support-team members. Submit (or
   > re-submit) your bio for the public page at
   > <https://eiss-europa.com/board.html>. Takes ~5 minutes. You can
   > edit your response later via the link in your confirmation email.
3. Add these questions, **in this order, with the exact text below**.
   If you rename a question, mirror the change in
   `scripts/board-source.json` (`columns` map).

| # | Question text | Type | Required? |
|---|---|---|---|
| 1 | **Full name (with title — Dr / Prof / Mr / Ms)** | Short answer | ✅ |
| 2 | **Position and institution (e.g. 'Associate Professor — Leiden University')** | Short answer | ✅ |
| 3 | **Research themes (3–5 short phrases, comma-separated)** | Short answer | ⬜ |
| 4 | **Long bio (optional — used for the support-team display style)** | Paragraph | ⬜ |
| 5 | **Headshot photo (optional)** | File upload — image only — max 5 MB | ⬜ |
| 6 | **I consent to publication of my bio on eiss-europa.com** | Checkboxes — single option | ✅ |

> **Themes vs long bio.** Board members get the "Research themes" line
> styled separately from their affiliation. Support-team members get a
> flowing bio paragraph instead. The script picks the right shape based
> on each person's `kind` (board / support) in the roster — members do
> **not** choose this themselves.

In *Settings → Responses*, **enable**:

- ☑ Collect email addresses
- ☑ Allow response editing
- ☑ Limit to 1 response (require Google sign-in — strongly recommended,
  because the script matches submissions against the roster by email).

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
those in `columns` (e.g. your Google account's locale renamed
*Timestamp* to *Horodateur*), update the values in `columns` to match
the exact header text in the Sheet.

Commit. The workflow will pick it up on the next manual run.

## Step 5 · Photo permissions — the one Google quirk

Files uploaded via Google Forms land in a private Drive folder. For the
sync script to download them, they need to be readable without auth.

In Google Drive, find the Form's auto-created folder (under
*My Drive → Update your EISS bio (File responses)*). Right-click →
*Share* → set general access to **Anyone with the link → Viewer**. This
inherits to every file uploaded later.

(If you'd rather control sharing per file, do the same right-click →
*Share* dance on each upload as submissions arrive. More secure, more
work — fine for ~20 board members.)

## Step 6 · Test the workflow

After Step 4, trigger the workflow manually:

1. *Actions → Sync board bios from Google Form → Run workflow*.
2. Wait ~30 s.
3. If the Sheet has at least one submission whose email matches the
   roster, a PR opens on `board-sync/auto`. If it doesn't, the run is
   a clean no-op.

## Step 7 · Share the Form with the board

Send the Form URL to board + support-team members directly, ideally
with a note about what they're consenting to:

> Subject: Update your EISS bio
>
> Dear colleague,
>
> We've automated the maintenance of <https://eiss-europa.com/board.html>.
> If you'd like to update your photo, affiliation, or research themes,
> please fill in this short form (~5 minutes):
>
>   <https://forms.google.com/your-form-url>
>
> Submissions go into a Google Sheet that we sync to the website on
> demand. You can edit your response any time using the link in your
> confirmation email.
>
> The Form is invitation-only — submissions from any address not in
> our internal roster are dropped automatically.

## Editing or removing a bio

- **Edit the Sheet directly.** The response sheet is just data —
  correct typos, fix affiliations, etc. The next sync run picks up your
  edits.
- **Roster changes.** To change someone's title (`Treasurer → Board
  Member`) or display order, edit `scripts/board-roles.json` in a PR
  and merge. No Form interaction required.
- **Remove a member.** Delete their entry from
  `scripts/board-roles.json`. The next sync drops them from
  `src/_data/board.json`. Their old photo file stays in
  `src/assets/images/board/` until you delete it manually.

## Exporting / archiving the data

`src/_data/board.json` is the canonical export, version-controlled in
this repo. The Sheet itself is also exportable via *File → Download →
CSV / XLSX*.
