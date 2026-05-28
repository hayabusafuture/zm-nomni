# Nomni Procure — Copilot Instructions

## Project Context

This repo contains **Nomni Procure** HTML prototypes — a web-based procurement platform for restaurant/hospitality groups. Prototypes cover the full Procure module (login, orders, items, inventory, recipes, HQ management) and stubs for Supply and POS modules. Each file is a static, self-contained interactive prototype used for design review and developer handoff.

The Nomni design system uses a green-on-dark brand identity with Inter as the workhorse typeface and Hanken Grotesk for brand/display moments.

---

## Core Rules

### Prototypes must be self-contained single HTML files

Every prototype you generate must be a **single `.html` file** with all CSS inlined inside `<style>` in `<head>`. Do not create separate `.css` or `.js` files, do not use `@import`, and do not reference any external CSS framework (no Bootstrap, no Tailwind, no CDN libraries).

Permitted external dependencies:
- Google Fonts via `<link>` tags (Inter, Hanken Grotesk, Material Symbols Outlined)
- Local asset files already in the repo (e.g. `assets/favicon.svg`, icon PNGs)

All interactivity must be plain JS written in an inline `<script>` at the bottom of `<body>`.

### Always read an existing prototype before writing a new one

Before generating a new prototype or adding a component to an existing one, read at least one relevant existing file from this repo as a pattern source:

| Page type | Read this file first |
|---|---|
| Sidebar + topbar layout | `Procure - Orders.html` or `Procure - Dashboard.html` |
| Order/wizard flow (no sidebar) | `Procure - New Order - Supplier.html` or `Procure - New Order - Item.html` |
| Detail / record view | `Procure - Order Detail.html` |
| Auth / login | `Procure - Login.html` |
| List page with table and modal | `Procure - Items.html` |
| HQ management views | `Procure - HQ - Outlet Groups.html` |

Copy the full `:root` variable block, topbar, and sidebar verbatim from the reference file — do not reconstruct them from scratch. This keeps icon sets, responsive collapse behaviour, the app-switcher panel, and the user menu consistent across all files.

---

## Design Tokens — CSS Variables

Always declare these in `:root` at the top of every `<style>` block. Never hardcode the hex values directly in rules; always reference the variable.

### Brand Colours
| Variable | Hex | Usage |
|---|---|---|
| `--nomni-green` | `#2AC864` | Primary action, active states, badges, brand accent |
| `--seaweed` | `#0E3727` | Dark green — primary button text, active nav text |
| `--spinach` | `#1A8040` | Medium green — active nav icons, links, secondary actions |
| `--mint` | `#E2FFE6` | Secondary button BG, banners, soft green tint |
| `--cream` | `#FAF7E9` | Warm off-white surface (used sparingly) |

### Surface & Sidebar
| Variable | Hex | Usage |
|---|---|---|
| `--sidebar-bg` | `#F5F5F5` | Sidebar background |
| `--sidebar-bg-2` | `#EBEBEB` | Pressed/hover surface in sidebar |
| `--sidebar-item-active` | `rgba(42,200,100,0.14)` | Active nav row background |
| `--sidebar-text` | `#1A1F2B` | Default sidebar text |
| `--sidebar-text-dim` | `#666666` | Dimmed sidebar text |
| `--sidebar-border` | `#E0E0E0` | Sidebar section dividers |
| `--panel` | `#FFFFFF` | Card/panel background |

### Text
| Variable | Hex | Usage |
|---|---|---|
| `--ink` | `#1A1F2B` | Primary text |
| `--ink-2` | `#1A1F2B` | Alias for primary text (same value) |
| `--ink-mute` | `#8A8F98` | Secondary/muted text, placeholders, table headers |
| `--ink-soft` | `#C7C9CF` | Softest text, nav section labels |

### Borders & Semantic
| Variable | Hex | Usage |
|---|---|---|
| `--rule` | `#E7E8EC` | All dividers, table borders, input borders |
| `--primary` | `#2AC864` | Alias for `--nomni-green` |
| `--primary-hover` | `#1FA551` | Primary hover state |
| `--primary-ink` | `#0E3727` | Alias for `--seaweed` |
| `--row-hover` | `#F7F8FA` | Table row hover background |
| `--row-mute` | `#B9BCC3` | Muted row text/value |

### Chip (Status Badge) Variables
| Variable | Hex |
|---|---|
| `--chip-placed-bg` | `#D9F5E4` |
| `--chip-rejected-bg` | `#FDD6DC` |
| `--chip-rejected-ink` | `#D0291E` |
| `--chip-cancel-bg` | `#FDD6DC` |
| `--chip-cancel-ink` | `#D0291E` |

