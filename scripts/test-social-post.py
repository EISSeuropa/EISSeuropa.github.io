#!/usr/bin/env python3
"""Tests for scripts/social-post.py (pure logic, no network, no posting).

Ported from EISSeuropa/netsec.github.io scripts/test-social-post.py (#2056),
cut to the news path. Run: python3 scripts/test-social-post.py
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
from pathlib import Path

_MOD = Path(__file__).resolve().parent / "social-post.py"
_spec = importlib.util.spec_from_file_location("social_post", _MOD)
sp = importlib.util.module_from_spec(_spec)
sys.modules["social_post"] = sp
_spec.loader.exec_module(sp)


def _news(monkeypatch, tmp_path, items):
    f = tmp_path / "news.json"
    f.write_text(json.dumps(items), encoding="utf-8")
    monkeypatch.setattr(sp, "NEWS_JSON", f)


def test_truncate_keeps_short_and_ellipsises_long():
    assert sp._truncate("hello", 20) == "hello"
    out = sp._truncate("one two three four five", 12)
    assert out.endswith("…") and len(out) <= 12


def test_bluesky_render_within_limit_keeps_link():
    post = sp.Post(key="k", title="A reasonably long headline here",
                   summary="x " * 400, link="https://eiss-europa.com/x.html")
    text = post.render("bluesky")
    assert len(text) <= sp.BLUESKY_LIMIT
    assert text.endswith("https://eiss-europa.com/x.html")


def test_linkedin_render_has_full_summary():
    post = sp.Post(key="k", title="Headline", summary="The full summary stays.",
                   link="https://eiss-europa.com/x.html")
    assert post.render("linkedin") == "Headline\n\nThe full summary stays.\n\nhttps://eiss-europa.com/x.html"


def test_slug_matches_news_js():
    # src/_data/news.js: lower, NFKD, drop combining marks, non-alnum to "-".
    assert sp.slugify("Café: ESSC 2027, Belgrade!") == "cafe-essc-2027-belgrade"
    assert sp.slugify("") == "item"
    assert len(sp.slugify("a" * 200)) == 80


def test_read_news_caption_link_skip_collaborator(monkeypatch, tmp_path):
    _news(monkeypatch, tmp_path, [
        {"date": "2026-11-10", "type": "event", "title": "Call opens", "url": "/2027.html",
         "excerpt": "Site text.", "social": {"text": "Caption.", "collaborator": "netsec"}},
        {"date": "2026-11-09", "type": "news", "title": "No link", "excerpt": "Only excerpt."},
        {"date": "2026-11-08", "type": "news", "title": "Skipped", "social": "skip"},
        {"date": "2026-11-07", "type": "news", "title": "Also skipped", "social": {"skip": True}},
        {"date": "2026-11-06", "type": "press", "title": "Out", "url": "https://example.org/a"},
    ])
    posts = sp.read_news()
    assert [p.title for p in posts] == ["Call opens", "No link", "Out"]
    a, b, c = posts
    assert a.summary == "Caption." and a.collaborator == "netsec"
    assert a.link == "https://eiss-europa.com/2027.html"
    assert a.key == "news::2026-11-10::call-opens"
    assert b.summary == "Only excerpt." and b.link == "https://eiss-europa.com/news.html#news-no-link"
    assert c.link == "https://example.org/a" and c.summary == ""


ACCOUNTS = {"netsec": {"name": "Networking European Security Knowledge (NetSec)",
                       "linkedin": "urn:li:organization:123", "bluesky": "netsec-cost.eu"},
            "cost": {"name": "COST Association", "linkedin": None, "bluesky": None}}


def test_posts_written_per_network(monkeypatch, tmp_path):
    _news(monkeypatch, tmp_path, [{"date": "2026-11-18", "title": "ESSC 2027", "excerpt": "Belgrade.",
                                    "url": "/2027.html", "social": {
                                        "linkedin": "📣 Save the date!\n\nWith @NetSec and @COST. #ESSC2027",
                                        "bluesky": "Save the date, with @NetSec https://eiss-europa.com/2027.html"}}])
    monkeypatch.setattr(sp, "load_accounts", lambda path=None: ACCOUNTS)
    (p,) = sp.read_news()
    li = p.render("linkedin")
    # The text as written, paragraphs kept, the link added once at the end,
    # and no headline or hashtags added to it.
    assert li == ("📣 Save the date!\n\nWith Networking European Security Knowledge (NetSec) and COST Association."
                  " #ESSC2027\n\nhttps://eiss-europa.com/2027.html"), li
    bs = p.render("bluesky")
    assert bs == "Save the date, with @netsec-cost.eu https://eiss-europa.com/2027.html", bs
    # LinkedIn: a tag with a URN is a mention, one without is the plain name.
    c = sp.li_commentary(sp.with_link(p.linkedin_text, p.link), ACCOUNTS)
    assert "@[Networking European Security Knowledge \\(NetSec\\)](urn:li:organization:123)" in c, c
    assert "COST Association." in c and "{hashtag|\\#|ESSC2027}" in c, c


def test_post_box_left_empty_builds_from_title(monkeypatch, tmp_path):
    _news(monkeypatch, tmp_path, [{"date": "2026-11-18", "title": "T", "excerpt": "S.",
                                    "social": {"linkedin": "Only LinkedIn."}}])
    (p,) = sp.read_news()
    assert p.render("bluesky").startswith("T\n\nS.\n\nhttps://eiss-europa.com/news.html#news-t")


def test_tags_skip_emails_and_urls():
    text = "Mail info@eiss-europa.com, see https://x.com/@a and @NetSec."
    assert [m.group(1) for m in sp.TAG_RE.finditer(text)] == ["NetSec"]
    assert sp.unknown_tags("@Nope and @netsec", ACCOUNTS) == ["@Nope"]


def test_bluesky_facets_for_mentions_and_hashtags(monkeypatch, tmp_path):
    _news(monkeypatch, tmp_path, [{"date": "2026-11-18", "title": "T", "url": "https://example.org/a",
                                    "social": {"bluesky": "Né with @NetSec #ESSC2027"}}])
    monkeypatch.setattr(sp, "load_accounts", lambda path=None: ACCOUNTS)
    (p,) = sp.read_news()
    sent = {}

    def fake_http(url, payload=None, headers=None, raw=None, content_type=None):
        if "createSession" in url:
            return {"accessJwt": "j", "did": "did:plc:me"}
        if "resolveHandle" in url:
            assert url.endswith("handle=netsec-cost.eu"), url
            return {"did": "did:plc:netsec"}
        if "createRecord" in url:
            sent.update(payload["record"])
            return {"uri": "at://did:plc:me/app.bsky.feed.post/abc"}
        return {}

    monkeypatch.setattr(sp, "_http_json", fake_http)
    monkeypatch.setenv("BSKY_HANDLE", "eissnetwork.bsky.social")
    monkeypatch.setenv("BSKY_APP_PASSWORD", "x")
    monkeypatch.setattr(sp, "SITE_OG", tmp_path / "none.jpg")
    p.image = None
    sp.BlueskyChannel("bluesky").publish(p)
    text = sent["text"]
    assert text == "Né with @netsec-cost.eu #ESSC2027\n\nhttps://example.org/a", text
    kinds = {f["features"][0]["$type"].rsplit("#", 1)[1]: f["index"] for f in sent["facets"]}
    b = text.encode("utf-8")
    assert b[kinds["mention"]["byteStart"]:kinds["mention"]["byteEnd"]] == b"@netsec-cost.eu"
    assert b[kinds["tag"]["byteStart"]:kinds["tag"]["byteEnd"]] == b"#ESSC2027"
    assert b[kinds["link"]["byteStart"]:kinds["link"]["byteEnd"]] == b"https://example.org/a"


def test_item_image_inside_src_only(monkeypatch, tmp_path):
    src = tmp_path / "src"
    (src / "assets").mkdir(parents=True)
    (src / "assets" / "pic.png").write_bytes(b"\x89PNG\r\n\x1a\n" + b"0" * 32)
    monkeypatch.setattr(sp, "SRC", src)
    path, alt = sp._image({"title": "T", "image": "/assets/pic.png"})
    assert path == (src / "assets" / "pic.png").resolve() and alt == "T"
    path, alt = sp._image({"title": "T", "image": "/assets/pic.png", "imageAlt": "Four people at a table."})
    assert path == (src / "assets" / "pic.png").resolve() and alt == "Four people at a table."
    path, alt = sp._image({"title": "T", "image": "/../../etc/passwd"})
    assert alt == sp.SITE_OG_ALT
    path, alt = sp._image({"title": "T", "image": "https://example.org/x.png"})
    assert alt == sp.SITE_OG_ALT


def test_pending_respects_ledger(monkeypatch, tmp_path):
    _news(monkeypatch, tmp_path, [{"date": "2026-11-10", "title": "A"}, {"date": "2026-11-11", "title": "B"}])
    left = sp.pending({"posted": ["news::2026-11-10::a"]})
    assert [p.title for p in left] == ["B"]


def test_committed_ledger_is_seeded():
    # Seeded with the seven items in news.json on 8 November 2026, so a first
    # live run cannot re-post the back catalogue.
    posted = sp.load_ledger()["posted"]
    assert len(posted) >= 7 and all(k.startswith("news::") for k in posted)


def test_find_links_byte_offsets():
    text = "Über https://eiss-europa.com/a."
    [(url, bs, be)] = sp.find_links(text)
    assert url == "https://eiss-europa.com/a"
    assert text.encode("utf-8")[bs:be].decode("utf-8") == url


def test_image_size_reads_png():
    import struct
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        f = Path(tmp) / "x.png"
        f.write_bytes(b"\x89PNG\r\n\x1a\n" + b"\x00\x00\x00\rIHDR" + struct.pack(">II", 1200, 630) + b"0" * 8)
        assert sp.image_size(f) == (1200, 630)


def test_site_card_exists():
    assert sp.SITE_OG.exists() and sp.image_size(sp.SITE_OG)


def test_pinned_api_version_reads_the_data_file():
    assert sp._pinned_api_version() == json.loads(sp.LINKEDIN_VERSION_FILE.read_text())["version"]


def test_pinned_api_version_falls_back_on_malformed_pin(monkeypatch, tmp_path):
    f = tmp_path / "pin.json"
    f.write_text('{"version": "June"}')
    monkeypatch.setattr(sp, "LINKEDIN_VERSION_FILE", f)
    assert sp._pinned_api_version() == sp._LINKEDIN_VERSION_FALLBACK


# -- LinkedIn adapter (mocked HTTP) -----------------------------------------
def _li_recorder(responses):
    calls = []

    def fake(url, method="GET", headers=None, json_body=None, data=None, content_type=None):
        calls.append({"url": url, "method": method, "headers": headers or {},
                      "json": json_body, "data": data})
        r = responses.pop(0)
        if isinstance(r, Exception):
            raise r
        return r

    return fake, calls


def test_linkedin_configured_requires_org_and_token(monkeypatch):
    monkeypatch.delenv("LINKEDIN_ORG_ID", raising=False)
    monkeypatch.delenv("LINKEDIN_ACCESS_TOKEN", raising=False)
    assert sp.LinkedInChannel("linkedin").configured() is False
    monkeypatch.setenv("LINKEDIN_ORG_ID", "12345")
    monkeypatch.setenv("LINKEDIN_ACCESS_TOKEN", "tok-abc")
    assert sp.LinkedInChannel("linkedin").configured() is True


def test_linkedin_text_post_shape_and_escaping(monkeypatch):
    monkeypatch.setenv("LINKEDIN_ORG_ID", "12345")
    monkeypatch.setenv("LINKEDIN_ACCESS_TOKEN", "tok-abc")
    fake, calls = _li_recorder([(201, {"x-restli-id": "urn:li:share:99"}, {})])
    monkeypatch.setattr(sp, "_li_request", fake)
    post = sp.Post(key="k", title="T", summary="A (B) C", link="https://x/")
    assert sp.LinkedInChannel("linkedin").publish(post) == "https://www.linkedin.com/feed/update/urn:li:share:99/"
    c = calls[0]
    assert c["url"].endswith("/rest/posts") and len(calls) == 1
    assert c["json"]["author"] == "urn:li:organization:12345"
    assert "A \\(B\\) C" in c["json"]["commentary"]
    assert c["headers"]["LinkedIn-Version"]


def test_linkedin_refreshes_token_on_401_and_retries(monkeypatch):
    monkeypatch.setenv("LINKEDIN_ORG_ID", "12345")
    monkeypatch.setenv("LINKEDIN_ACCESS_TOKEN", "stale")
    monkeypatch.setenv("LINKEDIN_REFRESH_TOKEN", "refresh-xyz")
    monkeypatch.setenv("LINKEDIN_CLIENT_ID", "cid")
    monkeypatch.setenv("LINKEDIN_CLIENT_SECRET", "csecret")
    fake, calls = _li_recorder([
        sp._Unauthorized("expired"),
        (200, {}, {"access_token": "fresh"}),
        (201, {"x-restli-id": "urn:li:share:8"}, {}),
    ])
    monkeypatch.setattr(sp, "_li_request", fake)
    post = sp.Post(key="k", title="T", summary="S", link="https://x/")
    assert sp.LinkedInChannel("linkedin").publish(post).endswith("urn:li:share:8/")
    assert "oauth/v2/accessToken" in calls[1]["url"]
    assert os.environ["LINKEDIN_ACCESS_TOKEN"] == "fresh"


# -- main() ------------------------------------------------------------------
def _stub(monkeypatch, tmp_path, *, configured=True, fail=None):
    class _Fake(sp.Channel):
        def configured(self):
            return configured

        def publish(self, post):
            if self.name == fail:
                raise SystemExit("boom")
            return f"https://{self.name}.example/1"

    post = sp.Post(key="news::2026-11-10::a", title="A", summary="S", link="https://x/",
                   collaborator="netsec")
    monkeypatch.setattr(sp, "CHANNELS", {"bluesky": _Fake, "linkedin": _Fake})
    monkeypatch.setattr(sp, "pending", lambda ledger: [post])
    monkeypatch.setattr(sp, "LEDGER", tmp_path / "ledger.json")
    monkeypatch.setattr(sys, "argv", ["social-post.py", "--live", "--channel", "all"])
    monkeypatch.setenv("GITHUB_STEP_SUMMARY", str(tmp_path / "summary.md"))


def test_main_skips_cleanly_without_secrets(monkeypatch, tmp_path):
    _stub(monkeypatch, tmp_path, configured=False)
    assert sp.main() == 0
    assert not (tmp_path / "ledger.json").exists()


def test_main_records_key_and_collaborator_note(monkeypatch, tmp_path):
    _stub(monkeypatch, tmp_path)
    assert sp.main() == 0
    assert json.loads((tmp_path / "ledger.json").read_text())["posted"] == ["news::2026-11-10::a"]
    summary = (tmp_path / "summary.md").read_text()
    assert "https://linkedin.example/1" in summary and "netsec LinkedIn page as collaborator" in summary


def test_one_network_failing_does_not_block_the_other(monkeypatch, tmp_path):
    out = tmp_path / "out"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    # Bluesky, tried first, fails: LinkedIn still posts.
    _stub(monkeypatch, tmp_path, fail="bluesky")
    assert sp.main() == 0
    assert json.loads((tmp_path / "ledger.json").read_text())["posted"] == ["news::2026-11-10::a#linkedin"]
    assert out.read_text() == "failed=true\n"
    summary = (tmp_path / "summary.md").read_text()
    assert "https://linkedin.example/1" in summary
    assert "bluesky failed (boom). The next run tries bluesky again." in summary


def test_next_run_retries_only_the_failed_network(monkeypatch, tmp_path):
    (tmp_path / "ledger.json").write_text(json.dumps({"posted": ["news::2026-11-10::a#linkedin"]}))
    tried = []

    class _Fake(sp.Channel):
        def configured(self):
            return True

        def publish(self, post):
            tried.append(self.name)
            return f"https://{self.name}.example/1"

    _stub(monkeypatch, tmp_path)
    monkeypatch.setattr(sp, "CHANNELS", {"bluesky": _Fake, "linkedin": _Fake})
    assert sp.main() == 0
    assert tried == ["bluesky"]
    assert json.loads((tmp_path / "ledger.json").read_text())["posted"] == [
        "news::2026-11-10::a#linkedin", "news::2026-11-10::a"]


def test_any_error_stays_on_its_network(monkeypatch, tmp_path):
    # Not only SystemExit: a network error from urllib is an OSError.
    class _Fake(sp.Channel):
        def configured(self):
            return True

        def publish(self, post):
            if self.name == "linkedin":
                raise OSError("connection reset")
            return "https://bluesky.example/1"

    _stub(monkeypatch, tmp_path)
    monkeypatch.setattr(sp, "CHANNELS", {"bluesky": _Fake, "linkedin": _Fake})
    monkeypatch.delenv("GITHUB_OUTPUT", raising=False)
    assert sp.main() == 0
    assert json.loads((tmp_path / "ledger.json").read_text())["posted"] == ["news::2026-11-10::a#bluesky"]


def test_both_networks_failing_records_nothing(monkeypatch, tmp_path):
    class _Fake(sp.Channel):
        def configured(self):
            return True

        def publish(self, post):
            raise SystemExit("down")

    _stub(monkeypatch, tmp_path)
    monkeypatch.setattr(sp, "CHANNELS", {"bluesky": _Fake, "linkedin": _Fake})
    monkeypatch.delenv("GITHUB_OUTPUT", raising=False)
    assert sp.main() == 0
    assert json.loads((tmp_path / "ledger.json").read_text())["posted"] == []


def test_dry_run_marks_a_network_already_posted(monkeypatch, tmp_path, capsys=None):
    import io, contextlib
    (tmp_path / "ledger.json").write_text(json.dumps({"posted": ["news::2026-11-10::a#linkedin"]}))
    _stub(monkeypatch, tmp_path)
    monkeypatch.setattr(sys, "argv", ["social-post.py", "--dry-run"])
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        sp.main()
    text = buf.getvalue()
    assert "-- already posted to linkedin --" in text and "-- would post to bluesky --" in text
    assert "-- would post to linkedin --" not in text


def test_networks_limit_the_post(monkeypatch, tmp_path):
    # The form's Post on boxes: an item for LinkedIn only never reaches
    # Bluesky, and is recorded by its key once LinkedIn has posted.
    tried = []

    class _Fake(sp.Channel):
        def configured(self):
            return True

        def publish(self, post):
            tried.append(self.name)
            return f"https://{self.name}.example/1"

    _stub(monkeypatch, tmp_path)
    post = sp.Post(key="news::2026-11-10::a", title="A", summary="S", link="https://x/",
                   collaborator="netsec", networks=("linkedin",))
    monkeypatch.setattr(sp, "CHANNELS", {"bluesky": _Fake, "linkedin": _Fake})
    monkeypatch.setattr(sp, "pending", lambda ledger: [post])
    assert sp.main() == 0
    assert tried == ["linkedin"]
    assert json.loads((tmp_path / "ledger.json").read_text())["posted"] == ["news::2026-11-10::a"]
    assert "netsec LinkedIn page as collaborator" in (tmp_path / "summary.md").read_text()


def test_read_news_networks_and_own_photo(monkeypatch, tmp_path):
    _news(monkeypatch, tmp_path, [
        {"date": "2026-11-18", "title": "One", "social": {"networks": ["linkedin", "x"]}},
        {"date": "2026-11-18", "title": "Two"},
    ])
    one, two = sp.read_news()
    assert one.networks == ("linkedin",) and one.wants("linkedin") and not one.wants("bluesky")
    assert two.networks == () and two.wants("bluesky") and two.wants("linkedin")
    assert not one.own_image and not two.own_image


def test_dry_run_names_the_skipped_network_and_a_missing_photo(monkeypatch, tmp_path):
    import io, contextlib
    _stub(monkeypatch, tmp_path)
    post = sp.Post(key="news::2026-11-10::a", title="A", summary="S", link="https://x/",
                   collaborator="netsec", networks=("bluesky",))
    monkeypatch.setattr(sp, "pending", lambda ledger: [post])
    monkeypatch.setattr(sys, "argv", ["social-post.py", "--dry-run"])
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        sp.main()
    text = buf.getvalue()
    assert "NO PHOTO: the posts use the standard EISS picture." in text
    assert "-- not posted to linkedin: the item is for bluesky only --" in text
    assert "-- would post to bluesky --" in text
    # No LinkedIn post, so no collaborator to add.
    assert "as collaborator" not in text


def _standalone() -> int:
    """Run without pytest (this repository has none): each test_ function
    gets a fresh tmp_path and a minimal monkeypatch when it asks for them."""
    import inspect
    import tempfile
    import types

    class _MonkeyPatch:
        def __init__(self):
            self._undo = []

        def setattr(self, obj, name, value):
            self._undo.append((setattr, obj, name, getattr(obj, name)))
            setattr(obj, name, value)

        def setenv(self, key, value):
            import os
            self._undo.append(("env", key, os.environ.get(key)))
            os.environ[key] = value

        def delenv(self, key, raising=True):
            import os
            self._undo.append(("env", key, os.environ.get(key)))
            os.environ.pop(key, None)

        def undo(self):
            import os
            for entry in reversed(self._undo):
                if entry[0] == "env":
                    _, key, old = entry
                    if old is None:
                        os.environ.pop(key, None)
                    else:
                        os.environ[key] = old
                else:
                    fn, obj, name, old = entry
                    fn(obj, name, old)

    failures = 0
    tests = [(n, f) for n, f in sorted(globals().items())
             if n.startswith("test_") and isinstance(f, types.FunctionType)]
    for name, fn in tests:
        mp = _MonkeyPatch()
        with tempfile.TemporaryDirectory() as tmp:
            kwargs = {}
            params = inspect.signature(fn).parameters
            if "tmp_path" in params:
                kwargs["tmp_path"] = Path(tmp)
            if "monkeypatch" in params:
                kwargs["monkeypatch"] = mp
            try:
                fn(**kwargs)
                print(f"  ok  {name}")
            except Exception as exc:  # noqa: BLE001
                failures += 1
                print(f"FAIL  {name}: {exc!r}")
            finally:
                mp.undo()
    print(f"\n{len(tests) - failures}/{len(tests)} passed.")
    return 1 if failures else 0


if __name__ == "__main__":
    import sys
    sys.exit(_standalone())
