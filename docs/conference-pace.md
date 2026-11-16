# Conference pace

How many abstracts, and later registrations, the coming ESSC has at today's distance from the conference, against the previous edition at the same distance (#2039).

## Daily refresh from Indico

The *Sync conference pace* workflow ([`sync-conference-pace.yml`](../.github/workflows/sync-conference-pace.yml), daily at 03:20 UTC) runs `python3 scripts/conference-pace.py --from-indico` (#2101). For each edition in `src/_data/conferences.js` whose conference starts within the next year or began less than 30 days ago, it finds the Indico event in the Annual Conferences category (1) with the same start date and reads two management views:

- `GET /event/<id>/manage/abstracts/abstracts.json`: every abstract with its submission time. Invited abstracts not yet submitted are left out.
- `GET /api/checkin/event/<id>/forms/` and `.../forms/<form>/registrations/`: every registration in every form, with its registration time.

Both responses hold names and emails. The script keeps only the days before the conference, in the event's time zone, and prints only counts. When a list changed, the workflow opens a PR on `conference-pace/auto` and merges it once the required checks pass. An unchanged list keeps its recorded date, so a quiet day commits nothing.

A view the bot cannot read fails the run with a warning naming the edition and the measure, after the other lists are written. The failure alarm then fires.

### Credential

The workflow uses the repository secret `INDICO_PACE_TOKEN`, a personal token of the *EISS Website Sync Bot* Indico account ([`indico-api-token.md`](indico-api-token.md)). It is separate from `INDICO_API_TOKEN`, which the programme sync uses.

1. Log in to Indico as the bot. User preferences > API Tokens > Add new token. Name it `eiss-conference-pace`. Give it the scope *Everything (only GET)* (`read:everything`) and nothing else. The token can read whatever the bot can see, and cannot change anything.
2. Store the token in the password manager and in the repository secret `INDICO_PACE_TOKEN`.
3. For each edition, as an event manager: the event's Settings > Protection > Permissions, add the bot with *Abstracts* and *Registration (check-in only)* only. Do this when the edition's event is created ([`new-conference.md`](new-conference.md)).
4. Run the workflow by hand (Actions > Sync conference pace > Run workflow) and check its log names the edition with a count for each measure.

Revoke the token in Indico and replace the secret if it leaks. Remove the bot's permissions from an event once its edition has left the 30-day window.

## Recording an edition by hand

For an edition the bot cannot reach, such as a past one recorded once for comparison:

1. In Indico, open the edition's management pages and export the abstracts list (or the registrations) as CSV. Save it outside this repository, for example in `~/Downloads`. The file holds names and emails, and the repository is public.
2. List the file's columns:

   ```
   python3 scripts/conference-pace.py --edition 2026 --measure abstracts ~/Downloads/abstracts.csv
   ```

3. Run it again with the column that holds the submission or registration date. Indico calls it `Submission date` for abstracts and `Registration date` for registrations. The abstracts export only includes it when the column is shown in the abstracts list, so add it there before exporting.

   ```
   python3 scripts/conference-pace.py --edition 2026 --measure abstracts --column "Submission date" ~/Downloads/abstracts.csv
   ```

4. Commit `src/data/conference-pace.json` in a PR.

The script keeps only the dates, as days before the conference's first day (from `src/_data/conferences.js`). Each run replaces that edition's list for that measure. ESSC 2026 was recorded this way on 9 November 2026 (#2098, #2099).

## What reads it

`src/_data/dashboard.js` builds `dashboard.pace` from the file: for each measure, this edition's count when it was last recorded, and the previous edition's count at the same distance from its conference, with its final total. With nothing recorded for this edition yet, the distance is today's.

The "Conference pace" card in the conference timeline on `/internal.html` shows it to staff and management: one bar for each edition, both on the scale of the previous edition's final total. Its light is dark green, with the date of the latest recording in its tooltip. With no file, the card says so and links here.

## Checks

`python3 scripts/test-conference-pace.py` covers the date formats, the skipped empty rows, the absence of personal data in the output, the refusal of an export inside the repository, and the Indico mode against made-up responses: the time zone, the left-out invited abstracts, the unchanged list that writes nothing, and the unreadable view that fails the run. The workflow runs it before each refresh.
