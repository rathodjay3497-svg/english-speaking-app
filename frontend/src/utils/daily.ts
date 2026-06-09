/**
 * Date-seeded daily picks.
 *
 * "Today's" content (idioms, words) should stay stable for the whole calendar
 * day rather than reshuffling on every render. We derive a numeric seed from
 * the local date and use it to deterministically shuffle the un-read pool, so
 * the same day always yields the same order. Items marked read drop out of the
 * pool, so the visible set tops up from the remaining unread items.
 */

/** IST calendar date as `YYYY-MM-DD` (UTC+5:30 so daily reset fires at IST midnight). */
export function todayKey(d: Date = new Date()): string {
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

/** Cheap, stable string → 32-bit int hash (djb2-ish). */
export function hashSeed(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  // force unsigned 32-bit
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic for a given seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher–Yates shuffle. Does not mutate the input. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = items.slice();
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick up to `n` items from `items`, stable for the given seed. */
export function pickDaily<T>(items: T[], n: number, seed: number): T[] {
  return seededShuffle(items, seed).slice(0, n);
}

/**
 * Per-day frozen selection of item ids, persisted to localStorage.
 *
 * The day's target is locked once it's chosen: marking items read must NOT
 * refill the set with new items, and a reload on the same day must show the
 * same items. We store `{ date, ids }` per bucket and only re-pick when the
 * stored date differs from today (a new calendar day).
 */
const DAILY_KEY = 'bolo_daily_v1';

type DailyStore = Record<string, { date: string; ids: (number | string)[] }>;

function readDailyStore(): DailyStore {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? (JSON.parse(raw) as DailyStore) : {};
  } catch {
    return {};
  }
}

function writeDailyStore(store: DailyStore) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/**
 * Return today's locked ids for `bucket` (e.g. "idioms", "words"). If none are
 * stored for today, pick them via `pick()` from the currently-unread pool, then
 * persist and return them. Stays fixed for the rest of the day regardless of
 * later read-state changes.
 */
export function getOrPickDaily<TId extends number | string>(
  bucket: string,
  pick: () => TId[],
): TId[] {
  const store = readDailyStore();
  const today = todayKey();
  const entry = store[bucket];
  if (entry && entry.date === today) {
    return entry.ids as TId[];
  }
  const ids = pick();
  store[bucket] = { date: today, ids };
  writeDailyStore(store);
  return ids;
}
