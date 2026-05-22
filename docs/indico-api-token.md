# Setting up an Indico API token for the website sync

This guide walks through creating a **read-only** Indico API credential
that the GitHub Actions sync workflow uses to enrich
`src/_data/indico.json`. **One-time setup, ~10 minutes.**

The website works without this — the sync falls back to anonymous mode
and still surfaces public timetable + event data. What the token
unlocks is anything anonymous access can't see, which over time will
likely include:

- Registration form state (open/closed) — so we can drop the manual
  `registrationStatus` override in `src/_data/conferences.js`
- Auth-gated video-conference URLs (some Indico Zoom integrations
  require auth)
- Private event metadata that may matter for future enrichments

## Why a dedicated service account

Don't tie the credential to your personal Indico account:

- API calls are logged under whoever owns the token. With a personal
  account, every sync run looks like *you* doing it — and revoking it
  if something goes wrong locks you out of your own admin.
- A dedicated bot user can be granted just the categories the website
  reads from, not the operator's full admin reach.
- If the EISS repo's CI is ever compromised (malicious PR,
  dependency takeover), you revoke the bot token — your personal
  account is untouched.

## Step 1 — Create the service-account user

In Indico admin, create a new user:

- Email: an alias you control, e.g. `website-sync@eiss-europa.com`
- Name: *EISS Website Sync Bot*
- Password: random, long, stored only in your password manager
- 2FA: enable if Indico supports it

Confirm the account by following the email link.

## Step 2 — Grant category access

Decide which categories the bot should read. For the current site that's:

- **Annual Conferences** (categoryId 1) — drives `/2026` and the
  registration status badge
- **Root category** (categoryId 0) — implicit; the bot can read public
  category listings without explicit grants

In Indico:

1. Navigate to the **Annual Conferences** category as an admin.
2. **Manage** → **Protection**.
3. Add the bot user with role **Reader** (not Manager, not Owner).

Repeat for any other category the website needs to read in future.

## Step 3 — Issue a token

Log in as the bot user. Then:

1. **User preferences** → **API Tokens** → **Add new token**.
2. Name: `eiss-site-sync` (or similar — appears in the Indico audit log,
   so make it self-explanatory).
3. Scopes: pick the *read* scopes you need. At minimum:
   - `read:legacy_api` — covers the `/export/*` endpoints the sync uses.
   - `read:user` — sometimes required for type-field on session detail.
4. **Do not** grant write scopes (`registrants`, `everything`, etc.) for
   this token. Writes deserve a separate, deliberately-issued token.
5. Save. Indico shows the token **once**. Copy it now.

## Step 4 — Drop the token into GitHub Actions secrets

In `github.com/EISSeuropa/EISSeuropa.github.io`:

1. **Settings** → **Secrets and variables** → **Actions** → **New
   repository secret**.
2. Name: `INDICO_API_TOKEN` (exact spelling — that's what the workflow
   reads).
3. Value: paste the token.
4. **Add secret**.

The token is now encrypted at rest. GitHub Actions decrypts it just-in-
time when the workflow runs. It never appears in logs.

## Step 5 — Verify

Trigger the sync workflow manually to confirm the credential works:

1. **Actions** → *Sync events from Indico* → **Run workflow**.
2. Wait ~30 seconds. Open the run log.
3. The first line of the *Run sync script* step should read:
   ```
   Indico sync running in authenticated mode
   ```
   If it reads `anonymous mode`, the secret name is wrong or empty.
4. Confirm the workflow ends with `Pushed indico.json update to master`
   or `No change — indico.json already up to date`.

## Rotation + audit

- **Calendar a rotation** every 12 months — and any time something
  concerning happens (suspicious commit, contributor offboarding,
  security advisory affecting Indico).
- To rotate: issue a new token under a new name (e.g.
  `eiss-site-sync-2027`), update the GitHub secret, then **delete the
  old token in Indico** — not just remove it from the secret.
- **Check Indico's API access log periodically.** If you see calls you
  don't recognise, revoke the token immediately and tell Claude.

## Revocation

If the token is ever exposed (accidentally pasted into a public
issue, included in a screenshot, etc.):

1. Indico → bot user → **API Tokens** → revoke the leaked token.
2. Issue a replacement, update the GitHub secret.
3. Skim recent Indico API logs for unexpected activity.

## Notes for future Claude sessions

- The token is `${{ secrets.INDICO_API_TOKEN }}` in the workflow and
  `os.environ.get("INDICO_API_TOKEN")` in `scripts/sync-indico.py`.
- The `_get` helper in `scripts/sync-indico.py` adds the
  `Authorization: Bearer …` header when the token is set; the rest of
  the script is agnostic.
- **Never** print, log, or echo the token value — even in error paths.
  The script logs only the mode banner (`authenticated` / `anonymous`).
- The script falls back to anonymous mode if the env var is missing, so
  local runs without the token still work for public endpoints.
