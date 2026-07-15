#!/usr/bin/env python3
"""
Adds the "Download assets" widget to every Freemium page that already has
the Aa/Box handoff inspectors (ie. the real dev-facing app screens — not the
marketing pages, email mockups, or the add-supplier redirect stub, which
don't carry the inspectors either).

Idempotent: re-running skips files that already have the widget. Run
build-asset-downloads.py first/after so the linked zips stay in sync with
what each page actually references.
"""
import re
from pathlib import Path

FREEMIUM_DIR = Path(__file__).resolve().parent

CSS_BLOCK = """  /* Download-assets widget */
  .asset-download-wrap { position: relative; }
  .asset-download-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 168px;
    background: #1a1f2b;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,.35);
    padding: 6px;
    z-index: 1001;
  }
  .asset-download-menu a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    font-family: monospace;
    letter-spacing: .02em;
    color: rgba(255,255,255,.85);
    text-decoration: none;
    white-space: nowrap;
  }
  .asset-download-menu a:hover { background: rgba(255,255,255,.12); color: #fff; }
  .asset-download-menu .count { color: rgba(255,255,255,.45); font-weight: 500; margin-left: 10px; }
"""

HTML_TEMPLATE = """  <div class="asset-download-wrap" data-asset-download>
    <button class="handoff-inspector-btn" type="button" data-asset-download-toggle title="Download page assets">&#8595; Assets</button>
    <div class="asset-download-menu" data-asset-download-menu hidden>
      <a href="assets/downloads/{slug}.zip" download>This page<span class="count">{page_count} files</span></a>
      <a href="assets/downloads/all-pages.zip" download>Whole flow<span class="count">{all_count} files</span></a>
    </div>
  </div>
"""

SCRIPT_BLOCK = """<script>
(function(){
  var wrap = document.querySelector('[data-asset-download]');
  if (!wrap) return;
  var toggle = wrap.querySelector('[data-asset-download-toggle]');
  var menu = wrap.querySelector('[data-asset-download-menu]');
  toggle.addEventListener('click', function(event){
    event.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('click', function(event){
    if (!menu.hidden && !event.target.closest('[data-asset-download]')) menu.hidden = true;
  });
  document.addEventListener('keydown', function(event){
    if (event.key === 'Escape') menu.hidden = true;
  });
})();
</script>
"""

MARKER = "data-asset-download"


def slug_for(html_path: Path) -> str:
    return re.sub(r"[^a-z0-9]+", "-", html_path.stem.lower()).strip("-")


def file_count(zip_dir: Path, slug: str) -> int:
    import zipfile
    zip_path = zip_dir / f"{slug}.zip"
    if not zip_path.exists():
        return 0
    with zipfile.ZipFile(zip_path) as zf:
        return len(zf.namelist())


def main():
    downloads_dir = FREEMIUM_DIR / "assets" / "downloads"
    all_count = file_count(downloads_dir, "all-pages")

    targets = [
        p for p in sorted(FREEMIUM_DIR.glob("*.html"))
        if 'class="handoff-inspector"' in p.read_text(encoding="utf-8", errors="ignore")
    ]

    for page in targets:
        text = page.read_text(encoding="utf-8", errors="ignore")
        if MARKER in text:
            print(f"skip (already has widget): {page.name}")
            continue

        slug = slug_for(page)
        page_count = file_count(downloads_dir, slug)
        if page_count == 0:
            print(f"skip (no local image assets found): {page.name}")
            continue

        text = text.replace(".handoff-inspector {", CSS_BLOCK + "  .handoff-inspector {", 1)

        anchor = '<div class="handoff-inspector" aria-label="Handoff inspectors">'
        widget_html = HTML_TEMPLATE.format(slug=slug, page_count=page_count, all_count=all_count)
        text = text.replace(anchor, anchor + "\n" + widget_html, 1)

        text = text.replace("</body>", SCRIPT_BLOCK + "</body>", 1)

        page.write_text(text, encoding="utf-8")
        print(f"updated: {page.name} ({page_count} page files, {all_count} total)")


if __name__ == "__main__":
    main()