### Fixed Colours (not in `:root` but always use these exact values)
| Value | Usage |
|---|---|
| `#1F2226` | Topbar background |
| `#F9FAFB` | Table header background (alternate style) |
| `#F3F4F6` | Tertiary button BG, hover surface |
| `#E6E8EC` | Tertiary button hover BG |
| `#7F6AD0` | Avatar background (purple) |
| `#6C4DF2` | Help FAB background |
| `#D0291E` / `#E53535` | Error red |
| `#E8B94F` | Chart bar colour (amber/spend) |

---

## Typography

### Font Stacks
```css
/* Body / UI — use for all text by default */
font-family: "Inter", system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif;

/* Brand / Display — use only for brand name, app tiles, avatars */
font-family: "Hanken Grotesk", system-ui, sans-serif;
```

### Standard Google Fonts `<link>` block (paste verbatim into every authenticated page)
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
```

Auth pages additionally load `Fraunces` (marketing/hero copy only).

### Type Scale

| Role | Size | Weight | Font | Notes |
|---|---|---|---|---|
| Page title | 24px | 700 | Inter | `letter-spacing: -0.03em` |
| Section heading | 21px | 600–700 | Inter | `letter-spacing: -0.02em` |
| Brand sub (topbar) | 23px | 400 | Hanken Grotesk | colour: `--nomni-green` |
| Brand sub (auth) | 28px | 400 | Hanken Grotesk | colour: `#2AC864` |
| Auth form heading | 24px | 700 | Inter | |
| Body / nav / buttons | 14px | 400–600 | Inter | `line-height: 1.4` |
| Small (labels, hints) | 12px–13px | 400–600 | Inter | |
| XS (table headers) | 12px | 600 | Inter | colour: `--ink-mute` |
| Micro (badges/labels) | 10px–11px | 700 | Inter | uppercase, `letter-spacing: 0.04–0.08em` |
| App-tile letter | 21px | 700 | Hanken Grotesk | app switcher tiles |
| Material Symbols icons | 18px | — | Material Symbols Outlined | topbar only |

### Global Body Reset (use in every file)
```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body {
  font-family: "Inter", system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

---

## Component Specs

### Buttons

Base `.btn` class — apply to every button along with a variant modifier:
```css
.btn {
  font-family: inherit; font-size: 14px; font-weight: 600;
  border-radius: 6px; padding: 10px 16px; border: 1px solid transparent;
  cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  line-height: 1; white-space: nowrap;
  transition: background-color .18s ease, color .18s ease, border-color .18s ease;
}
```

| Class | BG | Text | Border | Hover |
|---|---|---|---|---|
| `.btn-primary` | `#2AC864` | `#0E3727` | `#2AC864` | BG `#0E3727`, text `#2AC864` |
| `.btn-secondary` | `#E2FFE6` | `#0E3727` | `#E2FFE6` | BG `#C6F2CE` |
| `.btn-tertiary` | `#F3F4F6` | `--ink-2` | transparent | BG `#E6E8EC` |
| `.btn-ghost` | transparent | `--ink-2` | transparent | colour `--ink`; use `padding: 8px 6px` |

Auth login button: same colour logic as primary but `font-size: 16px; border-radius: 10px; padding: 20px`.

Split button: `.split-btn-main` (border-radius `6px 0 0 6px`, no right border) + `.split-btn-caret` (border-radius `0 6px 6px 0`, `border-left: 1px solid rgba(255,255,255,.25)`).

### Status Chips

```css
.chip {
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
  text-transform: uppercase; border-radius: 4px; padding: 3px 10px;
  display: inline-flex; align-items: center;
}
```

| State | BG | Text colour |
|---|---|---|
| Placed / Approved | `#D9F5E4` | `#1A8040` |
| Pending | `#FFF3CD` | `#7A5F00` |
| Draft | `#F0F0F2` | `#555555` |
| Rejected / Cancelled | `#FDD6DC` | `#D0291E` |

### Tabs

```css
.tabs { display: flex; gap: 28px; border-bottom: 1px solid var(--rule); margin: 4px 0 18px; padding: 0 2px; }

.tab {
  position: relative; padding: 10px 2px 14px;
  color: var(--ink-2); font-weight: 600; font-size: 14px;
  cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
}
.tab:hover { color: var(--ink); }
.tab.active { color: var(--ink); }
.tab.active::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px;
  height: 2px; background: var(--primary); border-radius: 2px;
}

/* Count badge inside a tab */
.tab .count {
  background: var(--nomni-green); color: var(--seaweed);
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;
}
```

