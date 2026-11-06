# Conference pace

How many abstracts, and later registrations, the coming ESSC has at today's distance from the conference, against the previous edition at the same distance (#2039).

## Recording an edition

1. In Indico, open the edition's management pages and export the abstracts list (or the registrations) as CSV. Save it outside this repository, for example in `~/Downloads`. The file holds names and emails, and the repository is public.
2. List the file's columns:

   ```
   python3 scripts/conference-pace.py --edition 2027 --measure abstracts ~/Downloads/abstracts.csv
   ```

3. Run it again with the column that holds the submission or registration date:

   ```
   python3 scripts/conference-pace.py --edition 2027 --measure abstracts --column "Submitted" ~/Downloads/abstracts.csv
   ```

4. Commit `src/data/conference-pace.json` in a PR.

The script keeps only the dates, as days before the conference's first day (from `src/_data/conferences.js`). Each run replaces that edition's list for that measure. Record the previous edition once, from its own export, so there is something to compare with. The dates in Indico's export make its whole curve available after the event.

## What reads it

`src/_data/dashboard.js` builds `dashboard.pace` from the file: for each measure, this edition's count at today's distance, the date it was recorded, and the previous edition's count at the same distance with its final total. No card on `/internal.html` shows it yet (#2039, step 2).

## Checks

`python3 scripts/test-conference-pace.py` covers the date formats, the skipped empty rows, the absence of personal data in the output, and the refusal of an export inside the repository.

## Later

Step 3 of #2039 replaces the manual export with an authenticated Indico fetch in the daily sync. See [indico-api-token.md](indico-api-token.md).
