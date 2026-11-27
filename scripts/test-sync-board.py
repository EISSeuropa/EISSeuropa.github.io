#!/usr/bin/env python3
"""Tests for the `joined` date, the `socialConsent` flag and the staff-only
functional responsibility that
scripts/sync-board.py writes into board.json (#2219). No network: rows are
built by hand and no photo is downloaded.

Run: python3 scripts/test-sync-board.py (needs `requests`, which
sync-board.py imports, so CI runs it after installing scripts/requirements.txt).
"""
from __future__ import annotations

import importlib.util
import json
import sys
import types
from pathlib import Path

_MOD = Path(__file__).resolve().parent / "sync-board.py"
_spec = importlib.util.spec_from_file_location("sync_board", _MOD)
sb = importlib.util.module_from_spec(_spec)
sys.modules["sync_board"] = sb
_spec.loader.exec_module(sb)

COLS = json.loads((Path(__file__).resolve().parent / "board-source.json").read_text(encoding="utf-8"))["columns"]
ROLE = {"label": "Support Staff", "kind": "support", "tier": 100}
AGREE = ("I agree that EISS may name me and show my photo, role and institution in its posts on "
         "social media, such as LinkedIn and Bluesky, including a welcome post when I join. "
         "I can withdraw this consent at any time.")
DECLINE = "No, leave me out of EISS's social media posts."


def _row(social: str | None = None, **extra) -> dict:
    row = {COLS["name"]: "Ada Example", COLS["role"]: "Support Staff",
           COLS["institution"]: "Example University", COLS["consent"]: "Yes"}
    if social is not None:
        row[COLS["socialConsent"]] = social
    row.update(extra)
    return row


def test_a_volunteer_has_no_functional_responsibility():
    cohort = "Winter 2027 (4 January to 26 February 2027)"
    row = _row(**{COLS["cohort"]: cohort, COLS["functionalResponsibility"]: "Conference Coordinator"})
    assert "functionalResponsibility" not in sb.build_from_row(row, COLS, ROLE, None)
    prior = {"name": "Ada Example", "functionalResponsibility": "Conference Coordinator"}
    assert "functionalResponsibility" not in sb.build_from_row(_row(**{COLS["cohort"]: cohort}), COLS, ROLE, prior)


def test_staff_keep_their_functional_responsibility():
    row = _row(**{COLS["functionalResponsibility"]: "Conference Coordinator"})
    assert sb.build_from_row(row, COLS, ROLE, None)["functionalResponsibility"] == "Conference Coordinator"


def test_a_volunteer_without_a_cohort_has_no_functional_responsibility():
    row = _row(**{COLS["role"]: "Volunteer", COLS["functionalResponsibility"]: "Conference Coordinator"})
    assert "functionalResponsibility" not in sb.build_from_row(row, COLS, ROLE, None)
    prior = {"name": "Ada Example", "functionalResponsibility": "Conference Coordinator"}
    assert "functionalResponsibility" not in sb.build_from_row(_row(**{COLS["role"]: "Volunteer"}), COLS, ROLE, prior)


def test_staff_who_pick_a_cohort_keep_their_functional_responsibility():
    row = _row(**{COLS["role"]: "Staff", COLS["cohort"]: "Winter 2027 (4 January to 26 February 2027)",
                  COLS["functionalResponsibility"]: "Conference Coordinator"})
    assert sb.build_from_row(row, COLS, ROLE, None)["functionalResponsibility"] == "Conference Coordinator"


def test_volunteer_and_staff_answers_are_support_staff():
    roles = json.loads((Path(__file__).resolve().parent / "board-source.json").read_text(encoding="utf-8"))["roles"]
    support = next(r for r in roles if r["label"] == "Support Staff")
    assert {"Volunteer", "Staff"} <= set(support["aliases"])
    for answer in ("Volunteer", "Staff", "Support Staff"):
        assert not any(answer == r["label"] or answer in r.get("aliases", []) for r in roles if r is not support)
    person = sb.build_from_row(_row(**{COLS["role"]: "Volunteer"}), COLS, support, None)
    assert person["role"] == "Support Staff"


def test_the_column_is_mapped():
    assert COLS["socialConsent"] == "Social media"


def test_a_new_entry_is_stamped_with_today():
    person = sb.build_from_row(_row(), COLS, ROLE, None)
    assert person["joined"] == sb.today_utc()


def test_a_returning_entry_keeps_its_date():
    person = sb.build_from_row(_row(), COLS, ROLE, {"name": "Ada Example", "joined": "2026-12-01"})
    assert person["joined"] == "2026-12-01"


def test_an_entry_from_before_the_field_gets_none():
    person = sb.build_from_row(_row(), COLS, ROLE, {"name": "Ada Example"})
    assert "joined" not in person


def test_agreement_sets_the_flag():
    assert sb.build_from_row(_row(AGREE), COLS, ROLE, None)["socialConsent"] is True


def test_no_clears_the_flag():
    prior = {"name": "Ada Example", "socialConsent": True}
    assert "socialConsent" not in sb.build_from_row(_row(DECLINE), COLS, ROLE, prior)


def test_a_blank_answer_keeps_the_earlier_one():
    prior = {"name": "Ada Example", "socialConsent": True}
    assert sb.build_from_row(_row(""), COLS, ROLE, prior)["socialConsent"] is True
    assert "socialConsent" not in sb.build_from_row(_row(""), COLS, ROLE, None)


def test_a_sheet_without_the_column_keeps_the_earlier_one():
    prior = {"name": "Ada Example", "socialConsent": True}
    assert sb.build_from_row(_row(None), COLS, ROLE, prior)["socialConsent"] is True
    assert "socialConsent" not in sb.build_from_row(_row(None), COLS, ROLE, None)


def test_the_answer_is_read_case_and_space_insensitively():
    assert sb.build_from_row(_row("  " + AGREE.upper() + " "), COLS, ROLE, None)["socialConsent"] is True


def test_the_pr_body_names_a_consent_change():
    assert "social media consent" in sb.describe_field_changes({"socialConsent": True}, {})


def _standalone() -> int:
    failures = 0
    tests = [(n, f) for n, f in sorted(globals().items())
             if n.startswith("test_") and isinstance(f, types.FunctionType)]
    for name, fn in tests:
        try:
            fn()
            print(f"  ok  {name}")
        except Exception as exc:  # noqa: BLE001
            failures += 1
            print(f"FAIL  {name}: {exc!r}")
    print(f"\n{len(tests) - failures}/{len(tests)} passed.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(_standalone())