### Form Inputs

Standard input:
```css
background: #fff; border: 1px solid #DCDEE3; border-radius: 6px;
padding: 9px 12px; font-size: 14px; color: var(--ink); outline: none;
transition: border-color .13s;
/* focus */ border-color: var(--nomni-green);
/* placeholder */ color: var(--ink-mute);
```

Search row wrapper:
```css
.search-wrap {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid #dcdee3; border-radius: 6px;
  padding: 0 12px; height: 36px;
}
```

Auth inputs (login/reset pages):
```css
background: #f4f4f4; border: none; border-radius: 10px;
padding: 20px; font-size: 16px;
/* focus */ background: #ebebeb;
```

Quantity stepper:
```css
.qty-stepper { display: inline-flex; align-items: center; border: 1px solid #d0d2d8; border-radius: 6px; overflow: hidden; }
/* stepper buttons */ width: 32px; height: 32px; background: #f3f4f6;
/* stepper input */ width: 44px; height: 32px; border-left: 1px solid #d0d2d8; border-right: 1px solid #d0d2d8; text-align: center; font-weight: 600;
```

Toggle switch:
```css
.toggle-track { width: 36px; height: 20px; border-radius: 10px; background: var(--nomni-green); position: relative; }
.toggle-track.off { background: #dcdee3; }
/* knob pseudo-element */ width: 16px; height: 16px; border-radius: 50%; top: 2px; left: 2px;
```

### Topbar

Use this structure verbatim on every authenticated page:
```css
.topbar {
  grid-column: 1 / -1; grid-row: 1;
  background: #1F2226; color: #fff;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 22px;
  height: 56px;
  border-bottom: 1px solid #000;
  position: sticky; top: 0; z-index: 5;
}
```

Structure: `.topbar-left` (app-switcher 40×40px border-radius 8px → brand logo height 26px → `.brand-sub` 23px Hanken Grotesk 400 `--nomni-green`) | `.topbar-right` (help button → user avatar).

- Help button: `padding: 5px 10px; border-radius: 6px; font-size: 14px; color: rgba(255,255,255,.7);` hover `rgba(255,255,255,.1)`; icon is `material-symbols-outlined` at 18px
- Avatar: 32px circle, `background: #7F6AD0`, initials in Hanken Grotesk 12px/600
- App switcher panel: `width: 360px; border-radius: 10px; box-shadow: 0 14px 40px rgba(10,20,15,.22), 0 2px 8px rgba(10,20,15,.08); z-index: 40`; app tiles 52×52px border-radius 12px; current item `outline: 2px solid var(--seaweed); outline-offset: 2px`
- User menu: `width: 248px; border-radius: 10px; z-index: 200`; same box-shadow as app switcher panel

### Sidebar

```css
.sidebar {
  grid-column: 1; grid-row: 2;
  background: var(--sidebar-bg);
  width: 232px;
  display: flex; flex-direction: column;
  position: sticky; top: 56px;
  height: calc(100vh - 56px);
}
.nav { margin-top: 12px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px; flex: 1; }
.nav a { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; font-size: 14px; font-weight: 400; }
.nav a:hover { background: rgba(0,0,0,.05); }
.nav a.active { background: var(--sidebar-item-active); color: var(--seaweed); font-weight: 600; }
```

Icons: use custom 18×18px PNG pairs inside `.icon-wrap` (position: relative). `.icon-grey` is shown by default; `.icon-green` is shown on `.active`. Render both as `<img>` tags. Do not use Material Symbols in sidebar nav items.

Nav section labels:
```css
font-size: 10px; font-weight: 700; letter-spacing: .08em;
text-transform: uppercase; color: var(--ink-soft); padding: 14px 12px 4px;
```

Nav count badge:
```css
background: var(--nomni-green); color: var(--seaweed);
font-size: 10px; font-weight: 700;
min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px;
margin-left: auto; display: inline-flex; align-items: center; justify-content: center;
```

Help FAB (sidebar footer): `width: 44px; height: 44px; border-radius: 50%; background: #6c4df2; box-shadow: 0 6px 18px rgba(108,77,242,.4);`

Responsive collapse — include this on every sidebar page:
```css
@media (max-width: 1280px) {
  .app { grid-template-columns: 64px 1fr; }
  .sidebar { position: fixed; width: 64px; overflow: hidden; transition: width 0.2s ease; z-index: 4; }
  .sidebar:hover { width: 232px; box-shadow: 2px 0 12px rgba(0,0,0,.12); }
  .sidebar .nav-label,
  .sidebar .nav .badge,
  .sidebar .nav .warn-icon { display: none; }
  .sidebar:hover .nav-label { display: inline; }
  .sidebar:hover .nav .badge { display: inline-grid; }
  .sidebar:hover .nav .warn-icon { display: inline-flex; }
  .main { min-width: 1140px; }
  .nav a { white-space: nowrap; }
}
```

