#!/usr/bin/env python3
"""Self-check for .claude/hooks/guard-bulk-read.py.

The guard refuses a whole-file read of anything over its line threshold. What
matters is the pair: it fires on a bulk read, and it stays out of the way of a
targeted one. A guard that blocks normal work would be worse than the reads it
prevents, so the fail-open paths are pinned here too.

No framework and no dependencies. Run it directly:

    python3 scripts/test-guard-bulk-read.py
"""
import importlib.util
import pathlib
import sys
import tempfile

HOOK = pathlib.Path(__file__).resolve().parent.parent / ".claude/hooks/guard-bulk-read.py"
spec = importlib.util.spec_from_file_location("guard_bulk_read", HOOK)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)

fails = []
tmp = pathlib.Path(tempfile.mkdtemp())
(tmp / "big.css").write_text("x\n" * 5000)
(tmp / "small.njk").write_text("x\n" * 800)


def check(tool, **args):
    return guard.check({"tool_name": tool, "cwd": str(tmp), "tool_input": args}, 800)


def expect(label, got, blocked):
    hit = got is not None
    print(f"  {label:<44} -> {'blocked' if hit else 'allowed'}")
    if hit is not blocked:
        fails.append(f"{label} should have been {'blocked' if blocked else 'allowed'}")


big = str(tmp / "big.css")
print("guard-bulk-read, threshold 800:")
expect("Read of a 5000-line file", check("Read", file_path=big), True)
expect("Read with an offset and a limit", check("Read", file_path=big, offset=10, limit=40), False)
expect("Read of a file at the threshold", check("Read", file_path=str(tmp / "small.njk")), False)
expect("bare cat of a 5000-line file", check("Bash", command="cat big.css"), True)
expect("cat piped into head", check("Bash", command="cat big.css | head -50"), False)
expect("sed over a line range", check("Bash", command="sed -n '1,80p' big.css"), False)
expect("grep", check("Bash", command="grep -n hero big.css"), False)
expect("a tool that is neither Read nor Bash", check("Grep", pattern="hero"), False)
expect("cat of a file that does not exist", check("Bash", command="cat nothing-here.txt"), False)
expect("Read of a file that does not exist", check("Read", file_path=str(tmp / "nope.css")), False)

message = check("Read", file_path=big)
if "offset" not in message or "CLAUDE_READ_MAX_LINES" not in message:
    fails.append("the refusal should name the offset alternative and the override")
if "5000 lines" not in message:
    fails.append("the refusal should say how long the file actually is")

print("\nFAIL: " + "; ".join(fails) if fails else "\nall ten behaviours correct")
sys.exit(1 if fails else 0)
