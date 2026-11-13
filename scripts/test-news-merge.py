#!/usr/bin/env python3
"""Self-check for the `publish` label merge (.github/workflows/news-merge.yml, #2135).

The step that decides whether a label may merge a PR runs before the checkout,
so that it never runs code from the PR. Its shell therefore lives in the
workflow file. This check lifts it out and runs it against sample PRs with a
stand-in `gh`. No framework, no network. Run it directly:

    python3 scripts/test-news-merge.py
"""
import os
import subprocess
import tempfile
import textwrap
from pathlib import Path

WORKFLOW = Path(__file__).resolve().parent.parent / ".github/workflows/news-merge.yml"
text = WORKFLOW.read_text()
start = text.index("        run: |\n", text.index("Check the approver and the changed files")) + len("        run: |\n")
script = textwrap.dedent(text[start:text.index("\n      - name:", start)])

# `gh pr view` prints the changed files. Every other call does nothing.
FAKE_GH = '#!/usr/bin/env bash\nif [ "$1 $2" = "pr view" ]; then printf \'%s\' "$FILES"; fi\n'

NEWS = "src/_data/news.json\n"
BOARD = "src/_data/board.json\n"
PHOTO = "src/assets/images/board/doe.jpg\n"
CASES = [
    # sender, changed files, expected to merge
    ("eugenio", NEWS, True),
    ("Eugenio", NEWS, True),  # logins compare without case
    ("filip", NEWS, False),  # a profile approver cannot merge news
    ("filip", BOARD, True),
    ("filip", BOARD + PHOTO, True),
    ("eugenio", BOARD, False),  # a news approver cannot merge profiles
    ("mallory", NEWS, False),
    ("eugenio", BOARD + NEWS, False),  # the two kinds never mix
    ("filip", "scripts/merge-bot-pr.sh\n" + BOARD, False),
    ("filip", "src/assets/images/board/x/run.js\n", False),
    ("eugenio", "src/_data/news.json.bak\n", False),
    ("eugenio", ".github/workflows/deploy.yml\n", False),
    ("eugenio", "", False),
]

with tempfile.TemporaryDirectory() as tmp:
    gh = Path(tmp, "gh")
    gh.write_text(FAKE_GH)
    gh.chmod(0o755)
    for sender, files, expected in CASES:
        out = Path(tmp, "out")
        out.write_text("")
        env = {
            **os.environ,
            "PATH": f"{tmp}:{os.environ['PATH']}",
            "GITHUB_OUTPUT": str(out),
            "REPO": "o/r",
            "PR": "1",
            "SENDER": sender,
            "FILES": files,
            "NEWS_APPROVERS": "EISSeuropa, eugenio",
            "PROFILE_APPROVERS": "EISSeuropa;filip",
        }
        subprocess.run(["bash", "-c", script], env=env, check=True, capture_output=True)
        want = f"ok={'true' if expected else 'false'}"
        assert out.read_text().strip() == want, (sender, files, out.read_text())

print(f"news-merge: {len(CASES)} cases pass")