### Tables

```css
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }

thead th {
  text-align: left; font-weight: 600; font-size: 12px; color: var(--ink-mute);
  padding: 12px 14px;
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  background: #fff;
  white-space: nowrap;
}

tbody td { padding: 14px 14px; border-bottom: 1px solid var(--rule); vertical-align: middle; }
tbody tr:hover td { background: var(--row-hover); }
```

Pagination:
```css
.pager { display: flex; align-items: center; justify-content: space-between; padding: 16px 4px 4px; font-size: 12px; color: var(--ink-2); }
.pager-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--rule); background: #fff; font-size: 13px; font-weight: 600; color: var(--ink-2); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pager-btn:hover { background: #f3f4f6; }
.pager-btn.active { background: var(--seaweed); color: #fff; border-color: var(--seaweed); }
.pager-btn:disabled { opacity: .4; cursor: default; }
```

### Modals

```css
.modal-overlay {
  position: fixed; inset: 0; background: rgba(10,20,15,.46);
  z-index: 900; display: flex; align-items: flex-start; justify-content: center;
  padding-top: 72px;
}
.modal-card {
  background: #fff; border-radius: 12px; width: 580px; max-width: calc(100vw - 32px);
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  max-height: calc(100vh - 100px); display: flex; flex-direction: column; overflow: hidden;
}
.modal-header { padding: 20px 24px 0; }
.modal-title { font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
.modal-body { padding: 20px 24px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
.modal-foot { padding: 14px 24px 18px; border-top: 1px solid var(--rule); flex: 0 0 auto; }
```

### Dropdown Menus

```css
/* panel */ border-radius: 8px; background: #fff; border: 1px solid #e0e2e8; box-shadow: 0 4px 16px rgba(0,0,0,.12); z-index: 400; overflow: hidden;
/* items */ display: block; padding: 11px 18px; font-size: 14px; font-weight: 500; color: #1A8040;
/* item hover */ background: var(--mint);
```

---

## Layout Conventions

### Standard App Shell — sidebar + topbar (all authenticated list/detail pages)

```css
.app {
  display: grid;
  grid-template-columns: 232px 1fr;
  grid-template-rows: 56px 1fr;
  min-height: 100vh;
}
/* Topbar: grid-column: 1 / -1; grid-row: 1 */
/* Sidebar: grid-column: 1; grid-row: 2 */
/* Main: grid-column: 2; grid-row: 2 */

.main { padding: 32px 40px 56px; min-width: 0; background: #fff; }
```

### Wizard / New Order Shell — no sidebar

```css
.app { display: flex; flex-direction: column; min-height: 100vh; }
/* topbar: flex: 0 0 56px */
/* order-header bar: padding 20px 32px, border-bottom, sticky below topbar */
/* order-body: flex: 1 */
```

### Auth Pages — login, forgot password, reset password

```css
.page { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
.main { display: flex; flex: 1; min-height: 0; }
.login-panel { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 50px; background: #fff; }
/* Right hero panel: fixed width ~45%, background image/gradient */
```

### Page Header — list pages

```css
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
.page-title { font-size: 24px; font-weight: 700; letter-spacing: -0.03em; margin: 0; }
/* .page-actions / .page-head-right: display flex; gap: 10px */
```

### Filter Row

```css
.filter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
/* search input, filter dropdowns — right-aligned actions use margin-left: auto */
```

### Dashboard Layout

- Metric cards: `display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--rule); border-radius: 10px; overflow: hidden`
- Charts area: negative-margin bleed — `margin: 0 -40px -56px; padding: 40px 40px 56px; background: #f9f9f9`
- Section cards: `background: #fff; border-radius: 8px; padding: 28px 32px 32px; margin-bottom: 24px`
- Section title: `font-size: 21px; font-weight: 600; letter-spacing: -0.02em`

### Detail / Order Header Bar

```css
.order-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px 18px; border-bottom: 1px solid var(--rule); background: #fff; }
.back-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--rule); background: transparent; }
.order-header-title { font-size: 21px; font-weight: 700; letter-spacing: -.01em; }
```

### Announcement / Info Banner

```css
background: var(--mint); border: 1px solid #B9F0C5; color: var(--seaweed);
/* links */ color: var(--spinach);
```
