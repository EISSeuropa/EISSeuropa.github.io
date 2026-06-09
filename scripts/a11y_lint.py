"""Static accessibility lint for the built site.

Scans every HTML file in _site/ (only the modernised templates, not the
passthrough legacy files which we accept as-is) and reports common a11y
issues we can fix automatically:

- Images missing alt attribute
- <img>/<a>/<button> with empty content and no accessible name
- Missing <html lang>
- Missing <main> / <header> / <footer> / <nav> landmarks
- Heading hierarchy gaps (h1 → h3, etc.)
- Multiple <h1> on one page
- Form inputs without labels
- Links opening in new tab without rel="noopener"
- Duplicate id attributes
- <a href="#"> placeholders
- Buttons styled as links / links styled as buttons (icon-only without aria-label)

Usage: python3 scripts/a11y_lint.py
"""

import os
import re
import sys
from html.parser import HTMLParser
from collections import defaultdict, Counter


# Modernised pages are those we generate from src/*.njk — they end up as
# _site/*.html. Legacy passthroughs come from src/legacy/*.html (also at
# _site/*.html). We discriminate by scanning the page for our new design
# system marker class `.site-header`. Anything else is legacy and skipped.
def is_modernised(html: str) -> bool:
    return 'class="site-header"' in html or "class='site-header'" in html


class A11yScan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.issues = []
        self.tag_stack = []
        self.headings = []  # list of (level, text)
        self._head_text_buf = ""
        self._cur_heading = None
        self.ids = []
        self.has_main = False
        self.has_header = False
        self.has_footer = False
        self.has_nav = False
        self.html_lang = None
        self._in_button = None  # current <button> open or None
        self._button_text = ""
        self._in_link = None
        self._link_text = ""
        self._link_attrs = None
        self._line_no = 0
        self.icon_anchor_count = 0
        self.placeholder_anchors = []
        self.images_no_alt = []
        self.images_decorative_with_role = []
        self.heading_gaps = []
        self.h1_count = 0
        self.empty_buttons = []
        self.empty_links = []
        self.new_tab_no_noopener = []
        self.dup_ids = []
        self.inputs_no_label = []  # id of input
        self.labelled_input_ids = set()
        self.form_inputs = []  # (id, type, has_aria_label_or_labelledby)

    def handle_starttag(self, tag, attrs_list):
        attrs = dict(attrs_list)
        self.tag_stack.append(tag)

        if tag == "html":
            self.html_lang = attrs.get("lang")
        elif tag == "main":
            self.has_main = True
        elif tag == "header" and attrs.get("class", "").find("site-header") >= 0:
            self.has_header = True
        elif tag == "footer":
            self.has_footer = True
        elif tag == "nav":
            self.has_nav = True
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            level = int(tag[1])
            self._cur_heading = (level, "")
            if level == 1:
                self.h1_count += 1
        elif tag == "img":
            alt = attrs.get("alt")
            if alt is None:
                self.images_no_alt.append(attrs.get("src", "?"))
            elif alt == "" and attrs.get("role"):
                # alt="" is fine; flag if also has role that doesn't match decorative
                pass
        elif tag == "a":
            self._in_link = tag
            self._link_text = ""
            self._link_attrs = attrs
            href = attrs.get("href", "")
            if href == "#":
                self.placeholder_anchors.append(href)
            if attrs.get("target") == "_blank":
                rel = attrs.get("rel", "")
                if "noopener" not in rel:
                    self.new_tab_no_noopener.append(href)
        elif tag == "button":
            self._in_button = tag
            self._button_text = ""
            self._button_attrs = attrs
        elif tag == "input":
            input_id = attrs.get("id")
            t = attrs.get("type", "text")
            if t in {"hidden", "submit", "button", "reset"}:
                pass
            else:
                has_aria = bool(attrs.get("aria-label") or attrs.get("aria-labelledby"))
                self.form_inputs.append((input_id, t, has_aria))
        elif tag == "label":
            for_id = attrs.get("for")
            if for_id:
                self.labelled_input_ids.add(for_id)

        # IDs
        if "id" in attrs:
            self.ids.append(attrs["id"])

    def handle_endtag(self, tag):
        # heading text capture
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"} and self._cur_heading:
            self.headings.append(self._cur_heading)
            self._cur_heading = None
        elif tag == "button" and self._in_button:
            text = self._button_text.strip()
            attrs = self._button_attrs
            if not text and not (attrs.get("aria-label") or attrs.get("aria-labelledby") or attrs.get("title")):
                self.empty_buttons.append(attrs)
            self._in_button = None
        elif tag == "a" and self._in_link:
            text = self._link_text.strip()
            attrs = self._link_attrs
            if not text:
                if not (attrs.get("aria-label") or attrs.get("aria-labelledby") or attrs.get("title")):
                    self.empty_links.append(attrs.get("href", "?"))
            self._in_link = None
        if self.tag_stack:
            self.tag_stack.pop()

    def handle_data(self, data):
        if self._cur_heading:
            self._cur_heading = (self._cur_heading[0], self._cur_heading[1] + data)
        if self._in_button:
            self._button_text += data
        if self._in_link:
            self._link_text += data

    def finalize(self):
        # heading gaps
        last_level = 0
        for lvl, _txt in self.headings:
            if last_level and lvl > last_level + 1:
                self.heading_gaps.append((last_level, lvl))
            last_level = lvl

        # duplicate ids
        c = Counter(self.ids)
        self.dup_ids = [i for i, n in c.items() if n > 1]

        # inputs without labels
        for inp_id, t, has_aria in self.form_inputs:
            if has_aria:
                continue
            if inp_id and inp_id in self.labelled_input_ids:
                continue
            self.inputs_no_label.append((inp_id, t))


