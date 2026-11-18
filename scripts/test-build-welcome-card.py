#!/usr/bin/env python3
"""Tests for scripts/build-welcome-card.py (#2219). No browser: the card's
SVG is checked as XML, and nothing is rasterised.

Run: python3 scripts/test-build-welcome-card.py
"""
from __future__ import annotations

import importlib.util
import re
import sys
import types
from pathlib import Path
from xml.etree import ElementTree

_MOD = Path(__file__).resolve().parent / "build-welcome-card.py"
_spec = importlib.util.spec_from_file_location("build_welcome_card", _MOD)
bwc = importlib.util.module_from_spec(_spec)
sys.modules["build_welcome_card"] = bwc
_spec.loader.exec_module(bwc)
sp = bwc.sp

PHOTO = "/assets/images/board/" + sorted(p.name for p in (sp.SRC / "assets" / "images" / "board").glob("*.jpg"))[0]


def _person(i: int, **kw) -> dict:
    p = {"name": f"Dr Example Person{i:02d}", "_section": "support"}
    p.update(kw)
    return p


def _faces(svg: str) -> int:
    return len(re.findall(r"<image ", svg)) + len(re.findall(r'font-size="48"', svg))


def test_display_name_drops_the_honorific():
    assert bwc.display_name("Prof. Carmen Márquez Carrasco") == "Carmen Márquez Carrasco"
    assert bwc.display_name("Dr Mir Hassan") == "Mir Hassan"
    assert bwc.display_name("Dr") == "Dr"


def test_initials():
    assert bwc.initials("Dr Mir Hassan") == "MH"
    assert bwc.initials("Ada") == "A"


def test_names_wrap_on_two_lines_with_an_ellipsis():
    assert bwc.name_lines("Dr Mir Hassan") == ["Mir Hassan"]
    assert bwc.name_lines("Prof. Carmen Márquez Carrasco") == ["Carmen Márquez", "Carrasco"]
    lines = bwc.name_lines("Mohamed El Yamine Atrouche")
    assert len(lines) == 2 and lines[1].endswith("…")
    assert all(len(ln) <= bwc.NAME_CHARS for ln in lines)


def test_the_svg_is_well_formed():
    svg = bwc.card_svg([_person(1, photo=PHOTO), _person(2, name="Dr <Ada> & Co", photo=PHOTO)])
    ElementTree.fromstring(svg)
    assert "&lt;Ada&gt; &amp; Co" in svg and "<Ada>" not in svg


def test_people_with_a_photo_are_pictured_and_the_rest_counted():
    svg = bwc.card_svg([_person(1), _person(2, photo=PHOTO), _person(3)])
    assert _faces(svg) == 1 and ">+2<" in svg and "more members" in svg
    assert "Three new members" in svg


def test_seven_with_photos_are_all_pictured():
    svg = bwc.card_svg([_person(i, photo=PHOTO) for i in range(7)])
    assert _faces(svg) == 7 and ">+" not in svg


def test_eight_with_photos_show_six_and_plus_two():
    svg = bwc.card_svg([_person(i, photo=PHOTO) for i in range(8)])
    assert _faces(svg) == 6 and ">+2<" in svg


def test_nobody_with_a_photo_falls_back_to_initials():
    svg = bwc.card_svg([_person(1), _person(2)])
    assert svg.count('font-size="48"') == 2 and "<image " not in svg


def test_a_plus_one_tile_reads_more_member():
    assert "more member<" in bwc.more_tile(6, 1) and ">+1<" in bwc.more_tile(6, 1)


def test_the_card_directory_is_gitignored():
    assert sp.WELCOME_CARDS.relative_to(sp.ROOT).parts[0] == ".cache"
    assert ".cache/" in (sp.ROOT / ".gitignore").read_text(encoding="utf-8").splitlines()


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
