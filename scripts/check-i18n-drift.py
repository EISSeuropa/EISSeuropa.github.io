#!/usr/bin/env python3
"""
Translation-drift checker for the EISS website.

Ported from netsec.github.io/scripts/check-i18n-drift.py with paths
adapted to EISS's Eleventy/Nunjucks layout (src/page.njk for English,
src/page.fr.njk and src/page.de.njk for translations).

Reads data/i18n-state.json, which records for every translated page
the SHA-1 of the English source .njk file at the time the translation
was made. Compares against the current SHA-1 of the English source and
reports which translations are stale.

No network calls. No API keys. Costs nothing to run.

Workflow when a translation drifts
----------------------------------
  1. Open the English source (e.g. src/policy.njk) and the translated
     sibling (e.g. src/policy.fr.njk) side by side.
  2. Manually port the changes across — use any free tool
     (DeepL Free, Google Translate, a native-speaker volunteer).
  3. When done, refresh the `source_sha1` and `translated_on` fields
     in data/i18n-state.json by running:
        python3 scripts/check-i18n-drift.py --mark-fresh src/policy.njk fr

Usage
-----
  python3 scripts/check-i18n-drift.py
      → report drift (exit 0 fresh, 1 stale, 2 missing file)
  python3 scripts/check-i18n-drift.py --mark-fresh <source> <lang>
      → bless a refreshed translation
"""
from __future__ import annotations
import argparse
import hashlib
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / "data" / "i18n-state.json"


def sha1(path: Path) -> str:
    """SHA-1 of a file's bytes. We hash the raw bytes (not a parsed
    template tree) because we want any meaningful edit — including
    markup, attribute, or front-matter changes — to be flagged for
    review."""
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_state() -> dict:
    return json.loads(STATE.read_text(encoding="utf-8"))


def save_state(state: dict) -> None:
    STATE.write_text(
        json.dumps(state, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def report(state: dict) -> int:
    """Print a status table. Return 0 if everything is fresh, 1 if
    anything has drifted, 2 if a translated file is missing."""
    exit_code = 0
    rows: list[tuple[str, str, str, str]] = []
    for src, langs in state.get("translations", {}).items():
        src_path = ROOT / src
        if not src_path.exists():
            rows.append((src, "—", "missing", "English source not found"))
            exit_code = max(exit_code, 2)
            continue
        current = sha1(src_path)
        for lang, meta in langs.items():
            tgt_path = ROOT / meta["file"]
            if not tgt_path.exists():
                rows.append((src, lang, "missing", f'expected {meta["file"]}'))
                exit_code = max(exit_code, 2)
                continue
            recorded = meta.get("source_sha1", "")
            if recorded == current:
                rows.append((src, lang, "fresh", meta.get("translated_on", "?")))
            else:
                rows.append((src, lang, "stale", f'last: {meta.get("translated_on", "?")}'))
                exit_code = max(exit_code, 1)

    if not rows:
        print("No translations registered in data/i18n-state.json.")
        return 0

    w_src = max(max(len(r[0]) for r in rows), len("SOURCE")) + 2
    w_lang = max(max(len(r[1]) for r in rows), len("LANG")) + 2
    w_status = max(max(len(r[2]) for r in rows), len("STATUS")) + 2
    print(f'{"SOURCE":<{w_src}}{"LANG":<{w_lang}}{"STATUS":<{w_status}}NOTE')
    print("-" * (w_src + w_lang + w_status + 40))
    for src, lang, status, note in rows:
        marker = {"fresh": "✓", "stale": "!", "missing": "✗"}.get(status, "·")
        status_cell = f"{marker} {status}"
        print(f'{src:<{w_src}}{lang:<{w_lang}}{status_cell:<{w_status}}{note}')

    if exit_code == 0:
        print("\nAll translations match their English sources.")
    elif exit_code == 1:
        print(
            "\nSome translations have drifted. Re-translate the affected\n"
            "pages, then run:\n"
            "  python3 scripts/check-i18n-drift.py --mark-fresh <source> <lang>"
        )
    else:
        print("\nERROR: at least one expected file is missing on disk.")
    return exit_code


def mark_fresh(state: dict, source: str, lang: str) -> int:
    entry = state.get("translations", {}).get(source, {}).get(lang)
    if entry is None:
        print(f"ERROR: no entry for {source} / {lang} in i18n-state.json")
        return 2
    src_path = ROOT / source
    tgt_path = ROOT / entry["file"]
    if not src_path.exists() or not tgt_path.exists():
        print(f"ERROR: source or target file missing for {source} / {lang}")
        return 2
    entry["source_sha1"] = sha1(src_path)
    entry["translated_on"] = date.today().isoformat()
    save_state(state)
    print(f"Marked {entry['file']} as fresh against {source}.")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--mark-fresh",
        nargs=2,
        metavar=("SOURCE", "LANG"),
        help='Record that the named translation has been refreshed against the current English source (e.g. "src/policy.njk fr").',
    )
    args = p.parse_args()
    state = load_state()
    if args.mark_fresh:
        return mark_fresh(state, args.mark_fresh[0], args.mark_fresh[1])
    return report(state)


if __name__ == "__main__":
    sys.exit(main())
