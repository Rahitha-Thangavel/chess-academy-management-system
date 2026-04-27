"""
Add lightweight, consistent file header comments/docstrings across the repo.

This script is intentionally conservative:
- It only adds a header when a file doesn't already have one.
- It avoids vendor/generated directories (e.g., node_modules, venv, build).
- It does not attempt to rewrite code, only inserts a short explanation at top-of-file.

Run from the repo root:
  python scripts/add_file_headers.py
"""

from __future__ import annotations

import ast
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


REPO_ROOT = Path(__file__).resolve().parents[1]

EXCLUDED_DIRS = {
    ".git",
    "__pycache__",
    "node_modules",
    "venv",
    "media",
    "static",
    "dist",
    "build",
    "build_verify",
    "migrations",
}

EXCLUDED_DIR_PREFIXES = {
    "build_verify",  # e.g. build_verify_21, build_verify_22, ...
}

CODE_EXTS = {".py", ".js", ".jsx", ".ts", ".tsx"}


@dataclass(frozen=True)
class FileEdit:
    path: Path
    new_text: str


def _is_excluded_path(path: Path) -> bool:
    for part in (p.lower() for p in path.parts):
        if part in (d.lower() for d in EXCLUDED_DIRS):
            return True
        if any(part.startswith(prefix.lower()) for prefix in EXCLUDED_DIR_PREFIXES):
            return True
    return False


def _detect_newline(text: str) -> str:
    # Keep existing newline style when possible.
    return "\r\n" if "\r\n" in text else "\n"


def _read_text(path: Path) -> str | None:
    # Try utf-8 first; fall back to system default if needed.
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return path.read_text()
        except Exception:
            return None


def _write_text(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="")


def _first_code_lines(text: str, max_lines: int = 30) -> list[str]:
    lines = text.splitlines()
    return lines[: min(len(lines), max_lines)]


def _has_top_comment_js(text: str) -> bool:
    # If the first non-empty line starts with a comment, assume the file already
    # has a header (license, description, eslint-disable, etc.).
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        return stripped.startswith("//") or stripped.startswith("/*")
    return False


def _py_has_module_docstring(text: str) -> bool:
    try:
        module = ast.parse(text)
    except SyntaxError:
        # If a file can't be parsed (rare), avoid changing it automatically.
        return True
    return ast.get_docstring(module) is not None


def _py_insert_point(lines: list[str]) -> int:
    """
    Return the line index where a module docstring should be inserted.

    Keeps shebang and encoding cookies intact.
    """
    i = 0
    if lines and lines[0].startswith("#!"):
        i += 1
    # PEP 263 encoding cookie in first or second line (after shebang).
    encoding_re = re.compile(r"^#.*coding[:=]\s*[-\w.]+")
    if i < len(lines) and encoding_re.match(lines[i]):
        i += 1
    if i < len(lines) and encoding_re.match(lines[i]):
        i += 1
    # Preserve leading blank/comment-only lines as well.
    while i < len(lines) and (not lines[i].strip() or lines[i].lstrip().startswith("#")):
        i += 1
    return i


def _humanize_name(stem: str) -> str:
    if not stem:
        return ""
    # Split on underscores/dashes/camel-ish boundaries.
    stem = stem.replace("-", "_")
    parts = []
    for chunk in stem.split("_"):
        if not chunk:
            continue
        parts.append(chunk)
    return " ".join(p.capitalize() for p in parts)


def _describe_python(rel: Path) -> str:
    # Backend app heuristics: backend/apps/<app>/<file>.py
    parts = rel.parts
    app = None
    if len(parts) >= 4 and parts[0] == "backend" and parts[1] == "apps":
        app = parts[2]

    filename = rel.name
    stem = rel.stem
    if app and filename == "models.py":
        return f"{_humanize_name(app)} app models.\n\nDefines Django ORM models used by the {app} app."
    if app and filename == "views.py":
        return f"{_humanize_name(app)} app views.\n\nAPI views/endpoints for the {app} app."
    if app and filename == "serializers.py":
        return f"{_humanize_name(app)} app serializers.\n\nDjango REST Framework serializers for the {app} app."
    if app and filename == "urls.py":
        return f"{_humanize_name(app)} app routes.\n\nURL patterns for the {app} app."
    if app and filename == "admin.py":
        return f"{_humanize_name(app)} app admin.\n\nDjango admin registrations for the {app} app."
    if app and filename in {"tasks.py", "celery.py"}:
        return f"{_humanize_name(app)} app background tasks.\n\nAsync/background jobs for the {app} app."
    if "tests" in parts:
        return f"Tests for {rel.as_posix()}.\n\nTest cases and helpers for this area of the backend."
    if rel.as_posix().startswith("backend/config/") and filename == "settings.py":
        return "Django settings.\n\nProject-wide settings (apps, middleware, database, auth, etc.)."
    if rel.as_posix().startswith("backend/config/") and filename == "urls.py":
        return "Root URL configuration.\n\nRoutes incoming requests to app URLConfs."
    if filename == "manage.py":
        return "Django management entrypoint.\n\nProvides the `manage.py` CLI for local development and admin tasks."
    if stem == "__init__":
        return f"Package marker for {rel.parent.as_posix()}.\n\nKeeps Python package imports explicit and organized."
    return f"Backend module: {rel.as_posix()}.\n\nHelpers, utilities, or logic for the chess academy management system."


