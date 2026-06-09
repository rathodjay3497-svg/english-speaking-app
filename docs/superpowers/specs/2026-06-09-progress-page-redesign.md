# Progress Page Redesign

**Date:** 2026-06-09
**Reference design:** `frontend/design/stitch_interactive_conversation_and_idioms/code.html`
**Scope:** Mobile `Progress.tsx` + `ProgressDesktop.tsx` both updated.

---

## Goal

Rewrite both the mobile (`Progress.tsx`) and desktop (`ProgressDesktop.tsx`) Progress pages to match the visual language and layout of the reference design (`code.html`), while keeping all existing data sources (API + localStorage) wired up correctly.

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

**Pie chart cards** — two additional cards in the Learning section (below the Quick Stats bento):
- **Vocabulary distribution:** `wordsLearned` (read) vs `VocabIndex.total_words - wordsLearned` (remaining), rendered as an SVG donut chart
- **Idioms distribution:** `learnedIdioms.length` (read) vs `IdiomsLibrary.total_idioms - learnedIdioms.length` (remaining), rendered as an SVG donut chart
- Both animate their fill arc from 0 → final value on first mount (CSS `stroke-dashoffset` transition)
- Labels inside the donut: percentage read (e.g. "32%"), label below: "X / Y"

The existing `var(--paper)`, `var(--ink)` CSS variables are **not used** in this page — replaced entirely with the new Tailwind tokens.

The `if (isDesktop) return <ProgressDesktop ... />` branch at the top of `Progress.tsx` is kept unchanged — desktop falls through to `ProgressDesktop.tsx` which is also updated to match the same design.

---

## Data Mapping

### Quick Stats (3 bento cards)

| Card | Data source | Display |
|---|---|---|
| Practice Time | `stats.total_minutes / 60` | `"X hrs"` with progress bar |
| 🔥 Streak | `stats.current_streak` from API | `"Xd"` with `trending_up` icon |
| Average Score | `stats.avg_score` from API | `"X/100"` with progress bar at `avg_score%` |

API data from existing `progressApi.get()`. Loading state gates the whole page.

**Streak logic:** Driven by the `/daily-challenge` API (`progressApi.dailyChallenge()`). The streak increments only when the user completes today's daily challenge scenario. If the user completes the challenge one day but not the next, the streak resets to 0. Today's count is 0 until the daily challenge is completed. The daily challenge refreshes automatically at midnight (server-side, via the existing `/daily-challenge` endpoint which returns a date-keyed challenge). The Progress page displays `stats.current_streak` from the API — no client-side streak calculation needed.

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

**File changes:**
- `frontend/src/pages/Progress.tsx` — full rewrite (mobile render)
- `frontend/src/pages/ProgressDesktop.tsx` — updated to match the same design system
- `frontend/index.html` — Google Fonts link added if not already present

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

### `DonutChart`
Inline sub-component for pie chart cards.

Props:
```ts
{ read: number; total: number; color: string; label: string; }
```

Renders an SVG donut (viewBox 112×112, r=48, strokeWidth=9). On mount, animates `stroke-dashoffset` from full circumference → final value via CSS transition (300ms ease-out). Center text shows percentage. Below the donut: `"X / Y read"` label.

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

- Deep-linking to an individual idiom from a bookmark card (Idioms page doesn't support it yet)
- Week vs Month toggle with real data (API doesn't expose it)
- User avatar (placeholder only, no auth yet)
- Backend changes to streak tracking (Progress page reads `current_streak` from API as-is)
