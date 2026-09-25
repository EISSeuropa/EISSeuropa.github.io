#!/usr/bin/env python3
"""Self-check for clean_title() in scripts/sync-orcid.py (#1699).

No framework. Run it directly:

    python3 scripts/test-sync-orcid.py
"""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("sync_orcid", Path(__file__).with_name("sync-orcid.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
clean = mod.clean_title

# The live record: a plain title followed by a marked-up copy of its subtitle.
assert clean(
    "From Pentagon to Classroom: RAND’s Hedgemony as a Pedagogical Tool in Graduate IR and Security Studies"
    "          <i>Hedgemony</i>                    as a Pedagogical Tool in Graduate IR and Security Studies"
) == "From Pentagon to Classroom: RAND’s Hedgemony as a Pedagogical Tool in Graduate IR and Security Studies"
# Markup inside a title that is not a duplicate: tags go, words stay.
assert clean("Reading <i>On War</i> Again") == "Reading On War Again"
# Entities and stray whitespace.
assert clean("  War &amp; Peace\n  Reaffirmed ") == "War & Peace Reaffirmed"
# A French no-break space before a colon survives.
assert clean("arbitrages politiques\u00a0: un examen") == "arbitrages politiques\u00a0: un examen"
# A plain title passes through unchanged.
assert clean("Reconceptualizing War") == "Reconceptualizing War"
print("sync-orcid clean_title: ok")
