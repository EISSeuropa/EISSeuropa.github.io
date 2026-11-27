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


# Link checks for the PR body (#2287). The network is replaced by stubs.

def _board(**links) -> dict:
    return {"members": [], "support": [{"name": "Hugo Example", "links": links}]}


def _no_net(url):
    raise AssertionError("no network call expected")


def test_a_host_without_a_real_domain_is_reported():
    problem = sb.link_reach_problem("https://www.hugo", resolves=lambda h: False,
                                    http_status=_no_net, skip_domains=())
    assert problem and "www.hugo" in problem
    lines = sb.link_problems(_board(), _board(website="https://www.hugo"),
                             reach=lambda u: sb.link_reach_problem(u, resolves=lambda h: False,
                                                                   http_status=_no_net, skip_domains=()))
    assert len(lines) == 1 and "Hugo Example" in lines[0] and "website" in lines[0]


def test_a_host_without_a_dot_is_reported_offline():
    assert "domain ending" in sb.link_shape_problem("website", "https://hugo")


def test_a_website_under_linkedin_is_reported():
    lines = sb.link_problems(_board(), _board(linkedin="https://www.hugo-example.nl"), network=False)
    assert len(lines) == 1 and "linkedin.com" in lines[0]


def test_other_profile_hosts_are_checked():
    assert sb.link_shape_problem("bluesky", "https://twitter.com/x") is not None
    assert sb.link_shape_problem("twitter", "https://x.com/example") is None
    assert sb.link_shape_problem("linkedin", "https://uk.linkedin.com/in/example") is None
    assert sb.link_shape_problem("orcid", "https://orcid.org/0000-0002-1825-0097") is None
    assert "ORCID iD" in sb.link_shape_problem("orcid", "https://orcid.org/0000-0002-1825-0098")


def test_a_valid_entry_gives_no_warning():
    links = {"website": "https://example.org", "linkedin": "https://www.linkedin.com/in/example",
             "orcid": "https://orcid.org/0000-0002-1825-0097", "publicEmail": "hugo@example.org"}
    reach = lambda u: sb.link_reach_problem(u, resolves=lambda h: True,
                                            http_status=lambda u: 200, skip_domains=("linkedin.com",))
    assert sb.link_problems(_board(), _board(**links), reach=reach) == []


def test_only_new_or_changed_links_are_checked():
    old = _board(website="https://www.hugo")
    assert sb.link_problems(old, old, reach=_no_net) == []


def test_a_404_is_reported_and_a_bot_refusal_is_not():
    check = lambda status: sb.link_reach_problem("https://example.org/gone", resolves=lambda h: True,
                                                 http_status=lambda u: status, skip_domains=())
    assert "404" in check(404)
    assert check(403) is None and check(999) is None and check(None) is None


def test_a_skipped_domain_gets_the_dns_lookup_only():
    assert sb.link_reach_problem("https://www.linkedin.com/in/x", resolves=lambda h: True,
                                 http_status=_no_net, skip_domains=("linkedin.com",)) is None


def test_the_pr_body_lists_links_to_check():
    body = sb.compose_rich_body(_board(), _board(website="https://www.hugo"), [],
                                ["- **Hugo Example**, website: `https://www.hugo` does not exist"])
    assert "### Links to check (1)" in body and "Hugo Example" in body
    assert "Links to check" not in sb.compose_rich_body(_board(), _board(), [], [])


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
