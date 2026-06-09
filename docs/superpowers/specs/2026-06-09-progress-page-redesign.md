# Progress Page Redesign

**Date:** 2026-06-09
**Reference design:** `frontend/design/stitch_interactive_conversation_and_idioms/code.html`
**Scope:** Mobile `Progress.tsx` only — `ProgressDesktop.tsx` is unchanged.

---

## Goal

Rewrite the mobile Progress page to match the visual language and layout of the reference design (`code.html`), while keeping all existing data sources (API + localStorage) wired up correctly.

---

## Layout & Visual System

Structure (top to bottom):

1. **Fixed top AppBar** — "Bolo English" title, back arrow (`arrow_back`), profile avatar placeholder
2. **Hero heading** — "Your Learning Journey" + "Track your growth and review your saved lessons."
3. **Quick Stats bento grid** — 3 cards, `grid-cols-1 md:grid-cols-3`
4. **"Saved for Review" section** — bookmark cards grid
5. **Recent Activity bar chart** — weekly session bars

**Visual tokens** (Tailwind inline classes, matching `code.html` config):

| Token | Value | Usage |
|---|---|---|
| `bg-background` | `#fff8f3` | Page background |
| `bg-surface-container-low` | warm off-white | Stat cards |
| `text-primary` | `#004f46` | Teal accent |
| `text-secondary` | `#924b1c` | Orange accent |
| `border-outline-variant/10` | subtle border | All cards |
| `bg-surface-dim` | muted fill | Progress bar track |

**Fonts:** `Source Serif 4` (headings, `font-headline-*`) + `Plus Jakarta Sans` (body, `font-body-*`, `font-label-*`) — added via Google Fonts link in `index.html` if not already present.

**Icons:** Material Symbols Outlined (existing icon system in the app).

The existing `var(--paper)`, `var(--ink)` CSS variables are **not used** in this page — replaced entirely with the new Tailwind tokens.

The `if (isDesktop) return <ProgressDesktop ... />` branch at the top of `Progress.tsx` is kept unchanged.

---

## Data Mapping

### Quick Stats (3 bento cards)

| Card | Data source | Display |
|---|---|---|
| Practice Time | `stats.total_minutes / 60` | `"X hrs"` with progress bar |
| 🔥 Streak | `stats.current_streak` from API | `"Xd"` with `trending_up` icon |
| Average Score | `stats.avg_score` from API | `"X/100"` with progress bar at `avg_score%` |

API data from existing `progressApi.get()`. Loading state gates the whole page.

### "Saved for Review" bookmarks

**Idiom bookmarks:**
- Source: `local.idiomBookmarks` (array of `number` IDs from localStorage)
- Resolved against: `idiomsApi.list()` (already memoized)
- Card shows: `auto_stories` icon, "Idiom" type label, difficulty badge, idiom name, category
- Tap → `navigate('/idioms')`
- Remove icon → `toggleIdiomBookmark(id)`

**Conversation bookmarks:**
- Source: `local.convoBookmarks` (array of string keys like `"dialogue-3"`, `"scenario-1"`)
- Key format: `"dialogue-{id}"` keys resolve against `conversationsApi.list()`; `"scenario-{id}"` keys resolve against `scenariosApi.list()` (both memoized)
- Card shows: `chat_bubble` icon, "Conversation" type label, difficulty badge, title, category
- Tap → `navigate('/conversations')`
- Remove icon → `toggleConvoBookmark(key)`

**"Clear all" button:** Removes all entries from both `idiomBookmarks` and `convoBookmarks` in localStorage.

**Empty state:** If zero bookmarks total, show a simple "No saved items yet." message in place of the grid.

**Bookmark resolution:** Fetched in parallel via `Promise.all([idiomsApi.list(), scenariosApi.list(), conversationsApi.list()])` only when at least one bookmark exists. If a key doesn't match any fetched item, that card is silently skipped.

### Recent Activity bar chart

- Source: `stats.recent_sessions` from API
- Bars sized proportionally to `overall_score` (0–100)
- Day labels derived from `started_at` timestamps (e.g. "Mon", "Tue")
- Up to 7 bars shown (most recent first)
- Week/Month toggle is **visual only** — no second data set (API only returns `recent_sessions`)
- Implemented with `div`-based bars matching the reference design (no charting library)

---

## Component Structure

**File changes:** Only `frontend/src/pages/Progress.tsx` is rewritten. One additional change to `frontend/index.html` for fonts if needed.

**Inline sub-components inside `Progress.tsx`:**

### `StatCard`
Replaces old `MetricCard`.

Props:
```ts
{ label: string; value: string | number; unit?: string; icon: string; bar?: number; barColor?: string }
```

Renders the bento card shape: label + icon row, large value, optional unit, optional progress bar.

### `BookmarkCard`
Props:
```ts
{ type: 'idiom' | 'conversation'; title: string; category: string; difficulty: string; onRemove: () => void; onTap: () => void; }
```

Renders the white card with icon, type label, difficulty badge, title, category, and a filled bookmark icon button that calls `onRemove`.

### Bar chart
Rendered inline — no sub-component. A `div.flex` row of proportionally-sized bars with day labels below.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `progressApi.get()` fails | Falls back to zero-state object (existing behaviour) |
| Bookmark resolution (`idiomsApi` / `conversationsApi` / `scenariosApi`) fails | Show bookmark cards with title `"—"` (graceful degradation, no crash) |
| `convoBookmarks` key matches no fetched item | Silently skip that card |
| Zero bookmarks | Show "No saved items yet." empty state |

---

## Out of Scope

- `ProgressDesktop.tsx` — not changed
- Deep-linking to an individual idiom from a bookmark card (Idioms page doesn't support it yet)
- Week vs Month toggle with real data (API doesn't expose it)
- User avatar (placeholder only, no auth yet)