def _describe_frontend(rel: Path) -> str:
    parts = rel.parts
    # Expected: frontend/src/<area>/...
    area = None
    if len(parts) >= 3 and parts[0] == "frontend" and parts[1] == "src":
        area = parts[2]

    name = _humanize_name(rel.stem)
    if area in {"pages", "routes"}:
        return f"Page component: {name}.\n\nDefines a route/page-level React component."
    if area in {"components", "component"}:
        return f"UI component: {name}.\n\nReusable React UI component used across the app."
    if area in {"hooks"}:
        return f"React hook: {name}.\n\nCustom hook that encapsulates reusable stateful logic."
    if area in {"api", "services"}:
        return f"API/service module: {name}.\n\nClient-side helpers for communicating with the backend."
    if area in {"utils", "helpers"}:
        return f"Utility module: {name}.\n\nSmall reusable helpers shared by multiple features."
    return f"Frontend module: {rel.as_posix()}.\n\nPart of the chess academy management system UI."


def _describe_js(rel: Path) -> str:
    if rel.as_posix().startswith("frontend/"):
        return _describe_frontend(rel)
    return f"JavaScript/TypeScript module: {rel.as_posix()}."


def _add_python_docstring(path: Path, text: str, rel: Path) -> str | None:
    if _py_has_module_docstring(text):
        return None

    newline = _detect_newline(text)
    lines = text.splitlines()
    insert_at = _py_insert_point(lines)

    doc = _describe_python(rel)
    doc_lines = ['"""' + doc.replace("\r\n", "\n").replace("\r", "\n") + '"""', ""]

    new_lines = lines[:insert_at] + doc_lines + lines[insert_at:]
    return newline.join(new_lines) + (newline if text.endswith(("\n", "\r\n")) else "")


def _add_js_header(path: Path, text: str, rel: Path) -> str | None:
    if _has_top_comment_js(text):
        return None

    newline = _detect_newline(text)
    desc = _describe_js(rel).replace("\r\n", "\n").replace("\r", "\n")
    header = ["/**", *[f" * {line}" for line in desc.splitlines()], " */", ""]

    lines = text.splitlines()
    new_lines = header + lines
    return newline.join(new_lines) + (newline if text.endswith(("\n", "\r\n")) else "")


def iter_code_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune excluded directories early.
        pruned = []
        for d in dirnames:
            dl = d.lower()
            if dl in (x.lower() for x in EXCLUDED_DIRS):
                continue
            if any(dl.startswith(prefix.lower()) for prefix in EXCLUDED_DIR_PREFIXES):
                continue
            pruned.append(d)
        dirnames[:] = pruned
        for filename in filenames:
            path = Path(dirpath) / filename
            if path.suffix.lower() not in CODE_EXTS:
                continue
            if _is_excluded_path(path):
                continue
            yield path


def build_edits() -> list[FileEdit]:
    edits: list[FileEdit] = []
    for path in iter_code_files(REPO_ROOT):
        rel = path.relative_to(REPO_ROOT)
        text = _read_text(path)
        if text is None:
            continue

        new_text: str | None = None
        if path.suffix.lower() == ".py":
            new_text = _add_python_docstring(path, text, rel)
        else:
            new_text = _add_js_header(path, text, rel)

        if new_text is not None and new_text != text:
            edits.append(FileEdit(path=path, new_text=new_text))
    return edits


def main() -> int:
    edits = build_edits()
    if not edits:
        print("No changes needed.")
        return 0

    for edit in edits:
        _write_text(edit.path, edit.new_text)

    print(f"Updated {len(edits)} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
