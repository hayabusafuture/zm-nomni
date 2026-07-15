#!/usr/bin/env python3
"""
Regenerates the per-page and whole-flow asset zips devs can download from
each Freemium prototype page.

Scans every top-level Freemium/*.html file (the real prototype pages — not
the _refs/ reference captures) for local image references (src=/href=/url()
pointing at .svg/.png/.jpg/.jpeg/.gif/.webp paths, excluding http(s):// and
_refs/), resolves them relative to Freemium/, and zips:

  - Freemium/assets/downloads/<page-slug>.zip   (only images that page uses)
  - Freemium/assets/downloads/all-pages.zip     (union of every image used
                                                  anywhere in the flow)

Run this after adding/removing an image reference on any page, then re-run
inject_asset_widget.py if new pages were added (see that script's docstring).
"""
import re
import zipfile
from pathlib import Path

FREEMIUM_DIR = Path(__file__).resolve().parent
REPO_ROOT = FREEMIUM_DIR.parent
DOWNLOADS_DIR = FREEMIUM_DIR / "assets" / "downloads"

IMG_EXT = r"(?:svg|png|jpe?g|gif|webp)"
REF_PATTERNS = [
    re.compile(r'(?:src|href)="([^"]+\.' + IMG_EXT + r')"', re.IGNORECASE),
    re.compile(r'url\((["\']?)([^"\')]+\.' + IMG_EXT + r')\1\)', re.IGNORECASE),
]


def slug_for(html_path: Path) -> str:
    return re.sub(r"[^a-z0-9]+", "-", html_path.stem.lower()).strip("-")


def extract_refs(html_path: Path):
    text = html_path.read_text(encoding="utf-8", errors="ignore")
    refs = set()
    for pattern in REF_PATTERNS:
        for match in pattern.finditer(text):
            ref = match.group(match.lastindex)
            if ref.startswith(("http://", "https://", "data:", "_refs/")):
                continue
            refs.add(ref)
    return refs


def resolve(html_path: Path, ref: str):
    resolved = (html_path.parent / ref).resolve()
    try:
        resolved.relative_to(REPO_ROOT)
    except ValueError:
        return None
    if not resolved.is_file():
        return None
    return resolved


def zip_files(zip_path: Path, files_with_arcnames):
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for abs_path, arcname in sorted(files_with_arcnames):
            zf.write(abs_path, arcname)


def main():
    pages = sorted(p for p in FREEMIUM_DIR.glob("*.html"))
    all_files = {}  # abs_path -> arcname, deduped across the whole flow
    manifest_lines = []

    for page in pages:
        refs = extract_refs(page)
        page_files = []
        missing = []
        for ref in sorted(refs):
            abs_path = resolve(page, ref)
            if abs_path is None:
                missing.append(ref)
                continue
            arcname = str(abs_path.relative_to(REPO_ROOT))
            page_files.append((abs_path, arcname))
            all_files[abs_path] = arcname

        slug = slug_for(page)
        zip_path = DOWNLOADS_DIR / f"{slug}.zip"
        if page_files:
            zip_files(zip_path, page_files)
        elif zip_path.exists():
            zip_path.unlink()

        manifest_lines.append(
            f"{page.name}: {len(page_files)} file(s) -> {zip_path.name}"
            + (f"  [missing: {', '.join(missing)}]" if missing else "")
        )

    zip_files(DOWNLOADS_DIR / "all-pages.zip", all_files.items())
    manifest_lines.append(f"\nall-pages.zip: {len(all_files)} unique file(s)")

    (DOWNLOADS_DIR / "MANIFEST.txt").write_text("\n".join(manifest_lines) + "\n", encoding="utf-8")
    print("\n".join(manifest_lines))


if __name__ == "__main__":
    main()