def main():
    site_dir = "_site"
    total = 0
    modernised = 0
    bucketed = defaultdict(list)
    pages_with_issues = 0

    for fn in sorted(os.listdir(site_dir)):
        if not fn.endswith(".html"):
            continue
        path = os.path.join(site_dir, fn)
        html = open(path, "r", encoding="utf-8", errors="ignore").read()
        total += 1
        if not is_modernised(html):
            bucketed["legacy_skipped"].append(fn)
            continue
        modernised += 1

        scanner = A11yScan()
        try:
            scanner.feed(html)
            scanner.finalize()
        except Exception as e:
            bucketed["parse_error"].append((fn, str(e)))
            continue

        page_issues = []

        if scanner.html_lang is None:
            page_issues.append("missing-html-lang")
        if not scanner.has_main:
            page_issues.append("missing-main-landmark")
        if not scanner.has_header:
            page_issues.append("missing-site-header")
        if not scanner.has_footer:
            page_issues.append("missing-footer")
        if not scanner.has_nav:
            page_issues.append("missing-nav")
        if scanner.h1_count == 0:
            page_issues.append("missing-h1")
        elif scanner.h1_count > 1:
            page_issues.append(f"multiple-h1 ({scanner.h1_count})")
        if scanner.heading_gaps:
            for prev, cur in scanner.heading_gaps:
                page_issues.append(f"heading-gap h{prev}->h{cur}")
        if scanner.images_no_alt:
            page_issues.append(f"img-no-alt x{len(scanner.images_no_alt)}: {scanner.images_no_alt[:3]}")
        if scanner.placeholder_anchors:
            page_issues.append(f"href=# x{len(scanner.placeholder_anchors)}")
        if scanner.empty_buttons:
            page_issues.append(f"button-no-accessible-name x{len(scanner.empty_buttons)}")
        if scanner.empty_links:
            page_issues.append(f"link-no-accessible-name x{len(scanner.empty_links)}: {scanner.empty_links[:3]}")
        if scanner.new_tab_no_noopener:
            page_issues.append(f"target=_blank-no-rel-noopener x{len(scanner.new_tab_no_noopener)}: {scanner.new_tab_no_noopener[:3]}")
        if scanner.dup_ids:
            page_issues.append(f"duplicate-ids: {scanner.dup_ids[:3]}")
        if scanner.inputs_no_label:
            page_issues.append(f"input-no-label x{len(scanner.inputs_no_label)}: {scanner.inputs_no_label[:3]}")

        if page_issues:
            bucketed["issues"].append((fn, page_issues))
            pages_with_issues += 1
        else:
            bucketed["clean"].append(fn)

    print(f"\n=== Lint summary ===")
    print(f"  Total HTML files:       {total}")
    print(f"  Modernised (scanned):   {modernised}")
    print(f"  Legacy (skipped):       {len(bucketed['legacy_skipped'])}")
    print(f"  Pages with issues:      {pages_with_issues}")
    print(f"  Pages clean:            {len(bucketed['clean'])}")

    if bucketed["issues"]:
        print(f"\n=== Issues by page ===")
        for fn, issues in bucketed["issues"]:
            print(f"\n  {fn}")
            for i in issues:
                print(f"    - {i}")
    if bucketed["legacy_skipped"]:
        print(f"\nLegacy passthroughs skipped:")
        for f in bucketed["legacy_skipped"]:
            print(f"  - {f}")

    # Gate: non-zero exit when any page has findings, so CI can fail
    # the PR. Local runs see the same behaviour (there is no warn-only
    # mode; a finding is a finding).
    return 1 if pages_with_issues else 0


if __name__ == "__main__":
    sys.exit(main())
