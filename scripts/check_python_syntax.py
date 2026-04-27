"""
Quick syntax-only validation for Python files in this repo.

Unlike `compileall`, this does not write `.pyc` files (so it works even when
`__pycache__` is not writable).
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path


EXCLUDED_DIRS = {
    ".git",
    "__pycache__",
    "node_modules",
    "venv",
    "media",
    "static",
    "dist",
    "build",
    "migrations",
}


def is_excluded(path: Path) -> bool:
    parts = {p.lower() for p in path.parts}
    return any(d.lower() in parts for d in EXCLUDED_DIRS)


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    bad: list[tuple[str, str]] = []

    for p in repo_root.rglob("*.py"):
        if is_excluded(p.relative_to(repo_root)):
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = p.read_text()
        try:
            ast.parse(text, filename=str(p))
        except SyntaxError as e:
            bad.append((str(p), f"{e.msg} (line {e.lineno})"))

    if bad:
        print("Syntax errors:")
        for f, msg in bad:
            print(f"- {f}: {msg}")
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

