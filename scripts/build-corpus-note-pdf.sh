#!/usr/bin/env bash
# Render docs/anthology-corpus-note.md to PDF for the HAL deposit (#1222).
#
#   ./scripts/build-corpus-note-pdf.sh [outfile]
#
# Default outfile: data/anthology-corpus-note.pdf (gitignored: it is generated
# from a tracked source, so rebuild it rather than commit it).
#
# ponytail: not in CI and not in the Eleventy build. The PDF is cut by hand
# when a deposit is made, a couple of times a year, so a workflow that renders
# it on every push would burn minutes to produce a file nobody downloads.
# Regenerate it when the corpus figures change, which means after running
# scripts/export-corpus-json.mjs and updating the note.
#
# xelatex rather than pdflatex: the note carries French accented text in the
# Résumé and an en-dash inside two proper nouns (Sciences Po–EISS,
# Civil–military). pdflatex mangles both without extra preamble.
set -euo pipefail

SRC="docs/anthology-corpus-note.md"
OUT="${1:-data/anthology-corpus-note.pdf}"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "error: pandoc is not installed." >&2
  echo "  macOS:  brew install pandoc" >&2
  echo "  Debian: sudo apt install pandoc" >&2
  exit 1
fi

if ! command -v xelatex >/dev/null 2>&1; then
  echo "error: xelatex is not installed (needed for the French text)." >&2
  echo "  macOS:  brew install --cask mactex-no-gui" >&2
  echo "  Debian: sudo apt install texlive-xetex texlive-fonts-recommended" >&2
  exit 1
fi

[ -f "$SRC" ] || { echo "error: $SRC not found (run from the repo root)." >&2; exit 1; }

mkdir -p "$(dirname "$OUT")"

# No --metadata title/author: the note opens with its own H1 and byline, so
# passing them again would print the title twice, once in pandoc's title block
# and once as the first heading. --standalone is implied for PDF output.
pandoc "$SRC" \
  --output="$OUT" \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=2 \
  --variable papersize=a4 \
  --variable geometry:margin=2.5cm \
  --variable fontsize=11pt \
  --variable colorlinks=true \
  --variable linkcolor=black \
  --variable urlcolor=black

echo "wrote $OUT"
